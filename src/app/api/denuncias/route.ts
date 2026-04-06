import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { motivo, descricao, emailDenunciado } = await req.json()

    if (!motivo || !descricao) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })

    // Log the report — in production, also send email to admin
    console.log('DENUNCIA RECEBIDA:', {
      denunciante: dbUser?.email,
      motivo,
      emailDenunciado,
      descricao,
      data: new Date().toISOString(),
    })

    // TODO: send email to admin using Resend or similar

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao enviar denúncia' }, { status: 500 })
  }
}
