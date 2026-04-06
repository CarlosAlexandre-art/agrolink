'use client'

import { useState } from 'react'
import Link from 'next/link'

const MOTIVOS = [
  'Tentativa de golpe ou fraude',
  'Pagamento combinado fora da plataforma',
  'Serviço não realizado / calote',
  'Perfil falso ou dados incorretos',
  'Assédio ou ameaças',
  'Comportamento inadequado',
  'Outro motivo',
]

export default function DenunciarPage() {
  const [motivo, setMotivo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [emailDenunciado, setEmailDenunciado] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    if (!motivo || !descricao) return
    setLoading(true)

    await fetch('/api/denuncias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo, descricao, emailDenunciado }),
    })

    setEnviado(true)
    setLoading(false)
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center max-w-sm w-full">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="font-bold text-gray-800 text-xl mb-2">Denúncia recebida</h2>
          <p className="text-gray-600 text-sm mb-6">
            Analisaremos sua denúncia em até 48 horas. Obrigado por ajudar a manter a plataforma segura.
          </p>
          <Link
            href="/dashboard"
            className="block w-full py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-red-600 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/ajuda" className="text-white hover:text-red-200">← Voltar</Link>
          <h1 className="font-bold text-lg">🚨 Fazer Denúncia</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Importante:</strong> Sua denúncia é confidencial. Investigaremos o caso e tomaremos as medidas necessárias, incluindo suspensão ou banimento da conta denunciada.
          </p>
        </div>

        <form onSubmit={handleEnviar} className="space-y-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo da denúncia *</label>
              <div className="space-y-2">
                {MOTIVOS.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMotivo(m)}
                    className={`w-full p-3 border-2 rounded-xl text-left text-sm transition ${
                      motivo === m
                        ? 'border-red-500 bg-red-50 text-red-700 font-semibold'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email ou nome do usuário denunciado (opcional)
              </label>
              <input
                type="text"
                value={emailDenunciado}
                onChange={e => setEmailDenunciado(e.target.value)}
                placeholder="email@exemplo.com ou nome do usuário"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm text-gray-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descreva o ocorrido *
              </label>
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                required
                rows={4}
                placeholder="Conte o que aconteceu com o máximo de detalhes possível..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm text-gray-900 bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!motivo || !descricao || loading}
            className="w-full py-4 bg-red-600 text-white font-bold text-lg rounded-2xl hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? 'Enviando...' : '🚨 Enviar denúncia'}
          </button>
        </form>
      </div>
    </div>
  )
}
