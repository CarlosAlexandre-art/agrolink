import { prisma } from '@/lib/prisma'
import { SERVICOS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import RastrearClient from './RastrearClient'

export default async function RastrearPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      produtor: { include: { user: true } },
      matches: {
        where: { status: 'ACEITO' },
        include: { prestador: { include: { user: true } } }
      },
      payment: true,
    }
  })

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-gray-700 mb-2">Serviço não encontrado</h1>
          <p className="text-gray-500 text-sm">Verifique o link ou entre em contato com o suporte.</p>
        </div>
      </div>
    )
  }

  // Verificar se o usuário logado é o produtor deste serviço
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isProdutor = !!user && service.produtor.user.supabaseId === user.id

  // Se for o produtor e houver proposta pendente de aprovação, busca os detalhes
  let proposta: {
    id: string
    valorProposto: number | null
    mensagemProposta: string | null
    prestadorNome: string
  } | null = null

  if (service.status === 'AGUARDANDO_PROPOSTA') {
    const match = await prisma.match.findFirst({
      where: { serviceId: id, status: 'ACEITO' },
      include: { prestador: { include: { user: true } } }
    })
    if (match) {
      proposta = {
        id: match.id,
        valorProposto: match.valorProposto,
        mensagemProposta: match.mensagemProposta,
        prestadorNome: match.prestador.user.nome,
      }
    }
  }

  const servicoLabel = SERVICOS.find(s => s.value === service.tipo)?.label ?? service.tipo

  return (
    <RastrearClient
      serviceId={id}
      initialService={JSON.parse(JSON.stringify(service))}
      servicoLabel={servicoLabel}
      isProdutor={isProdutor}
      proposta={proposta}
    />
  )
}
