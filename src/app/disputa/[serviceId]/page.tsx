'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const MOTIVOS = [
  'Serviço não foi realizado',
  'Serviço realizado de forma incompleta',
  'Prestador não compareceu',
  'Qualidade abaixo do acordado',
  'Cobrança indevida',
  'Avaliação injusta',
  'Outro motivo',
]

export default function DisputaPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const router = useRouter()

  const [motivo, setMotivo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [disputaExistente, setDisputaExistente] = useState<any>(null)
  const [checando, setChecando] = useState(true)

  useEffect(() => {
    fetch('/api/disputas')
      .then(r => r.json())
      .then((list: any[]) => {
        const d = list.find(d => d.serviceId === serviceId)
        if (d) setDisputaExistente(d)
        setChecando(false)
      })
      .catch(() => setChecando(false))
  }, [serviceId])

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    if (!motivo || descricao.length < 30) {
      setErro('Descreva o problema com pelo menos 30 caracteres.')
      return
    }
    setLoading(true)
    setErro('')

    const res = await fetch('/api/disputas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId, motivo, descricao }),
    })
    const data = await res.json()

    if (res.ok) {
      setEnviado(true)
    } else {
      setErro(data.error || 'Erro ao abrir disputa.')
    }
    setLoading(false)
  }

  const statusLabel: Record<string, string> = {
    ABERTA: '🔴 Aberta',
    EM_ANALISE: '🟡 Em análise',
    RESOLVIDA_PRODUTOR: '🟢 Resolvida — favorável ao produtor',
    RESOLVIDA_PRESTADOR: '🟢 Resolvida — favorável ao prestador',
    ENCERRADA: '⚫ Encerrada',
  }

  if (checando) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-green-700 animate-pulse">Carregando...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <header className="bg-red-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href={`/servico/${serviceId}`} className="text-white hover:text-red-200">← Voltar</Link>
          <h1 className="font-bold text-lg">⚖️ Sistema de Disputas</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Disputa existente */}
        {disputaExistente && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Disputa em andamento</h2>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{statusLabel[disputaExistente.status] ?? disputaExistente.status}</span>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Motivo</div>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{disputaExistente.motivo}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-2">Descrição</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{disputaExistente.descricao}</div>
            </div>

            {disputaExistente.resolucao && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <div className="text-xs text-green-700 dark:text-green-400 font-bold uppercase tracking-wider mb-1">Resolução da equipe</div>
                <div className="text-sm text-green-800 dark:text-green-300">{disputaExistente.resolucao}</div>
              </div>
            )}

            <div className="text-xs text-gray-400 text-center">
              Aberta em {new Date(disputaExistente.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
              📧 Nossa equipe analisa em até 5 dias úteis e entrará em contato pelo e-mail cadastrado.
            </div>
          </div>
        )}

        {/* Formulário — só se não houver disputa */}
        {!disputaExistente && !enviado && (
          <form onSubmit={handleEnviar} className="space-y-5">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                ⚠️ Ao abrir uma disputa, o serviço entra em modo de análise e ficará suspenso até a resolução. Nossa equipe analisa em até 5 dias úteis.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-gray-800 dark:text-gray-100">Motivo da disputa</h2>
              <div className="space-y-2">
                {MOTIVOS.map(m => (
                  <label key={m} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    motivo === m
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                  }`}>
                    <input type="radio" name="motivo" value={m} onChange={() => setMotivo(m)} className="accent-red-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{m}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3">Descreva o problema</h2>
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                rows={5}
                placeholder="Descreva detalhadamente o que aconteceu, quando e como. Inclua datas, valores e qualquer informação relevante..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-gray-100"
              />
              <div className="text-xs text-gray-400 text-right mt-1">{descricao.length} caracteres {descricao.length < 30 && '(mínimo 30)'}</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Evidências</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                📸 Fotos, vídeos e mensagens ajudam na análise. Envie pelo chat do serviço antes de abrir a disputa — nossa equipe tem acesso ao histórico completo de mensagens e fotos.
              </p>
            </div>

            {erro && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !motivo || descricao.length < 30}
              className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition disabled:opacity-50 text-base"
            >
              {loading ? 'Abrindo disputa...' : '⚖️ Abrir Disputa Formal'}
            </button>
          </form>
        )}

        {/* Sucesso */}
        {enviado && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-center space-y-4">
            <div className="text-5xl">⚖️</div>
            <h2 className="font-bold text-gray-800 dark:text-gray-100 text-xl">Disputa aberta</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Nossa equipe analisará o caso em até 5 dias úteis e entrará em contato pelo e-mail cadastrado.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
              📧 Fique atento ao seu e-mail e WhatsApp. Podemos solicitar informações adicionais.
            </div>
            <Link
              href={`/servico/${serviceId}`}
              className="block w-full py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition"
            >
              Ver serviço
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
