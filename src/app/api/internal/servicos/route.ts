import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

/**
 * Endpoint interno — chamado pelo AgroOS para criar serviços no AgroCore
 * Autenticação via header x-internal-secret
 */
export async function POST(req: Request) {
  const secret = req.headers.get('x-internal-secret')
  if (!secret || secret !== process.env.AGROLINK_INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { userEmail, serviceType, description, location, userName } = await req.json()

    if (!userEmail || !serviceType) {
      return NextResponse.json({ error: 'userEmail e serviceType são obrigatórios' }, { status: 400 })
    }

    // Buscar produtor pelo email
    let user = await prisma.user.findFirst({
      where: { email: userEmail, tipo: 'PRODUTOR' },
      include: { produtor: true }
    })

    // Se não existe, criar automaticamente
    if (!user) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        password: Math.random().toString(36).slice(-10) + 'Aa1!',
        email_confirm: true,
      })

      if (authError || !authData.user) {
        return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
      }

      // Criar no banco
      user = await prisma.user.create({
        data: {
          supabaseId: authData.user.id,
          email: userEmail,
          nome: userName || userEmail.split('@')[0],
          tipo: 'PRODUTOR',
          produtor: { create: {} }
        },
        include: { produtor: true }
      })
    }

    // Criar serviço
    const service = await prisma.service.create({
      data: {
        produtorId: user.produtor!.id,
        tipo: serviceType,
        descricao: description || null,
        endereco: location || null,
        status: 'PROCURANDO',
        urgencia: 'MEDIA',
        latitude: 0,
        longitude: 0,
      }
    })

    return NextResponse.json({
      serviceId: service.id,
      url: '/servico/' + service.id
    }, { status: 201 })

  } catch (error: any) {
    console.error('Internal API error:', error?.message)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
