'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AgroCoreLogo from '@/components/AgroCoreLogo'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function AgroSEntrarContent() {
  const params = useSearchParams()
  const router = useRouter()
  const emailParam = params.get('email') || ''
  const serviceId = params.get('serviceId') || ''

  const [email, setEmail] = useState(emailParam)
  const [senha, setSenha] = useState('')
  const [modo, setModo] = useState<'verificando' | 'login' | 'cadastrar' | 'link-enviado'>(
    emailParam ? 'verificando' : 'login'
  )
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [erro, setErro] = useState('')

  async function loginGoogle() {
    setLoadingGoogle(true)
    const supabase = createClient()
    const next = serviceId ? `/rastrear/${serviceId}` : '/dashboard'
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${APP_URL}/api/auth/callback?next=${next}` },
    })
  }

  useEffect(() => {
    if (!emailParam) return
    fetch(`/api/auth/verificar-email?email=${encodeURIComponent(emailParam)}`)
      .then(r => r.json())
      .then(d => setModo(d.existe ? 'login' : 'cadastrar'))
      .catch(() => setModo('login'))
  }, [emailParam])

  async function handleLogin(ev: { preventDefault(): void }) {
    ev.preventDefault()
    setLoading(true)
    setErro('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('Email ou senha incorretos.')
      setLoading(false)
      return
    }
    router.push(serviceId ? `/rastrear/${serviceId}` : '/dashboard')
  }

  async function handleEnviarLink(ev: { preventDefault(): void }) {
    ev.preventDefault()
    setLoading(true)
    setErro('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    })
    setLoading(false)
    if (error) {
      setErro('Erro ao enviar email. Tente novamente.')
      return
    }
    setModo('link-enviado')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-sm mx-auto flex items-center gap-3">
          <AgroCoreLogo size={30} showSubtitle subtitleColor="text-green-300" />
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-sm space-y-5">

          {/* Banner AgroOS */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3 items-start">
            <span className="text-2xl">🔗</span>
            <div>
              <div className="font-semibold text-green-800 text-sm">Vindo do AgroOS</div>
              <div className="text-xs text-green-700 mt-0.5">
                {serviceId
                  ? 'Acesse sua conta para acompanhar o serviço solicitado.'
                  : 'Acesse ou crie sua conta gratuita como produtor.'}
              </div>
            </div>
          </div>

          {modo === 'verificando' && (
            <div className="text-center py-8 text-gray-400 animate-pulse">Verificando...</div>
          )}

          {modo === 'login' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h1 className="font-bold text-gray-800 text-lg">Entrar no AgroCore</h1>

              <button
                onClick={loginGoogle}
                disabled={loadingGoogle}
                className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loadingGoogle ? 'Redirecionando...' : 'Entrar com Google'}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">ou entre com email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">Senha</label>
                  <input
                    type="password"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">{erro}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition disabled:opacity-50"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
              <div className="text-center">
                <Link href="/recuperar-senha" className="text-xs text-green-700 hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="border-t pt-3 text-center">
                <p className="text-xs text-gray-400">Não tem conta ainda?</p>
                <button
                  onClick={() => setModo('cadastrar')}
                  className="text-xs text-green-700 font-semibold hover:underline mt-1"
                >
                  Criar conta gratuita como produtor
                </button>
              </div>
            </div>
          )}

          {modo === 'cadastrar' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <h1 className="font-bold text-gray-800 text-lg">Criar conta gratuita</h1>
              <p className="text-sm text-gray-500">
                Enviaremos um link para você definir sua senha e acessar o AgroCore como <strong>produtor</strong>.
              </p>
              <form onSubmit={handleEnviarLink} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                {erro && <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">{erro}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Receber link de acesso'}
                </button>
              </form>
              <div className="border-t pt-3 text-center">
                <button
                  onClick={() => setModo('login')}
                  className="text-xs text-green-700 font-semibold hover:underline"
                >
                  Já tenho conta — Entrar
                </button>
              </div>
            </div>
          )}

          {modo === 'link-enviado' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-3">
              <div className="text-5xl">📧</div>
              <h2 className="font-bold text-gray-800">Email enviado!</h2>
              <p className="text-sm text-gray-500">
                Verifique sua caixa de entrada e clique no link para definir sua senha e acessar o AgroCore.
              </p>
              {serviceId && (
                <Link
                  href={`/rastrear/${serviceId}`}
                  className="block mt-3 py-3 border-2 border-green-700 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition text-sm"
                >
                  Ver status do serviço agora
                </Link>
              )}
            </div>
          )}

          {serviceId && modo !== 'link-enviado' && (
            <Link
              href={`/rastrear/${serviceId}`}
              className="block text-center text-sm text-gray-400 hover:text-green-700 transition"
            >
              Acompanhar serviço sem login →
            </Link>
          )}

        </div>
      </div>
    </div>
  )
}

export default function AgroSEntrarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <AgroCoreLogo size={28} textColor="text-green-700" subtitleColor="text-green-500" showSubtitle />
      </div>
    }>
      <AgroSEntrarContent />
    </Suspense>
  )
}
