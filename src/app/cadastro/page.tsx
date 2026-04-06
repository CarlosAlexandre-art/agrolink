'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SERVICOS } from '@/lib/constants'

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
  const [erro, setErro] = useState('')

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
          <Link href="/" className="text-3xl font-bold text-green-700">🌿 AgroLink</Link>
          <p className="text-gray-500 mt-2">Criar conta gratuita</p>
        </div>

        {/* Step 1 — escolher tipo */}
        {step === 1 && (
          <div className="space-y-4">
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
                          : 'border-gray-200 hover:border-gray-300'
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
