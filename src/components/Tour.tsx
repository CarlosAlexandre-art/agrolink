'use client'

import { useState, useEffect } from 'react'

type TourStep = {
  alvo: string // CSS selector
  titulo: string
  texto: string
  posicao?: 'top' | 'bottom' | 'left' | 'right'
}

const TOUR_PRODUTOR: TourStep[] = [
  {
    alvo: '[data-tour="solicitar"]',
    titulo: '🌾 Solicitar Serviço',
    texto: 'Clique aqui para solicitar um serviço rural. Leva menos de 1 minuto.',
    posicao: 'bottom',
  },
  {
    alvo: '[data-tour="status"]',
    titulo: '📊 Seus serviços',
    texto: 'Aqui aparecem seus serviços em andamento. Clique em um para acompanhar em tempo real.',
    posicao: 'bottom',
  },
  {
    alvo: '[data-tour="nav-historico"]',
    titulo: '📋 Histórico',
    texto: 'Veja todos os serviços já realizados.',
    posicao: 'top',
  },
  {
    alvo: '[data-tour="nav-perfil"]',
    titulo: '👤 Perfil',
    texto: 'Edite seus dados e veja suas informações.',
    posicao: 'top',
  },
]

const TOUR_PRESTADOR: TourStep[] = [
  {
    alvo: '[data-tour="disponivel"]',
    titulo: '🟢 Disponibilidade',
    texto: 'Ative esse botão para receber chamados. Desative quando não quiser trabalhar.',
    posicao: 'bottom',
  },
  {
    alvo: '[data-tour="chamados"]',
    titulo: '🔔 Chamados',
    texto: 'Aqui aparecem os pedidos de serviço próximos a você. Aceite ou recuse.',
    posicao: 'bottom',
  },
  {
    alvo: '[data-tour="nav-ganhos"]',
    titulo: '💰 Ganhos',
    texto: 'Acompanhe seu faturamento e histórico de pagamentos.',
    posicao: 'top',
  },
  {
    alvo: '[data-tour="nav-perfil"]',
    titulo: '👤 Perfil',
    texto: 'Configure seus serviços oferecidos e seus dados.',
    posicao: 'top',
  },
]

export default function Tour({ tipo }: { tipo: 'PRODUTOR' | 'PRESTADOR' }) {
  const [ativo, setAtivo] = useState(false)
  const [step, setStep] = useState(0)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, height: 0 })

  const steps = tipo === 'PRODUTOR' ? TOUR_PRODUTOR : TOUR_PRESTADOR
  const atual = steps[step]

  useEffect(() => {
    const tourFeito = localStorage.getItem(`tour_${tipo}`)
    if (!tourFeito) {
      setTimeout(() => setAtivo(true), 1000)
    }
  }, [tipo])

  useEffect(() => {
    if (!ativo) return
    const el = document.querySelector(atual.alvo)
    if (el) {
      const rect = el.getBoundingClientRect()
      setPos({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      })
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [ativo, step, atual.alvo])

  function proximo() {
    if (step < steps.length - 1) {
      setStep(s => s + 1)
    } else {
      encerrar()
    }
  }

  function encerrar() {
    localStorage.setItem(`tour_${tipo}`, 'done')
    setAtivo(false)
  }

  if (!ativo) return null

  const tooltipTop = pos.posicao === 'top' || atual.posicao === 'top'
    ? pos.top - 140
    : pos.top + pos.height + 12

  return (
    <>
      {/* Overlay escuro */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <div className="absolute inset-0 bg-black/60" />
        {/* Buraco destacando o elemento */}
        <div
          className="absolute rounded-xl ring-4 ring-white shadow-2xl"
          style={{
            top: pos.top - 4,
            left: pos.left - 4,
            width: pos.width + 8,
            height: pos.height + 8,
            background: 'transparent',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
          }}
        />
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white rounded-2xl shadow-2xl p-5 mx-4"
        style={{
          top: Math.max(tooltipTop, 80),
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: 360,
        }}
      >
        <div className="font-bold text-gray-800 text-lg mb-1">{atual.titulo}</div>
        <p className="text-gray-600 text-sm mb-4">{atual.texto}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? 'bg-green-600 w-4' : 'bg-gray-200 w-1.5'}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={encerrar}
              className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2"
            >
              Pular
            </button>
            <button
              onClick={proximo}
              className="px-4 py-2 bg-green-700 text-white text-sm font-bold rounded-xl hover:bg-green-800 transition"
            >
              {step === steps.length - 1 ? 'Concluir ✓' : 'Próximo →'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
