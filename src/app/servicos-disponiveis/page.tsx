'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    fetch('/api/servicos-disponiveis').then(r => r.json()).then(d => {
      setMatches(Array.isArray(d) ? d : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-green-200 hover:text-white">←</Link>
          <div>
            <div className="font-bold text-lg">🔔 Serviços disponíveis</div>
            <div className="text-xs text-green-200">Pedidos na sua região aguardando proposta</div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {loading && <div className="text-center py-12 text-gray-400 animate-pulse">Carregando...</div>}

        {!loading && matches.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🌾</div>
            <p className="text-lg font-medium">Nenhum serviço disponível agora.</p>
            <p className="text-sm mt-1">Deixe-se disponível para ser notificado de novos pedidos.</p>
          </div>
        )}

        {matches.map((m: any) => {
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

          return (
            <Link
              key={m.id}
              href={`/match/${m.id}`}
              className={`block bg-white rounded-2xl p-5 shadow-sm border-2 transition hover:shadow-md active:scale-[0.99] ${
                isUrgente ? 'border-red-300 hover:border-red-400' : 'border-green-100 hover:border-green-400'
              }`}
            >
              {/* Cabeçalho */}
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

              {/* Badges do produtor */}
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {badges.map(b => <BadgeChip key={b.key} badge={b} size="xs" />)}
                </div>
              )}

              {/* Rating do produtor */}
              {(produtor.totalAvaliacoes ?? 0) > 0 && (
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <span className="text-yellow-500">{'★'.repeat(Math.round(produtor.avaliacao))}</span>
                  <span className="font-medium text-gray-700">{produtor.avaliacao.toFixed(1)}</span>
                  <span>· {produtor.totalAvaliacoes} avaliações · {totalConcluidos} serviços concluídos</span>
                </div>
              )}

              {/* Detalhes */}
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
                    : 'Nenhuma proposta ainda — seja o primeiro!'}
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
