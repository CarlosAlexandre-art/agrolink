import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'
import { prisma } from '@/lib/prisma'
import { ServiceType } from '@prisma/client'
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
  const admin = createAdminClient()

  // Verifica se já existe perfil no banco
  const perfilExistente = await prisma.user.findUnique({ where: { email } })
  if (perfilExistente) {
    return NextResponse.json({ error: 'Este e-mail já está cadastrado. Tente fazer login.' }, { status: 409 })
  }

  // Cria usuário no Supabase Auth com email já confirmado
  const { data: userData, error: createError } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, telefone, tipo, nomeFazenda, servicosOferecidos },
  })

  if (createError) {
    // Usuário já existe no Supabase mas sem perfil no banco — recupera o ID
    if (createError.status === 422 || createError.message?.toLowerCase().includes('already registered')) {
      // Usa generateLink para obter o ID do usuário existente e confirmar o email
      const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
        type: 'signup',
        email,
        password: senha,
        options: {
          data: { nome, telefone, tipo, nomeFazenda, servicosOferecidos },
          redirectTo: `${APP_URL}/api/auth/callback`,
        }
      })
      if (linkError || !linkData?.user?.id) {
        return NextResponse.json({ error: 'Erro ao recuperar conta. Tente fazer login.' }, { status: 409 })
      }
      await admin.auth.admin.updateUserById(linkData.user.id, { email_confirm: true })
      await criarPerfil(linkData.user.id, nome, email, telefone, tipo, nomeFazenda, servicosOferecidos)
      enviarBoasVindas(email, nome, tipo)
      return NextResponse.json({ ok: true })
    }

    console.error('[cadastrar] createUser error:', createError)
    return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 500 })
  }

  // Cria perfil no banco de dados
  await criarPerfil(userData.user.id, nome, email, telefone, tipo, nomeFazenda, servicosOferecidos)

  // Email de boas-vindas (não bloqueia o cadastro se falhar)
  enviarBoasVindas(email, nome, tipo)

  return NextResponse.json({ ok: true })
}

async function criarPerfil(
  supabaseId: string,
  nome: string,
  email: string,
  telefone: string | null | undefined,
  tipo: 'PRODUTOR' | 'PRESTADOR',
  nomeFazenda: string | null | undefined,
  servicosOferecidos: string[] | undefined,
) {
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
}

function enviarBoasVindas(email: string, nome: string, tipo: 'PRODUTOR' | 'PRESTADOR') {
  emails.confirmarCadastro(email, nome, tipo, `https://agrocore.live/dashboard`)
    .catch(err => console.error('[cadastrar] welcome email error:', err))
}
