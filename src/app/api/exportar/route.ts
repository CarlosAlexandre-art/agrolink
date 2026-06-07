import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { SERVICOS } from '@/lib/constants'

function escapeCsv(v: unknown): string {
  const s = v == null ? '' : String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function linha(cols: unknown[]): string {
  return cols.map(escapeCsv).join(',')
}

// GET /api/exportar?formato=csv|html
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new NextResponse('Não autenticado', { status: 401 })

    const formato = req.nextUrl.searchParams.get('formato') ?? 'csv'

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: {
        produtor: {
          include: {
            services: {
              orderBy: { createdAt: 'desc' },
              include: {
                matches: { where: { status: 'ACEITO' }, include: { prestador: { include: { user: { select: { nome: true, telefone: true } } } } }, take: 1 },
                avaliacao: true,
                payment: true,
              }
            }
          }
        },
        prestador: {
          include: {
            matches: {
              where: { status: 'ACEITO' },
              orderBy: { createdAt: 'desc' },
              include: {
                service: {
                  include: {
                    produtor: { include: { user: { select: { nome: true, telefone: true } } } },
                    avaliacao: true,
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!dbUser) return new NextResponse('Não encontrado', { status: 404 })

    const dataExport = new Date().toLocaleDateString('pt-BR')

    if (dbUser.tipo === 'PRODUTOR' && dbUser.produtor) {
      const servicos = dbUser.produtor.services

      if (formato === 'csv') {
        const cabecalho = linha(['ID', 'Serviço', 'Status', 'Prestador', 'Telefone Prestador', 'Valor (R$)', 'Data', 'Avaliação', 'Endereço'])
        const rows = servicos.map(s => {
          const servicoLabel = SERVICOS.find(sv => sv.value === s.tipo)?.label ?? s.tipo
          const prestador = s.matches[0]?.prestador.user
          return linha([
            s.id,
            servicoLabel,
            s.status,
            prestador?.nome ?? '',
            prestador?.telefone ?? '',
            s.precoFinal?.toFixed(2) ?? '',
            new Date(s.createdAt).toLocaleDateString('pt-BR'),
            s.avaliacao?.nota ?? '',
            s.endereco ?? '',
          ])
        })
        const csv = [cabecalho, ...rows].join('\n')
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="agrocore-historico-${dataExport.replace(/\//g, '-')}.csv"`,
          }
        })
      }

      // HTML para impressão/PDF
      const totalGasto = servicos.filter(s => s.status === 'CONCLUIDO').reduce((acc, s) => acc + (s.precoFinal ?? 0), 0)
      const totalConcluidos = servicos.filter(s => s.status === 'CONCLUIDO').length

      const html = gerarHtml({
        titulo: 'Histórico de Serviços — Produtor',
        nome: dbUser.nome,
        email: dbUser.email,
        data: dataExport,
        resumo: [
          { label: 'Total de serviços', valor: servicos.length.toString() },
          { label: 'Serviços concluídos', valor: totalConcluidos.toString() },
          { label: 'Valor total movimentado', valor: `R$ ${totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
        ],
        colunas: ['Serviço', 'Status', 'Prestador', 'Valor', 'Data', 'Avaliação'],
        linhas: servicos.map(s => {
          const servicoLabel = SERVICOS.find(sv => sv.value === s.tipo)?.label ?? s.tipo
          const prestador = s.matches[0]?.prestador.user
          return [
            servicoLabel,
            s.status,
            prestador?.nome ?? '—',
            s.precoFinal ? `R$ ${s.precoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—',
            new Date(s.createdAt).toLocaleDateString('pt-BR'),
            s.avaliacao?.nota ? `${s.avaliacao.nota}/5 ⭐` : '—',
          ]
        })
      })

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="agrocore-historico-${dataExport.replace(/\//g, '-')}.html"`,
        }
      })
    }

    if (dbUser.tipo === 'PRESTADOR' && dbUser.prestador) {
      const matches = dbUser.prestador.matches

      if (formato === 'csv') {
        const cabecalho = linha(['ID Serviço', 'Serviço', 'Status', 'Produtor', 'Telefone Produtor', 'Valor Proposto (R$)', 'Data', 'Avaliação Recebida', 'Endereço'])
        const rows = matches.map(m => {
          const servicoLabel = SERVICOS.find(sv => sv.value === m.service.tipo)?.label ?? m.service.tipo
          const produtor = m.service.produtor.user
          return linha([
            m.service.id,
            servicoLabel,
            m.service.status,
            produtor.nome,
            produtor.telefone ?? '',
            m.valorProposto?.toFixed(2) ?? '',
            new Date(m.createdAt).toLocaleDateString('pt-BR'),
            m.service.avaliacao?.nota ?? '',
            m.service.endereco ?? '',
          ])
        })
        const csv = [cabecalho, ...rows].join('\n')
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="agrocore-servicos-${dataExport.replace(/\//g, '-')}.csv"`,
          }
        })
      }

      const totalRecebido = matches.filter(m => m.service.status === 'CONCLUIDO').reduce((acc, m) => acc + (m.valorProposto ?? 0), 0)
      const totalConcluidos = matches.filter(m => m.service.status === 'CONCLUIDO').length

      const html = gerarHtml({
        titulo: 'Histórico de Serviços — Prestador',
        nome: dbUser.nome,
        email: dbUser.email,
        data: dataExport,
        resumo: [
          { label: 'Total de chamados aceitos', valor: matches.length.toString() },
          { label: 'Serviços concluídos', valor: totalConcluidos.toString() },
          { label: 'Valor total recebido', valor: `R$ ${totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
        ],
        colunas: ['Serviço', 'Status', 'Produtor', 'Valor', 'Data', 'Avaliação'],
        linhas: matches.map(m => {
          const servicoLabel = SERVICOS.find(sv => sv.value === m.service.tipo)?.label ?? m.service.tipo
          return [
            servicoLabel,
            m.service.status,
            m.service.produtor.user.nome,
            m.valorProposto ? `R$ ${m.valorProposto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—',
            new Date(m.createdAt).toLocaleDateString('pt-BR'),
            m.service.avaliacao?.nota ? `${m.service.avaliacao.nota}/5 ⭐` : '—',
          ]
        })
      })

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="agrocore-servicos-${dataExport.replace(/\//g, '-')}.html"`,
        }
      })
    }

    return new NextResponse('Perfil incompleto', { status: 400 })
  } catch (error) {
    console.error(error)
    return new NextResponse('Erro interno', { status: 500 })
  }
}

function gerarHtml(opts: {
  titulo: string
  nome: string
  email: string
  data: string
  resumo: { label: string; valor: string }[]
  colunas: string[]
  linhas: string[][]
}): string {
  const { titulo, nome, email, data, resumo, colunas, linhas } = opts
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${titulo}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #111; padding: 32px; font-size: 13px; }
  .header { border-bottom: 3px solid #15803d; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
  .logo { font-size: 24px; font-weight: 900; color: #15803d; }
  .meta { text-align: right; color: #6b7280; font-size: 11px; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  .resumo { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; }
  .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: .5px; color: #6b7280; }
  .stat-valor { font-size: 20px; font-weight: 900; color: #15803d; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #15803d; color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; }
  td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
  tr:nth-child(even) td { background: #f9fafb; }
  .footer { margin-top: 24px; text-align: center; color: #9ca3af; font-size: 10px; }
  @media print { body { padding: 16px; } .no-print { display: none; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">AgroCore</div>
    <h1>${titulo}</h1>
    <div style="color:#6b7280;font-size:12px;margin-top:4px">${nome} · ${email}</div>
  </div>
  <div class="meta">Gerado em ${data}<br>agrocore.live</div>
</div>

<div class="resumo">
  ${resumo.map(r => `<div class="stat"><div class="stat-label">${r.label}</div><div class="stat-valor">${r.valor}</div></div>`).join('')}
</div>

<div class="no-print" style="margin-bottom:16px">
  <button onclick="window.print()" style="background:#15803d;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:bold;cursor:pointer">
    🖨️ Salvar como PDF / Imprimir
  </button>
</div>

<table>
  <thead><tr>${colunas.map(c => `<th>${c}</th>`).join('')}</tr></thead>
  <tbody>
    ${linhas.map(l => `<tr>${l.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
  </tbody>
</table>

<div class="footer">
  Documento gerado pela plataforma AgroCore · agrocore.live · ${data}
</div>
</body>
</html>`
}
