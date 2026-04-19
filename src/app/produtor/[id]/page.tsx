import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { SERVICOS } from '@/lib/constants'
import { getBadgesProdutor } from '@/lib/badges'
import BadgeChip from '@/components/BadgeChip'

function Estrelas({ nota, total }: { nota: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} className={`text-lg ${n <= Math.round(nota) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
        ))}
      </div>
      <span className="font-bold text-gray-800">{nota.toFixed(1)}</span>
      <span className="text-gray-400 text-sm">({total} avaliações)</span>
    </div>
  )
}

export default async function PerfilProdutorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const produtor = await prisma.produtor.findUnique({
    where: { id },
    include: {
      user: true,
      avaliacoesRecebidas: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          service: {
            select: {
              tipo: true,
              matches: {
                where: { status: 'ACEITO' },
                select: { prestador: { select: { user: { select: { nome: true } } } } },
                take: 1,
              }
            }
          }
        }
      },
      services: {
        where: { status: 'CONCLUIDO' },
        select: { tipo: true }
      }
    }
  })

  if (!produtor) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = produtor as any
  const servicosConcluidos = p.services.length
  const tiposContratados: string[] = [...new Set<string>(p.services.map((s: any) => s.tipo as string))]
  const membroDesde = new Date(p.user.createdAt).getFullYear()
  const badges = getBadgesProdutor({
    avaliacao: p.avaliacao ?? 0,
    totalAvaliacoes: p.totalAvaliacoes ?? 0,
    totalConcluidos: servicosConcluidos,
  })

  function getServicoInfo(tipo: string) {
    return SERVICOS.find(s => s.value === tipo) || { label: tipo, icon: '📋' }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-white hover:text-green-200">← Voltar</Link>
          <h1 className="font-bold text-lg">Perfil do Produtor</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Card principal */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {p.user.avatarUrl ? (
                <img
                  src={p.user.avatarUrl}
                  alt={p.user.nome}
                  className="w-20 h-20 rounded-full object-cover border-4 border-green-100"
                />
              ) : (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-3xl font-bold text-green-700">
                  {p.user.nome[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-gray-800 text-xl">{p.user.nome}</h1>
              {p.nomeFazenda && (
                <p className="text-sm text-green-700 font-medium mt-0.5">🌾 {p.nomeFazenda}</p>
              )}
              {(p.user.cidade || p.user.estado) && (
                <p className="text-sm text-gray-500 mt-0.5">
                  📍 {[p.user.cidade, p.user.estado].filter(Boolean).join(', ')}
                </p>
              )}
              {p.totalAvaliacoes > 0 && (
                <div className="mt-2">
                  <Estrelas nota={p.avaliacao} total={p.totalAvaliacoes} />
                </div>
              )}
            </div>
          </div>

          {badges.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-1.5">
              {badges.map(b => <BadgeChip key={b.key} badge={b} />)}
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-700">{servicosConcluidos}</div>
            <div className="text-xs text-gray-500 mt-1">Serviços contratados</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-700">
              {p.totalAvaliacoes > 0 ? p.avaliacao.toFixed(1) : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-1">⭐ Nota média</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-700">{membroDesde}</div>
            <div className="text-xs text-gray-500 mt-1">Membro desde</div>
          </div>
        </div>

        {/* Tipos de serviços já contratados */}
        {tiposContratados.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">Serviços já contratados</h2>
            <div className="flex flex-wrap gap-2">
              {tiposContratados.map(tipo => {
                const s = getServicoInfo(tipo)
                return (
                  <span key={tipo} className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium border border-green-100">
                    {s.icon} {s.label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Avaliações recebidas */}
        {p.avaliacoesRecebidas.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-700">Avaliações dos prestadores</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {p.avaliacoesRecebidas.map((av: any) => {
                const s = getServicoInfo(av.service.tipo)
                const prestadorNome = av.service.matches[0]?.prestador?.user?.nome ?? 'Prestador'
                return (
                  <div key={av.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{prestadorNome}</div>
                        <div className="text-xs text-gray-400">
                          {s.icon} {s.label} · {new Date(av.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        {[1,2,3,4,5].map(n => (
                          <span key={n} className={`text-sm ${n <= av.nota ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    {av.comentario && (
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">"{av.comentario}"</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {p.avaliacoesRecebidas.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-sm">Ainda sem avaliações.</p>
          </div>
        )}

      </div>
    </div>
  )
}
