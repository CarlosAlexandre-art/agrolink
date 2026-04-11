'use client'

import { useState } from 'react'
import { useI18n, type Locale } from '@/lib/i18n'

const LANGS: { code: Locale; flag: string; label: string }[] = [
  { code: 'pt', flag: '🇧🇷', label: 'PT' },
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
]

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)

  const current = LANGS.find(l => l.code === locale) ?? LANGS[0]

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border border-white/30 hover:bg-white/10 transition"
        aria-label="Idioma"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <span className="text-xs opacity-70">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden min-w-[110px]">
            {LANGS.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLocale(lang.code); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-green-50 transition ${
                  locale === lang.code ? 'text-green-700 bg-green-50' : 'text-gray-700'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {locale === lang.code && <span className="ml-auto text-green-600">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
