import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export default async function EquipeIALayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { plan: true },
  })

  const plan = dbUser?.plan ?? 'free'
  const isPro = ['pro', 'enterprise', 'admin'].includes(plan)

  if (!isPro) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center gap-6">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Equipe IA — Plano Pro</h1>
          <p className="text-gray-500 text-sm max-w-sm">
            Agentes autônomos de marketplace estão disponíveis a partir do plano <strong>Pro</strong>.
            Automatize busca de oportunidades, propostas e monitoramento de contratos.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/planos"
            className="bg-green-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-800 transition-colors"
          >
            Ver planos
          </Link>
          <Link
            href="/dashboard"
            className="border border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
