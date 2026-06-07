'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { SERVICOS } from '@/lib/constants'
import { getBadgesProdutor } from '@/lib/badges'
import BadgeChip from '@/components/BadgeChip'
import BottomNav from '@/components/BottomNav'

const URGENCIA_COR: Record<string, string> = {
  ALTA:  'bg-red-100 text-red-700',
  MEDIA: 'bg-yellow-100 text-yellow-700',
  BAIXA: 'bg-green-100 text-green-700',
}

export default function ServicosDisponiveisPage() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [filtroUrgencia, setFiltroUrgencia] = useState('TODOS')
  const [filtroOrdem, setFiltroOrdem] = useState<'distancia' | 'urgencia' | 'propostas'>('urgencia')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    fetch('/api/servicos-disponiveis').then(r => r.json()).then(d => {
      setMatches(Array.isArray(d) ? d : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const tiposDisponiveis = useMemo(() => {
    const tipos = [...new Set(matches.map((m: any) => m.service.tipo))]
    return tipos
  }, [matches])

  const filtrados = useMemo(() => {
    let list = [...matches]

    if (filtroTipo !== 'TODOS') list = list.filter(m => m.service.tipo === filtroTipo)
    if (filtroUrgencia !== 'TODOS') list = list.filter(m => m.service.urgencia === filtroUrgencia)
    if (busca.trim()) {
      const b = busca.toLowerCase()
      list = list.filter(m =>
        m.service.tipo.toLowerCase().includes(b) ||
        m.service.produtor?.user?.nome?.toLowerCase().includes(b) ||
        m.service.endereco?.toLowerCase().includes(b) ||
        m.service.descricao?.toLowerCase().includes(b)
      )
    }

    list.sort((a, b) => {
      if (filtroOrdem === 'distancia') return (a.distancia ?? 999) - (b.distancia ?? 999)
      if (filtroOrdem === 'propostas') return (a.service._count?.matches ?? 0) - (b.service._count?.matches ?? 0)
      // urgencia: ALTA primeiro
      const ord = { ALTA: 0, MEDIA: 1, BAIXA: 2 }
      return (ord[a.service.urgencia as keyof typeof ord] ?? 1) - (ord[b.service.urgencia as keyof typeof ord] ?? 1)
    })

    return list
  }, [matches, filtroTipo, filtroUrgencia, filtroOrdem, busca])

  const urgentes = matches.filter(m => m.service.urgencia === 'ALTA').length
  const semProposta = matches.filter(m => (m.service._count?.matches ?? 0) === 0).length

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-green-700 text-white px-4 pt-5 pb-14">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/dashboard" className="text-green-200 hover:text-white">←</Link>
            <div>
              <div className="font-black text-xl">Central de Oportunidades</div>
              <div className="text-xs text-green-200">Serviços na sua região aguardando proposta</div>
            </div>
          </div>

          {/* Métricas rápidas */}
          {!loading && matches.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-black">{matches.length}</div>
                <div className="text-xs text-green-200">disponíveis</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-red-300">{urgentes}</div>
                <div className="text-xs text-green-200">urgentes</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-yellow-300">{semProposta}</div>
                <div className="text-xs text-green-200">sem proposta</div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 -mt-8 space-y-4">

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          {/* Busca */}
          <input
            type="text"
            placeholder="🔍 Buscar por serviço, produtor ou cidade..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          />

          <div className="flex gap-2 flex-wrap">
            {/* Filtro tipo */}
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              className="flex-1 min-w-0 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="TODOS">Todos os serviços</option>
              {tiposDisponiveis.map(t => {
                const s = SERVICOS.find(sv => sv.value === t)
                return <option key={t} value={t}>{s?.icon} {s?.label ?? t}</option>
              })}
            </select>

            {/* Filtro urgência */}
            <select
              value={filtroUrgencia}
              onChange={e => setFiltroUrgencia(e.target.value)}
              className="text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="TODOS">Toda urgência</option>
              <option value="ALTA">🔴 Urgente</option>
              <option value="MEDIA">🟡 Média</option>
              <option value="BAIXA">🟢 Baixa</option>
            </select>

            {/* Ordenação */}
            <select
              value={filtroOrdem}
              onChange={e => setFiltroOrdem(e.target.value as any)}
              className="text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="urgencia">Mais urgentes</option>
              <option value="distancia">Mais próximos</option>
              <option value="propostas">Menos concorrência</option>
            </select>
          </div>

          {filtrados.length !== matches.length && (
            <div className="text-xs text-gray-400 text-center">
              {filtrados.length} de {matches.length} oportunidade{matches.length !== 1 ? 's' : ''}
              <button onClick={() => { setFiltroTipo('TODOS'); setFiltroUrgencia('TODOS'); setBusca('') }} className="ml-2 text-green-600 hover:underline">
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {loading && <div className="text-center py-12 text-gray-400 animate-pulse">Carregando oportunidades...</div>}

        {!loading && filtrados.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🌾</div>
            <p className="text-lg font-medium">Nenhuma oportunidade encontrada.</p>
            <p className="text-sm mt-1">
              {matches.length > 0 ? 'Tente outros filtros.' : 'Deixe-se disponível para ser notificado de novos pedidos.'}
            </p>
          </div>
        )}

        {filtrados.map((m: any) => {
          const service = m.service
          const servico = SERVICOS.find(s => s.value === service.tipo)
          const propostasCount = service._count?.matches ?? 0
          const produtor = service.produtor
          const totalConcluidos = produtor._count?.services ?? 0
          const badges = getBadgesProdutor({
            avaliacao: produtor.avaliacao ?? 0,
            totalAvaliacoes: produtor.totalAvaliacoes ?? 0,
            totalConcluidos,
          })
          const isUrgente = service.urgencia === 'ALTA'
          const semCompetidor = propostasCount === 0

          return (
            <Link
              key={m.id}
              href={`/match/${m.id}`}
              className={`block bg-white rounded-2xl p-5 shadow-sm border-2 transition hover:shadow-md active:scale-[0.99] ${
                isUrgente ? 'border-red-300 hover:border-red-400' : 'border-green-100 hover:border-green-400'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-gray-800 text-lg">
                    {servico?.icon ?? '📋'} {servico?.label ?? service.tipo}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm text-gray-500">por {produtor.user.nome}</span>
                    {produtor.user.cidade && (
                      <span className="text-xs text-gray-400">· {produtor.user.cidade}</span>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${URGENCIA_COR[service.urgencia] ?? 'bg-gray-100 text-gray-600'}`}>
                  {service.urgencia === 'ALTA' ? '🔴 Urgente' : service.urgencia === 'MEDIA' ? '🟡 Média' : '🟢 Baixa'}
                </span>
              </div>

              {semCompetidor && (
                <div className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full px-2.5 py-1 font-semibold mb-2">
                  ⚡ Sem propostas ainda — seja o primeiro!
                </div>
              )}

              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {badges.map(b => <BadgeChip key={b.key} badge={b} size="xs" />)}
                </div>
              )}

              {(produtor.totalAvaliacoes ?? 0) > 0 && (
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <span className="text-yellow-500">{'★'.repeat(Math.round(produtor.avaliacao))}</span>
                  <span className="font-medium text-gray-700">{produtor.avaliacao.toFixed(1)}</span>
                  <span>· {produtor.totalAvaliacoes} avaliações · {totalConcluidos} serviços</span>
                </div>
              )}

              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                {service.area && <span>📐 {service.area} ha</span>}
                {m.distancia && <span>📍 {m.distancia.toFixed(1)} km</span>}
                {service.endereco && <span>📍 {service.endereco}</span>}
              </div>

              {service.descricao && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2 mb-3 line-clamp-2">
                  {service.descricao}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  {propostasCount > 0
                    ? `${propostasCount} proposta${propostasCount > 1 ? 's' : ''} enviada${propostasCount > 1 ? 's' : ''}`
                    : 'Nenhuma proposta ainda'}
                </div>
                <span className={`px-4 py-2 text-white text-sm font-bold rounded-xl ${isUrgente ? 'bg-red-600' : 'bg-green-700'}`}>
                  Enviar proposta →
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      <BottomNav tipo="PRESTADOR" />
    </div>
  )
}
