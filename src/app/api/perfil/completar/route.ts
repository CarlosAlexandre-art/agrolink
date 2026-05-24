import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const completarPerfilSchema = z.object({
  tipo: z.enum(['PRODUTOR', 'PRESTADOR']),
  telefone: z.string().max(20).nullable().optional(),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const parsed = completarPerfilSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const { tipo, telefone } = parsed.data

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true, prestador: true }
    })
    if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { tipo, telefone: telefone ?? null }
    })

    if (tipo === 'PRODUTOR' && !dbUser.produtor) {
      if (dbUser.prestador) await prisma.prestador.delete({ where: { id: dbUser.prestador.id } })
      await prisma.produtor.create({ data: { userId: dbUser.id } })
    }

    if (tipo === 'PRESTADOR' && !dbUser.prestador) {
      if (dbUser.produtor) await prisma.produtor.delete({ where: { id: dbUser.produtor.id } })
      await prisma.prestador.create({ data: { userId: dbUser.id } })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao completar perfil' }, { status: 500 })
  }
}
