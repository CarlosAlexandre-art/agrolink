'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SERVICOS } from '@/lib/constants'
import PwaPrompt from '@/components/PwaPrompt'
import Tour from '@/components/Tour'
import AgroCoreLogo from '@/components/AgroCoreLogo'

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
  const [qtdServicos, setQtdServicos] = useState(0)
  const [rota, setRota] = useState<any>(null)
  const [loadingRota, setLoadingRota] = useState(false)

  useEffect(() => {
    garantirSubscription()
    // Contar serviços disponíveis
    fetch('/api/servicos-disponiveis')
      .then(r => r.json())
      .then(d => setQtdServicos(Array.isArray(d) ? d.length : 0))
      .catch(() => {})
  }, [])

  const matches = user.prestador?.matches || []
  // Propostas enviadas aguardando produtor aceitar
  const propostasEnviadas = matches.filter((m: any) =>
    m.status === 'ACEITO' && ['PROCURANDO', 'AGUARDANDO_PROPOSTA'].includes(m.service?.status)
  )
  // Serviços em andamento (produtor aceitou a proposta)
  const emAndamento = matches.filter((m: any) =>
    m.status === 'ACEITO' && ['MATCH_ENCONTRADO', 'EM_ROTA', 'EXECUTANDO'].includes(m.service?.status)
  )
  // Pendentes sem proposta enviada
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

  async function toggleDisponivel() {
    const novo = !disponivel
    setDisponivel(novo)
    await fetch('/api/prestador/disponibilidade', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponivel: novo })
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <AgroCoreLogo size={28} />
            <div className="text-green-200 text-sm">Olá, {user.nome.split(' ')[0]}!</div>
          </div>
          <Link href="/perfil" className="text-green-200 hover:text-white text-sm">Perfil →</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Banner serviços disponíveis */}
        {qtdServicos > 0 && (
          <Link
            href="/servicos-disponiveis"
            className="flex items-center justify-between bg-green-700 text-white rounded-2xl px-5 py-4 shadow-lg hover:bg-green-800 transition active:scale-95"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔔</span>
              <div>
                <div className="font-bold text-lg">
                  {qtdServicos} serviço{qtdServicos > 1 ? 's' : ''} disponível{qtdServicos > 1 ? 'is' : ''}!
                </div>
                <div className="text-green-200 text-sm">Clique para ver e enviar proposta</div>
              </div>
            </div>
            <span className="text-2xl">→</span>
          </Link>
        )}

        {/* Toggle disponibilidade */}
        <div data-tour="disponivel" className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="font-bold text-gray-800 text-lg">Status</div>
            <div className={`text-sm font-medium ${disponivel ? 'text-green-600' : 'text-gray-400'}`}>
              {disponivel ? '🟢 Disponível para serviços' : '⚫ Indisponível'}
            </div>
          </div>
          <button
            onClick={toggleDisponivel}
            className={`relative w-14 h-7 rounded-full transition-colors ${disponivel ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${disponivel ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Propostas enviadas aguardando produtor */}
        {propostasEnviadas.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-700 mb-3">⏳ Propostas enviadas ({propostasEnviadas.length})</h2>
            <div className="space-y-3">
              {propostasEnviadas.map((m: any) => {
                const servico = getServicoLabel(m.service.tipo)
                return (
                  <div key={m.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-800">{servico.icon} {servico.label}</div>
                        <div className="text-sm text-gray-500">Cliente: {m.service.produtor.user.nome}</div>
                        <div className="text-xs text-yellow-700 mt-1">Aguardando o produtor escolher a proposta</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-700">R$ {m.valorProposto?.toFixed(2)}</div>
                        <div className="text-xs text-gray-400">sua proposta</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Chamados pendentes (sem proposta enviada) */}
        {pendentes.length > 0 && (
          <div data-tour="chamados">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-700">🔔 Chamados ({pendentes.length})</h2>
              <Link href="/servicos-disponiveis" className="text-xs text-green-700 font-medium hover:underline">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-3">
              {pendentes.slice(0, 3).map((m: any) => {
                const servico = getServicoLabel(m.service.tipo)
                return (
                  <Link
                    key={m.id}
                    href={`/match/${m.id}`}
                    className="block bg-white rounded-xl p-4 shadow-sm border-2 border-green-200 hover:border-green-400 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-800">{servico.icon} {servico.label}</div>
                        <div className="text-sm text-gray-500">
                          {m.service.area && `${m.service.area} ha · `}
                          {m.distancia ? `${m.distancia.toFixed(1)} km` : m.service.urgencia}
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded-xl">
                        Enviar proposta →
                      </span>
                    </div>
                  </Link>
                )
              })}
              {pendentes.length > 3 && (
                <Link href="/servicos-disponiveis" className="block text-center text-sm text-green-700 font-medium py-2">
                  + {pendentes.length - 3} mais disponíveis →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Em andamento */}
        {emAndamento.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-700 mb-3">✅ Em andamento ({emAndamento.length})</h2>
            <div className="space-y-3">
              {emAndamento.map((m: any) => {
                const servico = getServicoLabel(m.service.tipo)
                return (
                  <Link
                    key={m.id}
                    href={`/servico/${m.service.id}`}
                    className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-300 transition"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold text-gray-800">{servico.icon} {servico.label}</div>
                        <div className="text-sm text-gray-500">Cliente: {m.service.produtor.user.nome}</div>
                      </div>
                      <div className="font-bold text-green-700 text-sm">R$ {m.valorProposto?.toFixed(2)}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Rota do Dia — aparece quando há 2+ serviços em andamento */}
        {emAndamento.length >= 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div>
                <div className="font-bold text-gray-800">🗺️ Rota do Dia</div>
                <div className="text-xs text-gray-400">Ordem otimizada para {emAndamento.length} visitas</div>
              </div>
              <button
                onClick={otimizarRota}
                disabled={loadingRota}
                className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loadingRota ? '⏳ Calculando...' : '⚡ Otimizar'}
              </button>
            </div>
            {rota && (
              <div className="px-5 py-3 space-y-2">
                <div className="flex gap-4 text-xs text-gray-500 pb-2 border-b border-gray-50">
                  <span>📍 {rota.otimizacao.paradas} paradas</span>
                  <span>🚗 {rota.totalKm} km total</span>
                  <span>⏱️ ~{rota.totalMin} min</span>
                  {rota.otimizacao.reducaoPercent > 0 && (
                    <span className="text-green-600 font-semibold">↓ {rota.otimizacao.reducaoPercent}% menor</span>
                  )}
                </div>
                {rota.stops.map((stop: any) => (
                  <div key={stop.id} className="flex items-start gap-3 py-1">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {stop.ordem}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{stop.label}</div>
                      {stop.endereco && <div className="text-xs text-gray-400 truncate">{stop.endereco}</div>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-semibold text-blue-600">{stop.distanciaKm} km</div>
                      <div className="text-[10px] text-gray-400">{stop.tempoMin} min</div>
                    </div>
                  </div>
                ))}
                <div className="text-[10px] text-gray-300 text-center pt-1">{rota.otimizacao.algoritmo}</div>
              </div>
            )}
          </div>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-700">{user.prestador?.avaliacao?.toFixed(1) || '—'}</div>
            <div className="text-sm text-gray-500 mt-1">⭐ Avaliação</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-700">{user.prestador?.totalAvaliacoes || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Serviços feitos</div>
          </div>
        </div>

        {qtdServicos === 0 && pendentes.length === 0 && emAndamento.length === 0 && propostasEnviadas.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">🔧</div>
            <p className="text-lg">Nenhum chamado no momento.</p>
            <p className="text-sm">Fique disponível para receber novos pedidos.</p>
          </div>
        )}

        {/* Relatório IA */}
        <Link
          href="/relatorio"
          className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 hover:border-green-300 transition"
        >
          <span className="text-2xl">📊</span>
          <div className="flex-1">
            <div className="font-semibold text-gray-800">Relatório Mensal IA</div>
            <div className="text-xs text-gray-400">Análise inteligente dos seus últimos 30 dias</div>
          </div>
          <span className="text-gray-300">→</span>
        </Link>

        {/* Assinatura */}
        {user.plan === 'free' || !user.plan ? (
          <Link
            href="/planos"
            className="flex items-center gap-4 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-2xl px-5 py-4 shadow-sm hover:opacity-90 transition active:scale-95"
          >
            <span className="text-3xl">⭐</span>
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
            <span className="text-3xl">✅</span>
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
          <a href="https://agro-rate.vercel.app/dashboard" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-2xl px-5 py-4 shadow-sm hover:opacity-90 transition">
            <div className="text-3xl">💳</div>
            <div>
              <div className="font-bold">AgroRate</div>
              <div className="text-xs text-green-200">Consulte seu score de crédito rural e acesse linhas de financiamento</div>
            </div>
            <span className="ml-auto text-green-200">→</span>
          </a>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
        <Link href="/dashboard" className="flex-1 py-3 text-center text-green-700 font-semibold text-xs">
          <div className="text-xl">🏠</div>Home
        </Link>
        <Link href="/servicos-disponiveis" className="flex-1 py-3 text-center text-gray-500 text-xs relative">
          <div className="text-xl">🔔</div>Pedidos
          {qtdServicos > 0 && (
            <span className="absolute top-2 right-4 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
              {qtdServicos > 9 ? '9+' : qtdServicos}
            </span>
          )}
        </Link>
        <Link href="/historico" className="flex-1 py-3 text-center text-gray-500 text-xs">
          <div className="text-xl">📋</div>Histórico
        </Link>
        <Link data-tour="nav-ganhos" href="/ganhos" className="flex-1 py-3 text-center text-gray-500 text-xs">
          <div className="text-xl">💰</div>Ganhos
        </Link>
        <Link data-tour="nav-perfil" href="/perfil" className="flex-1 py-3 text-center text-gray-500 text-xs">
          <div className="text-xl">👤</div>Perfil
        </Link>
      </nav>
      <div className="h-16" />
      <PwaPrompt />
      <Tour tipo="PRESTADOR" />
    </div>
  )
}
