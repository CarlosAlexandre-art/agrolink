import { NextResponse } from 'next/server'
import { enviarWhatsApp } from '@/lib/whatsapp'

// Rota de teste — remover após confirmar que WPP funciona
// GET /api/test-whatsapp?tel=5511999999999
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const tel = searchParams.get('tel')

  if (!tel) {
    return NextResponse.json({ error: 'Informe o parâmetro tel. Ex: ?tel=5585999999999' }, { status: 400 })
  }

  try {
    await enviarWhatsApp(tel, '🌿 *AgroCore* — Teste de notificação!\n\nSe você recebeu esta mensagem, o WhatsApp está funcionando corretamente no AgroCore. ✅')
    return NextResponse.json({ ok: true, mensagem: `Mensagem enviada para ${tel}` })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
