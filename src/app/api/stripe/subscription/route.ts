import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { priceId } = await req.json()
    if (!priceId) return NextResponse.json({ error: 'priceId obrigatório' }, { status: 400 })

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'STRIPE_SECRET_KEY não configurada no servidor' }, { status: 500 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/planos?sucesso=1`,
      cancel_url: `${APP_URL}/planos`,
      metadata: { supabaseId: user.id },
      subscription_data: { metadata: { supabaseId: user.id } },
      customer_email: user.email,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : 'Erro ao criar sessão'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
