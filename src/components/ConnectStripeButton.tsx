'use client'

import { useState } from 'react'

export default function ConnectStripeButton({ conectado }: { conectado: boolean }) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  async function handleConnect() {
    setShowModal(false)
    setLoading(true)
    const res = await fetch('/api/stripe/connect', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert('Erro ao conectar conta. Tente novamente.')
      setLoading(false)
    }
  }

  if (conectado) {
    return (
      <div className="w-full py-4 bg-green-50 border-2 border-green-500 text-green-700 text-center font-bold rounded-2xl">
        ✅ Conta bancária conectada
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition disabled:opacity-50"
      >
        {loading ? 'Redirecionando...' : '🏦 Conectar conta para receber pagamentos'}
      </button>

      {/* Modal explicativo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 px-4 pb-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🏦</div>
              <h2 className="font-bold text-gray-800 text-lg">Como funciona o recebimento</h2>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <p className="text-sm text-gray-600">Você será redirecionado para uma tela segura para cadastrar seus dados bancários (conta, agência ou PIX)</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <p className="text-sm text-gray-600">Seus dados ficam protegidos — nunca passam pelo AgroCore, são armazenados diretamente pelo sistema de pagamentos</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <p className="text-sm text-gray-600">Você faz isso uma única vez. Após cadastrar, todo pagamento por serviço concluído cai automático na sua conta em até 2 dias úteis</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                <p className="text-sm text-gray-600">Não precisa criar conta em nenhum aplicativo de banco — é só preencher os dados uma vez</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleConnect}
                className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition"
              >
                Entendi, conectar minha conta →
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 text-gray-500 text-sm hover:text-gray-700 transition"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
