import { NextResponse, type NextRequest } from 'next/server'

// Rate limit: max requests per window per IP
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minuto
const RATE_LIMIT_MAX = 60             // 60 req/min geral
const RATE_LIMIT_AUTH_MAX = 10        // 10 req/min para rotas de auth

// In-memory store (por instância serverless — suficiente para proteção básica)
const ipStore = new Map<string, { count: number; resetAt: number }>()

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function isRateLimited(ip: string, max: number): boolean {
  const now = Date.now()
  const key = ip
  const entry = ipStore.get(key)

  if (!entry || now > entry.resetAt) {
    ipStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  entry.count++
  if (entry.count > max) return true

  return false
}

// Limpar entradas expiradas periodicamente (evita memory leak)
let lastClean = Date.now()
function cleanExpired() {
  const now = Date.now()
  if (now - lastClean < 5 * 60_000) return
  lastClean = now
  for (const [key, entry] of ipStore.entries()) {
    if (now > entry.resetAt) ipStore.delete(key)
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getIP(request)

  cleanExpired()

  // Rate limit mais restrito para rotas de autenticação e pagamento
  const isAuthRoute = pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/usuarios') ||
    pathname.startsWith('/api/pagamento')

  const max = isAuthRoute ? RATE_LIMIT_AUTH_MAX : RATE_LIMIT_MAX

  if (isRateLimited(ip, max)) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em breve.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': String(max),
        },
      }
    )
  }

  const response = NextResponse.next()

  // Header anti-clickjacking extra nas respostas de API
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
