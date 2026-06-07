import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { produtor: true, prestador: true }
    })
    if (!dbUser) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    if (dbUser.tipo === 'PRODUTOR' && dbUser.produtor) {
      const services = await prisma.service.findMany({
        where: { produtorId: dbUser.produtor.id },
        include: { matches: { where: { status: 'ACEITO' }, include: { prestador: { include: { user: { select: { cidade: true, estado: true } } } } } } },
        orderBy: { createdAt: 'asc' }
      })

      const concluidos = services.filter(s => s.status === 'CONCLUIDO')
      const valorTotal = concluidos.reduce((sum, s) => sum + (s.precoFinal ?? 0), 0)
      const regioes = [...new Set(services.flatMap(s => s.matches.map(m => m.prestador.user.cidade)).filter(Boolean))]
      const membro = new Date(dbUser.createdAt)
      const mesesAtivo = Math.floor((Date.now() - membro.getTime()) / (1000 * 60 * 60 * 24 * 30))

      return NextResponse.json({
        tipo: 'PRODUTOR',
        nome: dbUser.nome,
        membroDesde: membro,
        mesesAtivo,
        verificado: dbUser.produtor.verificado,
        stats: {
          servicosSolicitados: services.length,
          servicosConcluidos: concluidos.length,
          valorMovimentado: valorTotal,
          avaliacaoMedia: dbUser.produtor.avaliacao,
          totalAvaliacoes: dbUser.produtor.totalAvaliacoes,
          regioes: regioes.slice(0, 5),
        }
      })
    }

    if (dbUser.tipo === 'PRESTADOR' && dbUser.prestador) {
      const matches = await prisma.match.findMany({
        where: { prestadorId: dbUser.prestador.id, status: 'ACEITO' },
        include: { service: true },
        orderBy: { createdAt: 'asc' }
      })

      const concluidos = matches.filter(m => m.service.status === 'CONCLUIDO')
      const valorTotal = concluidos.reduce((sum, m) => sum + (m.valorProposto ?? 0), 0)
      const tiposServico = [...new Set(matches.map(m => m.service.tipo))]
      const membro = new Date(dbUser.createdAt)
      const mesesAtivo = Math.floor((Date.now() - membro.getTime()) / (1000 * 60 * 60 * 24 * 30))

      // Pontualidade: serviços concluídos / total aceitos
      const pontualidade = matches.length > 0
        ? Math.round((concluidos.length / matches.length) * 100)
        : 0

      return NextResponse.json({
        tipo: 'PRESTADOR',
        nome: dbUser.nome,
        membroDesde: membro,
        mesesAtivo,
        verificado: dbUser.prestador.verificado,
        stats: {
          servicosAceitos: matches.length,
          servicosConcluidos: concluidos.length,
          valorMovimentado: valorTotal,
          avaliacaoMedia: dbUser.prestador.avaliacao,
          totalAvaliacoes: dbUser.prestador.totalAvaliacoes,
          pontualidade,
          tiposServico,
          regiao: dbUser.cidade ? `${dbUser.cidade}${dbUser.estado ? `, ${dbUser.estado}` : ''}` : null,
          raioAtendamento: dbUser.prestador.raioAtendamento,
        }
      })
    }

    return NextResponse.json({ error: 'Perfil incompleto' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
