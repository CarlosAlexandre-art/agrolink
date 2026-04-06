'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SERVICOS } from '@/lib/constants'

const STATUS_STEPS = [
  { key: 'PROCURANDO', label: 'Procurando prestador', icon: '🔍' },
  { key: 'MATCH_ENCONTRADO', label: 'Prestador encontrado', icon: '🤝' },
  { key: 'EM_ROTA', label: 'Prestador a caminho', icon: '🚗' },
  { key: 'EXECUTANDO', label: 'Serviço em execução', icon: '⚙️' },
  { key: 'CONCLUIDO', label: 'Concluído', icon: '✅' },
]

const STATUS_ORDER = ['PROCURANDO', 'MATCH_ENCONTRADO', 'EM_ROTA', 'EXECUTANDO', 'CONCLUIDO']

const BOTAO_PROXIMO: Record<string, string> = {
  MATCH_ENCONTRADO: '🚗 Estou a caminho',
  EM_ROTA: '⚙️ Iniciar execução',
  EXECUTANDO: '✅ Concluir serviço',
}

export default function ServicoClient({
  serviceId,
  initialService,
  isProdutor,
  isPrestador,
}: {
  serviceId: string
  initialService: any
  isProdutor: boolean
  isPrestador: boolean
}) {
  const searchParams = useSearchParams()
  const [service, setService] = useState(initialService)
  const [loadingAvancar, setLoadingAvancar] = useState(false)
  const [loadingAvaliar, setLoadingAvaliar] = useState(false)
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [agradecimento, setAgradecimento] = useState<string | null>(
    searchParams.get('obrigado') === '1' ? 'confianca' : null
  )

  useEffect(() => {
    if (agradecimento) {
      const t = setTimeout(() => setAgradecimento(null), 5000)
      return () => clearTimeout(t)
    }
  }, [agradecimento])

  const servico = SERVICOS.find(s => s.value === service.tipo) || { label: service.tipo, icon: '📋' }
  const currentStepIndex = STATUS_ORDER.indexOf(service.status)
  const matchAceito = service.matches?.[0]

  const fetchStatus = useCallback(async () => {
    if (['CONCLUIDO', 'CANCELADO'].includes(service.status)) return
    try {
      const res = await fetch(`/api/servicos/${serviceId}`)
      if (res.ok) {
        const data = await res.json()
        setService(data)
      }
    } catch {}
  }, [serviceId, service.status])

  // Poll every 5 seconds while service is active
  useEffect(() => {
    if (['CONCLUIDO', 'CANCELADO'].includes(service.status)) return
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [fetchStatus, service.status])

  async function pagarServico() {
    setLoadingAvancar(true)
    const res = await fetch('/api/pagamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId })
    })
    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    } else {
      alert('Erro ao iniciar pagamento. Tente novamente.')
      setLoadingAvancar(false)
    }
  }

  async function avancarStatus() {
    setLoadingAvancar(true)
    const res = await fetch(`/api/servicos/${serviceId}`, { method: 'PATCH' })
    if (res.ok) {
      const data = await res.json()
      setService((prev: any) => ({ ...prev, status: data.status }))
      if (data.status === 'CONCLUIDO') {
        setAgradecimento('servico')
      }
    }
    setLoadingAvancar(false)
  }

  async function enviarAvaliacao() {
    if (!nota) return
    setLoadingAvaliar(true)
    await fetch('/api/avaliacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId,
        prestadorId: matchAceito?.prestadorId,
        nota,
        comentario,
      })
    })
    await fetchStatus()
    setAgradecimento('avaliacao')
    setLoadingAvaliar(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-white hover:text-green-200">← Voltar</Link>
          <h1 className="font-bold text-lg">Acompanhar Serviço</h1>
        </div>
      </header>

      {/* Banner de agradecimento */}
      {agradecimento && (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 flex justify-center">
          <div className={`w-full max-w-md py-4 px-5 rounded-2xl shadow-lg text-white text-center font-semibold text-sm animate-bounce-once ${
            agradecimento === 'servico' ? 'bg-green-600' :
            agradecimento === 'avaliacao' ? 'bg-yellow-500' :
            'bg-green-700'
          }`}>
            {agradecimento === 'confianca' && '🌿 AgroLink agradece a sua confiança! Estamos encontrando o melhor prestador para você.'}
            {agradecimento === 'servico' && '🤝 AgroLink agradece seus serviços! O pagamento será transferido em breve.'}
            {agradecimento === 'avaliacao' && '⭐ AgroLink agradece sua contribuição! Sua avaliação ajuda toda a comunidade.'}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Service card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{servico.icon}</span>
            <div>
              <div className="font-bold text-gray-800 text-lg">{servico.label}</div>
              {service.area && <div className="text-sm text-gray-500">{service.area} hectares</div>}
            </div>
          </div>
          {service.descricao && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{service.descricao}</p>
          )}
          <div className="mt-3 flex gap-2 flex-wrap">
            <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
              Urgência: {service.urgencia}
            </span>
            {service.endereco && (
              <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                📍 {service.endereco}
              </span>
            )}
          </div>
        </div>

        {/* Progress tracker */}
        {service.status !== 'CANCELADO' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-700">Status do Serviço</h2>
              {!['CONCLUIDO', 'CANCELADO'].includes(service.status) && (
                <span className="text-xs text-gray-400 animate-pulse">● atualizando</span>
              )}
            </div>
            <div className="space-y-3">
              {STATUS_STEPS.map((step, i) => {
                const done = i < currentStepIndex
                const active = i === currentStepIndex
                const pending = i > currentStepIndex
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      done ? 'bg-green-500 text-white' :
                      active ? 'bg-green-700 text-white ring-4 ring-green-100' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {done ? '✓' : step.icon}
                    </div>
                    <div className={`font-medium text-sm ${
                      active ? 'text-green-700' :
                      pending ? 'text-gray-400' :
                      'text-gray-700'
                    }`}>
                      {step.label}
                      {active && service.status !== 'CONCLUIDO' && (
                        <span className="ml-2 animate-pulse text-xs">● em andamento</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {service.status === 'CANCELADO' && (
          <div className="bg-red-50 rounded-2xl p-5 text-center">
            <div className="text-4xl mb-2">❌</div>
            <div className="font-bold text-red-700">Serviço Cancelado</div>
          </div>
        )}

        {/* Botão de pagamento — só para produtor quando prestador foi encontrado */}
        {isProdutor && service.status === 'MATCH_ENCONTRADO' && !service.payment && (
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
            <h2 className="font-bold text-gray-700 mb-2">💳 Confirmar pagamento</h2>
            <p className="text-sm text-gray-600 mb-4">
              O prestador foi encontrado. Realize o pagamento para liberar o serviço.
              O valor só é repassado após a conclusão.
            </p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 text-sm">Valor estimado</span>
              <span className="font-bold text-green-700 text-xl">
                R$ {(service.precoEstimado || (service.area ? service.area * 5 : 200)).toFixed(2)}
              </span>
            </div>
            <button
              onClick={pagarServico}
              disabled={loadingAvancar}
              className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl hover:bg-blue-700 active:scale-95 transition disabled:opacity-50 shadow-lg"
            >
              {loadingAvancar ? 'Redirecionando...' : '💳 PAGAR AGORA'}
            </button>
          </div>
        )}

        {/* Pagamento já realizado */}
        {isProdutor && service.payment?.status === 'RESERVADO' && (
          <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
            <div className="text-green-700 font-semibold">✅ Pagamento confirmado — em custódia</div>
            <div className="text-xs text-gray-500 mt-1">Será liberado ao prestador após conclusão</div>
          </div>
        )}

        {/* Botão de avançar status — só para prestador */}
        {isPrestador && BOTAO_PROXIMO[service.status] && (
          <button
            onClick={avancarStatus}
            disabled={loadingAvancar}
            className="w-full py-4 bg-green-700 text-white font-bold text-lg rounded-2xl hover:bg-green-800 active:scale-95 transition disabled:opacity-50 shadow-lg"
          >
            {loadingAvancar ? 'Atualizando...' : BOTAO_PROXIMO[service.status]}
          </button>
        )}

        {/* Prestador info */}
        {matchAceito && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">Prestador</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl font-bold text-green-700">
                {matchAceito.prestador.user.nome[0]}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{matchAceito.prestador.user.nome}</div>
                {matchAceito.prestador.avaliacao > 0 && (
                  <div className="text-sm text-gray-500">
                    ⭐ {matchAceito.prestador.avaliacao.toFixed(1)} · {matchAceito.prestador.totalAvaliacoes} avaliações
                  </div>
                )}
                {matchAceito.distancia && (
                  <div className="text-sm text-gray-500">📍 {matchAceito.distancia.toFixed(1)} km</div>
                )}
              </div>
            </div>
            {matchAceito.prestador.user.telefone && (
              <a
                href={`https://wa.me/55${matchAceito.prestador.user.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition"
              >
                📱 Chamar no WhatsApp
              </a>
            )}
          </div>
        )}

        {/* Avaliação — só produtor, só após conclusão */}
        {isProdutor && service.status === 'CONCLUIDO' && !service.avaliacao && matchAceito && (
          <div className="bg-yellow-50 rounded-2xl p-5 shadow-sm border border-yellow-200">
            <h2 className="font-bold text-gray-700 mb-4">Como foi o serviço?</h2>
            <div className="flex gap-2 justify-center mb-4">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setNota(n)}
                  className={`text-3xl transition-transform hover:scale-110 ${n <= nota ? 'opacity-100' : 'opacity-30'}`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <textarea
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              rows={2}
              placeholder="Comentário opcional..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm mb-3"
            />
            <button
              onClick={enviarAvaliacao}
              disabled={!nota || loadingAvaliar}
              className="w-full py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition disabled:opacity-50"
            >
              {loadingAvaliar ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          </div>
        )}

        {/* Avaliação já enviada */}
        {service.avaliacao && (
          <div className="bg-green-50 rounded-2xl p-5 text-center border border-green-100">
            <div className="text-3xl mb-1">{'⭐'.repeat(service.avaliacao.nota)}</div>
            <div className="font-bold text-green-700">Avaliação enviada!</div>
            {service.avaliacao.comentario && (
              <p className="text-sm text-gray-600 mt-1">"{service.avaliacao.comentario}"</p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
