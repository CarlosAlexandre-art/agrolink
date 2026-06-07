import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/perfil/verificar — admin marca usuário como verificado
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    // Apenas admins podem verificar perfis
    const admin = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!admin || admin.plan !== 'enterprise') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { userId, tipo, cpfVerificado, docVerificado, telefoneVerificado } = await req.json()
    const verificado = !!(cpfVerificado && docVerificado && telefoneVerificado)
    const verificadoEm = verificado ? new Date() : null

    if (tipo === 'PRODUTOR') {
      await prisma.produtor.updateMany({
        where: { userId },
        data: { verificado, verificadoEm, cpfVerificado: !!cpfVerificado, docVerificado: !!docVerificado, telefoneVerificado: !!telefoneVerificado }
      })
    } else {
      await prisma.prestador.updateMany({
        where: { userId },
        data: { verificado, verificadoEm, cpfVerificado: !!cpfVerificado, docVerificado: !!docVerificado, telefoneVerificado: !!telefoneVerificado }
      })
    }

    return NextResponse.json({ ok: true, verificado })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
