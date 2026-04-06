import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const body = await req.json()
    const { nome, telefone, estado, cidade, nomeFazenda, avatarUrl } = body

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true }
    })
    if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        nome: nome || dbUser.nome,
        telefone: telefone ?? dbUser.telefone,
        estado: estado ?? dbUser.estado,
        cidade: cidade ?? dbUser.cidade,
        avatarUrl: avatarUrl ?? dbUser.avatarUrl,
      }
    })

    if (dbUser.produtor && nomeFazenda !== undefined) {
      await prisma.produtor.update({
        where: { id: dbUser.produtor.id },
        data: { nomeFazenda }
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 })
  }
}
