# Testes E2E - BeeOn.me

Este diretório contém os testes End-to-End (E2E) da aplicação BeeOn.me usando Playwright.

## 📋 Estrutura dos Testes

- **login.spec.ts** - Testes do fluxo de login e navegação básica
- **create-post.spec.ts** - Testes de criação de posts
- **join-community.spec.ts** - Testes de entrada em comunidades
- **accessibility.spec.ts** - Auditoria de acessibilidade

## 🚀 Como Executar

### Executar todos os testes (headless)
```bash
pnpm test:e2e
```

### Executar com interface visual
```bash
pnpm test:e2e:ui
```

### Executar com navegador visível
```bash
pnpm test:e2e:headed
```

### Executar em modo debug
```bash
pnpm test:e2e:debug
```

### Executar um teste específico
```bash
pnpm test:e2e login.spec.ts
```

## 📊 Relatórios

Após executar os testes, um relatório HTML será gerado automaticamente. Para visualizá-lo:

```bash
pnpm exec playwright show-report
```

## 🔍 Debugging

Para debugar um teste específico:

1. Adicione `test.only()` no teste que deseja debugar
2. Execute: `pnpm test:e2e:debug`
3. O Playwright Inspector será aberto

## 📝 Notas Importantes

### Autenticação

Os testes que requerem autenticação (criar post, entrar em comunidade) assumem que o usuário já está logado. Em um ambiente de CI/CD, você precisará:

1. Criar um usuário de teste
2. Fazer login programaticamente
3. Salvar o estado de autenticação
4. Reutilizar em outros testes

Exemplo:

```typescript
// auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  // Login logic here
  await page.goto('/login');
  // ... login steps
  
  // Save authentication state
  await page.context().storageState({ path: 'auth.json' });
});
```

### CI/CD

Para executar em CI/CD, adicione ao seu workflow:

```yaml
- name: Install Playwright
  run: pnpm exec playwright install --with-deps

- name: Run E2E tests
  run: pnpm test:e2e
```

## ✅ Cobertura Atual

- ✅ Navegação básica
- ✅ Acessibilidade (ARIA, contraste, foco)
- ✅ Estrutura de páginas
- ✅ Formulários
- ⚠️ Fluxos autenticados (requerem setup)
- ⚠️ Integração com pagamentos (requer mock)

## 🎯 Próximos Passos

1. Adicionar setup de autenticação
2. Adicionar testes de comentários
3. Adicionar testes de reações
4. Adicionar testes de mensagens diretas
5. Adicionar testes de moderação
6. Adicionar testes de performance (Lighthouse)
