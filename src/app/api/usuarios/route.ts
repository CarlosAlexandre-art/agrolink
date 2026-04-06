import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { supabaseId, nome, email, telefone, tipo, nomeFazenda, servicosOferecidos } = body

    const user = await prisma.user.create({
      data: {
        supabaseId,
        nome,
        email,
        telefone,
        tipo,
        ...(tipo === 'PRODUTOR' ? {
          produtor: {
            create: {
              nomeFazenda: nomeFazenda || null,
            }
          }
        } : {
          prestador: {
            create: {
              servicosOferecidos: servicosOferecidos || [],
            }
          }
        })
      },
      include: {
        produtor: true,
        prestador: true,
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
  }
}
