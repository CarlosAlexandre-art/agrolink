'use client'

import { useState } from 'react'
import Link from 'next/link'
import AgroCoreLogo from '@/components/AgroCoreLogo'

const AGRORATE_URL = 'https://agro-rate.vercel.app'

type CreditType = {
  id: string
  icon: string
  nome: string
  subtitulo: string
  descricao: string
  finalidade: string[]
  prazoMin: string
  prazoMax: string
  taxaRef: string
  fontes: string[]
  requisitos: string[]
  scoreMin: number
  destaque?: boolean
}

const TIPOS: CreditType[] = [
  {
    id: 'custeio',
    icon: '🌱',
    nome: 'Custeio Agrícola',
    subtitulo: 'Capital de giro para a safra',
    descricao: 'Financia os gastos diretos da produção: sementes, fertilizantes, defensivos, combustível e mão de obra para o plantio e colheita.',
    finalidade: ['Sementes e mudas', 'Fertilizantes e corretivos', 'Defensivos agrícolas', 'Combustível e energia', 'Mão de obra temporária'],
    prazoMin: '6 meses',
    prazoMax: '18 meses',
    taxaRef: '0,25% – 0,83% a.m.',
    fontes: ['Banco do Brasil (Pronaf/Pronamp)', 'Sicredi', 'Sicoob', 'Cresol'],
    requisitos: ['CAF ou documentação da propriedade', 'Projeto de produção', 'Score AgroRate a partir de 100'],
    scoreMin: 100,
    destaque: true,
  },
  {
    id: 'investimento',
    icon: '🏗️',
    nome: 'Investimento Rural',
    subtitulo: 'Estrutura e equipamentos',
    descricao: 'Para aquisição de máquinas, implementos, construção de silos, armazéns, irrigação e melhorias de infraestrutura produtiva.',
    finalidade: ['Tratores e colheitadeiras', 'Sistemas de irrigação', 'Silos e armazéns', 'Cercas e estradas internas', 'Energia solar rural'],
    prazoMin: '24 meses',
    prazoMax: '84 meses',
    taxaRef: '0,64% – 0,82% a.m.',
    fontes: ['BNDES/Finame', 'Banco do Brasil (Moderinfra)', 'Sicredi (Pronamp)', 'Bradesco E-agro'],
    requisitos: ['Projeto técnico aprovado', 'Nota fiscal dos bens', 'Score AgroRate a partir de 450'],
    scoreMin: 450,
  },
  {
    id: 'comercializacao',
    icon: '📦',
    nome: 'Comercialização',
    subtitulo: 'Pós-colheita e estocagem',
    descricao: 'Voltado para financiar a guarda e venda da produção após a colheita, permitindo aguardar o melhor momento de mercado.',
    finalidade: ['Estocagem da safra', 'Aguardar preço de mercado', 'Transporte e logística', 'Pré-pagamento de contratos futuros'],
    prazoMin: '3 meses',
    prazoMax: '12 meses',
    taxaRef: '0,69% – 1,10% a.m.',
    fontes: ['CPR Digital (Agrolend)', 'CPRF (Santander)', 'Banco do Brasil', 'Cooperativas regionais'],
    requisitos: ['Contratos de venda ou CPR', 'Laudo de armazenamento', 'Score AgroRate a partir de 300'],
    scoreMin: 300,
  },
  {
    id: 'pronaf',
    icon: '👨‍🌾',
    nome: 'Pronaf',
    subtitulo: 'Agricultura familiar',
    descricao: 'Programa Nacional de Fortalecimento da Agricultura Familiar — as menores taxas do mercado, destinadas a pequenos produtores com DAP/CAF ativo.',
    finalidade: ['Custeio da safra familiar', 'Agroindústria familiar', 'Mulher rural', 'Agroecologia e orgânicos', 'Microcrédito rural'],
    prazoMin: '6 meses',
    prazoMax: '36 meses',
    taxaRef: '0,04% – 0,25% a.m.',
    fontes: ['BNB – Agroamigo', 'Banco do Brasil', 'Sicoob', 'Cresol', 'Bancoob'],
    requisitos: ['DAP ou CAF ativo', 'Renda anual até R$ 500 mil', 'Imóvel rural comprovado', 'Score AgroRate a partir de 0'],
    scoreMin: 0,
  },
  {
    id: 'terra',
    icon: '🗺️',
    nome: 'Aquisição de Terra',
    subtitulo: 'Financiamento de imóvel rural',
    descricao: 'Para compra de terras produtivas, com o próprio imóvel como garantia. Prazos longos e parcelas reduzidas.',
    finalidade: ['Compra de propriedade rural', 'Regularização fundiária', 'Ampliação da área produtiva'],
    prazoMin: '12 meses',
    prazoMax: '30 anos',
    taxaRef: '0,69% – 0,95% a.m.',
    fontes: ['TerraMagna', 'Banco da Terra', 'Banco do Brasil', 'Incra (reforma agrária)'],
    requisitos: ['Matrícula do imóvel', 'Laudo de avaliação', 'Score AgroRate a partir de 400'],
    scoreMin: 400,
  },
  {
    id: 'antecipacao',
    icon: '⚡',
    nome: 'Antecipação de Recebíveis',
    subtitulo: 'Receba antes da colheita',
    descricao: 'Fintechs agro permitem antecipar o valor de contratos futuros de venda, sem esperar a colheita. Processo 100% digital.',
    finalidade: ['Antecipar contratos de venda', 'Capital de giro imediato', 'Pagar fornecedores antes da safra'],
    prazoMin: '1 mês',
    prazoMax: '12 meses',
    taxaRef: '0,95% – 2,0% a.m.',
    fontes: ['Agrolend', 'TerraMagna', 'AgroGalaxy Crédito', 'Traive'],
    requisitos: ['Contratos de venda firmados', 'Nota fiscal ou CPR', 'Score AgroRate a partir de 200'],
    scoreMin: 200,
  },
]

const CATEGORIAS = [
  { id: 'todos', label: 'Todos' },
  { id: 'custeio', label: '🌱 Custeio' },
  { id: 'investimento', label: '🏗️ Investimento' },
  { id: 'comercializacao', label: '📦 Comercialização' },
  { id: 'pronaf', label: '👨‍🌾 Pronaf' },
  { id: 'terra', label: '🗺️ Terra' },
  { id: 'antecipacao', label: '⚡ Antecipação' },
]

export default function CreditoPage() {
  const [cat, setCat] = useState('todos')
  const [expanded, setExpanded] = useState<string | null>('custeio')

  const visible = cat === 'todos' ? TIPOS : TIPOS.filter(t => t.id === cat)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-700 text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-green-300 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </Link>
          <AgroCoreLogo size={24} showSubtitle={false} />
          <span className="text-green-200 text-sm ml-1">/ Crédito Rural</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Hero */}
        <div className="bg-gradient-to-br from-green-700 to-emerald-800 text-white rounded-2xl p-5">
          <div className="text-2xl mb-1">💳</div>
          <h1 className="text-xl font-bold mb-1">Crédito Rural</h1>
          <p className="text-green-100 text-sm leading-relaxed mb-4">
            Conheça as linhas disponíveis para sua fazenda. Para simular e solicitar, acesse o AgroRate — seu score de crédito rural.
          </p>
          <a href={AGRORATE_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-green-700 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-green-50 transition">
            Ver meu score no AgroRate
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </div>

        {/* Filtros de categoria */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {CATEGORIAS.map(c => (
            <button key={c.id} onClick={() => { setCat(c.id); setExpanded(c.id === 'todos' ? 'custeio' : c.id) }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${cat === c.id ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400'}`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {visible.map(tipo => {
            const isOpen = expanded === tipo.id
            return (
              <div key={tipo.id}
                className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${tipo.destaque ? 'border-green-400' : 'border-gray-100'}`}>

                {tipo.destaque && (
                  <div className="bg-green-600 text-white text-xs font-bold px-4 py-1 text-center tracking-wide">
                    ⭐ Mais solicitado pelos produtores
                  </div>
                )}

                {/* Header do card */}
                <button className="w-full text-left px-5 py-4 flex items-center gap-4"
                  onClick={() => setExpanded(isOpen ? null : tipo.id)}>
                  <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-2xl flex-shrink-0">
                    {tipo.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900">{tipo.nome}</div>
                    <div className="text-xs text-gray-500">{tipo.subtitulo}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-green-700">{tipo.taxaRef}</div>
                    <div className="text-[10px] text-gray-400">ao mês</div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {/* Conteúdo expandido */}
                {isOpen && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{tipo.descricao}</p>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Prazo</div>
                        <div className="text-sm font-bold text-gray-800">{tipo.prazoMin} – {tipo.prazoMax}</div>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3">
                        <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Taxa referência</div>
                        <div className="text-sm font-bold text-green-700">{tipo.taxaRef}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Para que serve</div>
                      <div className="flex flex-wrap gap-1.5">
                        {tipo.finalidade.map(f => (
                          <span key={f} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-lg">{f}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Instituições parceiras</div>
                      <div className="flex flex-wrap gap-1.5">
                        {tipo.fontes.map(f => (
                          <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">{f}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Requisitos principais</div>
                      <ul className="space-y-1">
                        {tipo.requisitos.map(r => (
                          <li key={r} className="flex items-center gap-2 text-xs text-gray-600">
                            <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-1">
                      <div className="flex items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-3">
                        <div className="text-xs text-emerald-700">
                          Score mínimo necessário: <strong>{tipo.scoreMin === 0 ? 'Qualquer score' : `${tipo.scoreMin} pts`}</strong>
                        </div>
                        <a href={`${AGRORATE_URL}/dashboard`} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] font-bold text-emerald-700 underline whitespace-nowrap">Ver meu score →</a>
                      </div>
                      <a href={`${AGRORATE_URL}/dashboard/credito`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition text-sm">
                        Simular {tipo.nome} no AgroRate
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
          <span className="text-xl flex-shrink-0">ℹ️</span>
          <div>
            <div className="font-semibold text-blue-800 text-sm mb-1">Como funciona</div>
            <p className="text-xs text-blue-700 leading-relaxed">
              As taxas são referências do Plano Safra 2025/26. Valores finais dependem do seu perfil, garantias e instituição escolhida. O AgroRate calcula seu score com base nos dados reais da sua fazenda no AgroOS e conecta você aos parceiros.
            </p>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  )
}
