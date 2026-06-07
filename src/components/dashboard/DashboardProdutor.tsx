'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { SERVICOS } from '@/lib/constants'
import PwaPrompt from '@/components/PwaPrompt'
import Tour from '@/components/Tour'
import AgroCoreLogo from '@/components/AgroCoreLogo'
import ModoSimples from '@/components/ModoSimples'

export default function DashboardProdutor({ user }: { user: any }) {
  const services = user.produtor?.services || []
  const [qtdPropostas, setQtdPropostas] = useState(0)
  const [modoSimples, setModoSimples] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('agrocore_modo_simples') === '1'
  })

  const emAndamento = services.filter((s: any) =>
    ['PROCURANDO', 'AGUARDANDO_PROPOSTA', 'MATCH_ENCONTRADO', 'EM_ROTA', 'EXECUTANDO'].includes(s.status)
  )
  const concluidos = services.filter((s: any) => s.status === 'CONCLUIDO')

  useEffect(() => {
    fetch('/api/propostas')
      .then(r => r.json())
      .then(d => setQtdPropostas(Array.isArray(d) ? d.length : 0))
      .catch(() => {})
  }, [])

  function getStatusInfo(status: string): { label: string; cls: string } {
    const map: Record<string, { label: string; cls: string }> = {
      PROCURANDO:          { label: 'Procurando prestador…', cls: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
      AGUARDANDO_PROPOSTA: { label: 'Proposta recebida!',    cls: 'bg-purple-50 text-purple-700 border-purple-100' },
      MATCH_ENCONTRADO:    { label: 'Prestador confirmado',  cls: 'bg-blue-50 text-blue-600 border-blue-100' },
      EM_ROTA:             { label: 'Em rota 🚗',            cls: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
      EXECUTANDO:          { label: 'Executando',            cls: 'bg-orange-50 text-orange-600 border-orange-100' },
      CONCLUIDO:           { label: 'Concluído ✓',           cls: 'bg-green-50 text-green-700 border-green-100' },
      CANCELADO:           { label: 'Cancelado',             cls: 'bg-red-50 text-red-500 border-red-100' },
    }
    return map[status] || { label: status, cls: 'bg-gray-50 text-gray-500 border-gray-100' }
  }

  function getServicoLabel(tipo: string) {
    return SERVICOS.find(s => s.value === tipo) || { label: tipo, icon: '📋' }
  }

  const avaliacao = user.produtor?.avaliacao
  const temPropostas = qtdPropostas > 0

  function toggleModo() {
    const novo = !modoSimples
    setModoSimples(novo)
    localStorage.setItem('agrocore_modo_simples', novo ? '1' : '0')
  }

  if (modoSimples) return (
    <div>
      <ModoSimples tipo="PRODUTOR" nome={user.nome} />
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
      <header
        style={{ background: 'linear-gradient(135deg, #15803d 0%, #16a34a 60%, #22c55e 100%)' }}
        className="text-white px-4 pt-5 pb-14"
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-start mb-5">
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

          {/* CTA principal dentro do header */}
          <Link
            data-tour="solicitar"
            href="/solicitar"
            className="flex items-center justify-between bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl px-5 py-4 hover:bg-white/20 transition active:scale-95"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌾</span>
              <div>
                <div className="font-bold text-white text-base">Solicitar Serviço</div>
                <div className="text-green-100 text-xs">Encontre o melhor prestador para sua fazenda</div>
              </div>
            </div>
            <span className="bg-white text-green-700 text-xs font-bold px-3 py-1.5 rounded-xl shrink-0">
              Solicitar
            </span>
          </Link>
        </div>
      </header>

      {/* Cards métricas flutuantes */}
      <div className="max-w-2xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl px-3 py-3 shadow-md text-center border border-gray-100">
            <div className="text-xl font-bold text-purple-600">{qtdPropostas}</div>
            <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">Propostas<br/>recebidas</div>
          </div>
          <div className="bg-white rounded-2xl px-3 py-3 shadow-md text-center border border-gray-100">
            <div className="text-xl font-bold text-green-600">{emAndamento.length}</div>
            <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">Em<br/>andamento</div>
          </div>
          <div className="bg-white rounded-2xl px-3 py-3 shadow-md text-center border border-gray-100">
            <div className="text-xl font-bold text-green-700">
              {avaliacao > 0 ? avaliacao.toFixed(1) : concluidos.length}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">
              {avaliacao > 0 ? '⭐ Avaliação' : 'Concluídos'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Banner propostas */}
        {temPropostas && (
          <Link
            href="/propostas"
            className="flex items-center justify-between bg-purple-600 text-white rounded-2xl px-5 py-4 shadow-lg hover:bg-purple-700 transition active:scale-95"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <div className="font-bold">
                  {qtdPropostas} proposta{qtdPropostas > 1 ? 's' : ''} recebida{qtdPropostas > 1 ? 's' : ''}!
                </div>
                <div className="text-purple-200 text-xs">Clique para ver e escolher →</div>
              </div>
            </div>
            <span className="bg-white/20 rounded-xl px-3 py-1 text-sm font-bold">Ver</span>
          </Link>
        )}

        {/* Em andamento */}
        {emAndamento.length > 0 && (
          <div data-tour="status">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-gray-700">Serviços em andamento</span>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{emAndamento.length}</span>
            </div>
            <div className="space-y-2">
              {emAndamento.map((s: any) => {
                const servico = getServicoLabel(s.tipo)
                const stInfo  = getStatusInfo(s.status)
                const propostasCount = s.matches?.filter((m: any) => m.status === 'ACEITO').length ?? 0
                return (
                  <Link
                    key={s.id}
                    href={s.status === 'PROCURANDO' && propostasCount > 0 ? '/propostas' : `/servico/${s.id}`}
                    className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-300 transition"
                  >
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">
                        {servico.icon} {servico.label}
                      </div>
                      {s.area && <div className="text-xs text-gray-400 mt-0.5">{s.area} hectares</div>}
                      {s.status === 'PROCURANDO' && propostasCount > 0 && (
                        <div className="text-xs text-purple-600 font-medium mt-1">
                          💰 {propostasCount} proposta{propostasCount > 1 ? 's' : ''} aguardando
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ml-3 ${stInfo.cls}`}>
                      {stInfo.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {services.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">🌾</div>
            <p className="text-base font-medium text-gray-600">Nenhum serviço ainda.</p>
            <p className="text-sm text-gray-400 mt-1">Clique em "Solicitar Serviço" para começar.</p>
          </div>
        )}

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/credito"
            className="flex items-center gap-3 bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100 hover:border-green-300 transition"
          >
            <span className="text-xl">💳</span>
            <div>
              <div className="font-semibold text-gray-800 text-sm">Crédito Rural</div>
              <div className="text-[10px] text-gray-400">Custeio, Pronaf e mais</div>
            </div>
          </Link>
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
              <div className="font-bold text-base">Assine o Pro Produtor</div>
              <div className="text-xs text-green-200">R$89/mês · Até 5 serviços, urgência ALTA e mais</div>
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

      <BottomNav tipo="PRODUTOR" badgeCount={qtdPropostas} />
      <div className="h-16" />
      <PwaPrompt />
      <Tour tipo="PRODUTOR" />
    </div>
  )
}
