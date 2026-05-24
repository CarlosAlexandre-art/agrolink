'use client'

import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import { SERVICOS } from '@/lib/constants'

interface Props {
  totalLiquido: number
  totalBruto: number
  comissao: number
  totalConcluidos: number
  emAndamento: number
  avaliacao: number
  meses: [string, { total: number; count: number }][]
  porTipo: [string, { total: number; count: number }][]
}

function formatMes(chave: string) {
  const [ano, mes] = chave.split('-')
  const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${nomes[parseInt(mes) - 1]} ${ano}`
}

function getLabelServico(value: string) {
  return SERVICOS.find(s => s.value === value)?.label ?? value
}

function getIconServico(value: string) {
  return SERVICOS.find(s => s.value === value)?.icon ?? '🔧'
}

export default function GanhosClient({
  totalLiquido,
  totalBruto,
  comissao,
  totalConcluidos,
  emAndamento,
  avaliacao,
  meses,
  porTipo,
}: Props) {
  const [meta, setMeta] = useState<number>(0)
  const [editandoMeta, setEditandoMeta] = useState(false)
  const [metaInput, setMetaInput] = useState('')

  useEffect(() => {
    const salva = localStorage.getItem('ganhos_meta')
    if (salva) setMeta(parseFloat(salva))
  }, [])

  function salvarMeta() {
    const val = parseFloat(metaInput.replace(',', '.'))
    if (!isNaN(val) && val > 0) {
      setMeta(val)
      localStorage.setItem('ganhos_meta', String(val))
    }
    setEditandoMeta(false)
  }

  // Mês atual e anterior
  const hoje = new Date()
  const chaveAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
  const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
  const chaveAnterior = `${mesAnterior.getFullYear()}-${String(mesAnterior.getMonth() + 1).padStart(2, '0')}`

  const dadosMesAtual = meses.find(([k]) => k === chaveAtual)?.[1] ?? { total: 0, count: 0 }
  const dadosMesAnterior = meses.find(([k]) => k === chaveAnterior)?.[1] ?? { total: 0, count: 0 }

  const variacaoPercent = dadosMesAnterior.total > 0
    ? ((dadosMesAtual.total - dadosMesAnterior.total) / dadosMesAnterior.total) * 100
    : null

  const ticketMedioMes = dadosMesAtual.count > 0
    ? dadosMesAtual.total / dadosMesAtual.count
    : 0

  const ticketMedioGeral = totalConcluidos > 0 ? totalLiquido / totalConcluidos : 0
  const melhorServico = porTipo[0] ?? null

  const progressoMeta = meta > 0 ? Math.min((dadosMesAtual.total / meta) * 100, 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-bold text-lg">💰 Ganhos</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Card 1 — Resumo do mês */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-green-700 px-5 py-4 text-white">
            <div className="text-xs text-green-300 font-medium uppercase tracking-wide mb-1">
              {formatMes(chaveAtual)}
            </div>
            <div className="text-3xl font-bold">
              R$ {dadosMesAtual.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            {variacaoPercent !== null && (
              <div className={`text-xs mt-1 font-medium ${variacaoPercent >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {variacaoPercent >= 0 ? '▲' : '▼'} {Math.abs(variacaoPercent).toFixed(1)}% vs mês anterior
              </div>
            )}
            {variacaoPercent === null && dadosMesAnterior.total === 0 && (
              <div className="text-xs mt-1 text-green-300">Primeiro mês registrado</div>
            )}
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
            <div className="px-4 py-3">
              <div className="text-base font-bold text-gray-800">{dadosMesAtual.count}</div>
              <div className="text-[11px] text-gray-500">Serviços</div>
            </div>
            <div className="px-4 py-3">
              <div className="text-base font-bold text-gray-800">
                R$ {ticketMedioMes.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-[11px] text-gray-500">Ticket médio</div>
            </div>
            <div className="px-4 py-3">
              <div className="text-base font-bold text-gray-800">
                R$ {dadosMesAnterior.total.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className="text-[11px] text-gray-500">Mês anterior</div>
            </div>
          </div>
        </div>

        {/* Stats gerais */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-xl font-bold text-green-700">{totalConcluidos}</div>
            <div className="text-xs text-gray-500 mt-1">Concluídos</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-xl font-bold text-yellow-600">{emAndamento}</div>
            <div className="text-xs text-gray-500 mt-1">Em andamento</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-xl font-bold text-gray-700">{avaliacao > 0 ? avaliacao.toFixed(1) : '—'}</div>
            <div className="text-xs text-gray-500 mt-1">⭐ Nota</div>
          </div>
        </div>

        {/* Card 2 — Ticket médio + serviço mais rentável */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Desempenho geral</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">Ticket médio (histórico)</div>
                <div className="text-xl font-bold text-green-700">
                  {totalConcluidos > 0
                    ? `R$ ${ticketMedioGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : '—'}
                </div>
              </div>
              <div className="text-3xl">📊</div>
            </div>

            {melhorServico && (
              <div className="pt-3 border-t border-gray-100">
                <div className="text-sm text-gray-500 mb-2">Serviço mais rentável</div>
                <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getIconServico(melhorServico[0])}</span>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{getLabelServico(melhorServico[0])}</div>
                      <div className="text-xs text-gray-500">{melhorServico[1].count} serviço{melhorServico[1].count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="font-bold text-green-700 text-sm">
                    R$ {melhorServico[1].total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            )}

            {porTipo.length > 1 && (
              <div className="space-y-2">
                {porTipo.slice(1).map(([tipo, dados]) => (
                  <div key={tipo} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getIconServico(tipo)}</span>
                      <span className="text-sm text-gray-700">{getLabelServico(tipo)}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      R$ {dados.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 3 — Meta mensal */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Meta mensal</h2>
            <button
              onClick={() => { setMetaInput(meta > 0 ? String(meta) : ''); setEditandoMeta(true) }}
              className="text-xs text-green-700 font-semibold hover:text-green-800"
            >
              {meta > 0 ? 'Editar' : 'Definir meta'}
            </button>
          </div>

          {editandoMeta ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">R$</span>
                <input
                  type="number"
                  value={metaInput}
                  onChange={e => setMetaInput(e.target.value)}
                  placeholder="Ex: 5000"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-400"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={salvarMeta}
                  className="flex-1 py-2 bg-green-700 text-white text-sm font-bold rounded-xl hover:bg-green-800 active:scale-95 transition"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setEditandoMeta(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : meta > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">
                  R$ {dadosMesAtual.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-gray-400">
                  meta: R$ {meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${progressoMeta >= 100 ? 'bg-green-500' : 'bg-green-600'}`}
                  style={{ width: `${progressoMeta}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-bold ${progressoMeta >= 100 ? 'text-green-600' : 'text-gray-700'}`}>
                  {progressoMeta >= 100 ? '🎉 Meta atingida!' : `${progressoMeta.toFixed(0)}% da meta`}
                </span>
                {progressoMeta < 100 && (
                  <span className="text-xs text-gray-400">
                    Faltam R$ {(meta - dadosMesAtual.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm">Defina uma meta mensal para acompanhar seu progresso.</p>
            </div>
          )}
        </div>

        {/* Total histórico */}
        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
          <div className="text-sm text-gray-600 mb-2 font-medium">Total histórico recebido</div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Valor bruto dos serviços</span>
            <span className="font-medium text-gray-700">R$ {totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Comissão AgroCore ({(comissao * 100).toFixed(0)}%)</span>
            <span className="font-medium text-red-500">- R$ {(totalBruto * comissao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-green-200 pt-2 mt-2">
            <span className="text-gray-700">Você recebeu (líquido)</span>
            <span className="text-green-700 text-lg">R$ {totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Por mês */}
        {meses.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Histórico por mês</h2>
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

        {totalConcluidos === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">💰</div>
            <p className="text-lg">Nenhum ganho ainda.</p>
            <p className="text-sm">Complete serviços para ver seus ganhos aqui.</p>
          </div>
        )}

      </div>

      <BottomNav tipo="PRESTADOR" />
    </div>
  )
}
