'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AgroCoreLogo from '@/components/AgroCoreLogo'
import { createClient } from '@/lib/supabase/client'

export default function NovaSenhaPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [pronto, setPronto] = useState(false)
  const [erroLink, setErroLink] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    // Fluxo principal: servidor trocou o code em /auth/callback e gravou sessão nos cookies
    // getSession() a encontra diretamente

    // Fallback implicit: hash com #access_token (links antigos ou clientes legacy)
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      const p = new URLSearchParams(hash.substring(1))
      const accessToken = p.get('access_token')
      const refreshToken = p.get('refresh_token') ?? ''
      if (p.get('type') === 'recovery' && accessToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error }) => {
            if (!error) {
              setPronto(true)
              window.history.replaceState({}, '', window.location.pathname)
            } else {
              setErroLink(error.message)
            }
          })
        return
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setPronto(true)
      else setErroLink('Link não encontrado. Solicite um novo link de recuperação.')
    })
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    setErro('')
    const { error } = await supabase.auth.updateUser({ password: senha })
    if (error) { setErro(`Erro: ${error.message}`); setLoading(false); return }
    router.push('/dashboard')
  }

  if (erroLink) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">⏰</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Link expirado</h1>
          <p className="text-gray-500 mb-6">Este link já foi usado ou expirou. Solicite um novo.</p>
          <Link href="/recuperar-senha" className="block w-full py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition text-center">
            Solicitar novo link
          </Link>
        </div>
      </div>
    )
  }

  if (!pronto) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🔐</div>
          <p className="text-gray-500">Validando link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><AgroCoreLogo size={36} textColor="text-green-700" /></Link>
          <p className="text-gray-500 mt-2">Criar nova senha</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-900 bg-white"
              placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
            <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-900 bg-white"
              placeholder="••••••••" />
          </div>
          {erro && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{erro}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-green-700 text-white font-bold text-lg rounded-xl hover:bg-green-800 transition disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
