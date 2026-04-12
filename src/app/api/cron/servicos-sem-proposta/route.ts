import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emails } from '@/lib/email'
import { notificarUsuario } from '@/lib/push'
import { SERVICOS } from '@/lib/constants'

// Roda 1x por dia — notifica produtores com serviço sem proposta há 48h
export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const quarenta_e_oito_horas = new Date(Date.now() - 48 * 60 * 60 * 1000)

  const servicos = await prisma.service.findMany({
    where: {
      status: 'PROCURANDO',
      createdAt: { lt: quarenta_e_oito_horas },
    },
    include: {
      produtor: { include: { user: true } }
    },
    take: 50,
  })

  let enviados = 0
  for (const s of servicos) {
    const user = s.produtor.user
    if (!user.email) continue
    const servicoLabel = SERVICOS.find(sv => sv.value === s.tipo)?.label ?? s.tipo
    try {
      await emails.servicoSemProposta(user.email, user.nome, servicoLabel, s.id)
      await notificarUsuario(
        user.id,
        '🔍 Seu serviço ainda aguarda',
        `Seu pedido de ${servicoLabel} ainda não recebeu propostas.`,
        `/servico/${s.id}`
      )
      enviados++
    } catch {}
  }

  return NextResponse.json({ ok: true, enviados })
}
