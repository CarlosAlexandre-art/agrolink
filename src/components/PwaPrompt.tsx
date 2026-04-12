'use client'

import { useEffect, useState } from 'react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export default function PwaPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [dispensado, setDispensado] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('pwa_dispensado')) return
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    setIsIOS(ios)

    if (ios) {
      setShowInstall(true)
    }

    if ('Notification' in window && Notification.permission === 'default') {
      setShowNotif(true)
    }

    const handler = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function pedirPermissaoNotificacao() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    const permission = await Notification.requestPermission()
    setShowNotif(false)
    if (permission === 'granted') {
      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      const json = sub.toJSON()
      await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
        }),
      })
    }
  }

  async function instalarApp() {
    if (isIOS) { setShowIOSGuide(true); return }
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setShowInstall(false)
  }

  function dispensar() {
    sessionStorage.setItem('pwa_dispensado', '1')
    setDispensado(true)
  }

  if (dispensado) return null
  if (!showNotif && !showInstall) return null

  return (
    <>
      {/* Banner principal */}
      <div className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-xl border border-green-200 p-4 animate-slide-up">
        <button
          onClick={dispensar}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg"
        >✕</button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-green-700 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🌿</div>
          <div>
            <div className="font-bold text-gray-800 text-sm">Instalar AgroCore</div>
            <div className="text-xs text-gray-500">Acesse mais rápido e receba notificações</div>
          </div>
        </div>

        <div className="space-y-2">
          {showNotif && (
            <button
              onClick={pedirPermissaoNotificacao}
              className="w-full py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 active:scale-95 transition text-sm"
            >
              🔔 Ativar notificações de chamados
            </button>
          )}
          {showInstall && (
            <button
              onClick={instalarApp}
              className="w-full py-3 bg-white border-2 border-green-700 text-green-700 font-bold rounded-xl hover:bg-green-50 active:scale-95 transition text-sm"
            >
              📲 Instalar app no celular
            </button>
          )}
        </div>
      </div>

      {/* Guia iOS */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end px-4 pb-4" onClick={() => setShowIOSGuide(false)}>
          <div className="bg-white rounded-2xl p-5 w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-3">📲 Instalar no iPhone</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
                <span>Toque no ícone <strong>Compartilhar</strong> (↑) na barra do Safari</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
                <span>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
                <span>Toque em <strong>"Adicionar"</strong> no canto superior direito</span>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full mt-4 py-3 bg-green-700 text-white font-bold rounded-xl"
            >
              Entendi!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
