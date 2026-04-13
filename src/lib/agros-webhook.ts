/**
 * Dispara webhook para o AgroOS informando mudança de status de serviço
 */
export async function notificarAgroOS(serviceId: string, status: string, extra?: Record<string, any>) {
  const webhookUrl = process.env.AGROS_WEBHOOK_URL
  const secret = process.env.AGROLINK_INTERNAL_SECRET

  if (!webhookUrl || !secret) return

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': secret,
      },
      body: JSON.stringify({
        serviceId,
        status,
        timestamp: new Date().toISOString(),
        ...extra,
      }),
    })
  } catch (e) {
    // Nunca deixar falha do webhook quebrar o fluxo principal
    console.error('AgroOS webhook error:', e)
  }
}
