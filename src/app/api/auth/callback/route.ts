import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const nextParam = searchParams.get('next') ?? '/dashboard'
  // Apenas caminhos relativos, para evitar open redirect
  const next = nextParam.startsWith('/') ? nextParam : '/dashboard'

  const cookieStore = await cookies()

  // Os cookies de sessão chegam antes de sabermos o destino do redirect,
  // então acumulamos aqui e copiamos para a resposta final
  const cookiesDaSessao: { name: string; value: string; options: CookieOptions }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(c => cookiesDaSessao.push(c))
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  function redirect(path: string) {
    const response = NextResponse.redirect(`${origin}${path}`)
    cookiesDaSessao.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options)
    )
    return response
  }

  // Recovery (reset de senha) — vem com token_hash + type=recovery
  if (token_hash && type === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'recovery' })
    if (!error) {
      return redirect('/nova-senha')
    }
  }

  // Login com magic link, OAuth (Google/LinkedIn) ou confirmação de email
  let motivo = searchParams.get('error_description') || searchParams.get('error') || ''
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[auth/callback] exchangeCodeForSession falhou:', error.code, error.message)
      motivo = error.message
    }
    if (!error && data.user) {
      const u = data.user

      // Criar usuário no banco se ainda não existe (primeiro login OAuth)
      let dbUser = await prisma.user.findUnique({ where: { supabaseId: u.id } })

      if (!dbUser && u.email) {
        // Conta criada antes por email/senha: vincula ao login OAuth
        const porEmail = await prisma.user.findUnique({ where: { email: u.email } })
        if (porEmail) {
          dbUser = await prisma.user.update({
            where: { id: porEmail.id },
            data: { supabaseId: u.id },
          })
        }
      }

      if (!dbUser) {
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
        return redirect('/perfil/completar')
      }

      return redirect(next)
    }
  }

  if (motivo) {
    console.error('[auth/callback] falha de autenticação:', motivo)
    return redirect(`/login?error=auth&motivo=${encodeURIComponent(motivo)}`)
  }
  return redirect('/login?error=auth')
}
