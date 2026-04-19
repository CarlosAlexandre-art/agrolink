'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RelatorioPage() {
  const [relatorio, setRelatorio] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [gerado, setGerado] = useState(false)

  async function gerar() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/relatorio')
      if (res.ok) {
        const data = await res.json()
        setRelatorio(data.relatorio)
        setGerado(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-white hover:text-green-200">← Voltar</Link>
          <div>
            <div className="font-bold text-lg">📊 Relatório Mensal IA</div>
            <div className="text-xs text-green-200">Análise inteligente dos últimos 30 dias</div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🤖</span>
            <div>
              <div className="font-bold text-gray-800">AgroBot IA</div>
              <div className="text-sm text-gray-500">Análise personalizada baseada nos seus dados reais</div>
            </div>
          </div>

          {!gerado && (
            <button
              onClick={gerar}
              disabled={loading}
              className="w-full py-4 bg-green-700 text-white font-bold rounded-2xl hover:bg-green-800 transition disabled:opacity-50"
            >
              {loading ? '🤖 Gerando análise...' : '✨ Gerar relatório do mês'}
            </button>
          )}

          {loading && (
            <div className="mt-4 space-y-2 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
              <div className="h-4 bg-gray-100 rounded w-4/6" />
            </div>
          )}

          {relatorio && (
            <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {relatorio}
            </div>
          )}

          {gerado && (
            <button
              onClick={gerar}
              disabled={loading}
              className="mt-4 w-full py-2 text-sm text-green-700 border border-green-300 rounded-xl hover:bg-green-50 transition"
            >
              🔄 Regenerar
            </button>
          )}
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700 border border-blue-100">
          <strong>Como funciona:</strong> A IA analisa seus serviços, avaliações e atividade dos últimos 30 dias e gera insights personalizados para ajudar você a crescer na plataforma.
        </div>
      </div>
    </div>
  )
}
