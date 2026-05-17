import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const form = await req.formData()
    const foto = form.get('foto') as File | null
    const especie    = (form.get('especie')    as string) ?? 'bovino'
    const raca       = (form.get('raca')       as string) ?? ''
    const idade      = (form.get('idade')      as string) ?? ''
    const contexto   = (form.get('contexto')   as string) ?? ''

    if (!foto) return NextResponse.json({ error: 'Foto obrigatória' }, { status: 400 })
    if (!foto.type.startsWith('image/')) return NextResponse.json({ error: 'Arquivo deve ser uma imagem' }, { status: 400 })

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Chave Groq não configurada' }, { status: 500 })

    const bytes  = await foto.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mime   = foto.type

    const prompt = `Você é um especialista em zootecnia e biometria animal com 20 anos de experiência na avaliação visual de peso e escore de condição corporal (ECC) em animais de produção.

Analise a imagem do animal e forneça uma estimativa técnica de peso vivo.

Espécie: ${especie}${raca ? ` | Raça: ${raca}` : ''}${idade ? ` | Idade/fase: ${idade}` : ''}${contexto ? `\nContexto adicional: ${contexto}` : ''}

METODOLOGIA DE AVALIAÇÃO:
- Para bovinos: avalie cernelha, costelas, lombo, garupa e ancas (escala ECC 1-9 BCS)
- Para suínos: avalie espessura de toucinho estimada e comprimento corporal
- Para ovinos/caprinos: avalie coluna vertebral, processos espinhosos e transversos
- Para equinos: avalie escala de Henneke (1-9)
- Considere proporção corporal, postura e membros como referência de escala

Responda APENAS com JSON válido, sem markdown:
{
  "pesoEstimadoKg": número ou null se impossível determinar,
  "intervaloConfianca": { "min": número, "max": número },
  "ecc": { "escala": "nome da escala usada", "valor": número, "interpretacao": "texto" },
  "condicaoCorporal": "magro/abaixo/ideal/acima/obeso",
  "aparenciaGeral": "descrição das características visuais observadas",
  "pontosMedidos": ["lista de pontos anatômicos avaliados na imagem"],
  "categoriaAnimal": "bezerro/novilho/boi/vaca/etc",
  "aptidao": "corte/leite/misto/trabalho",
  "observacoesVeterinarias": "observações sobre saúde ou condição que se destaquem",
  "confiancaEstimativa": "baixa/media/alta",
  "motivoBaixaConfianca": "razão se baixa ou media",
  "recomendacoes": ["ações sugeridas com base no ECC e condição"],
  "aviso": "Este é um sistema de apoio. A pesagem real com balança é sempre necessária para decisões comerciais ou sanitárias."
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
            { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } },
          ],
        }],
        max_tokens: 800,
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!resp.ok) {
      const err = await resp.text()
      return NextResponse.json({ error: `Erro na API de visão: ${resp.status} — ${err.slice(0, 200)}` }, { status: 502 })
    }

    const data = await resp.json()
    const raw  = data.choices?.[0]?.message?.content ?? ''

    let analise: Record<string, unknown>
    try {
      const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analise = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: 'Não foi possível estruturar a estimativa', raw }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      nomeArquivo: foto.name,
      especie,
      raca: raca || null,
      analise,
    })
  } catch (e: any) {
    console.error('[EstimativaPeso Error]', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Erro interno' }, { status: 500 })
  }
}
