'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { SERVICOS } from '@/lib/constants'

// This page loads match data server-side via a fetch to make it simpler as a client component
// In production, consider making it a server component
export default function MatchPage() {
  const router = useRouter()
  const params = useParams()
  const matchId = params.id as string
  const [loading, setLoading] = useState<'ACEITAR' | 'RECUSAR' | null>(null)

  async function handleAcao(acao: 'ACEITAR' | 'RECUSAR') {
    setLoading(acao)
    const res = await fetch('/api/matches', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, acao })
    })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      alert('Erro ao processar ação. Tente novamente.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-white hover:text-green-200">← Voltar</Link>
          <h1 className="font-bold text-lg">Novo Chamado</h1>
        </div>
      </header>

      <MatchDetail matchId={matchId} onAceitar={() => handleAcao('ACEITAR')} onRecusar={() => handleAcao('RECUSAR')} loading={loading} />
    </div>
  )
}

function MatchDetail({
  matchId,
  onAceitar,
  onRecusar,
  loading
}: {
  matchId: string
  onAceitar: () => void
  onRecusar: () => void
  loading: 'ACEITAR' | 'RECUSAR' | null
}) {
  const [match, setMatch] = useState<any>(null)
  const [fetched, setFetched] = useState(false)

  if (!fetched) {
    setFetched(true)
    fetch(`/api/matches/${matchId}`)
      .then(r => r.json())
      .then(data => setMatch(data))
      .catch(() => setMatch(null))
  }

  if (!match) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-400">
        <div className="text-4xl animate-spin mb-4">⚙️</div>
        <p>Carregando chamado...</p>
      </div>
    )
  }

  const servico = SERVICOS.find(s => s.value === match.service?.tipo) || { label: match.service?.tipo, icon: '📋' }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

      {/* Service info */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">{servico.icon}</span>
          <div>
            <div className="font-bold text-gray-800 text-xl">{servico.label}</div>
            <div className="text-sm text-gray-500">
              {match.service?.area && `${match.service.area} hectares · `}
              {match.distancia && `${match.distancia.toFixed(1)} km de você`}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Urgência</span>
            <span className={`font-semibold ${
              match.service?.urgencia === 'ALTA' ? 'text-red-600' :
              match.service?.urgencia === 'MEDIA' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {match.service?.urgencia}
            </span>
          </div>
          {match.service?.endereco && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Local</span>
              <span className="font-medium text-gray-700 text-right max-w-[60%]">{match.service.endereco}</span>
            </div>
          )}
          {match.service?.descricao && (
            <div className="py-2">
              <span className="text-gray-500">Observações</span>
              <p className="mt-1 text-gray-700">{match.service.descricao}</p>
            </div>
          )}
        </div>
      </div>

      {/* Produtor info */}
      {match.service?.produtor && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">Produtor</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700">
              {match.service.produtor.user.nome[0]}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{match.service.produtor.user.nome}</div>
              {match.service.produtor.nomeFazenda && (
                <div className="text-sm text-gray-500">{match.service.produtor.nomeFazenda}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Estimated price */}
      {match.service?.precoEstimado && (
        <div className="bg-green-50 rounded-2xl p-5 text-center border border-green-200">
          <div className="text-sm text-gray-600 mb-1">Valor estimado</div>
          <div className="text-3xl font-bold text-green-700">
            R$ {match.service.precoEstimado.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Você recebe 85% após conclusão</div>
        </div>
      )}

      {/* Actions */}
      {match.status === 'PENDENTE' ? (
        <div className="flex gap-3">
          <button
            onClick={onRecusar}
            disabled={!!loading}
            className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading === 'RECUSAR' ? '...' : 'RECUSAR'}
          </button>
          <button
            onClick={onAceitar}
            disabled={!!loading}
            className="flex-[2] py-4 bg-green-700 text-white font-bold text-lg rounded-2xl hover:bg-green-800 active:scale-95 transition disabled:opacity-50 shadow-lg"
          >
            {loading === 'ACEITAR' ? 'Aceitando...' : '✅ ACEITAR'}
          </button>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <div className="text-3xl mb-2">{match.status === 'ACEITO' ? '✅' : '❌'}</div>
          <p className="font-medium">
            {match.status === 'ACEITO' ? 'Chamado aceito' : 'Chamado encerrado'}
          </p>
          <Link href="/dashboard" className="mt-3 inline-block text-green-700 font-semibold hover:underline">
            Voltar ao início
          </Link>
        </div>
      )}
    </div>
  )
}
