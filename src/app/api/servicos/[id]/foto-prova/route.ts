import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { prestador: true }
    })
    if (!dbUser?.prestador) {
      return NextResponse.json({ error: 'Apenas prestadores podem enviar foto de comprovação' }, { status: 403 })
    }

    // Verificar que o prestador é dono deste serviço
    const service = await prisma.service.findFirst({
      where: {
        id,
        matches: { some: { prestadorId: dbUser.prestador.id, status: 'ACEITO' } }
      }
    })
    if (!service) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Imagem muito grande (máx 10MB)' }, { status: 400 })
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const ext = file.name.split('.').pop() || 'jpg'
    const path = `fotos-prova/${id}_${Date.now()}.${ext}`
    const bytes = await file.arrayBuffer()

    const { error: uploadError } = await adminClient.storage
      .from('avatars')
      .upload(path, bytes, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
    }

    const { data: { publicUrl } } = adminClient.storage.from('avatars').getPublicUrl(path)

    const updated = await prisma.service.update({
      where: { id },
      data: { fotoProva: publicUrl }
    })

    return NextResponse.json({ url: updated.fotoProva })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
