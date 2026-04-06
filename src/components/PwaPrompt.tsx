'use client'

import { useEffect, useState } from 'react'

export default function PwaPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [notifStatus, setNotifStatus] = useState<NotificationPermission | null>(null)

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotifStatus(Notification.permission)
    }

    // Capture install prompt
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
    setNotifStatus(permission)

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
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setShowInstall(false)
  }

  if (notifStatus === 'granted' && !showInstall) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 space-y-2">
      {notifStatus === 'default' && (
        <button
          onClick={pedirPermissaoNotificacao}
          className="w-full py-3 px-4 bg-green-700 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2 justify-center"
        >
          🔔 Ativar notificações de chamados
        </button>
      )}
      {showInstall && (
        <button
          onClick={instalarApp}
          className="w-full py-3 px-4 bg-white border-2 border-green-700 text-green-700 rounded-xl font-semibold shadow-lg flex items-center gap-2 justify-center"
        >
          📲 Instalar AgroLink no celular
        </button>
      )}
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}
