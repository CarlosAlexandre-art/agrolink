'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Plano = {
  id: string
  nome: string
  precoMensal: string
  precoAnual: string
  notaMensal: string
  notaAnual: string
  cor: string
  destaque: boolean
  badge: string | null
  desc: string
  features: { txt: string; ok: boolean }[]
  priceIdMensal: string | null
  priceIdAnual: string | null
  cta: string
}

const PLANOS_PRESTADOR: Plano[] = [
  {
    id: 'free',
    nome: 'Grátis',
    precoMensal: 'R$ 0',
    precoAnual: 'R$ 0',
    notaMensal: 'para sempre',
    notaAnual: 'para sempre',
    cor: 'border-gray-200',
    destaque: false,
    badge: null,
    desc: 'Para prestadores que estão começando na plataforma.',
    features: [
      { txt: 'Perfil visível na plataforma',    ok: true  },
      { txt: 'Receber pedidos de serviço',       ok: true  },
      { txt: 'Chat integrado',                   ok: true  },
      { txt: 'Rastreamento em tempo real',        ok: true  },
      { txt: 'Destaque nos resultados de busca', ok: false },
      { txt: 'Banner na plataforma',             ok: false },
      { txt: 'Melhores oportunidades primeiro',  ok: false },
      { txt: 'Suporte prioritário',              ok: false },
      { txt: 'Gestor de conta dedicado',         ok: false },
    ],
    priceIdMensal: null,
    priceIdAnual: null,
    cta: 'Plano atual',
  },
  {
    id: 'pro',
    nome: 'Pro Prestador',
    precoMensal: 'R$ 79',
    precoAnual: 'R$ 800',
    notaMensal: '/mês',
    notaAnual: '/ano · R$ 66/mês',
    cor: 'border-green-500 ring-2 ring-green-500',
    destaque: true,
    badge: '⚡ Mais popular',
    desc: 'Destaque seu perfil e feche mais contratos.',
    features: [
      { txt: 'Perfil visível na plataforma',    ok: true },
      { txt: 'Receber pedidos de serviço',       ok: true },
      { txt: 'Chat integrado',                   ok: true },
      { txt: 'Rastreamento em tempo real',        ok: true },
      { txt: 'Destaque nos resultados de busca', ok: true },
      { txt: 'Banner na plataforma',             ok: true },
      { txt: 'Melhores oportunidades primeiro',  ok: true },
      { txt: 'Suporte prioritário',              ok: true },
      { txt: 'Gestor de conta dedicado',         ok: false },
    ],
    priceIdMensal: process.env.NEXT_PUBLIC_STRIPE_PRESTADOR_MENSAL_PRICE_ID || null,
    priceIdAnual:  process.env.NEXT_PUBLIC_STRIPE_PRESTADOR_ANUAL_PRICE_ID  || null,
    cta: 'Assinar Pro Prestador',
  },
]

const PLANOS_PRODUTOR: Plano[] = [
  {
    id: 'free',
    nome: 'Grátis',
    precoMensal: 'R$ 0',
    precoAnual: 'R$ 0',
    notaMensal: 'para sempre',
    notaAnual: 'para sempre',
    cor: 'border-gray-200',
    destaque: false,
    badge: null,
    desc: 'Para quem está começando a contratar serviços rurais.',
    features: [
      { txt: '1 serviço ativo por vez',           ok: true  },
      { txt: 'Acesso a todos os prestadores',     ok: true  },
      { txt: 'Chat integrado',                    ok: true  },
      { txt: 'Rastreamento em tempo real',         ok: true  },
      { txt: 'Urgência ALTA',                     ok: false },
      { txt: 'Até 5 serviços simultâneos',        ok: false },
      { txt: 'Histórico completo',                ok: false },
      { txt: 'Suporte prioritário',               ok: false },
      { txt: 'Gestor dedicado + API access',      ok: false },
    ],
    priceIdMensal: null,
    priceIdAnual: null,
    cta: 'Plano atual',
  },
  {
    id: 'pro',
    nome: 'Pro Produtor',
    precoMensal: 'R$ 89',
    precoAnual: 'R$ 900',
    notaMensal: '/mês',
    notaAnual: '/ano · R$ 75/mês',
    cor: 'border-green-500 ring-2 ring-green-500',
    destaque: true,
    badge: '🌿 Mais popular',
    desc: 'Para produtores com demanda frequente de serviços.',
    features: [
      { txt: 'Até 5 serviços simultâneos',        ok: true },
      { txt: 'Acesso a todos os prestadores',     ok: true },
      { txt: 'Chat integrado',                    ok: true },
      { txt: 'Rastreamento em tempo real',         ok: true },
      { txt: 'Urgência ALTA liberada',            ok: true },
      { txt: 'Histórico completo',                ok: true },
      { txt: 'Melhores propostas primeiro',       ok: true },
      { txt: 'Suporte prioritário',               ok: true },
      { txt: 'Gestor dedicado + API access',      ok: false },
    ],
    priceIdMensal: process.env.NEXT_PUBLIC_STRIPE_PRODUTOR_MENSAL_PRICE_ID || null,
    priceIdAnual:  process.env.NEXT_PUBLIC_STRIPE_PRODUTOR_ANUAL_PRICE_ID  || null,
    cta: 'Assinar Pro',
  },
]

export default function PlanosPage() {
  const [planoAtual, setPlanoAtual] = useState<string | null>(null)
  const [tipo, setTipo] = useState<'PRODUTOR' | 'PRESTADOR' | null>(null)
  const [periodo, setPeriodo] = useState<'mensal' | 'anual'>('mensal')
  const [loading, setLoading] = useState<string | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')
  const [priceIds, setPriceIds] = useState<{
    prestadorMensal: string | null
    prestadorAnual: string | null
    produtorMensal: string | null
    produtorAnual: string | null
  } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const res = await fetch('/api/perfil/me')
      if (res.ok) {
        const data = await res.json()
        setPlanoAtual(data.plan ?? 'free')
        setTipo(data.tipo ?? 'PRODUTOR')
        setPriceIds(data.priceIds ?? null)
      }
    })
    if (new URLSearchParams(window.location.search).get('sucesso') === '1') {
      setSucesso(true)
    }
  }, [])

  const planos = tipo === 'PRESTADOR'
    ? PLANOS_PRESTADOR.map(p => ({
        ...p,
        priceIdMensal: p.id === 'pro' ? (priceIds?.prestadorMensal ?? p.priceIdMensal) : p.priceIdMensal,
        priceIdAnual:  p.id === 'pro' ? (priceIds?.prestadorAnual  ?? p.priceIdAnual)  : p.priceIdAnual,
      }))
    : PLANOS_PRODUTOR.map(p => ({
        ...p,
        priceIdMensal: p.id === 'pro' ? (priceIds?.produtorMensal ?? p.priceIdMensal) : p.priceIdMensal,
        priceIdAnual:  p.id === 'pro' ? (priceIds?.produtorAnual  ?? p.priceIdAnual)  : p.priceIdAnual,
      }))

  async function handleAssinar(priceId: string, planoId: string) {
    setLoading(planoId)
    setErro('')
    try {
      const res = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setErro(data.error || 'Erro ao iniciar checkout. Tente novamente.')
      }
    } catch {
      setErro('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoadingPortal(true)
    setErro('')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setErro(data.error || 'Erro ao abrir portal. Tente novamente.')
      }
    } catch {
      setErro('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoadingPortal(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-white hover:text-green-200">← Voltar</Link>
          <h1 className="font-bold text-lg">Planos AgroCore</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {sucesso && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <div className="font-bold">Assinatura ativada!</div>
              <div className="text-sm text-green-700">Seu plano foi atualizado. Aproveite todos os benefícios.</div>
            </div>
          </div>
        )}

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Escolha seu plano</h2>
          <p className="text-gray-500">
            {tipo === 'PRESTADOR'
              ? 'Destaque seu perfil e feche mais contratos.'
              : 'Contrate com mais agilidade e recursos.'}
            {' '}Cancele quando quiser.
          </p>

          {/* Toggle mensal / anual */}
          <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setPeriodo('mensal')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                periodo === 'mensal'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setPeriodo('anual')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                periodo === 'anual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Anual
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                2 meses grátis
              </span>
            </button>
          </div>
        </div>

        {erro && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
            ⚠️ {erro}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {planos.map(plano => {
            const isCurrent = planoAtual === plano.id || (plano.id !== 'free' && planoAtual === 'admin')
            const preco = periodo === 'anual' ? plano.precoAnual : plano.precoMensal
            const nota  = periodo === 'anual' ? plano.notaAnual  : plano.notaMensal
            const priceId = periodo === 'anual' ? plano.priceIdAnual : plano.priceIdMensal

            return (
              <div
                key={plano.id}
                className={`relative bg-white rounded-2xl border p-6 flex flex-col shadow-sm ${plano.cor}`}
              >
                {plano.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${plano.destaque ? 'bg-green-600' : 'bg-gray-800'}`}>
                      {plano.badge}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{plano.nome}</h3>
                  <p className="text-xs text-gray-400 mb-3">{plano.desc}</p>
                  <div className="flex items-end gap-1 flex-wrap">
                    <span className="text-3xl font-bold text-gray-900">{preco}</span>
                    <span className="text-sm text-gray-400 mb-0.5">{nota}</span>
                  </div>
                  {periodo === 'anual' && plano.id !== 'free' && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      Economia de{' '}
                      {plano.id === 'enterprise' && tipo === 'PRESTADOR' ? 'R$ 398'
                        : plano.id === 'enterprise' ? 'R$ 598'
                        : plano.id === 'pro' && tipo === 'PRESTADOR' ? 'R$ 148'
                        : 'R$ 168'}
                      {' '}por ano
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plano.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {f.ok ? (
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={f.ok ? 'text-gray-700' : 'text-gray-400'}>{f.txt}</span>
                    </li>
                  ))}
                </ul>

                {plano.id === 'free' || isCurrent ? (
                  <div className="w-full py-2.5 rounded-xl text-sm font-semibold text-center bg-gray-100 text-gray-400 cursor-default">
                    {isCurrent && plano.id !== 'free' ? '✓ Plano atual' : planoAtual === 'free' || planoAtual === null ? '✓ Plano atual' : plano.cta}
                  </div>
                ) : (
                  <button
                    onClick={() => priceId ? handleAssinar(priceId, plano.id) : undefined}
                    disabled={loading === plano.id || !priceId}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 bg-green-700 text-white hover:bg-green-800"
                  >
                    {loading === plano.id ? 'Redirecionando...' : plano.cta}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {planoAtual && planoAtual !== 'free' && planoAtual !== 'admin' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between gap-4 max-w-2xl mx-auto">
            <div>
              <div className="font-semibold text-gray-900">Gerenciar assinatura</div>
              <div className="text-sm text-gray-500">Altere método de pagamento, veja faturas ou cancele.</div>
            </div>
            <button
              onClick={handlePortal}
              disabled={loadingPortal}
              className="flex-shrink-0 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loadingPortal ? 'Abrindo...' : 'Abrir portal →'}
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-2xl mx-auto">
          <h3 className="font-bold text-gray-900 mb-4">Perguntas frequentes</h3>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Sem fidelidade ou multa. Cancele direto no painel.' },
              { q: 'O plano Grátis tem limite de tempo?', a: 'Não. É gratuito para sempre.' },
              tipo === 'PRESTADOR'
                ? { q: 'O que é "destaque nos resultados"?', a: 'Seu perfil aparece no topo das buscas de produtores na sua região.' }
                : { q: 'O que é "serviço ativo"?', a: 'É um pedido em andamento (procurando prestador, aceito ou em execução).' },
              tipo === 'PRESTADOR'
                ? { q: 'O plano Pro inclui suporte?', a: 'Sim. Suporte prioritário via e-mail com resposta em até 24h.' }
                : { q: 'O Pro permite quantos serviços simultâneos?', a: 'Até 5 serviços simultâneos, com urgência ALTA liberada.' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-sm font-semibold text-gray-900 mb-1">{item.q}</div>
                <div className="text-sm text-gray-500">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
