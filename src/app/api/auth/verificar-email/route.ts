import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(req: Request) {
  // 60 verificações por minuto por IP — limite aumentado pois app mobile compartilha IP
  const ip = getClientIp(req)
  const { allowed } = rateLimit(`email-check:${ip}`, 60, 60_000)
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
