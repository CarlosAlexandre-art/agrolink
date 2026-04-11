import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  // Recovery (reset de senha) — vem com token_hash + type=recovery
  if (token_hash && type === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'recovery' })
    if (!error) {
      return NextResponse.redirect(`${origin}/nova-senha`)
    }
  }

  // Login com magic link, OAuth (Google/LinkedIn) ou confirmação de email
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const u = data.user

      // Criar usuário no banco se ainda não existe (primeiro login OAuth)
      const exists = await prisma.user.findUnique({ where: { supabaseId: u.id } })
      if (!exists) {
        const nome = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Usuário'
        const avatarUrl = u.user_metadata?.avatar_url || u.user_metadata?.picture || null

        // OAuth não tem tipo definido — redirecionar para completar cadastro
        const novoUser = await prisma.user.create({
          data: {
            supabaseId: u.id,
            nome,
            email: u.email!,
            tipo: 'PRODUTOR', // padrão; usuário pode alterar depois
            avatarUrl,
          }
        })

        await prisma.produtor.create({ data: { userId: novoUser.id } })

        // Redirecionar para completar perfil
        return NextResponse.redirect(`${origin}/perfil/completar`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
