import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const STATUS_FLOW: Record<string, string> = {
  MATCH_ENCONTRADO: 'EM_ROTA',
  EM_ROTA: 'EXECUTANDO',
  EXECUTANDO: 'CONCLUIDO',
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        produtor: { include: { user: true } },
        matches: {
          where: { status: 'ACEITO' },
          include: { prestador: { include: { user: true } } }
        },
        avaliacao: true,
      }
    })

    if (!service) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    return NextResponse.json(service)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar serviço' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { prestador: true }
    })

    if (!dbUser?.prestador) {
      return NextResponse.json({ error: 'Apenas prestadores podem atualizar o status' }, { status: 403 })
    }

    const service = await prisma.service.findFirst({
      where: {
        id,
        matches: {
          some: { prestadorId: dbUser.prestador.id, status: 'ACEITO' }
        }
      }
    })

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }

    const novoStatus = STATUS_FLOW[service.status]
    if (!novoStatus) {
      return NextResponse.json({ error: 'Status não pode ser avançado' }, { status: 400 })
    }

    const updated = await prisma.service.update({
      where: { id },
      data: { status: novoStatus as any }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 })
  }
}
