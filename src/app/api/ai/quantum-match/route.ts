import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import { solveQUBOWithCIQuanta } from '@/lib/ciquanta'

export const maxDuration = 60

// QUBO de seleção de prestadores:
// x_i = 1 → prestador i entra na lista de recomendados
// Minimiza: -score_total + penalidade_de_redundância + penalidade_de_carga
function buildMatchQUBO(candidates: Array<{ smartScore: number; distancia: number | null; prestadorId: string }>): number[][] {
  const n = candidates.length
  const Q: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))

  for (let i = 0; i < n; i++) {
    // Recompensa pelo smartScore normalizado
    Q[i][i] = -(candidates[i].smartScore / 20)

    for (let j = i + 1; j < n; j++) {
      const distI = candidates[i].distancia ?? 50
      const distJ = candidates[j].distancia ?? 50
      const diffDist = Math.abs(distI - distJ)
      // Prestadores muito próximos entre si são "redundantes" — penaliza selecionar ambos
      const redundancia = diffDist < 5 ? 1.5 : 0
      Q[i][j] = redundancia
    }
  }

  return Q
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { allowed } = rateLimit(`quantum-match:${authUser.id}`, 20, 3600_000)
    if (!allowed) return NextResponse.json({ error: 'Limite atingido. Tente em 1 hora.' }, { status: 429 })

    const { serviceId } = await req.json()
    if (!serviceId) return NextResponse.json({ error: 'serviceId obrigatório' }, { status: 400 })

    // Busca matches pendentes com smartScore já calculado
    const matches = await prisma.match.findMany({
      where: { serviceId, status: 'PENDENTE' },
      include: {
        prestador: {
          select: {
            id: true,
            user: { select: { name: true, plan: true } },
            avaliacao: true,
            totalAvaliacoes: true,
            verificado: true,
            raioAtendamento: true,
          },
        },
      },
      orderBy: { smartScore: 'desc' },
      take: 20, // CIQuanta: máx 20 qubits
    })

    if (matches.length === 0) {
      return NextResponse.json({ matches: [], quantum: { solver: 'N/A', motivo: 'Nenhum candidato' } })
    }

    const candidates = matches.map(m => ({
      id: m.id,
      smartScore: m.smartScore ?? 0,
      distancia: m.distancia,
      prestadorId: m.prestadorId,
    }))

    let prioritizedIds: string[]
    let quantumInfo: Record<string, unknown>

    if (process.env.CIQUANTA_API_KEY && candidates.length >= 2) {
      try {
        const Q = buildMatchQUBO(candidates)
        const cqResult = await solveQUBOWithCIQuanta(Q, `agrocore-match-${serviceId.slice(0, 8)}`)

        // Candidatos selecionados pelo solver quântico (x_i=1) vêm primeiro
        const selected = candidates.filter((_, i) => cqResult.solution[i] === 1)
        const unselected = candidates.filter((_, i) => cqResult.solution[i] === 0)
        prioritizedIds = [...selected, ...unselected].map(c => c.id)

        quantumInfo = {
          solver: `CIQuanta — ${process.env.CIQUANTA_BACKEND ?? 'Jiuyuan'}`,
          backend: 'hardware_quantum',
          jobId: cqResult.jobId,
          energy: cqResult.energy,
          qubits: candidates.length,
          selecionados: selected.length,
        }
      } catch {
        prioritizedIds = candidates.map(c => c.id)
        quantumInfo = { solver: 'Heurístico (fallback)', backend: 'classical' }
      }
    } else {
      prioritizedIds = candidates.map(c => c.id)
      quantumInfo = { solver: 'SmartScore heurístico', backend: 'classical' }
    }

    // Reordena os matches conforme priorização quântica
    const matchesById = new Map(matches.map(m => [m.id, m]))
    const ordered = prioritizedIds.map(id => matchesById.get(id)).filter(Boolean)

    return NextResponse.json({
      matches: ordered.map((m, rank) => ({
        id: m!.id,
        rank: rank + 1,
        smartScore: m!.smartScore,
        distancia: m!.distancia,
        prestador: {
          id: m!.prestador.id,
          nome: m!.prestador.user.name,
          avaliacao: m!.prestador.avaliacao,
          totalAvaliacoes: m!.prestador.totalAvaliacoes,
          verificado: m!.prestador.verificado,
          plano: m!.prestador.user.plan,
        },
      })),
      quantum: quantumInfo,
      modelo: 'QUBO Selection — Otimização Quântica de Match Prestador/Produtor',
    })
  } catch (e: any) {
    console.error('quantum-match erro:', e instanceof Error ? e.message : String(e))
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
