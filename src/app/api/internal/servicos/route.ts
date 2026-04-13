import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Endpoint interno — chamado pelo AgroOS para criar serviços no AgroCore
 * Autenticação via header x-internal-secret
 */
export async function POST(req: Request) {
  // Verificar secret
  const secret = req.headers.get('x-internal-secret')
  if (!secret || secret !== process.env.AGROLINK_INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { userEmail, serviceType, description, location } = await req.json()

    if (!userEmail || !serviceType) {
      return NextResponse.json({ error: 'userEmail e serviceType são obrigatórios' }, { status: 400 })
    }

    // Buscar produtor pelo email
    const user = await prisma.user.findFirst({
      where: { email: userEmail, tipo: 'PRODUTOR' },
      include: { produtor: true }
    })

    if (!user || !user.produtor) {
      return NextResponse.json({ error: 'Usuário não encontrado no AgroCore' }, { status: 404 })
    }

    // Criar serviço
    const service = await prisma.service.create({
      data: {
        produtorId: user.produtor.id,
        tipo: serviceType,
        descricao: description || null,
        endereco: location || null,
        status: 'PROCURANDO',
        urgencia: 'MEDIA',
        // Latitude/longitude opcionais — AgroOS pode não ter
        latitude: null,
        longitude: null,
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
