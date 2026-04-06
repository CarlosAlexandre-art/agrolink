export const SERVICOS = [
  { value: 'PULVERIZACAO', label: 'Pulverização', icon: '🌿', descricao: 'Pulverização terrestre ou aérea' },
  { value: 'COLHEITA', label: 'Colheita', icon: '🌾', descricao: 'Serviço de colheita mecanizada' },
  { value: 'TRANSPORTE', label: 'Transporte', icon: '🚛', descricao: 'Transporte de grãos, animais ou insumos' },
  { value: 'MANUTENCAO_MAQUINAS', label: 'Manutenção de Máquinas', icon: '🔧', descricao: 'Manutenção de tratores, colheitadeiras e equipamentos' },
  { value: 'PLANTIO', label: 'Plantio', icon: '🌱', descricao: 'Serviço de plantio mecanizado' },
  { value: 'TRATORACAO', label: 'Tratoreação/Preparo de Solo', icon: '🚜', descricao: 'Aração, gradagem e preparo do solo' },
  { value: 'ANALISE_SOLO', label: 'Análise de Solo', icon: '🧪', descricao: 'Coleta e análise laboratorial de solo' },
  { value: 'CONSULTORIA_AGRONOMICA', label: 'Consultoria Agronômica', icon: '👨‍🌾', descricao: 'Visita técnica e consultoria de agrônomo' },
  { value: 'IRRIGACAO', label: 'Irrigação', icon: '💧', descricao: 'Instalação ou manutenção de sistemas de irrigação' },
  { value: 'DRONE_AGRICOLA', label: 'Drone Agrícola', icon: '🚁', descricao: 'Pulverização ou mapeamento com drone' },
  { value: 'CERCAMENTO', label: 'Cercamento', icon: '🏗️', descricao: 'Construção ou reparo de cercas' },
  { value: 'ASSISTENCIA_VETERINARIA', label: 'Assistência Veterinária', icon: '🐄', descricao: 'Atendimento veterinário para rebanho' },
  { value: 'TERRAPLANAGEM', label: 'Terraplanagem', icon: '⛏️', descricao: 'Nivelamento e movimentação de terra' },
  { value: 'ARMAZENAGEM', label: 'Armazenagem', icon: '🏚️', descricao: 'Armazenamento de grãos e insumos' },
  { value: 'APLICACAO_FERTILIZANTES', label: 'Aplicação de Fertilizantes', icon: '🌍', descricao: 'Aplicação mecanizada de fertilizantes' },
  { value: 'CONTROLE_PRAGAS', label: 'Controle de Pragas', icon: '🐛', descricao: 'Controle integrado de pragas e doenças' },
  { value: 'CAPINA', label: 'Capina/Roçagem', icon: '🌿', descricao: 'Limpeza e roçagem de áreas' },
  { value: 'OUTROS', label: 'Outros', icon: '📋', descricao: 'Outros serviços rurais' },
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
