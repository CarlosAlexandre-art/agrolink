import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { ServiceType } from '@prisma/client'
import { z } from 'zod'

const criarUsuarioSchema = z.object({
  supabaseId: z.string().uuid(),
  nome: z.string().min(1).max(200),
  email: z.string().email().max(200),
  telefone: z.string().max(20).nullable().optional(),
  tipo: z.enum(['PRODUTOR', 'PRESTADOR']),
  nomeFazenda: z.string().max(200).nullable().optional(),
  servicosOferecidos: z.array(z.string().max(100)).max(50).optional(),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const parsed = criarUsuarioSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const { supabaseId, nome, email, telefone, tipo, nomeFazenda, servicosOferecidos } = parsed.data

    // Garante que o supabaseId corresponde ao usuário autenticado
    if (supabaseId !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const dbUser = await prisma.user.create({
      data: {
        supabaseId,
        nome,
        email,
        telefone: telefone ?? null,
        tipo,
        ...(tipo === 'PRODUTOR' ? {
          produtor: { create: { nomeFazenda: nomeFazenda ?? null } }
        } : {
          prestador: { create: { servicosOferecidos: (servicosOferecidos ?? []) as ServiceType[] } }
        })
      },
      include: { produtor: true, prestador: true }
    })

    return NextResponse.json(dbUser, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
  }
}
