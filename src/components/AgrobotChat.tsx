'use client'

import { useState, useRef, useEffect } from 'react'

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

const SUGESTOES = [
  'Como funciona o pagamento?',
  'Como escolher o melhor prestador?',
  'Quando recebo após concluir?',
  'O que são os badges?',
]

export default function AgrobotChat() {
  const [aberto, setAberto] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: 'Olá! Sou o AgroBot com IA. Pode me perguntar qualquer coisa sobre a plataforma! 🌿' }
  ])
  const [input, setInput] = useState('')
  const [carregando, setCarregando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function enviar(texto?: string) {
    const msg = texto ?? input.trim()
    if (!msg || carregando) return
    setInput('')

    const novas: Msg[] = [...msgs, { role: 'user', content: msg }]
    setMsgs(novas)
    setCarregando(true)

    try {
      const res = await fetch('/api/agrobot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: novas.slice(-10) }),
      })
      const data = await res.json()
      setMsgs(prev => [...prev, { role: 'assistant', content: data.resposta || 'Não consegui processar. Tente novamente.' }])
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Erro de conexão. Tente novamente em instantes.' }])
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div className="text-left">
            <div className="font-bold text-gray-800">AgroBot IA</div>
            <div className="text-xs text-gray-500">Assistente inteligente — pergunte qualquer coisa</div>
          </div>
        </div>
        <span className="text-gray-400 transition-transform" style={{ transform: aberto ? 'rotate(180deg)' : undefined }}>▼</span>
      </button>

      {aberto && (
        <div className="border-t border-gray-100">
          {/* Mensagens */}
          <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-green-700 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {carregando && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 text-gray-400 text-sm flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Sugestões */}
          {msgs.length <= 1 && (
            <div className="px-4 py-2 flex gap-2 overflow-x-auto">
              {SUGESTOES.map(s => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 pt-2 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
              placeholder="Sua pergunta..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              disabled={carregando}
            />
            <button
              onClick={() => enviar()}
              disabled={!input.trim() || carregando}
              className="px-4 py-2.5 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 disabled:opacity-40 transition text-sm"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
