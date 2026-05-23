import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'AgroCore — Soluções Sustentáveis do Campo',
    short_name: 'AgroCore',
    description: 'O jeito mais rápido e seguro de contratar serviços rurais no Brasil',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#dad6ca',
    theme_color: '#104e27',
    orientation: 'portrait',
    categories: ['productivity', 'utilities'],
    lang: 'pt-BR',
    icons: [
      {
        src: '/pwa-icon-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-icon-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/pwa-icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Solicitar Serviço',
        url: '/solicitar',
        description: 'Solicitar um novo serviço rural',
      },
      {
        name: 'Meus Serviços',
        url: '/dashboard',
        description: 'Ver meus serviços',
      },
    ],
  }
}
