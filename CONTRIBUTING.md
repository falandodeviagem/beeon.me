# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o **BeeOn.me**! Este documento fornece diretrizes para garantir que o processo de contribuição seja claro e eficiente para todos.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Commits e Mensagens](#commits-e-mensagens)
- [Pull Requests](#pull-requests)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Funcionalidades](#sugerir-funcionalidades)

## 📜 Código de Conduta

Este projeto adota um Código de Conduta que esperamos que todos os participantes sigam. Por favor, leia o código completo para entender quais ações serão e não serão toleradas.

### Nossos Padrões

- ✅ Usar linguagem acolhedora e inclusiva
- ✅ Respeitar pontos de vista e experiências diferentes
- ✅ Aceitar críticas construtivas com graça
- ✅ Focar no que é melhor para a comunidade
- ✅ Mostrar empatia com outros membros da comunidade

## 🚀 Como Posso Contribuir?

### Reportar Bugs

Bugs são rastreados como [GitHub Issues](https://github.com/falandodeviagem/beeon.me/issues). Antes de criar um issue:

1. **Verifique se o bug já foi reportado** - Procure nos issues existentes
2. **Determine qual repositório** - Se você não tiver certeza, use este
3. **Colete informações** - Quanto mais detalhes, melhor

**Template de Bug Report:**

```markdown
**Descrição do Bug**
Uma descrição clara e concisa do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
O que você esperava que acontecesse.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**
- OS: [ex: Windows 10, macOS 13]
- Browser: [ex: Chrome 120, Firefox 115]
- Node: [ex: 22.0.0]
```

### Sugerir Funcionalidades

Sugestões de funcionalidades também são rastreadas como GitHub Issues.

**Template de Feature Request:**

```markdown
**A funcionalidade resolve um problema? Descreva.**
Uma descrição clara do problema. Ex: Sempre fico frustrado quando [...]

**Descreva a solução que você gostaria**
Uma descrição clara e concisa do que você quer que aconteça.

**Descreva alternativas que você considerou**
Uma descrição clara de quaisquer soluções ou funcionalidades alternativas.

**Contexto adicional**
Adicione qualquer outro contexto ou screenshots sobre a feature request.
```

### Contribuir com Código

1. **Fork o repositório**
2. **Clone seu fork**
3. **Crie uma branch** para sua feature
4. **Faça suas alterações**
5. **Escreva ou atualize testes**
6. **Commit suas mudanças**
7. **Push para sua branch**
8. **Abra um Pull Request**

## ⚙️ Configuração do Ambiente

### Pré-requisitos

- Node.js 22+
- pnpm 9+
- MySQL 8+ ou TiDB
- Conta Manus (para OAuth)
- Conta AWS (para S3)
- Conta Stripe (para pagamentos)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/falandodeviagem/beeon.me.git
cd beeon.me

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Execute as migrações
pnpm db:push

# Inicie o servidor de desenvolvimento
pnpm dev
```

### Executar Testes

```bash
# Todos os testes
pnpm test

# Testes específicos
pnpm test badges.test.ts

# Com cobertura
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## 🔧 Processo de Desenvolvimento

### Workflow de Branches

Usamos o modelo **Git Flow** simplificado:

- `main` - Código de produção estável
- `develop` - Branch de desenvolvimento (não usada ainda)
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `docs/*` - Documentação
- `refactor/*` - Refatorações
- `test/*` - Adição/atualização de testes

### Naming Conventions

**Branches:**
```
feature/nome-da-feature
fix/descricao-do-bug
docs/atualizacao-readme
refactor/componente-x
test/adicionar-testes-badges
```

**Arquivos:**
- Componentes React: `PascalCase.tsx` (ex: `BadgeGrid.tsx`)
- Utilitários: `camelCase.ts` (ex: `formatDate.ts`)
- Testes: `*.test.ts` (ex: `badges.test.ts`)
- Tipos: `types.ts` ou `*.types.ts`

**Variáveis e Funções:**
- Variáveis: `camelCase` (ex: `userBadges`)
- Funções: `camelCase` (ex: `calculateProgress`)
- Constantes: `UPPER_SNAKE_CASE` (ex: `MAX_UPLOAD_SIZE`)
- Componentes: `PascalCase` (ex: `BadgeProgress`)
- Hooks: `use` + `PascalCase` (ex: `useAuth`)

## 📝 Padrões de Código

### TypeScript

- ✅ Use TypeScript para todo código novo
- ✅ Evite `any` - use `unknown` se necessário
- ✅ Defina interfaces para objetos complexos
- ✅ Use tipos de retorno explícitos em funções públicas

```typescript
// ✅ Bom
interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): Promise<User> {
  // ...
}

// ❌ Ruim
function getUser(id: any): any {
  // ...
}
```

### React

- ✅ Use componentes funcionais com hooks
- ✅ Extraia lógica complexa para custom hooks
- ✅ Use `memo` apenas quando necessário
- ✅ Prefira composição sobre herança

```typescript
// ✅ Bom
export function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{badge.name}</CardTitle>
      </CardHeader>
    </Card>
  );
}

// ❌ Ruim
export default function BadgeCard(props: any) {
  return <div>{props.badge.name}</div>;
}
```

### tRPC

- ✅ Use `publicProcedure` para endpoints públicos
- ✅ Use `protectedProcedure` para endpoints autenticados
- ✅ Valide inputs com Zod
- ✅ Mantenha procedures pequenas e focadas

```typescript
// ✅ Bom
getUserBadges: protectedProcedure
  .input(z.object({ userId: z.number() }))
  .query(async ({ input, ctx }) => {
    return await getUserBadges(input.userId);
  }),

// ❌ Ruim
getUserBadges: publicProcedure
  .query(async ({ input }) => {
    return await getUserBadges(input.userId); // Sem validação
  }),
```

### Estilização

- ✅ Use Tailwind CSS para estilos
- ✅ Use componentes shadcn/ui quando possível
- ✅ Mantenha classes organizadas (layout → spacing → colors → typography)
- ✅ Use variáveis CSS para temas

```tsx
// ✅ Bom
<div className="flex items-center gap-4 p-4 bg-card text-card-foreground rounded-lg">

// ❌ Ruim
<div className="bg-card flex rounded-lg text-card-foreground p-4 gap-4 items-center">
```

## 💬 Commits e Mensagens

### Conventional Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit:

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de build/config

**Exemplos:**

```bash
feat(badges): adicionar sistema de progress tracking
fix(chat): corrigir loop infinito em FeedFilters
docs(readme): atualizar seção de instalação
test(badges): adicionar testes de integração
refactor(db): simplificar query getUserBadges
```

### Boas Práticas

- ✅ Use verbos no imperativo ("adicionar" não "adicionado")
- ✅ Primeira linha com no máximo 72 caracteres
- ✅ Seja descritivo mas conciso
- ✅ Referencie issues quando aplicável (#123)

## 🔄 Pull Requests

### Checklist antes de Abrir PR

- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Todos os testes passam (`pnpm test`)
- [ ] TypeScript compila sem erros (`npx tsc --noEmit`)
- [ ] Documentação foi atualizada se necessário
- [ ] Commit messages seguem Conventional Commits
- [ ] Branch está atualizada com `main`

### Template de PR

```markdown
## Descrição
Descreva suas mudanças em detalhes.

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige um issue)
- [ ] Nova funcionalidade (mudança que adiciona funcionalidade)
- [ ] Breaking change (fix ou feature que causa quebra de compatibilidade)
- [ ] Documentação

## Como Testar?
Descreva os passos para testar suas mudanças.

## Screenshots (se aplicável)
Adicione screenshots para mudanças visuais.

## Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Realizei self-review do meu código
- [ ] Comentei código em áreas complexas
- [ ] Atualizei a documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que provam que meu fix funciona
- [ ] Testes unitários novos e existentes passam localmente
```

### Processo de Review

1. **Automated Checks** - CI/CD deve passar
2. **Code Review** - Pelo menos 1 aprovação necessária
3. **Testing** - Reviewer testa localmente se necessário
4. **Merge** - Squash and merge para manter histórico limpo

## 🐛 Reportar Bugs

### Antes de Reportar

1. **Atualize para a versão mais recente**
2. **Verifique issues existentes**
3. **Colete informações de debug**

### Informações Úteis

- Versão do Node.js (`node --version`)
- Versão do pnpm (`pnpm --version`)
- Sistema operacional
- Navegador e versão
- Logs de erro completos
- Steps para reproduzir

## 💡 Sugerir Funcionalidades

Adoramos receber sugestões! Antes de sugerir:

1. **Verifique se já não existe** - Procure em issues e PRs
2. **Seja específico** - Descreva o problema que resolve
3. **Considere o escopo** - Funcionalidade se encaixa no projeto?
4. **Forneça exemplos** - Mockups, wireframes, etc.

## 📞 Contato

- **Issues**: [GitHub Issues](https://github.com/falandodeviagem/beeon.me/issues)
- **Discussions**: [GitHub Discussions](https://github.com/falandodeviagem/beeon.me/discussions)
- **Email**: falandodeviagem@users.noreply.github.com

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma [Licença MIT](LICENSE) do projeto.

---

**Obrigado por contribuir para o BeeOn.me! 🐝**
