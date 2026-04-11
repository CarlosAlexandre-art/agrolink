'use client'

import dynamic from 'next/dynamic'

const MapaServico = dynamic(() => import('./MapaServico'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 flex items-center justify-center" style={{ height: 260 }}>
      <span className="text-gray-400 text-sm">Carregando mapa...</span>
    </div>
  ),
})

export default MapaServico
