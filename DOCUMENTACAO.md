# AgroLink — Documentação Completa do Projeto

> Gerado em: 2026-04-07  
> URL de produção: https://agrolink-opal.vercel.app

---

## 1. O que é o AgroLink?

Marketplace agrícola brasileiro que conecta **produtores rurais** com **prestadores de serviços agrícolas**. Produtores postam pedidos de serviço (aração, colheita, pulverização, etc.) e prestadores recebem notificações, fazem propostas com preço, e executam o serviço. A plataforma gerencia todo o ciclo: match → pagamento escrow → avaliação.

---

## 2. Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16.2.2, React 19, TypeScript |
| Estilização | Tailwind CSS v4, shadcn/ui |
| Auth | Supabase Auth (email/senha) |
| Banco de dados | PostgreSQL + Prisma 5 ORM |
| Hospedagem | Vercel |
| Pagamentos | Stripe Connect (Express Accounts) |
| IA (chatbot) | Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) |
| Email | Resend |
| Notificações push | web-push (VAPID) + Service Worker |
| Storage (avatares) | Supabase Storage |
| PWA | Service Worker + manifest.json |

---

## 3. Variáveis de Ambiente

Arquivo: `.env.local` (nunca commitar no git)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=[sua-chave-publica]
SUPABASE_SERVICE_ROLE_KEY=[sua-service-role-key]

# Banco de dados PostgreSQL (via Supabase)
DATABASE_URL="postgresql://postgres.[projeto]:[senha]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[projeto]:[senha]@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

# Stripe (modo teste)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=[gerar-no-dashboard-stripe]

# App
NEXT_PUBLIC_APP_URL=https://agrolink-opal.vercel.app

# Email
RESEND_API_KEY=re_GvoEnrbg_EdjEJzghhcRYNYv5XwzyzF9Y

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BL-bXDGicewJs-zI7Hk8...
VAPID_PRIVATE_KEY=1nQ_zPbHvwZy0YiOw3sRXZFXmMO-SLLB...

# Claude AI (configurar no Vercel)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 4. Estrutura de Pastas

```
agrolink/
├── src/
│   ├── app/
│   │   ├── api/                         # Rotas de API (backend)
│   │   │   ├── ai/chat/route.ts         # AgroBot (Claude)
│   │   │   ├── auth/callback/route.ts   # Callback Supabase
│   │   │   ├── avaliacoes/route.ts      # Avaliação prestador
│   │   │   ├── avaliacoes/produtor/     # Avaliação produtor
│   │   │   ├── denuncias/route.ts       # Denúncias
│   │   │   ├── matches/route.ts         # Aceitar/recusar match
│   │   │   ├── matches/[id]/route.ts    # Match específico
│   │   │   ├── matches/proposta/        # Resposta de proposta
│   │   │   ├── pagamento/route.ts       # Checkout Stripe
│   │   │   ├── perfil/me/route.ts       # Perfil atual
│   │   │   ├── perfil/route.ts          # Atualizar perfil
│   │   │   ├── perfil/avatar/route.ts   # Upload avatar
│   │   │   ├── prestador/disponibilidade/ # Toggle disponível
│   │   │   ├── push/route.ts            # Registrar push
│   │   │   ├── servicos/route.ts        # Criar/listar serviços
│   │   │   ├── servicos/[id]/route.ts   # Detalhe/status serviço
│   │   │   ├── stripe/connect/route.ts  # Stripe Express onboarding
│   │   │   ├── stripe/webhook/route.ts  # Webhook Stripe
│   │   │   └── usuarios/route.ts        # Criar usuário
│   │   ├── ajuda/page.tsx
│   │   ├── bem-vindo/page.tsx
│   │   ├── cadastro/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── denunciar/page.tsx
│   │   ├── ganhos/page.tsx
│   │   ├── historico/page.tsx
│   │   ├── login/page.tsx
│   │   ├── match/[id]/page.tsx
│   │   ├── nova-senha/page.tsx
│   │   ├── perfil/page.tsx
│   │   ├── perfil/editar/page.tsx
│   │   ├── recuperar-senha/page.tsx
│   │   ├── servico/[id]/page.tsx
│   │   ├── servicos/page.tsx
│   │   ├── solicitar/page.tsx
│   │   ├── layout.tsx                   # Root layout (AgroBot global)
│   │   ├── page.tsx                     # Homepage
│   │   └── globals.css
│   ├── components/
│   │   ├── AgroBot.tsx                  # Chatbot Claude flutuante
│   │   ├── ConnectStripeButton.tsx      # Onboarding Stripe Connect
│   │   ├── LogoutButton.tsx
│   │   ├── PwaPrompt.tsx
│   │   ├── Tour.tsx                     # Tour onboarding
│   │   └── dashboard/
│   │       ├── DashboardProdutor.tsx
│   │       └── DashboardPrestador.tsx
│   ├── lib/
│   │   ├── constants.ts                 # Tipos de serviço, urgências, estados BR
│   │   ├── prisma.ts                    # Singleton Prisma
│   │   ├── push.ts                      # Envio de notificações push
│   │   ├── stripe.ts                    # Cliente Stripe
│   │   └── supabase/
│   │       ├── client.ts                # Supabase client-side
│   │       └── server.ts                # Supabase server-side
│   └── middleware.ts
├── prisma/
│   └── schema.prisma
├── public/
│   ├── sw.js                            # Service Worker
│   ├── manifest.json                    # PWA manifest
│   └── icons/                           # Ícones 192x192 e 512x512
├── .env.local                           # Variáveis (não commitar!)
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. Schema do Banco de Dados (Prisma)

### Enums

```prisma
enum UserType { PRODUTOR PRESTADOR }

enum ServiceType {
  PULVERIZACAO COLHEITA TRANSPORTE MANUTENCAO_MAQUINAS
  PLANTIO TRATORACAO ANALISE_SOLO CONSULTORIA_AGRONOMICA
  IRRIGACAO DRONE_AGRICOLA CERCAMENTO ASSISTENCIA_VETERINARIA
  TERRAPLANAGEM ARMAZENAGEM APLICACAO_FERTILIZANTES
  CONTROLE_PRAGAS CAPINA OUTROS
}

enum ServiceStatus {
  AGUARDANDO PROCURANDO AGUARDANDO_PROPOSTA
  MATCH_ENCONTRADO EM_ROTA EXECUTANDO
  CONCLUIDO CANCELADO DISPUTA
}

enum MatchStatus   { PENDENTE ACEITO RECUSADO CANCELADO }
enum PaymentStatus { PENDENTE RESERVADO LIBERADO REEMBOLSADO }
```

### Modelos

**User** — id, supabaseId (unique), nome, email, telefone, tipo (UserType), avatarUrl, estado, cidade, latitude, longitude

**Produtor** — id, userId (unique FK), nomeFazenda, areaTotal → relações: services, avaliacoesRecebidas

**Prestador** — id, userId (unique FK), bio, avaliacao (float), totalAvaliacoes, disponivel (bool), raioAtendamento (int, padrão 50km), stripeAccountId, verificado (bool), servicosOferecidos (ServiceType[]) → relações: matches, avaliacoes

**Service** — id, produtorId (FK), tipo, descricao, area (hectares), urgencia, status, latitude, longitude, endereco, precoEstimado, precoFinal, agendadoPara, fotoProva, gpsLat, gpsLng

**Match** — id, serviceId (FK), prestadorId (FK), status, distancia (km), valorProposto, mensagemProposta — constraint unique: [serviceId, prestadorId]

**Payment** — id, serviceId (unique FK), valor, comissao, valorPrestador, status, stripePaymentId, stripeTransferId

**Avaliacao** — id, serviceId (unique FK), prestadorId (FK), nota (1–5), comentario

**AvaliacaoProdutor** — id, serviceId (unique FK), produtorId (FK), nota (1–5), comentario

**PushSubscription** — id, userId (FK), endpoint (unique), p256dh, auth

**Denuncia** — id, denuncianteId, denuncianteEmail, motivo, descricao, emailDenunciado

---

## 6. Fluxos Principais

### Ciclo de Vida do Serviço
```
PROCURANDO
  → (prestador aceita e propõe preço)
AGUARDANDO_PROPOSTA
  → (produtor aprova preço)
MATCH_ENCONTRADO
  → (produtor paga via Stripe)
EM_ROTA
  → (prestador confirma que chegou)
EXECUTANDO
  → (prestador confirma início)
CONCLUIDO
  → pagamento liberado automaticamente para prestador
```

### Auto-Match ao Criar Serviço
1. Cria Service (status: PROCURANDO)
2. Busca Prestadores: disponivel=true, tipo correto, dentro do raioAtendamento
3. Calcula distância com fórmula Haversine
4. Cria Match (PENDENTE) para cada prestador elegível
5. Envia push notification para cada prestador

### Fluxo de Pagamento Stripe
1. Produtor confirma match → `/api/pagamento` → Checkout Session criada
2. Redirect para Stripe hosted payment
3. Webhook `checkout.session.completed` → Payment: RESERVADO, Service: EM_ROTA
4. Serviço marcado CONCLUIDO → `/api/servicos/[id]` → Stripe transfer automática
5. Payment: LIBERADO, stripeTransferId salvo

### Comissão
- Taxa: **5% fixo**
- valorPrestador = valor × 0.95
- comissao = valor × 0.05

---

## 7. Autenticação (Supabase)

- Supabase Project ID: `qnzvgbspbvvcnjpffawq`
- Flow: signUp → callback `/api/auth/callback` → criar User no Postgres via `/api/usuarios`
- Reset de senha: email com link → `/nova-senha` (suporte PKCE e hash)
- Proteção de rotas: `if (!user) redirect('/login')` por página
- Middleware (`/src/middleware.ts`): atualmente minimal (pass-through)

---

## 8. AgroBot (Claude AI)

- Modelo: `claude-haiku-4-5-20251001`
- Endpoint: `/api/ai/chat`
- Idioma: Português BR, máx 3 parágrafos curtos
- Contexto: diferencia PRODUTOR vs PRESTADOR
- Histórico: últimas 10 mensagens
- Preços de referência 2024 incluídos no system prompt:
  - Pulverização: R$15–35/ha
  - Plantio: R$80–150/ha
  - Colheita: R$80–180/ha
  - Drone: R$20–45/ha
  - Consultoria: R$150–400/visita

---

## 9. PWA

- Manifest: `/public/manifest.json` (nome: AgroLink, cor: #15803d, idioma: pt-BR)
- Service Worker: `/public/sw.js` (cache-first para assets estáticos, push handler)
- Ícones: 192×192 e 512×512 em `/public/icons/`
- Prompt de instalação: `PwaPrompt.tsx`

---

## 10. Problemas Conhecidos / TODOs

| Item | Status |
|------|--------|
| STRIPE_WEBHOOK_SECRET não configurado | Pendente |
| COMISSAO_PERCENT env=15 mas código usa 5% | Inconsistência |
| Middleware não protege rotas no servidor | Pendente |
| Painel admin para denúncias | Não implementado |
| Páginas incompletas: ganhos, historico, ajuda | Parcial |

---

## 11. Scripts Úteis

```bash
# Desenvolvimento
npm run dev

# Build (gera Prisma client + build Next.js)
npm run build

# Migrations Prisma
npx prisma migrate dev --name nome_da_migration
npx prisma db push          # push sem migration (dev)
npx prisma studio           # GUI do banco

# Ver schema atual
npx prisma format
```

---

*Documentação gerada automaticamente pelo Claude Code em 2026-04-07*
