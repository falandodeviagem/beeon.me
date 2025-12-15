# BeeOn.me - TODO List

## 1. Sistema de Autenticação
- [x] Login/registro via Manus OAuth
- [x] Gestão de sessões com cookies seguros
- [x] Página de login com redirecionamento
- [x] Logout funcional

## 2. Perfis de Usuário
- [x] Upload de avatar para S3
- [x] Bio editável
- [x] Informações públicas do perfil
- [x] Página de visualização de perfil
- [x] Página de edição de perfil

## 3. Sistema de Comunidades
- [x] Criação de comunidades (públicas e pagas)
- [x] Listagem de comunidades
- [x] Página de detalhes da comunidade
- [x] Gestão de comunidades (editar, deletar)
- [x] Sistema de membros (entrar/sair)
- [x] Diferenciação entre comunidades públicas e pagas

## 4. Sistema de Posts
- [x] Criação de posts com texto
- [x] Upload de imagens para posts (S3)
- [x] Sistema de likes em posts
- [x] Sistema de comentários
- [x] Comentários aninhados (respostas)
- [x] Edição e exclusão de posts
- [x] Edição e exclusão de comentários

## 5. Sistema de Convites
- [x] Geração de código único por usuário
- [x] Página de convites
- [x] Rastreamento de convites aceitos
- [x] Sistema de recompensas por convites

## 6. Gamificação
- [x] Sistema de pontos por ações
- [x] Pontos por criar post
- [x] Pontos por comentar
- [x] Pontos por receber likes
- [x] Pontos por convidar usuários
- [x] Sistema de badges desbloqueáveis
- [x] Sistema de níveis de progressão
- [x] Página de ranking/leaderboard

## 7. Sistema de Moderação
- [x] Denúncias de posts
- [x] Denúncias de comentários
- [x] Painel de moderação para análise
- [x] Sistema de banimento temporário
- [x] Sistema de banimento permanente
- [x] Histórico de moderação

## 8. Monetização via Stripe
- [x] Integração Stripe
- [x] Checkout de assinatura de comunidade paga
- [x] Gestão de pagamentos
- [x] Verificação de status de assinatura
- [x] Cancelamento de assinatura
- [x] Webhook Stripe para eventos

## 9. Feed Personalizado
- [x] Feed com posts de comunidades seguidas
- [x] Ordenação por relevância e data
- [x] Paginação infinita
- [x] Filtros de feed

## 10. Design e UX
- [x] Sistema de design com paleta laranja/amarelo
- [x] Tema claro como padrão
- [x] Componentes UI modernos e minimalistas
- [x] Navegação intuitiva
- [x] Responsividade mobile
- [x] Estados de loading
- [x] Estados de erro
- [x] Estados vazios

## 11. Testes e Qualidade
- [x] Testes vitest para procedures críticas
- [x] Validação de schemas
- [x] Tratamento de erros

## 12. Sistema de Busca
- [x] Backend: Procedure de busca de comunidades
- [x] Backend: Procedure de busca de usuários
- [x] Frontend: Página de busca com resultados
- [x] Frontend: Componente de busca na navegação
- [x] Filtros de busca (comunidades/usuários)
- [x] Resultados com paginação

## 13. Filtros Avançados de Busca
- [x] Corrigir erro de links aninhados (<a> dentro de <a>)
- [x] Backend: Adicionar filtro isPaid na busca de comunidades
- [x] Backend: Adicionar ordenação por data de criação
- [x] Frontend: UI de filtros (pagas/gratuitas/todas)
- [x] Frontend: Dropdown de ordenação (relevância/recentes)
- [x] Atualizar testes para cobrir filtros

## 14. Feed de Atividades Recentes
- [x] Backend: Melhorar query getFeedPosts com informações completas
- [x] Backend: Incluir dados de autor e comunidade nos posts
- [x] Frontend: Componente PostCard para exibir posts
- [x] Frontend: Integrar feed na página Home
- [x] Frontend: Botões de like e comentar
- [x] Frontend: Estados de loading e vazio
- [x] Testes para feed de atividades

## 15. Scroll Infinito no Feed
- [x] Backend: Adicionar suporte a cursor-based pagination
- [x] Backend: Retornar nextCursor para próxima página
- [x] Frontend: Migrar de useQuery para useInfiniteQuery
- [x] Frontend: Implementar Intersection Observer
- [x] Frontend: Loading spinner ao carregar mais posts
- [x] Frontend: Mensagem de fim quando não houver mais posts
- [x] Testes para paginação infinita

## 16. Upload de Imagens em Posts
- [x] Backend: Procedure de upload para S3
- [x] Backend: Suporte a múltiplas imagens por post
- [x] Frontend: Componente ImageUpload com drag-and-drop
- [x] Frontend: Preview de imagens antes do upload
- [x] Frontend: Barra de progresso durante upload
- [x] Frontend: Limite de 5 imagens por post
- [x] Integrar upload no formulário de criação de posts

## 17. Sistema de Notificações Push
- [x] Backend: Tabela de notificações no schema
- [x] Backend: Helpers para criar notificações
- [x] Backend: Procedure para listar notificações
- [x] Backend: Procedure para marcar como lida
- [x] Frontend: Badge contador na navegação
- [x] Frontend: Painel dropdown de notificações
- [x] Frontend: Marcar como lida ao clicar
- [x] Integrar notificações em ações (like, comentário, badge)

## 18. Reações Diversas nos Posts
- [x] Backend: Tabela de reações no schema
- [x] Backend: Enum com 6 tipos de reações
- [x] Backend: Procedure para adicionar/remover reação
- [x] Backend: Contadores por tipo de reação
- [x] Frontend: Seletor de reações com emojis
- [x] Frontend: Mostrar contadores por tipo
- [x] Frontend: Lista de quem reagiu
- [x] Substituir sistema de likes por reações

## 19. Página de Perfil Público
- [x] Backend: Query para buscar posts do usuário
- [x] Backend: Query para buscar badges do usuário
- [x] Backend: Query para buscar comunidades do usuário
- [x] Frontend: Página de perfil público completa
- [x] Frontend: Seção de posts do usuário
- [x] Frontend: Seção de badges conquistados
- [x] Frontend: Estatísticas (pontos, nível, posts, comentários)
- [x] Frontend: Lista de comunidades que participa
- [x] Rota /user/:userId

## 20. Sistema de Seguir Usuários
- [x] Backend: Tabela de follows no schema
- [x] Backend: Helpers de seguir/deixar de seguir
- [x] Backend: Query de seguidores e seguindo
- [x] Backend: Feed de posts de usuários seguidos
- [x] Frontend: Botão seguir/deixar de seguir
- [x] Frontend: Contador de seguidores/seguindo
- [x] Frontend: Lista de seguidores
- [x] Frontend: Lista de seguindo
- [x] Notificação ao ganhar seguidor

## 21. Trending Topics
- [x] Backend: Query de comunidades em alta (últimos 7 dias)
- [x] Backend: Query de posts mais reagidos (últimas 24h)
- [x] Frontend: Componente TrendingTopics na sidebar
- [x] Frontend: Seção de comunidades em alta
- [x] Frontend: Seção de posts populares
- [x] Atualização periódica dos trending

## 22. Páginas de Seguidores/Seguindo
- [x] Backend: Procedure para listar seguidores de um usuário
- [x] Backend: Procedure para listar usuários que um usuário segue
- [x] Frontend: Página /user/:userId/followers
- [x] Frontend: Página /user/:userId/following
- [x] Frontend: Cards com avatar, nome, bio
- [x] Frontend: Botões de seguir em cada card
- [x] Links no perfil público

## 23. Sistema de Mensagens Diretas
- [x] Backend: Tabela de conversas no schema
- [x] Backend: Tabela de mensagens no schema
- [x] Backend: Procedure para criar conversa
- [x] Backend: Procedure para enviar mensagem
- [x] Backend: Procedure para listar conversas
- [x] Backend: Procedure para listar mensagens de uma conversa
- [x] Frontend: Página de mensagens /messages
- [x] Frontend: Lista de conversas na sidebar
- [x] Frontend: Interface de chat com mensagens
- [x] Frontend: Input de envio de mensagem
- [x] Frontend: Notificação de novas mensagens
- [x] Polling para atualização em tempo real

## 24. Compartilhamento de Posts
- [x] Backend: Campo shareCount no schema
- [x] Backend: Procedure para compartilhar post
- [x] Backend: Contador de compartilhamentos
- [x] Frontend: Botão de compartilhar em PostCard
- [x] Frontend: Modal com link copiável
- [x] Frontend: Feedback visual ao copiar
- [x] Frontend: Mostrar contador de shares
- [x] Incremento automático ao compartilhar

## 25. Script de Seed com Dados de Exemplo
- [x] Criar script seed.mjs com dados de exemplo
- [x] Adicionar 5-10 usuários fictícios
- [x] Adicionar 3-5 comunidades (públicas e pagas)
- [x] Adicionar 10-20 posts com conteúdo variado
- [x] Adicionar comentários nos posts
- [x] Adicionar reações diversas
- [x] Adicionar relacionamentos (follows, membros)
- [x] Documentar como executar o seed

## 26. Modo Escuro
- [x] Adicionar variáveis CSS para tema escuro
- [x] Criar toggle de tema no MainLayout
- [x] Persistir preferência em localStorage
- [x] Adaptar paleta laranja/amarelo para modo escuro
- [x] Garantir contraste adequado em ambos os temas
- [x] Ícone de sol/lua no toggle

## 27. Edição de Posts
- [x] Backend: Adicionar campos isEdited/editedAt ao schema
- [x] Backend: Procedure para editar post
- [x] Backend: Verificar se usuário é autor
- [x] Frontend: Botão de editar no PostCard (apenas autor)
- [x] Frontend: Modal de edição
- [x] Frontend: Textarea com conteúdo atual
- [x] Histórico visível para moderadores (futuro)

## 28. Indicador Visual de Posts Editados
- [x] Frontend: Badge "(editado)" no PostCard
- [x] Frontend: Tooltip mostrando data da última edição
- [x] Frontend: Posicionar ao lado do timestamp
- [x] Usar formatDistanceToNow para data de edição

## 29. Sistema de Hashtags
- [x] Backend: Tabela de hashtags no schema
- [x] Backend: Tabela de post_hashtags (relação)
- [x] Backend: Função para extrair hashtags do texto
- [x] Backend: Procedure para buscar posts por hashtag
- [x] Backend: Query de trending hashtags
- [x] Frontend: Detectar e linkar hashtags nos posts
- [x] Frontend: Página de exploração /hashtag/:tag
- [x] Frontend: Trending hashtags na sidebar
- [x] Regex para detectar #palavra

## 30. Página de Onboarding
- [x] Frontend: Criar página /onboarding
- [x] Frontend: Tutorial passo a passo (6 steps)
- [x] Frontend: Explicar comunidades
- [x] Frontend: Explicar gamificação (pontos, badges, níveis)
- [x] Frontend: Explicar sistema de convites
- [x] Frontend: Botão "Começar" ao final
- [x] Rota /onboarding criada
- [x] Tutorial interativo completo

## 31. Integração Automática de Hashtags
- [x] Modificar procedure createPost para chamar linkHashtagsToPost
- [x] Extrair hashtags automaticamente do conteúdo
- [x] Salvar relações post_hashtags no banco
- [x] Testar criação de posts com hashtags

## 32. Renderização de Hashtags Clicáveis
- [x] Criar componente HashtagText
- [x] Detectar #hashtags no texto com regex
- [x] Transformar em links clicáveis para /hashtag/:tag
- [x] Integrar no PostCard
- [x] Manter formatação do texto original

## 33. Redirecionamento Automático para Onboarding
- [x] Detectar novos usuários (sem atividade)
- [x] Adicionar lógica de redirecionamento no Home
- [x] Verificar se usuário já completou onboarding
- [x] Redirecionar apenas na primeira visita
- [x] Adicionar flag hasCompletedOnboarding no schema

## 34. Widget de Propaganda de Comunidades
- [x] Criar tabela community_promotions no schema
- [x] Adicionar helpers no db.ts (add, remove, list)
- [x] Criar procedures tRPC para admin gerenciar promoções
- [x] Interface de seleção de comunidades para admin
- [x] Widget na sidebar da comunidade exibindo 6 comunidades
- [x] Validação de limite (máx 6 comunidades)
- [x] Testes vitest

## 35. Correção de Bug - Links Aninhados
- [x] Identificar links aninhados na página Onboarding
- [x] Remover aninhamento de elementos <a>
- [x] Testar página sem erros de console

## 36. Melhorias no Upload de Imagens
- [x] Adicionar preview de imagens antes do upload
- [x] Implementar drag & drop para upload
- [x] Adicionar compressão automática client-side
- [x] Melhorar feedback visual durante upload
- [x] Adicionar botão para remover imagens do preview

## 37. Filtros Avançados de Comunidades
- [x] Adicionar campo category ao schema de communities
- [x] Criar enum de categorias (tecnologia, esportes, arte, etc)
- [x] Implementar filtros por categoria na UI
- [x] Adicionar ordenação (mais membros, recentes, alfabética)
- [x] Implementar busca por nome e descrição
- [x] Adicionar contadores de resultados

## 38. Sistema de Recomendações de Comunidades
- [x] Criar helper para calcular score de recomendação
- [x] Analisar categorias das comunidades que usuário participa
- [x] Analisar posts que usuário curtiu/comentou
- [x] Analisar comunidades dos usuários seguidos
- [x] Criar procedure tRPC getRecommendedCommunities
- [x] Implementar widget RecommendedCommunities na home
- [x] Adicionar sistema de scoring com pesos
- [x] Filtrar comunidades já participadas
- [x] Limitar a top 6 recomendações
- [x] Criar testes vitest

## 39. Botão "Ver Mais" em Comunidades Recomendadas
- [x] Adicionar estado de expansão (expanded) com useState
- [x] Implementar botão toggle "Ver mais" / "Ver menos"
- [x] Carregar 12 comunidades quando expandido (6 inicialmente)
- [x] Adicionar animação suave na transição
- [x] Ícone ChevronDown/ChevronUp no botão

## 40. Melhorias UX em Comunidades Recomendadas
- [x] Instalar framer-motion
- [x] Adicionar animação fade-in sequencial nos cards
- [x] Calcular se comunidade é "nova" (criada há menos de 7 dias)
- [x] Calcular se comunidade está "em alta" (crescimento >20% última semana)
- [x] Adicionar badges "Novo" e "Em Alta" nos cards
- [x] Implementar botão "Entrar Rápido" em cada card
- [x] Adicionar toast de feedback ao entrar em comunidade
- [x] Atualizar lista após join bem-sucedido

## 41. Sistema de Notificações Toast
- [x] Criar componente Toast UI com shadcn/ui
- [x] Criar componente Toaster para renderizar toasts
- [x] Implementar hook useToast com context
- [x] Adicionar variantes (success, error, info, warning)
- [x] Configurar auto-dismiss (3-5s)
- [x] Adicionar animações de entrada/saída
- [x] Integrar em RecommendedCommunities (substituir alert)
- [x] Integrar em outros pontos de feedback da aplicação

## 42. Toast de Loading Persistente
- [x] Adicionar helper toast.loading() ao useToast
- [x] Implementar toast.update() para atualizar toast existente
- [x] Criar componente Spinner animado
- [x] Adicionar variante "loading" ao Toast
- [x] Configurar duração infinita para loading toasts
- [x] Integrar no ImageUpload para feedback de upload
- [x] Testar fluxo completo: loading → success/error

## 43. Ícones Contextuais e Progress em Toasts
- [x] Adicionar CheckCircle para variant success
- [x] Adicionar XCircle para variant destructive  
- [x] Adicionar AlertTriangle para variant warning
- [x] Implementar suporte a progress (0-100%) no toast
- [x] Adicionar componente Progress bar no Toaster
- [x] Permitir atualizar progress via update()

## 44. Integrar Loading Toast em Operações
- [x] Criar post com loading toast
- [x] Criar comunidade com loading toast
- [x] Deletar post/comentário com loading toast
- [x] Seguir usuário com loading toast
- [x] Enviar mensagem DM com loading toast (se existir)

## 45. Sons de Feedback em Toasts
- [x] Criar arquivos de áudio (success.mp3, error.mp3)
- [x] Implementar playSound() com Web Audio API
- [x] Detectar se tab está ativa (document.visibilityState)
- [x] Adicionar toggle de preferência em localStorage
- [x] Integrar sons em toast success/error

## 46. Helper toast.promise()
- [x] Criar função toast.promise(promise, messages)
- [x] Gerenciar loading → success/error automaticamente
- [x] Suportar mensagens customizadas por estado
- [x] Retornar Promise original para chaining
- [x] Documentar uso e exemplos

## 47. Ações Customizadas em Toasts
- [x] Adicionar botão "Desfazer" em toast de deleção
- [x] Implementar lógica de desfazer (cancelar deleção)
- [x] Usar campo action do toast para botão customizado
- [x] Timer de 5s antes de confirmar deleção no backend
- [x] Feedback visual ao desfazer

## 48. Toggle de Sons no Header
- [x] Criar componente SoundToggle
- [x] Usar ícones Volume/VolumeX do lucide-react
- [x] Integrar toggleSounds() e areSoundsEnabled()
- [x] Adicionar tooltip "Ativar/Desativar sons"
- [x] Adicionar no MainLayout header

## 49. Progress Bar de Countdown em Deleção
- [x] Adicionar setInterval no handleDeletePost
- [x] Atualizar progress de 100 para 0 a cada segundo
- [x] Limpar interval ao cancelar ou concluir
- [x] Feedback visual do tempo restante

## 50. Refatorar Criar Post com toast.promise()
- [x] Substituir handleCreatePost por toast.promise()
- [x] Remover código manual de loading/update
- [x] Mensagens dinâmicas baseadas em resposta
- [x] Demonstrar uso do novo helper

## 51. Sistema de Menções
- [x] Criar tabela mentions no schema
- [x] Adicionar helper searchUsers no db.ts
- [x] Criar procedure searchUsers no routers.ts
- [ ] Implementar componente MentionInput com autocomplete
- [ ] Detectar @ e mostrar dropdown de usuários
- [ ] Salvar menções ao criar post/comentário
- [ ] Enviar notificações para usuários mencionados

## 52. Busca Global Unificada
- [x] Criar procedure globalSearch no routers.ts
- [x] Buscar em comunidades, posts, usuários e hashtags
- [x] Criar componente GlobalSearch no header
- [x] Agrupar resultados por categoria
- [x] Highlight de termos encontrados
- [ ] Navegação por teclado (arrow keys)

## 53. Dashboard de Estatísticas de Comunidade
- [x] Instalar chart.js e react-chartjs-2
- [x] Criar helpers de estatísticas no db.ts
- [x] Criar procedures getCommunityStats no routers.ts
- [x] Implementar página CommunityStats
- [x] Gráfico de novos membros por dia
- [x] Gráfico de posts por semana
- [x] Gráfico de engajamento médio
- [x] Seletor de período (7/30/90 dias)

## 54. Autocomplete de Menções
- [x] Criar componente MentionInput com Textarea
- [x] Detectar @ e posição do cursor
- [x] Mostrar dropdown com busca de usuários
- [x] Navegar dropdown com arrow keys
- [x] Selecionar usuário com Enter ou click
- [x] Inserir @username no texto
- [x] Extrair menções do texto ao criar post
- [x] Salvar menções na tabela mentions
- [x] Criar notificações para usuários mencionados

## 55. Navegação por Teclado na Busca Global
- [x] Adicionar state para índice selecionado
- [x] Implementar handler de ArrowDown/ArrowUp
- [x] Highlight visual do item selecionado
- [x] Enter para navegar ao item selecionado
- [x] Escape para fechar busca
- [x] Scroll automático para item selecionado

## 56. Salvar Menções e Notificações
- [x] Criar função para extrair @usernames do texto
- [x] Adicionar procedure saveMentions no routers.ts
- [x] Buscar IDs dos usuários mencionados
- [x] Salvar menções na tabela mentions
- [x] Enviar notificações para usuários mencionados
- [x] Integrar ao criar post

## 57. Scroll Automático na Busca Global
- [x] Adicionar refs para items da lista
- [x] Implementar scrollIntoView() quando selectedIndex muda
- [x] Configurar scroll behavior smooth
- [x] Testar com listas longas de resultados

## 58. Highlight de Menções em Posts
- [x] Criar componente MentionText para renderizar conteúdo
- [x] Detectar @username com regex
- [x] Substituir por Link clicável para perfil
- [x] Aplicar cor diferenciada (text-primary)
- [x] Integrar em posts e comentários

## 59. Página de Notificações
- [x] Criar procedure markAsRead e markAllAsRead
- [x] Criar procedure getUnreadCount
- [x] Criar página Notifications.tsx
- [x] Listar notificações com filtro lido/não lido
- [x] Botão "Marcar todas como lidas"
- [x] Adicionar badge de contador no header
- [x] Adicionar rota no App.tsx

## 60. Comentários com Menções
- [x] Substituir Textarea por MentionInput em comentários
- [x] Processar @username ao criar comentário
- [x] Salvar menções com commentId na tabela mentions
- [x] Enviar notificações para mencionados em comentários
- [x] Placeholder informativo "use @ para mencionar"

## 61. Rich Text Editor com TipTap
- [x] Instalar TipTap e extensões (starter-kit, placeholder, link, image)
- [x] Criar componente RichTextEditor com toolbar
- [x] Implementar formatação: negrito, itálico, código
- [x] Implementar listas: bullet list, ordered list
- [x] Adicionar inserção de links com dialog modal
- [x] Adicionar inserção de imagens inline via URL
- [x] Criar componente RichTextDisplay para renderizar HTML
- [x] Substituir MentionInput por RichTextEditor em criar post
- [x] Atualizar exibição de posts com RichTextDisplay

## 62. Sistema de Reações Expandido
- [x] Criar helper getPostReactionUsers no db-reactions-users.ts
- [x] Adicionar router reactions no routers.ts
- [x] Implementar procedures: add, remove, getCounts, getUserReaction, getUsers
- [x] Atualizar ReactionPicker para usar novo router
- [x] Implementar toggle de reações (clicar novamente remove)
- [x] Atualizar ReactionCounts com tooltip
- [x] Mostrar usuários que reagiram no tooltip
- [x] Agrupar usuários por tipo de reação
- [x] Exibir avatares e nomes no tooltip
- [x] Limitar a 10 usuários por tipo com contador "+X mais"

## 63. Edição de Comentários
- [x] Backend: Adicionar campos isEdited/editedAt ao schema de comments
- [x] Backend: Procedure para editar comentário (verificar se é autor)
- [x] Backend: Atualizar helper updateComment no db.ts
- [x] Frontend: Botão de editar no comentário (apenas para autor)
- [x] Frontend: Modal de edição com MentionInput
- [x] Frontend: Indicador visual "(editado)" com tooltip de data
- [x] Frontend: Atualizar lista após edição bem-sucedida

## 64. Preview de Links em Posts
- [x] Backend: Criar procedure fetchLinkPreview
- [x] Backend: Buscar metadados Open Graph (og:title, og:description, og:image)
- [x] Backend: Fallback para meta tags padrão se OG não existir
- [x] Frontend: Detectar URLs no conteúdo do post
- [x] Frontend: Componente LinkPreviewCard
- [x] Frontend: Exibir card com imagem, título e descrição
- [x] Frontend: Link clicável para abrir em nova aba
- [x] Frontend: Loading state durante fetch de preview

## 65. Notificações em Tempo Real
- [x] Backend: Procedure para marcar notificações como lidas
- [x] Backend: Procedure para buscar notificações não lidas com contador
- [x] Backend: Polling ou WebSocket para atualização em tempo real
- [x] Frontend: Hook useNotifications para gerenciar estado
- [x] Frontend: Badge de contador na navbar (ícone de sino)
- [x] Frontend: Dropdown com lista de notificações
- [x] Frontend: Marcar como lida ao clicar
- [x] Frontend: Link para página de notificações completa
- [x] Frontend: Push notifications do navegador (Web Push API)
- [x] Frontend: Solicitar permissão ao usuário
- [x] Frontend: Exibir notificação quando nova notificação chegar

## 66. Busca Avançada
- [x] Backend: Procedure de busca com múltiplos filtros
- [x] Backend: Filtro por comunidade
- [x] Backend: Filtro por hashtags
- [x] Backend: Filtro por autor
- [x] Backend: Filtro por período (data início/fim)
- [x] Backend: Ordenação por relevância/data
- [x] Frontend: Página de busca dedicada
- [x] Frontend: Campo de busca com autocomplete
- [x] Frontend: Filtros visuais (dropdowns, date pickers)
- [x] Frontend: Exibir resultados com PostCard
- [x] Frontend: Estado vazio quando sem resultados
- [x] Frontend: Histórico de buscas recentes (localStorage)
- [x] Frontend: Sugestões de hashtags populares
- [x] Frontend: Sugestões de usuários ao buscar por autor

## 67. Sistema de Compartilhamento Social
- [x] Backend: Criar rota pública para visualizar post individual (SEO-friendly)
- [x] Backend: Gerar meta tags Open Graph dinamicamente por post
- [x] Backend: Incluir og:title, og:description, og:image, og:url
- [x] Backend: Procedure para buscar post por ID (público)
- [x] Frontend: Componente SocialShareButtons
- [x] Frontend: Botão de compartilhar no WhatsApp
- [x] Frontend: Botão de compartilhar no Twitter
- [x] Frontend: Botão de compartilhar no LinkedIn
- [x] Frontend: Gerar URLs de compartilhamento com texto personalizado
- [x] Frontend: Integrar no PostCard (substituir botão de share genérico)
- [x] Frontend: Modal de compartilhamento com preview
- [x] Frontend: Copiar link com toast de confirmação

## 68. Melhorias de Acessibilidade e Responsividade
- [x] Layout totalmente responsivo para mobile (320px+)
- [x] Layout otimizado para tablet (768px+)
- [x] Layout otimizado para desktop (1024px+)
- [x] Ajustar contraste de cores para WCAG AA (4.5:1)
- [x] Adicionar texto alternativo em todas as imagens
- [x] Adicionar aria-labels em botões de ícone
- [x] Melhorar focus indicators (outline visível)
- [x] Testar navegação por teclado em todos os componentes
- [x] Adicionar skip-to-content link
- [x] Garantir que modais trapem o foco

## 69. Infinite Scroll nos Feeds
- [x] Backend: Atualizar procedure de getFeedPosts para suportar cursor-based pagination
- [x] Backend: Retornar hasMore flag indicando se há mais posts
- [x] Frontend: Hook useInfiniteScroll para detectar scroll no fim da página
- [x] Frontend: Integrar com trpc.useInfiniteQuery
- [x] Frontend: Skeleton loader para posts durante carregamento
- [x] Frontend: Indicador de "carregando mais" no final da lista
- [x] Frontend: Botão "Carregar mais" como fallback
- [x] Frontend: Aplicar em Home, CommunityDetail e UserProfile

## 70. Drag & Drop para Upload de Imagens
- [x] Frontend: Área de drop zone com feedback visual
- [x] Frontend: Suporte a arrastar e soltar múltiplas imagens
- [x] Frontend: Preview instantâneo das imagens selecionadas
- [x] Frontend: Barra de progresso durante upload
- [x] Frontend: Validação de tipo de arquivo (apenas imagens)
- [x] Frontend: Validação de tamanho máximo (5MB por imagem)
- [x] Frontend: Botão para remover imagem individual do preview
- [x] Frontend: Integrar com ImageUpload component existente

## 71. Modo Offline com Service Worker
- [x] Criar service-worker.js com estratégia de cache
- [x] Registrar Service Worker no main.tsx
- [x] Cache de assets estáticos (JS, CSS, fonts)
- [x] Cache de posts do feed (Cache First, fallback Network)
- [x] Cache de imagens (Cache First, fallback Network)
- [x] Indicador visual de status offline/online
- [x] Sincronização automática ao retornar online
- [x] Background sync para ações pendentes (likes, comentários)
- [x] Notificação ao usuário quando offline

## 72. Filtros de Feed
- [x] Backend: Atualizar procedure getFeedPosts para suportar filtros
- [x] Backend: Filtro por tipo de conteúdo (texto, imagem, link)
- [x] Backend: Ordenação por recentes, populares (likes), tendências
- [x] Backend: Filtro por período (hoje, semana, mês)
- [x] Frontend: Componente FeedFilters com dropdowns
- [x] Frontend: Persistir filtros selecionados no localStorage
- [x] Frontend: Badge mostrando filtros ativos
- [x] Frontend: Botão "Limpar filtros"
- [x] Frontend: Integrar com useInfiniteQuery

## 73. Correção de Bugs
- [x] Executar todos os testes e identificar os 3 testes falhando
- [x] Corrigir testes de follow system (dados duplicados)
- [x] Corrigir teste de gamification (user not found)
- [x] Verificar erros de TypeScript no build
- [x] Revisar componentes com possíveis bugs de UI
- [x] Validar lógica de procedures tRPC
- [x] Testar fluxos críticos (login, criar post, comentar, reagir)
- [x] Verificar inconsistências de dados no banco
