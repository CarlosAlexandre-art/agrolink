'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SERVICOS } from '@/lib/constants'
import { getBadgesPrestador } from '@/lib/badges'
import BadgeChip from '@/components/BadgeChip'
import BottomNav from '@/components/BottomNav'

export default function PropostasPage() {
  const [propostas, setPropostas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [respondendo, setRespondendo] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [analiseIA, setAnaliseIA] = useState<Record<string, { melhorId: string; resumo: string; dica: string } | null>>({})
  const [analisando, setAnalisando] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/propostas').then(r => r.json()).then(d => {
      setPropostas(Array.isArray(d) ? d : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function responder(matchId: string, acao: 'ACEITAR' | 'RECUSAR') {
    setRespondendo(matchId)
    setMsg(null)
    const res = await fetch('/api/matches/proposta', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, acao }),
    })
    if (res.ok) {
      setMsg({ tipo: 'ok', texto: acao === 'ACEITAR' ? '✅ Proposta aceita! Faça o pagamento para continuar.' : '❌ Proposta recusada.' })
      setPropostas(p => p.filter(m => m.id !== matchId))
    } else {
      const d = await res.json()
      setMsg({ tipo: 'erro', texto: d.error || 'Erro ao responder' })
    }
    setRespondendo(null)
  }

  async function analisarComIA(serviceId: string, matches: any[], tipoServico: string) {
    setAnalisando(serviceId)
    try {
      const res = await fetch('/api/ai/analisar-propostas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoServico,
          propostas: matches.map(m => ({
            id: m.id,
            nomePrestador: m.prestador.user.nome,
            valor: m.valorProposto,
            avaliacao: m.prestador.avaliacao ?? 0,
            totalAvaliacoes: m.prestador.totalAvaliacoes ?? 0,
            badges: getBadgesPrestador({ avaliacao: m.prestador.avaliacao ?? 0, totalAvaliacoes: m.prestador.totalAvaliacoes ?? 0, verificado: m.prestador.verificado ?? false }).map(b => b.label),
            mensagem: m.mensagemProposta,
          })),
        }),
      })
      if (res.ok) {
        const analise = await res.json()
        setAnaliseIA(prev => ({ ...prev, [serviceId]: analise }))
      }
    } finally {
      setAnalisando(null)
    }
  }

  // Agrupar por serviço e ordenar por menor valor
  const porServico: Record<string, any[]> = {}
  for (const m of propostas) {
    if (!porServico[m.serviceId]) porServico[m.serviceId] = []
    porServico[m.serviceId].push(m)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-green-200 hover:text-white">←</Link>
          <div>
            <div className="font-bold text-lg">💰 Propostas recebidas</div>
            <div className="text-xs text-green-200">Escolha a melhor proposta para cada serviço</div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {msg && (
          <div className={`p-4 rounded-2xl text-sm font-medium ${msg.tipo === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {msg.texto}
          </div>
        )}

        {loading && <div className="text-center py-12 text-gray-400 animate-pulse">Carregando...</div>}

        {!loading && Object.keys(porServico).length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg font-medium">Nenhuma proposta no momento.</p>
            <p className="text-sm mt-1">Assim que prestadores enviarem propostas elas aparecem aqui.</p>
          </div>
        )}

        {Object.entries(porServico).map(([serviceId, matches]) => {
          const service = matches[0].service
          const servicoLabel = SERVICOS.find(s => s.value === service.tipo)?.label ?? service.tipo
          const servicoIcon = SERVICOS.find(s => s.value === service.tipo)?.icon ?? '📋'
          const hasSmartScore = matches.some(m => m.smartScore != null)
          const planRank: Record<string, number> = { enterprise: 0, pro: 1, free: 2 }
          const ordenados = [...matches].sort((a, b) => {
            if (hasSmartScore) {
              const diff = (b.smartScore ?? 0) - (a.smartScore ?? 0)
              if (diff !== 0) return diff
            }
            const rankA = planRank[a.prestador.user.plan ?? 'free'] ?? 2
            const rankB = planRank[b.prestador.user.plan ?? 'free'] ?? 2
            if (rankA !== rankB) return rankA - rankB
            return (a.valorProposto ?? 0) - (b.valorProposto ?? 0)
          })
          const menorPrecoId = !hasSmartScore ? ordenados[0]?.id : null

          return (
            <div key={serviceId} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-green-50 dark:bg-green-900/30 px-5 py-4 border-b border-green-100 dark:border-green-800">
                <div className="font-bold text-gray-800 dark:text-gray-100 text-lg">{servicoIcon} {servicoLabel}</div>
                {service.endereco && <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">📍 {service.endereco}</div>}
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{ordenados.length} proposta{ordenados.length > 1 ? 's' : ''} recebida{ordenados.length > 1 ? 's' : ''}</div>
              </div>

              {/* Análise IA */}
              {ordenados.length > 1 && (
                <div className="px-5 py-3 border-b border-green-100 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
                  {!analiseIA[serviceId] ? (
                    <button
                      onClick={() => analisarComIA(serviceId, ordenados, servicoLabel)}
                      disabled={analisando === serviceId}
                      className="w-full py-2 text-sm font-semibold text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700 bg-white dark:bg-gray-700 rounded-xl hover:bg-green-50 dark:hover:bg-gray-600 transition disabled:opacity-50"
                    >
                      {analisando === serviceId ? '🤖 Analisando propostas...' : '🤖 Pedir sugestão da IA — qual pode ser a melhor?'}
                    </button>
                  ) : (
                    <div className="text-sm">
                      <div className="font-semibold text-green-700 dark:text-green-400 mb-1">🤖 Sugestão da IA — baseada nos dados</div>
                      <p className="text-gray-700 dark:text-gray-300">{analiseIA[serviceId]!.resumo}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 italic">💡 {analiseIA[serviceId]!.dica}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="divide-y divide-gray-50">
                {ordenados.map((m) => {
                  const isMenorPreco = m.id === menorPrecoId && ordenados.length > 1
                  const badges = getBadgesPrestador({
                    avaliacao: m.prestador.avaliacao ?? 0,
                    totalAvaliacoes: m.prestador.totalAvaliacoes ?? 0,
                    verificado: m.prestador.verificado ?? false,
                    isMenorPreco,
                  })

                  return (
                    <div key={m.id} className={`p-5 space-y-3 ${analiseIA[serviceId]?.melhorId === m.id ? 'bg-blue-50/50 dark:bg-blue-900/20' : isMenorPreco ? 'bg-emerald-50/40 dark:bg-emerald-900/20' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Link href={`/prestador/${m.prestadorId}`}>
                            <div className="w-11 h-11 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center font-bold text-green-700 dark:text-green-400 text-lg flex-shrink-0 hover:ring-2 hover:ring-green-400 transition">
                              {m.prestador.user.nome[0]}
                            </div>
                          </Link>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link href={`/prestador/${m.prestadorId}`} className="font-semibold text-gray-800 dark:text-gray-100 hover:text-green-700 transition truncate">
                                {m.prestador.user.nome}
                              </Link>
                              {m.prestador.user.plan === 'pro' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300 shrink-0">PRO</span>
                              )}
                              {m.prestador.user.plan === 'enterprise' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-300 shrink-0">ENTERPRISE</span>
                              )}
                            </div>
                            {m.prestador.user.cidade && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">{m.prestador.user.cidade}, {m.prestador.user.estado}</div>
                            )}
                            {m.prestador.avaliacao > 0 && (
                              <div className="text-xs text-yellow-600 flex items-center gap-1">
                                <span>{'★'.repeat(Math.round(m.prestador.avaliacao))}</span>
                                <span className="font-medium text-gray-600 dark:text-gray-300">{m.prestador.avaliacao.toFixed(1)}</span>
                                <span className="text-gray-400 dark:text-gray-500">· {m.prestador.totalAvaliacoes} avaliações</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {m.smartScore != null && (
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block ${
                              m.smartScore >= 75 ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : m.smartScore >= 50 ? 'bg-gray-100 text-gray-600 border border-gray-300'
                              : 'bg-orange-50 text-orange-600 border border-orange-200'
                            }`}>
                              ⚡ {m.smartScore}
                            </div>
                          )}
                          <div className="text-2xl font-bold text-green-700">
                            R$ {m.valorProposto?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      {badges.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {badges.map(b => <BadgeChip key={b.key} badge={b} size="xs" />)}
                        </div>
                      )}

                      {m.mensagemProposta && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 italic">
                          "{m.mensagemProposta}"
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => responder(m.id, 'RECUSAR')}
                          disabled={respondendo === m.id}
                          className="py-2.5 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition disabled:opacity-50 text-sm"
                        >
                          {respondendo === m.id ? '...' : '❌ Recusar'}
                        </button>
                        <button
                          onClick={() => responder(m.id, 'ACEITAR')}
                          disabled={respondendo === m.id}
                          className="py-2.5 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition disabled:opacity-50 text-sm"
                        >
                          {respondendo === m.id ? '...' : '✅ Aceitar'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <BottomNav tipo="PRODUTOR" />
    </div>
  )
}
