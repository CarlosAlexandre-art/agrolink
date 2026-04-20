'use client'

import { useState } from 'react'
import AgroCoreLogo from '@/components/AgroCoreLogo'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const SLIDES_PRODUTOR = [
  {
    icon: '🌾',
    titulo: 'Bem-vindo ao AgroCore!',
    texto: 'Aqui você encontra prestadores de serviço rurais confiáveis, perto de você, de forma rápida e segura.',
  },
  {
    icon: '📋',
    titulo: 'Como solicitar um serviço',
    texto: 'Clique em "Solicitar Serviço", escolha o tipo de serviço que precisa, informe sua localização e confirme. Leva menos de 1 minuto.',
  },
  {
    icon: '🤝',
    titulo: 'Receba propostas',
    texto: 'O sistema encontra automaticamente prestadores disponíveis próximos a você. Você verá o prestador alocado em instantes.',
  },
  {
    icon: '💳',
    titulo: 'Pagamento seguro',
    texto: 'Você paga antes do serviço. O dinheiro fica retido e só é liberado ao prestador após a conclusão. Sem risco.',
  },
  {
    icon: '⭐',
    titulo: 'Avalie o serviço',
    texto: 'Após a conclusão, avalie o prestador. Isso ajuda a manter a qualidade da plataforma para todos.',
  },
]

const SLIDES_PRESTADOR = [
  {
    icon: '🔧',
    titulo: 'Bem-vindo ao AgroCore!',
    texto: 'Aqui você recebe chamados de produtores rurais que precisam dos seus serviços, direto no seu celular.',
  },
  {
    icon: '🟢',
    titulo: 'Fique disponível',
    texto: 'No seu painel, mantenha o status "Disponível" ativado para receber chamados. Você pode desativar quando quiser.',
  },
  {
    icon: '🔔',
    titulo: 'Receba chamados',
    texto: 'Quando um produtor solicitar um serviço que você oferece, você recebe uma notificação. Aceite ou recuse — a escolha é sua.',
  },
  {
    icon: '✅',
    titulo: 'Execute e conclua',
    texto: 'Após aceitar, atualize o status do serviço: "A caminho" → "Executando" → "Concluído". O produtor acompanha tudo em tempo real.',
  },
  {
    icon: '💰',
    titulo: 'Receba seu pagamento',
    texto: 'O pagamento é garantido. Após concluir o serviço, o valor é liberado para você automaticamente. AgroCore retém apenas 5% de comissão para manutenção e segurança da plataforma.',
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
        <p className="text-green-100 text-lg leading-relaxed">{atual.texto}</p>
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
