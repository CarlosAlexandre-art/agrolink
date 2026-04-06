'use client'

import { useState } from 'react'

export default function ConnectStripeButton({ conectado }: { conectado: boolean }) {
  const [loading, setLoading] = useState(false)

  async function handleConnect() {
    setLoading(true)
    const res = await fetch('/api/stripe/connect', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert('Erro ao conectar conta. Tente novamente.')
      setLoading(false)
    }
  }

  if (conectado) {
    return (
      <div className="w-full py-4 bg-green-50 border-2 border-green-500 text-green-700 text-center font-bold rounded-2xl">
        ✅ Conta bancária conectada
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition disabled:opacity-50"
    >
      {loading ? 'Redirecionando...' : '🏦 Conectar conta para receber pagamentos'}
    </button>
  )
}
