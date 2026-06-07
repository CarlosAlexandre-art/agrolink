'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Props {
  tipo: 'PRODUTOR' | 'PRESTADOR'
  nome: string
}

const botoesProdutor = [
  {
    href: '/solicitar',
    icon: '🌾',
    label: 'Contratar Serviço',
    desc: 'Encontre um prestador agora',
    cor: 'from-green-700 to-green-600',
  },
  {
    href: '/historico',
    icon: '🏡',
    label: 'Minha Fazenda',
    desc: 'Serviços e histórico',
    cor: 'from-emerald-700 to-emerald-600',
  },
  {
    href: '/credito',
    icon: '💳',
    label: 'Crédito Rural',
    desc: 'Simule e solicite crédito',
    cor: 'from-teal-700 to-teal-600',
  },
]

const botoesPrestador = [
  {
    href: '/servicos-disponiveis',
    icon: '🔍',
    label: 'Encontrar Clientes',
    desc: 'Veja serviços na sua região',
    cor: 'from-blue-700 to-blue-600',
  },
  {
    href: '/historico',
    icon: '📅',
    label: 'Minha Agenda',
    desc: 'Serviços agendados e em aberto',
    cor: 'from-indigo-700 to-indigo-600',
  },
  {
    href: '/credito',
    icon: '💰',
    label: 'Crédito',
    desc: 'Acesse crédito para o negócio',
    cor: 'from-violet-700 to-violet-600',
  },
]

export default function ModoSimples({ tipo, nome }: Props) {
  const botoes = tipo === 'PRODUTOR' ? botoesProdutor : botoesPrestador

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div
        className="text-white px-6 pt-10 pb-8"
        style={{ background: 'linear-gradient(135deg, #15803d 0%, #16a34a 60%, #22c55e 100%)' }}
      >
        <div className="text-green-100 text-sm mb-1">Bem-vindo de volta</div>
        <div className="text-2xl font-black">{nome.split(' ')[0]} 👋</div>
        <div className="text-green-200 text-sm mt-1">
          {tipo === 'PRODUTOR' ? '🌾 Produtor Rural' : '🔧 Prestador de Serviço'}
        </div>
      </div>

      {/* 3 botões principais */}
      <div className="flex-1 px-5 py-8 space-y-4">
        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium mb-6 text-center">
          O que você quer fazer?
        </p>

        {botoes.map(b => (
          <Link
            key={b.href}
            href={b.href}
            className={`flex items-center gap-4 w-full p-5 bg-gradient-to-r ${b.cor} text-white rounded-2xl shadow-lg active:scale-95 transition-transform`}
          >
            <span className="text-4xl">{b.icon}</span>
            <div>
              <div className="font-bold text-lg leading-tight">{b.label}</div>
              <div className="text-white/70 text-sm mt-0.5">{b.desc}</div>
            </div>
            <span className="ml-auto text-white/60 text-xl">›</span>
          </Link>
        ))}
      </div>

      {/* Link para modo completo */}
      <div className="px-5 pb-8 text-center">
        <Link
          href="/dashboard"
          className="text-sm text-gray-400 dark:text-gray-500 hover:text-green-700 transition"
        >
          Ver todas as funcionalidades →
        </Link>
      </div>
    </div>
  )
}
