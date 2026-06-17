import { prisma } from '@/lib/prisma'

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    AGUARDANDO: 'bg-yellow-900/40 text-yellow-400',
    PROCURANDO: 'bg-blue-900/40 text-blue-400',
    MATCH_ENCONTRADO: 'bg-indigo-900/40 text-indigo-400',
    EXECUTANDO: 'bg-orange-900/40 text-orange-400',
    CONCLUIDO: 'bg-green-900/40 text-green-400',
    CANCELADO: 'bg-red-900/40 text-red-400',
    DISPUTA: 'bg-red-900/50 text-red-300',
  }
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${map[status] ?? 'bg-slate-800 text-slate-400'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export default async function AdminPage() {
  const [
    totalUsers, totalProdutores, totalPrestadores,
    planCounts, totalServicos, servicosPorStatus,
    totalPagamentos, receitaTotal,
    prestadoresVerificados, mediaAvaliacoes,
    recentUsers, recentServicos, totalDenuncias,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { tipo: 'PRODUTOR' } }),
    prisma.user.count({ where: { tipo: 'PRESTADOR' } }),
    prisma.user.groupBy({ by: ['plan'], _count: { plan: true } }),
    prisma.service.count(),
    prisma.service.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.payment.count(),
    prisma.payment.aggregate({ _sum: { comissao: true } }),
    prisma.prestador.count({ where: { verificado: true } }),
    prisma.avaliacao.aggregate({ _avg: { nota: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, nome: true, email: true, tipo: true, plan: true, createdAt: true },
    }),
    prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true, tipo: true, status: true, precoFinal: true, precoEstimado: true, createdAt: true,
        produtor: { select: { user: { select: { nome: true } } } },
      },
    }),
    prisma.denuncia.count(),
  ])

  const receita = receitaTotal._sum.comissao ?? 0
  const mediaAvg = mediaAvaliacoes._avg.nota ?? 0

  const servicosAtivos = servicosPorStatus
    .filter(s => !['CONCLUIDO', 'CANCELADO'].includes(s.status))
    .reduce((acc, s) => acc + s._count.status, 0)

  const servicosConcluidos = servicosPorStatus
    .find(s => s.status === 'CONCLUIDO')?._count.status ?? 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Visão geral da plataforma AgroCore</p>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Usuários totais" value={totalUsers} sub={`${totalProdutores} produtores · ${totalPrestadores} prestadores`} color="text-white" />
        <KpiCard label="Serviços ativos" value={servicosAtivos} sub={`${servicosConcluidos} concluídos no total`} color="text-green-400" />
        <KpiCard label="Receita (comissões)" value={`R$ ${receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} sub={`${totalPagamentos} pagamentos processados`} color="text-emerald-400" />
        <KpiCard label="Avaliação média" value={mediaAvg.toFixed(2)} sub={`${prestadoresVerificados} prestadores verificados`} color="text-yellow-400" />
      </div>

      {/* Linha 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {planCounts.map(p => (
          <KpiCard key={p.plan} label={`Plano ${p.plan}`} value={p._count.plan} color="text-slate-300" />
        ))}
        <KpiCard label="Denúncias abertas" value={totalDenuncias} color={totalDenuncias > 0 ? 'text-red-400' : 'text-slate-400'} />
      </div>

      {/* Serviços por status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Serviços por status</h2>
        <div className="flex flex-wrap gap-3">
          {servicosPorStatus.map(s => (
            <div key={s.status} className="flex items-center gap-2">
              <StatusBadge status={s.status} />
              <span className="text-slate-300 text-sm font-semibold">{s._count.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos usuários */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Últimos cadastros</h2>
          <div className="space-y-3">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-300 font-bold">
                    {u.nome[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium leading-none">{u.nome}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${u.tipo === 'PRODUTOR' ? 'bg-green-900/40 text-green-400' : 'bg-blue-900/40 text-blue-400'}`}>
                    {u.tipo}
                  </span>
                  <p className="text-[10px] text-slate-600 mt-1">{new Date(u.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimos serviços */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Últimos serviços</h2>
          <div className="space-y-3">
            {recentServicos.map(s => (
              <div key={s.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium leading-none">{s.tipo.replace(/_/g, ' ')}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.produtor.user.nome}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={s.status} />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {s.precoFinal ? `R$ ${s.precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : s.precoEstimado ? `~R$ ${s.precoEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
