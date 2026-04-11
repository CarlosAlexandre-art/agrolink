import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { COMISSAO } from '@/lib/constants'
import GanhosClient from './GanhosClient'

export default async function GanhosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      prestador: {
        include: {
          matches: {
            where: { status: 'ACEITO' },
            include: {
              service: {
                include: { payment: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  })

  if (!dbUser) redirect('/login')
  if (dbUser.tipo !== 'PRESTADOR') redirect('/dashboard')

  const matches = dbUser.prestador?.matches || []
  const concluidos = matches.filter((m: any) => m.service.status === 'CONCLUIDO')
  const totalBruto = concluidos.reduce((acc: number, m: any) => acc + (m.service.precoFinal || m.service.precoEstimado || 0), 0)
  const totalLiquido = totalBruto * (1 - COMISSAO)

  const porMes: Record<string, { total: number; count: number }> = {}
  for (const m of concluidos) {
    const data = new Date(m.service.updatedAt)
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
    if (!porMes[chave]) porMes[chave] = { total: 0, count: 0 }
    porMes[chave].total += (m.service.precoFinal || m.service.precoEstimado || 0) * (1 - COMISSAO)
    porMes[chave].count++
  }

  const meses = Object.entries(porMes).sort((a, b) => b[0].localeCompare(a[0]))

  const emAndamento = matches.filter((m: any) =>
    ['MATCH_ENCONTRADO', 'EM_ROTA', 'EXECUTANDO'].includes(m.service.status)
  ).length

  return (
    <GanhosClient
      totalLiquido={totalLiquido}
      totalBruto={totalBruto}
      comissao={COMISSAO}
      totalConcluidos={concluidos.length}
      emAndamento={emAndamento}
      avaliacao={dbUser.prestador?.avaliacao ?? 0}
      meses={meses}
      temConta={!!dbUser.prestador?.stripeAccountId}
    />
  )
}
