import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { enviarWhatsApp, wpp } from '@/lib/whatsapp'
import { SERVICOS } from '@/lib/constants'
import { notificarAgroOS } from '@/lib/agros-webhook'

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true }
    })

    if (!dbUser?.produtor) {
      return NextResponse.json({ error: 'Apenas produtores podem responder propostas' }, { status: 403 })
    }

    const { matchId, acao } = await req.json() // acao: 'ACEITAR' | 'RECUSAR'

    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        status: 'ACEITO',
        service: { produtorId: dbUser.produtor.id, status: 'AGUARDANDO_PROPOSTA' }
      },
      include: {
        service: true,
        prestador: { include: { user: true } }
      }
    })

    if (!match) {
      return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })
    }

    if (acao === 'ACEITAR') {
      // Produtor aceita proposta → serviço vai para MATCH_ENCONTRADO com o valor proposto
      await prisma.$transaction([
        prisma.service.update({
          where: { id: match.serviceId },
          data: {
            status: 'MATCH_ENCONTRADO',
            precoFinal: match.valorProposto,
            precoEstimado: match.valorProposto,
          }
        }),
      ])

      // Notificar AgroOS que proposta foi aceita
      notificarAgroOS(match.serviceId, 'MATCH_ENCONTRADO', { prestadorNome: match.prestador.user.nome }).catch(() => {})

      // Notificar prestador via WhatsApp
      const prestadorUser = match.prestador.user
      const servicoLabel = SERVICOS.find(s => s.value === match.service.tipo)?.label ?? match.service.tipo
      if (prestadorUser.telefone && match.valorProposto) {
        enviarWhatsApp(
          prestadorUser.telefone,
          wpp.propostaAceita(prestadorUser.nome, servicoLabel, match.valorProposto, match.serviceId)
        ).catch(() => {})
      }
    } else {
      // Produtor recusa → cancela esse match, volta a procurar
      await prisma.$transaction([
        prisma.match.update({
          where: { id: matchId },
          data: { status: 'CANCELADO' }
        }),
        prisma.service.update({
          where: { id: match.serviceId },
          data: { status: 'PROCURANDO' }
        })
      ])

      // Notificar prestador que proposta foi recusada
      const prestadorUser = match.prestador.user
      const servicoLabel = SERVICOS.find(s => s.value === match.service.tipo)?.label ?? match.service.tipo
      if (prestadorUser.telefone) {
        enviarWhatsApp(
          prestadorUser.telefone,
          wpp.propostaRecusada(prestadorUser.nome, servicoLabel)
        ).catch(() => {})
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao processar proposta' }, { status: 500 })
  }
}
