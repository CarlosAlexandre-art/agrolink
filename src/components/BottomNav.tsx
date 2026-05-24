'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BottomNavProps {
  tipo: 'PRODUTOR' | 'PRESTADOR'
  badgeCount?: number
}

function NavItem({ href, label, children, badge, 'data-tour': dataTour }: {
  href: string
  label: string
  children: React.ReactNode
  badge?: number
  'data-tour'?: string
}) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link
      href={href}
      data-tour={dataTour}
      className={`flex-1 flex flex-col items-center pt-2 pb-3 gap-1 relative text-xs font-medium transition-colors ${active ? 'text-green-600' : 'text-gray-400'}`}
    >
      {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-green-600 rounded-b" />}
      <div className="relative">
        {children}
        {badge != null && badge > 0 && (
          <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold leading-none px-0.5 border-2 border-white">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span>{label}</span>
    </Link>
  )
}

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/>
  </svg>
)

const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="9" width="18" height="11" rx="2"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/><path d="M12 4v3"/>
    <line x1="9" y1="14" x2="9.01" y2="14" strokeWidth="2.5"/><line x1="15" y1="14" x2="15.01" y2="14" strokeWidth="2.5"/>
    <path d="M9.5 18a3 3 0 0 0 5 0"/>
  </svg>
)

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    <line x1="17" y1="15" x2="17.01" y2="15" strokeWidth="2.5"/>
  </svg>
)

const DocIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)

const PersonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

export default function BottomNav({ tipo, badgeCount }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <NavItem href="/dashboard" label="Home"><HomeIcon /></NavItem>

      {tipo === 'PRODUTOR' ? (
        <>
          <NavItem href="/propostas" label="Propostas" badge={badgeCount}><DocIcon /></NavItem>
          {/* Solicitar — FAB central */}
          <Link href="/solicitar" className="flex-1 flex flex-col items-center pt-1 pb-3 gap-1 relative text-xs font-semibold text-green-600">
            <span className="w-10 h-10 -mt-1 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </span>
            <span>Solicitar</span>
          </Link>
          <NavItem href="/equipe-ia" label="Equipe IA"><BotIcon /></NavItem>
        </>
      ) : (
        <>
          <NavItem href="/equipe-ia" label="Equipe IA"><BotIcon /></NavItem>
          <NavItem href="/servicos-disponiveis" label="Pedidos" badge={badgeCount}><BellIcon /></NavItem>
          <NavItem href="/historico" label="Histórico"><ClockIcon /></NavItem>
          <NavItem href="/ganhos" label="Ganhos" data-tour="nav-ganhos"><WalletIcon /></NavItem>
        </>
      )}

      <NavItem href="/perfil" label="Perfil" data-tour="nav-perfil"><PersonIcon /></NavItem>
    </nav>
  )
}
