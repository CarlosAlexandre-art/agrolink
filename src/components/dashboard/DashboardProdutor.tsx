'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { SERVICOS } from '@/lib/constants'
import PwaPrompt from '@/components/PwaPrompt'
import Tour from '@/components/Tour'
import AgroCoreLogo from '@/components/AgroCoreLogo'

export default function DashboardProdutor({ user }: { user: any }) {
  const services = user.produtor?.services || []
  const [qtdPropostas, setQtdPropostas] = useState(0)

  const emAndamento = services.filter((s: any) =>
    ['PROCURANDO', 'AGUARDANDO_PROPOSTA', 'MATCH_ENCONTRADO', 'EM_ROTA', 'EXECUTANDO'].includes(s.status)
  )
  const concluidos = services.filter((s: any) => s.status === 'CONCLUIDO')

  // Buscar contagem de propostas pendentes
  useEffect(() => {
    fetch('/api/propostas')
      .then(r => r.json())
      .then(d => setQtdPropostas(Array.isArray(d) ? d.length : 0))
      .catch(() => {})
  }, [])

  function getStatusLabel(status: string) {
    const map: Record<string, { label: string; cor: string }> = {
      PROCURANDO:       { label: 'Procurando prestador...', cor: 'bg-yellow-100 text-yellow-700' },
      AGUARDANDO_PROPOSTA: { label: 'Proposta recebida!',   cor: 'bg-purple-100 text-purple-700' },
      MATCH_ENCONTRADO: { label: 'Prestador confirmado',    cor: 'bg-blue-100 text-blue-700' },
      EM_ROTA:          { label: 'Em rota',                 cor: 'bg-blue-100 text-blue-700' },
      EXECUTANDO:       { label: 'Executando',              cor: 'bg-orange-100 text-orange-700' },
      CONCLUIDO:        { label: 'Concluído ✓',             cor: 'bg-green-100 text-green-700' },
      CANCELADO:        { label: 'Cancelado',               cor: 'bg-red-100 text-red-600' },
    }
    return map[status] || { label: status, cor: 'bg-gray-100 text-gray-600' }
  }

  function getServicoLabel(tipo: string) {
    return SERVICOS.find(s => s.value === tipo) || { label: tipo, icon: '📋' }
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

        {/* Banner de propostas pendentes */}
        {qtdPropostas > 0 && (
          <Link
            href="/propostas"
            className="flex items-center justify-between bg-purple-600 text-white rounded-2xl px-5 py-4 shadow-lg hover:bg-purple-700 transition active:scale-95"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">💰</span>
              <div>
                <div className="font-bold text-lg">
                  {qtdPropostas} proposta{qtdPropostas > 1 ? 's' : ''} recebida{qtdPropostas > 1 ? 's' : ''}!
                </div>
                <div className="text-purple-200 text-sm">Clique para ver e escolher</div>
              </div>
            </div>
            <span className="text-2xl">→</span>
          </Link>
        )}

        {/* Botão principal */}
        <Link
          data-tour="solicitar"
          href="/solicitar"
          className="block w-full py-5 bg-green-700 text-white text-center font-bold text-xl rounded-2xl shadow-lg hover:bg-green-800 active:scale-95 transition"
        >
          🌾 SOLICITAR SERVIÇO
        </Link>

        {/* Em andamento */}
        {emAndamento.length > 0 && (
          <div data-tour="status">
            <h2 className="font-bold text-gray-700 mb-3">Serviços em andamento</h2>
            <div className="space-y-3">
              {emAndamento.map((s: any) => {
                const servico = getServicoLabel(s.tipo)
                const status = getStatusLabel(s.status)
                const propostasCount = s.matches?.filter((m: any) => m.status === 'ACEITO').length ?? 0
                return (
                  <Link
                    key={s.id}
                    href={s.status === 'PROCURANDO' && propostasCount > 0 ? '/propostas' : `/servico/${s.id}`}
                    className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-300 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-800">
                          {servico.icon} {servico.label}
                        </div>
                        {s.area && <div className="text-sm text-gray-500">{s.area} hectares</div>}
                        {s.status === 'PROCURANDO' && propostasCount > 0 && (
                          <div className="text-xs text-purple-600 font-medium mt-1">
                            💰 {propostasCount} proposta{propostasCount > 1 ? 's' : ''} aguardando sua escolha
                          </div>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.cor}`}>
                        {status.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-700">{concluidos.length}</div>
            <div className="text-xs text-gray-500 mt-1">Concluídos</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-700">{emAndamento.length}</div>
            <div className="text-xs text-gray-500 mt-1">Em andamento</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-700">
              {user.produtor?.avaliacao > 0 ? user.produtor.avaliacao.toFixed(1) : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-1">⭐ Sua nota</div>
          </div>
        </div>

        {services.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">🌾</div>
            <p className="text-lg">Nenhum serviço ainda.</p>
            <p className="text-sm">Clique em "Solicitar Serviço" para começar.</p>
          </div>
        )}

        {/* Crédito Rural */}
        <Link
          href="/credito"
          className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 hover:border-green-300 transition"
        >
          <span className="text-2xl">💳</span>
          <div className="flex-1">
            <div className="font-semibold text-gray-800">Crédito Rural</div>
            <div className="text-xs text-gray-400">Custeio, investimento, Pronaf e mais</div>
          </div>
          <span className="text-gray-300">→</span>
        </Link>

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
          <div className="grid grid-cols-2 gap-3">
            <a href="https://agro-rate.vercel.app/dashboard" target="_blank" rel="noopener noreferrer"
              className="flex flex-col gap-2 bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-2xl p-4 shadow-sm hover:opacity-90 transition">
              <div className="text-2xl">💳</div>
              <div>
                <div className="font-bold text-sm">AgroRate</div>
                <div className="text-xs text-green-200">Score de crédito rural</div>
              </div>
            </a>
            <a href="https://agroos.com.br/dashboard" target="_blank" rel="noopener noreferrer"
              className="flex flex-col gap-2 bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-2xl p-4 shadow-sm hover:opacity-90 transition">
              <div className="text-2xl">🌾</div>
              <div>
                <div className="font-bold text-sm">SmartAgroOS</div>
                <div className="text-xs text-slate-300">Gestão da fazenda</div>
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
