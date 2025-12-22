# 🐝 BeeOn.me - Rede Social MVP

> Uma rede social moderna e completa com sistema de badges, comunidades, mensagens em tempo real e moderação avançada.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![Tests](https://img.shields.io/badge/Tests-30%20passing-success.svg)](https://vitest.dev/)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Testes](#testes)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Sobre o Projeto

**BeeOn.me** é uma rede social completa desenvolvida com as tecnologias mais modernas do mercado. O projeto implementa funcionalidades essenciais de uma rede social, incluindo sistema de gamificação com badges, comunidades temáticas, chat em tempo real, moderação de conteúdo e monetização via Stripe.

### ✨ Destaques

- 🏆 **Sistema de Badges Automáticos** - 10 badges com verificação automática e notificações
- 📊 **Badge Progress Tracking** - Acompanhe seu progresso para desbloquear novos badges
- 💬 **Chat em Tempo Real** - WebSocket para mensagens instantâneas com anexos de imagens
- 🛡️ **Dashboard de Moderação** - Sistema completo de denúncias e banimentos
- 💳 **Monetização Stripe** - Comunidades pagas com checkout integrado
- 🌓 **Modo Escuro** - Tema escuro/claro com persistência
- 🧪 **30 Testes** - Cobertura completa com testes unitários e de integração

## 🚀 Funcionalidades

### Sistema de Usuários
- ✅ Autenticação OAuth com Manus
- ✅ Perfis personalizáveis com avatar e bio
- ✅ Sistema de seguidores/seguindo
- ✅ Estatísticas de usuário (posts, comentários, curtidas)
- ✅ Sistema de pontos e níveis
- ✅ Histórico de ações

### Posts e Interações
- ✅ Criação de posts com texto e imagens
- ✅ Sistema de curtidas e comentários
- ✅ Comentários aninhados (respostas)
- ✅ Feed personalizado com filtros (tipo, ordenação, período)
- ✅ Anexos de imagens com upload para S3
- ✅ Lightbox para visualização de imagens
- ✅ Edição e exclusão de posts

### Comunidades
- ✅ Criação e gerenciamento de comunidades
- ✅ Comunidades públicas e pagas
- ✅ Sistema de membros
- ✅ Posts exclusivos de comunidade
- ✅ Estatísticas de comunidade
- ✅ Monetização via Stripe

### Mensagens
- ✅ Chat em tempo real via WebSocket
- ✅ Conversas privadas entre usuários
- ✅ Anexos de imagens nas mensagens
- ✅ Indicadores de mensagens não lidas
- ✅ Histórico de conversas

### Sistema de Badges
- ✅ 10 badges automáticos:
  - 📝 Primeira Postagem
  - 👍 Primeira Curtida
  - 💯 100 Curtidas
  - 🌟 Influencer (1000 curtidas)
  - 💬 Comentarista (50 comentários)
  - 🏘️ Criador de Comunidade
  - 👑 Líder Comunitário (50+ membros)
  - 🌅 Madrugador (post 5h-7h)
  - 🤝 Social (10 seguindo)
  - ⭐ Popular (100 seguidores)
- ✅ Verificação automática em eventos
- ✅ Notificações de conquista
- ✅ Progress tracking visual com progress bars
- ✅ Exibição no perfil com BadgeGrid

### Gamificação
- ✅ **Sistema de Pontos:**
  - Criar comunidade: 100 pontos
  - Criar post: 10 pontos
  - Comentar: 5 pontos
  - Receber like: 2 pontos
  - Convidar usuário: 50 pontos
- ✅ Sistema de níveis automático
- ✅ Ranking global (leaderboard)
- ✅ Sistema de convites com código único
- ✅ Rastreamento de convites aceitos

### Moderação
- ✅ Sistema de denúncias (posts, comentários, usuários)
- ✅ Banimento de usuários (temporário/permanente)
- ✅ Filtro de palavras proibidas
- ✅ Logs de moderação
- ✅ Dashboard administrativo
- ✅ Revisão de denúncias com notas

### Monetização (Stripe)
- ✅ Checkout de assinaturas para comunidades pagas
- ✅ Verificação de status de assinatura
- ✅ Webhook para eventos Stripe
- ✅ Gestão de pagamentos mensais
- ✅ Sandbox de testes integrado

### UX/UI
- ✅ Design moderno com Tailwind CSS 4
- ✅ Componentes shadcn/ui (30+ componentes)
- ✅ Modo escuro/claro
- ✅ Loading skeletons
- ✅ Animações e transições
- ✅ Responsivo (mobile-first)
- ✅ Estados vazios informativos
- ✅ Paleta laranja/amarelo (tema abelhas 🐝)

## 🛠️ Tecnologias

### Frontend
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **shadcn/ui** - Componentes UI
- **Wouter** - Roteamento
- **tRPC** - Type-safe API
- **TanStack Query** - Cache e sincronização
- **date-fns** - Manipulação de datas
- **React Hook Form + Zod** - Formulários

### Backend
- **Node.js 22** - Runtime
- **Express 4** - Framework web
- **tRPC 11** - API type-safe
- **Drizzle ORM** - ORM TypeScript-first
- **MySQL/TiDB** - Banco de dados (11 tabelas)
- **WebSocket** - Comunicação real-time
- **JWT** - Autenticação
- **Stripe** - Pagamentos

### Infraestrutura
- **AWS S3** - Armazenamento de arquivos
- **Manus OAuth** - Autenticação
- **Vitest** - Framework de testes
- **pnpm** - Gerenciador de pacotes

### Tabelas do Banco de Dados
1. `users` - Usuários e perfis
2. `communities` - Comunidades públicas/pagas
3. `community_members` - Membros das comunidades
4. `posts` - Posts das comunidades
5. `comments` - Comentários e respostas
6. `post_likes` - Likes em posts
7. `comment_likes` - Likes em comentários
8. `user_actions` - Histórico de ações e pontos
9. `user_badges` - Badges desbloqueadas
10. `reports` - Denúncias de moderação
11. `banned_users` - Banimentos de usuários
12. `moderation_logs` - Logs de moderação
13. `messages` - Mensagens do chat
14. `conversations` - Conversas entre usuários
15. `followers` - Sistema de seguidores

## 📦 Instalação

### Pré-requisitos

- Node.js 22+
- pnpm 9+
- MySQL 8+ ou TiDB
- Conta AWS (para S3)
- Conta Manus (para OAuth)
- Conta Stripe (para monetização)

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/falandodeviagem/beeon.me.git
cd beeon.me
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=seu_jwt_secret_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=seu_app_id
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
# ... outras variáveis
```

4. **Execute as migrações**
```bash
pnpm db:push
```

5. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```

O projeto estará disponível em `http://localhost:3000`

## ⚙️ Configuração

### Banco de Dados

O projeto usa Drizzle ORM. Para modificar o schema:

1. Edite `drizzle/schema.ts`
2. Execute `pnpm db:push` para aplicar as mudanças
3. Execute `pnpm db:generate` para gerar migrações (opcional)

### S3 (Armazenamento de Arquivos)

Configure as credenciais AWS no arquivo `.env`:
```env
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu-bucket
```

### OAuth (Autenticação)

Configure o OAuth do Manus:
1. Crie uma aplicação em https://portal.manus.im
2. Configure o callback URL: `http://localhost:3000/api/oauth/callback`
3. Adicione as credenciais no `.env`

### Stripe (Monetização)

1. **Ativar Sandbox**: Acesse o link de claim do sandbox Stripe (fornecido no painel)
2. **Configurar Webhook**: Configure o endpoint `/api/stripe/webhook` no dashboard Stripe
3. **Criar Comunidade Paga**: Defina o preço em centavos (ex: 1000 = R$ 10,00)

## 🧪 Testes

O projeto possui **30 testes** cobrindo funcionalidades críticas:

```bash
# Executar todos os testes
pnpm test

# Executar testes específicos
pnpm test badges.test.ts
pnpm test badges.integration.test.ts
pnpm test progress.test.ts

# Executar com cobertura
pnpm test:coverage
```

### Cobertura de Testes

- ✅ **10 testes unitários** - Sistema de badges (badges.test.ts)
- ✅ **13 testes de integração** - Fluxos completos de badges (badges.integration.test.ts)
- ✅ **7 testes unitários** - Cálculo de progresso (progress.test.ts)

## 📁 Estrutura do Projeto

```
beeonme-mvp-final/
├── client/                  # Frontend React
│   ├── public/             # Arquivos estáticos
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   │   ├── ui/        # Componentes shadcn/ui
│   │   │   ├── BadgeGrid.tsx
│   │   │   ├── BadgeProgress.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── ...
│   │   ├── contexts/       # Contextos React
│   │   ├── hooks/          # Hooks customizados
│   │   ├── lib/            # Utilitários
│   │   │   └── trpc.ts    # Cliente tRPC
│   │   ├── pages/          # Páginas/rotas
│   │   │   ├── Home.tsx
│   │   │   ├── UserProfile.tsx
│   │   │   ├── Messages.tsx
│   │   │   ├── Communities.tsx
│   │   │   ├── Moderation.tsx
│   │   │   └── ...
│   │   ├── App.tsx         # Configuração de rotas
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Estilos globais
│   └── index.html
├── server/                  # Backend Node.js
│   ├── _core/              # Infraestrutura
│   │   ├── context.ts     # Contexto tRPC
│   │   ├── env.ts         # Variáveis de ambiente
│   │   ├── llm.ts         # Integração LLM
│   │   └── ...
│   ├── badges/             # Sistema de badges
│   │   ├── definitions.ts # Definições de badges
│   │   ├── checker.ts     # Verificação automática
│   │   └── progress.ts    # Cálculo de progresso
│   ├── db.ts               # Funções de banco de dados
│   ├── routers.ts          # Rotas tRPC
│   ├── *.test.ts           # Testes
│   └── ...
├── drizzle/                # Schema e migrações
│   └── schema.ts
├── shared/                 # Código compartilhado
├── storage/                # Helpers S3
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

## 📱 Páginas Implementadas

1. `/` - Home com feed personalizado
2. `/login` - Página de login
3. `/profile/:userId` - Perfil do usuário
4. `/communities` - Listagem de comunidades
5. `/community/:id` - Detalhes da comunidade
6. `/messages` - Chat em tempo real
7. `/leaderboard` - Ranking global
8. `/invites` - Sistema de convites
9. `/moderation` - Painel de moderação (admin)

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
10. Trocar mensagens com outros usuários

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

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga estas etapas:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Guidelines

- Escreva testes para novas funcionalidades
- Siga o padrão de código existente
- Atualize a documentação quando necessário
- Mantenha commits atômicos e descritivos

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
2. **Sistema de Busca**: Adicionar busca de comunidades e usuários
3. **Analytics**: Dashboard de métricas para criadores de comunidades
4. **Mobile App**: Versão React Native
5. **Badge Rarity System**: Adicionar campo rarity (comum/raro/épico/lendário)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autor

**falandodeviagem**
- GitHub: [@falandodeviagem](https://github.com/falandodeviagem)

## 🙏 Agradecimentos

- [Manus](https://manus.im) - Plataforma de desenvolvimento
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [tRPC](https://trpc.io/) - Type-safe APIs
- [Stripe](https://stripe.com/) - Pagamentos

---

**Desenvolvido com 🐝 por falandodeviagem**
