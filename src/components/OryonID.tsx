'use client'

import { useEffect, useState } from 'react'
import SeloVerificado from './SeloVerificado'

interface OryonIDData {
  tipo: 'PRODUTOR' | 'PRESTADOR'
  nome: string
  membroDesde: string
  mesesAtivo: number
  verificado: boolean
  stats: {
    servicosSolicitados?: number
    servicosAceitos?: number
    servicosConcluidos: number
    valorMovimentado: number
    avaliacaoMedia: number
    totalAvaliacoes: number
    pontualidade?: number
    regioes?: string[]
    tiposServico?: string[]
    regiao?: string | null
    raioAtendamento?: number
  }
}

function StatBox({ valor, label, destaque }: { valor: string; label: string; destaque?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 text-center ${destaque ? 'bg-green-700 text-white' : 'bg-gray-50 dark:bg-gray-800'}`}>
      <div className={`text-2xl font-black ${destaque ? 'text-white' : 'text-green-700 dark:text-green-400'}`}>{valor}</div>
      <div className={`text-xs mt-1 ${destaque ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'}`}>{label}</div>
    </div>
  )
}

function BarraProgresso({ valor, label, cor = 'bg-green-500' }: { valor: number; label: string; cor?: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-800 dark:text-gray-200">{valor}%</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-2 ${cor} rounded-full transition-all duration-700`} style={{ width: `${Math.min(valor, 100)}%` }} />
      </div>
    </div>
  )
}

export default function OryonID() {
  const [data, setData] = useState<OryonIDData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/oryon-id')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl" />)}
      </div>
    </div>
  )

  if (!data || data.stats === undefined) return null

  const valorFmt = data.stats.valorMovimentado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  const membroDesde = new Date(data.membroDesde).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-lg tracking-tight">ORYON ID</span>
              <SeloVerificado verificado={data.verificado} tipo={data.tipo} size="sm" showLabel={false} />
            </div>
            <div className="text-green-200 text-xs mt-0.5">Histórico Operacional Verificado</div>
          </div>
          <div className="text-right">
            <div className="text-white text-xs opacity-70">Membro desde</div>
            <div className="text-white text-sm font-semibold">{membroDesde}</div>
            {data.mesesAtivo > 0 && (
              <div className="text-green-200 text-xs">{data.mesesAtivo} {data.mesesAtivo === 1 ? 'mês' : 'meses'} ativo</div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox
            valor={data.stats.servicosConcluidos.toString()}
            label={data.tipo === 'PRODUTOR' ? 'Contratações' : 'Serviços feitos'}
            destaque
          />
          <StatBox
            valor={data.stats.avaliacaoMedia > 0 ? `${data.stats.avaliacaoMedia.toFixed(1)}⭐` : '—'}
            label="Avaliação"
          />
          <StatBox
            valor={valorFmt}
            label="Valor movimentado"
          />
        </div>

        {/* Pontualidade — só para prestador */}
        {data.tipo === 'PRESTADOR' && data.stats.pontualidade !== undefined && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Desempenho</h3>
            <BarraProgresso valor={data.stats.pontualidade} label="Taxa de conclusão" cor="bg-green-500" />
            {data.stats.avaliacaoMedia > 0 && (
              <BarraProgresso valor={Math.round((data.stats.avaliacaoMedia / 5) * 100)} label="Score de avaliação" cor="bg-blue-500" />
            )}
          </div>
        )}

        {/* Região */}
        {data.tipo === 'PRESTADOR' && data.stats.regiao && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>📍</span>
            <span>{data.stats.regiao}</span>
            {data.stats.raioAtendamento && (
              <span className="text-xs text-gray-400">· atende até {data.stats.raioAtendamento} km</span>
            )}
          </div>
        )}

        {data.tipo === 'PRODUTOR' && data.stats.regioes && data.stats.regioes.length > 0 && (
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>📍</span>
            <span>{data.stats.regioes.join(' · ')}</span>
          </div>
        )}

        {/* Total avaliações */}
        {data.stats.totalAvaliacoes > 0 && (
          <div className="text-center text-xs text-gray-400 dark:text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-700">
            Baseado em {data.stats.totalAvaliacoes} avaliação{data.stats.totalAvaliacoes !== 1 ? 'ões' : ''} verificadas
          </div>
        )}
      </div>
    </div>
  )
}
