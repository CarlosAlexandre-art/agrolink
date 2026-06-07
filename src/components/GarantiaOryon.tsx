interface Props {
  variant?: 'banner' | 'card' | 'inline'
}

const SELOS = [
  { icon: '✅', label: 'Prestadores verificados', desc: 'Documentação e histórico validados' },
  { icon: '📄', label: 'Contrato digital', desc: 'Proteção jurídica em cada serviço' },
  { icon: '🔒', label: 'Pagamento seguro', desc: 'Dinheiro retido até a conclusão' },
  { icon: '⭐', label: 'Histórico validado', desc: 'Avaliações reais de produtores' },
  { icon: '⚖️', label: 'Sistema de disputas', desc: 'Equipe analisa em até 5 dias úteis' },
  { icon: '🛡️', label: 'ORYON ID', desc: 'Reputação rastreável e transparente' },
]

export default function GarantiaOryon({ variant = 'card' }: Props) {
  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {SELOS.slice(0, 4).map(s => (
          <span key={s.label} className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1 font-medium">
            <span>{s.icon}</span>
            {s.label}
          </span>
        ))}
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div className="bg-green-800 text-white rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🛡️</span>
          <div>
            <div className="font-black text-lg">Garantia ORYON</div>
            <div className="text-green-300 text-sm">Sua operação protegida do início ao fim</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SELOS.map(s => (
            <div key={s.label} className="flex items-start gap-2">
              <span className="text-base flex-shrink-0 mt-0.5">{s.icon}</span>
              <div>
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="text-xs text-green-300">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // card (default)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-green-800 to-green-600 px-5 py-4 flex items-center gap-3">
        <span className="text-3xl">🛡️</span>
        <div>
          <div className="text-white font-black text-base">Garantia ORYON</div>
          <div className="text-green-200 text-xs">Sua operação protegida do início ao fim</div>
        </div>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-700">
        {SELOS.map(s => (
          <div key={s.label} className="flex items-center gap-3 px-5 py-3">
            <span className="text-xl flex-shrink-0">{s.icon}</span>
            <div>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{s.label}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
