'use client'

import Link from 'next/link'
import { SERVICOS } from '@/lib/constants'
import PwaPrompt from '@/components/PwaPrompt'

export default function DashboardProdutor({ user }: { user: any }) {
  const services = user.produtor?.services || []
  const emAndamento = services.filter((s: any) =>
    ['PROCURANDO', 'MATCH_ENCONTRADO', 'EM_ROTA', 'EXECUTANDO'].includes(s.status)
  )
  const concluidos = services.filter((s: any) => s.status === 'CONCLUIDO')

  function getStatusLabel(status: string) {
    const map: Record<string, { label: string; cor: string }> = {
      AGUARDANDO: { label: 'Aguardando', cor: 'bg-gray-100 text-gray-600' },
      PROCURANDO: { label: 'Procurando prestador...', cor: 'bg-yellow-100 text-yellow-700' },
      MATCH_ENCONTRADO: { label: 'Prestador encontrado', cor: 'bg-blue-100 text-blue-700' },
      EM_ROTA: { label: 'Em rota', cor: 'bg-blue-100 text-blue-700' },
      EXECUTANDO: { label: 'Executando', cor: 'bg-purple-100 text-purple-700' },
      CONCLUIDO: { label: 'Concluído ✓', cor: 'bg-green-100 text-green-700' },
      CANCELADO: { label: 'Cancelado', cor: 'bg-red-100 text-red-600' },
    }
    return map[status] || { label: status, cor: 'bg-gray-100 text-gray-600' }
  }

  function getServicoLabel(tipo: string) {
    return SERVICOS.find(s => s.value === tipo) || { label: tipo, icon: '📋' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <div className="font-bold text-lg">🌿 AgroLink</div>
            <div className="text-green-200 text-sm">Olá, {user.nome.split(' ')[0]}!</div>
          </div>
          <Link href="/perfil" className="text-green-200 hover:text-white text-sm">
            Perfil →
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Botão principal */}
        <Link
          href="/solicitar"
          className="block w-full py-5 bg-green-700 text-white text-center font-bold text-xl rounded-2xl shadow-lg hover:bg-green-800 active:scale-95 transition"
        >
          🌾 SOLICITAR SERVIÇO
        </Link>

        {/* Em andamento */}
        {emAndamento.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-700 mb-3">Serviços em andamento</h2>
            <div className="space-y-3">
              {emAndamento.map((s: any) => {
                const servico = getServicoLabel(s.tipo)
                const status = getStatusLabel(s.status)
                return (
                  <Link
                    key={s.id}
                    href={`/servico/${s.id}`}
                    className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-300 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-gray-800">
                          {servico.icon} {servico.label}
                        </div>
                        {s.area && <div className="text-sm text-gray-500">{s.area} hectares</div>}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.cor}`}>
                        {status.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold text-green-700">{concluidos.length}</div>
            <div className="text-sm text-gray-500 mt-1">Serviços concluídos</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold text-green-700">{emAndamento.length}</div>
            <div className="text-sm text-gray-500 mt-1">Em andamento</div>
          </div>
        </div>

        {/* Histórico */}
        {services.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-700 mb-3">Últimos serviços</h2>
            <div className="space-y-3">
              {services.slice(0, 5).map((s: any) => {
                const servico = getServicoLabel(s.tipo)
                const status = getStatusLabel(s.status)
                return (
                  <Link
                    key={s.id}
                    href={`/servico/${s.id}`}
                    className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-green-300 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-gray-800">
                        {servico.icon} {servico.label}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.cor}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {services.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">🌾</div>
            <p className="text-lg">Nenhum serviço ainda.</p>
            <p className="text-sm">Clique em "Solicitar Serviço" para começar.</p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
        <Link href="/dashboard" className="flex-1 py-3 text-center text-green-700 font-semibold text-xs">
          <div className="text-xl">🏠</div>Home
        </Link>
        <Link href="/solicitar" className="flex-1 py-3 text-center text-gray-500 text-xs">
          <div className="text-xl">➕</div>Solicitar
        </Link>
        <Link href="/historico" className="flex-1 py-3 text-center text-gray-500 text-xs">
          <div className="text-xl">📋</div>Histórico
        </Link>
        <Link href="/perfil" className="flex-1 py-3 text-center text-gray-500 text-xs">
          <div className="text-xl">👤</div>Perfil
        </Link>
      </nav>
      <div className="h-16" />
      <PwaPrompt />
    </div>
  )
}
