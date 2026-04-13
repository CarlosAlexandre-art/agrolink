import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Endpoint interno — cancela serviço no AgroCore
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const secret = req.headers.get('x-internal-secret')
  if (!secret || secret !== process.env.AGROLINK_INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params

  await prisma.service.update({
    where: { id },
    data: { status: 'CANCELADO' }
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
