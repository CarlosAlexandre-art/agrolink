import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { chatGroq } from '@/lib/groq'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: {
        produtor: {
          include: {
            services: {
              where: {
                createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
              },
              select: { tipo: true, status: true, createdAt: true }
            }
          }
        },
        prestador: {
          include: {
            matches: {
              where: {
                updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                service: { status: 'CONCLUIDO' }
              },
              select: { valorProposto: true, service: { select: { tipo: true } } }
            }
          }
        }
      }
    })

    if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    let dados = ''
    let tipo = ''

    if (dbUser.produtor) {
      const s = dbUser.produtor.services
      const concluidos = s.filter(x => x.status === 'CONCLUIDO').length
      const emAndamento = s.filter(x => ['PROCURANDO', 'MATCH_ENCONTRADO', 'EM_ANDAMENTO'].includes(x.status)).length
      const tipos = [...new Set(s.map(x => x.tipo))].join(', ')
      dados = `Produtor: ${dbUser.nome}. Últimos 30 dias: ${s.length} serviços solicitados, ${concluidos} concluídos, ${emAndamento} em andamento. Tipos: ${tipos || 'nenhum'}.`
      tipo = 'produtor'
    } else if (dbUser.prestador) {
      const m = dbUser.prestador.matches
      const ganhos = m.reduce((acc, x) => acc + (x.valorProposto ?? 0) * 0.95, 0)
      const tipos = [...new Set(m.map(x => x.service.tipo))].join(', ')
      dados = `Prestador: ${dbUser.nome}. Últimos 30 dias: ${m.length} serviços concluídos, ganhos estimados R$ ${ganhos.toFixed(2)}. Tipos: ${tipos || 'nenhum'}. Avaliação atual: ${dbUser.prestador.avaliacao > 0 ? dbUser.prestador.avaliacao.toFixed(1) + '★' : 'sem avaliações'}.`
      tipo = 'prestador'
    } else {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 400 })
    }

    const system = `Você é um assistente analítico do AgroCore, marketplace agrícola brasileiro.
Gere um relatório mensal curto e motivador para o usuário, com insights úteis e sugestões de melhoria.
Formato: 3 parágrafos curtos: 1) Resumo do mês, 2) Ponto positivo, 3) Sugestão de melhoria para o próximo mês.
Responda em português brasileiro, de forma amigável e prática.`

    const relatorio = await chatGroq(system, [
      { role: 'user', content: `Gere um relatório mensal para este ${tipo}: ${dados}` }
    ], 500)

    return NextResponse.json({ relatorio, tipo })
  } catch (error) {
    console.error('[relatorio]', error)
    return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: 500 })
  }
}
