'use client'

import { useState } from 'react'

interface Props {
  avaliacaoId: string
  tipo: 'PRESTADOR' | 'PRODUTOR'
  nota: number
  comentario?: string | null
  contestacao?: string | null
  contestacaoStatus?: string | null
}

const statusLabel: Record<string, { label: string; cor: string }> = {
  PENDENTE:  { label: '🔴 Em análise pela equipe',         cor: 'text-amber-700 bg-amber-50 border-amber-200' },
  APROVADA:  { label: '🟢 Contestação aprovada — avaliação removida', cor: 'text-green-700 bg-green-50 border-green-200' },
  REJEITADA: { label: '⚫ Contestação rejeitada',           cor: 'text-gray-600 bg-gray-50 border-gray-200' },
}

export default function ContestarAvaliacao({ avaliacaoId, tipo, nota, comentario, contestacao, contestacaoStatus }: Props) {
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  async function handleContestar() {
    if (texto.length < 20) { setErro('Mínimo 20 caracteres.'); return }
    setLoading(true)
    setErro('')
    const res = await fetch('/api/avaliacoes/contestar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avaliacaoId, tipo, contestacao: texto }),
    })
    const data = await res.json()
    if (res.ok) { setEnviado(true) }
    else { setErro(data.error || 'Erro ao contestar.') }
    setLoading(false)
  }

  return (
    <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-500 text-sm">{'★'.repeat(nota)}{'☆'.repeat(5 - nota)}</span>
          {comentario && <span className="text-xs text-gray-500 dark:text-gray-400 italic">"{comentario}"</span>}
        </div>
        {!contestacao && !enviado && (
          <button
            onClick={() => setAberto(!aberto)}
            className="text-xs text-red-600 hover:underline font-medium"
          >
            Contestar
          </button>
        )}
      </div>

      {/* Status da contestação existente */}
      {(contestacao || enviado) && (
        <div className={`rounded-xl border px-3 py-2 text-xs ${statusLabel[contestacaoStatus ?? 'PENDENTE']?.cor ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
          <div className="font-semibold mb-0.5">{statusLabel[contestacaoStatus ?? 'PENDENTE']?.label}</div>
          {(contestacao || texto) && (
            <div className="text-gray-600 dark:text-gray-400 mt-1">Sua contestação: "{contestacao || texto}"</div>
          )}
        </div>
      )}

      {/* Formulário */}
      {aberto && !contestacao && !enviado && (
        <div className="mt-2 space-y-2">
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            rows={3}
            placeholder="Explique por que esta avaliação é injusta ou incorreta. Nossa equipe analisará em até 5 dias úteis..."
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-gray-700 dark:text-gray-100"
          />
          <div className="text-xs text-gray-400 text-right">{texto.length}/20 mínimo</div>
          {erro && <p className="text-xs text-red-600">{erro}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => setAberto(false)}
              className="flex-1 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleContestar}
              disabled={loading || texto.length < 20}
              className="flex-1 py-2 text-xs bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Contestação'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
