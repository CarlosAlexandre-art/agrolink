import Image from 'next/image'

interface Props {
  size?: number
  className?: string
  showText?: boolean
  textColor?: string
}

export default function AgroCoreLogo({ size = 32, className = '', showText = true, textColor = 'text-white' }: Props) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/icons/logo-mark.svg"
        alt="AgroCore"
        width={size}
        height={size}
        className="flex-shrink-0"
        priority
      />
      {showText && (
        <span className={`font-bold leading-tight ${textColor}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
          AgroCore
        </span>
      )}
    </div>
  )
}
