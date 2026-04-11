'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SERVICOS, CATEGORIAS, type CategoriaServico } from '@/lib/constants'

export default function ServicosPage() {
  const [ativa, setAtiva] = useState<CategoriaServico | 'TODOS'>('TODOS')

  const filtrados = ativa === 'TODOS'
    ? SERVICOS
    : SERVICOS.filter(s => s.categoria === ativa)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white hover:text-green-200">← Voltar</Link>
            <h1 className="font-bold text-lg">Todos os Serviços</h1>
          </div>
          <Link href="/cadastro" className="px-3 py-1.5 bg-white text-green-700 font-semibold rounded-lg text-sm hover:bg-green-50 transition">
            Começar grátis
          </Link>
        </div>
      </header>

      {/* Tabs de categoria */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            <button
              onClick={() => setAtiva('TODOS')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                ativa === 'TODOS'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({SERVICOS.length})
            </button>
            {CATEGORIAS.map(cat => {
              const count = SERVICOS.filter(s => s.categoria === cat.value).length
              if (count === 0) return null
              return (
                <button
                  key={cat.value}
                  onClick={() => setAtiva(cat.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                    ativa === cat.value
                      ? 'bg-green-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon} {cat.label} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Título da categoria ativa */}
        {ativa !== 'TODOS' && (
          <div className="mb-4">
            <h2 className="font-bold text-gray-800 text-lg">
              {CATEGORIAS.find(c => c.value === ativa)?.icon}{' '}
              {CATEGORIAS.find(c => c.value === ativa)?.label}
            </h2>
            <p className="text-sm text-gray-500">{filtrados.length} serviços disponíveis</p>
          </div>
        )}

        {/* Grid de cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtrados.map(s => (
            <div
              key={s.value}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-300 transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-36 overflow-hidden">
                <Image
                  src={s.imagem}
                  alt={s.label}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {/* Badge de categoria */}
                <span className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                  {CATEGORIAS.find(c => c.value === s.categoria)?.icon}{' '}
                  {CATEGORIAS.find(c => c.value === s.categoria)?.label}
                </span>
              </div>
              <div className="p-4">
                <div className="font-bold text-gray-800 text-sm leading-tight">{s.label}</div>
                <div className="text-xs text-gray-500 mt-1 leading-relaxed">{s.descricao}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-green-700 rounded-2xl p-6 text-white text-center">
          <div className="font-bold text-xl mb-2">Precisa de algum desses serviços?</div>
          <p className="text-green-100 text-sm mb-4">
            Cadastre-se grátis e encontre prestadores próximos de você em minutos.
          </p>
          <Link
            href="/cadastro"
            className="inline-block px-6 py-3 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition"
          >
            Criar conta gratuita →
          </Link>
        </div>
      </div>
    </div>
  )
}
