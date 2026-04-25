# Tokenization OS Brasil - Dominio de Dados Inicial

## Objetivo

Definir um modelo de dados inicial para o MVP sem acoplar o produto cedo demais a uma tese especifica de blockchain ou a uma unica estrutura juridica.

## Principios

- modelar `operacao` antes de modelar `token`
- modelar `participacao` antes de modelar `liquidez`
- modelar `evento` antes de modelar automacao on-chain
- manter linguagem neutra entre credito, cota, fracao ou direito economico

## Entidades iniciais

## 1. Organization

Representa a empresa ou parceiro operador dentro da plataforma.

Campos sugeridos:

- id
- nome
- slug
- tipo
- logotipoUrl
- corPrimaria
- createdAt
- updatedAt

## 2. User

Usuario autenticado do sistema.

Campos sugeridos:

- id
- email
- nome
- avatarUrl
- status
- createdAt
- updatedAt

## 3. Membership

Vinculo entre usuario e organizacao.

Campos sugeridos:

- id
- organizationId
- userId
- role
- createdAt

Roles iniciais:

- OWNER
- ADMIN
- OPERATOR
- PARTNER_VIEWER
- INVESTOR

## 4. Offering

Operacao, oferta ou estrutura principal.

Campos sugeridos:

- id
- organizationId
- nome
- slug
- tipo
- status
- resumo
- moeda
- ticketMinimo
- targetRaise
- openedAt
- closedAt
- createdAt
- updatedAt

Status iniciais:

- DRAFT
- UNDER_REVIEW
- READY
- ACTIVE
- CLOSED
- SETTLED
- ARCHIVED

## 5. Asset

Ativo ou lastro vinculado a uma operacao.

Campos sugeridos:

- id
- offeringId
- nome
- categoria
- descricao
- origem
- valuationReference
- metadataJson
- createdAt
- updatedAt

## 6. Document

Documento do data room.

Campos sugeridos:

- id
- offeringId
- assetId
- nome
- categoria
- storageKey
- mimeType
- visibilidade
- status
- version
- uploadedById
- createdAt

Categorias iniciais:

- TERM_SHEET
- LEGAL
- ASSET_EVIDENCE
- INVESTOR_MATERIAL
- REPORT
- OTHER

Visibilidades iniciais:

- INTERNAL
- PARTNER
- INVESTOR

## 7. InvestorProfile

Perfil do investidor.

Campos sugeridos:

- id
- organizationId
- userId
- nomeCompleto
- email
- telefone
- taxId
- onboardingStatus
- notes
- createdAt
- updatedAt

## 8. Allocation

Participacao de um investidor em uma operacao.

Campos sugeridos:

- id
- offeringId
- investorProfileId
- className
- investedAmount
- quantity
- unitPrice
- status
- subscribedAt
- settledAt
- createdAt
- updatedAt

Status iniciais:

- PENDING
- RESERVED
- CONFIRMED
- CANCELLED
- SETTLED

## 9. OfferingEvent

Evento da operacao.

Campos sugeridos:

- id
- offeringId
- tipo
- titulo
- descricao
- effectiveAt
- visibility
- createdById
- createdAt

Tipos iniciais:

- OPERATION_CREATED
- DOCUMENT_APPROVED
- INVESTOR_ADDED
- ALLOCATION_CONFIRMED
- DISTRIBUTION_RECORDED
- NOTICE_PUBLISHED
- STATUS_CHANGED

## 10. ComplianceLog

Log de acao relevante.

Campos sugeridos:

- id
- organizationId
- actorUserId
- entityType
- entityId
- action
- payloadJson
- createdAt

## 11. Distribution

Registro de evento economico de distribuicao.

Campos sugeridos:

- id
- offeringId
- referencePeriod
- grossAmount
- netAmount
- status
- createdAt

## 12. DistributionEntry

Detalhe da distribuicao por participacao.

Campos sugeridos:

- id
- distributionId
- allocationId
- amount
- status

## Relacionamentos centrais

- Organization 1:N Membership
- Organization 1:N Offering
- Organization 1:N InvestorProfile
- User 1:N Membership
- User 1:N ComplianceLog
- Offering 1:N Asset
- Offering 1:N Document
- Offering 1:N Allocation
- Offering 1:N OfferingEvent
- Offering 1:N Distribution
- InvestorProfile 1:N Allocation
- Distribution 1:N DistributionEntry

## Decisoes importantes

### 1. Nao usar Token como entidade central agora

Motivo:
o MVP precisa suportar diferentes enquadramentos. A entidade `Allocation` cobre melhor a realidade inicial.

### 2. Nao misturar User com InvestorProfile

Motivo:
nem todo investidor vai nascer como usuario completo da plataforma. O perfil pode existir antes do acesso.

### 3. Offering e mais importante que Asset

Motivo:
o negocio gira em torno da operacao estruturada, nao apenas do lastro.

## Proxima traducao tecnica

Este documento ja permite a proxima etapa:

- converter o dominio para Prisma
- criar migrations
- montar seeds
- desenhar as telas por entidade
