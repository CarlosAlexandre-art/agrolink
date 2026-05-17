import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

// LLaMA 4 Scout Vision como proxy para detecção (YOLOv8 exigiria servidor GPU dedicado)
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const form = await req.formData()
    const foto = form.get('foto') as File | null
    const tipo = (form.get('tipo') as string) ?? 'bovino' // bovino | suino | ovino | ave
    const lote = form.get('lote') as string | null
    const contexto = form.get('contexto') as string | null

    if (!foto) return NextResponse.json({ error: 'Imagem obrigatória' }, { status: 400 })
    if (!foto.type.startsWith('image/')) return NextResponse.json({ error: 'Arquivo deve ser imagem' }, { status: 400 })

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GROQ_API_KEY não configurada' }, { status: 500 })

    const bytes  = await foto.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const prompt = `Você é um sistema especializado em rastreabilidade visual de animais de produção, funcionando como um detector de objetos treinado para contagem e análise de rebanho.

Analise a imagem e realize uma detecção técnica dos animais presentes.

Espécie-alvo: ${tipo}
${lote ? `Lote/área: ${lote}` : ''}
${contexto ? `Contexto: ${contexto}` : ''}

TAREFAS DE DETECÇÃO:
1. Contar todos os animais visíveis da espécie informada
2. Identificar indivíduos que se destacam (cor, tamanho, posição)
3. Estimar condição corporal geral do grupo
4. Detectar sinais de comportamento anômalo (isolamento, claudicação, postura anormal)
5. Avaliar densidade e distribuição no espaço
6. Identificar possíveis marcações visíveis (brincos, tatuagens, transponders)

Responda APENAS com JSON válido, sem markdown:
{
  "contagemTotal": número,
  "confiancaContagem": "baixa/media/alta",
  "animaisVisiveis": número,
  "animaisPartialmenteVisiveis": número,
  "distribuicao": "disperso/agrupado/linha/aleatório",
  "densidadeEstimada": "baixa/adequada/alta/superlotada",
  "condicaoCorporalGeral": "magro/abaixo/ideal/acima/obeso",
  "eccMedio": número de 1 a 9,
  "animaisDestaque": [
    { "descricao": "descrição do animal", "posicao": "localização na imagem", "observacao": "motivo do destaque" }
  ],
  "sinaisAnomalos": ["lista de comportamentos ou condições que chamam atenção"],
  "marcacoesVisiveis": ["brincos coloridos, transponders, tatuagens identificadas"],
  "qualidadeImagem": "ruim/regular/boa/excelente",
  "limitacoes": ["fatores que reduziram a precisão da contagem"],
  "recomendacoes": ["ações sugeridas com base na análise"],
  "metadados": {
    "modelo": "LLaMA 4 Scout Vision (proxy YOLOv8)",
    "aviso": "Para contagem de alta precisão em escala, recomenda-se YOLOv8 fine-tuned em servidor GPU dedicado"
  }
}`

    const resp = await fetch(GROQ_API, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${foto.type};base64,${base64}` } },
          ],
        }],
        max_tokens: 700,
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!resp.ok) {
      const err = await resp.text()
      return NextResponse.json({ error: `Erro na API de visão: ${resp.status}`, detalhe: err.slice(0, 200) }, { status: 502 })
    }

    const data = await resp.json()
    const raw  = data.choices?.[0]?.message?.content ?? ''

    let resultado: Record<string, unknown>
    try {
      const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      resultado = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: 'Não foi possível estruturar o resultado', raw }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      arquivo: foto.name,
      especie: tipo,
      lote: lote || null,
      analise: resultado,
      timestamp: new Date().toISOString(),
    })
  } catch (e: any) {
    console.error('[RastreabilidadeVisual Error]', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Erro interno' }, { status: 500 })
  }
}
