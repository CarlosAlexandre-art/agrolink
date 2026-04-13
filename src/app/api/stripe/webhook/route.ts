import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { enviarWhatsApp, wpp } from '@/lib/whatsapp'
import { SERVICOS } from '@/lib/constants'
import { notificarAgroOS } from '@/lib/agros-webhook'

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

    // Notificar AgroOS que pagamento foi confirmado
    notificarAgroOS(serviceId, 'EM_ROTA', { pagamento: 'RESERVADO' }).catch(() => {})

    // Notificar prestador via WhatsApp que pagamento foi confirmado
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        payment: true,
        matches: {
          where: { status: 'ACEITO' },
          include: { prestador: { include: { user: true } } }
        }
      }
    })
    const prestador = service?.matches?.[0]?.prestador
    if (prestador?.user?.telefone && service) {
      const servicoLabel = SERVICOS.find(s => s.value === service.tipo)?.label ?? service.tipo
      const valor = service.payment?.valor ?? session.amount_total / 100
      enviarWhatsApp(
        prestador.user.telefone,
        wpp.pagamentoConfirmado(prestador.user.nome, servicoLabel, valor, serviceId)
      ).catch(() => {})
    }
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
