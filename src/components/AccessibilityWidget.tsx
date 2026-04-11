'use client'

import { useState, useEffect } from 'react'

interface Prefs {
  textoGrande: boolean
  altoContraste: boolean
  reduzirAnimacoes: boolean
}

const PREFS_KEY = 'agrocore_acessibilidade'

function aplicarPrefs(prefs: Prefs) {
  const html = document.documentElement
  html.classList.toggle('acesso-texto-grande', prefs.textoGrande)
  html.classList.toggle('acesso-alto-contraste', prefs.altoContraste)
  html.classList.toggle('acesso-reduzir-animacoes', prefs.reduzirAnimacoes)
}

export default function AccessibilityWidget() {
  const [aberto, setAberto] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>({
    textoGrande: false,
    altoContraste: false,
    reduzirAnimacoes: false,
  })

  // Carrega preferências salvas
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(PREFS_KEY)
      if (salvo) {
        const p = JSON.parse(salvo) as Prefs
        setPrefs(p)
        aplicarPrefs(p)
      }
    } catch {}
  }, [])

  function togglePref(key: keyof Prefs) {
    const novas = { ...prefs, [key]: !prefs[key] }
    setPrefs(novas)
    aplicarPrefs(novas)
    localStorage.setItem(PREFS_KEY, JSON.stringify(novas))
  }

  const algumAtivo = prefs.textoGrande || prefs.altoContraste || prefs.reduzirAnimacoes

  return (
    <div className="fixed bottom-24 left-4 z-50">
      {/* Painel de opções */}
      {aberto && (
        <div className="absolute bottom-16 left-0 bg-white rounded-2xl shadow-2xl border border-gray-200 w-64 overflow-hidden mb-1">
          <div className="bg-green-700 px-4 py-3 flex items-center justify-between">
            <div className="text-white font-bold text-sm">Acessibilidade</div>
            <button
              onClick={() => setAberto(false)}
              className="text-white hover:text-green-200 text-xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="p-4 space-y-3">
            <Toggle
              label="Texto maior"
              descricao="Aumenta o tamanho das letras"
              ativo={prefs.textoGrande}
              onChange={() => togglePref('textoGrande')}
            />
            <Toggle
              label="Alto contraste"
              descricao="Melhora visibilidade das cores"
              ativo={prefs.altoContraste}
              onChange={() => togglePref('altoContraste')}
            />
            <Toggle
              label="Reduzir animações"
              descricao="Remove movimentos e transições"
              ativo={prefs.reduzirAnimacoes}
              onChange={() => togglePref('reduzirAnimacoes')}
            />

            <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 text-center">
              Preferências salvas automaticamente
            </div>
          </div>
        </div>
      )}

      {/* Botão ♿ */}
      <button
        onClick={() => setAberto(prev => !prev)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl transition active:scale-95 relative ${
          algumAtivo
            ? 'bg-green-700 text-white'
            : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-green-500 hover:text-green-700'
        }`}
        title="Opções de acessibilidade"
        aria-label="Abrir opções de acessibilidade"
      >
        ♿
        {algumAtivo && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white" />
        )}
      </button>
    </div>
  )
}

function Toggle({
  label,
  descricao,
  ativo,
  onChange,
}: {
  label: string
  descricao: string
  ativo: boolean
  onChange: () => void
}) {
  return (
    <button
      onClick={onChange}
      className="w-full flex items-center justify-between gap-3 text-left group"
      role="switch"
      aria-checked={ativo}
    >
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        <div className="text-xs text-gray-500">{descricao}</div>
      </div>
      <div className={`w-11 h-6 rounded-full transition flex-shrink-0 flex items-center px-0.5 ${
        ativo ? 'bg-green-600' : 'bg-gray-300'
      }`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
          ativo ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </div>
    </button>
  )
}
