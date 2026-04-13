'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STATUS_LABELS: Record<string, { label: string; cor: string; icon: string }> = {
  PROCURANDO:          { label: 'Procurando prestador',    cor: 'bg-yellow-100 text-yellow-800 border-yellow-200',  icon: '🔍' },
  AGUARDANDO_PROPOSTA: { label: 'Proposta recebida!',      cor: 'bg-purple-100 text-purple-800 border-purple-200',  icon: '💰' },
  MATCH_ENCONTRADO:    { label: 'Prestador confirmado',    cor: 'bg-blue-100 text-blue-800 border-blue-200',        icon: '✅' },
  EM_ROTA:             { label: 'Em rota / Aguardando',    cor: 'bg-indigo-100 text-indigo-800 border-indigo-200',  icon: '🚜' },
  EXECUTANDO:          { label: 'Serviço em execução',     cor: 'bg-orange-100 text-orange-800 border-orange-200',  icon: '⚙️' },
  CONCLUIDO:           { label: 'Concluído',                cor: 'bg-green-100 text-green-800 border-green-200',     icon: '🎉' },
  CANCELADO:           { label: 'Cancelado',                cor: 'bg-red-100 text-red-800 border-red-200',           icon: '❌' },
}

const ETAPAS = ['PROCURANDO', 'AGUARDANDO_PROPOSTA', 'MATCH_ENCONTRADO', 'EM_ROTA', 'EXECUTANDO', 'CONCLUIDO']

interface Proposta {
  id: string
  valorProposto: number | null
  mensagemProposta: string | null
  prestadorNome: string
}

interface Props {
  serviceId: string
  initialService: any
  servicoLabel: string
  isProdutor: boolean
  proposta: Proposta | null
}

export default function RastrearClient({ serviceId, initialService, servicoLabel, isProdutor, proposta: propostaInicial }: Props) {
  const [service, setService] = useState(initialService)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date())
  const [proposta, setProposta] = useState(propostaInicial)
  const [respondendo, setRespondendo] = useState(false)
  const [msgProposta, setMsgProposta] = useState('')

  useEffect(() => {
    if (service.status === 'CONCLUIDO' || service.status === 'CANCELADO') return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rastrear/${serviceId}`)
        if (res.ok) {
          const data = await res.json()
          setService(data)
          setUltimaAtualizacao(new Date())
          // Quando status muda de AGUARDANDO_PROPOSTA limpa o card de proposta
          if (data.status !== 'AGUARDANDO_PROPOSTA') setProposta(null)
        }
      } catch {}
    }, 10000)

    return () => clearInterval(interval)
  }, [serviceId, service.status])

  async function responderProposta(acao: 'ACEITAR' | 'RECUSAR') {
    if (!proposta) return
    setRespondendo(true)
    setMsgProposta('')
    try {
      const res = await fetch('/api/matches/proposta', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: proposta.id, acao }),
      })
      if (res.ok) {
        if (acao === 'ACEITAR') {
          setMsgProposta('✅ Proposta aceita! Aguardando pagamento...')
          setService((s: any) => ({ ...s, status: 'MATCH_ENCONTRADO' }))
        } else {
          setMsgProposta('❌ Proposta recusada. Buscando outro prestador...')
          setService((s: any) => ({ ...s, status: 'PROCURANDO' }))
        }
        setProposta(null)
      } else {
        const d = await res.json()
        setMsgProposta(d.error || 'Erro ao responder proposta')
      }
    } catch {
      setMsgProposta('Erro de conexão. Tente novamente.')
    }
    setRespondendo(false)
  }

  const statusInfo = STATUS_LABELS[service.status] ?? { label: service.status, cor: 'bg-gray-100 text-gray-700 border-gray-200', icon: '❓' }
  const prestador = service.matches?.find((m: any) => m.status === 'ACEITO')?.prestador
  const etapaAtual = ETAPAS.indexOf(service.status)
  const concluido = service.status === 'CONCLUIDO' || service.status === 'CANCELADO'

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-green-700 text-white px-4 py-4 shadow">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <div>
              <div className="font-bold text-lg leading-tight">AgroCore</div>
              <div className="text-xs text-green-200">Rastreamento de serviço</div>
            </div>
          </div>
          {!concluido && (
            <div className="flex items-center gap-1.5 text-xs text-green-200">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse inline-block" />
              Ao vivo
            </div>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Status principal */}
        <div className={`rounded-2xl border px-5 py-4 flex items-center gap-4 ${statusInfo.cor}`}>
          <div className="text-4xl">{statusInfo.icon}</div>
          <div>
            <div className="text-xs font-medium opacity-70 uppercase tracking-wide">Status atual</div>
            <div className="text-lg font-bold">{statusInfo.label}</div>
          </div>
        </div>

        {/* Card de proposta — só para o produtor quando há proposta pendente */}
        {isProdutor && proposta && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-purple-200 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <div>
                <div className="font-bold text-gray-800">Nova proposta recebida</div>
                <div className="text-sm text-gray-500">de {proposta.prestadorNome}</div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl px-4 py-3">
              <div className="text-xs text-purple-600 font-medium">Valor proposto</div>
              <div className="text-3xl font-bold text-purple-700">
                R$ {proposta.valorProposto?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) ?? '—'}
              </div>
            </div>

            {proposta.mensagemProposta && (
              <div>
                <div className="text-xs text-gray-400 font-medium mb-1">Mensagem do prestador</div>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3">{proposta.mensagemProposta}</p>
              </div>
            )}

            {msgProposta && (
              <p className={`text-sm text-center font-medium p-3 rounded-xl ${
                msgProposta.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}>{msgProposta}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => responderProposta('RECUSAR')}
                disabled={respondendo}
                className="py-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition disabled:opacity-50"
              >
                {respondendo ? '...' : '❌ Recusar'}
              </button>
              <button
                onClick={() => responderProposta('ACEITAR')}
                disabled={respondendo}
                className="py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition disabled:opacity-50"
              >
                {respondendo ? '...' : '✅ Aceitar'}
              </button>
            </div>

            <p className="text-xs text-center text-gray-400">
              Ao aceitar, você será redirecionado para o pagamento no AgroCore.
            </p>
          </div>
        )}

        {/* Linha do tempo */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-4">Progresso</h2>
          <div className="space-y-3">
            {ETAPAS.map((etapa, idx) => {
              const info = STATUS_LABELS[etapa]
              const concluida = etapaAtual > idx
              const ativa = etapaAtual === idx
              return (
                <div key={etapa} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                    concluida ? 'bg-green-600 text-white' :
                    ativa ? 'bg-green-700 text-white ring-4 ring-green-200' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {concluida ? '✓' : ativa ? info.icon : idx + 1}
                  </div>
                  <div className={`text-sm font-medium ${
                    concluida ? 'text-green-700' : ativa ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {info.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detalhes */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="font-bold text-gray-700">Detalhes</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-400 text-xs">Tipo de serviço</div>
              <div className="font-medium text-gray-800">{servicoLabel}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Urgência</div>
              <div className="font-medium text-gray-800">{service.urgencia}</div>
            </div>
            {service.area && (
              <div>
                <div className="text-gray-400 text-xs">Área</div>
                <div className="font-medium text-gray-800">{service.area} ha</div>
              </div>
            )}
            {service.endereco && (
              <div className="col-span-2">
                <div className="text-gray-400 text-xs">Local</div>
                <div className="font-medium text-gray-800">{service.endereco}</div>
              </div>
            )}
            {service.descricao && (
              <div className="col-span-2">
                <div className="text-gray-400 text-xs">Descrição</div>
                <div className="font-medium text-gray-800">{service.descricao}</div>
              </div>
            )}
            <div className="col-span-2">
              <div className="text-gray-400 text-xs">Solicitado em</div>
              <div className="font-medium text-gray-800">
                {new Date(service.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Prestador */}
        {prestador && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">Prestador responsável</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">👨‍🌾</div>
              <div>
                <div className="font-semibold text-gray-800">{prestador.user.nome}</div>
                {prestador.user.cidade && (
                  <div className="text-sm text-gray-500">{prestador.user.cidade}, {prestador.user.estado}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CTA de pagamento — aparece quando prestador foi confirmado mas ainda não pagou */}
        {isProdutor && service.status === 'MATCH_ENCONTRADO' && !service.payment && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-green-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💳</span>
              <div>
                <div className="font-bold text-gray-800">Hora de pagar!</div>
                <div className="text-sm text-gray-500">Confirme o pagamento para o prestador começar.</div>
              </div>
            </div>
            <Link
              href={`/servico/${serviceId}`}
              className="block text-center py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition"
            >
              💳 Pagar agora no AgroCore
            </Link>
          </div>
        )}

        {/* Pagamento */}
        {service.payment && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">Pagamento</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-700">
                  R$ {service.payment.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Valor do serviço</div>
              </div>
              <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                service.payment.status === 'LIBERADO' ? 'bg-green-100 text-green-700' :
                service.payment.status === 'RESERVADO' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {service.payment.status === 'LIBERADO' ? '✅ Pago' :
                 service.payment.status === 'RESERVADO' ? '🔒 Reservado' : '⏳ Pendente'}
              </div>
            </div>
            {service.payment.status === 'PENDENTE' && isProdutor && (
              <Link
                href={`/servico/${serviceId}`}
                className="mt-4 block text-center py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition text-sm"
              >
                💳 Concluir pagamento no AgroCore
              </Link>
            )}
          </div>
        )}

        {/* Rodapé */}
        <div className="text-center text-xs text-gray-400 space-y-1">
          <div>ID: <span className="font-mono">{serviceId}</span></div>
          {!concluido && (
            <div>Atualizado às {ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
          )}
        </div>

        {!isProdutor && (
          <Link href="/" className="block text-center py-3 bg-green-700 text-white rounded-2xl font-semibold hover:bg-green-800 transition">
            Conhecer o AgroCore
          </Link>
        )}

      </div>
    </div>
  )
}
