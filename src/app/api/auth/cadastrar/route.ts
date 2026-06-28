import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'
import { prisma } from '@/lib/prisma'
import { ServiceType } from '@prisma/client'

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

  // Se já tem perfil no banco, já está cadastrado
  const perfilExistente = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })
  if (perfilExistente) {
    return NextResponse.json({ error: 'Este e-mail já está cadastrado. Tente fazer login.' }, { status: 409 })
  }

  // generateLink cria o usuário (ou atualiza se já existir) e retorna o ID
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'signup',
    email,
    password: senha,
    options: {
      data: { nome, telefone, tipo, nomeFazenda, servicosOferecidos },
    },
  })

  if (error || !data?.user?.id) {
    console.error('[cadastrar] generateLink:', error)
    return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 500 })
  }

  const supabaseId = data.user.id

  // Confirma o email imediatamente — sem precisar de confirmação por email
  await admin.auth.admin.updateUserById(supabaseId, { email_confirm: true })

  // Cria perfil no banco
  await prisma.user.create({
    data: {
      supabaseId,
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

  return NextResponse.json({ ok: true })
}
