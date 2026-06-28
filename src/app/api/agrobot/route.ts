import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { chatGroq } from '@/lib/groq'
import { rateLimit } from '@/lib/rate-limit'

const STATUS_LABEL: Record<string, string> = {
  AGUARDANDO: 'aguardando prestadores',
  AGUARDANDO_PROPOSTA: 'aguardando proposta',
  MATCH_ENCONTRADO: 'match encontrado',
  EM_ROTA: 'prestador a caminho',
  EXECUTANDO: 'em execução',
  CONCLUIDO: 'concluído',
  CANCELADO: 'cancelado',
  PROCURANDO: 'procurando prestador',
}

function buildProdutorSystem(
  nome: string,
  fazenda: string | null,
  areaTotal: number | null,
  concluidos: number,
  servicosRecentes: { tipo: string; status: string; precoFinal: number | null; createdAt: Date }[],
  gastoTotal: number,
  avaliacao: number,
  totalAvaliacoes: number,
) {
  const recentes = servicosRecentes.length > 0
    ? servicosRecentes.map(s => `  • ${s.tipo.replace(/_/g, ' ')} — ${STATUS_LABEL[s.status] ?? s.status}${s.precoFinal ? ` — R$${Number(s.precoFinal).toFixed(0)}` : ''}`).join('\n')
    : '  (nenhum serviço registrado ainda)'

  return `Você é o AgroBot v2, assistente inteligente do AgroCore — marketplace agrícola brasileiro que conecta produtores rurais a prestadores de serviços (pulverização, colheita, análise de solo, frete, irrigação etc.).

PERFIL DO PRODUTOR:
- Nome: ${nome}${fazenda ? ` | Fazenda: ${fazenda}` : ''}${areaTotal ? ` | Área: ${areaTotal} ha` : ''}
- Serviços concluídos: ${concluidos} | Avaliação dada: ${totalAvaliacoes > 0 ? avaliacao.toFixed(1) + '/5' : 'ainda não avaliou'}
- Gasto total na plataforma: R$${gastoTotal.toFixed(0)}

SERVIÇOS RECENTES:
${recentes}

SEU PAPEL:
- Responder dúvidas sobre a plataforma (como solicitar, pagar, avaliar, etc.)
- Ajudar a entender o fluxo: solicitar → receber propostas → aceitar → pagar (escrow) → avaliar
- Sugerir critérios para escolher um bom prestador (avaliação, badges, preço, distância) — mas a decisão final é sempre do produtor
- Explicar o pagamento seguro (o dinheiro fica retido até a conclusão)
- Ajudar com problemas no serviço atual (se houver um em andamento, mencione-o)

REGRAS:
- Responda SEMPRE em português brasileiro
- Seja conciso (máximo 3 parágrafos) e use linguagem rural quando adequado
- IMPORTANTE: Use sempre linguagem de sugestão — "sugiro", "pode ser interessante", "uma opção seria", "com base nos dados" — nunca use linguagem de decisão como "você deve", "a IA determinou", "a recomendação é"
- A IA orienta, mas quem decide é o usuário
- Nunca invente funcionalidades que não existem
- Se não souber, diga que vai encaminhar para o suporte humano`.trim()
}

function buildPrestadorSystem(
  nome: string,
  feitos: number,
  avaliacao: number,
  totalAvaliacoes: number,
  verificado: boolean,
  servicosOferecidos: string[],
  matchesRecentes: { tipo: string; status: string; valorProposto: number | null }[],
  ganhoTotal: number,
) {
  const recentes = matchesRecentes.length > 0
    ? matchesRecentes.map(m => `  • ${m.tipo.replace(/_/g, ' ')} — ${STATUS_LABEL[m.status] ?? m.status}${m.valorProposto ? ` — proposta R$${Number(m.valorProposto).toFixed(0)}` : ''}`).join('\n')
    : '  (nenhuma proposta enviada ainda)'

  return `Você é o AgroBot v2, assistente inteligente do AgroCore — marketplace agrícola brasileiro.

PERFIL DO PRESTADOR:
- Nome: ${nome} | Verificado: ${verificado ? 'Sim ✓' : 'Não (recomendamos verificar)'}
- Serviços realizados: ${feitos} | Nota média: ${totalAvaliacoes > 0 ? avaliacao.toFixed(1) + '/5 (' + totalAvaliacoes + ' avaliações)' : 'sem avaliações ainda'}
- Serviços que oferece: ${servicosOferecidos.length > 0 ? servicosOferecidos.map(s => s.replace(/_/g, ' ')).join(', ') : 'não configurados'}
- Ganho estimado total: R$${ganhoTotal.toFixed(0)}

PROPOSTAS RECENTES:
${recentes}

SEU PAPEL:
- Ajudar o prestador a entender a plataforma e ganhar mais chamados
- Sugerir estratégias para propostas competitivas (preço, mensagem, tempo de resposta) — a decisão final é sempre do prestador
- Explicar como funciona o recebimento (após conclusão do serviço, até 2 dias úteis)
- Orientar sobre como melhorar a avaliação e conquistar badges (verificado, top prestador, etc.)
- Explicar a comissão da plataforma (5% do valor do serviço)

REGRAS:
- Responda SEMPRE em português brasileiro
- Seja conciso (máximo 3 parágrafos)
- IMPORTANTE: Use sempre linguagem de sugestão — "sugiro", "pode ser interessante", "uma opção seria", "com base nos dados" — nunca use linguagem de decisão
- A IA orienta, mas quem decide é o usuário
- Nunca invente funcionalidades que não existem
- Se não souber, diga que vai encaminhar para o suporte humano`.trim()
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { allowed } = rateLimit(`agrobot:${user.id}`, 30, 3600_000)
    if (!allowed) return NextResponse.json({ error: 'Limite de mensagens atingido. Tente em 1 hora.' }, { status: 429 })

    const { messages } = await req.json()
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Mensagens inválidas' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: {
        produtor: {
          include: {
            _count: { select: { services: { where: { status: 'CONCLUIDO' } } } },
            services: {
              orderBy: { createdAt: 'desc' },
              take: 6,
              select: { tipo: true, status: true, precoFinal: true, createdAt: true },
            },
            avaliacoesRecebidas: { select: { nota: true } },
          },
        },
        prestador: {
          include: {
            _count: { select: { matches: { where: { service: { status: 'CONCLUIDO' } } } } },
            matches: {
              orderBy: { createdAt: 'desc' },
              take: 8,
              select: {
                status: true,
                valorProposto: true,
                service: { select: { tipo: true, precoFinal: true, status: true } },
              },
            },
            avaliacoes: { select: { nota: true } },
          },
        },
      },
    })

    if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    let system: string

    if (dbUser.produtor) {
      const p = dbUser.produtor
      const gastoTotal = p.services
        .filter(s => s.status === 'CONCLUIDO' && s.precoFinal)
        .reduce((sum, s) => sum + Number(s.precoFinal), 0)
      const avaliacao = p.totalAvaliacoes > 0 ? p.avaliacao : 0
      system = buildProdutorSystem(
        dbUser.nome,
        p.nomeFazenda,
        p.areaTotal,
        p._count.services,
        p.services.slice(0, 5),
        gastoTotal,
        avaliacao,
        p.totalAvaliacoes,
      )
    } else if (dbUser.prestador) {
      const p = dbUser.prestador
      const matchesRecentes = p.matches.slice(0, 6).map(m => ({
        tipo: m.service.tipo,
        status: m.status,
        valorProposto: m.valorProposto,
      }))
      const ganhoTotal = p.matches
        .filter(m => m.service.status === 'CONCLUIDO' && m.service.precoFinal)
        .reduce((sum, m) => sum + Number(m.service.precoFinal) * 0.95, 0)
      system = buildPrestadorSystem(
        dbUser.nome,
        p._count.matches,
        p.avaliacao,
        p.totalAvaliacoes,
        p.verificado,
        p.servicosOferecidos,
        matchesRecentes,
        ganhoTotal,
      )
    } else {
      system = 'Você é o AgroBot, assistente do AgroCore. Responda em português de forma concisa.'
    }

    const resposta = await chatGroq(system, messages.slice(-10))
    return NextResponse.json({ resposta })
  } catch (error) {
    console.error('[agrobot]', error)
    return NextResponse.json({ error: 'Erro ao processar mensagem' }, { status: 500 })
  }
}
