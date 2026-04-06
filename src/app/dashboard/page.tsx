import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import DashboardProdutor from '@/components/dashboard/DashboardProdutor'
import DashboardPrestador from '@/components/dashboard/DashboardPrestador'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: {
      produtor: {
        include: {
          services: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { matches: { include: { prestador: { include: { user: true } } } } }
          }
        }
      },
      prestador: {
        include: {
          matches: {
            where: { status: { in: ['PENDENTE', 'ACEITO'] } },
            include: { service: { include: { produtor: { include: { user: true } } } } },
            orderBy: { createdAt: 'desc' },
            take: 5,
          }
        }
      }
    }
  })

  if (!dbUser) redirect('/login')

  if (dbUser.tipo === 'PRODUTOR' && dbUser.produtor) {
    return <DashboardProdutor user={dbUser} />
  }

  if (dbUser.tipo === 'PRESTADOR' && dbUser.prestador) {
    return <DashboardPrestador user={dbUser} />
  }

  redirect('/login')
}
