import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { serviceId } = await req.json()

    const service = await prisma.service.findFirst({
      where: { id: serviceId },
      include: {
        produtor: { include: { user: true } },
        matches: {
          where: { status: 'ACEITO' },
          include: { prestador: { include: { user: true } } }
        }
      }
    })

    if (!service) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    if (service.produtor.user.supabaseId !== user.id) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Estimate price if not set — R$ 50/ha minimum, R$ 200 base
    const valorEstimado = service.precoEstimado || (service.area ? service.area * 5 : 200)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `AgroCore — Serviço de ${service.tipo.replace(/_/g, ' ')}`,
              description: service.descricao || `${service.area ? service.area + ' hectares' : 'Serviço rural'}`,
            },
            unit_amount: Math.round(valorEstimado * 100), // centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/servico/${serviceId}?pagamento=sucesso`,
      cancel_url: `${appUrl}/servico/${serviceId}?pagamento=cancelado`,
      metadata: {
        serviceId,
        produtorId: service.produtorId,
        prestadorId: service.matches[0]?.prestadorId || '',
      },
    })

    const COMISSAO = 0.05

    // Save payment record
    await prisma.payment.upsert({
      where: { serviceId },
      create: {
        serviceId,
        valor: valorEstimado,
        comissao: valorEstimado * COMISSAO,
        valorPrestador: valorEstimado * (1 - COMISSAO),
        status: 'PENDENTE',
        stripePaymentId: session.id,
      },
      update: {
        stripePaymentId: session.id,
        status: 'PENDENTE',
      }
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar pagamento' }, { status: 500 })
  }
}
