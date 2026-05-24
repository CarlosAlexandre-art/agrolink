import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { enviarWhatsApp, wpp } from '@/lib/whatsapp'
import { SERVICOS } from '@/lib/constants'
import { notificarAgroOS } from '@/lib/agros-webhook'
import { notificarAgroRate } from '@/lib/agrorate-webhook'

const STATUS_FLOW: Record<string, string> = {
  MATCH_ENCONTRADO: 'EM_ROTA',
  EM_ROTA: 'EXECUTANDO',
  EXECUTANDO: 'CONCLUIDO',
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true, prestador: true }
    })
    if (!dbUser) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    // Somente o produtor do serviço ou um prestador com match pode ver
    const whereOr: object[] = []
    if (dbUser.produtor) whereOr.push({ produtorId: dbUser.produtor.id })
    if (dbUser.prestador) whereOr.push({ matches: { some: { prestadorId: dbUser.prestador.id } } })

    if (whereOr.length === 0) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    const hasAccess = await prisma.service.findFirst({
      where: { id, OR: whereOr },
      select: { id: true }
    })
    if (!hasAccess) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        produtor: { include: { user: true } },
        matches: {
          where: { status: { in: ['ACEITO', 'RECUSADO'] } },
          include: { prestador: { include: { user: true } } }
        },
        payment: true,
        avaliacao: true,
        avaliacaoProdutor: true,
      }
    })

    if (!service) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    return NextResponse.json(service)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar serviço' }, { status: 500 })
  }
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { prestador: true }
    })

    if (!dbUser?.prestador) {
      return NextResponse.json({ error: 'Apenas prestadores podem atualizar o status' }, { status: 403 })
    }

    const service = await prisma.service.findFirst({
      where: {
        id,
        matches: {
          some: { prestadorId: dbUser.prestador.id, status: 'ACEITO' }
        }
      },
      include: {
        payment: true,
        produtor: { include: { user: true } }
      }
    })

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    const novoStatus = STATUS_FLOW[service.status]
    if (!novoStatus) {
      return NextResponse.json({ error: 'Status não pode ser avançado' }, { status: 400 })
    }

    const updated = await prisma.service.update({
      where: { id },
      data: { status: novoStatus as any }
    })

    // Quando concluído, transferir pagamento para o prestador
    if (novoStatus === 'CONCLUIDO' && service.payment?.status === 'RESERVADO') {
      const stripeAccountId = dbUser.prestador.stripeAccountId

      if (stripeAccountId) {
        const valorCentavos = Math.round(service.payment.valorPrestador * 100)

        const transfer = await stripe.transfers.create({
          amount: valorCentavos,
          currency: 'brl',
          destination: stripeAccountId,
          metadata: {
            serviceId: id,
            paymentId: service.payment.id,
          },
        })

        await prisma.payment.update({
          where: { id: service.payment.id },
          data: {
            status: 'LIBERADO',
            stripeTransferId: transfer.id,
          }
        })
      } else {
        // Sem conta conectada: apenas marca como liberado (pagamento manual depois)
        await prisma.payment.update({
          where: { id: service.payment.id },
          data: { status: 'LIBERADO' }
        })
      }
    }

    // Notificar produtor via WhatsApp sobre mudança de status
    const produtorUser = service.produtor.user
    if (produtorUser.telefone) {
      const servicoLabel = SERVICOS.find(s => s.value === service.tipo)?.label ?? service.tipo
      enviarWhatsApp(
        produtorUser.telefone,
        wpp.statusAtualizado(produtorUser.nome, servicoLabel, novoStatus, id)
      ).catch(() => {})
    }

    // Notificar AgroOS sobre mudança de status
    // Envia o valor total pago pelo produtor (não só o repasse ao prestador)
    const extraAgroOS = novoStatus === 'CONCLUIDO'
      ? { valor: service.payment?.valor ?? 0, tipo: service.tipo }
      : undefined
    notificarAgroOS(id, novoStatus, extraAgroOS).catch(() => {})

    // Notificar AgroRate para recalcular score do produtor quando serviço concluído
    if (novoStatus === 'CONCLUIDO' && service.produtor.user.supabaseId) {
      notificarAgroRate(service.produtor.user.supabaseId, 'servico_concluido').catch(() => {})
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 })
  }
}
