# 📋 Briefing Técnico - BeeOn.me

**Para**: Desenvolvedor Contratado  
**De**: falandodeviagem  
**Data**: Janeiro 2025  
**Projeto**: BeeOn.me - Rede Social MVP

---

## 🎯 Visão Geral do Projeto

**BeeOn.me** é uma rede social completa focada em comunidades, gamificação e monetização. O projeto está **90% concluído** e precisa de ajustes finais, correções de bugs e configuração de ambientes de produção.

### Status Atual
- ✅ **30+ funcionalidades implementadas** (ver README.md)
- ✅ **30 testes automatizados** (100% passando)
- ✅ **Sistema de badges automáticos** funcionando
- ✅ **Chat em tempo real** com WebSocket
- ✅ **Dashboard de moderação** completo
- ✅ **Monetização via Stripe** integrada
- ⚠️ **1 warning TypeScript** (linha 1225 do routers.ts - não crítico)
- ⚠️ **Screenshots faltando** no README
- ⚠️ **Ambientes de produção** não configurados

---

## 📂 Acesso ao Código

### Repositório GitHub
**URL**: https://github.com/falandodeviagem/beeon.me

### Como Clonar
```bash
git clone https://github.com/falandodeviagem/beeon.me.git
cd beeon.me
pnpm install
```

### Documentação Disponível
- `README.md` - Documentação completa do projeto
- `CONTRIBUTING.md` - Guia de contribuição e padrões
- `.github/SCREENSHOTS.md` - Instruções para screenshots
- `DEV_BRIEFING.md` - Este documento

---

## 🛠️ Stack Tecnológica

### Frontend
- **React 19** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **shadcn/ui** - Componentes UI (30+ componentes)
- **Wouter** - Roteamento
- **tRPC React Query** - Client API
- **date-fns** - Manipulação de datas

### Backend
- **Node.js 22** - Runtime
- **Express 4** - Framework web
- **tRPC 11** - API type-safe
- **Drizzle ORM** - ORM TypeScript
- **MySQL/TiDB** - Banco de dados (15 tabelas)
- **WebSocket** - Chat em tempo real
- **JWT** - Autenticação

### Integrações
- **Manus OAuth** - Autenticação
- **AWS S3** - Upload de arquivos
- **Stripe** - Pagamentos
- **Vitest** - Testes

### Ferramentas
- **pnpm** - Gerenciador de pacotes
- **GitHub Actions** - CI/CD
- **ESLint** - Linting (não configurado ainda)

---

## 📋 Tarefas Prioritárias

### 🔴 Críticas (Fazer Primeiro)

#### 1. Corrigir Warning TypeScript
**Arquivo**: `server/routers.ts` (linha 1225)  
**Erro**: `Expected 3 arguments, but got 4`  
**Contexto**: Função `sendMessage` no procedure `messages.send`  
**Causa**: Cache do compilador TypeScript reportando erro incorreto  
**Solução Sugerida**:
- Verificar assinatura da função `sendMessage` em `server/db.ts`
- Confirmar que aceita 4 argumentos (senderId, receiverId, content, imageUrl?)
- Limpar cache TypeScript: `rm -rf node_modules/.cache`
- Reiniciar servidor: `pnpm dev`

#### 2. Configurar Secrets no GitHub Actions
**Objetivo**: Fazer CI/CD funcionar  
**Passos**:
1. Acessar: https://github.com/falandodeviagem/beeon.me/settings/secrets/actions
2. Adicionar secrets:
   - `DATABASE_URL` - Connection string MySQL de teste
   - `JWT_SECRET` - Secret para testes (gerar com `openssl rand -base64 32`)
   - `VITE_APP_ID` - ID da aplicação Manus (opcional)
3. Verificar workflow em: https://github.com/falandodeviagem/beeon.me/actions

#### 3. Capturar Screenshots
**Objetivo**: Completar documentação visual  
**Referência**: `.github/SCREENSHOTS.md`  
**Screenshots necessários** (5):
1. Feed principal (/)
2. Perfil com badges (/profile/:userId)
3. Chat (/messages)
4. Dashboard de moderação (/moderation)
5. Página de comunidade (/community/:id)

**Passos**:
1. Iniciar servidor: `pnpm dev`
2. Acessar http://localhost:3000
3. Fazer login via Manus OAuth
4. Navegar e capturar screenshots (1920x1080)
5. Salvar em `.github/screenshots/`
6. Atualizar README.md (remover comentários HTML)

### 🟡 Importantes (Fazer em Seguida)

#### 4. Configurar Ambiente de Staging
**Objetivo**: Ambiente de testes antes de produção  
**Plataforma Sugerida**: Vercel, Railway ou Render  
**Passos**:
1. Criar conta na plataforma escolhida
2. Conectar repositório GitHub
3. Configurar variáveis de ambiente
4. Deploy automático em cada push para `develop`
5. Testar funcionalidades críticas

#### 5. Configurar Ambiente de Produção
**Objetivo**: Deploy final para usuários  
**Domínio**: beeon.me (ou subdomínio)  
**Plataforma Sugerida**: Vercel (frontend) + Railway (backend)  
**Passos**:
1. Configurar domínio customizado
2. Configurar SSL/HTTPS
3. Configurar variáveis de ambiente de produção
4. Configurar banco de dados de produção (TiDB ou PlanetScale)
5. Configurar S3 bucket de produção
6. Configurar Stripe em modo produção
7. Deploy e smoke tests

#### 6. Otimizar Performance
**Objetivo**: Melhorar velocidade e UX  
**Tarefas**:
- [ ] Lazy loading de rotas (React.lazy)
- [ ] Otimizar imagens (WebP, compressão)
- [ ] Code splitting
- [ ] Cache de queries tRPC
- [ ] Otimizar bundle size (análise com `pnpm build --analyze`)
- [ ] Adicionar service worker (PWA)

#### 7. Implementar SEO Básico
**Objetivo**: Melhorar indexação Google  
**Tarefas**:
- [ ] Meta tags (title, description, og:image)
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Schema.org markup
- [ ] Open Graph tags
- [ ] Twitter Cards

### 🟢 Desejáveis (Se Houver Tempo)

#### 8. Configurar Monitoramento
**Objetivo**: Rastrear erros e performance  
**Ferramentas Sugeridas**:
- **Sentry** - Error tracking
- **Google Analytics** - Analytics
- **LogRocket** - Session replay

#### 9. Adicionar ESLint
**Objetivo**: Padronizar código  
**Passos**:
1. Instalar: `pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin`
2. Criar `.eslintrc.json`
3. Adicionar script: `"lint": "eslint . --ext .ts,.tsx"`
4. Corrigir warnings

#### 10. Melhorar Testes
**Objetivo**: Aumentar cobertura  
**Tarefas**:
- [ ] Adicionar testes E2E com Playwright
- [ ] Aumentar cobertura para 80%+
- [ ] Adicionar testes de integração para Stripe
- [ ] Adicionar testes de performance

---

## 🐛 Bugs Conhecidos

### 1. Loop Infinito em FeedFilters (RESOLVIDO)
**Status**: ✅ Corrigido  
**Commit**: 44beff70  
**Descrição**: useEffect duplicado causava loop infinito

### 2. Warning TypeScript em routers.ts
**Status**: ⚠️ Pendente  
**Linha**: 1225  
**Descrição**: Cache reportando erro incorreto  
**Impacto**: Baixo (não afeta runtime)

### 3. Erro 429 (Rate Limit)
**Status**: ✅ Resolvido  
**Causa**: Loop infinito (corrigido)  
**Prevenção**: Evitar useEffect sem dependencies

---

## 📚 Recursos e Documentação

### Documentação Oficial
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **tRPC**: https://trpc.io/docs/
- **Drizzle ORM**: https://orm.drizzle.team/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs/
- **shadcn/ui**: https://ui.shadcn.com/

### Código de Referência
- **Badges System**: `server/badges/` (definitions, checker, progress)
- **Chat**: `client/src/pages/Messages.tsx` + `server/routers.ts` (messages.*)
- **Moderação**: `client/src/pages/Moderation.tsx` + `server/routers.ts` (moderation.*)
- **Stripe**: `server/routers.ts` (stripe.*) + `server/_core/stripe.ts`

### Testes
- **Unitários**: `server/badges.test.ts`, `server/badges/progress.test.ts`
- **Integração**: `server/badges.integration.test.ts`
- **Executar**: `pnpm test`

---

## 🔐 Credenciais e Acessos

### O Que Você Precisa Solicitar

1. **Repositório GitHub**
   - Acesso de colaborador ao repo
   - Permissões de push/PR

2. **Banco de Dados**
   - Connection string de desenvolvimento
   - Connection string de staging (se aplicável)
   - Connection string de produção

3. **AWS S3**
   - Access Key ID
   - Secret Access Key
   - Bucket name
   - Region

4. **Manus OAuth**
   - App ID
   - OAuth Server URL
   - Portal URL

5. **Stripe**
   - Secret Key (test mode)
   - Publishable Key (test mode)
   - Webhook Secret
   - Link para claim sandbox

6. **Domínio**
   - Acesso ao DNS (Cloudflare, Route53, etc)
   - Credenciais de configuração

### Como Configurar Localmente

1. **Clonar repositório**
```bash
git clone https://github.com/falandodeviagem/beeon.me.git
cd beeon.me
```

2. **Instalar dependências**
```bash
pnpm install
```

3. **Configurar .env**
```bash
cp .env.example .env
# Editar .env com credenciais fornecidas
```

4. **Executar migrações**
```bash
pnpm db:push
```

5. **Iniciar servidor**
```bash
pnpm dev
```

6. **Acessar aplicação**
```
http://localhost:3000
```

---

## 📞 Comunicação

### Canais
- **GitHub Issues**: Reportar bugs e sugerir features
- **GitHub Discussions**: Discussões técnicas
- **Email**: falandodeviagem@users.noreply.github.com
- **Reuniões**: A combinar (Zoom, Google Meet)

### Frequência de Updates
- **Daily standups**: Não obrigatório
- **Updates semanais**: Recomendado
- **PRs**: Revisar em até 24h

### Processo de Aprovação
1. Criar branch `feature/*` ou `fix/*`
2. Fazer alterações e commits
3. Abrir Pull Request
4. Aguardar review e aprovação
5. Merge para `main`

---

## ✅ Checklist de Entrega

### Antes de Considerar Concluído

- [ ] Warning TypeScript corrigido
- [ ] Todos os testes passando (30/30)
- [ ] CI/CD funcionando no GitHub Actions
- [ ] Screenshots adicionados ao README
- [ ] Ambiente de staging configurado e testado
- [ ] Ambiente de produção configurado
- [ ] Performance otimizada (Lighthouse score 80+)
- [ ] SEO básico implementado
- [ ] Documentação atualizada
- [ ] Código revisado e limpo
- [ ] Sem console.logs ou TODOs no código
- [ ] Variáveis de ambiente documentadas
- [ ] Backup do banco de dados configurado

### Entregáveis Finais

1. **Código**
   - Repositório GitHub atualizado
   - Todos os commits com mensagens claras
   - PRs revisados e mergeados

2. **Ambientes**
   - URL de staging funcionando
   - URL de produção funcionando
   - Credenciais documentadas (1Password, Notion, etc)

3. **Documentação**
   - README.md atualizado
   - CHANGELOG.md com mudanças
   - Guia de deploy (se aplicável)
   - Runbook para troubleshooting

4. **Testes**
   - Todos os testes passando
   - Cobertura de código >70%
   - Smoke tests em produção

---

## 🚨 Pontos de Atenção

### Não Alterar Sem Consultar
- ❌ Estrutura de banco de dados (schema.ts)
- ❌ Sistema de autenticação OAuth
- ❌ Integração Stripe (já funcionando)
- ❌ Sistema de badges (lógica complexa)

### Pode Alterar Livremente
- ✅ Estilos CSS/Tailwind
- ✅ Componentes UI
- ✅ Textos e copywriting
- ✅ Otimizações de performance
- ✅ Adicionar testes

### Pedir Aprovação Antes
- ⚠️ Mudanças na API (procedures tRPC)
- ⚠️ Mudanças no fluxo de autenticação
- ⚠️ Adicionar novas dependências grandes
- ⚠️ Mudanças no schema do banco

---

## 📊 Métricas de Sucesso

### Performance
- Lighthouse Performance: >80
- First Contentful Paint: <2s
- Time to Interactive: <3s
- Bundle size: <500KB (gzipped)

### Qualidade
- Testes passando: 100%
- Cobertura de código: >70%
- Zero warnings TypeScript
- Zero console errors

### Funcionalidade
- Todas as features funcionando
- Chat em tempo real sem lag
- Upload de imagens <5s
- Stripe checkout funcionando

---

## 🎯 Prazo e Milestones

### Semana 1
- [ ] Setup e familiarização com código
- [ ] Corrigir warning TypeScript
- [ ] Configurar CI/CD
- [ ] Capturar screenshots

### Semana 2
- [ ] Configurar staging
- [ ] Otimizar performance
- [ ] Implementar SEO básico
- [ ] Adicionar testes faltantes

### Semana 3
- [ ] Configurar produção
- [ ] Deploy final
- [ ] Smoke tests
- [ ] Documentação final

### Semana 4 (Buffer)
- [ ] Ajustes finais
- [ ] Correções de bugs
- [ ] Handoff e treinamento

---

## 📞 Contato

**Dúvidas?** Entre em contato:
- Email: falandodeviagem@users.noreply.github.com
- GitHub: @falandodeviagem

**Boa sorte e bom código! 🚀**
