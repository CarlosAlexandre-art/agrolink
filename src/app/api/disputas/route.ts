import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { emails } from '@/lib/email'

// POST — abre disputa
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true, prestador: true }
    })
    if (!dbUser) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    const { serviceId, motivo, descricao } = await req.json()
    if (!serviceId || !motivo || !descricao) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    // Verifica se o serviço pertence ao usuário
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        OR: [
          { produtorId: dbUser.produtor?.id ?? '' },
          { matches: { some: { prestadorId: dbUser.prestador?.id ?? '', status: 'ACEITO' } } }
        ]
      },
      include: {
        produtor: { include: { user: true } },
        matches: { where: { status: 'ACEITO' }, include: { prestador: { include: { user: true } } }, take: 1 }
      }
    })

    if (!service) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })

    // Verifica se já existe disputa
    const existente = await prisma.disputa.findUnique({ where: { serviceId } })
    if (existente) return NextResponse.json({ error: 'Já existe uma disputa aberta para este serviço' }, { status: 400 })

    // Cria a disputa e muda status do serviço
    const [disputa] = await prisma.$transaction([
      prisma.disputa.create({
        data: { serviceId, abertaPor: dbUser.id, motivo, descricao }
      }),
      prisma.service.update({
        where: { id: serviceId },
        data: { status: 'DISPUTA' }
      })
    ])

    // Notifica admin por email
    const adminEmail = process.env.ADMIN_EMAIL || 'suporte@oryonag.com.br'
    const prestador = service.matches[0]?.prestador.user
    emails.contratoGerado(
      adminEmail,
      'Equipe AgroCore',
      `Nova disputa aberta — Serviço ${serviceId}`,
      0,
      `${process.env.NEXT_PUBLIC_APP_URL}/admin`
    ).catch(() => {})

    return NextResponse.json({ ok: true, disputaId: disputa.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// GET — busca disputas do usuário
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true, prestador: true }
    })
    if (!dbUser) return NextResponse.json([], { status: 200 })

    const disputas = await prisma.disputa.findMany({
      where: {
        service: {
          OR: [
            { produtorId: dbUser.produtor?.id ?? '' },
            { matches: { some: { prestadorId: dbUser.prestador?.id ?? '' } } }
          ]
        }
      },
      include: { service: { select: { tipo: true, status: true, endereco: true } } },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(disputas)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
