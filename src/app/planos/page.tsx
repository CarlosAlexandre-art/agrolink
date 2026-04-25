'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const PLANOS = [
  {
    id: 'free',
    nome: 'Grátis',
    preco: 'R$ 0',
    nota: 'para sempre',
    cor: 'border-gray-200',
    destaque: false,
    badge: null,
    desc: 'Para quem está começando a contratar serviços rurais.',
    features: [
      { txt: '1 serviço ativo por vez',         ok: true },
      { txt: 'Acesso a todos os prestadores',   ok: true },
      { txt: 'Chat integrado',                  ok: true },
      { txt: 'Rastreamento em tempo real',       ok: true },
      { txt: 'Urgência ALTA',                   ok: false },
      { txt: 'Até 5 serviços simultâneos',      ok: false },
      { txt: 'Histórico completo',              ok: false },
      { txt: 'Suporte prioritário',             ok: false },
    ],
    priceId: null,
    cta: 'Plano atual',
  },
  {
    id: 'pro',
    nome: 'Pro',
    preco: 'R$ 97',
    nota: '/mês',
    cor: 'border-green-500 ring-2 ring-green-500',
    destaque: true,
    badge: '🌿 Mais popular',
    desc: 'Para produtores com demanda frequente de serviços.',
    features: [
      { txt: 'Até 5 serviços simultâneos',      ok: true },
      { txt: 'Acesso a todos os prestadores',   ok: true },
      { txt: 'Chat integrado',                  ok: true },
      { txt: 'Rastreamento em tempo real',       ok: true },
      { txt: 'Urgência ALTA liberada',          ok: true },
      { txt: 'Histórico completo',              ok: true },
      { txt: 'Suporte por e-mail',              ok: true },
      { txt: 'Suporte WhatsApp 24/7',           ok: false },
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || null,
    cta: 'Assinar Pro',
  },
  {
    id: 'enterprise',
    nome: 'Enterprise',
    preco: 'R$ 297',
    nota: '/mês',
    cor: 'border-gray-800',
    destaque: false,
    badge: '👑 Completo',
    desc: 'Para grandes operações com múltiplos contratos simultâneos.',
    features: [
      { txt: 'Serviços ilimitados',             ok: true },
      { txt: 'Acesso a todos os prestadores',   ok: true },
      { txt: 'Chat integrado',                  ok: true },
      { txt: 'Rastreamento em tempo real',       ok: true },
      { txt: 'Urgência ALTA + prioridade',      ok: true },
      { txt: 'Histórico completo + relatórios', ok: true },
      { txt: 'Suporte WhatsApp 24/7',           ok: true },
      { txt: 'Onboarding personalizado',        ok: true },
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || null,
    cta: 'Assinar Enterprise',
  },
]

export default function PlanosPage() {
  const [planoAtual, setPlanoAtual] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const res = await fetch('/api/perfil/me')
      if (res.ok) {
        const data = await res.json()
        setPlanoAtual(data.plan ?? 'free')
      }
    })
    if (new URLSearchParams(window.location.search).get('sucesso') === '1') {
      setSucesso(true)
    }
  }, [])

  async function handleAssinar(priceId: string, planoId: string) {
    setLoading(planoId)
    try {
      const res = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoadingPortal(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-white hover:text-green-200">← Voltar</Link>
          <h1 className="font-bold text-lg">Planos AgroCore</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {sucesso && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <div className="font-bold">Assinatura ativada!</div>
              <div className="text-sm text-green-700">Seu plano foi atualizado. Aproveite todos os benefícios.</div>
            </div>
          </div>
        )}

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Escolha seu plano</h2>
          <p className="text-gray-500">Sem fidelidade. Cancele quando quiser.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANOS.map(plano => {
            const isCurrent = planoAtual === plano.id || (planoAtual === 'admin')
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
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-gray-900">{plano.preco}</span>
                    <span className="text-sm text-gray-400 mb-0.5">{plano.nota}</span>
                  </div>
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
                    {isCurrent && plano.id !== 'free' ? '✓ Plano atual' : plano.id === 'free' && planoAtual === 'free' ? '✓ Plano atual' : plano.cta}
                  </div>
                ) : (
                  <button
                    onClick={() => plano.priceId ? handleAssinar(plano.priceId, plano.id) : undefined}
                    disabled={loading === plano.id || !plano.priceId}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${plano.destaque ? 'bg-green-700 text-white hover:bg-green-800' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                  >
                    {loading === plano.id ? 'Redirecionando...' : plano.cta}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Gerenciar assinatura — só para quem tem plano pago */}
        {planoAtual && planoAtual !== 'free' && planoAtual !== 'admin' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between gap-4">
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

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Perguntas frequentes</h3>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Sem fidelidade ou multa. Cancele direto no painel.' },
              { q: 'O plano Grátis tem limite de tempo?', a: 'Não. É gratuito para sempre, com 1 serviço ativo por vez.' },
              { q: 'O que é "serviço ativo"?', a: 'É um pedido de serviço em andamento (procurando prestador, aceito ou em execução).' },
              { q: 'Como funciona o suporte Enterprise?', a: 'Atendimento prioritário via WhatsApp com resposta em até 2 horas.' },
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
