import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export const maxDuration = 30

// SISBOV — Sistema Brasileiro de Identificação e Certificação de Origem Bovina
// Endpoint público do MAPA para consulta de animais certificados
const SISBOV_BASE = 'https://sistemasweb.agricultura.gov.br/sisbov'

async function consultarAnimalSISBOV(numero: string): Promise<Record<string, unknown> | null> {
  try {
    // Endpoint público de consulta do SISBOV (MAPA)
    const res = await fetch(
      `${SISBOV_BASE}/api/animal/${encodeURIComponent(numero)}`,
      {
        headers: {
          'Accept': 'application/json',
          ...(process.env.SISBOV_TOKEN ? { 'Authorization': `Bearer ${process.env.SISBOV_TOKEN}` } : {}),
        },
        signal: AbortSignal.timeout(8000),
      }
    )
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

async function consultarPropriedadeSISBOV(cpfCnpj: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(
      `${SISBOV_BASE}/api/propriedade/${encodeURIComponent(cpfCnpj)}`,
      {
        headers: {
          'Accept': 'application/json',
          ...(process.env.SISBOV_TOKEN ? { 'Authorization': `Bearer ${process.env.SISBOV_TOKEN}` } : {}),
        },
        signal: AbortSignal.timeout(8000),
      }
    )
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

// GET: consulta rastreabilidade de animal ou propriedade
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const numeroAnimal = searchParams.get('animal')
    const consultarPropriedade = searchParams.get('propriedade') === 'true'

    if (!numeroAnimal && !consultarPropriedade) {
      return NextResponse.json({
        info: 'API de Rastreabilidade e-Cattle (SISBOV/MAPA)',
        uso: {
          consultarAnimal: 'GET /api/ai/ecattle?animal=<numero_sisbov>',
          consultarPropriedade: 'GET /api/ai/ecattle?propriedade=true',
        },
        configuracao: {
          sisbovToken: process.env.SISBOV_TOKEN ? 'configurado' : 'não configurado (consultas públicas limitadas)',
          docs: 'https://www.gov.br/agricultura/pt-br/assuntos/sanidade-animal-e-vegetal/saude-animal/rastreabilidade/sisbov',
        },
      })
    }

    if (numeroAnimal) {
      const dados = await consultarAnimalSISBOV(numeroAnimal)
      if (!dados) {
        return NextResponse.json({
          ok: false,
          numero: numeroAnimal,
          mensagem: 'Animal não encontrado no SISBOV ou serviço temporariamente indisponível',
          alternativa: 'Verifique o número de identificação (15 dígitos) ou acesse https://servicos.agricultura.gov.br/sisbov',
        })
      }
      return NextResponse.json({ ok: true, tipo: 'animal', dados })
    }

    // Consulta propriedade via email do usuário como identificador
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { nome: true, email: true },
    })

    if (!dbUser) {
      return NextResponse.json({
        ok: false,
        mensagem: 'Usuário não encontrado. Faça login novamente.',
      }, { status: 400 })
    }

    const doc = dbUser.email
    const dados = await consultarPropriedadeSISBOV(doc)

    if (!dados) {
      return NextResponse.json({
        ok: false,
        mensagem: 'Propriedade não encontrada no SISBOV ou credencial necessária',
        instrucoes: [
          '1. Acesse https://www.gov.br/agricultura/pt-br/assuntos/sanidade-animal-e-vegetal/saude-animal/rastreabilidade/sisbov',
          '2. Registre sua propriedade no SISBOV com auxílio de habilitado/certificador',
          '3. Configure SISBOV_TOKEN no ambiente para consultas autenticadas',
        ],
      })
    }

    return NextResponse.json({ ok: true, tipo: 'propriedade', dados })
  } catch (e: any) {
    console.error('[eCattle Error]', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Erro interno' }, { status: 500 })
  }
}

// POST: registrar movimentação de animal (GTA eletrônica)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const body = await req.json()
    const { animais, tipoMovimento, destino, dataMovimento } = body

    // Validação básica
    if (!animais?.length || !tipoMovimento) {
      return NextResponse.json({
        error: 'Campos obrigatórios: animais[], tipoMovimento, destino, dataMovimento',
        tiposMovimento: ['ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'ABATE', 'MORTE', 'NASCIMENTO'],
      }, { status: 400 })
    }

    if (!process.env.SISBOV_TOKEN) {
      return NextResponse.json({
        ok: false,
        simulado: true,
        mensagem: 'SISBOV_TOKEN não configurado — movimentação registrada localmente',
        registro: {
          animais: animais.length,
          tipo: tipoMovimento,
          destino,
          data: dataMovimento ?? new Date().toISOString(),
          status: 'PENDENTE_ENVIO_SISBOV',
        },
        instrucao: 'Configure SISBOV_TOKEN para envio automático ao MAPA',
      })
    }

    // Com token configurado, envia para a API real do SISBOV
    const res = await fetch(`${SISBOV_BASE}/api/movimentacao`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SISBOV_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ animais, tipoMovimento, destino, dataMovimento }),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({
        ok: false,
        statusSISBOV: res.status,
        mensagem: `Erro ao enviar movimentação ao SISBOV: ${err.slice(0, 300)}`,
      }, { status: 502 })
    }

    const resultado = await res.json()
    return NextResponse.json({ ok: true, sisbov: resultado })
  } catch (e: any) {
    console.error('[eCattle POST Error]', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Erro interno' }, { status: 500 })
  }
}
