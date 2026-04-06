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

    const { disponivel } = await req.json()

    const updated = await prisma.prestador.update({
      where: { id: dbUser.prestador.id },
      data: { disponivel }
    })

    return NextResponse.json({ disponivel: updated.disponivel })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar disponibilidade' }, { status: 500 })
  }
}
