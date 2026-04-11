import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

// GET — saldo disponível na conta Stripe do prestador
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { prestador: true }
    })

    if (!dbUser?.prestador) {
      return NextResponse.json({ error: 'Apenas prestadores' }, { status: 403 })
    }

    const stripeAccountId = dbUser.prestador.stripeAccountId

    if (!stripeAccountId) {
      return NextResponse.json({ conectado: false, saldo: 0, saldoPendente: 0 })
    }

    const balance = await stripe.balance.retrieve({ stripeAccount: stripeAccountId })

    const disponivel = balance.available.find(b => b.currency === 'brl')?.amount ?? 0
    const pendente = balance.pending.find(b => b.currency === 'brl')?.amount ?? 0

    return NextResponse.json({
      conectado: true,
      saldo: disponivel / 100,        // centavos → reais
      saldoPendente: pendente / 100,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao buscar saldo' }, { status: 500 })
  }
}

// POST — solicitar saque do saldo disponível
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { prestador: true }
    })

    if (!dbUser?.prestador?.stripeAccountId) {
      return NextResponse.json({ error: 'Conta bancária não conectada' }, { status: 400 })
    }

    const stripeAccountId = dbUser.prestador.stripeAccountId

    // Verificar saldo disponível
    const balance = await stripe.balance.retrieve({ stripeAccount: stripeAccountId })
    const disponivel = balance.available.find(b => b.currency === 'brl')?.amount ?? 0

    if (disponivel <= 0) {
      return NextResponse.json({ error: 'Saldo insuficiente para saque' }, { status: 400 })
    }

    // Criar payout (transferência para conta bancária)
    const payout = await stripe.payouts.create(
      {
        amount: disponivel,
        currency: 'brl',
        metadata: { prestadorId: dbUser.prestador.id },
      },
      { stripeAccount: stripeAccountId }
    )

    return NextResponse.json({
      ok: true,
      valor: disponivel / 100,
      previsao: new Date(payout.arrival_date * 1000).toLocaleDateString('pt-BR'),
      payoutId: payout.id,
    })
  } catch (e: any) {
    console.error(e)
    const msg = e?.raw?.message || 'Erro ao solicitar saque'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
