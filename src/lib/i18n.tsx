'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import pt from '@/messages/pt.json'
import en from '@/messages/en.json'
import es from '@/messages/es.json'

export type Locale = 'pt' | 'en' | 'es'

const messages = { pt, en, es }

type Messages = typeof pt

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? path
}

interface I18nContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType>({
  locale: 'pt',
  setLocale: () => {},
  t: (key) => key,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt')

  useEffect(() => {
    const saved = localStorage.getItem('agrocore_lang') as Locale | null
    if (saved && ['pt', 'en', 'es'].includes(saved)) {
      setLocaleState(saved)
    } else {
      // Auto-detect browser language
      const lang = navigator.language.toLowerCase()
      if (lang.startsWith('es')) setLocaleState('es')
      else if (lang.startsWith('en')) setLocaleState('en')
      else setLocaleState('pt')
    }
  }, [])

  function setLocale(l: Locale) {
    setLocaleState(l)
    localStorage.setItem('agrocore_lang', l)
  }

  function t(key: string): string {
    return getNestedValue(messages[locale], key) || getNestedValue(messages['pt'], key) || key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
