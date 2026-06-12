import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

// Configurado sob demanda — setVapidDetails lança erro sem as chaves,
// o que quebraria o build na coleta de page data
let vapidConfigurado = false
function configurarVapid() {
  if (vapidConfigurado) return
  webpush.setVapidDetails(
    'mailto:suporte@agrocore.com.br',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
  vapidConfigurado = true
}

export async function notificarUsuario(userId: string, titulo: string, corpo: string, url: string) {
  try {
    configurarVapid()
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    })

    const payload = JSON.stringify({ titulo, corpo, url })

    await Promise.allSettled(
      subscriptions.map(sub =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        ).catch(async (err) => {
          // Remove expired subscriptions
          if (err.statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } })
          }
        })
      )
    )
  } catch (error) {
    console.error('Push notification error:', error)
  }
}
