import { NextResponse } from 'next/server'

// Rota de teste — remover após confirmar que WPP funciona
// GET /api/test-whatsapp?tel=5511999999999
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const tel = searchParams.get('tel')

  if (!tel) {
    return NextResponse.json({ error: 'Informe o parâmetro tel. Ex: ?tel=5585999999999' }, { status: 400 })
  }

  const instanceId = process.env.ZAPI_INSTANCE_ID
  const token = process.env.ZAPI_TOKEN
  const clientToken = process.env.ZAPI_CLIENT_TOKEN

  if (!instanceId || !token) {
    return NextResponse.json({ error: 'Variáveis ZAPI_INSTANCE_ID ou ZAPI_TOKEN não configuradas no Vercel' }, { status: 500 })
  }

  const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`

  const digits = tel.replace(/\D/g, '')
  const phone = digits.startsWith('55') ? digits : `55${digits}`

  const body = { phone, message: '🌿 *AgroCore* — Teste de notificação!\n\nSe você recebeu esta mensagem, o WhatsApp está funcionando corretamente no AgroCore. ✅' }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(clientToken ? { 'Client-Token': clientToken } : {}),
    },
    body: JSON.stringify(body),
  })

  const zapiResponse = await res.json().catch(() => res.text())

  return NextResponse.json({
    status: res.status,
    phone,
    variaveis: { instanceId: !!instanceId, token: !!token, clientToken: !!clientToken },
    zapiResponse,
  })
}
