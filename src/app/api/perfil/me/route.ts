import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true, prestador: true }
    })

    if (!dbUser) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    return NextResponse.json(dbUser)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 })
  }
}
