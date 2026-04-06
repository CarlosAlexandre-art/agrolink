import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import ServicoClient from './ServicoClient'

export default async function ServicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      produtor: { include: { user: true } },
      matches: {
        include: { prestador: { include: { user: true } } }
      },
      avaliacao: true,
      avaliacaoProdutor: true,
    }
  })

  if (!service) redirect('/dashboard')

  const isProdutor = service.produtor.user.supabaseId === user.id
  const isPrestador = service.matches.some((m: any) => m.prestador.user.supabaseId === user.id)
  if (!isProdutor && !isPrestador) redirect('/dashboard')

  const serviceForClient = {
    ...service,
    matches: service.matches.filter((m: any) => m.status === 'ACEITO'),
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-green-700 font-semibold">Carregando...</div></div>}>
      <ServicoClient
        serviceId={id}
        initialService={JSON.parse(JSON.stringify(serviceForClient))}
        isProdutor={isProdutor}
        isPrestador={isPrestador}
      />
    </Suspense>
  )
}
