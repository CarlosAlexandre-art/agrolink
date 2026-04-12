import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emails } from '@/lib/email'

// POST manual — você chama quando quiser disparar uma promoção
// Body: { tipo: 'agros' | 'promocao', assunto?, mensagem?, ctaTexto?, ctaUrl? }
export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { tipo, assunto, mensagem, ctaTexto, ctaUrl } = await req.json()

  const usuarios = await prisma.user.findMany({
    where: { email: { not: undefined } },
    select: { email: true, nome: true },
  })

  let enviados = 0
  for (const user of usuarios) {
    if (!user.email) continue
    try {
      if (tipo === 'agros') {
        await emails.lancamentoAgroOS(user.email, user.nome)
      } else {
        await emails.promocao(user.email, user.nome, assunto, mensagem, ctaTexto, ctaUrl)
      }
      enviados++
      // Pequeno delay para não exceder limite do Resend
      await new Promise(r => setTimeout(r, 100))
    } catch {}
  }

  return NextResponse.json({ ok: true, enviados })
}
