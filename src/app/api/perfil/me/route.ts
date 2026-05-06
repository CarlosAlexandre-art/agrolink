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

    const priceIds = {
      prestadorMensal: process.env.STRIPE_PRESTADOR_MENSAL_PRICE_ID ?? null,
      prestadorAnual:  process.env.STRIPE_PRESTADOR_ANUAL_PRICE_ID  ?? null,
      produtorMensal:  process.env.STRIPE_PRODUTOR_MENSAL_PRICE_ID  ?? null,
      produtorAnual:   process.env.STRIPE_PRODUTOR_ANUAL_PRICE_ID   ?? null,
    }

    return NextResponse.json({ ...dbUser, priceIds })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 })
  }
}
