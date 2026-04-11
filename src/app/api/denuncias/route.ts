import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { motivo, descricao, emailDenunciado } = await req.json()

    if (!motivo || !descricao) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })

    // Salvar no banco
    await prisma.denuncia.create({
      data: {
        denuncianteId: dbUser?.id,
        denuncianteEmail: dbUser?.email,
        motivo,
        descricao,
        emailDenunciado: emailDenunciado || null,
      }
    })

    // Enviar email para o admin
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'AgroCore <onboarding@resend.dev>',
        to: 'alexandre@parceirosdeproposito.com',
        subject: `🚨 Nova denúncia: ${motivo}`,
        html: `
          <h2>Nova denúncia recebida no AgroCore</h2>
          <table style="border-collapse:collapse;width:100%;max-width:600px">
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Motivo</td><td style="padding:8px">${motivo}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Denunciante</td><td style="padding:8px">${dbUser?.nome || '—'} (${dbUser?.email || '—'})</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Denunciado</td><td style="padding:8px">${emailDenunciado || 'Não informado'}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Descrição</td><td style="padding:8px">${descricao}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Data</td><td style="padding:8px">${new Date().toLocaleString('pt-BR')}</td></tr>
          </table>
        `,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao enviar denúncia' }, { status: 500 })
  }
}
