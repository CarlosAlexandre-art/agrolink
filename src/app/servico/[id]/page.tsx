import { redirect } from 'next/navigation'
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
        where: { status: 'ACEITO' },
        include: { prestador: { include: { user: true } } }
      },
      avaliacao: true,
    }
  })

  if (!service) redirect('/dashboard')

  const isProdutor = service.produtor.user.supabaseId === user.id
  const isPrestador = service.matches.some((m: any) => m.prestador.user.supabaseId === user.id)
  if (!isProdutor && !isPrestador) redirect('/dashboard')

  return (
    <ServicoClient
      serviceId={id}
      initialService={JSON.parse(JSON.stringify(service))}
      isProdutor={isProdutor}
      isPrestador={isPrestador}
    />
  )
}
