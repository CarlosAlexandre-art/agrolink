import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { prestador: true }
    })

    if (!dbUser?.prestador) {
      return NextResponse.json({ error: 'Apenas prestadores podem avaliar produtores' }, { status: 403 })
    }

    const { serviceId, produtorId, nota, comentario } = await req.json()

    if (!serviceId || !produtorId || !nota || nota < 1 || nota > 5) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Verificar que o prestador participou desse serviço e está concluído
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        status: 'CONCLUIDO',
        matches: { some: { prestadorId: dbUser.prestador.id, status: 'ACEITO' } }
      }
    })

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado ou não concluído' }, { status: 404 })
    }

    const avaliacao = await prisma.avaliacaoProdutor.create({
      data: {
        serviceId,
        produtorId,
        nota,
        comentario: comentario || null,
      }
    })

    return NextResponse.json(avaliacao, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar avaliação' }, { status: 500 })
  }
}
