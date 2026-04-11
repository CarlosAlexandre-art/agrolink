'use client'

import { useState, useEffect } from 'react'

type TourStep = {
  icone: string
  titulo: string
  texto: string
  dica?: string
}

const TOUR_PRODUTOR: TourStep[] = [
  {
    icone: '🌿',
    titulo: 'Bem-vindo ao AgroCore!',
    texto: 'O jeito mais rápido e seguro de contratar serviços rurais no Brasil. Vamos te mostrar como funciona em menos de 1 minuto.',
  },
  {
    icone: '🌾',
    titulo: 'Solicite um serviço',
    texto: 'Clique em "Solicitar Serviço" no topo da tela. Escolha o tipo de serviço, informe a localização da sua fazenda e confirme. Em segundos, prestadores próximos são notificados.',
    dica: '💡 Temos 18 tipos: pulverização, colheita, tratoração, drones e muito mais.',
  },
  {
    icone: '🤝',
    titulo: 'Prestador encontrado',
    texto: 'Quando um prestador aceitar, você recebe uma notificação. Aí é só confirmar o pagamento — o valor fica em custódia segura e só é liberado quando o serviço estiver concluído.',
    dica: '🔒 Seu dinheiro está protegido. Nunca pague fora da plataforma.',
  },
  {
    icone: '💳',
    titulo: 'Pagamento garantido',
    texto: 'O AgroCore retém apenas 5% de taxa para manutenção e segurança. O restante vai direto para o prestador após você confirmar a conclusão do serviço.',
    dica: '⭐ Ao final, avalie o prestador — isso ajuda a comunidade.',
  },
  {
    icone: '📋',
    titulo: 'Histórico e perfil',
    texto: 'Em "Histórico" você vê todos os serviços realizados. Em "Perfil" você mantém seus dados atualizados. Em "Central de Ajuda" você tira qualquer dúvida.',
    dica: '📱 Adicione o AgroCore na tela inicial do seu celular para acesso rápido.',
  },
]

const TOUR_PRESTADOR: TourStep[] = [
  {
    icone: '🌿',
    titulo: 'Bem-vindo ao AgroCore!',
    texto: 'Aqui você recebe chamados de produtores próximos, gerencia seus serviços e recebe pagamentos automáticos. Veja como funciona:',
  },
  {
    icone: '🟢',
    titulo: 'Ative sua disponibilidade',
    texto: 'O botão "Disponível" no topo do painel controla se você quer receber chamados. Deixe ativo quando puder trabalhar e desative quando não quiser ser incomodado.',
    dica: '💡 Sem esse botão ativo, você não aparece para os produtores.',
  },
  {
    icone: '🔔',
    titulo: 'Receba e aceite chamados',
    texto: 'Quando um produtor próximo solicitar um serviço do seu tipo, você recebe uma notificação. Você tem alguns minutos para aceitar ou recusar. Aceite e garanta o trabalho!',
    dica: '📍 Fique com sua localização atualizada no perfil para receber chamados próximos.',
  },
  {
    icone: '⚙️',
    titulo: 'Execute e atualize o status',
    texto: 'Ao chegar na propriedade, atualize o status: "A caminho" → "Executando" → "Concluído". Isso mantém o produtor informado e libera seu pagamento automaticamente.',
    dica: '📷 Tire fotos antes e depois do serviço como comprovante.',
  },
  {
    icone: '💰',
    titulo: 'Receba automático',
    texto: 'Ao concluir o serviço, você recebe 95% do valor direto na conta bancária cadastrada em até 2 dias úteis — sem precisar solicitar nada.',
    dica: '🏦 Conecte sua conta bancária no Perfil para receber os pagamentos.',
  },
  {
    icone: '⭐',
    titulo: 'Construa sua reputação',
    texto: 'Cada serviço bem feito gera avaliações. Quanto melhor sua nota, mais chamados você aparece nos resultados. Em "Ganhos" você acompanha tudo que já recebeu.',
    dica: '🏆 Os melhores prestadores aparecem primeiro para os produtores.',
  },
]

const TOUR_KEY = 'tour_v3'

export default function Tour({ tipo }: { tipo: 'PRODUTOR' | 'PRESTADOR' }) {
  const [ativo, setAtivo] = useState(false)
  const [step, setStep] = useState(0)

  const steps = tipo === 'PRODUTOR' ? TOUR_PRODUTOR : TOUR_PRESTADOR
  const atual = steps[step]

  useEffect(() => {
    const status = localStorage.getItem(`${TOUR_KEY}_${tipo}`)
    if (!status) {
      setTimeout(() => setAtivo(true), 1000)
    }
  }, [tipo])

  function proximo() {
    if (step < steps.length - 1) {
      setStep(s => s + 1)
    } else {
      encerrar()
    }
  }

  function voltar() {
    if (step > 0) setStep(s => s - 1)
  }

  function encerrar() {
    localStorage.setItem(`${TOUR_KEY}_${tipo}`, 'done')
    setAtivo(false)
  }

  if (!ativo) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center px-4 pb-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Barra de progresso */}
        <div className="flex h-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 transition-all ${i <= step ? 'bg-green-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <div className="p-6">
          {/* Ícone e step */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-5xl">{atual.icone}</span>
            <span className="text-xs text-gray-400 font-medium">{step + 1} / {steps.length}</span>
          </div>

          {/* Conteúdo */}
          <h2 className="font-bold text-gray-800 text-xl mb-2">{atual.titulo}</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">{atual.texto}</p>

          {atual.dica && (
            <div className="bg-green-50 rounded-xl px-4 py-3 text-sm text-green-700">
              {atual.dica}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 mt-5">
            {step > 0 ? (
              <button
                onClick={voltar}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition text-sm"
              >
                ← Voltar
              </button>
            ) : (
              <button
                onClick={encerrar}
                className="flex-1 py-3 text-gray-400 text-sm hover:text-gray-600 transition"
              >
                Pular
              </button>
            )}
            <button
              onClick={proximo}
              className="flex-1 py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition text-sm"
            >
              {step === steps.length - 1 ? '✓ Entendido!' : 'Próximo →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
