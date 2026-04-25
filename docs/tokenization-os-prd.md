# Tokenization OS Brasil - PRD do MVP

## 1. Resumo executivo

O `Tokenization OS Brasil` nasce como uma plataforma B2B e white-label para organizar operacoes tokenizadas ou digitalmente estruturadas, sem comecar como exchange, custodiante ou ambiente aberto de negociacao.

O MVP deve resolver o problema mais caro e imediato do mercado:

- operacoes dispersas em planilhas
- documentos fora de padrao
- onboarding lento
- falta de rastreabilidade
- experiencia fraca para parceiros e investidores

## 2. Objetivo do MVP

Entregar um sistema vendavel para 1 a 3 parceiros piloto, capaz de suportar:

- cadastro e qualificacao de uma operacao
- centralizacao documental
- parametrizacao basica da estrutura
- portal do investidor white-label
- cap table inicial
- operacao de pos-oferta
- logs e trilha de compliance

## 3. O que o MVP nao e

- nao e uma corretora
- nao e uma exchange
- nao e uma infraestrutura de liquidez imediata
- nao e uma recomendacao automatica de investimento
- nao e custodia propria

## 4. Perfis de usuario

### 4.1. Admin interno

Pessoa do time operador da plataforma.

Objetivos:

- cadastrar operacoes
- acompanhar pendencias
- controlar investidores e documentos
- registrar eventos e distribuicoes

### 4.2. Parceiro estruturador

Escritorio, plataforma, securitizadora ou operador da oferta.

Objetivos:

- enviar dados do ativo
- acompanhar o fluxo
- acessar material organizado
- apresentar a operacao ao investidor final com melhor UX

### 4.3. Investidor

Usuario final da jornada white-label.

Objetivos:

- acessar documentos da operacao
- visualizar sua participacao
- acompanhar eventos e rendimentos
- baixar extratos e comprovantes

## 5. Problema que resolvemos

Hoje, uma operacao tokenizada costuma morrer em quatro pontos:

- o ativo entra mal estruturado
- a documentacao fica espalhada
- a captacao nao tem narrativa nem acompanhamento
- o pos-oferta vira trabalho manual e desorganizado

O MVP resolve exatamente esses quatro pontos.

## 6. Proposta de valor do MVP

`Em vez de construir sua stack operacional do zero, o parceiro recebe uma esteira pronta para onboarding do ativo, data room, portal do investidor, cap table e pos-oferta.`

## 7. Escopo funcional

## 7.1. Modulo de operacoes

Permite criar e acompanhar operacoes.

Funcionalidades:

- criar operacao
- definir tipo de ativo
- definir parceiro responsavel
- acompanhar status
- registrar pendencias

## 7.2. Modulo de documentos

Centraliza o data room.

Funcionalidades:

- upload de documento
- categorizacao
- status de aprovacao
- visibilidade por perfil
- historico de alteracoes

## 7.3. Modulo de investidores

Organiza a base de investidores do piloto.

Funcionalidades:

- cadastro basico
- perfil e contato
- status de onboarding
- vinculacao com operacoes
- historico de participacoes

## 7.4. Modulo de participacoes

Representa a participacao do investidor.

Funcionalidades:

- cap table simples
- quantidade ou fracao
- ticket investido
- data da entrada
- status da participacao

## 7.5. Modulo de eventos

Registra fatos da operacao.

Funcionalidades:

- aporte confirmado
- documentos liberados
- distribuicao registrada
- comunicados
- mudanca de status

## 7.6. Portal white-label

Interface para investidor final.

Funcionalidades:

- login
- dashboard do investimento
- documentos disponiveis
- historico de eventos
- extrato basico

## 7.7. Trilha de compliance

Camada de auditoria e rastreabilidade.

Funcionalidades:

- log de acoes
- registro de aprovacoes
- carimbo de data
- visao por operacao

## 8. Escopo tecnico

## 8.1. Frontend

- rota inicial de apresentacao do produto
- area autenticada para admin
- area autenticada para investidor
- componentes reutilizaveis para cards, status e listas

## 8.2. Backend

- rotas para operacoes
- rotas para documentos
- rotas para investidores
- rotas para participacoes
- rotas para eventos
- rotas para dashboard

## 8.3. Banco

Entidades iniciais:

- Organization
- User
- Membership
- Offering
- Asset
- Document
- InvestorProfile
- Allocation
- OfferingEvent
- ComplianceLog

## 9. Requisitos nao funcionais

- design claro e corporativo
- rastreabilidade de alteracoes
- separacao por organizacao
- base preparada para white-label
- nomenclatura flexivel para diferentes estruturas
- suporte a crescimento para camada on-chain futura

## 10. Fluxos criticos do MVP

## 10.1. Criar operacao

1. Admin cria a operacao
2. Define tipo, parceiro e estrutura base
3. Sistema gera status inicial
4. Equipe anexa documentos
5. Operacao fica pronta para acompanhamento

## 10.2. Onboarding de investidor

1. Admin ou parceiro cadastra investidor
2. Sistema vincula investidor a uma operacao
3. Participacao e registrada
4. Investidor acessa portal
5. Investidor acompanha documentos e eventos

## 10.3. Registrar evento da operacao

1. Admin registra evento
2. Sistema salva evento com data e autor
3. Portal exibe historico
4. Log de compliance e atualizado

## 11. Metricas de sucesso

### Produto

- tempo medio para criar uma operacao
- numero de documentos organizados por operacao
- numero de investidores ativos no portal
- numero de eventos registrados sem retrabalho manual

### Negocio

- numero de pilotos fechados
- tempo ate primeiro piloto pago
- receita de setup
- conversao de piloto para recorrencia

## 12. Critérios de aceite do MVP

- um admin consegue criar uma operacao completa
- um parceiro consegue acessar e acompanhar a operacao
- um investidor consegue entrar no portal e ver sua participacao
- documentos podem ser anexados e organizados por categoria
- eventos ficam registrados e visiveis
- toda acao relevante gera log

## 13. Riscos

- tentar incluir distribuicao regulada demais no MVP
- supermodelar token antes da operacao funcionar
- acoplamento prematuro com blockchain
- linguagem comercial agressiva demais para o estagio do produto

## 14. Decisao de escopo

O MVP deve priorizar `operacao, governanca e apresentacao`.

A frase de controle e:

`Se isso parecer exchange, corretora ou mercado secundario, saiu do MVP.`
