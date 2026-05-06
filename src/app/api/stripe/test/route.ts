import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET() {
  try {
    // Testa se a chave Stripe está funcionando
    const account = await stripe.accounts.retrieve()
    return NextResponse.json({
      ok: true,
      accountId: account.id,
      keyType: process.env.STRIPE_SECRET_KEY?.slice(0, 10) + '...',
      priceIds: {
        prestadorMensal: process.env.STRIPE_PRESTADOR_MENSAL_PRICE_ID ?? 'NÃO CONFIGURADO',
        prestadorAnual:  process.env.STRIPE_PRESTADOR_ANUAL_PRICE_ID  ?? 'NÃO CONFIGURADO',
        produtorMensal:  process.env.STRIPE_PRODUTOR_MENSAL_PRICE_ID  ?? 'NÃO CONFIGURADO',
        produtorAnual:   process.env.STRIPE_PRODUTOR_ANUAL_PRICE_ID   ?? 'NÃO CONFIGURADO',
      }
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({
      ok: false,
      error: msg,
      keyType: process.env.STRIPE_SECRET_KEY?.slice(0, 10) + '...',
    }, { status: 500 })
  }
}
