import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { tipo, telefone } = await req.json()
    if (!tipo || !['PRODUTOR', 'PRESTADOR'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true, prestador: true }
    })
    if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    // Atualizar tipo e telefone
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        tipo,
        telefone: telefone || null,
      }
    })

    // Criar perfil correto se não existir
    if (tipo === 'PRODUTOR' && !dbUser.produtor) {
      // Remover prestador se existia
      if (dbUser.prestador) {
        await prisma.prestador.delete({ where: { id: dbUser.prestador.id } })
      }
      await prisma.produtor.create({ data: { userId: dbUser.id } })
    }

    if (tipo === 'PRESTADOR' && !dbUser.prestador) {
      // Remover produtor se existia
      if (dbUser.produtor) {
        await prisma.produtor.delete({ where: { id: dbUser.produtor.id } })
      }
      await prisma.prestador.create({ data: { userId: dbUser.id } })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao completar perfil' }, { status: 500 })
  }
}
