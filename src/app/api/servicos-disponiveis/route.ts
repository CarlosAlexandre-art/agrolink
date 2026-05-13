import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// Retorna serviços disponíveis para o prestador (com match PENDENTE)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { prestador: true }
    })
    if (!dbUser?.prestador) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

    const matches = await prisma.match.findMany({
      where: {
        prestadorId: dbUser.prestador.id,
        status: 'PENDENTE',
        service: { status: 'PROCURANDO' }
      },
      include: {
        service: {
          include: {
            produtor: {
              include: {
                user: { select: { nome: true, cidade: true, estado: true, avatarUrl: true } },
                _count: { select: { services: { where: { status: 'CONCLUIDO' } } } }
              },
              // avaliacao e totalAvaliacoes já são campos do modelo
            },
            _count: { select: { matches: { where: { status: 'ACEITO' } } } }
          }
        }
      },
      orderBy: [
        { smartScore: 'desc' },
        { service: { urgencia: 'desc' } },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(matches)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 })
  }
}
