import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

function getBaseUrl(req: Request): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || ''
  if (raw.startsWith('https://') || raw.startsWith('http://')) {
    return raw.replace(/\/$/, '') // remove trailing slash
  }
  // fallback: derivar da própria requisição
  const reqUrl = new URL(req.url)
  return `${reqUrl.protocol}//${reqUrl.host}`
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { priceId } = await req.json()
    if (!priceId) return NextResponse.json({ error: 'priceId obrigatório' }, { status: 400 })

    const baseUrl = getBaseUrl(req)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/planos?sucesso=1`,
      cancel_url: `${baseUrl}/planos`,
      metadata: { supabaseId: user.id },
      subscription_data: { metadata: { supabaseId: user.id } },
      customer_email: user.email ?? undefined,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    console.error(error)
    const msg = error instanceof Error ? error.message : 'Erro ao criar sessão'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
