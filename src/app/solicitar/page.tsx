'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SERVICOS, URGENCIAS, CATEGORIAS, type CategoriaServico } from '@/lib/constants'
export default function SolicitarPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [plano, setPlano] = useState<string>('free')

  useEffect(() => {
    fetch('/api/perfil/me').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.plan) setPlano(d.plan)
    }).catch(() => {})
  }, [])

  const isPro = ['pro', 'enterprise', 'admin'].includes(plano)
  const [tipo, setTipo] = useState('')
  const [area, setArea] = useState('')
  const [urgencia, setUrgencia] = useState('MEDIA')
  const [descricao, setDescricao] = useState('')
  const [loading, setLoading] = useState(false)
  const [gerandoDesc, setGerandoDesc] = useState(false)
  const [erroDesc, setErroDesc] = useState('')
  const [catFiltro, setCatFiltro] = useState<CategoriaServico | 'TODOS'>('TODOS')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [endereco, setEndereco] = useState('')

  useEffect(() => {
    if (!navigator.geolocation) return
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoStatus('ok')
      },
      () => setGeoStatus('error'),
      { timeout: 8000, maximumAge: 60000 }
    )
  }, [])

  async function gerarDescricao() {
    setGerandoDesc(true)
    setErroDesc('')
    try {
      const res = await fetch('/api/ai/descrever-servico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, area, urgencia, rascunho: descricao }),
      })
      const data = await res.json()
      if (res.ok) setDescricao(data.descricao)
      else setErroDesc(data.error || 'Erro ao gerar descrição')
    } catch {
      setErroDesc('Sem conexão. Tente novamente.')
    } finally {
      setGerandoDesc(false)
    }
  }

  async function geocodificarEndereco(end: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(end + ', Brasil')}&format=json&limit=1`
      const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } })
      const data = await res.json()
      if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    } catch {}
    return null
  }

  async function handleSubmit() {
    if (!tipo) return
    setLoading(true)

    let finalCoords = coords

    // Se não tem GPS, tenta geocodificar o endereço digitado
    if (!finalCoords && endereco.trim().length > 3) {
      finalCoords = await geocodificarEndereco(endereco)
    }

    if (!finalCoords) {
      alert('Informe um endereço válido ou permita acesso à localização do dispositivo.')
      setLoading(false)
      return
    }

    const res = await fetch('/api/servicos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo,
        area: area ? parseFloat(area) : null,
        urgencia,
        descricao,
        latitude: finalCoords.lat,
        longitude: finalCoords.lng,
        endereco,
      })
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/servico/${data.id}?obrigado=1`)
      return
    }

    alert('Erro ao solicitar serviço. Tente novamente.')
    setLoading(false)
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
            <h2 className="text-xl font-bold text-gray-800 mb-3">Qual serviço você precisa?</h2>

            {/* Filtro de categoria */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
              <button
                onClick={() => setCatFiltro('TODOS')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${catFiltro === 'TODOS' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Todos
              </button>
              {CATEGORIAS.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCatFiltro(cat.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${catFiltro === cat.value ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {SERVICOS.filter(s => catFiltro === 'TODOS' || s.categoria === catFiltro).map(s => (
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
              {/* Status do GPS */}
              {geoStatus === 'loading' && (
                <div className="flex items-center gap-2 text-sm text-blue-600 mb-2 bg-blue-50 px-3 py-2 rounded-xl">
                  <span className="animate-spin">⏳</span> Obtendo sua localização GPS…
                </div>
              )}
              {geoStatus === 'ok' && (
                <div className="flex items-center gap-2 text-sm text-green-700 mb-2 bg-green-50 px-3 py-2 rounded-xl">
                  ✅ Localização GPS capturada ({coords?.lat.toFixed(4)}, {coords?.lng.toFixed(4)})
                  <button type="button" onClick={() => { setCoords(null); setGeoStatus('error') }} className="ml-auto text-xs text-gray-400 hover:text-gray-600">Usar endereço</button>
                </div>
              )}
              {geoStatus === 'error' && (
                <div className="text-xs text-amber-600 mb-2 bg-amber-50 px-3 py-2 rounded-xl">
                  ⚠️ GPS não disponível — digite o endereço da fazenda abaixo para calcular a localização.
                </div>
              )}
              <input
                type="text"
                value={endereco}
                onChange={e => setEndereco(e.target.value)}
                placeholder="Ex: Fazenda Boa Vista, Sorriso - MT"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
              />
              {!coords && (
                <p className="text-xs text-gray-400 mt-1">O endereço será convertido automaticamente para coordenadas ao confirmar o pedido.</p>
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
                {URGENCIAS.map(u => {
                  const bloqueada = u.value === 'ALTA' && !isPro
                  return (
                    <button
                      key={u.value}
                      type="button"
                      onClick={() => !bloqueada && setUrgencia(u.value)}
                      disabled={bloqueada}
                      className={`w-full p-3 border-2 rounded-xl text-left transition ${
                        bloqueada
                          ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                          : urgencia === u.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">{u.label}</span>
                        {bloqueada && (
                          <Link href="/planos" onClick={e => e.stopPropagation()}
                            className="text-xs text-green-700 font-semibold border border-green-300 px-2 py-0.5 rounded-full hover:bg-green-50">
                            🔒 Pro
                          </Link>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Observação */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  📝 Observações (opcional)
                </label>
                <button
                  type="button"
                  onClick={gerarDescricao}
                  disabled={gerandoDesc}
                  className="text-xs text-green-700 font-semibold border border-green-300 bg-green-50 px-3 py-1 rounded-full hover:bg-green-100 transition disabled:opacity-50"
                >
                  {gerandoDesc ? '🤖 Gerando...' : '🤖 Gerar com IA'}
                </button>
              </div>
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                rows={3}
                placeholder="Detalhes adicionais sobre o serviço..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
              {erroDesc && <p className="text-xs text-red-500 mt-1">{erroDesc}</p>}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
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
