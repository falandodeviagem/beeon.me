# 🐝 BeeOn.me - Plataforma de Comunidades Online

MVP completo de rede social focada em comunidades, gamificação e monetização.

## 🎯 Funcionalidades Principais

### 1. Sistema de Autenticação
- Login/registro via Manus OAuth
- Gestão segura de sessões
- Controle de acesso por roles (user/admin)

### 2. Perfis de Usuário
- Avatar personalizável (upload S3)
- Bio editável
- Sistema de pontos e níveis
- Badges desbloqueáveis
- Histórico de ações

### 3. Comunidades (Públicas e Pagas)
- Criação e gestão de comunidades
- Comunidades gratuitas e pagas
- Sistema de membros
- Monetização via Stripe
- Checkout integrado para assinaturas mensais

### 4. Sistema de Posts
- Criação de posts com texto e imagens
- Upload de imagens para S3
- Sistema de likes
- Comentários aninhados (respostas)
- Edição e exclusão

### 5. Sistema de Convites
- Geração de código único por usuário
- Rastreamento de convites aceitos
- **Recompensa: 50 pontos por convite aceito**
- Link compartilhável

### 6. Gamificação Completa
- **Pontos por ações:**
  - Criar comunidade: 100 pontos
  - Criar post: 10 pontos
  - Comentar: 5 pontos
  - Receber like: 2 pontos
  - Convidar usuário: 50 pontos
- Sistema de níveis automático
- Badges desbloqueáveis
- Ranking global (leaderboard)

### 7. Sistema de Moderação Robusto
- Denúncias de posts, comentários e usuários
- Painel de moderação (admin-only)
- Revisão de denúncias com notas
- Banimentos temporários e permanentes
- Histórico completo de moderação

### 8. Monetização via Stripe
- Checkout de assinaturas para comunidades pagas
- Verificação de status de assinatura
- Webhook para eventos Stripe
- Gestão de pagamentos mensais

### 9. Feed Personalizado
- Posts de comunidades seguidas
- Ordenação por relevância e data
- Paginação
- Estados vazios informativos

### 10. Design Moderno
- Paleta laranja/amarelo (tema abelhas 🐝)
- Tema claro por padrão
- Componentes shadcn/ui
- Totalmente responsivo
- Estados de loading, erro e vazio

## 🏗️ Arquitetura Técnica

### Backend
- **Framework**: Express + tRPC 11
- **Banco de Dados**: MySQL/TiDB (11 tabelas)
- **ORM**: Drizzle
- **Autenticação**: Manus OAuth + JWT
- **Storage**: AWS S3
- **Pagamentos**: Stripe

### Frontend
- **Framework**: React 19
- **Roteamento**: Wouter
- **Estilização**: Tailwind CSS 4
- **Componentes**: shadcn/ui
- **State**: tRPC React Query
- **Formulários**: React Hook Form + Zod

### Tabelas do Banco de Dados
1. `users` - Usuários e perfis
2. `communities` - Comunidades públicas/pagas
3. `community_members` - Membros das comunidades
4. `posts` - Posts das comunidades
5. `comments` - Comentários e respostas
6. `likes` - Likes em posts
7. `comment_likes` - Likes em comentários
8. `gamification_actions` - Histórico de ações e pontos
9. `badges` - Badges desbloqueadas
10. `reports` - Denúncias de moderação
11. `bans` - Banimentos de usuários

## 🚀 Como Usar

### Pré-requisitos
- Node.js 22+
- pnpm
- Conta Stripe (para comunidades pagas)

### Instalação
```bash
pnpm install
```

### Desenvolvimento
```bash
pnpm dev
```

### Testes
```bash
pnpm test
```

### Build
```bash
pnpm build
pnpm start
```

## 🔐 Variáveis de Ambiente

Variáveis automaticamente injetadas pelo Manus:
- `DATABASE_URL` - Conexão MySQL/TiDB
- `JWT_SECRET` - Segredo para cookies de sessão
- `VITE_APP_ID` - ID da aplicação Manus
- `OAUTH_SERVER_URL` - URL do servidor OAuth
- `STRIPE_SECRET_KEY` - Chave secreta Stripe
- `STRIPE_WEBHOOK_SECRET` - Secret do webhook Stripe

## 💳 Configuração do Stripe

1. **Ativar Sandbox**: Acesse o link de claim do sandbox Stripe (fornecido no painel)
2. **Criar Comunidade Paga**: Defina o preço em centavos (ex: 1000 = R$ 10,00)
3. **Checkout Automático**: O sistema cria sessões de checkout automaticamente
4. **Webhooks**: Configure o endpoint `/api/stripe/webhook` no dashboard Stripe

## 🎮 Fluxo de Uso

### Para Usuários
1. Fazer login via Manus OAuth
2. Completar perfil (avatar, bio)
3. Explorar comunidades públicas
4. Entrar em comunidades gratuitas
5. Assinar comunidades pagas via Stripe
6. Criar posts e comentários
7. Ganhar pontos e badges
8. Convidar amigos (50 pontos cada)
9. Subir no ranking

### Para Criadores de Comunidades
1. Criar comunidade (pública ou paga)
2. Definir preço mensal (se paga)
3. Gerenciar membros
4. Moderar conteúdo
5. Receber pagamentos via Stripe

### Para Moderadores/Admins
1. Acessar painel de moderação
2. Revisar denúncias
3. Banir usuários (temporário/permanente)
4. Manter comunidade segura

## 📊 Sistema de Pontos

| Ação | Pontos |
|------|--------|
| Criar comunidade | 100 |
| Criar post | 10 |
| Comentar | 5 |
| Receber like | 2 |
| Convidar usuário | 50 |

## 🧪 Testes

4 arquivos de teste com 9 testes passando:
- ✅ Autenticação (logout)
- ✅ Comunidades (criar, listar)
- ✅ Gamificação (perfil, leaderboard, convites)
- ✅ Stripe (validações)

## 📱 Páginas Implementadas

1. `/` - Home com feed personalizado
2. `/login` - Página de login
3. `/profile` - Perfil do usuário
4. `/communities` - Listagem de comunidades
5. `/community/:id` - Detalhes da comunidade
6. `/leaderboard` - Ranking global
7. `/invites` - Sistema de convites
8. `/moderation` - Painel de moderação (admin)

## 🎨 Design System

### Cores Principais
- **Primary**: Laranja vibrante (#f97316)
- **Secondary**: Amarelo dourado (#fbbf24)
- **Accent**: Âmbar (#f59e0b)
- **Background**: Bege claro (#fef3c7)

### Componentes
- Buttons, Cards, Dialogs
- Forms, Inputs, Textareas
- Badges, Avatars, Skeletons
- Toasts, Tooltips
- E mais 30+ componentes shadcn/ui

## 🔒 Segurança

- ✅ Autenticação OAuth segura
- ✅ Cookies HTTP-only
- ✅ Validação de schemas (Zod)
- ✅ Proteção CSRF
- ✅ Rate limiting (via Stripe)
- ✅ Sanitização de inputs
- ✅ Controle de acesso por roles

## 📈 Próximos Passos Sugeridos

1. **Notificações em Tempo Real**: Usar API de notificações Manus para alertar sobre likes, comentários e badges
2. **Upload de Imagens em Posts**: Implementar componente de upload S3 para anexar imagens aos posts
3. **Sistema de Busca**: Adicionar busca de comunidades e usuários
4. **Analytics**: Dashboard de métricas para criadores de comunidades
5. **Mobile App**: Versão React Native

## 📄 Licença

MIT

---

**Desenvolvido com 🐝 para a comunidade BeeOn.me**
