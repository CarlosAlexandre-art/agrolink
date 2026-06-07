'use client'

import { useState } from 'react'
import AgroCoreLogo from '@/components/AgroCoreLogo'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const SLIDES_PRODUTOR = [
  {
    icon: '🌾',
    titulo: 'Bem-vindo ao AgroCore!',
    texto: 'O jeito mais seguro de contratar serviços rurais no Brasil. Prestadores verificados, contratos digitais e suporte completo.',
  },
  {
    icon: '📋',
    titulo: 'Contrate em menos de 1 minuto',
    texto: 'Clique em "Contratar Serviço", escolha o tipo de serviço, informe sua localização e confirme. Prestadores próximos são notificados automaticamente.',
    dica: '💡 +18 tipos de serviço: pulverização, colheita, tratoração, drones e muito mais.',
  },
  {
    icon: '✅',
    titulo: 'Prestadores verificados',
    texto: 'Todos os prestadores têm histórico real na plataforma. Veja avaliações de outros produtores, serviços concluídos e região de atuação antes de contratar.',
    dica: '🛡️ Selos de verificação garantem que o prestador passou por validação de documentos.',
  },
  {
    icon: '📄',
    titulo: 'Contrato digital automático',
    texto: 'Ao aceitar uma proposta, o sistema gera um contrato digital automaticamente com todos os dados do serviço. Você recebe por e-mail e WhatsApp.',
    dica: '⚖️ O contrato tem validade jurídica conforme a Lei nº 14.063/2020.',
  },
  {
    icon: '💳',
    titulo: 'Pagamento protegido',
    texto: 'Você paga antes do serviço. O dinheiro fica em custódia segura e só é liberado ao prestador após a conclusão. Seu dinheiro nunca fica em risco.',
    dica: '🔒 Nunca pague fora da plataforma.',
  },
  {
    icon: '⭐',
    titulo: 'Avalie e construa histórico',
    texto: 'Após a conclusão, avalie o serviço. Seu ORYON ID registra toda sua trajetória na plataforma — serviços contratados, valor movimentado e reputação.',
    dica: '🚀 Quanto mais você usa, mais forte fica seu perfil na comunidade.',
  },
]

const SLIDES_PRESTADOR = [
  {
    icon: '🔧',
    titulo: 'Bem-vindo ao AgroCore!',
    texto: 'Aqui você recebe chamados de produtores rurais que precisam dos seus serviços — sem precisar prospectar ou depender de indicações.',
  },
  {
    icon: '🟢',
    titulo: 'Fique disponível para receber chamados',
    texto: 'No seu painel, mantenha o status "Disponível" ativado. Quando um produtor solicitar um serviço da sua área, você é notificado na hora.',
    dica: '📍 Mantenha sua localização e raio de atendimento atualizados no perfil.',
  },
  {
    icon: '📄',
    titulo: 'Contrato digital automático',
    texto: 'Quando o produtor aceitar sua proposta, o sistema gera um contrato digital com todos os dados. Você recebe uma cópia por e-mail e WhatsApp.',
    dica: '⚖️ Proteção jurídica automática em cada serviço.',
  },
  {
    icon: '✅',
    titulo: 'Execute e atualize o status',
    texto: 'Atualize o status conforme avança: "A caminho" → "Executando" → "Concluído". O produtor acompanha em tempo real e fica tranquilo.',
    dica: '📸 Envie foto de comprovação ao concluir — aumenta sua credibilidade.',
  },
  {
    icon: '🏆',
    titulo: 'Construa seu ORYON ID',
    texto: 'Cada serviço concluído fortalece seu histórico operacional — avaliação, pontualidade e valor movimentado. Isso aumenta sua visibilidade para novos clientes.',
    dica: '⭐ Prestadores com mais histórico aparecem primeiro nas buscas.',
  },
  {
    icon: '💰',
    titulo: 'Receba com segurança',
    texto: 'O pagamento é garantido e liberado automaticamente após a conclusão. AgroCore retém apenas 5% de comissão para manutenção da plataforma.',
    dica: '🎯 Sem inadimplência. Sem atraso. Sem risco.',
  },
]

function BemVindoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipo = searchParams.get('tipo') as 'PRODUTOR' | 'PRESTADOR' || 'PRODUTOR'
  const [slide, setSlide] = useState(0)

  const slides = tipo === 'PRODUTOR' ? SLIDES_PRODUTOR : SLIDES_PRESTADOR
  const atual = slides[slide]
  const isUltimo = slide === slides.length - 1

  function proximo() {
    if (isUltimo) {
      router.push('/dashboard')
    } else {
      setSlide(s => s + 1)
    }
  }

  return (
    <div className="min-h-screen bg-green-700 flex flex-col items-center justify-between px-6 py-12">

      {/* Logo */}
      <div className="text-white text-center">
        <AgroCoreLogo size={32} />
      </div>

      {/* Slide */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm w-full">
        <div className="text-8xl mb-8">{atual.icon}</div>
        <h2 className="text-2xl font-bold text-white mb-4">{atual.titulo}</h2>
        <p className="text-green-100 text-lg leading-relaxed mb-5">{atual.texto}</p>
        {(atual as any).dica && (
          <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm text-green-100 text-left w-full">
            {(atual as any).dica}
          </div>
        )}
      </div>

      {/* Dots */}
      <div className="flex gap-2 mb-8">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === slide ? 'bg-white w-6' : 'bg-green-400'}`}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={proximo}
          className="w-full py-4 bg-white text-green-700 font-bold text-lg rounded-2xl hover:bg-green-50 active:scale-95 transition shadow-lg"
        >
          {isUltimo ? '🚀 Começar a usar' : 'Próximo →'}
        </button>
        {!isUltimo && (
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 text-green-200 text-sm"
          >
            Pular introdução
          </button>
        )}
      </div>
    </div>
  )
}

export default function BemVindoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-green-700 flex items-center justify-center"><AgroCoreLogo size={28} showText={false} /></div>}>
      <BemVindoContent />
    </Suspense>
  )
}
