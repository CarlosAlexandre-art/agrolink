import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/servicos/contrato?serviceId=xxx — retorna URL do contrato
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const serviceId = req.nextUrl.searchParams.get('serviceId')
    if (!serviceId) return NextResponse.json({ error: 'serviceId obrigatório' }, { status: 400 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true, prestador: true }
    })

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        OR: [
          { produtorId: dbUser?.produtor?.id ?? '' },
          { matches: { some: { prestadorId: dbUser?.prestador?.id ?? '', status: { in: ['ACEITO', 'RECUSADO', 'CANCELADO'] } } } }
        ]
      },
      select: { contratoUrl: true, contratoAceitoEm: true }
    })

    if (!service) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    return NextResponse.json({
      contratoUrl: service.contratoUrl,
      contratoAceitoEm: service.contratoAceitoEm,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
