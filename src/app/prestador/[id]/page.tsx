import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { SERVICOS } from '@/lib/constants'
import { getBadgesPrestador } from '@/lib/badges'
import GarantiaOryon from '@/components/GarantiaOryon'
import SeloVerificado from '@/components/SeloVerificado'
import ContestarAvaliacao from '@/components/ContestarAvaliacao'
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

export default async function PerfilPrestadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const prestador = await prisma.prestador.findUnique({
    where: { id },
    include: {
      user: {
        select: { nome: true, avatarUrl: true, estado: true, cidade: true, createdAt: true }
      },
      avaliacoes: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          service: {
            select: {
              tipo: true,
              produtor: { select: { user: { select: { nome: true } } } }
            }
          }
        }
      },
      matches: {
        where: { service: { status: 'CONCLUIDO' } },
        select: { service: { select: { tipo: true } } }
      }
    }
  })

  if (!prestador) notFound()

  const servicosFeitos = prestador.matches.length
  const tiposFeitos = [...new Set(prestador.matches.map(m => m.service.tipo))]
  const membroDesde = new Date(prestador.user.createdAt).getFullYear()
  const badges = getBadgesPrestador({
    avaliacao: prestador.avaliacao,
    totalAvaliacoes: prestador.totalAvaliacoes,
    verificado: prestador.verificado,
  })

  function getServicoInfo(tipo: string) {
    return SERVICOS.find(s => s.value === tipo) || { label: tipo, icon: '📋' }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-white hover:text-green-200">← Voltar</Link>
          <h1 className="font-bold text-lg">Perfil do Prestador</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Card principal */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {prestador.user.avatarUrl ? (
                <img
                  src={prestador.user.avatarUrl}
                  alt={prestador.user.nome}
                  className="w-20 h-20 rounded-full object-cover border-4 border-green-100"
                />
              ) : (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-3xl font-bold text-green-700">
                  {prestador.user.nome[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-gray-800 text-xl">{prestador.user.nome}</h1>
                <SeloVerificado verificado={prestador.verificado} tipo="PRESTADOR" size="sm" />
              </div>
              {(prestador.user.cidade || prestador.user.estado) && (
                <p className="text-sm text-gray-500 mt-0.5">
                  📍 {[prestador.user.cidade, prestador.user.estado].filter(Boolean).join(', ')}
                </p>
              )}
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  prestador.disponivel ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {prestador.disponivel ? '🟢 Disponível' : '⚫ Indisponível'}
                </span>
              </div>
            </div>
          </div>

          {prestador.bio && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">
              {prestador.bio}
            </p>
          )}

          {/* Avaliação */}
          {prestador.totalAvaliacoes > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Estrelas nota={prestador.avaliacao} total={prestador.totalAvaliacoes} />
            </div>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {badges.map(b => <BadgeChip key={b.key} badge={b} />)}
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-700">{servicosFeitos}</div>
            <div className="text-xs text-gray-500 mt-1">Serviços feitos</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-700">
              {prestador.totalAvaliacoes > 0 ? prestador.avaliacao.toFixed(1) : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Nota média</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-700">{membroDesde}</div>
            <div className="text-xs text-gray-500 mt-1">Membro desde</div>
          </div>
        </div>

        {/* Serviços que oferece */}
        {prestador.servicosOferecidos.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">Serviços oferecidos</h2>
            <div className="flex flex-wrap gap-2">
              {prestador.servicosOferecidos.map(tipo => {
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

        {/* Tipos de serviços já realizados */}
        {tiposFeitos.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">Experiência comprovada</h2>
            <div className="flex flex-wrap gap-2">
              {tiposFeitos.map(tipo => {
                const s = getServicoInfo(tipo)
                return (
                  <span key={tipo} className="flex items-center gap-1 text-sm bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200">
                    {s.icon} {s.label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Avaliações */}
        {prestador.avaliacoes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-700">Avaliações dos produtores</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {prestador.avaliacoes.map(av => {
                const s = getServicoInfo(av.service.tipo)
                return (
                  <div key={av.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <div className="font-medium text-gray-800 text-sm">
                          {av.service.produtor.user.nome}
                        </div>
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
                    <ContestarAvaliacao
                      avaliacaoId={av.id}
                      tipo="PRESTADOR"
                      nota={av.nota}
                      comentario={av.comentario}
                      contestacao={(av as any).contestacao}
                      contestacaoStatus={(av as any).contestacaoStatus}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {prestador.avaliacoes.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-sm">Ainda sem avaliações.</p>
          </div>
        )}

        <GarantiaOryon variant="inline" />

      </div>
    </div>
  )
}
