import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatGroq } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { tipoServico, propostas } = await req.json()

    if (!propostas || propostas.length === 0) {
      return NextResponse.json({ error: 'Sem propostas para analisar' }, { status: 400 })
    }

    const system = `Você é um consultor especialista em contratação de serviços agrícolas no Brasil.
Analise as propostas e sugira qual pode ser a melhor opção com base nos dados disponíveis: preço, avaliação, badges e mensagem.
A decisão final é sempre do produtor — sua função é orientar, não decidir.
Responda com JSON: { "melhorId": string, "resumo": string, "dica": string }
- melhorId: ID da proposta sugerida
- resumo: 1 frase explicando por que esta proposta pode ser interessante (use "sugiro", "pode ser uma boa opção", "com base nos dados")
- dica: 1 dica prática para o produtor avaliar antes de contratar`

    const listagem = propostas.map((p: any, i: number) =>
      `[${i + 1}] ID: ${p.id} | Prestador: ${p.nomePrestador} | Valor: R$ ${p.valor} | Avaliação: ${p.avaliacao > 0 ? p.avaliacao.toFixed(1) + '★ (' + p.totalAvaliacoes + ' avals)' : 'Novo'} | Badges: ${p.badges?.join(', ') || 'nenhum'} | Mensagem: "${p.mensagem || 'sem mensagem'}"`
    ).join('\n')

    const prompt = `Serviço: ${tipoServico}

Propostas recebidas:
${listagem}

Qual proposta você recomenda e por quê?`

    const raw = await chatGroq(system, [{ role: 'user', content: prompt }], 400)

    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ error: 'Resposta inválida' }, { status: 500 })

    return NextResponse.json(JSON.parse(match[0]))
  } catch (error) {
    console.error('[analisar-propostas]', error)
    return NextResponse.json({ error: 'Erro ao analisar propostas' }, { status: 500 })
  }
}
