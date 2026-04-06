import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { COMISSAO } from '@/lib/constants'

export default async function GanhosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      prestador: {
        include: {
          matches: {
            where: { status: 'ACEITO' },
            include: {
              service: {
                include: { payment: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  })

  if (!dbUser) redirect('/login')
  if (dbUser.tipo !== 'PRESTADOR') redirect('/dashboard')

  const matches = dbUser.prestador?.matches || []
  const concluidos = matches.filter((m: any) => m.service.status === 'CONCLUIDO')
  const totalBruto = concluidos.reduce((acc: number, m: any) => acc + (m.service.precoFinal || m.service.precoEstimado || 0), 0)
  const totalLiquido = totalBruto * (1 - COMISSAO)

  // Group by month
  const porMes: Record<string, { total: number; count: number }> = {}
  for (const m of concluidos) {
    const data = new Date(m.service.updatedAt)
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
    if (!porMes[chave]) porMes[chave] = { total: 0, count: 0 }
    porMes[chave].total += (m.service.precoFinal || m.service.precoEstimado || 0) * (1 - COMISSAO)
    porMes[chave].count++
  }

  const meses = Object.entries(porMes).sort((a, b) => b[0].localeCompare(a[0]))

  function formatMes(chave: string) {
    const [ano, mes] = chave.split('-')
    const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${nomes[parseInt(mes) - 1]} ${ano}`
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-bold text-lg">💰 Ganhos</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Total summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="text-sm text-gray-500 mb-1">Total recebido (líquido)</div>
          <div className="text-4xl font-bold text-green-700">
            R$ {totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Após comissão AgroLink de {(COMISSAO * 100).toFixed(0)}%
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-xl font-bold text-green-700">{concluidos.length}</div>
            <div className="text-xs text-gray-500 mt-1">Concluídos</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-xl font-bold text-yellow-600">
              {matches.filter((m: any) => ['MATCH_ENCONTRADO', 'EM_ROTA', 'EXECUTANDO'].includes(m.service.status)).length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Em andamento</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-xl font-bold text-gray-700">{dbUser.prestador?.avaliacao?.toFixed(1) || '—'}</div>
            <div className="text-xs text-gray-500 mt-1">⭐ Nota</div>
          </div>
        </div>

        {/* Commission info */}
        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Valor bruto</span>
            <span className="font-medium">R$ {totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Comissão AgroLink (15%)</span>
            <span className="font-medium text-red-500">- R$ {(totalBruto * COMISSAO).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-green-200 pt-2 mt-2">
            <span className="text-gray-700">Você recebe</span>
            <span className="text-green-700">R$ {totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Monthly breakdown */}
        {meses.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-4">Por mês</h2>
            <div className="space-y-3">
              {meses.map(([chave, dados]) => (
                <div key={chave} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="font-medium text-gray-700">{formatMes(chave)}</div>
                    <div className="text-xs text-gray-400">{dados.count} serviço{dados.count !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="font-bold text-green-700">
                    R$ {dados.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {concluidos.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">💰</div>
            <p className="text-lg">Nenhum ganho ainda.</p>
            <p className="text-sm">Complete serviços para ver seus ganhos aqui.</p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
        <Link href="/dashboard" className="flex-1 py-3 text-center text-gray-500 text-xs">
          <div className="text-xl">🏠</div>Home
        </Link>
        <Link href="/historico" className="flex-1 py-3 text-center text-gray-500 text-xs">
          <div className="text-xl">📋</div>Histórico
        </Link>
        <Link href="/ganhos" className="flex-1 py-3 text-center text-green-700 font-semibold text-xs">
          <div className="text-xl">💰</div>Ganhos
        </Link>
        <Link href="/perfil" className="flex-1 py-3 text-center text-gray-500 text-xs">
          <div className="text-xl">👤</div>Perfil
        </Link>
      </nav>
    </div>
  )
}
