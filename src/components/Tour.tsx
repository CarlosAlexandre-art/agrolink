'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type TourStep = {
  pagina: string
  titulo: string
  texto: string
  alvo?: string // CSS selector opcional para destacar elemento
}

const TOUR_PRODUTOR: TourStep[] = [
  {
    pagina: '/dashboard',
    titulo: '🌿 Bem-vindo ao AgroLink!',
    texto: 'Esta é sua tela principal. Aqui você acompanha tudo que está acontecendo na sua propriedade.',
    alvo: '[data-tour="solicitar"]',
  },
  {
    pagina: '/dashboard',
    titulo: '🌾 Solicitar Serviço',
    texto: 'Clique no botão verde para solicitar qualquer serviço rural. Em menos de 1 minuto um prestador próximo de você será notificado.',
    alvo: '[data-tour="solicitar"]',
  },
  {
    pagina: '/dashboard',
    titulo: '📊 Acompanhe em tempo real',
    texto: 'Seus serviços em andamento aparecem aqui. Clique em qualquer um para ver o status ao vivo, dados do prestador e acionar o WhatsApp.',
    alvo: '[data-tour="status"]',
  },
  {
    pagina: '/solicitar',
    titulo: '🔧 Escolha o serviço',
    texto: 'Temos 18 tipos de serviço disponíveis: pulverização, colheita, transporte, tratoração, drones e muito mais. Selecione o que precisa.',
  },
  {
    pagina: '/solicitar',
    titulo: '📍 Informe a localização',
    texto: 'Digite o endereço ou nome da sua fazenda. Usamos isso para encontrar prestadores próximos de você.',
  },
  {
    pagina: '/historico',
    titulo: '📋 Histórico completo',
    texto: 'Aqui ficam todos os serviços já realizados. Você pode ver datas, valores pagos e reabrir qualquer serviço para ver os detalhes.',
    alvo: '[data-tour="nav-historico"]',
  },
  {
    pagina: '/perfil',
    titulo: '👤 Seu Perfil',
    texto: 'Mantenha seus dados sempre atualizados. Nome da fazenda, telefone e localização ajudam os prestadores a chegarem até você mais rápido.',
  },
  {
    pagina: '/ajuda',
    titulo: '❓ Central de Ajuda',
    texto: 'Sempre que tiver dúvidas, acesse aqui. Tem FAQ, diretrizes, regras de pagamento e botão direto para o nosso suporte por WhatsApp.',
  },
]

const TOUR_PRESTADOR: TourStep[] = [
  {
    pagina: '/dashboard',
    titulo: '🌿 Bem-vindo ao AgroLink!',
    texto: 'Esta é sua tela principal. Aqui você recebe chamados, acompanha serviços e controla sua disponibilidade.',
    alvo: '[data-tour="disponivel"]',
  },
  {
    pagina: '/dashboard',
    titulo: '🟢 Ativar disponibilidade',
    texto: 'Mantenha esse botão ATIVO sempre que quiser receber chamados. Quando não puder trabalhar, desative. Só recebe pedidos quando estiver disponível.',
    alvo: '[data-tour="disponivel"]',
  },
  {
    pagina: '/dashboard',
    titulo: '🔔 Chamados de serviço',
    texto: 'Os pedidos de produtores próximos aparecem aqui. Você tem alguns minutos para aceitar ou recusar. Aceite e garanta o serviço!',
    alvo: '[data-tour="chamados"]',
  },
  {
    pagina: '/historico',
    titulo: '📋 Histórico de serviços',
    texto: 'Aqui você vê todos os serviços realizados, datas e valores recebidos.',
  },
  {
    pagina: '/ganhos',
    titulo: '💰 Seus Ganhos',
    texto: 'Acompanhe seu faturamento mensal, total acumulado e status de cada pagamento. O dinheiro cai automático na sua conta após concluir o serviço.',
    alvo: '[data-tour="nav-ganhos"]',
  },
  {
    pagina: '/perfil',
    titulo: '🏦 Conectar conta bancária',
    texto: 'Para receber pagamentos automáticos, conecte sua conta bancária uma única vez. É seguro e leva menos de 5 minutos.',
  },
  {
    pagina: '/perfil',
    titulo: '⭐ Sua reputação',
    texto: 'Sua avaliação e número de serviços ficam visíveis aqui. Quanto melhor sua nota, mais chamados você recebe. Capriche no serviço!',
  },
  {
    pagina: '/ajuda',
    titulo: '❓ Central de Ajuda',
    texto: 'Dúvidas sobre pagamento, regras ou como funciona? Tudo está aqui. Tem também o contato direto com o suporte via WhatsApp.',
  },
]

const TOUR_KEY = 'tour_v2'

export function iniciarTour(tipo: 'PRODUTOR' | 'PRESTADOR') {
  localStorage.setItem(`${TOUR_KEY}_${tipo}`, 'ativo')
  localStorage.setItem(`${TOUR_KEY}_${tipo}_step`, '0')
}

export default function Tour({ tipo }: { tipo: 'PRODUTOR' | 'PRESTADOR' }) {
  const router = useRouter()
  const pathname = usePathname()
  const [step, setStep] = useState(0)
  const [ativo, setAtivo] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number; width: number; height: number } | null>(null)

  const steps = tipo === 'PRODUTOR' ? TOUR_PRODUTOR : TOUR_PRESTADOR
  const atual = steps[step]
  const naTelaCorreta = pathname === atual?.pagina

  useEffect(() => {
    const tourStatus = localStorage.getItem(`${TOUR_KEY}_${tipo}`)
    const savedStep = parseInt(localStorage.getItem(`${TOUR_KEY}_${tipo}_step`) || '0')

    if (tourStatus === 'ativo') {
      setAtivo(true)
      setStep(savedStep)
    } else if (!tourStatus) {
      // Primeira vez — inicia automaticamente
      setTimeout(() => {
        localStorage.setItem(`${TOUR_KEY}_${tipo}`, 'ativo')
        localStorage.setItem(`${TOUR_KEY}_${tipo}_step`, '0')
        setAtivo(true)
        setStep(0)
      }, 1200)
    }
  }, [tipo])

  // Destacar elemento alvo se existir
  useEffect(() => {
    if (!ativo || !naTelaCorreta || !atual?.alvo) {
      setPos(null)
      return
    }
    const tentarEncontrar = () => {
      const el = document.querySelector(atual.alvo!)
      if (el) {
        const rect = el.getBoundingClientRect()
        setPos({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        })
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    setTimeout(tentarEncontrar, 400)
  }, [ativo, naTelaCorreta, step, atual])

  // Navegar para a página correta quando o step mudar
  useEffect(() => {
    if (!ativo || !atual) return
    if (pathname !== atual.pagina) {
      router.push(atual.pagina)
    }
  }, [ativo, step, atual, pathname, router])

  function proximo() {
    if (step < steps.length - 1) {
      const novoStep = step + 1
      setStep(novoStep)
      localStorage.setItem(`${TOUR_KEY}_${tipo}_step`, String(novoStep))
      setPos(null)
    } else {
      encerrar()
    }
  }

  function voltar() {
    if (step > 0) {
      const novoStep = step - 1
      setStep(novoStep)
      localStorage.setItem(`${TOUR_KEY}_${tipo}_step`, String(novoStep))
      setPos(null)
    }
  }

  function encerrar() {
    localStorage.setItem(`${TOUR_KEY}_${tipo}`, 'done')
    localStorage.removeItem(`${TOUR_KEY}_${tipo}_step`)
    setAtivo(false)
    setPos(null)
    router.push('/dashboard')
  }

  if (!ativo || !naTelaCorreta) return null

  return (
    <>
      {/* Overlay escuro */}
      <div className="fixed inset-0 z-40 bg-black/50 pointer-events-none">
        {pos && (
          <div
            className="absolute rounded-xl ring-4 ring-green-400"
            style={{
              top: pos.top - 6,
              left: pos.left - 6,
              width: pos.width + 12,
              height: pos.height + 12,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              background: 'transparent',
            }}
          />
        )}
      </div>

      {/* Painel fixo na parte de baixo */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6">
        <div className="bg-white rounded-2xl shadow-2xl p-5 max-w-lg mx-auto">

          {/* Cabeçalho com step e título */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400 font-medium">
              {step + 1} de {steps.length}
            </span>
            <button
              onClick={encerrar}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
            >
              Pular tour ×
            </button>
          </div>

          <div className="font-bold text-gray-800 text-lg mb-1">{atual.titulo}</div>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{atual.texto}</p>

          {/* Barra de progresso */}
          <div className="flex gap-1 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-green-600' : 'bg-gray-200'}`}
              />
            ))}
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={voltar}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition text-sm"
              >
                ← Voltar
              </button>
            )}
            <button
              onClick={proximo}
              className="flex-1 py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition text-sm"
            >
              {step === steps.length - 1 ? '✓ Concluir tour' : 'Próximo →'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
