'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export type PopupTipo = 'agroOS' | 'compartilhar' | null

interface Props {
  tipo: PopupTipo
  onFechar: () => void
}

export default function PopupInteligente({ tipo, onFechar }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tipo) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [tipo, onFechar])

  if (!tipo) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === overlayRef.current) onFechar() }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7 relative animate-slide-up">
        <button
          onClick={onFechar}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Fechar"
        >
          ✕
        </button>

        {tipo === 'agroOS' && (
          <>
            <div className="text-5xl text-center mb-4">🚀</div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              Parabéns pelo serviço concluído!
            </h2>
            <p className="text-sm text-gray-500 text-center mb-5">
              Que tal levar sua operação ainda mais longe? O <strong className="text-green-700">AgroOS</strong> é o sistema operacional da sua fazenda — controle total em um só lugar.
            </p>
            <div className="space-y-3">
              <a
                href="https://agroos.com.br"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onFechar}
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 active:scale-95 transition"
              >
                Conhecer o AgroOS
              </a>
              <button
                onClick={onFechar}
                className="w-full py-3 text-gray-500 text-sm hover:text-gray-700 transition"
              >
                Agora não
              </button>
            </div>
          </>
        )}

        {tipo === 'compartilhar' && (
          <>
            <div className="text-5xl text-center mb-4">⭐</div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
              Obrigado pela avaliação!
            </h2>
            <p className="text-sm text-gray-500 text-center mb-5">
              Sua contribuição fortalece toda a comunidade AgroCore. Que tal indicar para outros produtores e prestadores?
            </p>
            <div className="space-y-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent('Estou usando o AgroCore para contratar serviços rurais. Vale a pena! Acesse: https://agrocore.com.br')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onFechar}
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 active:scale-95 transition"
              >
                📱 Compartilhar no WhatsApp
              </a>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText('https://agrocore.com.br')
                  onFechar()
                }}
                className="w-full py-3 border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition"
              >
                🔗 Copiar link
              </button>
              <button
                onClick={onFechar}
                className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition"
              >
                Agora não
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
