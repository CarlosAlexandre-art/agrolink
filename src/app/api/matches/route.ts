import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { notificarUsuario } from '@/lib/push'
import { enviarWhatsApp, wpp } from '@/lib/whatsapp'
import { notificarAgroOS } from '@/lib/agros-webhook'
import { z } from 'zod'

const matchSchema = z.object({
  matchId: z.string().uuid(),
  acao: z.enum(['ACEITAR', 'RECUSAR']),
  valorProposto: z.number().positive().max(9_999_999).optional(),
  mensagemProposta: z.string().max(500).nullable().optional(),
})

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

    const parsed = matchSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const { matchId, acao, valorProposto, mensagemProposta } = parsed.data

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
      await prisma.match.update({
        where: { id: matchId },
        data: {
          status: 'ACEITO',
          valorProposto,
          mensagemProposta: mensagemProposta ?? null,
        }
      })

      await prisma.service.update({
        where: { id: match.serviceId },
        data: { status: 'AGUARDANDO_PROPOSTA' }
      })

      notificarAgroOS(match.serviceId, 'AGUARDANDO_PROPOSTA', { prestadorNome: dbUser.nome }).catch(() => {})

      const produtorUserId = match.service.produtor.userId
      const produtorUser = match.service.produtor.user

      await notificarUsuario(
        produtorUserId,
        '💰 Nova proposta recebida!',
        `${dbUser.nome} enviou uma proposta de R$ ${valorProposto!.toFixed(2)} para seu serviço.`,
        `/propostas`
      )

      if (produtorUser.telefone) {
        enviarWhatsApp(
          produtorUser.telefone,
          wpp.propostaRecebida(produtorUser.nome, dbUser.nome, valorProposto!, match.serviceId)
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
