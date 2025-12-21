# BeeOn.me - Roadmap de Desenvolvimento

**Versão Atual**: af21315b  
**Status**: MVP Completo e Funcional (99% testes passando)

---

## 🎯 Próximas Implementações Prioritárias

### 1. UI de Anexos de Imagens no Chat (Estimativa: 2-3 horas)

**Status**: Backend 100% pronto, Frontend 0%

**Backend Completo**:
- ✅ Campo `imageUrl` no schema de messages
- ✅ Procedure `uploadImage` para S3 (base64)
- ✅ `sendMessage` aceita imageUrl opcional
- ✅ Migração aplicada (0025_lovely_cerise.sql)

**Frontend Pendente**:
1. **Botão de Anexar Imagem**
   - Adicionar input file hidden com ref
   - Botão com ícone ImageIcon ao lado do input
   - Accept apenas images (image/*)
   - Limite de 5MB por imagem

2. **Preview Antes de Enviar**
   - Mostrar thumbnail da imagem selecionada
   - Botão X para remover
   - Indicador de tamanho do arquivo
   - Compressão automática se > 1MB

3. **Exibição nas Mensagens**
   - Renderizar imagem com OptimizedImage
   - Max-width: 300px
   - Cursor pointer para abrir lightbox
   - Loading skeleton enquanto carrega

4. **Lightbox para Visualização**
   - Modal fullscreen com fundo escuro
   - Imagem centralizada em tamanho real
   - Botão X para fechar
   - Clicar fora fecha o lightbox
   - Suporte a navegação (próxima/anterior)

**Código de Referência**:
```typescript
// Estado necessário
const [selectedImage, setSelectedImage] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);
const [lightboxImage, setLightboxImage] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);

// Upload mutation
const uploadImageMutation = trpc.messages.uploadImage.useMutation();

// Handler de seleção
const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  if (file.size > 5 * 1024 * 1024) {
    toast.error("Imagem muito grande (máx 5MB)");
    return;
  }
  
  setSelectedImage(file);
  const reader = new FileReader();
  reader.onloadend = () => {
    setImagePreview(reader.result as string);
  };
  reader.readAsDataURL(file);
};

// Handler de envio com imagem
const handleSendWithImage = async () => {
  if (!selectedImage || !selectedConversationId) return;
  
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64 = (reader.result as string).split(',')[1];
    const result = await uploadImageMutation.mutateAsync({
      base64Image: base64,
      mimeType: selectedImage.type,
    });
    
    await sendMutation.mutateAsync({
      conversationId: selectedConversationId,
      content: messageContent.trim() || "📷 Imagem",
      imageUrl: result.url,
    });
    
    setSelectedImage(null);
    setImagePreview(null);
  };
  reader.readAsDataURL(selectedImage);
};
```

---

### 2. Sistema de Badges Automáticos (Estimativa: 4-5 horas)

**Status**: Infraestrutura 100% pronta, Lógica 0%

**Infraestrutura Completa**:
- ✅ Tabela `badges` com definições
- ✅ Tabela `user_badges` para conquistas
- ✅ Procedure `awardBadge` implementado
- ✅ Procedure `getUserBadges` implementado

**Badges Sugeridos**:
1. **Primeira Postagem** - Criar primeiro post
2. **Primeira Curtida** - Receber primeira curtida
3. **100 Curtidas** - Receber 100 curtidas totais
4. **Influencer** - Receber 1000 curtidas totais
5. **Comentarista** - Fazer 50 comentários
6. **Membro Ativo** - Logar por 7 dias consecutivos
7. **Criador de Comunidade** - Criar primeira comunidade
8. **Líder Comunitário** - Comunidade atingir 100 membros
9. **Social** - Seguir 50 usuários
10. **Popular** - Ter 100 seguidores

**Implementação Necessária**:

1. **Criar Arquivo de Definições**
```typescript
// server/badges/definitions.ts
export const BADGE_DEFINITIONS = {
  FIRST_POST: {
    id: 'first_post',
    name: 'Primeira Postagem',
    description: 'Criou seu primeiro post',
    icon: '📝',
    checkCondition: async (userId: number) => {
      const posts = await db.getUserPosts(userId);
      return posts.length >= 1;
    },
  },
  HUNDRED_LIKES: {
    id: 'hundred_likes',
    name: '100 Curtidas',
    description: 'Recebeu 100 curtidas em seus posts',
    icon: '❤️',
    checkCondition: async (userId: number) => {
      const totalLikes = await db.getUserTotalLikes(userId);
      return totalLikes >= 100;
    },
  },
  // ... outros badges
};
```

2. **Sistema de Verificação**
```typescript
// server/badges/checker.ts
export async function checkAndAwardBadges(userId: number, event: string) {
  const relevantBadges = getBadgesForEvent(event);
  
  for (const badgeDef of relevantBadges) {
    const alreadyHas = await db.userHasBadge(userId, badgeDef.id);
    if (alreadyHas) continue;
    
    const meetsCondition = await badgeDef.checkCondition(userId);
    if (meetsCondition) {
      await db.awardBadge(userId, badgeDef.id);
      await sendPushNotification(userId, {
        title: `🎉 Badge Desbloqueado!`,
        body: `Você conquistou: ${badgeDef.name}`,
        data: { type: 'badge', badgeId: badgeDef.id },
      });
    }
  }
}
```

3. **Integrar em Eventos**
```typescript
// Em routers.ts, após criar post:
await checkAndAwardBadges(ctx.user.id, 'post_created');

// Após receber curtida:
await checkAndAwardBadges(postAuthorId, 'like_received');

// Após fazer comentário:
await checkAndAwardBadges(ctx.user.id, 'comment_created');
```

4. **UI de Badges no Perfil**
- Criar componente `BadgeGrid.tsx`
- Mostrar badges conquistados com brilho
- Badges não conquistados em cinza
- Tooltip com descrição e progresso
- Animação de conquista (confetti)

---

### 3. Dashboard de Moderação (Estimativa: 6-8 horas)

**Status**: Infraestrutura 70% pronta, UI 0%

**Infraestrutura Existente**:
- ✅ Tabela `reports` para denúncias
- ✅ Tabela `user_warnings` para avisos
- ✅ Campos de banimento em `users` (isBanned, bannedUntil, banReason)
- ✅ Procedures básicos de moderação

**Funcionalidades Necessárias**:

1. **Página de Moderação** (`/moderation`)
   - Acessível apenas para admins/moderadores
   - Tabs: Denúncias, Usuários Banidos, Logs
   - Filtros: tipo, status, data
   - Busca por usuário/conteúdo

2. **Sistema de Denúncias**
   - Botão "Denunciar" em posts/comentários/perfis
   - Modal com motivos (spam, assédio, conteúdo impróprio, etc)
   - Campo de descrição opcional
   - Envio anônimo ou identificado

3. **Ações de Moderação**
   - **Remover Conteúdo**: Soft delete (isDeleted = true)
   - **Avisar Usuário**: Criar warning com mensagem
   - **Banir Temporário**: Definir bannedUntil
   - **Banir Permanente**: isBanned = true, bannedUntil = null
   - **Desbanir**: Remover banimento

4. **Filtro de Palavras Proibidas**
   - Tabela `banned_words` no schema
   - Verificação automática em posts/comentários
   - Ação: bloquear ou avisar moderador
   - UI para gerenciar lista de palavras

5. **Logs de Moderação**
   - Tabela `moderation_logs` no schema
   - Registrar: ação, moderador, alvo, motivo, timestamp
   - UI de visualização com filtros
   - Export para CSV

**Estrutura de Código**:

```typescript
// Página de Moderação
// client/src/pages/Moderation.tsx
export default function Moderation() {
  const [tab, setTab] = useState<'reports' | 'banned' | 'logs'>('reports');
  const { data: reports } = trpc.moderation.getReports.useQuery();
  const { data: bannedUsers } = trpc.moderation.getBannedUsers.useQuery();
  const { data: logs } = trpc.moderation.getLogs.useQuery();
  
  return (
    <DashboardLayout>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="reports">
            Denúncias <Badge>{reports?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="banned">Usuários Banidos</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports">
          <ReportsTable reports={reports} />
        </TabsContent>
        
        <TabsContent value="banned">
          <BannedUsersTable users={bannedUsers} />
        </TabsContent>
        
        <TabsContent value="logs">
          <ModerationLogsTable logs={logs} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
```

**Procedures tRPC Necessários**:
```typescript
moderation: {
  getReports: adminProcedure.query(async () => { ... }),
  resolveReport: adminProcedure.input(...).mutation(async ({ input }) => { ... }),
  removeContent: adminProcedure.input(...).mutation(async ({ input }) => { ... }),
  warnUser: adminProcedure.input(...).mutation(async ({ input }) => { ... }),
  banUser: adminProcedure.input(...).mutation(async ({ input }) => { ... }),
  unbanUser: adminProcedure.input(...).mutation(async ({ input }) => { ... }),
  getBannedUsers: adminProcedure.query(async () => { ... }),
  getLogs: adminProcedure.query(async () => { ... }),
}
```

---

## 📋 Checklist de Implementação

### UI de Anexos de Imagens
- [ ] Adicionar estados e refs no Messages.tsx
- [ ] Criar botão de anexar com input file
- [ ] Implementar preview de imagem
- [ ] Adicionar handler de upload
- [ ] Renderizar imagens nas mensagens
- [ ] Criar componente Lightbox
- [ ] Adicionar compressão de imagens grandes
- [ ] Testar upload e visualização
- [ ] Criar testes unitários

### Sistema de Badges
- [ ] Criar arquivo de definições de badges
- [ ] Implementar sistema de verificação
- [ ] Integrar em eventos (post, like, comment)
- [ ] Criar procedure checkAndAwardBadges
- [ ] Adicionar notificações push para badges
- [ ] Criar componente BadgeGrid
- [ ] Adicionar badges no perfil do usuário
- [ ] Criar animação de conquista
- [ ] Testar verificação automática
- [ ] Criar testes unitários

### Dashboard de Moderação
- [ ] Criar schema de banned_words e moderation_logs
- [ ] Criar página /moderation
- [ ] Implementar tabs (denúncias, banidos, logs)
- [ ] Criar botão "Denunciar" em conteúdo
- [ ] Implementar modal de denúncia
- [ ] Criar procedures de moderação
- [ ] Implementar ações (remover, avisar, banir)
- [ ] Criar filtro de palavras proibidas
- [ ] Implementar logs de ações
- [ ] Adicionar export de relatórios
- [ ] Testar fluxo completo de moderação
- [ ] Criar testes unitários

---

## 🚀 Melhorias Futuras (Baixa Prioridade)

### Performance
- [ ] Implementar cache Redis para queries frequentes
- [ ] Adicionar CDN para imagens
- [ ] Otimizar queries com índices compostos
- [ ] Implementar lazy loading de componentes pesados
- [ ] Adicionar service worker para cache agressivo

### UX
- [ ] Modo escuro completo
- [ ] Personalização de tema por usuário
- [ ] Atalhos de teclado globais
- [ ] Arrastar e soltar para upload
- [ ] Edição inline de posts

### Features
- [ ] Stories temporários (24h)
- [ ] Transmissões ao vivo
- [ ] Enquetes em posts
- [ ] Eventos de comunidades
- [ ] Marketplace
- [ ] Integração com redes sociais

### Mobile
- [ ] App React Native
- [ ] Notificações push nativas
- [ ] Câmera integrada
- [ ] Compartilhamento nativo

---

**Última atualização**: Dezembro 2025  
**Mantido por**: Manus AI
