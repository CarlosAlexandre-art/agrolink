import { prisma } from './prisma'

interface MatchData {
  id: string
  distancia: number | null
  prestador: {
    avaliacao: number
    totalAvaliacoes: number
    verificado: boolean
    raioAtendamento: number
    user: { plan: string | null }
  }
}

function calcScore(match: MatchData, urgencia: string): number {
  const raio = match.prestador.raioAtendamento || 50
  const dist = match.distancia ?? raio
  const p = match.prestador

  const distScore   = Math.max(0, 1 - dist / raio) * 30
  const ratingScore = (p.avaliacao / 5) * 35
  const reviewScore = Math.min(p.totalAvaliacoes / 30, 1) * 15
  const verifBonus  = p.verificado ? 10 : 0
  const planBonus   = p.user.plan === 'enterprise' ? 5 : p.user.plan === 'pro' ? 3 : 0
  const urgBonus    = urgencia === 'ALTA' && dist <= 15 ? 5 : 0

  return Math.min(100, Math.round(distScore + ratingScore + reviewScore + verifBonus + planBonus + urgBonus))
}

function buildReason(match: MatchData, urgencia: string): string {
  const parts: string[] = []
  const p = match.prestador
  const dist = match.distancia

  if (dist !== null) parts.push(`${dist.toFixed(1)}km`)
  if (p.avaliacao > 0) parts.push(`${p.avaliacao.toFixed(1)}★`)
  if (p.verificado) parts.push('verificado')
  if (p.user.plan === 'enterprise') parts.push('enterprise')
  else if (p.user.plan === 'pro') parts.push('pro')
  if (urgencia === 'ALTA' && dist !== null && dist <= 15) parts.push('urgente próximo')

  return parts.join(' · ')
}

async function applyNimBonus(
  scored: Array<{ id: string; score: number; reason: string }>,
  tipo: string,
  descricao: string,
  matchesMap: Map<string, MatchData>
): Promise<void> {
  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey || scored.length < 2) return

  const prestadoresInfo = scored.map(s => {
    const m = matchesMap.get(s.id)
    return `ID: ${s.id}, Score: ${s.score}, Distância: ${m?.distancia?.toFixed(1) ?? '?'}km, Avaliação: ${m?.prestador.avaliacao.toFixed(1) ?? '?'}★`
  }).join('\n')

  const prompt = `Você é um assistente agrícola. Analise os prestadores abaixo para o serviço "${tipo}".
Descrição do serviço: "${descricao}"

Prestadores candidatos:
${prestadoresInfo}

Para cada prestador, responda APENAS com JSON no formato:
{"ajustes": [{"id": "<id>", "bonus": <numero entre -5 e 5>}]}

Onde bonus positivo = mais relevante para este serviço específico, negativo = menos relevante.`

  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 300,
    }),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) return

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return

  const parsed = JSON.parse(jsonMatch[0]) as { ajustes: Array<{ id: string; bonus: number }> }
  for (const ajuste of parsed.ajustes) {
    const entry = scored.find(s => s.id === ajuste.id)
    if (!entry) continue
    const bonus = Math.max(-5, Math.min(5, Math.round(ajuste.bonus)))
    entry.score = Math.min(100, Math.max(0, entry.score + bonus))
    if (bonus !== 0) entry.reason += bonus > 0 ? ' · IA+' : ' · IA-'
  }
}

export async function scoreMatchesForService(
  serviceId: string,
  tipo: string,
  urgencia: string,
  descricao: string | null
): Promise<void> {
  const matches = await prisma.match.findMany({
    where: { serviceId, status: 'PENDENTE' },
    include: {
      prestador: {
        include: { user: { select: { plan: true } } }
      }
    }
  })

  if (matches.length === 0) return

  const scored = matches.map(m => ({
    id: m.id,
    score: calcScore(m, urgencia),
    reason: buildReason(m, urgencia),
  }))

  // Salva scores algorítmicos imediatamente
  await Promise.all(
    scored.map(s =>
      prisma.match.update({
        where: { id: s.id },
        data: { smartScore: s.score, smartReason: s.reason },
      })
    )
  )

  // Opcional: bonus semântico via NVIDIA NIM (falha silenciosa)
  if (descricao && matches.length >= 2 && process.env.NVIDIA_API_KEY) {
    const matchesMap = new Map<string, MatchData>(matches.map(m => [m.id, m]))
    await applyNimBonus(scored, tipo, descricao, matchesMap).catch(() => {})

    // Persiste os scores com bonus NIM
    await Promise.all(
      scored.map(s =>
        prisma.match.update({
          where: { id: s.id },
          data: { smartScore: s.score, smartReason: s.reason },
        })
      )
    ).catch(() => {})
  }
}
