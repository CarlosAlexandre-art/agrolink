import { prisma } from '@/lib/prisma'

const db = prisma as any

export type ToolName =
  | 'buscar_servicos_disponiveis'
  | 'buscar_perfil_usuario'
  | 'buscar_historico_matches'
  | 'buscar_avaliacoes_recebidas'
  | 'buscar_demanda_mercado'
  | 'criar_notificacao'

export const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'buscar_servicos_disponiveis',
      description: 'Busca serviços disponíveis no mercado compatíveis com as especialidades e raio de atendamento do usuário.',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'ID do usuário prestador' },
          tipo: { type: 'string', description: 'Filtrar por tipo de serviço específico (opcional)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'buscar_perfil_usuario',
      description: 'Busca o perfil completo do usuário: dados de produtor ou prestador, avaliação, especialidades e histórico.',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'ID do usuário (opcional, usa o da sessão)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'buscar_historico_matches',
      description: 'Busca o histórico de matches e propostas dos últimos 30 dias com status e valores.',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'ID do usuário (opcional)' },
          dias: { type: 'number', description: 'Número de dias para buscar histórico (padrão: 30)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'buscar_avaliacoes_recebidas',
      description: 'Busca todas as avaliações recebidas pelo prestador com notas e comentários.',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'ID do usuário (opcional)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'buscar_demanda_mercado',
      description: 'Analisa a demanda regional por tipo de serviço nos últimos 30 dias para identificar oportunidades.',
      parameters: {
        type: 'object',
        properties: {
          estado: { type: 'string', description: 'Estado para filtrar análise regional (opcional)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'criar_notificacao',
      description: 'Cria uma notificação interna para o usuário sobre oportunidades, alertas ou recomendações.',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'ID do usuário destinatário' },
          mensagem: { type: 'string', description: 'Mensagem da notificação' },
          tipo: { type: 'string', description: 'Tipo: OPORTUNIDADE, ALERTA, DICA, CONTRATO' },
        },
        required: ['mensagem', 'tipo'],
      },
    },
  },
]

export async function executarTool(
  nome: ToolName,
  args: Record<string, unknown>,
  userId: string,
): Promise<string> {
  const uid = (args.userId as string) || userId
  try {
    switch (nome) {
      case 'buscar_servicos_disponiveis': {
        const user = await db.user.findUnique({
          where: { id: uid },
          include: { prestador: true },
        })
        const prestador = user?.prestador
        if (!prestador) {
          const services = await db.service.findMany({
            where: { status: { in: ['AGUARDANDO', 'PROCURANDO'] } },
            select: {
              id: true, tipo: true, descricao: true, area: true, urgencia: true,
              precoEstimado: true, endereco: true, createdAt: true,
              produtor: { select: { user: { select: { nome: true, estado: true, cidade: true } } } },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
          })
          return JSON.stringify({ total: services.length, servicos: services })
        }
        const where: any = { status: { in: ['AGUARDANDO', 'PROCURANDO'] } }
        if (prestador.servicosOferecidos?.length > 0) {
          where.tipo = { in: prestador.servicosOferecidos }
        }
        if (args.tipo) where.tipo = args.tipo as string
        const services = await db.service.findMany({
          where,
          select: {
            id: true, tipo: true, descricao: true, area: true, urgencia: true,
            precoEstimado: true, endereco: true, createdAt: true,
            produtor: { select: { user: { select: { nome: true, estado: true, cidade: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
        return JSON.stringify({
          prestador: { avaliacao: prestador.avaliacao, raio: prestador.raioAtendamento, especialidades: prestador.servicosOferecidos },
          total: services.length,
          servicos: services,
        })
      }

      case 'buscar_perfil_usuario': {
        const user = await db.user.findUnique({
          where: { id: uid },
          select: {
            nome: true, tipo: true, estado: true, cidade: true, plan: true,
            produtor: {
              select: {
                nomeFazenda: true, areaTotal: true, avaliacao: true, totalAvaliacoes: true,
                _count: { select: { services: true } },
              },
            },
            prestador: {
              select: {
                bio: true, avaliacao: true, totalAvaliacoes: true,
                disponivel: true, raioAtendamento: true, verificado: true,
                servicosOferecidos: true,
                _count: { select: { matches: true } },
              },
            },
          },
        })
        if (!user) return 'Usuário não encontrado.'
        return JSON.stringify(user)
      }

      case 'buscar_historico_matches': {
        const dias = (args.dias as number) || 30
        const desde = new Date()
        desde.setDate(desde.getDate() - dias)
        const user = await db.user.findUnique({
          where: { id: uid },
          include: {
            prestador: {
              include: {
                matches: {
                  where: { createdAt: { gte: desde } },
                  select: {
                    id: true, status: true, valorProposto: true, smartScore: true, createdAt: true,
                    service: { select: { tipo: true, status: true, precoFinal: true, endereco: true } },
                  },
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
            produtor: {
              include: {
                services: {
                  where: { createdAt: { gte: desde } },
                  select: {
                    id: true, tipo: true, status: true, precoEstimado: true, precoFinal: true, createdAt: true,
                    matches: { select: { status: true, valorProposto: true } },
                  },
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
          },
        })
        const matches = user?.prestador?.matches || []
        const services = user?.produtor?.services || []
        return JSON.stringify({
          tipo: user?.tipo,
          periodo: `${dias} dias`,
          matches: { total: matches.length, aceitos: matches.filter((m: any) => m.status === 'ACEITO').length, dados: matches },
          servicos: { total: services.length, dados: services },
        })
      }

      case 'buscar_avaliacoes_recebidas': {
        const user = await db.user.findUnique({
          where: { id: uid },
          include: { prestador: true },
        })
        if (!user?.prestador) return 'Usuário não é prestador ou não possui avaliações.'
        const avaliacoes = await db.avaliacao.findMany({
          where: { prestadorId: user.prestador.id },
          select: {
            nota: true, comentario: true, createdAt: true,
            service: { select: { tipo: true, precoFinal: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
        const media = user.prestador.avaliacao
        const notas = avaliacoes.map((a: any) => a.nota)
        const dist = [5, 4, 3, 2, 1].map(n => ({ nota: n, qtd: notas.filter((x: number) => x === n).length }))
        return JSON.stringify({
          mediaGeral: media,
          totalAvaliacoes: user.prestador.totalAvaliacoes,
          distribuicao: dist,
          recentes: avaliacoes,
        })
      }

      case 'buscar_demanda_mercado': {
        const trinta = new Date()
        trinta.setDate(trinta.getDate() - 30)
        const where: any = { status: { in: ['AGUARDANDO', 'PROCURANDO', 'MATCH_ENCONTRADO', 'EM_ROTA', 'EXECUTANDO', 'CONCLUIDO'] }, createdAt: { gte: trinta } }
        if (args.estado) {
          where.produtor = { user: { estado: args.estado as string } }
        }
        const services = await db.service.findMany({
          where,
          select: { tipo: true, urgencia: true, status: true, precoEstimado: true },
        })
        const porTipo: Record<string, { total: number; urgentes: number; valorMedio: number; valores: number[] }> = {}
        for (const s of services) {
          if (!porTipo[s.tipo]) porTipo[s.tipo] = { total: 0, urgentes: 0, valorMedio: 0, valores: [] }
          porTipo[s.tipo].total++
          if (s.urgencia === 'ALTA' || s.urgencia === 'CRITICA') porTipo[s.tipo].urgentes++
          if (s.precoEstimado) porTipo[s.tipo].valores.push(s.precoEstimado)
        }
        for (const tipo of Object.keys(porTipo)) {
          const vals = porTipo[tipo].valores
          porTipo[tipo].valorMedio = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
        }
        const ranking = Object.entries(porTipo)
          .sort(([, a], [, b]) => b.total - a.total)
          .slice(0, 10)
          .map(([tipo, d]) => ({ tipo, ...d }))
        return JSON.stringify({ periodo: '30 dias', totalServicos: services.length, rankingDemanda: ranking })
      }

      case 'criar_notificacao': {
        return `Notificação registrada: [${args.tipo}] ${args.mensagem}`
      }

      default:
        return `Ferramenta "${nome}" não reconhecida.`
    }
  } catch (e: any) {
    return `Erro ao executar ${nome}: ${e?.message ?? 'erro desconhecido'}`
  }
}
