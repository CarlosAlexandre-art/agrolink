export type CategoriaServico =
  | 'MECANIZACAO'
  | 'LAVOURA'
  | 'TECNOLOGIA'
  | 'PECUARIA'
  | 'INFRAESTRUTURA'
  | 'MANUTENCAO'
  | 'LOGISTICA'
  | 'OUTROS'

export const CATEGORIAS: { value: CategoriaServico; label: string; icon: string }[] = [
  { value: 'MECANIZACAO',  label: 'Mecanização',      icon: '🚜' },
  { value: 'LAVOURA',      label: 'Lavoura & Solo',   icon: '🌱' },
  { value: 'TECNOLOGIA',   label: 'Tecnologia',       icon: '🚁' },
  { value: 'PECUARIA',     label: 'Pecuária',         icon: '🐄' },
  { value: 'INFRAESTRUTURA', label: 'Infraestrutura', icon: '🏗️' },
  { value: 'MANUTENCAO',   label: 'Manutenção',       icon: '🔧' },
  { value: 'LOGISTICA',    label: 'Logística',        icon: '🚛' },
  { value: 'OUTROS',       label: 'Outros',           icon: '📋' },
]

export const SERVICOS = [
  // ─── Mecanização ───────────────────────────────────────────────────────────
  {
    value: 'PULVERIZACAO',
    label: 'Pulverização',
    icon: '🌿',
    descricao: 'Aplicação eficiente com tecnologia moderna',
    imagem: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80&auto=format&fit=crop',
    categoria: 'MECANIZACAO' as CategoriaServico,
  },

  {
    value: 'COLHEITA',
    label: 'Colheita',
    icon: '🌾',
    descricao: 'Colheita mecanizada com alta produtividade',
    imagem: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80&auto=format&fit=crop',
    categoria: 'MECANIZACAO' as CategoriaServico,
  },
  {
    value: 'PLANTIO',
    label: 'Plantio',
    icon: '🌱',
    descricao: 'Plantio mecanizado com precisão',
    imagem: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80&auto=format&fit=crop',
    categoria: 'MECANIZACAO' as CategoriaServico,
  },
  {
    value: 'TRATORACAO',
    label: 'Tratoreação / Preparo de Solo',
    icon: '🚜',
    descricao: 'Aração, gradagem e preparo do solo',
    imagem: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80&auto=format&fit=crop',
    categoria: 'MECANIZACAO' as CategoriaServico,
  },
  {
    value: 'APLICACAO_FERTILIZANTES',
    label: 'Aplicação de Fertilizantes',
    icon: '🌍',
    descricao: 'Aplicação mecanizada de fertilizantes',
    imagem: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&auto=format&fit=crop',
    categoria: 'MECANIZACAO' as CategoriaServico,
  },

  // ─── Lavoura & Solo ────────────────────────────────────────────────────────
  {
    value: 'ANALISE_SOLO',
    label: 'Análise de Solo',
    icon: '🧪',
    descricao: 'Coleta e análise laboratorial de solo',
    imagem: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&q=80&auto=format&fit=crop',
    categoria: 'LAVOURA' as CategoriaServico,
  },
  {
    value: 'CONSULTORIA_AGRONOMICA',
    label: 'Consultoria Agronômica',
    icon: '👨‍🌾',
    descricao: 'Visita técnica com agrônomo especializado',
    imagem: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=400&q=80&auto=format&fit=crop',
    categoria: 'LAVOURA' as CategoriaServico,
  },
  {
    value: 'CONTROLE_PRAGAS',
    label: 'Controle de Pragas',
    icon: '🐛',
    descricao: 'Controle integrado de pragas e doenças',
    imagem: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80&auto=format&fit=crop',
    categoria: 'LAVOURA' as CategoriaServico,
  },
  {
    value: 'CAPINA',
    label: 'Capina / Roçagem',
    icon: '🌿',
    descricao: 'Limpeza e roçagem de áreas',
    imagem: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80&auto=format&fit=crop',
    categoria: 'LAVOURA' as CategoriaServico,
  },
  {
    value: 'IRRIGACAO',
    label: 'Irrigação',
    icon: '💧',
    descricao: 'Instalação e manutenção de sistemas de irrigação',
    imagem: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80&auto=format&fit=crop',
    categoria: 'LAVOURA' as CategoriaServico,
  },
  {
    value: 'FUMIGACAO',
    label: 'Fumigação de Armazém',
    icon: '💨',
    descricao: 'Controle de pragas em grãos armazenados',
    imagem: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&q=80&auto=format&fit=crop',
    categoria: 'LAVOURA' as CategoriaServico,
  },

  // ─── Tecnologia ────────────────────────────────────────────────────────────
  {
    value: 'DRONE_AGRICOLA',
    label: 'Drone Agrícola',
    icon: '🚁',
    descricao: 'Pulverização e mapeamento com drone',
    imagem: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&q=80&auto=format&fit=crop',
    categoria: 'TECNOLOGIA' as CategoriaServico,
  },
  {
    value: 'GEORREFERENCIAMENTO',
    label: 'Georreferenciamento',
    icon: '📡',
    descricao: 'Demarcação e registro GPS da propriedade',
    imagem: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80&auto=format&fit=crop',
    categoria: 'TECNOLOGIA' as CategoriaServico,
  },

  // ─── Pecuária ──────────────────────────────────────────────────────────────
  {
    value: 'ASSISTENCIA_VETERINARIA',
    label: 'Assistência Veterinária',
    icon: '🐄',
    descricao: 'Atendimento veterinário para rebanho',
    imagem: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80&auto=format&fit=crop',
    categoria: 'PECUARIA' as CategoriaServico,
  },
  {
    value: 'INSEMINACAO',
    label: 'Inseminação Artificial',
    icon: '🧬',
    descricao: 'Inseminação artificial bovina e suína',
    imagem: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&q=80&auto=format&fit=crop',
    categoria: 'PECUARIA' as CategoriaServico,
  },

  // ─── Infraestrutura ────────────────────────────────────────────────────────
  {
    value: 'CERCAMENTO',
    label: 'Cercamento',
    icon: '🏗️',
    descricao: 'Construção e reparo de cercas rurais',
    imagem: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&q=80&auto=format&fit=crop',
    categoria: 'INFRAESTRUTURA' as CategoriaServico,
  },
  {
    value: 'TERRAPLANAGEM',
    label: 'Terraplanagem',
    icon: '⛏️',
    descricao: 'Nivelamento e movimentação de terra',
    imagem: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&q=80&auto=format&fit=crop',
    categoria: 'INFRAESTRUTURA' as CategoriaServico,
  },
  {
    value: 'ARMAZENAGEM',
    label: 'Armazenagem',
    icon: '🏚️',
    descricao: 'Armazenamento de grãos e insumos',
    imagem: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&q=80&auto=format&fit=crop',
    categoria: 'INFRAESTRUTURA' as CategoriaServico,
  },
  {
    value: 'CONSTRUCAO_RURAL',
    label: 'Construção Rural',
    icon: '🏠',
    descricao: 'Galpões, currais, silos e benfeitorias',
    imagem: 'https://images.unsplash.com/photo-1590725121839-892b458a74fe?w=400&q=80&auto=format&fit=crop',
    categoria: 'INFRAESTRUTURA' as CategoriaServico,
  },

  // ─── Manutenção ────────────────────────────────────────────────────────────
  {
    value: 'MANUTENCAO_MAQUINAS',
    label: 'Manutenção de Máquinas',
    icon: '🔧',
    descricao: 'Manutenção de tratores e colheitadeiras',
    imagem: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80&auto=format&fit=crop',
    categoria: 'MANUTENCAO' as CategoriaServico,
  },

  // ─── Logística ─────────────────────────────────────────────────────────────
  {
    value: 'TRANSPORTE',
    label: 'Transporte',
    icon: '🚛',
    descricao: 'Transporte de grãos, animais e insumos',
    imagem: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&q=80&auto=format&fit=crop',
    categoria: 'LOGISTICA' as CategoriaServico,
  },

  // ─── Outros ────────────────────────────────────────────────────────────────
  {
    value: 'OUTROS',
    label: 'Outros Serviços',
    icon: '📋',
    descricao: 'Outros serviços rurais sob demanda',
    imagem: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80&auto=format&fit=crop',
    categoria: 'OUTROS' as CategoriaServico,
  },
] as const

export const URGENCIAS = [
  { value: 'ALTA', label: 'Alta — Preciso hoje ou amanhã', cor: 'red' },
  { value: 'MEDIA', label: 'Média — Esta semana', cor: 'yellow' },
  { value: 'BAIXA', label: 'Baixa — Sem pressa', cor: 'green' },
] as const

export const COMISSAO = 0.05 // 5%

export const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const
