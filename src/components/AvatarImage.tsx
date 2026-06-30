'use client'

import { useState } from 'react'

interface Props {
  src: string
  nome: string
  size?: 'md' | 'lg'
}

export default function AvatarImage({ src, nome, size = 'md' }: Props) {
  const [failed, setFailed] = useState(false)

  const dim = size === 'lg' ? 'w-24 h-24 text-4xl' : 'w-20 h-20 text-3xl'

  if (failed) {
    return (
      <div className={`${dim} bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700 mx-auto border-4 border-green-100`}>
        {nome[0]?.toUpperCase() || '?'}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt="Foto de perfil"
      className={`${dim} rounded-full object-cover mx-auto border-4 border-green-100`}
      onError={() => setFailed(true)}
    />
  )
}
