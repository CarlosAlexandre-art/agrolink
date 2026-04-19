'use client'

import Link from 'next/link'

interface Props {
  planoAtual: string
  limite: number
  onClose: () => void
}

const FEATURES: Record<string, string[]> = {
  free:       ['1 serviço ativo por vez', 'Sem urgência ALTA', 'Suporte via FAQ'],
  pro:        ['Até 5 serviços simultâneos', 'Urgência ALTA liberada', 'Suporte por e-mail'],
  enterprise: ['Serviços ilimitados', 'Urgência ALTA + prioridade', 'Suporte WhatsApp 24/7'],
}

export default function PlanoUpgradeModal({ planoAtual, limite, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">🚀</div>
          <h2 className="text-xl font-bold text-gray-900">Limite atingido</h2>
          <p className="text-sm text-gray-500 mt-1">
            Seu plano <span className="font-semibold capitalize">{planoAtual}</span> permite{' '}
            <span className="font-semibold text-green-700">{limite} serviço{limite > 1 ? 's' : ''} ativo{limite > 1 ? 's' : ''}</span> por vez.
          </p>
        </div>

        {/* Planos */}
        <div className="space-y-3 mb-5">
          {/* Pro */}
          <div className="border-2 border-green-500 rounded-2xl p-4 bg-green-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-green-800 text-base">Pro</span>
              <span className="text-green-700 font-bold text-lg">R$ 97<span className="text-sm font-normal">/mês</span></span>
            </div>
            <ul className="space-y-1">
              {FEATURES.pro.map(f => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-green-800">
                  <span className="text-green-600 font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Enterprise */}
          <div className="border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-800 text-base">Enterprise</span>
              <span className="text-gray-700 font-bold text-lg">R$ 297<span className="text-sm font-normal">/mês</span></span>
            </div>
            <ul className="space-y-1">
              {FEATURES.enterprise.map(f => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="text-gray-500 font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTAs */}
        <Link
          href="/planos"
          onClick={onClose}
          className="block w-full py-3 bg-green-700 text-white font-bold text-center rounded-xl hover:bg-green-800 active:scale-95 transition mb-2"
        >
          Ver planos e assinar
        </Link>
        <button
          onClick={onClose}
          className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition"
        >
          Agora não
        </button>
      </div>
    </div>
  )
}
