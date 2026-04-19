export type Badge = {
  key: string
  label: string
  emoji: string
  cor: string
  descricao: string
}

// ─── Prestador ────────────────────────────────────────────────────────────────

export function getBadgesPrestador(p: {
  avaliacao: number
  totalAvaliacoes: number
  verificado: boolean
  isMenorPreco?: boolean
}): Badge[] {
  const badges: Badge[] = []

  if (p.verificado) {
    badges.push({
      key: 'verificado',
      label: 'Verificado',
      emoji: '✅',
      cor: 'bg-blue-100 text-blue-700 border-blue-200',
      descricao: 'Identidade e dados conferidos pela equipe AgroCore',
    })
  }

  if (p.totalAvaliacoes >= 5 && p.avaliacao >= 4.8) {
    badges.push({
      key: 'excelente',
      label: 'Excelente',
      emoji: '🥇',
      cor: 'bg-amber-100 text-amber-800 border-amber-300',
      descricao: 'Nota acima de 4.8 com pelo menos 5 avaliações',
    })
  } else if (p.totalAvaliacoes >= 3 && p.avaliacao >= 4.5) {
    badges.push({
      key: 'top_avaliado',
      label: 'Top Avaliado',
      emoji: '⭐',
      cor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      descricao: 'Nota acima de 4.5 com pelo menos 3 avaliações',
    })
  }

  if (p.totalAvaliacoes >= 20) {
    badges.push({
      key: 'lenda',
      label: 'Lenda',
      emoji: '👑',
      cor: 'bg-purple-100 text-purple-700 border-purple-200',
      descricao: 'Mais de 20 serviços concluídos com avaliação',
    })
  } else if (p.totalAvaliacoes >= 10) {
    badges.push({
      key: 'veterano',
      label: 'Veterano',
      emoji: '🏆',
      cor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      descricao: 'Mais de 10 serviços concluídos com avaliação',
    })
  }

  if (p.isMenorPreco) {
    badges.push({
      key: 'menor_preco',
      label: 'Menor preço',
      emoji: '💰',
      cor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      descricao: 'Proposta mais acessível entre os candidatos',
    })
  }

  if (p.totalAvaliacoes === 0) {
    badges.push({
      key: 'novo',
      label: 'Novo',
      emoji: '🌱',
      cor: 'bg-green-100 text-green-700 border-green-200',
      descricao: 'Recém chegou na plataforma — dê uma chance!',
    })
  }

  return badges
}

// ─── Produtor ─────────────────────────────────────────────────────────────────

export function getBadgesProdutor(p: {
  avaliacao: number
  totalAvaliacoes: number
  totalConcluidos: number
}): Badge[] {
  const badges: Badge[] = []

  if (p.totalConcluidos >= 20) {
    badges.push({
      key: 'top_cliente',
      label: 'Top Cliente',
      emoji: '💎',
      cor: 'bg-purple-100 text-purple-700 border-purple-200',
      descricao: 'Mais de 20 serviços contratados e concluídos',
    })
  } else if (p.totalConcluidos >= 5) {
    badges.push({
      key: 'cliente_fiel',
      label: 'Cliente Fiel',
      emoji: '🤝',
      cor: 'bg-blue-100 text-blue-700 border-blue-200',
      descricao: 'Já contratou e concluiu 5 ou mais serviços',
    })
  }

  if (p.totalAvaliacoes >= 3 && p.avaliacao >= 4.5) {
    badges.push({
      key: 'boa_recepcao',
      label: 'Boa Recepção',
      emoji: '⭐',
      cor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      descricao: 'Muito bem avaliado pelos prestadores',
    })
  }

  if (p.totalConcluidos === 0) {
    badges.push({
      key: 'novo',
      label: 'Novo',
      emoji: '🌱',
      cor: 'bg-green-100 text-green-700 border-green-200',
      descricao: 'Primeiro contato com prestadores — seja bem-vindo!',
    })
  }

  return badges
}
