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
    imagem: 'https://images.unsplash.com/photo-1562859579-8ee03a048c92?w=400&q=80&auto=format&fit=crop',
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
    imagem: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&q=80&auto=format&fit=crop',
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
    imagem: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80&auto=format&fit=crop',
    categoria: 'TECNOLOGIA' as CategoriaServico,
  },

  // ─── Pecuária ──────────────────────────────────────────────────────────────
  {
    value: 'ASSISTENCIA_VETERINARIA',
    label: 'Assistência Veterinária',
    icon: '🐄',
    descricao: 'Atendimento veterinário para rebanho',
    imagem: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&q=80&auto=format&fit=crop',
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
    imagem: 'https://images.unsplash.com/photo-1468421870903-ef3301b8a0e7?w=400&q=80&auto=format&fit=crop',
    categoria: 'INFRAESTRUTURA' as CategoriaServico,
  },
  {
    value: 'TERRAPLANAGEM',
    label: 'Terraplanagem',
    icon: '⛏️',
    descricao: 'Nivelamento e movimentação de terra',
    imagem: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&q=80&auto=format&fit=crop',
    categoria: 'INFRAESTRUTURA' as CategoriaServico,
  },
  {
    value: 'ARMAZENAGEM',
    label: 'Armazenagem',
    icon: '🏚️',
    descricao: 'Armazenamento de grãos e insumos',
    imagem: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=400&q=80&auto=format&fit=crop',
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

  // ─── Tecnologia (expansão) ─────────────────────────────────────────────────
  {
    value: 'MONITORAMENTO_SATELITE',
    label: 'Monitoramento por Satélite',
    icon: '🛰️',
    descricao: 'Análise de imagens de satélite para lavoura',
    imagem: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80&auto=format&fit=crop',
    categoria: 'TECNOLOGIA' as CategoriaServico,
  },
  {
    value: 'AGRICULTURA_PRECISAO',
    label: 'Agricultura de Precisão',
    icon: '📊',
    descricao: 'Mapeamento e aplicação variável de insumos',
    imagem: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&q=80&auto=format&fit=crop',
    categoria: 'TECNOLOGIA' as CategoriaServico,
  },
  {
    value: 'TOPOGRAFIA',
    label: 'Topografia Rural',
    icon: '📐',
    descricao: 'Levantamento topográfico e planialtimétrico',
    imagem: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80&auto=format&fit=crop',
    categoria: 'TECNOLOGIA' as CategoriaServico,
  },
  {
    value: 'SENSORIAMENTO_REMOTO',
    label: 'Sensoriamento Remoto',
    icon: '📡',
    descricao: 'NDVI, análise de estresse hídrico e biofísico',
    imagem: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80&auto=format&fit=crop',
    categoria: 'TECNOLOGIA' as CategoriaServico,
  },

  // ─── Lavoura (expansão) ────────────────────────────────────────────────────
  {
    value: 'ANALISE_SOLO_AVANCADA',
    label: 'Análise de Solo Avançada',
    icon: '🧫',
    descricao: 'Análise microbiológica e de fertilidade profunda',
    imagem: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80&auto=format&fit=crop',
    categoria: 'LAVOURA' as CategoriaServico,
  },
  {
    value: 'IRRIGACAO_AUTOMATIZADA',
    label: 'Irrigação Automatizada',
    icon: '💧',
    descricao: 'Instalação de pivô central e automação',
    imagem: 'https://images.unsplash.com/photo-1620912185049-71a5c37f23b1?w=400&q=80&auto=format&fit=crop',
    categoria: 'LAVOURA' as CategoriaServico,
  },
  {
    value: 'APLICACAO_DRONE',
    label: 'Aplicação por Drone',
    icon: '🚁',
    descricao: 'Pulverização de precisão com drone agrícola',
    imagem: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&q=80&auto=format&fit=crop',
    categoria: 'LAVOURA' as CategoriaServico,
  },

  // ─── Infraestrutura (expansão) ─────────────────────────────────────────────
  {
    value: 'INSTALACAO_PIVO',
    label: 'Instalação de Pivô',
    icon: '🏗️',
    descricao: 'Instalação e manutenção de pivô central',
    imagem: 'https://images.unsplash.com/photo-1589859615073-6d26a6d78f9a?w=400&q=80&auto=format&fit=crop',
    categoria: 'INFRAESTRUTURA' as CategoriaServico,
  },
  {
    value: 'ENERGIA_SOLAR_RURAL',
    label: 'Energia Solar Rural',
    icon: '☀️',
    descricao: 'Instalação de painéis solares para propriedades rurais',
    imagem: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80&auto=format&fit=crop',
    categoria: 'INFRAESTRUTURA' as CategoriaServico,
  },

  // ─── Ambiental / Legal ─────────────────────────────────────────────────────
  {
    value: 'GESTAO_AMBIENTAL',
    label: 'Gestão Ambiental',
    icon: '🌳',
    descricao: 'CAR, licenciamento, área de reserva legal',
    imagem: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80&auto=format&fit=crop',
    categoria: 'OUTROS' as CategoriaServico,
  },
  {
    value: 'REGULARIZACAO_FUNDIARIA',
    label: 'Regularização Fundiária',
    icon: '📜',
    descricao: 'Regularização de imóvel rural, titulação e CCIR',
    imagem: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80&auto=format&fit=crop',
    categoria: 'OUTROS' as CategoriaServico,
  },
  {
    value: 'CERTIFICACAO_AGRICOLA',
    label: 'Certificação Agrícola',
    icon: '🏆',
    descricao: 'Certificação orgânica, GlobalG.A.P., Rainforest',
    imagem: 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=400&q=80&auto=format&fit=crop',
    categoria: 'OUTROS' as CategoriaServico,
  },
  {
    value: 'SEGURANCA_RURAL',
    label: 'Segurança Rural',
    icon: '🔒',
    descricao: 'Monitoramento, câmeras e vigilância patrimonial rural',
    imagem: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&q=80&auto=format&fit=crop',
    categoria: 'OUTROS' as CategoriaServico,
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
  {
    value: 'MANUTENCAO_COLHEITADEIRA',
    label: 'Manutenção de Colheitadeira',
    icon: '⚙️',
    descricao: 'Revisão, regulagem e reparo de colheitadeiras',
    imagem: 'https://images.unsplash.com/photo-1581092921461-eab10380ed66?w=400&q=80&auto=format&fit=crop',
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
  {
    value: 'TRANSPORTE_GRAOS',
    label: 'Transporte de Grãos',
    icon: '🌾',
    descricao: 'Frete de soja, milho, café e outros grãos a granel',
    imagem: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80&auto=format&fit=crop',
    categoria: 'LOGISTICA' as CategoriaServico,
  },

  // ─── Infraestrutura verde / Ambiental (novos) ─────────────────────────────
  {
    value: 'BIOGAS_RURAL',
    label: 'Biogás Rural',
    icon: '♻️',
    descricao: 'Instalação de biodigestor para energia e biofertilizante',
    imagem: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=400&q=80&auto=format&fit=crop',
    categoria: 'INFRAESTRUTURA' as CategoriaServico,
  },
  {
    value: 'RASTREABILIDADE',
    label: 'Rastreabilidade & ESG',
    icon: '📲',
    descricao: 'Rastreio de produção, certificação ESG e cadeia de custódia',
    imagem: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop',
    categoria: 'OUTROS' as CategoriaServico,
  },
  {
    value: 'LICENCIAMENTO_AMBIENTAL',
    label: 'Licenciamento Ambiental',
    icon: '📋',
    descricao: 'CAR, licença ambiental, APP e área de reserva legal',
    imagem: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80&auto=format&fit=crop',
    categoria: 'OUTROS' as CategoriaServico,
  },

  // ─── Outros ────────────────────────────────────────────────────────────────
  {
    value: 'OUTROS',
    label: 'Outros Serviços',
    icon: '📋',
    descricao: 'Outros serviços rurais sob demanda',
    imagem: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80&auto=format&fit=crop',
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
