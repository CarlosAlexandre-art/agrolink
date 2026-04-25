import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 })
    const customer = customers.data[0]
    if (!customer) return NextResponse.json({ error: 'Nenhuma assinatura encontrada' }, { status: 404 })

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${APP_URL}/planos`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao abrir portal' }, { status: 500 })
  }
}
