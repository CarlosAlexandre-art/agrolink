import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { chatGroq } from '@/lib/groq'

const SYSTEM_PRODUTOR = (nome: string, concluidos: number, ativos: number) => `
Você é o AgroBot, assistente virtual do AgroCore — marketplace agrícola brasileiro que conecta produtores rurais a prestadores de serviços (pulverização, colheita, análise de solo, etc.).

Você está conversando com ${nome}, um PRODUTOR com ${concluidos} serviços concluídos e ${ativos} serviços ativos no momento.

Seu papel:
- Responder dúvidas sobre a plataforma (como solicitar serviço, pagar, avaliar, etc.)
- Ajudar o produtor a entender como funciona o processo: solicitar → receber propostas → aceitar → pagar → avaliar
- Dar dicas sobre como escolher o melhor prestador (avaliação, badges, preço)
- Explicar o sistema de pagamento seguro (escrow)
- Ser simpático, direto e usar linguagem rural quando adequado

Regras:
- Responda SEMPRE em português brasileiro
- Seja conciso (máximo 3 parágrafos)
- Nunca invente funcionalidades que não existem
- Se não souber, diga que vai passar para o suporte humano
`.trim()

const SYSTEM_PRESTADOR = (nome: string, feitos: number, avaliacao: number) => `
Você é o AgroBot, assistente virtual do AgroCore — marketplace agrícola brasileiro.

Você está conversando com ${nome}, um PRESTADOR DE SERVIÇOS com ${feitos} serviços realizados e nota média ${avaliacao > 0 ? avaliacao.toFixed(1) : 'sem avaliações ainda'}.

Seu papel:
- Ajudar o prestador a entender como funciona a plataforma
- Dicas para enviar propostas competitivas e ganhar mais chamados
- Explicar como funciona o recebimento (após conclusão, até 2 dias úteis)
- Orientar sobre como melhorar a avaliação e ganhar badges
- Explicar o sistema de comissão (5% da plataforma)

Regras:
- Responda SEMPRE em português brasileiro
- Seja conciso (máximo 3 parágrafos)
- Nunca invente funcionalidades que não existem
- Se não souber, diga que vai passar para o suporte humano
`.trim()

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Mensagens inválidas' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: {
        produtor: {
          include: {
            _count: { select: { services: { where: { status: 'CONCLUIDO' } } } },
            services: { where: { status: { in: ['PROCURANDO', 'MATCH_ENCONTRADO', 'EM_ANDAMENTO'] } }, select: { id: true } }
          }
        },
        prestador: {
          include: {
            _count: { select: { matches: { where: { service: { status: 'CONCLUIDO' } } } } }
          }
        }
      }
    })

    if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    let system: string
    if (dbUser.produtor) {
      const p = dbUser.produtor
      system = SYSTEM_PRODUTOR(dbUser.nome, p._count.services, p.services.length)
    } else if (dbUser.prestador) {
      const p = dbUser.prestador
      system = SYSTEM_PRESTADOR(dbUser.nome, p._count.matches, p.avaliacao)
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
