import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// Retorna todas as propostas recebidas para os serviços do produtor
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true }
    })
    if (!dbUser?.produtor) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

    const matches = await prisma.match.findMany({
      where: {
        status: 'ACEITO',
        service: {
          produtorId: dbUser.produtor.id,
          status: { in: ['PROCURANDO', 'AGUARDANDO_PROPOSTA'] }
        }
      },
      include: {
        service: true,
        prestador: {
          include: {
            user: { select: { nome: true, cidade: true, estado: true, avatarUrl: true, plan: true } },
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(matches)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar propostas' }, { status: 500 })
  }
}
