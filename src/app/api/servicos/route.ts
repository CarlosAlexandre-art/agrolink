import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { notificarPrestador } from '@/lib/push'

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

    if (!tipo || !latitude || !longitude) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        produtorId: dbUser.produtor.id,
        tipo,
        area: area || null,
        urgencia: urgencia || 'MEDIA',
        descricao: descricao || null,
        latitude,
        longitude,
        endereco: endereco || null,
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

    // Send push notifications to matched prestadores
    for (const prestador of prestadores) {
      notificarPrestador(
        prestador.userId,
        '🔔 Novo chamado disponível!',
        `Serviço de ${tipo.replace(/_/g, ' ')} próximo a você`,
        `/dashboard`
      ).catch(() => {})
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
