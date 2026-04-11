import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AgroBot from '@/components/AgroBot'
import ThemeProvider from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AgroCore — Serviços Rurais',
  description: 'O jeito mais rápido e seguro de contratar serviços rurais no Brasil',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AgroCore',
  },
}

export const viewport: Viewport = {
  themeColor: '#15803d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* Anti-FOUC: aplica tema antes do React hidratar */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('agrocore_tema')||'auto';var d=t==='escuro'||(t==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');})()`
        }} />
      </head>
      <body className={`${inter.className} min-h-full bg-gray-50 dark:bg-slate-900`}>
        <ThemeProvider>
          {children}
          <AgroBot />
        </ThemeProvider>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `
        }} />
      </body>
    </html>
  )
}
