# Tokenization OS Brasil - Backlog Inicial

## Prioridade P0 - Fundacao do MVP

### BL-001. Definir dominio inicial do produto

Objetivo:
fixar entidades, nomenclatura e fronteiras do MVP.

Entregas:

- glossario de termos
- mapa de entidades
- naming padrao

### BL-002. Criar area autenticada do produto

Objetivo:
separar o novo produto do restante da app.

Entregas:

- layout dedicado
- navegacao base
- dashboard vazio

### BL-003. Modelar organizacoes e membros

Objetivo:
permitir estrutura B2B multi-organizacao.

Entregas:

- Organization
- Membership
- papeis iniciais

### BL-004. Modelar operacoes

Objetivo:
permitir cadastro e acompanhamento de ofertas ou operacoes.

Entregas:

- entidade de Offering
- status basicos
- relacionamento com organization

### BL-005. Modelar ativos

Objetivo:
registrar ativo ou lastro da operacao.

Entregas:

- entidade Asset
- campos descritivos
- vinculo com offering

### BL-006. Modulo de documentos

Objetivo:
substituir data room improvisado.

Entregas:

- upload
- categoria
- status
- listagem por operacao

### BL-007. Modulo de investidores

Objetivo:
organizar base de investidores do piloto.

Entregas:

- InvestorProfile
- dados de contato
- status de onboarding

### BL-008. Modulo de participacoes

Objetivo:
registrar a fatia economica do investidor na operacao.

Entregas:

- Allocation
- valor
- quantidade
- status

### BL-009. Modulo de eventos

Objetivo:
dar historico vivo para a operacao.

Entregas:

- OfferingEvent
- tipos basicos
- timeline

### BL-010. Log de compliance

Objetivo:
rastrear acoes do sistema e dos operadores.

Entregas:

- ComplianceLog
- autor, acao, alvo, timestamp

## Prioridade P1 - Interface vendavel

### BL-011. Dashboard do admin

Mostrar:

- operacoes ativas
- pendencias
- investidores
- proximos eventos

### BL-012. Lista de operacoes

Mostrar:

- nome
- parceiro
- status
- progresso documental

### BL-013. Pagina de detalhe da operacao

Mostrar:

- resumo
- documentos
- investidores
- participacoes
- eventos

### BL-014. Portal do investidor

Mostrar:

- minhas participacoes
- documentos liberados
- historico de eventos

### BL-015. White-label basico

Entregas:

- nome da organizacao
- cor primaria
- logotipo

## Prioridade P2 - Operacao mais forte

### BL-016. Checklists configuraveis

Permitir:

- checklist juridico
- checklist documental
- progresso por etapa

### BL-017. Comunicados internos

Permitir:

- registrar comunicado
- exibir no portal
- marcar audiencia alvo

### BL-018. Extrato simples

Permitir:

- listar eventos financeiros
- exibir saldo historico

### BL-019. Controle de visibilidade de documentos

Permitir:

- interno
- parceiro
- investidor

### BL-020. Filtros e busca

Permitir:

- buscar operacoes
- buscar investidores
- filtrar por status

## Prioridade P3 - Preparacao para escala

### BL-021. API externa para parceiros

Objetivo:
integrar originação e sistemas terceiros.

### BL-022. Ledger interno

Objetivo:
preparar base para registry mais robusto.

### BL-023. Camada de token registry

Objetivo:
espelhar eventos ou titularidade on-chain quando fizer sentido.

### BL-024. Ambientes fechados de transferencia

Objetivo:
explorar mecanismos de transferencia controlada, somente apos desenho regulatorio.

## Sprints sugeridas

## Sprint 1

- BL-001
- BL-002
- BL-003
- BL-004
- BL-005

## Sprint 2

- BL-006
- BL-007
- BL-008
- BL-009
- BL-010

## Sprint 3

- BL-011
- BL-012
- BL-013
- BL-014
- BL-015

## Sprint 4

- BL-016
- BL-017
- BL-018
- BL-019
- BL-020

## Ordem de venda

O produto fica comercialmente apresentavel ja no fim da Sprint 3.

Se precisarmos encurtar ainda mais:

- fechar Sprint 1 e 2
- fazer uma camada visual minima da Sprint 3
- vender piloto assistido
