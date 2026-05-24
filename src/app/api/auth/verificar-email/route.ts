import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(req: Request) {
  // 10 verificações por minuto por IP — previne enumeração em massa
  const ip = getClientIp(req)
  const { allowed } = rateLimit(`email-check:${ip}`, 10, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde um momento.' }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) return NextResponse.json({ existe: false })

  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase().trim() },
    select: { id: true }
  })

  return NextResponse.json({ existe: !!user })
}
