import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { optimizeRoute, type Stop } from '@/lib/route-optimizer'
import { SERVICOS } from '@/lib/constants'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: {
        prestador: {
          include: {
            matches: {
              where: {
                status: 'ACEITO',
                service: { status: { in: ['MATCH_ENCONTRADO', 'EM_ROTA'] } },
              },
              include: {
                service: {
                  include: { produtor: { include: { user: { select: { nome: true } } } } },
                },
              },
            },
          },
        },
      },
    })

    if (!dbUser?.prestador) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

    const matches = dbUser.prestador.matches
    if (matches.length < 2) {
      return NextResponse.json({ error: 'Mínimo de 2 serviços ativos para otimizar rota' }, { status: 400 })
    }

    // Filtra apenas serviços com coordenadas
    const stops: Stop[] = matches
      .filter(m => m.service.latitude != null && m.service.longitude != null)
      .map(m => {
        const s = m.service
        const label = SERVICOS.find(sv => sv.value === s.tipo)?.label ?? s.tipo
        return {
          id: s.id,
          label,
          tipo: s.tipo,
          endereco: s.endereco,
          lat: s.latitude!,
          lng: s.longitude!,
        }
      })

    if (stops.length < 2) {
      return NextResponse.json({ error: 'Serviços sem localização suficiente para otimizar' }, { status: 400 })
    }

    const originLat = dbUser.latitude ?? stops[0].lat
    const originLng = dbUser.longitude ?? stops[0].lng

    const result = optimizeRoute(stops, originLat, originLng)

    return NextResponse.json({
      ...result,
      origem: {
        lat: originLat,
        lng: originLng,
        nome: dbUser.nome,
      },
      otimizacao: {
        algoritmo: '2-opt TSP (NVIDIA cuOpt-inspired)',
        iteracoes: result.iteracoes2opt,
        reducaoPercent: result.reducaoPercent,
        paradas: stops.length,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao otimizar rota' }, { status: 500 })
  }
}
