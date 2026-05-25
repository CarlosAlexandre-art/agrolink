import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { notificarUsuario } from '@/lib/push'
import { enviarWhatsApp, wpp } from '@/lib/whatsapp'
import { SERVICOS } from '@/lib/constants'

/**
 * Endpoint interno — chamado pelo AgroOS para criar serviços no AgroCore
 * Autenticação via header x-internal-secret
 */
export async function POST(req: Request) {
  const secret = req.headers.get('x-internal-secret')
  const expectedSecret = process.env.AGROLINK_INTERNAL_SECRET
  // TEMP DEBUG — remover após confirmar funcionamento
  console.log('[internal/servicos] secret recebido:', secret?.slice(0, 4), '| esperado:', expectedSecret?.slice(0, 4))
  if (!secret || !expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Não autorizado', _debug: { received: secret?.slice(0, 4), expected: expectedSecret?.slice(0, 4) } }, { status: 401 })
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

      // Enviar link para o usuário definir sua senha no AgroCore
      await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: userEmail,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://agrocore.live'}/nova-senha`,
        },
      }).catch(() => {}) // não bloquear o fluxo se falhar
    }

    // Resolver coordenadas: 1) endereço fornecido, 2) perfil do usuário, 3) centro do Brasil
    let lat = user.latitude ?? -15.7801
    let lng = user.longitude ?? -47.9292
    if (location) {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location + ', Brasil')}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'AgroCore/1.0' } }
        )
        const geoData = await geoRes.json()
        if (geoData?.[0]) {
          lat = parseFloat(geoData[0].lat)
          lng = parseFloat(geoData[0].lon)
        }
      } catch {}
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
        latitude: lat,
        longitude: lng,
      }
    })

    // Buscar prestadores disponíveis para este tipo de serviço e notificá-los
    const prestadores = await prisma.prestador.findMany({
      where: { disponivel: true, servicosOferecidos: { has: serviceType } },
      include: { user: true }
    })

    const servicoLabel = SERVICOS.find(s => s.value === serviceType)?.label ?? serviceType

    await Promise.all(
      prestadores.map(p =>
        prisma.match.create({
          data: { serviceId: service.id, prestadorId: p.id, status: 'PENDENTE' }
        }).then(() => {
          notificarUsuario(p.userId, '🔔 Novo chamado disponível!', `Serviço de ${servicoLabel} aguarda proposta`, '/dashboard').catch(() => {})
          if (p.user.telefone) {
            enviarWhatsApp(p.user.telefone, wpp.novoChamado(p.user.nome, servicoLabel, service.id)).catch(() => {})
          }
        }).catch(() => {})
      )
    )

    return NextResponse.json({
      serviceId: service.id,
      url: '/rastrear/' + service.id,
      urlPublico: '/rastrear/' + service.id,
    }, { status: 201 })

  } catch (error: any) {
    console.error('Internal API error:', error?.message)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
