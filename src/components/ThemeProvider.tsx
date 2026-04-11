'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Tema = 'auto' | 'claro' | 'escuro'
const TEMA_KEY = 'agrocore_tema'

interface ThemeCtx {
  tema: Tema
  setTema: (t: Tema) => void
}

const Ctx = createContext<ThemeCtx>({ tema: 'auto', setTema: () => {} })

export function useTheme() {
  return useContext(Ctx)
}

function aplicarTema(tema: Tema) {
  const prefereDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const deveEscuro = tema === 'escuro' || (tema === 'auto' && prefereDark)
  document.documentElement.classList.toggle('dark', deveEscuro)
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTemaState] = useState<Tema>('auto')

  useEffect(() => {
    const salvo = (localStorage.getItem(TEMA_KEY) as Tema) || 'auto'
    setTemaState(salvo)
    aplicarTema(salvo)

    // Ouvir mudanças de sistema quando em modo auto
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const atual = (localStorage.getItem(TEMA_KEY) as Tema) || 'auto'
      if (atual === 'auto') aplicarTema('auto')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setTema = useCallback((t: Tema) => {
    setTemaState(t)
    localStorage.setItem(TEMA_KEY, t)
    aplicarTema(t)
  }, [])

  return <Ctx.Provider value={{ tema, setTema }}>{children}</Ctx.Provider>
}
