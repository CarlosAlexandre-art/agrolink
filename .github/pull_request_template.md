## O que muda

<!-- Descreva o que foi implementado ou corrigido. Uma frase clara. -->

## Por que muda

<!-- Contexto: qual problema resolve? qual feature entrega? -->

## Checklist

### Segurança
- [ ] Nenhuma chave de API exposta no código ou via `NEXT_PUBLIC_`
- [ ] Rotas novas com input externo têm validação (Zod ou manual)
- [ ] Rotas públicas novas têm rate limiting (`lib/rate-limit.ts`)
- [ ] Nenhum dado sensível (CPF, senha, token) logado no console

### Fluxo crítico (se tocou em servicos/matches/pagamento)
- [ ] Li todos os arquivos envolvidos no fluxo `solicitar → match → proposta → aceitar → executar → concluir`
- [ ] Mapeei o impacto completo da mudança
- [ ] Testei o fluxo localmente

### Banco de dados (se tocou no schema Prisma)
- [ ] Novos campos são opcionais ou têm default
- [ ] Migration revisada e aprovada
- [ ] `npx prisma generate` rodou após a migration

### Geral
- [ ] `npm run build` passou sem erros
- [ ] Nenhum `console.log` de debug no código final
- [ ] Commit segue o padrão: `feat:`, `fix:`, `refactor:`, `chore:` em português

## Tipo de mudança

- [ ] Feature nova
- [ ] Correção de bug
- [ ] Refatoração
- [ ] Segurança
- [ ] Infraestrutura / config
