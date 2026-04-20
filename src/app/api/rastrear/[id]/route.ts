import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Endpoint público para rastreamento de serviço — sem autenticação
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      produtor: { include: { user: { select: { nome: true, supabaseId: true } } } },
      matches: {
        where: { status: 'ACEITO' },
        include: {
          prestador: {
            include: { user: { select: { nome: true, cidade: true, estado: true } } }
          }
        }
      },
      payment: { select: { valor: true, status: true } },
    }
  })

  if (!service) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  return NextResponse.json(service)
}
