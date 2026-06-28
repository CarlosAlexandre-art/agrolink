import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agrocore.live'

const schema = z.object({
  email: z.string().email().max(254),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { allowed } = rateLimit(`reenviar:${ip}`, 3, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Aguarde antes de reenviar.' }, { status: 429 })
  }

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
  }

  const { email } = parsed.data

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  )

  await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${APP_URL}/api/auth/callback` },
  })

  // Sempre retorna ok para não revelar se o email existe
  return NextResponse.json({ ok: true })
}
