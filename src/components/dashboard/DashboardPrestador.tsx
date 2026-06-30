'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { SERVICOS } from '@/lib/constants'
import PwaPrompt from '@/components/PwaPrompt'
import Tour from '@/components/Tour'
import AgroCoreLogo from '@/components/AgroCoreLogo'
import ModoSimples from '@/components/ModoSimples'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

async function garantirSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    const reg = await navigator.serviceWorker.ready
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) return
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })
    const json = sub.toJSON()
    await fetch('/api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth }),
    })
  } catch {}
}

export default function DashboardPrestador({ user }: { user: any }) {
  const [disponivel, setDisponivel] = useState(user.prestador?.disponivel ?? true)
  const [loadingDisponivel, setLoadingDisponivel] = useState(false)
  const [qtdServicos, setQtdServicos] = useState(0)
  const [rota, setRota] = useState<any>(null)
  const [loadingRota, setLoadingRota] = useState(false)
  const [previsao, setPrevisao] = useState<any>(null)
  const [loadingPrevisao, setLoadingPrevisao] = useState(false)
  const [modoSimples, setModoSimples] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('agrocore_modo_simples') === '1'
  })

  function toggleModo() {
    const novo = !modoSimples
    setModoSimples(novo)
    localStorage.setItem('agrocore_modo_simples', novo ? '1' : '0')
  }

  useEffect(() => {
    garantirSubscription()
    fetch('/api/servicos-disponiveis')
      .then(r => r.json())
      .then(d => setQtdServicos(Array.isArray(d) ? d.length : 0))
      .catch(() => {})
  }, [])

  const matches = user.prestador?.matches || []
  const propostasEnviadas = matches.filter((m: any) =>
    m.status === 'ACEITO' && ['PROCURANDO', 'AGUARDANDO_PROPOSTA'].includes(m.service?.status)
  )
  const emAndamento = matches.filter((m: any) =>
    m.status === 'ACEITO' && ['MATCH_ENCONTRADO', 'EM_ROTA', 'EXECUTANDO'].includes(m.service?.status)
  )
  const pendentes = matches.filter((m: any) => m.status === 'PENDENTE')

  function getServicoLabel(tipo: string) {
    return SERVICOS.find(s => s.value === tipo) || { label: tipo, icon: '📋' }
  }

  async function otimizarRota() {
    setLoadingRota(true)
    setRota(null)
    try {
      const res = await fetch('/api/rota-otimizada')
      if (res.ok) setRota(await res.json())
    } finally {
      setLoadingRota(false)
    }
  }

  async function carregarPrevisao() {
    setLoadingPrevisao(true)
    setPrevisao(null)
    try {
      const res = await fetch('/api/ai/previsao-demanda')
      if (res.ok) setPrevisao(await res.json())
    } finally {
      setLoadingPrevisao(false)
    }
  }

  async function toggleDisponivel() {
    if (loadingDisponivel) return
    setLoadingDisponivel(true)
    const novo = !disponivel
    setDisponivel(novo)
    try {
      const res = await fetch('/api/prestador/disponibilidade', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponivel: novo }),
      })
      if (!res.ok) setDisponivel(!novo)
    } catch {
      setDisponivel(!novo)
    } finally {
      setLoadingDisponivel(false)
    }
  }

  const avaliacao = user.prestador?.avaliacao
  const totalAvaliacoes = user.prestador?.totalAvaliacoes || 0

  if (modoSimples) return (
    <div>
      <ModoSimples tipo="PRESTADOR" nome={user.nome} />
      <div className="fixed bottom-20 right-4 z-50">
        <button
          onClick={toggleModo}
          className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition"
        >
          ⚙️ Modo completo
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #15803d 0%, #16a34a 60%, #22c55e 100%)' }} className="text-white px-4 pt-5 pb-14">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <AgroCoreLogo size={26} />
              <div className="text-green-100 text-sm mt-1">Olá, {user.nome.split(' ')[0]}! 👋</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleModo}
                className="text-green-200 hover:text-white text-xs font-medium border border-green-400/40 rounded-full px-3 py-1 hover:bg-green-600/30 transition"
              >
                Modo simples
              </button>
              <Link href="/perfil" className="text-green-200 hover:text-white text-sm font-medium">
                Perfil →
              </Link>
            </div>
          </div>

          {/* Toggle disponibilidade no header */}
          <button
            data-tour="disponivel"
            onClick={toggleDisponivel}
            disabled={loadingDisponivel}
            className={`w-full flex items-center justify-between rounded-2xl px-4 py-3.5 border transition-all duration-300 active:scale-[0.98] ${
              disponivel
                ? 'bg-white/15 border-white/30 hover:bg-white/20'
                : 'bg-black/20 border-white/10 hover:bg-black/25'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Ponto de status animado */}
              <div className="relative flex-shrink-0 w-3 h-3">
                <div className={`w-3 h-3 rounded-full ${disponivel ? 'bg-green-400' : 'bg-white/40'}`} />
                {disponivel && (
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-60" />
                )}
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-sm leading-tight">
                  {disponivel ? 'Disponível' : 'Indisponível'}
                </div>
                <div className="text-white/70 text-xs mt-0.5">
                  {disponivel ? 'Recebendo chamados agora' : 'Oculto para novos chamados'}
                </div>
              </div>
            </div>

            {/* Toggle switch */}
            <div className={`relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0 ${
              disponivel ? 'bg-green-400 shadow-lg shadow-green-500/50' : 'bg-white/20'
            }`}>
              {loadingDisponivel ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
                  disponivel ? 'translate-x-7' : 'translate-x-0.5'
                }`}>
                  <span className={`text-[10px] font-black transition-colors ${disponivel ? 'text-green-600' : 'text-gray-400'}`}>
                    {disponivel ? '✓' : '✕'}
                  </span>
                </span>
              )}
            </div>
          </button>
        </div>
      </header>

      {/* Cards de métricas flutuantes */}
      <div className="max-w-2xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl px-3 py-3 shadow-md text-center border border-gray-100">
            <div className="text-xl font-bold text-yellow-500">{propostasEnviadas.length}</div>
            <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">Propostas<br/>enviadas</div>
          </div>
          <div className="bg-white rounded-2xl px-3 py-3 shadow-md text-center border border-gray-100">
            <div className="text-xl font-bold text-green-600">{emAndamento.length}</div>
            <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">Em<br/>andamento</div>
          </div>
          <div className="bg-white rounded-2xl px-3 py-3 shadow-md text-center border border-gray-100">
            <div className="text-xl font-bold text-green-700">
              {avaliacao ? avaliacao.toFixed(1) : '—'}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">⭐ {totalAvaliacoes} avali{totalAvaliacoes === 1 ? 'ação' : 'ações'}</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Banner: novos chamados disponíveis */}
        {qtdServicos > 0 && (
          <Link
            href="/servicos-disponiveis"
            className="flex items-center justify-between bg-green-700 text-white rounded-2xl px-5 py-4 shadow-lg hover:bg-green-800 transition active:scale-95"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <div className="font-bold">
                  {qtdServicos} chamado{qtdServicos > 1 ? 's' : ''} disponível{qtdServicos > 1 ? 'is' : ''}
                </div>
                <div className="text-green-200 text-xs">Ver e enviar proposta →</div>
              </div>
            </div>
            <span className="bg-white/20 rounded-xl px-3 py-1 text-sm font-bold">Ver</span>
          </Link>
        )}

        {/* Propostas enviadas */}
        {propostasEnviadas.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-gray-700">⏳ Propostas enviadas</span>
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">{propostasEnviadas.length}</span>
            </div>
            <div className="space-y-2">
              {propostasEnviadas.map((m: any) => {
                const servico = getServicoLabel(m.service.tipo)
                return (
                  <div key={m.id} className="bg-white rounded-xl border border-yellow-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-1 px-4 pt-3 pb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                        Aguardando produtor
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-4 pb-3">
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">{servico.icon} {servico.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Cliente: {m.service.produtor.user.nome}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-700">R$ {m.valorProposto?.toFixed(2)}</div>
                        <div className="text-[10px] text-gray-400">sua proposta</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Chamados sem proposta */}
        {pendentes.length > 0 && (
          <div data-tour="chamados">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700">🔔 Chamados recebidos</span>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendentes.length}</span>
              </div>
              <Link href="/servicos-disponiveis" className="text-xs text-green-700 font-medium">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-2">
              {pendentes.slice(0, 3).map((m: any) => {
                const servico = getServicoLabel(m.service.tipo)
                return (
                  <Link
                    key={m.id}
                    href={`/match/${m.id}`}
                    className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border-2 border-green-200 hover:border-green-400 transition active:scale-95"
                  >
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{servico.icon} {servico.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {m.service.area && `${m.service.area} ha · `}
                        {m.distancia ? `${m.distancia.toFixed(1)} km` : m.service.urgencia}
                      </div>
                    </div>
                    <span className="bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 ml-3">
                      Proposta →
                    </span>
                  </Link>
                )
              })}
              {pendentes.length > 3 && (
                <Link href="/servicos-disponiveis" className="block text-center text-sm text-green-700 font-medium py-2">
                  + {pendentes.length - 3} mais →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Em andamento */}
        {emAndamento.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-gray-700">✅ Em andamento</span>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{emAndamento.length}</span>
            </div>
            <div className="space-y-2">
              {emAndamento.map((m: any) => {
                const servico = getServicoLabel(m.service.tipo)
                const statusLabel: Record<string, { text: string; cls: string }> = {
                  MATCH_ENCONTRADO: { text: 'Confirmado', cls: 'bg-green-50 text-green-700 border-green-100' },
                  EM_ROTA:          { text: 'Em rota 🚗',  cls: 'bg-green-100 text-green-700 border-green-200' },
                  EXECUTANDO:       { text: 'Executando', cls: 'bg-orange-50 text-orange-600 border-orange-100' },
                }
                const st = statusLabel[m.service.status] ?? { text: m.service.status, cls: 'bg-gray-50 text-gray-500 border-gray-100' }
                return (
                  <Link
                    key={m.id}
                    href={`/servico/${m.service.id}`}
                    className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-300 transition"
                  >
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{servico.icon} {servico.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Cliente: {m.service.produtor.user.nome}</div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className="font-bold text-green-700 text-sm">R$ {m.valorProposto?.toFixed(2)}</div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${st.cls}`}>{st.text}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Rota do Dia */}
        {emAndamento.length >= 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div>
                <div className="font-bold text-gray-800 text-sm">🗺️ Rota do Dia</div>
                <div className="text-xs text-gray-400">Ordem otimizada para {emAndamento.length} visitas</div>
              </div>
              <button
                onClick={otimizarRota}
                disabled={loadingRota}
                className="text-xs font-bold bg-green-700 text-white px-3 py-1.5 rounded-xl hover:bg-green-800 transition disabled:opacity-50"
              >
                {loadingRota ? '⏳ Calculando...' : '⚡ Otimizar'}
              </button>
            </div>
            {rota && (
              <div className="px-5 py-3 space-y-2">
                <div className="flex gap-4 text-xs text-gray-500 pb-2 border-b border-gray-50">
                  <span>📍 {rota.otimizacao.paradas} paradas</span>
                  <span>🚗 {rota.totalKm} km</span>
                  <span>⏱️ ~{rota.totalMin} min</span>
                  {rota.otimizacao.reducaoPercent > 0 && (
                    <span className="text-green-600 font-semibold">↓ {rota.otimizacao.reducaoPercent}% menor</span>
                  )}
                </div>
                {rota.stops.map((stop: any) => (
                  <div key={stop.id} className="flex items-start gap-3 py-1">
                    <div className="w-6 h-6 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {stop.ordem}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{stop.label}</div>
                      {stop.endereco && <div className="text-xs text-gray-400 truncate">{stop.endereco}</div>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-semibold text-green-700">{stop.distanciaKm} km</div>
                      <div className="text-[10px] text-gray-400">{stop.tempoMin} min</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Previsão de Demanda */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div>
              <div className="font-bold text-gray-800 text-sm">📈 Previsão de Demanda</div>
              <div className="text-xs text-gray-400">Tendência de chamados na sua região</div>
            </div>
            <button
              onClick={carregarPrevisao}
              disabled={loadingPrevisao}
              className="text-xs font-bold bg-green-700 text-white px-3 py-1.5 rounded-xl hover:bg-green-800 transition disabled:opacity-50"
            >
              {loadingPrevisao ? '⏳ Analisando...' : '⚡ Analisar'}
            </button>
          </div>

          {!previsao && !loadingPrevisao && (
            <div className="px-5 py-4 text-sm text-gray-400">
              Clique em <span className="font-semibold text-green-600">Analisar</span> para ver quais serviços têm maior demanda nos próximos 30 dias.
            </div>
          )}

          {loadingPrevisao && (
            <div className="px-5 py-4 flex items-center gap-2 text-sm text-green-700">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Processando tendências dos últimos 6 meses...
            </div>
          )}

          {previsao && (
            <div className="px-5 py-4 space-y-4">
              <div className="space-y-2">
                {previsao.tendencias.slice(0, 4).map((t: any) => (
                  <div key={t.tipo} className="flex items-center gap-3 py-1.5">
                    <span className="text-xl w-6 text-center">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{t.label}</div>
                      <div className="text-xs text-gray-400">{t.lastMonth} chamados/mês</div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      t.tendencia === 'crescendo' ? 'bg-green-100 text-green-700' :
                      t.tendencia === 'caindo'    ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {t.tendencia === 'crescendo' ? '⬆' : t.tendencia === 'caindo' ? '⬇' : '→'} {t.proj30}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                <div className="text-xs font-semibold text-green-700 mb-1 uppercase tracking-wide">Insight IA</div>
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{previsao.insightIA}</p>
              </div>
              <p className="text-[10px] text-gray-300 text-right">{previsao.raioKm} km · {previsao.totalServicos} serviços · {previsao.modelo}</p>
            </div>
          )}
        </div>

        {/* Estado vazio */}
        {qtdServicos === 0 && pendentes.length === 0 && emAndamento.length === 0 && propostasEnviadas.length === 0 && (
          <div className="text-center py-10 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-5xl mb-3">🔧</div>
            <p className="text-base font-medium text-gray-600">Nenhum chamado no momento.</p>
            <p className="text-sm mt-1">Fique disponível para receber novos pedidos.</p>
          </div>
        )}

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/relatorio"
            className="flex items-center gap-3 bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100 hover:border-green-300 transition"
          >
            <span className="text-xl">📊</span>
            <div>
              <div className="font-semibold text-gray-800 text-sm">Relatório IA</div>
              <div className="text-[10px] text-gray-400">Últimos 30 dias</div>
            </div>
          </Link>
          <Link
            href="/ganhos"
            className="flex items-center gap-3 bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100 hover:border-green-300 transition"
          >
            <span className="text-xl">💰</span>
            <div>
              <div className="font-semibold text-gray-800 text-sm">Meus Ganhos</div>
              <div className="text-[10px] text-gray-400">Histórico e saldo</div>
            </div>
          </Link>
        </div>

        {/* Assinatura */}
        {user.plan === 'free' || !user.plan ? (
          <Link
            href="/planos"
            style={{ background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)' }}
            className="flex items-center gap-4 text-white rounded-2xl px-5 py-4 shadow-sm hover:opacity-90 transition active:scale-95"
          >
            <span className="text-2xl">⭐</span>
            <div className="flex-1">
              <div className="font-bold text-base">Assine o Pro Prestador</div>
              <div className="text-xs text-green-200">R$79/mês · Destaque na busca, banner e mais oportunidades</div>
            </div>
            <span className="text-green-200 text-lg">→</span>
          </Link>
        ) : (
          <Link
            href="/planos"
            className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm hover:border-green-300 transition"
          >
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <div className="font-bold text-gray-800">Plano Pro ativo</div>
              <div className="text-xs text-gray-400">Gerenciar assinatura</div>
            </div>
            <span className="text-gray-300">→</span>
          </Link>
        )}

        {/* Ecossistema */}
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ecossistema</div>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://agrorate.app/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-2 text-white rounded-2xl p-4 shadow-sm hover:opacity-90 transition"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #16a34a 100%)' }}
            >
              <div className="text-2xl">💳</div>
              <div>
                <div className="font-bold text-sm">AgroRate</div>
                <div className="text-xs text-green-200">Score de crédito rural</div>
              </div>
            </a>
            <a
              href="https://agroos.site/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-2 text-white rounded-2xl p-4 shadow-sm hover:opacity-90 transition"
              style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)' }}
            >
              <div className="text-2xl">🌾</div>
              <div>
                <div className="font-bold text-sm">SmartAgroOS</div>
                <div className="text-xs text-blue-200">Gestão da fazenda</div>
              </div>
            </a>
          </div>
        </div>

      </div>

      <BottomNav tipo="PRESTADOR" badgeCount={qtdServicos} />
      <div className="h-16" />
      <PwaPrompt />
      <Tour tipo="PRESTADOR" />
    </div>
  )
}
