import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatGroq } from '@/lib/groq'

export const maxDuration = 60

// V-JEPA 2 (Meta) requer infraestrutura GPU dedicada e não está disponível via API pública.
// Esta implementação usa amostragem de frames + LLaMA 4 Scout Vision como arquitetura proxy.
// Repo de referência: github.com/facebookresearch/vjepa2
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const MAX_FRAMES = 4 // Limite prático para análise de sequência

async function analisarFrame(
  frameBase64: string,
  mime: string,
  frameIndex: number,
  totalFrames: number,
  contexto: string,
  apiKey: string,
): Promise<string> {
  const prompt = `Analise este frame de vídeo de confinamento bovino.
Frame ${frameIndex + 1} de ${totalFrames} (posição: ${Math.round((frameIndex / totalFrames) * 100)}% do vídeo).
Contexto: ${contexto}

Descreva brevemente: comportamento dos animais, atividade predominante, sinais de estresse ou anomalia, condições visíveis de bem-estar. Máximo 3 frases.`

  const resp = await fetch(GROQ_API, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${mime};base64,${frameBase64}` } },
        ],
      }],
      max_tokens: 200,
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(15000),
  })

  if (!resp.ok) return `Frame ${frameIndex + 1}: análise indisponível`
  const data = await resp.json()
  return data.choices?.[0]?.message?.content ?? `Frame ${frameIndex + 1}: sem descrição`
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const form = await req.formData()
    const frames = form.getAll('frames') as File[] // até 4 frames do vídeo
    const lote    = (form.get('lote') as string) ?? 'lote não informado'
    const periodo = (form.get('periodo') as string) ?? 'não especificado'
    const contexto = `Lote: ${lote} | Período: ${periodo}`

    if (!frames.length) {
      return NextResponse.json({
        error: 'Envie ao menos 1 frame do vídeo (campo "frames", máximo 4)',
        instrucao: 'Extraia frames representativos do vídeo (início, meio e fim) e envie como imagens PNG/JPG',
      }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GROQ_API_KEY não configurada' }, { status: 500 })

    const framesToAnalyze = frames.slice(0, MAX_FRAMES).filter(f => f.type.startsWith('image/'))
    if (!framesToAnalyze.length) return NextResponse.json({ error: 'Arquivos enviados não são imagens válidas' }, { status: 400 })

    // Processa frames em paralelo (análise temporal)
    const analiseFrames = await Promise.all(
      framesToAnalyze.map(async (frame, i) => {
        const bytes  = await frame.arrayBuffer()
        const b64    = Buffer.from(bytes).toString('base64')
        const descricao = await analisarFrame(b64, frame.type, i, framesToAnalyze.length, contexto, apiKey)
        return { frame: i + 1, nome: frame.name, descricao }
      })
    )

    // Síntese temporal com LLM (equivalente ao "temporal reasoning" do V-JEPA)
    const sintese = await chatGroq(
      `Você é um especialista em bem-estar animal e comportamento bovino em confinamento. Analise a sequência temporal de frames de vídeo e sintetize o comportamento do rebanho.`,
      [{
        role: 'user',
        content: `Analise esta sequência temporal de frames do lote "${lote}":

${analiseFrames.map(f => `Frame ${f.frame}: ${f.descricao}`).join('\n')}

Sintetize em até 4 parágrafos:
1. Padrão comportamental predominante (atividade, tranquilidade, estresse)
2. Evolução temporal observada (mudança entre frames)
3. Indicadores de bem-estar animal (5 liberdades)
4. Alertas sanitários ou operacionais e recomendações`,
      }]
    )

    return NextResponse.json({
      ok: true,
      lote,
      periodo,
      framesAnalisados: analiseFrames.length,
      analiseTemporalFrames: analiseFrames,
      sinteseComportamental: sintese,
      modelo: {
        visao: 'LLaMA 4 Scout Vision (proxy temporal)',
        referencia: 'Arquitetura inspirada em V-JEPA 2 — github.com/facebookresearch/vjepa2',
        nota: 'Para análise temporal nativa com V-JEPA 2, é necessário servidor GPU com PyTorch.',
      },
    })
  } catch (e: any) {
    console.error('[VideoConfinamento Error]', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Erro interno' }, { status: 500 })
  }
}
