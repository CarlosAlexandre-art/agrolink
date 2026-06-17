import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

// Rota exclusiva para o app mobile Flutter — retorna JWT em vez de cookies
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
    )

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: data.user.id },
      select: { id: true, nome: true, email: true, tipo: true, avatar: true }
    })

    return NextResponse.json({
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: dbUser ?? { id: data.user.id, nome: email.split('@')[0], email, tipo: 'PRESTADOR' }
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
