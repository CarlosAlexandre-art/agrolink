export type PlanoId = 'free' | 'pro' | 'enterprise' | 'admin'

export const PLANOS_CONFIG: Record<PlanoId, {
  nome: string
  servicosAtivos: number   // máx serviços ativos simultâneos (Produtor)
  urgenciaAlta: boolean    // pode usar urgência ALTA
  historicoCompleto: boolean
  suporte: string
}> = {
  free: {
    nome: 'Grátis',
    servicosAtivos: 1,
    urgenciaAlta: false,
    historicoCompleto: false,
    suporte: 'FAQ',
  },
  pro: {
    nome: 'Pro',
    servicosAtivos: 5,
    urgenciaAlta: true,
    historicoCompleto: true,
    suporte: 'E-mail',
  },
  enterprise: {
    nome: 'Enterprise',
    servicosAtivos: 999,
    urgenciaAlta: true,
    historicoCompleto: true,
    suporte: 'WhatsApp 24/7',
  },
  admin: {
    nome: 'Admin',
    servicosAtivos: 9999,
    urgenciaAlta: true,
    historicoCompleto: true,
    suporte: 'Completo',
  },
}

export function getLimites(plan: string) {
  return PLANOS_CONFIG[(plan as PlanoId)] ?? PLANOS_CONFIG.free
}
