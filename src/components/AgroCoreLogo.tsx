import Image from 'next/image'

interface Props {
  size?: number
  className?: string
  showText?: boolean
  showSubtitle?: boolean
  textColor?: string
  subtitleColor?: string
}

export default function AgroCoreLogo({
  size = 32,
  className = '',
  showText = true,
  showSubtitle = false,
  textColor = 'text-white',
  subtitleColor = 'text-green-400',
}: Props) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/icons/logo-mark.svg"
        alt="AgroCore"
        width={size}
        height={size}
        className="flex-shrink-0"
        priority
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight ${textColor}`} style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
            AgroCore
          </span>
          {showSubtitle && (
            <span className={`text-[10px] font-medium mt-0.5 ${subtitleColor}`} style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em' }}>
              Soluções Sustentáveis do Campo
            </span>
          )}
        </div>
      )}
    </div>
  )
}
