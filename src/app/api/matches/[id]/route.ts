import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    const match = await prisma.match.findFirst({
      where: { id, prestadorId: dbUser.prestador.id },
      include: {
        service: {
          include: {
            produtor: { include: { user: true } }
          }
        }
      }
    })

    if (!match) return NextResponse.json({ error: 'Match não encontrado' }, { status: 404 })

    return NextResponse.json(match)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar match' }, { status: 500 })
  }
}
