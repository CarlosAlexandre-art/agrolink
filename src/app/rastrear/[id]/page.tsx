import { prisma } from '@/lib/prisma'
import { SERVICOS } from '@/lib/constants'
import Link from 'next/link'

const STATUS_LABELS: Record<string, { label: string; cor: string; icon: string }> = {
  PROCURANDO:       { label: 'Procurando prestador',    cor: 'bg-yellow-100 text-yellow-800 border-yellow-200',  icon: '🔍' },
  MATCH_ENCONTRADO: { label: 'Prestador encontrado',    cor: 'bg-blue-100 text-blue-800 border-blue-200',        icon: '✅' },
  EM_ROTA:          { label: 'Em rota / Aguardando',    cor: 'bg-indigo-100 text-indigo-800 border-indigo-200',  icon: '🚜' },
  EXECUTANDO:       { label: 'Serviço em execução',     cor: 'bg-orange-100 text-orange-800 border-orange-200',  icon: '⚙️' },
  CONCLUIDO:        { label: 'Concluído',                cor: 'bg-green-100 text-green-800 border-green-200',     icon: '🎉' },
  CANCELADO:        { label: 'Cancelado',                cor: 'bg-red-100 text-red-800 border-red-200',           icon: '❌' },
}

const ETAPAS = ['PROCURANDO', 'MATCH_ENCONTRADO', 'EM_ROTA', 'EXECUTANDO', 'CONCLUIDO']

export default async function RastrearPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      produtor: { include: { user: true } },
      matches: {
        where: { status: 'ACEITO' },
        include: { prestador: { include: { user: true } } }
      },
      payment: true,
    }
  })

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-gray-700 mb-2">Serviço não encontrado</h1>
          <p className="text-gray-500 text-sm">Verifique o link ou entre em contato com o suporte.</p>
        </div>
      </div>
    )
  }

  const statusInfo = STATUS_LABELS[service.status] ?? { label: service.status, cor: 'bg-gray-100 text-gray-700 border-gray-200', icon: '❓' }
  const servicoLabel = SERVICOS.find(s => s.value === service.tipo)?.label ?? service.tipo
  const prestador = service.matches?.[0]?.prestador
  const etapaAtual = ETAPAS.indexOf(service.status)

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-green-700 text-white px-4 py-4 shadow">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <div>
            <div className="font-bold text-lg leading-tight">AgroCore</div>
            <div className="text-xs text-green-200">Rastreamento de serviço</div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Status principal */}
        <div className={`rounded-2xl border px-5 py-4 flex items-center gap-4 ${statusInfo.cor}`}>
          <div className="text-4xl">{statusInfo.icon}</div>
          <div>
            <div className="text-xs font-medium opacity-70 uppercase tracking-wide">Status atual</div>
            <div className="text-lg font-bold">{statusInfo.label}</div>
          </div>
        </div>

        {/* Linha do tempo */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-4">Progresso do serviço</h2>
          <div className="space-y-3">
            {ETAPAS.map((etapa, idx) => {
              const info = STATUS_LABELS[etapa]
              const concluido = etapaAtual > idx
              const ativo = etapaAtual === idx
              const pendente = etapaAtual < idx
              return (
                <div key={etapa} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    concluido ? 'bg-green-600 text-white' :
                    ativo ? 'bg-green-700 text-white ring-4 ring-green-200' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {concluido ? '✓' : ativo ? info.icon : idx + 1}
                  </div>
                  <div className={`text-sm font-medium ${
                    concluido ? 'text-green-700' :
                    ativo ? 'text-gray-900' :
                    'text-gray-400'
                  }`}>
                    {info.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detalhes do serviço */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="font-bold text-gray-700">Detalhes</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-400 text-xs">Tipo de serviço</div>
              <div className="font-medium text-gray-800">{servicoLabel}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Urgência</div>
              <div className="font-medium text-gray-800">{service.urgencia}</div>
            </div>
            {service.area && (
              <div>
                <div className="text-gray-400 text-xs">Área</div>
                <div className="font-medium text-gray-800">{service.area} ha</div>
              </div>
            )}
            {service.endereco && (
              <div className="col-span-2">
                <div className="text-gray-400 text-xs">Local</div>
                <div className="font-medium text-gray-800">{service.endereco}</div>
              </div>
            )}
            {service.descricao && (
              <div className="col-span-2">
                <div className="text-gray-400 text-xs">Descrição</div>
                <div className="font-medium text-gray-800">{service.descricao}</div>
              </div>
            )}
            <div className="col-span-2">
              <div className="text-gray-400 text-xs">Solicitado em</div>
              <div className="font-medium text-gray-800">
                {new Date(service.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Prestador atribuído */}
        {prestador && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">Prestador responsável</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">
                👨‍🌾
              </div>
              <div>
                <div className="font-semibold text-gray-800">{prestador.user.nome}</div>
                {prestador.user.cidade && (
                  <div className="text-sm text-gray-500">{prestador.user.cidade}, {prestador.user.estado}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pagamento */}
        {service.payment && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">Pagamento</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-700">
                  R$ {service.payment.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Valor do serviço</div>
              </div>
              <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                service.payment.status === 'LIBERADO' ? 'bg-green-100 text-green-700' :
                service.payment.status === 'RESERVADO' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {service.payment.status === 'LIBERADO' ? '✅ Pago' :
                 service.payment.status === 'RESERVADO' ? '🔒 Reservado' :
                 '⏳ Pendente'}
              </div>
            </div>
          </div>
        )}

        {/* ID do serviço */}
        <div className="text-center text-xs text-gray-400 space-y-1">
          <div>ID do serviço: <span className="font-mono">{service.id}</span></div>
          <div>Esta página é atualizada em tempo real.</div>
        </div>

        <Link
          href="/"
          className="block text-center py-3 bg-green-700 text-white rounded-2xl font-semibold hover:bg-green-800 transition"
        >
          Conhecer o AgroCore
        </Link>

      </div>
    </div>
  )
}
