# AgroCore — Contexto para IA

## O que é
Marketplace agrícola brasileiro que conecta **produtores rurais** a **prestadores de serviços agrícolas** (pulverização, colheita, consultoria, etc). Deploy em Vercel, banco no Supabase.

URL produção: agrocore.live

## Stack
- **Framework**: Next.js 15 App Router, TypeScript
- **Banco**: PostgreSQL (Supabase) via Prisma ORM
- **Auth**: Supabase Auth (cookies httpOnly via @supabase/ssr)
- **Pagamentos**: Stripe (marketplace com Connect)
- **IA**: Groq API — LLaMA 3.3 70B (`lib/groq.ts`) — NÃO substituir por OpenAI
- **Email**: Resend
- **WhatsApp**: Evolution API
- **Deploy**: Vercel (push para main = deploy automático)

## Estrutura de Pastas
```
src/
  app/
    api/           → Route Handlers (backend)
      agrobot/     → Chat de suporte IA
      ai/          → Endpoints de IA (chat, sugerir-preco, descrever-servico...)
      auth/        → Login mobile Flutter
      avaliacoes/  → Avaliações produtor/prestador
      carteira/    → Saldo e saques
      denuncias/   → Denúncias de usuários
      disputas/    → Disputas de serviço
      lgpd/        → Exclusão de dados (LGPD)
      matches/     → Match prestador/produtor
      servicos/    → CRUD de serviços + match automático
      stripe/      → Webhooks Stripe
    (páginas)/     → App Router pages
  components/      → Componentes React reutilizáveis
  lib/
    groq.ts        → Cliente Groq singleton
    prisma.ts      → Cliente Prisma singleton
    rate-limit.ts  → Rate limiter in-memory por IP/usuário
    sanitize.ts    → sanitizeString(), sanitizePositiveNumber(), sanitizePhone()
    smart-match.ts → Algoritmo Haversine para match geográfico
    stripe.ts      → Cliente Stripe
    supabase/      → createClient() server e client
```

## Fluxo Crítico (NÃO ALTERAR SEM MAPEAR)
```
SOLICITAR → PROCURANDO → AGUARDANDO_PROPOSTA → MATCH_ENCONTRADO → EM_ROTA → EXECUTANDO → CONCLUIDO
```
Status válidos: `AGUARDANDO | PROCURANDO | AGUARDANDO_PROPOSTA | MATCH_ENCONTRADO | EM_ROTA | EXECUTANDO | CONCLUIDO | CANCELADO | DISPUTA`

**Incidente conhecido**: mudança anterior quebrou o fluxo de solicitar — só aceitar continuou funcionando. Mapear TUDO antes de alterar qualquer parte desse fluxo.

## APIs Críticas
| Rota | Descrição | Risco |
|------|-----------|-------|
| `POST /api/servicos` | Cria serviço + dispara match automático | CRÍTICO |
| `PATCH /api/servicos/[id]` | Avança status do serviço | CRÍTICO |
| `PATCH /api/matches` | Prestador aceita/recusa + envia proposta | CRÍTICO |
| `PATCH /api/matches/proposta` | Produtor aceita/recusa proposta | CRÍTICO |
| `POST /api/stripe/webhook` | Atualiza saldo após pagamento | CRÍTICO |
| `POST /api/auth/login-mobile` | Auth para app Flutter | Público |

## Padrões de Código
- **Validação**: Zod em rotas com input externo (já tem em matches, denúncias, login)
- **Rate limiting**: `rateLimit(key, limite, windowMs)` de `@/lib/rate-limit`
- **Sanitização**: `sanitizeString(val, maxLen)` de `@/lib/sanitize`
- **Auth**: sempre `createClient()` do server + `supabase.auth.getUser()` antes de qualquer operação
- **Prisma**: sempre usar `select` para limitar campos; nunca retornar CPF em listagens

## Regras que Nunca Quebram
1. Nunca push para main sem confirmação explícita do usuário
2. Nunca alterar webhook Stripe ou fluxo de pagamento sem confirmar
3. `COMISSAO_PERCENT=15` no env mas código usa 5% — inconsistência conhecida, NÃO corrigir sem confirmar
4. Taxa real da plataforma: 5% (não 15%)

## Tipos de Usuário
- `PRODUTOR`: contrata serviços, paga via Stripe
- `PRESTADOR`: executa serviços, recebe via Stripe Connect

@AGENTS.md
