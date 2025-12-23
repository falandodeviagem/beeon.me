# ✅ Checklist de Tarefas Finais - BeeOn.me

**Status do Projeto**: 90% Concluído  
**Tarefas Restantes**: 15-20 horas de trabalho  
**Prioridade**: Alta → Média → Baixa

---

## 🔴 PRIORIDADE ALTA (Obrigatório)

### 1. Corrigir Warning TypeScript ⏱️ 30min
**Arquivo**: `server/routers.ts` (linha 1225)  
**Erro**: `Expected 3 arguments, but got 4`

**Passos**:
```bash
# 1. Verificar assinatura da função
cat server/db.ts | grep -A 10 "export async function sendMessage"

# 2. Limpar cache TypeScript
rm -rf node_modules/.cache
rm -rf node_modules/.vite

# 3. Reiniciar servidor
pnpm dev

# 4. Se persistir, ajustar tipo explicitamente
# Adicionar type assertion ou ajustar assinatura
```

**Validação**:
- [ ] `npx tsc --noEmit` sem erros
- [ ] Servidor inicia sem warnings
- [ ] Chat funciona normalmente

---

### 2. Configurar GitHub Actions Secrets ⏱️ 15min
**URL**: https://github.com/falandodeviagem/beeon.me/settings/secrets/actions

**Secrets Necessários**:
```bash
# Gerar JWT_SECRET
openssl rand -base64 32

# Adicionar no GitHub:
DATABASE_URL=mysql://user:pass@host:3306/beeonme_test
JWT_SECRET=[valor gerado acima]
```

**Validação**:
- [ ] Acessar https://github.com/falandodeviagem/beeon.me/actions
- [ ] Workflow "CI/CD" executando
- [ ] Job "test" passando (30/30 testes)
- [ ] Job "typecheck" passando
- [ ] Job "build" passando

---

### 3. Capturar Screenshots ⏱️ 1h
**Referência**: `.github/SCREENSHOTS.md`

**Screenshots Necessários** (1920x1080):
1. **feed.png** - Feed principal com posts
2. **profile.png** - Perfil com badges e progress
3. **chat.png** - Interface de chat com mensagens
4. **moderation.png** - Dashboard de moderação
5. **community.png** - Página de comunidade

**Passos**:
```bash
# 1. Iniciar servidor
pnpm dev

# 2. Acessar http://localhost:3000
# 3. Fazer login via Manus OAuth
# 4. Popular dados (criar posts, badges, etc)
# 5. Capturar screenshots
# 6. Salvar em .github/screenshots/
```

**Atualizar README.md**:
```markdown
## 📸 Screenshots

### Feed Principal
![Feed](.github/screenshots/feed.png)

### Perfil com Badges
![Profile](.github/screenshots/profile.png)

### Chat em Tempo Real
![Chat](.github/screenshots/chat.png)

### Dashboard de Moderação
![Moderation](.github/screenshots/moderation.png)

### Página de Comunidade
![Community](.github/screenshots/community.png)
```

**Validação**:
- [ ] 5 screenshots salvos em `.github/screenshots/`
- [ ] README.md atualizado
- [ ] Imagens carregando no GitHub
- [ ] Commit e push realizados

---

### 4. Configurar Ambiente de Staging ⏱️ 2-3h
**Plataforma Sugerida**: Vercel ou Railway

#### Opção A: Vercel (Recomendado)

**Passos**:
```bash
# 1. Criar conta em vercel.com
# 2. Instalar CLI
pnpm add -g vercel

# 3. Deploy
vercel

# 4. Configurar variáveis de ambiente
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add VITE_APP_ID
# ... (todas as variáveis do .env.example)

# 5. Deploy para staging
vercel --prod
```

**Configurações**:
- Build Command: `pnpm build`
- Output Directory: `dist`
- Install Command: `pnpm install`
- Node Version: 22.x

#### Opção B: Railway

**Passos**:
```bash
# 1. Criar conta em railway.app
# 2. Criar novo projeto
# 3. Conectar GitHub repo
# 4. Configurar variáveis de ambiente
# 5. Deploy automático
```

**Validação**:
- [ ] URL de staging funcionando
- [ ] Login OAuth funcionando
- [ ] Upload de imagens funcionando
- [ ] Stripe checkout funcionando (test mode)
- [ ] Chat em tempo real funcionando
- [ ] Sem erros no console

---

### 5. Configurar Ambiente de Produção ⏱️ 3-4h
**Domínio**: beeon.me (ou subdomínio)

**Checklist de Configuração**:

#### Banco de Dados
- [ ] Criar banco MySQL/TiDB de produção
- [ ] Executar migrações: `pnpm db:push`
- [ ] Configurar backups automáticos
- [ ] Testar connection string

#### S3 Bucket
- [ ] Criar bucket de produção
- [ ] Configurar CORS
- [ ] Configurar lifecycle policies
- [ ] Testar upload

#### Stripe
- [ ] Ativar modo produção
- [ ] Configurar webhook de produção
- [ ] Testar checkout
- [ ] Configurar produtos/preços

#### Deploy
- [ ] Configurar domínio customizado
- [ ] Configurar SSL/HTTPS
- [ ] Configurar variáveis de ambiente
- [ ] Deploy para produção
- [ ] Smoke tests

**Validação**:
- [ ] Site acessível via domínio
- [ ] HTTPS funcionando
- [ ] Todas as funcionalidades testadas
- [ ] Performance aceitável (Lighthouse >80)
- [ ] Sem erros no Sentry/logs

---

## 🟡 PRIORIDADE MÉDIA (Recomendado)

### 6. Otimizar Performance ⏱️ 2-3h

#### Lazy Loading
```typescript
// client/src/App.tsx
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/UserProfile'));
const Messages = lazy(() => import('./pages/Messages'));
// ... outros
```

#### Code Splitting
```bash
# Analisar bundle
pnpm build
npx vite-bundle-visualizer

# Identificar chunks grandes
# Dividir em chunks menores
```

#### Otimizar Imagens
```typescript
// Adicionar lazy loading
<img loading="lazy" src={url} alt={alt} />

// Usar WebP quando possível
// Comprimir imagens antes de upload
```

**Validação**:
- [ ] Lighthouse Performance >80
- [ ] First Contentful Paint <2s
- [ ] Time to Interactive <3s
- [ ] Bundle size <500KB (gzipped)

---

### 7. Implementar SEO Básico ⏱️ 1-2h

#### Meta Tags
```html
<!-- client/index.html -->
<head>
  <title>BeeOn.me - Rede Social de Comunidades</title>
  <meta name="description" content="Conecte-se, crie comunidades e ganhe recompensas no BeeOn.me">
  <meta property="og:title" content="BeeOn.me">
  <meta property="og:description" content="Rede social focada em comunidades">
  <meta property="og:image" content="https://beeon.me/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
</head>
```

#### Sitemap
```typescript
// server/routes/sitemap.ts
export function generateSitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://beeon.me/</loc></url>
  <url><loc>https://beeon.me/communities</loc></url>
  <!-- ... -->
</urlset>`;
}
```

#### Robots.txt
```
# public/robots.txt
User-agent: *
Allow: /
Sitemap: https://beeon.me/sitemap.xml
```

**Validação**:
- [ ] Meta tags presentes
- [ ] Open Graph funcionando (testar com https://opengraph.xyz)
- [ ] Sitemap.xml acessível
- [ ] Robots.txt configurado
- [ ] Google Search Console configurado

---

### 8. Adicionar Monitoramento ⏱️ 1-2h

#### Sentry (Error Tracking)
```bash
pnpm add @sentry/react @sentry/node

# client/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

#### Google Analytics
```html
<!-- client/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Validação**:
- [ ] Sentry capturando erros
- [ ] Google Analytics rastreando pageviews
- [ ] Dashboards configurados

---

### 9. Adicionar Badge de CI no README ⏱️ 5min

```markdown
# BeeOn.me

[![CI/CD](https://github.com/falandodeviagem/beeon.me/workflows/CI%2FCD/badge.svg)](https://github.com/falandodeviagem/beeon.me/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

...
```

**Validação**:
- [ ] Badge aparecendo no README
- [ ] Badge mostrando status correto (passing/failing)

---

## 🟢 PRIORIDADE BAIXA (Opcional)

### 10. Configurar ESLint ⏱️ 1h

```bash
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error"
  }
}

# Adicionar script
"lint": "eslint . --ext .ts,.tsx"
```

**Validação**:
- [ ] `pnpm lint` executando
- [ ] Warnings corrigidos
- [ ] CI executando lint

---

### 11. Adicionar Testes E2E ⏱️ 3-4h

```bash
pnpm add -D @playwright/test

# tests/e2e/auth.spec.ts
test('user can login', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Entrar');
  // ...
});
```

**Validação**:
- [ ] Testes E2E escritos
- [ ] Testes passando localmente
- [ ] CI executando E2E tests

---

### 12. Implementar PWA ⏱️ 2h

```bash
pnpm add -D vite-plugin-pwa

# vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'BeeOn.me',
        short_name: 'BeeOn',
        theme_color: '#f97316',
      }
    })
  ]
});
```

**Validação**:
- [ ] Service worker registrado
- [ ] Manifest.json configurado
- [ ] App instalável no mobile

---

## 📊 Resumo de Horas

| Prioridade | Tarefa | Tempo Estimado |
|------------|--------|----------------|
| 🔴 Alta | 1. Corrigir TypeScript | 0.5h |
| 🔴 Alta | 2. GitHub Actions | 0.25h |
| 🔴 Alta | 3. Screenshots | 1h |
| 🔴 Alta | 4. Staging | 2-3h |
| 🔴 Alta | 5. Produção | 3-4h |
| 🟡 Média | 6. Performance | 2-3h |
| 🟡 Média | 7. SEO | 1-2h |
| 🟡 Média | 8. Monitoramento | 1-2h |
| 🟡 Média | 9. Badge CI | 0.1h |
| 🟢 Baixa | 10. ESLint | 1h |
| 🟢 Baixa | 11. Testes E2E | 3-4h |
| 🟢 Baixa | 12. PWA | 2h |

**Total Mínimo** (Alta): 7-9 horas  
**Total Recomendado** (Alta + Média): 12-17 horas  
**Total Completo** (Todas): 18-26 horas

---

## ✅ Checklist Final de Entrega

### Código
- [ ] Warning TypeScript corrigido
- [ ] Todos os testes passando (30/30)
- [ ] Código revisado e limpo
- [ ] Sem console.logs desnecessários
- [ ] Commits com mensagens claras

### Documentação
- [ ] README.md com screenshots
- [ ] CHANGELOG.md atualizado
- [ ] .env.example completo
- [ ] Badge de CI adicionado

### Ambientes
- [ ] Staging configurado e testado
- [ ] Produção configurado e testado
- [ ] URLs documentadas
- [ ] Credenciais seguras (1Password, etc)

### Performance
- [ ] Lighthouse score >80
- [ ] Bundle otimizado
- [ ] Imagens otimizadas
- [ ] Lazy loading implementado

### SEO
- [ ] Meta tags configuradas
- [ ] Sitemap.xml criado
- [ ] Robots.txt configurado
- [ ] Open Graph testado

### Monitoramento
- [ ] Sentry configurado
- [ ] Google Analytics configurado
- [ ] Logs centralizados

### Testes
- [ ] CI/CD funcionando
- [ ] Smoke tests em produção
- [ ] Funcionalidades críticas testadas

---

## 📞 Próximos Passos

1. **Revisar este checklist** com o desenvolvedor contratado
2. **Priorizar tarefas** baseado em deadline
3. **Acompanhar progresso** semanalmente
4. **Testar em staging** antes de produção
5. **Launch** 🚀

**Dúvidas?** Consultar `DEV_BRIEFING.md` ou entrar em contato.
