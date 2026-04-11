export const SERVICOS = [
  {
    value: 'PULVERIZACAO',
    label: 'Pulverização',
    icon: '🌿',
    descricao: 'Aplicação eficiente com tecnologia moderna',
    imagem: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'COLHEITA',
    label: 'Colheita',
    icon: '🌾',
    descricao: 'Colheita mecanizada com alta produtividade',
    imagem: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'TRANSPORTE',
    label: 'Transporte',
    icon: '🚛',
    descricao: 'Transporte de grãos, animais e insumos',
    imagem: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'MANUTENCAO_MAQUINAS',
    label: 'Manutenção de Máquinas',
    icon: '🔧',
    descricao: 'Manutenção de tratores e colheitadeiras',
    imagem: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'PLANTIO',
    label: 'Plantio',
    icon: '🌱',
    descricao: 'Plantio mecanizado com precisão',
    imagem: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'TRATORACAO',
    label: 'Tratoreação / Preparo de Solo',
    icon: '🚜',
    descricao: 'Aração, gradagem e preparo do solo',
    imagem: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'ANALISE_SOLO',
    label: 'Análise de Solo',
    icon: '🧪',
    descricao: 'Coleta e análise laboratorial de solo',
    imagem: 'https://images.unsplash.com/photo-1628352081506-83c43123a1a6?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'CONSULTORIA_AGRONOMICA',
    label: 'Consultoria Agronômica',
    icon: '👨‍🌾',
    descricao: 'Visita técnica com agrônomo especializado',
    imagem: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'IRRIGACAO',
    label: 'Irrigação',
    icon: '💧',
    descricao: 'Instalação e manutenção de sistemas de irrigação',
    imagem: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'DRONE_AGRICOLA',
    label: 'Drone Agrícola',
    icon: '🚁',
    descricao: 'Pulverização e mapeamento com drone',
    imagem: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'CERCAMENTO',
    label: 'Cercamento',
    icon: '🏗️',
    descricao: 'Construção e reparo de cercas rurais',
    imagem: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'ASSISTENCIA_VETERINARIA',
    label: 'Assistência Veterinária',
    icon: '🐄',
    descricao: 'Atendimento veterinário para rebanho',
    imagem: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'TERRAPLANAGEM',
    label: 'Terraplanagem',
    icon: '⛏️',
    descricao: 'Nivelamento e movimentação de terra',
    imagem: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'ARMAZENAGEM',
    label: 'Armazenagem',
    icon: '🏚️',
    descricao: 'Armazenamento de grãos e insumos',
    imagem: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'APLICACAO_FERTILIZANTES',
    label: 'Aplicação de Fertilizantes',
    icon: '🌍',
    descricao: 'Aplicação mecanizada de fertilizantes',
    imagem: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'CONTROLE_PRAGAS',
    label: 'Controle de Pragas',
    icon: '🐛',
    descricao: 'Controle integrado de pragas e doenças',
    imagem: 'https://images.unsplash.com/photo-1566159237810-7a2b04d42e35?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'CAPINA',
    label: 'Capina / Roçagem',
    icon: '🌿',
    descricao: 'Limpeza e roçagem de áreas',
    imagem: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80&auto=format&fit=crop',
  },
  {
    value: 'OUTROS',
    label: 'Outros Serviços',
    icon: '📋',
    descricao: 'Outros serviços rurais sob demanda',
    imagem: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80&auto=format&fit=crop',
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
