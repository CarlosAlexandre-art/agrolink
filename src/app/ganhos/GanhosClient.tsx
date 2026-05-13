'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Props {
  totalLiquido: number
  totalBruto: number
  comissao: number
  totalConcluidos: number
  emAndamento: number
  avaliacao: number
  meses: [string, { total: number; count: number }][]
  temConta: boolean
}

function formatMes(chave: string) {
  const [ano, mes] = chave.split('-')
  const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${nomes[parseInt(mes) - 1]} ${ano}`
}

export default function GanhosClient({
  totalLiquido,
  totalBruto,
  comissao,
  totalConcluidos,
  emAndamento,
  avaliacao,
  meses,
  temConta,
}: Props) {
  const [saldo, setSaldo] = useState<number | null>(null)
  const [saldoPendente, setSaldoPendente] = useState<number>(0)
  const [carregandoSaldo, setCarregandoSaldo] = useState(false)
  const [sacando, setSacando] = useState(false)
  const [msgSaque, setMsgSaque] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
  const [conectando, setConectando] = useState(false)

  useEffect(() => {
    if (!temConta) return
    setCarregandoSaldo(true)
    fetch('/api/carteira')
      .then(r => r.json())
      .then(d => {
        if (d.conectado) {
          setSaldo(d.saldo)
          setSaldoPendente(d.saldoPendente)
        }
      })
      .finally(() => setCarregandoSaldo(false))
  }, [temConta])

  async function conectarConta() {
    setConectando(true)
    const res = await fetch('/api/stripe/connect', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setConectando(false)
  }

  async function solicitarSaque() {
    if (!saldo || saldo <= 0) return
    setSacando(true)
    setMsgSaque(null)
    const res = await fetch('/api/carteira', { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setMsgSaque({ tipo: 'sucesso', texto: `✅ Saque de R$ ${data.valor.toFixed(2)} solicitado! Previsão: ${data.previsao}` })
      setSaldo(0)
    } else {
      setMsgSaque({ tipo: 'erro', texto: `❌ ${data.error}` })
    }
    setSacando(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-bold text-lg">💰 Ganhos</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Carteira — saldo disponível para saque */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-green-700 px-5 py-4 text-white">
            <div className="text-sm text-green-200 mb-1">Saldo disponível para saque</div>
            {!temConta ? (
              <div className="text-2xl font-bold">— Conta não conectada</div>
            ) : carregandoSaldo ? (
              <div className="text-2xl font-bold animate-pulse">Carregando...</div>
            ) : (
              <div className="text-4xl font-bold">
                R$ {(saldo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            )}
            {saldoPendente > 0 && (
              <div className="text-xs text-green-300 mt-1">
                + R$ {saldoPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pendente (em processamento)
              </div>
            )}
          </div>

          <div className="p-5 space-y-3">
            {!temConta ? (
              <button
                onClick={conectarConta}
                disabled={conectando}
                className="w-full py-4 bg-green-700 text-white font-bold rounded-2xl hover:bg-green-800 active:scale-95 transition disabled:opacity-50"
              >
                {conectando ? 'Redirecionando...' : '🏦 Conectar conta bancária'}
              </button>
            ) : (
              <>
                <button
                  onClick={solicitarSaque}
                  disabled={sacando || !saldo || saldo <= 0 || carregandoSaldo}
                  className="w-full py-4 bg-green-700 text-white font-bold rounded-2xl hover:bg-green-800 active:scale-95 transition disabled:opacity-50 shadow-md"
                >
                  {sacando ? 'Solicitando...' : `💸 Sacar R$ ${(saldo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </button>

                {msgSaque && (
                  <div className={`text-sm text-center font-medium p-3 rounded-xl ${
                    msgSaque.tipo === 'sucesso' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {msgSaque.texto}
                  </div>
                )}

                <p className="text-xs text-gray-400 text-center">
                  O valor cai na sua conta bancária em até 2 dias úteis.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Total histórico */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-sm text-gray-500 mb-3 text-center">Total histórico recebido</div>
          <div className="text-3xl font-bold text-green-700 text-center mb-3">
            R$ {totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="space-y-1 text-xs text-gray-500 border-t pt-3">
            <div className="flex justify-between">
              <span>Valor bruto dos serviços</span>
              <span className="font-medium text-gray-700">R$ {totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-red-400">
              <span>Comissão AgroCore ({(comissao * 100).toFixed(0)}%)</span>
              <span>- R$ {(totalBruto * comissao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-gray-400 text-[11px]">
              <span>Taxa Stripe (~3.49% + R$0,39 por serviço)</span>
              <span>cobrada à parte</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            O saldo disponível para saque pode ser ligeiramente menor após as taxas de processamento Stripe.
          </p>
        </div>

        {/* Stats */}
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

        {/* Breakdown bruto/líquido */}
        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Valor bruto total</span>
            <span className="font-medium">R$ {totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Comissão AgroCore ({(comissao * 100).toFixed(0)}%)</span>
            <span className="font-medium text-red-500">- R$ {(totalBruto * comissao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-green-200 pt-2 mt-2">
            <span className="text-gray-700">Você recebeu</span>
            <span className="text-green-700">R$ {totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Por mês */}
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

        {totalConcluidos === 0 && (
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
        <Link href="/servicos-disponiveis" className="flex-1 py-3 text-center text-gray-500 text-xs">
          <div className="text-xl">🔔</div>Pedidos
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
