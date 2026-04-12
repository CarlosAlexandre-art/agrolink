import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

const COMISSAO = process.env.COMISSAO_PERCENT ? Number(process.env.COMISSAO_PERCENT) / 100 : 0.05
const VALOR_MINIMO = 1.00 // R$ 1,00 mínimo Stripe BRL

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

    // Usar preço do match aceito, ou estimado, ou mínimo
    const valorBruto = service.precoEstimado || (service.area ? service.area * 5 : 200)
    const valorFinal = Math.max(valorBruto, VALOR_MINIMO)

    // Usar origin da request como base URL (funciona tanto em dev quanto em produção)
    const origin = new URL(req.url).origin
    const appUrl = (origin.includes('localhost') && process.env.NEXT_PUBLIC_APP_URL)
      ? process.env.NEXT_PUBLIC_APP_URL
      : origin

    // Criar Checkout Session no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto', 'pix'],
      payment_method_options: {
        boleto: { expires_after_days: 3 },
        pix: { expires_after_seconds: 3600 }, // PIX expira em 1 hora
      },
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `AgroCore — ${service.tipo.replace(/_/g, ' ')}`,
              description: service.descricao || (service.area ? `${service.area} hectares` : 'Serviço rural'),
            },
            unit_amount: Math.round(valorFinal * 100), // centavos
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

    // Salvar registro de pagamento
    await prisma.payment.upsert({
      where: { serviceId },
      create: {
        serviceId,
        valor: valorFinal,
        comissao: valorFinal * COMISSAO,
        valorPrestador: valorFinal * (1 - COMISSAO),
        status: 'PENDENTE',
        stripePaymentId: session.id,
      },
      update: {
        stripePaymentId: session.id,
        status: 'PENDENTE',
        valor: valorFinal,
        comissao: valorFinal * COMISSAO,
        valorPrestador: valorFinal * (1 - COMISSAO),
      }
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe payment error:', error?.message || error)
    const msg = error?.raw?.message || error?.message || 'Erro ao criar pagamento'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
