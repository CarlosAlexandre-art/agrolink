'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SERVICOS } from '@/lib/constants'
import PwaPrompt from '@/components/PwaPrompt'
import Tour from '@/components/Tour'

export default function DashboardPrestador({ user }: { user: any }) {
  const [disponivel, setDisponivel] = useState(user.prestador?.disponivel ?? true)
  const matches = user.prestador?.matches || []
  const pendentes = matches.filter((m: any) => m.status === 'PENDENTE')
  const aceitos = matches.filter((m: any) => m.status === 'ACEITO')

  function getServicoLabel(tipo: string) {
    return SERVICOS.find(s => s.value === tipo) || { label: tipo, icon: '📋' }
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
      {/* Header */}
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <div className="font-bold text-lg">🌿 AgroCore</div>
            <div className="text-green-200 text-sm">Olá, {user.nome.split(' ')[0]}!</div>
          </div>
          <Link href="/perfil" className="text-green-200 hover:text-white text-sm">
            Perfil →
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

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

        {/* Chamados pendentes */}
        {pendentes.length > 0 && (
          <div data-tour="chamados">
            <h2 className="font-bold text-gray-700 mb-3">
              🔔 Chamados disponíveis ({pendentes.length})
            </h2>
            <div className="space-y-3">
              {pendentes.map((m: any) => {
                const servico = getServicoLabel(m.service.tipo)
                return (
                  <Link
                    key={m.id}
                    href={`/match/${m.id}`}
                    className="block bg-white rounded-xl p-4 shadow-sm border-2 border-green-200 hover:border-green-400 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-800 text-lg">
                          {servico.icon} {servico.label}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {m.service.area && `${m.service.area} hectares · `}
                          {m.distancia && `${m.distancia.toFixed(1)} km de distância`}
                        </div>
                        <div className="text-sm text-gray-500">
                          Urgência: {m.service.urgencia}
                        </div>
                      </div>
                      {m.service.precoEstimado && (
                        <div className="text-right">
                          <div className="font-bold text-green-700 text-xl">
                            R$ {m.service.precoEstimado.toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-400">estimado</div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <span className="flex-1 py-2 bg-[#22C55E] text-white text-center rounded-lg font-bold text-sm">
                        ACEITAR
                      </span>
                      <span className="flex-1 py-2 bg-[#EF4444] text-white text-center rounded-lg font-bold text-sm">
                        RECUSAR
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Em andamento */}
        {aceitos.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-700 mb-3">Serviços em andamento</h2>
            <div className="space-y-3">
              {aceitos.map((m: any) => {
                const servico = getServicoLabel(m.service.tipo)
                return (
                  <Link
                    key={m.id}
                    href={`/servico/${m.service.id}`}
                    className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-300 transition"
                  >
                    <div className="font-semibold text-gray-800">
                      {servico.icon} {servico.label}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Cliente: {m.service.produtor.user.nome}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Resumo ganhos */}
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

        {pendentes.length === 0 && aceitos.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">🔧</div>
            <p className="text-lg">Nenhum chamado no momento.</p>
            <p className="text-sm">Fique disponível para receber serviços.</p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
        <Link href="/dashboard" className="flex-1 py-3 text-center text-green-700 font-semibold text-xs">
          <div className="text-xl">🏠</div>Home
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
