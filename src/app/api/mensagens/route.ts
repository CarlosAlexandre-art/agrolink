import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { enviarWhatsApp, wpp } from '@/lib/whatsapp'

// GET /api/mensagens?serviceId=xxx&after=<isoDate>
export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get('serviceId')
    const after = searchParams.get('after')
    if (!serviceId) return NextResponse.json({ error: 'serviceId obrigatório' }, { status: 400 })

    // Verificar se o usuário faz parte deste serviço
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true, prestador: true }
    })
    if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { matches: { where: { status: 'ACEITO' }, include: { prestador: { include: { user: true } } } } }
    })
    if (!service) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })

    const isProd = dbUser.produtor?.id === service.produtorId
    const isPrest = service.matches.some(m => m.prestador.userId === dbUser.id)
    if (!isProd && !isPrest) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const mensagens = await prisma.mensagem.findMany({
      where: {
        serviceId,
        ...(after ? { createdAt: { gt: new Date(after) } } : {}),
      },
      include: { remetente: { select: { id: true, nome: true, tipo: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })

    return NextResponse.json(mensagens)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST /api/mensagens
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { serviceId, texto } = await req.json()
    if (!serviceId || !texto?.trim()) {
      return NextResponse.json({ error: 'serviceId e texto são obrigatórios' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true, prestador: true }
    })
    if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        matches: {
          where: { status: 'ACEITO' },
          include: { prestador: { include: { user: true } } }
        },
        produtor: { include: { user: true } }
      }
    })
    if (!service) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })

    const isProd = dbUser.produtor?.id === service.produtorId
    const isPrest = service.matches.some(m => m.prestadorId === dbUser.prestador?.id)
    if (!isProd && !isPrest) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const mensagem = await prisma.mensagem.create({
      data: { serviceId, remetenteId: dbUser.id, texto: texto.trim() },
      include: { remetente: { select: { id: true, nome: true, tipo: true, avatarUrl: true } } }
    })

    // Notificar o outro participante via WhatsApp (máx 1 por 60s para não spammar)
    if (isProd) {
      // Produtor enviou → notificar prestador
      const prestador = service.matches[0]?.prestador
      if (prestador?.user?.telefone) {
        enviarWhatsApp(
          prestador.user.telefone,
          wpp.novaMensagemChat(prestador.user.nome, dbUser.nome, texto.trim(), serviceId)
        ).catch(() => {})
      }
    } else {
      // Prestador enviou → notificar produtor
      const produtorUser = service.produtor.user
      if (produtorUser.telefone) {
        enviarWhatsApp(
          produtorUser.telefone,
          wpp.novaMensagemChat(produtorUser.nome, dbUser.nome, texto.trim(), serviceId)
        ).catch(() => {})
      }
    }

    return NextResponse.json(mensagem)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
