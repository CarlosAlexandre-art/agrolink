'use client'

import { useEffect, useState } from 'react'

export default function InstalarApp() {
  const [prompt, setPrompt] = useState<any>(null)
  const [mostrar, setMostrar] = useState(false)
  const [instalado, setInstalado] = useState(false)

  useEffect(() => {
    // Já está rodando como app instalado
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // Usuário já dispensou permanentemente
    if (localStorage.getItem('app_instalado')) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e)
      // Mostrar após 3s na primeira visita
      setTimeout(() => setMostrar(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // iOS Safari — não tem beforeinstallprompt, mostrar guia manual
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream
    const isInStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isIOS && !isInStandalone && !sessionStorage.getItem('ios_guide_visto')) {
      setTimeout(() => setMostrar(true), 4000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function instalar() {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setInstalado(true)
      localStorage.setItem('app_instalado', '1')
    }
    setMostrar(false)
  }

  function dispensar() {
    setMostrar(false)
    sessionStorage.setItem('ios_guide_visto', '1')
  }

  function dispensarSempre() {
    localStorage.setItem('app_instalado', '1')
    setMostrar(false)
  }

  if (!mostrar || instalado) return null

  const isIOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

  // Android — tem o prompt nativo
  if (prompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[100] max-w-sm mx-auto animate-slide-up">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-green-700 px-4 py-3 flex items-center gap-3">
            <img src="/icons/icon-192.png" alt="AgroCore" className="w-10 h-10 rounded-xl" />
            <div>
              <div className="text-white font-bold text-sm">Instalar AgroCore</div>
              <div className="text-green-200 text-xs">Soluções Sustentáveis do Campo</div>
            </div>
          </div>
          <div className="px-4 py-3">
            <p className="text-gray-600 text-xs mb-3">
              Instale o app no seu celular — funciona sem internet, sem abrir o navegador.
            </p>
            <button
              onClick={instalar}
              className="w-full py-3 bg-green-700 text-white font-bold rounded-xl text-sm active:scale-95 transition mb-2"
            >
              Instalar no celular
            </button>
            <button onClick={dispensarSempre} className="w-full text-gray-400 text-xs py-1">
              Não quero instalar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // iOS — guia manual
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[100] max-w-sm mx-auto animate-slide-up">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
          <button onClick={dispensar} className="absolute top-3 right-4 text-gray-400 text-lg">✕</button>
          <div className="flex items-center gap-3 mb-3">
            <img src="/icons/icon-192.png" alt="AgroCore" className="w-10 h-10 rounded-xl" />
            <div>
              <div className="font-bold text-gray-800 text-sm">Instalar no iPhone</div>
              <div className="text-xs text-gray-500">Adicionar à tela de início</div>
            </div>
          </div>
          <div className="space-y-2 text-xs text-gray-600 bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              Toque no ícone <strong className="mx-1">Compartilhar</strong> ↑ no Safari
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              Toque em <strong className="mx-1">"Adicionar à Tela de Início"</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              Toque em <strong className="mx-1">Adicionar</strong>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
