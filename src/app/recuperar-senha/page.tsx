'use client'

import { useState } from 'react'
import Link from 'next/link'
import AgroCoreLogo from '@/components/AgroCoreLogo'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/nova-senha`,
    })

    if (error) {
      if (error.message?.includes('60 seconds') || error.status === 429) {
        setErro('Aguarde 1 minuto antes de solicitar outro link.')
      } else {
        setErro(`Erro: ${error.message}`)
      }
      setLoading(false)
      return
    }

    setEnviado(true)
    setLoading(false)
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Email enviado!</h1>
          <p className="text-gray-500 mb-6">
            Verifique sua caixa de entrada e clique no link para redefinir sua senha.
          </p>
          <Link href="/login" className="text-green-700 font-semibold hover:underline">
            ← Voltar ao login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><AgroCoreLogo size={36} textColor="text-green-700" /></Link>
          <p className="text-gray-500 mt-2">Recuperar senha</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seu email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-900 bg-white"
              placeholder="seu@email.com"
            />
          </div>

          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-green-700 text-white font-bold text-lg rounded-xl hover:bg-green-800 transition disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Lembrou a senha?{' '}
          <Link href="/login" className="text-green-700 font-semibold hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
