'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SERVICOS } from '@/lib/constants'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function CadastroForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipoParam = searchParams.get('tipo') as 'PRODUTOR' | 'PRESTADOR' | null

  const [step, setStep] = useState(tipoParam ? 2 : 1)
  const [tipo, setTipo] = useState<'PRODUTOR' | 'PRESTADOR'>(tipoParam || 'PRODUTOR')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [nomeFazenda, setNomeFazenda] = useState('')
  const [servicosSelecionados, setServicos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [erro, setErro] = useState('')

  async function cadastrarGoogle() {
    setLoadingGoogle(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${APP_URL}/api/auth/callback?next=/perfil/completar`,
      },
    })
  }

  function toggleServico(value: string) {
    setServicos(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    )
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, telefone, tipo }
      }
    })

    if (error) {
      setErro(error.message)
      setLoading(false)
      return
    }

    // Criar perfil via API
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supabaseId: data.user?.id,
        nome,
        email,
        telefone,
        tipo,
        nomeFazenda: tipo === 'PRODUTOR' ? nomeFazenda : undefined,
        servicosOferecidos: tipo === 'PRESTADOR' ? servicosSelecionados : undefined,
      })
    })

    if (!res.ok) {
      setErro('Erro ao criar perfil. Tente novamente.')
      setLoading(false)
      return
    }

    window.location.href = `/bem-vindo?tipo=${tipo}`
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="text-3xl font-bold text-green-700">🌿 AgroCore</Link>
          <p className="text-gray-500 mt-2">Criar conta gratuita</p>
        </div>

        {/* Step 1 — escolher tipo */}
        {step === 1 && (
          <div className="space-y-4">
            <button
              onClick={cadastrarGoogle}
              disabled={loadingGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loadingGoogle ? 'Redirecionando...' : 'Cadastrar com Google'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">ou escolha seu perfil</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <p className="text-center font-semibold text-gray-700 text-lg">Você é:</p>
            <button
              onClick={() => { setTipo('PRODUTOR'); setStep(2) }}
              className="w-full p-5 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition text-left"
            >
              <div className="text-3xl mb-1">🌾</div>
              <div className="font-bold text-gray-800">Produtor Rural</div>
              <div className="text-sm text-gray-500">Quero contratar serviços para minha propriedade</div>
            </button>
            <button
              onClick={() => { setTipo('PRESTADOR'); setStep(2) }}
              className="w-full p-5 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition text-left"
            >
              <div className="text-3xl mb-1">🔧</div>
              <div className="font-bold text-gray-800">Prestador de Serviço</div>
              <div className="text-sm text-gray-500">Quero oferecer meus serviços rurais</div>
            </button>
          </div>
        )}

        {/* Step 2 — dados */}
        {step === 2 && (
          <form onSubmit={handleCadastro} className="space-y-4">
            <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg">
              <span className="text-xl">{tipo === 'PRODUTOR' ? '🌾' : '🔧'}</span>
              <span className="font-semibold text-green-700">
                {tipo === 'PRODUTOR' ? 'Produtor Rural' : 'Prestador de Serviço'}
              </span>
              <button type="button" onClick={() => setStep(1)} className="ml-auto text-sm text-gray-500 hover:text-gray-700">
                Trocar
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-900 bg-white"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-900 bg-white"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input
                type="tel"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-900 bg-white"
                placeholder="(99) 99999-9999"
              />
            </div>

            {tipo === 'PRODUTOR' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da fazenda (opcional)</label>
                <input
                  type="text"
                  value={nomeFazenda}
                  onChange={e => setNomeFazenda(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-900 bg-white"
                  placeholder="Fazenda Boa Vista"
                />
              </div>
            )}

            {tipo === 'PRESTADOR' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quais serviços você oferece?</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {SERVICOS.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => toggleServico(s.value)}
                      className={`p-2 border rounded-lg text-left text-sm transition ${
                        servicosSelecionados.includes(s.value)
                          ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg text-gray-900 bg-white"
                placeholder="Mínimo 6 caracteres"
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
              {loading ? 'Criando conta...' : 'Criar conta gratuita'}
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-green-700 font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-green-50 flex items-center justify-center"><div className="text-green-700 font-semibold">Carregando...</div></div>}>
      <CadastroForm />
    </Suspense>
  )
}
