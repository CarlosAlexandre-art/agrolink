import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { SERVICOS } from '@/lib/constants'
import LogoutButton from '@/components/LogoutButton'
import ConnectStripeButton from '@/components/ConnectStripeButton'
import BottomNav from '@/components/BottomNav'
import OryonID from '@/components/OryonID'
import SeloVerificado from '@/components/SeloVerificado'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      produtor: true,
      prestador: true,
    }
  })

  if (!dbUser) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-white hover:text-green-200">← Voltar</Link>
          <h1 className="font-bold text-lg">Meu Perfil</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Avatar and name */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="w-20 h-20 mx-auto mb-3">
            {dbUser.avatarUrl ? (
              <img
                src={dbUser.avatarUrl}
                alt="Foto de perfil"
                className="w-20 h-20 rounded-full object-cover border-4 border-green-100"
              />
            ) : (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-3xl font-bold text-green-700">
                {dbUser.nome[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="font-bold text-gray-800 text-xl">{dbUser.nome}</div>
          <div className="text-sm text-gray-500 mt-1">{dbUser.email}</div>
          <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              dbUser.tipo === 'PRODUTOR'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {dbUser.tipo === 'PRODUTOR' ? '🌾 Produtor Rural' : '🔧 Prestador de Serviço'}
            </span>
            <SeloVerificado
              verificado={!!(dbUser.produtor?.verificado || dbUser.prestador?.verificado)}
              tipo={dbUser.tipo as 'PRODUTOR' | 'PRESTADOR'}
              size="sm"
            />
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">Informações</h2>
          <div className="space-y-0 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Nome</span>
              <span className="font-medium text-gray-700">{dbUser.nome}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-700 text-right break-all">{dbUser.email}</span>
            </div>
            {dbUser.telefone && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">WhatsApp</span>
                <span className="font-medium text-gray-700">
                  🇧🇷 +55 {dbUser.telefone.replace(/\D/g, '').replace(/^55/, '').replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')}
                </span>
              </div>
            )}
            {dbUser.estado && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Estado</span>
                <span className="font-medium text-gray-700">{dbUser.estado}</span>
              </div>
            )}
            {dbUser.cidade && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Cidade</span>
                <span className="font-medium text-gray-700">{dbUser.cidade}</span>
              </div>
            )}
            {dbUser.produtor?.nomeFazenda && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Fazenda</span>
                <span className="font-medium text-gray-700">{dbUser.produtor.nomeFazenda}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Membro desde</span>
              <span className="font-medium text-gray-700">
                {new Date(dbUser.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* ORYON ID — Histórico Operacional */}
        <OryonID />

        {/* Prestador stats */}
        {dbUser.prestador && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-2xl font-bold text-green-700">
                  {dbUser.prestador.avaliacao > 0 ? dbUser.prestador.avaliacao.toFixed(1) : '—'}
                </div>
                <div className="text-xs text-gray-500 mt-1">⭐ Avaliação</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-2xl font-bold text-green-700">{dbUser.prestador.totalAvaliacoes}</div>
                <div className="text-xs text-gray-500 mt-1">Serviços feitos</div>
              </div>
            </div>

            {dbUser.prestador.servicosOferecidos.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="font-bold text-gray-700 mb-3">Serviços oferecidos</h2>
                <div className="flex flex-wrap gap-2">
                  {dbUser.prestador.servicosOferecidos.map((tipo: any) => {
                    const s = SERVICOS.find(sv => sv.value === tipo)
                    return (
                      <span key={tipo} className="text-sm px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                        {s?.icon} {s?.label || tipo}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            <ConnectStripeButton conectado={!!dbUser.prestador.stripeAccountId} />
          </>
        )}

        {/* Exportar dados */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 dark:text-gray-200 mb-1">📤 Exportar meus dados</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Baixe todo o seu histórico de serviços e movimentações</p>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/api/exportar?formato=csv"
              className="flex items-center justify-center gap-2 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:border-green-600 hover:text-green-700 transition text-sm"
            >
              📊 Excel / CSV
            </a>
            <a
              href="/api/exportar?formato=html"
              target="_blank"
              className="flex items-center justify-center gap-2 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:border-green-600 hover:text-green-700 transition text-sm"
            >
              🖨️ PDF / Imprimir
            </a>
          </div>
        </div>

        {/* Edit profile link */}
        <Link
          href="/perfil/editar"
          className="block w-full py-4 border-2 border-green-700 text-green-700 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700 text-center font-bold rounded-2xl hover:bg-green-50 transition"
        >
          ✏️ Editar perfil
        </Link>

        {/* Configurações */}
        <Link
          href="/configuracoes"
          className="flex items-center justify-between w-full px-5 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">⚙️</span>
            <div>
              <div className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Configurações</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">Tema, AgroBot, GPS, notificações</div>
            </div>
          </div>
          <span className="text-gray-400">›</span>
        </Link>

        {/* Help center */}
        <Link
          href="/ajuda"
          className="block w-full py-4 border-2 border-blue-600 text-blue-600 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700 text-center font-bold rounded-2xl hover:bg-blue-50 transition"
        >
          ❓ Central de Ajuda
        </Link>

        {/* Logout */}
        <LogoutButton />
      </div>
      <BottomNav tipo={dbUser.tipo as 'PRODUTOR' | 'PRESTADOR'} />
      <div className="h-16" />
    </div>
  )
}
