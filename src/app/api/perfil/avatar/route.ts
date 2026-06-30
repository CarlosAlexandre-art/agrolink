import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })

    // Validate type and size
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Imagem muito grande (máx 5MB)' }, { status: 400 })
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Garante que o bucket existe e é público (updateBucket funciona mesmo se já existe)
    await adminClient.storage.createBucket('avatars', { public: true }).catch(() => {})
    await adminClient.storage.updateBucket('avatars', { public: true }).catch(() => {})

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${user.id}.${ext}`
    const bytes = await file.arrayBuffer()

    const { error: uploadError } = await adminClient.storage
      .from('avatars')
      .upload(path, bytes, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: `Erro ao fazer upload: ${uploadError.message}` }, { status: 500 })
    }

    const { data: { publicUrl } } = adminClient.storage
      .from('avatars')
      .getPublicUrl(path)

    // cache-bust so the browser fetches the new image instead of the old one
    return NextResponse.json({ url: `${publicUrl}?t=${Date.now()}` })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao processar imagem' }, { status: 500 })
  }
}
