import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { SERVICOS } from '@/lib/constants'

export default async function HistoricoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      produtor: {
        include: {
          services: {
            orderBy: { createdAt: 'desc' },
            include: {
              matches: {
                where: { status: 'ACEITO' },
                include: { prestador: { include: { user: true } } }
              }
            }
          }
        }
      },
      prestador: {
        include: {
          matches: {
            where: { status: { in: ['ACEITO', 'RECUSADO', 'CANCELADO'] } },
            orderBy: { createdAt: 'desc' },
            include: { service: { include: { produtor: { include: { user: true } } } } }
          }
        }
      }
    }
  })

  if (!dbUser) redirect('/login')

  const statusLabel: Record<string, { label: string; cor: string }> = {
    AGUARDANDO: { label: 'Aguardando', cor: 'bg-gray-100 text-gray-600' },
    PROCURANDO: { label: 'Procurando', cor: 'bg-yellow-100 text-yellow-700' },
    MATCH_ENCONTRADO: { label: 'Prestador alocado', cor: 'bg-blue-100 text-blue-700' },
    EM_ROTA: { label: 'Em rota', cor: 'bg-blue-100 text-blue-700' },
    EXECUTANDO: { label: 'Executando', cor: 'bg-purple-100 text-purple-700' },
    CONCLUIDO: { label: 'Concluído ✓', cor: 'bg-green-100 text-green-700' },
    CANCELADO: { label: 'Cancelado', cor: 'bg-red-100 text-red-600' },
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-bold text-lg">📋 Histórico</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {dbUser.tipo === 'PRODUTOR' && dbUser.produtor && (
          <>
            {dbUser.produtor.services.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-lg">Nenhum serviço encontrado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dbUser.produtor.services.map((s: any) => {
                  const servico = SERVICOS.find(sv => sv.value === s.tipo) || { label: s.tipo, icon: '📋' }
                  const st = statusLabel[s.status] || { label: s.status, cor: 'bg-gray-100 text-gray-600' }
                  const prestador = s.matches[0]?.prestador?.user
                  return (
                    <Link
                      key={s.id}
                      href={`/servico/${s.id}`}
                      className="block bg-white rounded-xl p-4 shadow-sm hover:border-green-300 border border-gray-100 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-800">
                            {servico.icon} {servico.label}
                          </div>
                          {s.area && <div className="text-sm text-gray-500">{s.area} hectares</div>}
                          {prestador && (
                            <div className="text-sm text-gray-500">Prestador: {prestador.nome}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${st.cor}`}>
                            {st.label}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}

        {dbUser.tipo === 'PRESTADOR' && dbUser.prestador && (
          <>
            {dbUser.prestador.matches.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-lg">Nenhum serviço no histórico.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dbUser.prestador.matches.map((m: any) => {
                  const servico = SERVICOS.find(sv => sv.value === m.service.tipo) || { label: m.service.tipo, icon: '📋' }
                  const st = statusLabel[m.service.status] || { label: m.service.status, cor: 'bg-gray-100 text-gray-600' }
                  return (
                    <Link
                      key={m.id}
                      href={`/servico/${m.service.id}`}
                      className="block bg-white rounded-xl p-4 shadow-sm hover:border-green-300 border border-gray-100 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-800">
                            {servico.icon} {servico.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            Cliente: {m.service.produtor.user.nome}
                          </div>
                          {m.service.area && (
                            <div className="text-sm text-gray-500">{m.service.area} hectares</div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${st.cor}`}>
                            {st.label}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(m.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
        <Link href="/dashboard" className="flex-1 py-3 text-center text-gray-500 text-xs">
          <div className="text-xl">🏠</div>Home
        </Link>
        <Link href="/historico" className="flex-1 py-3 text-center text-green-700 font-semibold text-xs">
          <div className="text-xl">📋</div>Histórico
        </Link>
        <Link href="/ganhos" className="flex-1 py-3 text-center text-gray-500 text-xs">
          <div className="text-xl">💰</div>Ganhos
        </Link>
        <Link href="/perfil" className="flex-1 py-3 text-center text-gray-500 text-xs">
          <div className="text-xl">👤</div>Perfil
        </Link>
      </nav>
    </div>
  )
}
