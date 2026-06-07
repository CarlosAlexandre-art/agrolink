'use client'

interface Props {
  verificado: boolean
  tipo?: 'PRODUTOR' | 'PRESTADOR'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  cpfVerificado?: boolean
  docVerificado?: boolean
  telefoneVerificado?: boolean
}

export default function SeloVerificado({
  verificado,
  tipo = 'PRESTADOR',
  size = 'md',
  showLabel = true,
  cpfVerificado,
  docVerificado,
  telefoneVerificado,
}: Props) {
  if (!verificado) return null

  const label = tipo === 'PRODUTOR' ? 'Produtor Verificado' : 'Prestador Verificado'

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }

  const iconSize = { sm: 10, md: 12, lg: 14 }

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full bg-green-50 text-green-700 border border-green-200 ${sizeClasses[size]}`}
      title={`${label}${cpfVerificado ? ' · CPF validado' : ''}${docVerificado ? ' · Documento validado' : ''}${telefoneVerificado ? ' · Telefone validado' : ''}`}
    >
      <svg width={iconSize[size]} height={iconSize[size]} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="8" fill="#15803d" />
        <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {showLabel && label}
    </span>
  )
}
