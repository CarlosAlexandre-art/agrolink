'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { SERVICOS } from '@/lib/constants'

export default function MatchPage() {
  const router = useRouter()
  const params = useParams()
  const matchId = params.id as string
  const [match, setMatch] = useState<any>(null)
  const [loading, setLoading] = useState<'ACEITAR' | 'RECUSAR' | null>(null)
  const [valorProposto, setValorProposto] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [sugestaoPreco, setSugestaoPreco] = useState<{ minimo: number; sugerido: number; maximo: number; justificativa: string } | null>(null)
  const [buscandoPreco, setBuscandoPreco] = useState(false)
  const [erroSugestao, setErroSugestao] = useState('')

  useEffect(() => {
    fetch(`/api/matches/${matchId}`)
      .then(r => r.json())
      .then(setMatch)
  }, [matchId])

  async function buscarSugestaoPreco() {
    if (!match) return
    setBuscandoPreco(true)
    setErroSugestao('')
    try {
      const res = await fetch('/api/ai/sugerir-preco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: match.service?.tipo,
          area: match.service?.area,
          urgencia: match.service?.urgencia,
          endereco: match.service?.endereco,
        }),
      })
      const data = await res.json()
      if (res.ok) setSugestaoPreco(data)
      else setErroSugestao(data.error || 'Erro ao consultar IA')
    } catch {
      setErroSugestao('Erro de rede ao consultar IA')
    } finally {
      setBuscandoPreco(false)
    }
  }

  async function handleAcao(acao: 'ACEITAR' | 'RECUSAR') {
    if (acao === 'ACEITAR' && (!valorProposto || parseFloat(valorProposto) <= 0)) {
      alert('Informe o valor que você cobra por este serviço.')
      return
    }
    setLoading(acao)
    const res = await fetch('/api/matches', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId,
        acao,
        valorProposto: acao === 'ACEITAR' ? parseFloat(valorProposto) : undefined,
        mensagemProposta: mensagem || undefined,
      })
    })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      const data = await res.json()
      alert(data.error || 'Erro ao processar ação.')
      setLoading(null)
    }
  }

  const servico = match ? (SERVICOS.find(s => s.value === match.service?.tipo) || { label: match.service?.tipo, icon: '📋' }) : null

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-3 animate-spin">⚙️</div>
          <p>Carregando chamado...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-white hover:text-green-200">← Voltar</Link>
          <h1 className="font-bold text-lg">🔔 Novo Chamado</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Serviço */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">{servico?.icon}</span>
            <div>
              <div className="font-bold text-gray-800 text-xl">{servico?.label}</div>
              <div className="text-sm text-gray-500">
                {match.service?.area && `${match.service.area} hectares · `}
                {match.distancia && `${match.distancia.toFixed(1)} km de você`}
              </div>
            </div>
          </div>
          <div className="space-y-0 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Urgência</span>
              <span className={`font-semibold ${
                match.service?.urgencia === 'ALTA' ? 'text-red-600' :
                match.service?.urgencia === 'MEDIA' ? 'text-yellow-600' : 'text-green-600'
              }`}>{match.service?.urgencia}</span>
            </div>
            {match.service?.endereco && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Local</span>
                <span className="font-medium text-gray-700 text-right max-w-[60%]">{match.service.endereco}</span>
              </div>
            )}
            {match.service?.descricao && (
              <div className="py-2">
                <span className="text-gray-500 block mb-1">Observações</span>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-2">{match.service.descricao}</p>
              </div>
            )}
          </div>
        </div>

        {/* Produtor */}
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

        {/* Proposta de valor */}
        {match.status === 'PENDENTE' && (
          <div className="bg-orange-50 rounded-2xl p-5 border border-orange-200">
            <h2 className="font-bold text-gray-800 mb-1">💰 Sua proposta de valor</h2>
            <p className="text-sm text-gray-500 mb-4">
              Informe quanto você cobra por este serviço. O produtor verá sua proposta e poderá aceitar ou buscar outro prestador.
            </p>

            {/* Sugestão de preço por IA */}
            <button
              type="button"
              onClick={buscarSugestaoPreco}
              disabled={buscandoPreco}
              className="w-full mb-4 py-2 text-sm font-medium text-green-700 border border-green-300 bg-green-50 rounded-xl hover:bg-green-100 transition disabled:opacity-50"
            >
              {buscandoPreco ? '🤖 Consultando IA...' : '🤖 Sugerir preço com IA'}
            </button>

            {erroSugestao && (
              <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erroSugestao}</p>
            )}

            {sugestaoPreco && (
              <div className="mb-4 p-3 bg-white border border-green-200 rounded-xl text-sm">
                <div className="font-semibold text-green-700 mb-2">💡 Sugestão da IA</div>
                <div className="grid grid-cols-3 gap-2 text-center mb-2">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-400">Mínimo</div>
                    <div className="font-bold text-gray-700">R$ {sugestaoPreco.minimo.toLocaleString('pt-BR')}</div>
                  </div>
                  <div className="bg-green-100 rounded-lg p-2">
                    <div className="text-xs text-green-600">Sugerido</div>
                    <div className="font-bold text-green-700">R$ {sugestaoPreco.sugerido.toLocaleString('pt-BR')}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-400">Máximo</div>
                    <div className="font-bold text-gray-700">R$ {sugestaoPreco.maximo.toLocaleString('pt-BR')}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{sugestaoPreco.justificativa}</p>
                <button
                  type="button"
                  onClick={() => setValorProposto(String(sugestaoPreco.sugerido))}
                  className="mt-2 text-xs text-green-700 font-semibold hover:underline"
                >
                  Usar valor sugerido →
                </button>
              </div>
            )}

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor total (R$) *</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-semibold">R$</span>
                <input
                  type="number"
                  value={valorProposto}
                  onChange={e => setValorProposto(e.target.value)}
                  placeholder="0,00"
                  min="1"
                  step="0.01"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white text-lg font-bold"
                />
              </div>
            </div>

            {valorProposto && parseFloat(valorProposto) > 0 && (
              <div className="text-xs text-gray-500 bg-white rounded-lg p-2 mb-3 border border-gray-100">
                Você recebe: <span className="font-bold text-green-700">
                  R$ {(parseFloat(valorProposto) * 0.95).toFixed(2)}
                </span>
                <span className="text-gray-400 ml-1">(após taxa de 5% da plataforma)</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem para o produtor (opcional)</label>
              <textarea
                value={mensagem}
                onChange={e => setMensagem(e.target.value)}
                rows={2}
                placeholder="Ex: Tenho experiência com esse tipo de serviço, uso equipamentos modernos..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm text-gray-900 bg-white"
              />
            </div>
          </div>
        )}

        {/* Ações */}
        {match.status === 'PENDENTE' ? (
          <div className="flex gap-3">
            <button
              onClick={() => handleAcao('RECUSAR')}
              disabled={!!loading}
              className="flex-1 py-4 bg-[#EF4444] text-white font-bold rounded-2xl hover:bg-red-600 active:scale-95 transition disabled:opacity-50 shadow-md"
            >
              {loading === 'RECUSAR' ? '...' : 'RECUSAR'}
            </button>
            <button
              onClick={() => handleAcao('ACEITAR')}
              disabled={!!loading || !valorProposto || parseFloat(valorProposto) <= 0}
              className="flex-2 py-4 bg-[#22C55E] text-white font-bold text-lg rounded-2xl hover:bg-green-500 active:scale-95 transition disabled:opacity-50 shadow-lg"
            >
              {loading === 'ACEITAR' ? 'Enviando proposta...' : 'ENVIAR PROPOSTA'}
            </button>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <div className="text-3xl mb-2">{match.status === 'ACEITO' ? '✅' : '❌'}</div>
            <p className="font-medium">
              {match.status === 'ACEITO' ? 'Proposta enviada — aguardando produtor' : 'Chamado encerrado'}
            </p>
            <Link href="/dashboard" className="mt-3 inline-block text-green-700 font-semibold hover:underline">
              Voltar ao início
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
