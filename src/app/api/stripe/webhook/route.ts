import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const { serviceId } = session.metadata

    // Mark payment as reserved (escrow)
    await prisma.payment.update({
      where: { serviceId },
      data: { status: 'RESERVADO' }
    })

    // Update service status
    await prisma.service.update({
      where: { id: serviceId },
      data: { status: 'EM_ROTA' }
    })
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as any
    const { serviceId } = session.metadata

    await prisma.payment.update({
      where: { serviceId },
      data: { status: 'PENDENTE' }
    }).catch(() => {})
  }

  return NextResponse.json({ received: true })
}
