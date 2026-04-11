'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGESTOES = [
  'Como solicitar um serviço?',
  'Como funciona o pagamento?',
  'Quanto custa pulverização por ha?',
  'Como conectar minha conta bancária?',
]

const STORAGE_KEY = 'agrobot_visivel'

export default function AgroBot() {
  const [open, setOpen] = useState(false)
  const [visivel, setVisivel] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(false)
  const [userType, setUserType] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY)
    if (salvo === 'false') setVisivel(false)
  }, [])

  useEffect(() => {
    fetch('/api/perfil/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.tipo) setUserType(data.tipo)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (open) {
      setUnread(false)
      if (messages.length === 0) {
        setMessages([{
          role: 'assistant',
          content: 'Olá! Sou o AgroBot 🌿 Posso te ajudar com dúvidas sobre a plataforma, sugestões de preços e muito mais. Como posso te ajudar?'
        }])
      }
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function dispensar() {
    setOpen(false)
    setVisivel(false)
    localStorage.setItem(STORAGE_KEY, 'false')
  }

  async function enviar(texto?: string) {
    const msg = texto || input.trim()
    if (!msg || loading) return
    setInput('')

    const newMessages: Message[] = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userType,
        })
      })
      const data = await res.json()
      const reply = data.reply || 'Desculpe, não consegui processar sua mensagem.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (!open) setUnread(true)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro de conexão. Tente novamente.' }])
    }
    setLoading(false)
  }

  if (!visivel) return null

  return (
    <>
      {/* Chat window */}
      {open && (
        <div
          className="fixed right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ bottom: '9rem', height: '480px' }}
        >
          {/* Header */}
          <div className="bg-green-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg">🌿</div>
              <div>
                <div className="text-white font-bold text-sm">AgroBot</div>
                <div className="text-green-200 text-xs">Assistente AgroCore</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white hover:text-green-200 text-xl leading-none">×</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-green-700 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 bg-gray-50 flex flex-wrap gap-1">
              {SUGESTOES.map(s => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full hover:bg-green-100 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 p-3 bg-white flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && enviar()}
              placeholder="Digite sua dúvida..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            />
            <button
              onClick={() => enviar()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-green-700 text-white rounded-xl flex items-center justify-center hover:bg-green-800 transition disabled:opacity-40 flex-shrink-0"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* FAB + X para dispensar */}
      <div className="fixed right-4 z-50" style={{ bottom: '5.5rem' }}>
        {/* X pequeno no canto superior esquerdo do botão */}
        {!open && (
          <button
            onClick={dispensar}
            className="absolute -top-2 -left-2 w-5 h-5 bg-gray-500 hover:bg-gray-700 text-white rounded-full flex items-center justify-center text-xs shadow-md transition z-10"
            title="Fechar AgroBot"
          >
            ×
          </button>
        )}
        <button
          onClick={() => setOpen(prev => !prev)}
          className="w-14 h-14 bg-green-700 text-white rounded-full shadow-lg hover:bg-green-800 active:scale-95 transition flex items-center justify-center text-2xl relative"
        >
          {open ? '×' : '🌿'}
          {unread && !open && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
      </div>
    </>
  )
}
