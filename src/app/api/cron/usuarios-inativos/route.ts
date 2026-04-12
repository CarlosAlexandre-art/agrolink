import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emails } from '@/lib/email'

// Roda 1x por dia — chamado pelo Vercel Cron
export async function GET(req: Request) {
  // Segurança: só aceita chamadas do Vercel Cron
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const sete_dias_atras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Busca usuários que não logam há 7 dias e ainda não receberam email de inatividade recente
  const usuarios = await prisma.user.findMany({
    where: {
      updatedAt: { lt: sete_dias_atras },
      email: { not: undefined },
    },
    take: 100, // máximo 100 por rodada
  })

  let enviados = 0
  for (const user of usuarios) {
    if (!user.email) continue
    try {
      await emails.inativo(user.email, user.nome, user.tipo as 'PRODUTOR' | 'PRESTADOR')
      enviados++
    } catch {}
  }

  return NextResponse.json({ ok: true, enviados })
}
