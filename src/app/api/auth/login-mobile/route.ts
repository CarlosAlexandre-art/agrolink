import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { auditLog } from '@/lib/audit-log'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido').max(254),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(128),
})

// Rota exclusiva para o app mobile Flutter — retorna JWT em vez de cookies
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const { allowed } = rateLimit(`login-mobile:${ip}`, 10, 15 * 60_000)
    if (!allowed) {
      await auditLog({ type: 'RATE_LIMIT_HIT', severity: 'MEDIUM', ip, details: { rota: 'login-mobile' } })
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde 15 minutos.' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { email, password } = parsed.data

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
    )

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
      await auditLog({ type: 'LOGIN_FAILED', severity: 'MEDIUM', ip, details: { email: parsed.data.email } })
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
