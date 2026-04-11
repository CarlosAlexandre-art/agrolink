import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { notificarPrestador } from '@/lib/push'
import { enviarWhatsApp, wpp } from '@/lib/whatsapp'
import { SERVICOS } from '@/lib/constants'
import { sanitizeString, sanitizePositiveNumber } from '@/lib/sanitize'

// Haversine distance in km
function calcDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true }
    })

    if (!dbUser?.produtor) {
      return NextResponse.json({ error: 'Usuário não é produtor' }, { status: 403 })
    }

    const body = await req.json()
    const { tipo, area, urgencia, descricao, latitude, longitude, endereco } = body

    const TIPOS_VALIDOS = SERVICOS.map(s => s.value)
    const URGENCIAS_VALIDAS = ['BAIXA', 'MEDIA', 'ALTA']

    if (!tipo || !TIPOS_VALIDOS.includes(tipo) || !latitude || !longitude) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando ou inválidos' }, { status: 400 })
    }

    const lat = Number(latitude)
    const lng = Number(longitude)
    if (!isFinite(lat) || !isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: 'Localização inválida' }, { status: 400 })
    }

    const descricaoSanitizada = sanitizeString(descricao, 1000)
    const enderecoSanitizado = sanitizeString(endereco, 200)
    const areaSanitizada = sanitizePositiveNumber(area)
    const urgenciaSanitizada = URGENCIAS_VALIDAS.includes(urgencia) ? urgencia : 'MEDIA'

    // Create service
    const service = await prisma.service.create({
      data: {
        produtorId: dbUser.produtor.id,
        tipo,
        area: areaSanitizada,
        urgencia: urgenciaSanitizada,
        descricao: descricaoSanitizada || null,
        latitude: lat,
        longitude: lng,
        endereco: enderecoSanitizado || null,
        status: 'PROCURANDO',
      }
    })

    // Find matching prestadores
    const prestadores = await prisma.prestador.findMany({
      where: {
        disponivel: true,
        servicosOferecidos: { has: tipo },
      },
      include: { user: true }
    })

    // Filter by distance and create matches
    const matchPromises = []
    for (const prestador of prestadores) {
      let dist: number | null = null
      if (prestador.user.latitude && prestador.user.longitude) {
        dist = calcDistancia(latitude, longitude, prestador.user.latitude, prestador.user.longitude)
        if (dist > prestador.raioAtendamento) continue
      }
      matchPromises.push(
        prisma.match.create({
          data: {
            serviceId: service.id,
            prestadorId: prestador.id,
            distancia: dist,
            status: 'PENDENTE',
          }
        })
      )
    }

    await Promise.all(matchPromises)

    const servicoLabel = SERVICOS.find(s => s.value === tipo)?.label ?? tipo

    // Notificar prestadores (push + WhatsApp)
    for (const prestador of prestadores) {
      notificarPrestador(
        prestador.userId,
        '🔔 Novo chamado disponível!',
        `Serviço de ${servicoLabel} próximo a você`,
        `/dashboard`
      ).catch(() => {})

      if (prestador.user.telefone) {
        enviarWhatsApp(
          prestador.user.telefone,
          wpp.novoChamado(prestador.user.nome, servicoLabel, service.id)
        ).catch(() => {})
      }
    }

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true }
    })

    if (!dbUser?.produtor) {
      return NextResponse.json({ error: 'Usuário não é produtor' }, { status: 403 })
    }

    const services = await prisma.service.findMany({
      where: { produtorId: dbUser.produtor.id },
      orderBy: { createdAt: 'desc' },
      include: {
        matches: {
          include: { prestador: { include: { user: true } } }
        }
      }
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 })
  }
}
