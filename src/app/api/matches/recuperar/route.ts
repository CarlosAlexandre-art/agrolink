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
      include: { produtor: true }
    })

    if (!dbUser?.produtor) {
      return NextResponse.json({ error: 'Apenas produtores podem recuperar serviços' }, { status: 403 })
    }

    const { matchId } = await req.json()

    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        status: 'RECUSADO',
        service: { produtorId: dbUser.produtor.id }
      }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match não encontrado' }, { status: 404 })
    }

    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'PENDENTE' }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao recuperar serviço' }, { status: 500 })
  }
}
