import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatGroq } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { tipo, area, urgencia, rascunho } = await req.json()

    const system = `Você é um assistente que ajuda produtores rurais brasileiros a descrever seus pedidos de serviço de forma clara e profissional.
Escreva uma descrição concisa (2-3 frases) que ajude o prestador a entender exatamente o que precisa ser feito.
Use linguagem simples e direta. Não use marcadores ou listas. Retorne apenas o texto da descrição.`

    const prompt = `Serviço solicitado: ${tipo}
Área: ${area ? `${area} hectares` : 'não informada'}
Urgência: ${urgencia}
Observações do produtor: ${rascunho || 'nenhuma'}

Escreva uma descrição profissional para este pedido de serviço.`

    const descricao = await chatGroq(system, [{ role: 'user', content: prompt }], 200)
    return NextResponse.json({ descricao: descricao.trim() })
  } catch (error) {
    console.error('[descrever-servico]', error)
    return NextResponse.json({ error: 'Erro ao gerar descrição' }, { status: 500 })
  }
}
