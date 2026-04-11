import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { enviarWhatsApp, wpp } from '@/lib/whatsapp'
import { SERVICOS } from '@/lib/constants'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true }
    })

    if (!dbUser?.produtor) {
      return NextResponse.json({ error: 'Usuário não é produtor' }, { status: 403 })
    }

    // Support both JSON body (API) and form submission
    let serviceId: string, prestadorId: string, nota: number, comentario: string | undefined
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const body = await req.json()
      serviceId = body.serviceId
      prestadorId = body.prestadorId
      nota = parseInt(body.nota)
      comentario = body.comentario
    } else {
      const formData = await req.formData()
      serviceId = formData.get('serviceId') as string
      prestadorId = formData.get('prestadorId') as string
      nota = parseInt(formData.get('nota') as string)
      comentario = formData.get('comentario') as string | undefined
    }

    if (!serviceId || !prestadorId || !nota || nota < 1 || nota > 5) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Verify service belongs to this produtor and is concluded
    const service = await prisma.service.findFirst({
      where: { id: serviceId, produtorId: dbUser.produtor.id, status: 'CONCLUIDO' }
    })

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado ou não concluído' }, { status: 404 })
    }

    // Create avaliacao
    const avaliacao = await prisma.avaliacao.create({
      data: {
        serviceId,
        prestadorId,
        nota,
        comentario: comentario || null,
      }
    })

    // Update prestador average rating
    const todasAvaliacoes = await prisma.avaliacao.findMany({
      where: { prestadorId }
    })
    const media = todasAvaliacoes.reduce((acc: number, a: { nota: number }) => acc + a.nota, 0) / todasAvaliacoes.length

    const prestadorAtualizado = await prisma.prestador.update({
      where: { id: prestadorId },
      data: {
        avaliacao: media,
        totalAvaliacoes: todasAvaliacoes.length,
      },
      include: { user: true }
    })

    // Notificar prestador via WhatsApp
    if (prestadorAtualizado.user.telefone) {
      const servicoLabel = SERVICOS.find(s => s.value === service.tipo)?.label ?? service.tipo
      enviarWhatsApp(
        prestadorAtualizado.user.telefone,
        wpp.avaliacaoRecebida(prestadorAtualizado.user.nome, nota, comentario || null, servicoLabel)
      ).catch(() => {})
    }

    // If form submission, redirect back
    if (!contentType.includes('application/json')) {
      return Response.redirect(new URL(`/servico/${serviceId}`, req.url))
    }

    return NextResponse.json(avaliacao, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar avaliação' }, { status: 500 })
  }
}
