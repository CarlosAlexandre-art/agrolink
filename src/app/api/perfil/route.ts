import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const atualizarPerfilSchema = z.object({
  nome: z.string().min(1).max(200).optional(),
  telefone: z.string().max(20).nullable().optional(),
  estado: z.string().max(2).nullable().optional(),
  cidade: z.string().max(100).nullable().optional(),
  nomeFazenda: z.string().max(200).nullable().optional(),
  avatarUrl: z.string().url().max(5000).nullable().optional(),
})

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const parsed = atualizarPerfilSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const { nome, telefone, estado, cidade, nomeFazenda, avatarUrl } = parsed.data

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true }
    })
    if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(telefone !== undefined && { telefone }),
        ...(estado !== undefined && { estado }),
        ...(cidade !== undefined && { cidade }),
        ...(avatarUrl !== undefined && { avatarUrl }),
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
