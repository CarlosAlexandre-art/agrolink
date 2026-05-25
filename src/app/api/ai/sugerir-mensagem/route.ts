import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatGroq } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { tipo, area, urgencia, endereco } = await req.json()

    const system = `Você é um assistente que ajuda prestadores de serviços agrícolas brasileiros a escrever mensagens profissionais para propostas.
Escreva uma mensagem curta (2-3 frases) do prestador para o produtor, demonstrando competência e interesse no serviço.
Use linguagem profissional mas próxima. Não use marcadores. Retorne apenas o texto da mensagem, sem aspas.`

    const prompt = `Serviço: ${tipo}
Área: ${area ? `${area} hectares` : 'não informada'}
Urgência: ${urgencia}
Local: ${endereco || 'Brasil'}

Escreva uma mensagem do prestador para o produtor sobre esta proposta.`

    const mensagem = await chatGroq(system, [{ role: 'user', content: prompt }], 200)
    return NextResponse.json({ mensagem: mensagem.trim() })
  } catch (error) {
    console.error('[sugerir-mensagem]', error)
    return NextResponse.json({ error: 'Erro ao gerar mensagem' }, { status: 500 })
  }
}
