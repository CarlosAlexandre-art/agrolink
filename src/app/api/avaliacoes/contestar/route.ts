import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// POST — contestar avaliação recebida
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { prestador: true, produtor: true }
    })
    if (!dbUser) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    const { avaliacaoId, tipo, contestacao } = await req.json()
    // tipo: 'PRESTADOR' | 'PRODUTOR' — qual avaliação está sendo contestada

    if (!avaliacaoId || !contestacao || contestacao.length < 20) {
      return NextResponse.json({ error: 'Descreva a contestação com pelo menos 20 caracteres' }, { status: 400 })
    }

    if (tipo === 'PRESTADOR') {
      // Prestador contesta avaliação que recebeu
      const av = await prisma.avaliacao.findFirst({
        where: { id: avaliacaoId, prestadorId: dbUser.prestador?.id ?? '' }
      })
      if (!av) return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 })
      if (av.contestacao) return NextResponse.json({ error: 'Já existe uma contestação para esta avaliação' }, { status: 400 })

      await prisma.avaliacao.update({
        where: { id: avaliacaoId },
        data: { contestacao, contestacaoStatus: 'PENDENTE', contestacaoEm: new Date() }
      })
    } else {
      // Produtor contesta avaliação que recebeu do prestador
      const av = await prisma.avaliacaoProdutor.findFirst({
        where: { id: avaliacaoId, produtorId: dbUser.produtor?.id ?? '' }
      })
      if (!av) return NextResponse.json({ error: 'Avaliação não encontrada' }, { status: 404 })
      if (av.contestacao) return NextResponse.json({ error: 'Já existe uma contestação para esta avaliação' }, { status: 400 })

      await prisma.avaliacaoProdutor.update({
        where: { id: avaliacaoId },
        data: { contestacao, contestacaoStatus: 'PENDENTE', contestacaoEm: new Date() }
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
