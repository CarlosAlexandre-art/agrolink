import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { prestador: true }
    })

    if (!dbUser?.prestador) {
      return NextResponse.json({ error: 'Apenas prestadores podem conectar conta' }, { status: 403 })
    }

    let stripeAccountId = dbUser.prestador.stripeAccountId

    // Criar conta Stripe Connect se ainda não existe
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'BR',
        email: dbUser.email,
        business_type: 'individual',
        metadata: { prestadorId: dbUser.prestador.id },
      })

      stripeAccountId = account.id

      await prisma.prestador.update({
        where: { id: dbUser.prestador.id },
        data: { stripeAccountId: account.id }
      })
    }

    // Criar link de onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/perfil?connect=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/perfil?connect=success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao conectar conta' }, { status: 500 })
  }
}
