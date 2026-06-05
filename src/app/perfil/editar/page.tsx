'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ESTADOS_BRASIL } from '@/lib/constants'

export default function EditarPerfilPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')
  const [nomeFazenda, setNomeFazenda] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [tipo, setTipo] = useState('')

  useEffect(() => {
    fetch('/api/perfil/me')
      .then(r => r.json())
      .then(data => {
        setNome(data.nome || '')
        setTelefone(data.telefone || '')
        setEstado(data.estado || '')
        setCidade(data.cidade || '')
        setNomeFazenda(data.produtor?.nomeFazenda || '')
        setAvatarUrl(data.avatarUrl || '')
        setTipo(data.tipo || '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    setErro('')

    const form = new FormData()
    form.append('file', file)

    const res = await fetch('/api/perfil/avatar', { method: 'POST', body: form })
    const data = await res.json()
    if (data.url) {
      setAvatarUrl(data.url)
      // Save immediately
      await fetch('/api/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: data.url })
      })
    } else {
      setErro(data.error || 'Erro ao enviar foto')
    }
    setUploadingAvatar(false)
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErro('')

    const res = await fetch('/api/perfil', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone, estado, cidade, nomeFazenda, avatarUrl })
    })

    if (res.ok) {
      setSucesso(true)
      setTimeout(() => router.push('/perfil'), 1500)
    } else {
      setErro('Erro ao salvar. Tente novamente.')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-green-700 font-semibold">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/perfil" className="text-white hover:text-green-200">← Voltar</Link>
          <h1 className="font-bold text-lg">Editar Perfil</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Foto de perfil */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="relative inline-block mb-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Foto de perfil"
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-green-100"
              />
            ) : (
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-4xl font-bold text-green-700 mx-auto">
                {nome?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-green-700 text-white rounded-full flex items-center justify-center text-sm hover:bg-green-800 transition shadow"
            >
              ✏️
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
            className="text-sm text-green-700 font-semibold hover:underline"
          >
            {uploadingAvatar ? 'Enviando foto...' : 'Alterar foto de perfil'}
          </button>
          <p className="text-xs text-gray-400 mt-1">JPG ou PNG, máx. 5MB</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSalvar} className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-600 text-sm">
                🇧🇷 +55
              </span>
              <input
                type="tel"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                placeholder="(85) 99999-9999"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
              >
                <option value="">Selecione</option>
                {ESTADOS_BRASIL.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                type="text"
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                placeholder="Sua cidade"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          {tipo === 'PRODUTOR' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da fazenda</label>
              <input
                type="text"
                value={nomeFazenda}
                onChange={e => setNomeFazenda(e.target.value)}
                placeholder="Fazenda Boa Vista"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
              />
            </div>
          )}

          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{erro}</div>
          )}

          {sucesso && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-semibold">
              ✅ Perfil atualizado com sucesso!
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-green-700 text-white font-bold text-lg rounded-2xl hover:bg-green-800 transition disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
