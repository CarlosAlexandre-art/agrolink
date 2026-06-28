import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'
import { emails } from '@/lib/email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agrocore.live'

const schema = z.object({
  nome: z.string().min(2).max(200),
  email: z.string().email().max(254),
  telefone: z.string().max(20).nullable().optional(),
  senha: z.string().min(6).max(128),
  tipo: z.enum(['PRODUTOR', 'PRESTADOR']),
  nomeFazenda: z.string().max(200).nullable().optional(),
  servicosOferecidos: z.array(z.string().max(100)).max(50).optional(),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const { allowed } = rateLimit(`cadastrar:${ip}`, 5, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde um momento.' }, { status: 429 })
  }

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const { nome, email, telefone, senha, tipo, nomeFazenda, servicosOferecidos } = parsed.data

  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email,
    password: senha,
    options: {
      data: { nome, telefone, tipo, nomeFazenda, servicosOferecidos },
      redirectTo: `${APP_URL}/api/auth/callback`,
    }
  })

  if (error) {
    if (error.status === 422 || error.message?.toLowerCase().includes('already registered')) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado. Tente fazer login.' }, { status: 409 })
    }
    console.error('[cadastrar] generateLink error:', error)
    return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 500 })
  }

  try {
    await emails.confirmarCadastro(email, nome, tipo, data.properties.action_link)
  } catch (emailErr) {
    console.error('[cadastrar] email send error:', emailErr)
    // Não falha o cadastro se o email falhar — link gerado com sucesso
  }

  return NextResponse.json({ ok: true })
}
