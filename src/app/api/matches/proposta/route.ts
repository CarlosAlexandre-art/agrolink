import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { enviarWhatsApp, wpp } from '@/lib/whatsapp'
import { SERVICOS } from '@/lib/constants'
import { notificarAgroOS } from '@/lib/agros-webhook'
import { gerarHtmlContrato, salvarContrato } from '@/lib/contrato'
import { emails } from '@/lib/email'

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
        service: { produtorId: dbUser.produtor.id, status: { in: ['PROCURANDO', 'AGUARDANDO_PROPOSTA'] } }
      },
      include: {
        service: true,
        prestador: { include: { user: true } },
      }
    })

    if (!match) {
      return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })
    }

    if (acao === 'ACEITAR') {
      // Produtor escolhe esta proposta: cancela todas as outras, avança o serviço
      await prisma.$transaction([
        prisma.match.updateMany({
          where: { serviceId: match.serviceId, id: { not: matchId }, status: { in: ['ACEITO', 'PENDENTE'] } },
          data: { status: 'CANCELADO' }
        }),
        prisma.service.update({
          where: { id: match.serviceId },
          data: {
            status: 'MATCH_ENCONTRADO',
            precoFinal: match.valorProposto,
            precoEstimado: match.valorProposto,
          }
        }),
      ])

      const prestadorUser = match.prestador.user
      const servicoLabel = SERVICOS.find(s => s.value === match.service.tipo)?.label ?? match.service.tipo
      const ip = (req.headers as Headers).get('x-forwarded-for')?.split(',')[0].trim() ?? undefined

      // Gerar contrato digital automaticamente (não bloqueia o fluxo)
      ;(async () => {
        try {
          const html = gerarHtmlContrato({
            serviceId: match.serviceId,
            tipo: servicoLabel,
            descricao: match.service.descricao,
            valor: match.valorProposto ?? 0,
            endereco: match.service.endereco,
            agendadoPara: match.service.agendadoPara,
            produtor: {
              nome: dbUser.nome,
              email: dbUser.email,
              telefone: dbUser.telefone,
              cidade: dbUser.cidade,
              estado: dbUser.estado,
            },
            prestador: {
              nome: prestadorUser.nome,
              email: prestadorUser.email,
              telefone: prestadorUser.telefone,
              cidade: prestadorUser.cidade,
              estado: prestadorUser.estado,
            },
            ipProdutor: ip,
            dataAceite: new Date(),
          })

          const contratoUrl = await salvarContrato(match.serviceId, html)

          if (contratoUrl) {
            // Salva URL no banco
            await prisma.service.update({
              where: { id: match.serviceId },
              data: {
                contratoUrl,
                contratoAceitoEm: new Date(),
                contratoIpProdutor: ip,
              }
            })

            // Envia por email para ambas as partes
            emails.contratoGerado(dbUser.email, dbUser.nome, servicoLabel, match.valorProposto ?? 0, contratoUrl).catch(() => {})
            emails.contratoGerado(prestadorUser.email, prestadorUser.nome, servicoLabel, match.valorProposto ?? 0, contratoUrl).catch(() => {})

            // Envia link do contrato por WhatsApp para ambas as partes
            const msgContrato = (nome: string) => `📄 *Contrato AgroCore gerado*\n\nOlá ${nome.split(' ')[0]}! O contrato referente ao serviço de *${servicoLabel}* está disponível:\n\n${contratoUrl}\n\n_Válido juridicamente conforme Lei nº 14.063/2020_`
            if (dbUser.telefone) enviarWhatsApp(dbUser.telefone, msgContrato(dbUser.nome)).catch(() => {})
            if (prestadorUser.telefone) enviarWhatsApp(prestadorUser.telefone, msgContrato(prestadorUser.nome)).catch(() => {})
          }
        } catch (e) {
          console.error('Erro ao gerar contrato:', e)
        }
      })()

      // Notificar AgroOS que proposta foi aceita
      notificarAgroOS(match.serviceId, 'MATCH_ENCONTRADO', { prestadorNome: prestadorUser.nome }).catch(() => {})

      // Notificar prestador via WhatsApp
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
