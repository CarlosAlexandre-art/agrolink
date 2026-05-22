'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SERVICOS } from '@/lib/constants'
import MapaServico from '@/components/MapaServicoLazy'
import PopupInteligente, { type PopupTipo } from '@/components/PopupInteligente'

const STATUS_STEPS = [
  { key: 'PROCURANDO', label: 'Procurando prestador', icon: '🔍' },
  { key: 'AGUARDANDO_PROPOSTA', label: 'Proposta recebida', icon: '💰' },
  { key: 'MATCH_ENCONTRADO', label: 'Prestador confirmado', icon: '🤝' },
  { key: 'EM_ROTA', label: 'Prestador a caminho', icon: '🚗' },
  { key: 'EXECUTANDO', label: 'Serviço em execução', icon: '⚙️' },
  { key: 'CONCLUIDO', label: 'Concluído', icon: '✅' },
]

const STATUS_ORDER = ['PROCURANDO', 'AGUARDANDO_PROPOSTA', 'MATCH_ENCONTRADO', 'EM_ROTA', 'EXECUTANDO', 'CONCLUIDO']

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
  const [loadingProposta, setLoadingProposta] = useState<'ACEITAR' | 'RECUSAR' | null>(null)
  const [loadingAvaliar, setLoadingAvaliar] = useState(false)
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [notaProdutor, setNotaProdutor] = useState(0)
  const [comentarioProdutor, setComentarioProdutor] = useState('')
  const [loadingAvaliarProdutor, setLoadingAvaliarProdutor] = useState(false)
  const [uploadandoFoto, setUploadandoFoto] = useState(false)
  const [recuperando, setRecuperando] = useState<string | null>(null)
  const [popup, setPopup] = useState<PopupTipo>(null)
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
  const matchAceito = service.matches?.find((m: any) => m.status === 'ACEITO')
  const matchesRecusados = service.matches?.filter((m: any) => m.status === 'RECUSADO') ?? []

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
        setTimeout(() => setPopup('agroOS'), 2500)
      }
    }
    setLoadingAvancar(false)
  }

  async function responderProposta(acao: 'ACEITAR' | 'RECUSAR') {
    setLoadingProposta(acao)
    const matchAceitoId = matchAceito?.id
    const res = await fetch('/api/matches/proposta', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: matchAceitoId, acao })
    })
    if (res.ok) {
      await fetchStatus()
    } else {
      const data = await res.json()
      alert(data.error || 'Erro ao processar proposta.')
    }
    setLoadingProposta(null)
  }

  async function recuperarServico(matchId: string) {
    setRecuperando(matchId)
    const res = await fetch('/api/matches/recuperar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId })
    })
    if (res.ok) {
      await fetchStatus()
    } else {
      const data = await res.json()
      alert(data.error || 'Erro ao recuperar serviço.')
    }
    setRecuperando(null)
  }

  async function enviarFotoProva(file: File) {
    setUploadandoFoto(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`/api/servicos/${serviceId}/foto-prova`, { method: 'POST', body: form })
    if (res.ok) {
      const { url } = await res.json()
      setService((prev: any) => ({ ...prev, fotoProva: url }))
    } else {
      const data = await res.json()
      alert(data.error || 'Erro ao enviar foto.')
    }
    setUploadandoFoto(false)
  }

  async function enviarAvaliacaoProdutor() {
    if (!notaProdutor) return
    setLoadingAvaliarProdutor(true)
    await fetch('/api/avaliacoes/produtor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId,
        produtorId: service.produtorId,
        nota: notaProdutor,
        comentario: comentarioProdutor,
      })
    })
    await fetchStatus()
    setAgradecimento('avaliacao')
    setLoadingAvaliarProdutor(false)
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
    setTimeout(() => setPopup('compartilhar'), 2000)
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
            {agradecimento === 'confianca' && '🌿 AgroCore agradece a sua confiança! Estamos encontrando o melhor prestador para você.'}
            {agradecimento === 'servico' && '🤝 AgroCore agradece seus serviços! O pagamento será transferido em breve.'}
            {agradecimento === 'avaliacao' && '⭐ AgroCore agradece sua contribuição! Sua avaliação ajuda toda a comunidade.'}
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

        {/* Mapa do serviço — omite se coordenadas são (0,0), que indica localização não resolvida */}
        {service.latitude && service.longitude && !(service.latitude === 0 && service.longitude === 0) && (
          <div>
            <h2 className="font-bold text-gray-700 mb-2">📍 Localização do serviço</h2>
            <MapaServico
              latitude={service.latitude}
              longitude={service.longitude}
              endereco={service.endereco}
              nomeFazenda={service.produtor?.nomeFazenda}
              prestadorLat={matchAceito?.prestador?.user?.latitude}
              prestadorLng={matchAceito?.prestador?.user?.longitude}
              prestadorNome={matchAceito?.prestador?.user?.nome}
            />
          </div>
        )}

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

        {/* Recuperar serviço — matches recusados pelo prestador */}
        {isProdutor && matchesRecusados.length > 0 && (
          <div className="bg-orange-50 rounded-2xl p-5 border border-orange-200">
            <h2 className="font-bold text-gray-800 mb-1">🔄 Proposta recusada</h2>
            <p className="text-sm text-gray-500 mb-4">
              O prestador recusou sua solicitação. Você pode reabrir para que ele possa aceitar novamente.
            </p>
            {matchesRecusados.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                  {m.prestador.user.nome[0]}
                </div>
                <div className="flex-1 text-sm text-gray-700 font-medium">{m.prestador.user.nome}</div>
                <button
                  onClick={() => recuperarServico(m.id)}
                  disabled={recuperando === m.id}
                  className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 active:scale-95 transition disabled:opacity-50"
                >
                  {recuperando === m.id ? '...' : 'Recuperar'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Proposta aguardando decisão do produtor */}
        {service.status === 'AGUARDANDO_PROPOSTA' && matchAceito && (
          <>
            {isProdutor && (
              <div className="bg-orange-50 rounded-2xl p-5 border border-orange-300">
                <h2 className="font-bold text-gray-800 mb-1">💰 Proposta recebida!</h2>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>{matchAceito.prestador.user.nome}</strong> enviou uma proposta para o seu serviço. Revise e decida.
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Valor proposto</span>
                    <span className="font-bold text-green-700 text-2xl">R$ {matchAceito.valorProposto?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Taxa da plataforma (5%)</span>
                    <span>- R$ {(matchAceito.valorProposto * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Taxa de processamento Stripe (~2.5% + fixo)</span>
                    <span>- R$ {(matchAceito.valorProposto * 0.025 + 0.40).toFixed(2)} aprox.</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-gray-700 border-t pt-2 mt-1">
                    <span>Prestador recebe (estimativa)</span>
                    <span className="text-green-700">R$ {(matchAceito.valorProposto * 0.925 - 0.40).toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">* Estimativa. A tarifa exata do Stripe varia conforme o método de pagamento.</p>
                </div>

                {matchAceito.mensagemProposta && (
                  <div className="bg-white rounded-xl p-3 border border-gray-200 mb-4">
                    <p className="text-xs text-gray-400 mb-1">Mensagem do prestador:</p>
                    <p className="text-sm text-gray-700">"{matchAceito.mensagemProposta}"</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => responderProposta('RECUSAR')}
                    disabled={!!loadingProposta}
                    className="flex-1 py-3 bg-[#EF4444] text-white font-bold rounded-xl hover:bg-red-600 active:scale-95 transition disabled:opacity-50 shadow-md"
                  >
                    {loadingProposta === 'RECUSAR' ? '...' : 'Recusar'}
                  </button>
                  <button
                    onClick={() => responderProposta('ACEITAR')}
                    disabled={!!loadingProposta}
                    className="flex-[2] py-3 bg-[#22C55E] text-white font-bold rounded-xl hover:bg-green-500 active:scale-95 transition disabled:opacity-50 shadow-md"
                  >
                    {loadingProposta === 'ACEITAR' ? 'Aceitando...' : 'Aceitar proposta'}
                  </button>
                </div>
              </div>
            )}

            {isPrestador && (
              <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200 text-center">
                <div className="text-3xl mb-2">⏳</div>
                <div className="font-bold text-yellow-700 mb-1">Proposta enviada!</div>
                <p className="text-sm text-gray-600">
                  Sua proposta de <strong>R$ {matchAceito.valorProposto?.toFixed(2)}</strong> foi enviada ao produtor. Aguardando resposta.
                </p>
              </div>
            )}
          </>
        )}

        {/* Botão de pagamento — só para produtor quando prestador foi encontrado e pagamento não confirmado */}
        {isProdutor && service.status === 'MATCH_ENCONTRADO' && service.payment?.status !== 'RESERVADO' && (
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
            <h2 className="font-bold text-gray-700 mb-2">💳 Confirmar pagamento</h2>
            <p className="text-sm text-gray-600 mb-4">
              O prestador foi encontrado. Realize o pagamento para liberar o serviço.
              O valor fica em custódia segura e só é repassado ao prestador após a conclusão.
            </p>
            {(() => {
              const valor = service.precoEstimado || (service.area ? service.area * 5 : 200)
              const comissao = valor * 0.05
              const prestador = valor * 0.95
              return (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Valor do serviço</span>
                    <span className="font-bold text-green-700 text-xl">R$ {valor.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Prestador recebe</span>
                    <span>R$ {prestador.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Taxa plataforma (5%)</span>
                    <span>R$ {comissao.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-400 bg-gray-100 rounded-lg p-2 mt-1">
                    💡 A taxa de 5% é usada para manutenção da plataforma, segurança dos pagamentos e melhorias contínuas para você.
                  </div>
                </div>
              )
            })()}
            <button
              onClick={pagarServico}
              disabled={loadingAvancar}
              className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl hover:bg-blue-700 active:scale-95 transition disabled:opacity-50 shadow-lg"
            >
              {loadingAvancar ? 'Redirecionando...' : '💳 PAGAR AGORA'}
            </button>
          </div>
        )}

        {/* Pagamento já realizado — produtor */}
        {isProdutor && service.payment?.status === 'RESERVADO' && (
          <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-green-700 font-bold">Pagamento confirmado!</div>
            <div className="text-sm text-gray-600 mt-1">
              R$ {service.payment.valor?.toFixed(2)} em custódia segura
            </div>
            <div className="text-xs text-gray-400 mt-1">Será liberado ao prestador após conclusão do serviço</div>
          </div>
        )}

        {/* Pagamento confirmado — prestador */}
        {isPrestador && service.payment?.status === 'RESERVADO' && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="text-3xl">💰</div>
              <div>
                <div className="font-bold text-blue-700">Pagamento recebido!</div>
                <div className="text-sm text-gray-600">
                  O produtor pagou <strong>R$ {service.payment.valor?.toFixed(2)}</strong> pelo serviço.
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Você receberá R$ {service.payment.valorPrestador?.toFixed(2)} após a conclusão.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagamento pendente — prestador */}
        {isPrestador && service.payment?.status === 'PENDENTE' && (
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⏳</div>
              <div>
                <div className="font-semibold text-yellow-700">Aguardando pagamento</div>
                <div className="text-xs text-gray-500 mt-0.5">O produtor iniciou o pagamento. Aguardando confirmação do banco.</div>
              </div>
            </div>
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

        {/* Botão Chat — aparece quando há prestador confirmado */}
        {matchAceito && !['CANCELADO'].includes(service.status) && (
          <Link
            href={`/servico/${serviceId}/chat`}
            className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-green-600 text-green-700 font-bold text-base rounded-2xl hover:bg-green-50 active:scale-95 transition shadow-sm"
          >
            💬 Abrir chat com {isProdutor ? 'o prestador' : 'o produtor'}
          </Link>
        )}

        {/* Prestador info */}
        {matchAceito && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">Prestador</h2>
            <div className="flex items-center gap-3">
              <Link href={`/prestador/${matchAceito.prestadorId}`}>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl font-bold text-green-700 hover:ring-2 hover:ring-green-400 transition">
                  {matchAceito.prestador.user.nome[0]}
                </div>
              </Link>
              <div className="flex-1">
                <Link href={`/prestador/${matchAceito.prestadorId}`} className="font-semibold text-gray-800 hover:text-green-700 transition">
                  {matchAceito.prestador.user.nome}
                </Link>
                {matchAceito.prestador.avaliacao > 0 && (
                  <div className="text-sm text-gray-500">
                    ⭐ {matchAceito.prestador.avaliacao.toFixed(1)} · {matchAceito.prestador.totalAvaliacoes} avaliações
                  </div>
                )}
                {matchAceito.distancia && (
                  <div className="text-sm text-gray-500">📍 {matchAceito.distancia.toFixed(1)} km</div>
                )}
              </div>
              <Link href={`/prestador/${matchAceito.prestadorId}`} className="text-xs text-green-700 font-semibold hover:underline flex-shrink-0">
                Ver perfil →
              </Link>
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

        {/* Foto de comprovação — envio pelo prestador */}
        {isPrestador && ['EXECUTANDO', 'CONCLUIDO'].includes(service.status) && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-1">📸 Foto de comprovação</h2>
            <p className="text-sm text-gray-500 mb-3">
              Envie uma foto do serviço realizado para comprovar a execução.
            </p>
            {service.fotoProva ? (
              <div className="space-y-3">
                <img
                  src={service.fotoProva}
                  alt="Foto de comprovação"
                  className="w-full rounded-xl object-cover max-h-64"
                />
                <label className="block w-full py-2 text-center border border-gray-300 rounded-xl text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition">
                  🔄 Trocar foto
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) enviarFotoProva(f) }}
                  />
                </label>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center w-full py-8 border-2 border-dashed rounded-xl cursor-pointer transition ${uploadandoFoto ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50'}`}>
                {uploadandoFoto ? (
                  <span className="text-green-600 font-medium">Enviando...</span>
                ) : (
                  <>
                    <span className="text-4xl mb-2">📷</span>
                    <span className="text-sm font-medium text-gray-700">Tirar foto ou escolher da galeria</span>
                    <span className="text-xs text-gray-400 mt-1">JPG, PNG — máx 10MB</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  disabled={uploadandoFoto}
                  onChange={e => { const f = e.target.files?.[0]; if (f) enviarFotoProva(f) }}
                />
              </label>
            )}
          </div>
        )}

        {/* Foto de comprovação — visualização pelo produtor */}
        {isProdutor && service.fotoProva && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">📸 Foto de comprovação</h2>
            <img
              src={service.fotoProva}
              alt="Foto de comprovação do serviço"
              className="w-full rounded-xl object-cover max-h-72"
            />
            <p className="text-xs text-gray-400 mt-2 text-center">
              Foto enviada pelo prestador como comprovação do serviço realizado.
            </p>
          </div>
        )}

        {/* Info do produtor — visível para o prestador */}
        {isPrestador && service.produtor && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">Produtor</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl font-bold text-green-700">
                {service.produtor.user.nome[0]}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{service.produtor.user.nome}</div>
                {service.produtor.nomeFazenda && (
                  <div className="text-sm text-gray-500">🌾 {service.produtor.nomeFazenda}</div>
                )}
                {service.produtor.avaliacao > 0 && (
                  <div className="text-sm text-gray-500">
                    ⭐ {service.produtor.avaliacao.toFixed(1)} · {service.produtor.totalAvaliacoes} avaliações
                  </div>
                )}
              </div>
              <Link href={`/produtor/${service.produtorId}`} className="text-xs text-green-700 font-semibold hover:underline flex-shrink-0">
                Ver perfil →
              </Link>
            </div>
          </div>
        )}

        {/* Prestador avalia o produtor */}
        {isPrestador && service.status === 'CONCLUIDO' && !service.avaliacaoProdutor && (
          <div className="bg-blue-50 rounded-2xl p-5 shadow-sm border border-blue-200">
            <h2 className="font-bold text-gray-700 mb-1">Como foi trabalhar com este produtor?</h2>
            <p className="text-xs text-gray-500 mb-3">Sua avaliação ajuda a comunidade a identificar bons clientes</p>
            <div className="flex gap-2 justify-center mb-4">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setNotaProdutor(n)}
                  className={`text-3xl transition-transform hover:scale-110 ${n <= notaProdutor ? 'opacity-100' : 'opacity-30'}`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <textarea
              value={comentarioProdutor}
              onChange={e => setComentarioProdutor(e.target.value)}
              rows={2}
              placeholder="Comentário opcional..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm mb-3 text-gray-900 bg-white"
            />
            <button
              onClick={enviarAvaliacaoProdutor}
              disabled={!notaProdutor || loadingAvaliarProdutor}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loadingAvaliarProdutor ? 'Enviando...' : 'Avaliar produtor'}
            </button>
          </div>
        )}

        {service.avaliacaoProdutor && isPrestador && (
          <div className="bg-blue-50 rounded-2xl p-5 text-center border border-blue-100">
            <div className="text-3xl mb-1">{'⭐'.repeat(service.avaliacaoProdutor.nota)}</div>
            <div className="font-bold text-blue-700">Avaliação do produtor enviada!</div>
          </div>
        )}

      </div>

      <PopupInteligente tipo={popup} onFechar={() => setPopup(null)} />
    </div>
  )
}
