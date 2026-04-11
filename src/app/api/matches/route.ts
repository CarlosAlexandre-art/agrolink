import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { notificarPrestador } from '@/lib/push'
import { enviarWhatsApp, wpp } from '@/lib/whatsapp'

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { prestador: true }
    })

    if (!dbUser?.prestador) {
      return NextResponse.json({ error: 'Usuário não é prestador' }, { status: 403 })
    }

    const { matchId, acao, valorProposto, mensagemProposta } = await req.json()

    if (!matchId || !['ACEITAR', 'RECUSAR'].includes(acao)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    if (acao === 'ACEITAR' && (!valorProposto || valorProposto <= 0)) {
      return NextResponse.json({ error: 'Informe o valor da proposta' }, { status: 400 })
    }

    const match = await prisma.match.findFirst({
      where: { id: matchId, prestadorId: dbUser.prestador.id, status: 'PENDENTE' },
      include: { service: { include: { produtor: { include: { user: true } } } } }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match não encontrado' }, { status: 404 })
    }

    if (acao === 'ACEITAR') {
      // Prestador aceita E envia proposta de valor
      await prisma.$transaction([
        prisma.match.update({
          where: { id: matchId },
          data: {
            status: 'ACEITO',
            valorProposto,
            mensagemProposta: mensagemProposta || null,
          }
        }),
        prisma.match.updateMany({
          where: { serviceId: match.serviceId, id: { not: matchId }, status: 'PENDENTE' },
          data: { status: 'CANCELADO' }
        }),
        prisma.service.update({
          where: { id: match.serviceId },
          data: { status: 'AGUARDANDO_PROPOSTA' }
        })
      ])

      // Notify produtor that they have a proposal
      const produtorUserId = match.service.produtor.userId
      const produtorUser = match.service.produtor.user

      await notificarPrestador(
        produtorUserId,
        '💰 Nova proposta recebida!',
        `${dbUser.nome} enviou uma proposta de R$ ${valorProposto.toFixed(2)} para seu serviço.`,
        `/servico/${match.serviceId}`
      )

      if (produtorUser.telefone) {
        enviarWhatsApp(
          produtorUser.telefone,
          wpp.propostaRecebida(produtorUser.nome, dbUser.nome, valorProposto, match.serviceId)
        ).catch(() => {})
      }

    } else {
      await prisma.match.update({
        where: { id: matchId },
        data: { status: 'RECUSADO' }
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao processar match' }, { status: 500 })
  }
}
