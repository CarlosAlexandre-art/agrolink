import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const prestador = await prisma.prestador.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            nome: true,
            avatarUrl: true,
            estado: true,
            cidade: true,
            createdAt: true,
          }
        },
        avaliacoes: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            service: {
              select: {
                tipo: true,
                createdAt: true,
                produtor: { select: { user: { select: { nome: true } } } }
              }
            }
          }
        },
        matches: {
          where: { status: 'ACEITO' },
          include: {
            service: { select: { tipo: true, status: true } }
          }
        }
      }
    })

    if (!prestador) return NextResponse.json({ error: 'Prestador não encontrado' }, { status: 404 })

    // Estatísticas derivadas
    const servicos = prestador.matches.map(m => m.service)
    const concluidos = servicos.filter(s => s.status === 'CONCLUIDO').length
    const tiposSet = new Set(servicos.map(s => s.tipo))

    return NextResponse.json({
      id: prestador.id,
      nome: prestador.user.nome,
      avatarUrl: prestador.user.avatarUrl,
      estado: prestador.user.estado,
      cidade: prestador.user.cidade,
      bio: prestador.bio,
      avaliacao: prestador.avaliacao,
      totalAvaliacoes: prestador.totalAvaliacoes,
      verificado: prestador.verificado,
      disponivel: prestador.disponivel,
      servicosOferecidos: prestador.servicosOferecidos,
      totalServicos: concluidos,
      tiposFeitos: Array.from(tiposSet),
      membroDesde: prestador.user.createdAt,
      avaliacoes: prestador.avaliacoes.map(a => ({
        id: a.id,
        nota: a.nota,
        comentario: a.comentario,
        createdAt: a.createdAt,
        servicoTipo: a.service.tipo,
        produtorNome: a.service.produtor.user.nome,
      }))
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
