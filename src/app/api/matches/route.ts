import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { prestador: true }
    })

    if (!dbUser?.prestador) {
      return NextResponse.json({ error: 'Usuário não é prestador' }, { status: 403 })
    }

    const { matchId, acao } = await req.json() // acao: 'ACEITAR' | 'RECUSAR'

    if (!matchId || !['ACEITAR', 'RECUSAR'].includes(acao)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const match = await prisma.match.findFirst({
      where: { id: matchId, prestadorId: dbUser.prestador.id, status: 'PENDENTE' },
      include: { service: true }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match não encontrado' }, { status: 404 })
    }

    if (acao === 'ACEITAR') {
      // Accept this match and cancel others for same service
      await prisma.$transaction([
        prisma.match.update({
          where: { id: matchId },
          data: { status: 'ACEITO' }
        }),
        prisma.match.updateMany({
          where: { serviceId: match.serviceId, id: { not: matchId }, status: 'PENDENTE' },
          data: { status: 'CANCELADO' }
        }),
        prisma.service.update({
          where: { id: match.serviceId },
          data: { status: 'MATCH_ENCONTRADO' }
        })
      ])
    } else {
      await prisma.match.update({
        where: { id: matchId },
        data: { status: 'RECUSADO' }
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao processar match' }, { status: 500 })
  }
}
