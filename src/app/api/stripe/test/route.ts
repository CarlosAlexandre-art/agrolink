import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET() {
  const priceId = process.env.STRIPE_PRODUTOR_MENSAL_PRICE_ID

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId!, quantity: 1 }],
      success_url: 'https://agrocore.live/planos?sucesso=1',
      cancel_url: 'https://agrocore.live/planos',
      customer_email: 'teste@agrocore.live',
    })
    return NextResponse.json({ ok: true, url: session.url?.slice(0, 60) + '...' })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ ok: false, erro: msg, priceId }, { status: 200 })
  }
}
