import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatGroq } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { tipo, area, urgencia, endereco } = await req.json()

    const system = `Você é um especialista em precificação de serviços agrícolas no Brasil.
Dê sugestões de preço realistas e competitivas em reais (R$) para serviços agrícolas.
Responda APENAS com JSON no formato: { "minimo": number, "sugerido": number, "maximo": number, "justificativa": string }
A justificativa deve ser 1 frase curta explicando os fatores considerados.`

    const prompt = `Serviço: ${tipo}
Área: ${area ? `${area} hectares` : 'não informada'}
Urgência: ${urgencia}
Localização: ${endereco || 'Brasil'}

Qual o preço justo para cobrar por este serviço?`

    const raw = await chatGroq(system, [{ role: 'user', content: prompt }], 300)

    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ error: 'Resposta inválida da IA' }, { status: 500 })

    const dados = JSON.parse(match[0])
    return NextResponse.json(dados)
  } catch (error) {
    console.error('[sugerir-preco]', error)
    return NextResponse.json({ error: 'Erro ao sugerir preço' }, { status: 500 })
  }
}
