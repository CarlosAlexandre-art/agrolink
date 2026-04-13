import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) return NextResponse.json({ existe: false })

  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase().trim() },
    select: { id: true }
  })

  return NextResponse.json({ existe: !!user })
}
