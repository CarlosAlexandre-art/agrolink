import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { groq } from '@/lib/groq'
import { SERVICOS } from '@/lib/constants'

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length
  if (n < 2) return { a: points[0]?.y ?? 0, b: 0, r2: 0 }
  const sumX  = points.reduce((s, p) => s + p.x, 0)
  const sumY  = points.reduce((s, p) => s + p.y, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0)
  const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const a = (sumY - b * sumX) / n
  const yMean = sumY / n
  const ssTot = points.reduce((s, p) => s + (p.y - yMean) ** 2, 0)
  const ssRes = points.reduce((s, p) => s + (p.y - (a + b * p.x)) ** 2, 0)
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0
  return { a, b, r2: Math.round(r2 * 100) / 100 }
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { prestador: true },
    })
    if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const lat = dbUser.latitude
    const lng = dbUser.longitude
    const raio = (dbUser.prestador?.raioAtendamento ?? 50) * 2

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const services = await prisma.service.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { tipo: true, latitude: true, longitude: true, createdAt: true },
    })

    const filtered = lat && lng
      ? services.filter(s => haversine(lat, lng, s.latitude, s.longitude) <= raio)
      : services

    // Build last 6 month keys
    const months: string[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      months.push(monthKey(d))
    }

    // Group by tipo + month
    const byTipo: Record<string, Record<string, number>> = {}
    for (const s of filtered) {
      const k = String(s.tipo)
      const m = monthKey(new Date(s.createdAt))
      if (!byTipo[k]) byTipo[k] = {}
      byTipo[k][m] = (byTipo[k][m] ?? 0) + 1
    }

    const tipoStats = Object.entries(byTipo).map(([tipo, monthCounts]) => {
      const points = months.map((m, i) => ({ x: i, y: monthCounts[m] ?? 0 }))
      const reg = linearRegression(points)
      const total = points.reduce((s, p) => s + p.y, 0)
      const lastMonth = points[points.length - 1].y
      const proj30 = Math.max(0, Math.round(reg.a + reg.b * months.length))
      const meta = SERVICOS.find(s => s.value === tipo)
      return {
        tipo,
        label: meta?.label ?? tipo,
        icon: meta?.icon ?? '📋',
        total,
        lastMonth,
        slope: Math.round(reg.b * 10) / 10,
        r2: reg.r2,
        proj30,
        tendencia: reg.b > 0.3 ? 'crescendo' : reg.b < -0.3 ? 'caindo' : 'estável',
      }
    })

    const top = tipoStats
      .filter(t => t.total > 0)
      .sort((a, b) => b.slope - a.slope)
      .slice(0, 5)

    const insightIA = await groq([{
      role: 'user',
      content: `Você é um analista de mercado de serviços agrícolas no Brasil.
Analise os dados abaixo e gere recomendações para um prestador de serviços rurais.

Raio de análise: ${raio} km | Serviços analisados: ${filtered.length} | Período: 6 meses

Top serviços por tendência de demanda:
${top.slice(0, 3).map((t, i) => `${i + 1}. ${t.icon} ${t.label}: ${t.lastMonth} chamados/mês, slope ${t.slope}/mês, projeção próximo mês: ${t.proj30}, tendência: ${t.tendencia}`).join('\n')}

Gere em 3 partes curtas:
1. Oportunidade principal (1 frase — qual serviço priorizar e por quê)
2. Alerta de mercado (1 frase — se algum está caindo ou saturando)
3. Dica prática para os próximos 30 dias`,
    }], 350)

    return NextResponse.json({
      raioKm: raio,
      totalServicos: filtered.length,
      mesesAnalisados: 6,
      tendencias: top,
      insightIA,
      modelo: 'Regressão Linear + NVIDIA NIM llama-3.3-70b',
      geradoEm: new Date().toISOString(),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
