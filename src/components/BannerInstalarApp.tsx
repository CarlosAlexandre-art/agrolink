'use client'

import { useEffect, useState } from 'react'

export default function BannerInstalarApp() {
  const [prompt, setPrompt] = useState<any>(null)
  const [mostrar, setMostrar] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Não mostrar se já está instalado como PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // Não mostrar se usuário já dispensou
    if (sessionStorage.getItem('pwa_dispensado')) return

    // Detectar iOS (Safari não suporta beforeinstallprompt)
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    setIsIOS(ios)

    if (ios) {
      setMostrar(true)
      return
    }

    // Android/Chrome: capturar evento de instalação
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e)
      setMostrar(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dispensar() {
    sessionStorage.setItem('pwa_dispensado', '1')
    setMostrar(false)
  }

  async function instalar() {
    if (prompt) {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') setMostrar(false)
    }
    dispensar()
  }

  if (!mostrar) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-xl border border-green-200 p-4 animate-slide-up">
      <button
        onClick={dispensar}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none"
      >✕</button>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-green-700 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          🌿
        </div>
        <div>
          <div className="font-bold text-gray-800">Instalar AgroCore</div>
          <div className="text-xs text-gray-500">Receba notificações e acesse mais rápido</div>
        </div>
      </div>

      {isIOS ? (
        <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
          <p className="font-medium mb-1">Como instalar no iPhone:</p>
          <p>1. Toque em <strong>Compartilhar</strong> (ícone de caixa com seta ↑)</p>
          <p>2. Role e toque em <strong>"Adicionar à Tela de Início"</strong></p>
        </div>
      ) : (
        <button
          onClick={instalar}
          className="w-full py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 active:scale-95 transition"
        >
          📲 Instalar agora
        </button>
      )}
    </div>
  )
}
