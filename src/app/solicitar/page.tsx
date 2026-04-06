'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SERVICOS, URGENCIAS } from '@/lib/constants'

export default function SolicitarPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [tipo, setTipo] = useState('')
  const [area, setArea] = useState('')
  const [urgencia, setUrgencia] = useState('MEDIA')
  const [descricao, setDescricao] = useState('')
  const [loading, setLoading] = useState(false)
  const [localizando, setLocalizando] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [endereco, setEndereco] = useState('')

  async function getLocalizacao() {
    setLocalizando(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setEndereco('Localização obtida automaticamente')
        setLocalizando(false)
      },
      () => {
        setLocalizando(false)
        alert('Não foi possível obter localização. Digite o endereço manualmente.')
      }
    )
  }

  async function handleSubmit() {
    if (!tipo || !coords) return
    setLoading(true)

    const res = await fetch('/api/servicos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo,
        area: area ? parseFloat(area) : null,
        urgencia,
        descricao,
        latitude: coords.lat,
        longitude: coords.lng,
        endereco,
      })
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/servico/${data.id}`)
    } else {
      alert('Erro ao solicitar serviço. Tente novamente.')
      setLoading(false)
    }
  }

  const servicoSelecionado = SERVICOS.find(s => s.value === tipo)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-white hover:text-green-200">← Voltar</Link>
          <h1 className="font-bold text-lg">Solicitar Serviço</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Step 1 — Escolher serviço */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Qual serviço você precisa?</h2>
            <div className="grid grid-cols-2 gap-3">
              {SERVICOS.map(s => (
                <button
                  key={s.value}
                  onClick={() => { setTipo(s.value); setStep(2) }}
                  className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 active:scale-95 transition text-left"
                >
                  <div className="text-3xl mb-1">{s.icon}</div>
                  <div className="font-semibold text-gray-800 text-sm">{s.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Detalhes */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <span className="text-3xl">{servicoSelecionado?.icon}</span>
              <div>
                <div className="font-bold text-green-700">{servicoSelecionado?.label}</div>
                <button onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-gray-700">
                  Trocar serviço
                </button>
              </div>
            </div>

            {/* Localização */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Localização da propriedade
              </label>
              <button
                onClick={getLocalizacao}
                disabled={localizando}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {localizando ? 'Obtendo localização...' : coords ? '✓ Localização obtida' : 'Usar minha localização'}
              </button>
              {!coords && (
                <input
                  type="text"
                  value={endereco}
                  onChange={e => setEndereco(e.target.value)}
                  placeholder="Ou digite o endereço/cidade"
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              )}
            </div>

            {/* Área */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📐 Tamanho da área (hectares)
              </label>
              <input
                type="number"
                value={area}
                onChange={e => setArea(e.target.value)}
                placeholder="Ex: 50"
                min="0"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
              />
            </div>

            {/* Urgência */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⚡ Urgência
              </label>
              <div className="space-y-2">
                {URGENCIAS.map(u => (
                  <button
                    key={u.value}
                    type="button"
                    onClick={() => setUrgencia(u.value)}
                    className={`w-full p-3 border-2 rounded-xl text-left transition ${
                      urgencia === u.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-semibold text-gray-800">{u.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Observação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Observações (opcional)
              </label>
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                rows={3}
                placeholder="Detalhes adicionais sobre o serviço..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || (!coords && !endereco)}
              className="w-full py-5 bg-green-700 text-white font-bold text-xl rounded-2xl hover:bg-green-800 active:scale-95 transition disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Procurando prestador...' : '🔍 CONFIRMAR PEDIDO'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
