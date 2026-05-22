/**
 * Notifica o AgroRate quando um evento do AgroCore afeta o score do produtor
 * (serviço concluído, avaliação recebida)
 */
export async function notificarAgroRate(supabaseId: string, eventType: string) {
  const agrorateUrl = process.env.AGRORATE_URL
  const secret = process.env.N8N_WEBHOOK_SECRET

  if (!agrorateUrl || !secret) return

  try {
    await fetch(`${agrorateUrl}/api/webhooks/n8n`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': secret,
      },
      body: JSON.stringify({
        event: 'agrocore.sync',
        payload: { supabaseId, eventType },
      }),
    })
  } catch (e) {
    console.error('[AgroRate webhook] erro:', e)
  }
}
