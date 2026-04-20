'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AgroCoreLogo from '@/components/AgroCoreLogo'

export default function CompletarPerfilPage() {
  const router = useRouter()
  const [tipo, setTipo] = useState<'PRODUTOR' | 'PRESTADOR' | null>(null)
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSalvar() {
    if (!tipo) return
    setLoading(true)
    setErro('')

    const res = await fetch('/api/perfil/completar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, telefone }),
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      const data = await res.json()
      setErro(data.error || 'Erro ao salvar perfil.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><AgroCoreLogo size={36} textColor="text-green-700" /></Link>
          <p className="text-gray-700 font-semibold mt-3 text-lg">Bem-vindo! Só mais um passo.</p>
          <p className="text-gray-500 text-sm mt-1">Como você vai usar o AgroCore?</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setTipo('PRODUTOR')}
            className={`p-5 rounded-2xl border-2 text-center transition ${
              tipo === 'PRODUTOR'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-4xl mb-2">🌾</div>
            <div className="font-bold text-gray-800">Sou Produtor</div>
            <div className="text-xs text-gray-500 mt-1">Quero contratar serviços rurais</div>
          </button>

          <button
            onClick={() => setTipo('PRESTADOR')}
            className={`p-5 rounded-2xl border-2 text-center transition ${
              tipo === 'PRESTADOR'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-4xl mb-2">🔧</div>
            <div className="font-bold text-gray-800">Sou Prestador</div>
            <div className="text-xs text-gray-500 mt-1">Quero oferecer serviços rurais</div>
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp (opcional, para notificações)
          </label>
          <input
            type="tel"
            value={telefone}
            onChange={e => setTelefone(e.target.value)}
            placeholder="(85) 99999-9999"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
          />
        </div>

        {erro && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4">
            {erro}
          </div>
        )}

        <button
          onClick={handleSalvar}
          disabled={!tipo || loading}
          className="w-full py-4 bg-green-700 text-white font-bold text-lg rounded-xl hover:bg-green-800 transition disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Entrar no AgroCore →'}
        </button>
      </div>
    </div>
  )
}
