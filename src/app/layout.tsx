import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import AgroBot from '@/components/AgroBot'
import CookieBanner from '@/components/CookieBanner'
import InstalarApp from '@/components/InstalarApp'
import ThemeProvider from '@/components/ThemeProvider'
import { I18nProvider } from '@/lib/i18n'
import SplashScreen from '@/components/SplashScreen'

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })

export const metadata: Metadata = {
  title: 'AgroCore — Soluções Sustentáveis do Campo',
  description: 'O jeito mais rápido e seguro de contratar serviços rurais no Brasil.',
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/pwa-icon-192', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/pwa-icon-192',
    shortcut: '/icons/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AgroCore',
  },
}

export const viewport: Viewport = {
  themeColor: '#104e27',
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
    <html lang="pt-BR" className={`h-full ${montserrat.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/pwa-icon-192" />
        {/* Anti-FOUC: aplica tema antes do React hidratar */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('agrocore_tema')||'auto';var d=t==='escuro'||(t==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');})()`
        }} />
        {/* Anti-flash: esconde conteúdo até splash terminar ou usuário já ter visto */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){if(!localStorage.getItem('agc_splash_shown')){document.documentElement.style.background='#000';var s=document.createElement('style');s.id='agc-hide';s.textContent='body>*:not(#agc-splash){visibility:hidden!important}';document.head.appendChild(s);}})()`
        }} />
        {/* Captura beforeinstallprompt ANTES do React hidratar para evitar race condition */}
        <script dangerouslySetInnerHTML={{
          __html: `window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__bip=e;});`
        }} />
      </head>
      <body className="font-sans min-h-full bg-gray-50 dark:bg-slate-900">
        <SplashScreen />
        <I18nProvider>
          <ThemeProvider>
            {children}
            <AgroBot />
            <InstalarApp />
            <CookieBanner />
          </ThemeProvider>
        </I18nProvider>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
              });
            }
          `
        }} />
      </body>
    </html>
  )
}
