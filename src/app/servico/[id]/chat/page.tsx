'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Remetente {
  id: string
  nome: string
  tipo: string
  avatarUrl: string | null
}

interface Mensagem {
  id: string
  texto: string
  createdAt: string
  remetente: Remetente
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function isDiferenteDia(a: string, b: string) {
  return new Date(a).toDateString() !== new Date(b).toDateString()
}

export default function ChatPage() {
  const params = useParams()
  const serviceId = params.id as string

  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [meuId, setMeuId] = useState<string | null>(null)
  const [outro, setOutro] = useState<Remetente | null>(null)
  const [carregando, setCarregando] = useState(true)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastCreatedAt = useRef<string | null>(null)

  // Carregar mensagens iniciais
  const carregar = useCallback(async (inicial = false) => {
    const url = `/api/mensagens?serviceId=${serviceId}` +
      (!inicial && lastCreatedAt.current ? `&after=${encodeURIComponent(lastCreatedAt.current)}` : '')

    const res = await fetch(url)
    if (!res.ok) return
    const data: Mensagem[] = await res.json()
    if (data.length === 0) return

    if (inicial) {
      setMensagens(data)
    } else {
      setMensagens(prev => [...prev, ...data])
    }

    lastCreatedAt.current = data[data.length - 1].createdAt
  }, [serviceId])

  // Identificar o usuário atual
  useEffect(() => {
    fetch('/api/perfil/me')
      .then(r => r.json())
      .then(d => { if (d?.id) setMeuId(d.id) })
  }, [])

  // Carga inicial
  useEffect(() => {
    carregar(true).then(() => setCarregando(false))
  }, [carregar])

  // Descobrir o outro participante a partir das mensagens
  useEffect(() => {
    if (!meuId || mensagens.length === 0) return
    const outraMsg = mensagens.find(m => m.remetente.id !== meuId)
    if (outraMsg) setOutro(outraMsg.remetente)
  }, [mensagens, meuId])

  // Scroll para o final quando chegam mensagens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  // Polling a cada 3s
  useEffect(() => {
    const interval = setInterval(() => carregar(false), 3000)
    return () => clearInterval(interval)
  }, [carregar])

  async function enviar() {
    if (!texto.trim() || enviando) return
    setEnviando(true)
    const res = await fetch('/api/mensagens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId, texto }),
    })
    if (res.ok) {
      const nova: Mensagem = await res.json()
      setMensagens(prev => [...prev, nova])
      lastCreatedAt.current = nova.createdAt
      setTexto('')
      inputRef.current?.focus()
    }
    setEnviando(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  const titulo = outro ? outro.nome.split(' ')[0] : 'Chat do Serviço'

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-700 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Link href={`/servico/${serviceId}`} className="text-white hover:text-green-200">
          ← Voltar
        </Link>
        <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
          {outro ? outro.nome[0].toUpperCase() : '?'}
        </div>
        <div>
          <div className="font-bold leading-tight">{titulo}</div>
          <div className="text-green-200 text-xs">
            {outro?.tipo === 'PRESTADOR' ? 'Prestador' : outro ? 'Produtor' : 'Carregando...'}
          </div>
        </div>
      </header>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {carregando && (
          <div className="text-center text-gray-400 py-12">Carregando conversa...</div>
        )}

        {!carregando && mensagens.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-2">💬</div>
            <p>Nenhuma mensagem ainda.</p>
            <p className="text-sm mt-1">Mande um olá para começar!</p>
          </div>
        )}

        {mensagens.map((m, i) => {
          const minha = m.remetente.id === meuId
          const mostrarData = i === 0 || isDiferenteDia(mensagens[i - 1].createdAt, m.createdAt)

          return (
            <div key={m.id}>
              {mostrarData && (
                <div className="text-center my-3">
                  <span className="text-xs bg-gray-200 text-gray-500 px-3 py-1 rounded-full">
                    {formatData(m.createdAt)}
                  </span>
                </div>
              )}
              <div className={`flex ${minha ? 'justify-end' : 'justify-start'} mb-1`}>
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    minha
                      ? 'bg-green-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{m.texto}</p>
                  <p className={`text-xs mt-1 text-right ${minha ? 'text-green-200' : 'text-gray-400'}`}>
                    {formatHora(m.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-3 items-end flex-shrink-0">
        <textarea
          ref={inputRef}
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Digite uma mensagem..."
          className="flex-1 resize-none px-4 py-2.5 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-900 bg-white max-h-32 overflow-y-auto"
          style={{ lineHeight: '1.4' }}
        />
        <button
          onClick={enviar}
          disabled={!texto.trim() || enviando}
          className="w-11 h-11 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 active:scale-95 transition disabled:opacity-40 flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rotate-45">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
