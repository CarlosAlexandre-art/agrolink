import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  let priceId = ''
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const body = await req.json()
    priceId = body.priceId
    if (!priceId) return NextResponse.json({ error: 'priceId obrigatório' }, { status: 400 })

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://agrocore.live/planos?sucesso=1',
      cancel_url: 'https://agrocore.live/planos',
      metadata: { supabaseId: user.id },
      subscription_data: { metadata: { supabaseId: user.id } },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : 'Erro ao criar sessão'
    return NextResponse.json({ error: msg, priceIdRecebido: priceId }, { status: 500 })
  }
}
