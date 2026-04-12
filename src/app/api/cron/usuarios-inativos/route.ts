import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emails } from '@/lib/email'
import { notificarUsuario } from '@/lib/push'

// Roda 1x por dia — chamado pelo Vercel Cron
export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const sete_dias_atras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const usuarios = await prisma.user.findMany({
    where: {
      updatedAt: { lt: sete_dias_atras },
      email: { not: undefined },
    },
    take: 100,
  })

  let enviados = 0
  for (const user of usuarios) {
    try {
      // Email
      if (user.email) {
        await emails.inativo(user.email, user.nome, user.tipo as 'PRODUTOR' | 'PRESTADOR')
      }
      // Push notification
      const isProd = user.tipo === 'PRODUTOR'
      await notificarUsuario(
        user.id,
        '🌿 Sentimos sua falta!',
        isProd ? 'Novos prestadores disponíveis na sua região.' : 'Novos chamados de serviço esperando por você.',
        '/dashboard'
      )
      enviados++
    } catch {}
  }

  return NextResponse.json({ ok: true, enviados })
}
