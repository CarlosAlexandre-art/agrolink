'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import AgrobotChat from '@/components/AgrobotChat'

const FAQ = [
  {
    pergunta: 'O pagamento é seguro?',
    resposta: 'Sim. O dinheiro fica retido em custódia (escrow) e só é liberado ao prestador após você confirmar que o serviço foi concluído. Se o serviço não for realizado, você recebe o reembolso total.',
  },
  {
    pergunta: 'Quando o prestador recebe o pagamento?',
    resposta: 'O prestador recebe automaticamente após a conclusão do serviço, em até 2 dias úteis diretamente na conta bancária cadastrada.',
  },
  {
    pergunta: 'Preciso ter conta em banco para usar?',
    resposta: 'Para contratar serviços, não precisa de conta bancária — basta um cartão de crédito ou débito. Para receber pagamentos como prestador, é necessário cadastrar uma conta bancária uma única vez.',
  },
  {
    pergunta: 'O prestador precisa criar conta no Stripe ou outro app?',
    resposta: 'Não. Todo o processo de cadastro bancário é feito dentro do próprio AgroCore, em uma tela segura. O prestador não precisa baixar nenhum aplicativo extra.',
  },
  {
    pergunta: 'E se o prestador não aparecer para fazer o serviço?',
    resposta: 'Você pode abrir uma disputa pelo app. Nossa equipe analisa em até 48h e, se confirmado que o serviço não foi realizado, o valor é reembolsado integralmente.',
  },
  {
    pergunta: 'Posso combinar o pagamento diretamente com o prestador?',
    resposta: 'Não recomendamos. Pagamentos fora da plataforma não têm nenhuma proteção. Se algo der errado, não podemos intervir. Sempre pague pelo AgroCore para ter garantia.',
  },
  {
    pergunta: 'Meus dados pessoais e bancários estão seguros?',
    resposta: 'Sim. Seus dados bancários nunca ficam armazenados no AgroCore — são processados diretamente pelo sistema de pagamentos certificado. Seus dados pessoais são criptografados e nunca compartilhados com terceiros.',
  },
  {
    pergunta: 'Como funciona a avaliação?',
    resposta: 'Após a conclusão do serviço, o produtor avalia o prestador com 1 a 5 estrelas. A média das avaliações fica visível no perfil público do prestador, ajudando outros produtores a escolher com confiança.',
  },
]

const TEMAS = [
  { value: 'auto', label: '🌗 Automático', desc: 'Segue o sistema' },
  { value: 'claro', label: '☀️ Claro', desc: 'Fundo branco' },
  { value: 'escuro', label: '🌙 Escuro', desc: 'Fundo escuro' },
] as const

interface Prefs {
  textoGrande: boolean
  altoContraste: boolean
  reduzirAnimacoes: boolean
}

const PREFS_KEY = 'agrocore_acessibilidade'
const AGROBOT_KEY = 'agrobot_visivel'

function aplicarPrefs(prefs: Prefs) {
  const html = document.documentElement
  html.classList.toggle('acesso-texto-grande', prefs.textoGrande)
  html.classList.toggle('acesso-alto-contraste', prefs.altoContraste)
  html.classList.toggle('acesso-reduzir-animacoes', prefs.reduzirAnimacoes)
}

function FaqItem({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const [aberto, setAberto] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-gray-50 transition"
      >
        <span className="font-medium text-gray-800 text-sm">{pergunta}</span>
        <span className={`text-gray-400 flex-shrink-0 transition-transform ${aberto ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {aberto && (
        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{resposta}</div>
      )}
    </div>
  )
}

function ToggleSwitch({ label, descricao, ativo, onChange }: {
  label: string; descricao: string; ativo: boolean; onChange: () => void
}) {
  return (
    <button onClick={onChange} className="w-full flex items-center justify-between gap-3 text-left py-1" role="switch" aria-checked={ativo}>
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        <div className="text-xs text-gray-500">{descricao}</div>
      </div>
      <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 flex items-center px-0.5 ${ativo ? 'bg-green-600' : 'bg-gray-300'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${ativo ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </button>
  )
}

export default function AjudaInterativo() {
  const router = useRouter()
  const { tema, setTema } = useTheme()
  const [agrobotSumido, setAgrobotSumido] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>({ textoGrande: false, altoContraste: false, reduzirAnimacoes: false })

  useEffect(() => {
    setAgrobotSumido(localStorage.getItem(AGROBOT_KEY) === 'false')
    try {
      const salvo = localStorage.getItem(PREFS_KEY)
      if (salvo) {
        const p = JSON.parse(salvo) as Prefs
        setPrefs(p)
        aplicarPrefs(p)
      }
    } catch {}
  }, [])

  function togglePref(key: keyof Prefs) {
    const novas = { ...prefs, [key]: !prefs[key] }
    setPrefs(novas)
    aplicarPrefs(novas)
    localStorage.setItem(PREFS_KEY, JSON.stringify(novas))
  }

  function reativarAgroBot() {
    localStorage.setItem(AGROBOT_KEY, 'true')
    setAgrobotSumido(false)
    window.location.reload()
  }

  function refazerTour() {
    localStorage.removeItem('tour_v3_PRODUTOR')
    localStorage.removeItem('tour_v3_PRESTADOR')
    router.push('/dashboard')
  }

  return (
    <>
      {agrobotSumido && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <div className="flex-1">
              <div className="font-bold text-green-700">AgroBot desativado</div>
              <div className="text-sm text-green-600">Reative o assistente virtual quando quiser</div>
            </div>
            <button onClick={reativarAgroBot} className="px-4 py-2 bg-green-700 text-white text-sm font-bold rounded-xl hover:bg-green-800 transition flex-shrink-0">
              Reativar
            </button>
          </div>
        </div>
      )}

      {/* Tema */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg">🎨 Tema</h2>
          <p className="text-sm text-gray-500 mt-1">Escolha a aparência do app</p>
        </div>
        <div className="p-5 grid grid-cols-3 gap-3">
          {TEMAS.map(t => (
            <button
              key={t.value}
              onClick={() => setTema(t.value)}
              className={`py-3 px-2 rounded-xl border-2 text-center transition ${
                tema === t.value ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="font-bold text-sm">{t.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Acessibilidade */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg">♿ Acessibilidade</h2>
          <p className="text-sm text-gray-500 mt-1">Ajuste o app conforme sua necessidade</p>
        </div>
        <div className="p-5 space-y-4">
          <ToggleSwitch label="Texto maior" descricao="Aumenta o tamanho de todas as letras do app" ativo={prefs.textoGrande} onChange={() => togglePref('textoGrande')} />
          <div className="border-t border-gray-100" />
          <ToggleSwitch label="Alto contraste" descricao="Melhora a visibilidade das cores na tela" ativo={prefs.altoContraste} onChange={() => togglePref('altoContraste')} />
          <div className="border-t border-gray-100" />
          <ToggleSwitch label="Reduzir animações" descricao="Remove movimentos e transições (indicado para epilepsia ou enjoo)" ativo={prefs.reduzirAnimacoes} onChange={() => togglePref('reduzirAnimacoes')} />
          <p className="text-xs text-gray-400 pt-1">Preferências salvas automaticamente neste dispositivo.</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg">❓ Perguntas Frequentes</h2>
        </div>
        {FAQ.map((item, i) => (
          <FaqItem key={i} pergunta={item.pergunta} resposta={item.resposta} />
        ))}
      </div>

      {/* AgroBot IA */}
      <AgrobotChat />

      {/* Tour */}
      <button onClick={refazerTour} className="w-full py-4 border-2 border-green-700 text-green-700 text-center font-bold rounded-2xl hover:bg-green-50 transition">
        🎯 Refazer o tour da plataforma
      </button>
    </>
  )
}
