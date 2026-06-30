import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

function initVapid() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''
  const priv = process.env.VAPID_PRIVATE_KEY ?? ''
  const subject = process.env.VAPID_EMAIL ?? 'suporte@oryonag.com.br'
  if (!pub || !priv) {
    console.warn('[push] VAPID keys não configuradas — push notifications desativadas')
    return false
  }
  try {
    webpush.setVapidDetails(
      subject.startsWith('mailto:') ? subject : `mailto:${subject}`,
      pub,
      priv
    )
    return true
  } catch (err) {
    console.error('[push] Falha ao configurar VAPID:', err)
    return false
  }
}

const vapidReady = initVapid()

export async function notificarUsuario(userId: string, titulo: string, corpo: string, url: string) {
  if (!vapidReady) {
    console.warn('[push] notificarUsuario ignorado — VAPID não configurado')
    return
  }

  try {
    const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } })
    const payload = JSON.stringify({ titulo, corpo, url })

    await Promise.allSettled(
      subscriptions.map(sub =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        ).catch(async (err) => {
          if (err.statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } }).catch(() => {})
          } else {
            console.error('[push] Falha ao enviar notificação:', err.statusCode ?? err.message)
          }
        })
      )
    )
  } catch (error) {
    console.error('[push] Erro inesperado:', error)
  }
}
