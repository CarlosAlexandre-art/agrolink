import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'
import { prisma } from '@/lib/prisma'
import { ServiceType } from '@prisma/client'
import { emails } from '@/lib/email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agrocore.live'

export const maxDuration = 30

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
  const { allowed } = rateLimit(`cadastrar:${ip}`, 10, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde um momento.' }, { status: 429 })
  }

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const { nome, email, telefone, senha, tipo, nomeFazenda, servicosOferecidos } = parsed.data
  const admin = createAdminClient()

  // Se já tem perfil no banco, já está cadastrado e confirmado
  const perfilExistente = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })
  if (perfilExistente) {
    return NextResponse.json({ error: 'Este e-mail já está cadastrado. Tente fazer login.' }, { status: 409 })
  }

  // generateLink cria o usuário no Supabase (ou regenera link se já existe sem confirmar)
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'signup',
    email,
    password: senha,
    options: {
      redirectTo: `${APP_URL}/api/auth/callback`,
      data: { nome, telefone, tipo, nomeFazenda, servicosOferecidos },
    },
  })

  if (error || !data?.user?.id) {
    if (error?.message?.toLowerCase().includes('already registered')) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado. Tente fazer login.' }, { status: 409 })
    }
    console.error('[cadastrar] generateLink:', error)
    return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 500 })
  }

  const confirmLink = data.properties?.action_link

  // Tenta enviar email de confirmação via Resend
  if (confirmLink && process.env.RESEND_API_KEY) {
    try {
      await emails.confirmarCadastro(email, nome, tipo, confirmLink)
      // Email enviado com sucesso — perfil será criado pelo callback quando confirmar
      return NextResponse.json({ ok: true, confirmacao: 'email' })
    } catch (emailErr) {
      console.error('[cadastrar] falha no envio de email:', emailErr)
      // Resend falhou → cai no fallback abaixo
    }
  }

  // Fallback: auto-confirma e cria perfil imediatamente (sem email)
  await admin.auth.admin.updateUserById(data.user.id, { email_confirm: true })
  await prisma.user.create({
    data: {
      supabaseId: data.user.id,
      nome,
      email,
      telefone: telefone ?? null,
      tipo,
      ...(tipo === 'PRODUTOR'
        ? { produtor: { create: { nomeFazenda: nomeFazenda ?? null } } }
        : { prestador: { create: { servicosOferecidos: (servicosOferecidos ?? []) as ServiceType[] } } }
      ),
    },
  })

  return NextResponse.json({ ok: true, confirmacao: 'auto' })
}
