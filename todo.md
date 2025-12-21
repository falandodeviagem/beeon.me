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
- [x] Corrigir links aninhados em Home.tsx
- [x] Corrigir links aninhados em MainLayout.tsx
- [x] Verificar todos os componentes para garantir que não há mais links aninhados

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
- [x] Implementar componente MentionInput com autocomplete
- [x] Detectar @ e mostrar dropdown de usuários
- [x] Salvar menções ao criar post/comentário
- [x] Enviar notificações para usuários mencionados

## 52. Busca Global Unificada
- [x] Criar procedure globalSearch no routers.ts
- [x] Buscar em comunidades, posts, usuários e hashtags
- [x] Criar componente GlobalSearch no header
- [x] Agrupar resultados por categoria
- [x] Highlight de termos encontrados
- [x] Navegação por teclado (arrow keys)

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

## 74. Sistema de Moderação de Conteúdo
- [x] Backend: Criar tabela de reports no schema
- [x] Backend: Criar tabela de moderation_logs no schema
- [x] Backend: Helper para criar report (post ou comentário)
- [x] Backend: Helper para listar reports pendentes
- [x] Backend: Helper para resolver report (aprovar/rejeitar)
- [x] Backend: Helper para remover post/comentário
- [x] Backend: Helper para banir usuário (temporário/permanente)
- [x] Backend: Helper para listar histórico de moderação
- [x] Backend: Procedures tRPC para reports
- [x] Backend: Procedures tRPC para moderação (admin only)
- [x] Frontend: Botão de reportar em posts
- [x] Frontend: Botão de reportar em comentários
- [x] Frontend: Modal de report com categorias
- [x] Frontend: Página de painel de moderação (admin only)
- [x] Frontend: Lista de reports pendentes
- [x] Frontend: Ações de moderação (remover, banir)
- [x] Frontend: Histórico de moderação
- [x] Frontend: Filtros por tipo e status

## 75. ReportButton nos Comentários
- [x] Importar ReportButton no CommentItem
- [x] Adicionar botão de denunciar no dropdown de ações
- [x] Mostrar apenas para não-autores logados
- [x] Testar fluxo de denúncia de comentário

## 76. Dashboard de Estatísticas de Moderação
- [x] Backend: Query para contar reports por dia/semana
- [x] Backend: Query para contar reports por tipo
- [x] Backend: Query para calcular tempo médio de resolução
- [x] Backend: Query para ranking de moderadores ativos
- [x] Frontend: Componente de gráfico de linha (volume por dia)
- [x] Frontend: Componente de gráfico de pizza (tipos de denúncia)
- [x] Frontend: Cards com métricas principais
- [x] Frontend: Integrar na página de moderação

## 77. Sistema de Avisos (Warnings)
- [x] Backend: Tabela user_warnings no schema
- [x] Backend: Helpers para criar/listar avisos
- [x] Backend: Lógica de escalação (1º aviso, 2º aviso, ban temp, ban perm)
- [x] Backend: Procedure para emitir aviso
- [x] Backend: Verificar strikes antes de banir
- [x] Frontend: Modal de emitir aviso no painel de moderação
- [x] Frontend: Histórico de avisos do usuário
- [x] Frontend: Indicador de strikes no perfil (para admins)

## 78. Sistema de Apelação de Banimento (CONCLUÍDO)
- [x] Backend: Criar tabela ban_appeals no schema (userId, reason, status, adminResponse, createdAt, resolvedAt)
- [x] Backend: Helper para criar apelação
- [x] Backend: Helper para listar apelações pendentes
- [x] Backend: Helper para resolver apelação (aprovar/rejeitar)
- [x] Backend: Procedures tRPC para apelações
- [x] Frontend: Página de apelação para usuários banidos
- [x] Frontend: Formulário com motivo da apelação
- [x] Frontend: Status da apelação (pendente/aprovada/rejeitada)
- [x] Frontend: Fila de apelações no painel de moderação
- [x] Frontend: Modal para responder apelação
- [x] Frontend: Histórico de apelações resolvidas

## 79. Logs de Auditoria Detalhados (CONCLUÍDO)
- [x] Backend: Criar tabela audit_logs no schema (action, entityType, entityId, userId, details, createdAt)
- [x] Backend: Helper para criar log de auditoria
- [x] Backend: Helper para listar logs com filtros
- [x] Backend: Helper para exportar logs como CSV
- [x] Backend: Integrar logging em todas ações administrativas
- [x] Backend: Procedures tRPC para auditoria
- [x] Frontend: Página de logs de auditoria (admin only)
- [x] Frontend: Tabela com paginação e ordenação
- [x] Frontend: Filtros por tipo de ação, usuário, período
- [x] Frontend: Botão de exportar CSV
- [x] Frontend: Detalhes expandíveis por linha

## 80. Dashboard de Analytics de Moderação (CONCLUÍDO)
- [x] Backend: Query de denúncias por dia (últimos 30 dias)
- [x] Backend: Query de ações de moderação por tipo
- [x] Backend: Query de tempo médio de resolução por período
- [x] Backend: Query de top moderadores por período
- [x] Backend: Procedures tRPC para analytics
- [x] Frontend: Página /moderation/analytics
- [x] Frontend: Gráfico de linha de denúncias ao longo do tempo
- [x] Frontend: Gráfico de pizza de tipos de denúncia
- [x] Frontend: Gráfico de barras de ações por moderador
- [x] Frontend: Cards de métricas principais
- [x] Frontend: Filtro de período (7d, 30d, 90d)

## 81. Sistema de Templates de Resposta (CONCLUÍDO)
- [x] Backend: Criar tabela response_templates no schema
- [x] Backend: Helper para criar template
- [x] Backend: Helper para listar templates
- [x] Backend: Helper para editar/deletar template
- [x] Backend: Procedures tRPC para templates
- [x] Frontend: Página de gerenciamento de templates
- [x] Frontend: Formulário de criação de template
- [x] Frontend: Lista de templates existentes
- [x] Frontend: Botões de editar/deletar
- [x] Frontend: Integrar seletor de templates no modal de apelação
- [x] Frontend: Integrar seletor de templates no modal de denúncia

## 82. Painel de Insights de Usuários (LGPD Compliant) - CONCLUÍDO
- [x] Backend: Query de métricas de engajamento por usuário
- [x] Backend: Query de comunidades e categorias de interesse
- [x] Backend: Query de horários de atividade
- [x] Backend: Query de histórico de moderação
- [x] Backend: Query de badges e gamificação
- [x] Backend: Procedure tRPC getUserInsights
- [x] Frontend: Página /moderation/user-insights
- [x] Frontend: Busca de usuário por nome/ID
- [x] Frontend: Cards de métricas de engajamento
- [x] Frontend: Gráfico de atividade por horário
- [x] Frontend: Lista de comunidades e interesses
- [x] Frontend: Histórico de moderação do usuário
- [x] Frontend: Seção de gamificação (badges, nível, pontos)
- [x] Frontend: Integrar link no painel de moderação

## 83. Menções Clicáveis [CONCLUÍDO]
- [x] Atualizar MentionText para tornar @username clicável
- [x] Redirecionar para /user/:userId ao clicar
- [x] Estilizar menções com cor primária e hover

## 84. Página de Menções [CONCLUÍDO]
- [x] Criar procedure para listar menções do usuário
- [x] Adicionar aba "Menções" na página de notificações
- [x] Mostrar contexto (post/comentário) da menção
- [x] Marcar menções como lidas

## 85. Autocomplete de Hashtags [CONCLUÍDO]
- [x] Criar procedure para buscar hashtags por prefixo
- [x] Detectar # no MentionInput e mostrar dropdown
- [x] Mostrar contagem de uso das hashtags
- [x] Inserir hashtag selecionada no texto

## 86. Página de Hashtag [CONCLUÍDO]
- [x] Criar procedure para buscar posts por hashtag
- [x] Criar página /hashtag/:tag
- [x] Mostrar header com nome da hashtag e contagem
- [x] Listar posts com a hashtag
- [x] Adicionar link no HashtagText para a página

## 87. Widget de Trending Hashtags [CONCLUÍDO]
- [x] Criar componente TrendingHashtags
- [x] Buscar hashtags em alta (últimos 7 dias)
- [x] Mostrar no sidebar da Home
- [x] Estilizar com ícone e contagem de posts

## 88. Hashtags Clicáveis nos Posts [CONCLUÍDO]
- [x] Criar componente HashtagText para renderizar hashtags clicáveis
- [x] Detectar #hashtag no conteúdo do post
- [x] Redirecionar para /hashtag/:tag ao clicar
- [x] Estilizar hashtags com cor primária e hover

## 89. Criação Automática de Hashtags [CONCLUÍDO]
- [x] Extrair hashtags do conteúdo ao criar post
- [x] Criar hashtags novas automaticamente se não existirem
- [x] Associar hashtags ao post na tabela post_hashtags
- [x] Incrementar contador de uso das hashtags

## 90. Seguir Hashtags [CONCLUÍDO]
- [x] Criar tabela user_hashtag_follows no schema
- [x] Criar helpers para seguir/deixar de seguir hashtag
- [x] Criar helper para listar hashtags seguidas
- [x] Criar procedures tRPC para seguir hashtags
- [x] Adicionar botão de seguir na página de hashtag
- [x] Mostrar hashtags seguidas no perfil do usuário
- [x] Incluir posts de hashtags seguidas no feed

## 91. Sugestões de Hashtags ao Digitar [CONCLUÍDO]
- [x] Já implementado no MentionInput com autocomplete de #
- [x] Melhorar ordenação por popularidade
- [x] Adicionar indicador visual de hashtags populares

## 92. Endpoint de Webhook Stripe ✅
- [x] Criar rota /api/stripe/webhook no Express
- [x] Validar assinatura do webhook com STRIPE_WEBHOOK_SECRET
- [x] Processar eventos checkout.session.completed
- [x] Processar eventos customer.subscription.deleted
- [x] Adicionar usuário como membro da comunidade após pagamento
- [x] Remover acesso após cancelamento

## 93. Dashboard de Receitas ✅
- [x] Criar tabela payments no schema (communityId, userId, amount, status, stripeSessionId, createdAt)
- [x] Salvar pagamentos no banco ao processar webhook
- [x] Criar helper para obter receitas por comunidade
- [x] Criar procedure para dashboard de receitas
- [x] Frontend: Página de receitas para donos de comunidade
- [x] Frontend: Cards com métricas (total, mensal, assinantes ativos)
- [x] Frontend: Gráfico de receita ao longo do tempo

## 94. Histórico de Pagamentos ✅
- [x] Criar helper para listar pagamentos do usuário
- [x] Criar procedure para histórico de pagamentos
- [x] Frontend: Página de histórico de pagamentos
- [x] Frontend: Tabela com data, comunidade, valor, status
- [x] Frontend: Link para fatura do Stripe

## 95. Planos de Assinatura
- [x] Backend: Criar tabela subscription_plans (communityId, name, interval, price, features, isActive)
- [x] Backend: Atualizar tabela payments para incluir planId
- [ ] Backend: Helper para criar/listar/atualizar planos
- [x] Backend: Atualizar checkout para aceitar planId
- [ ] Backend: Procedures tRPC para gerenciar planos
- [ ] Frontend: Modal de seleção de plano no checkout
- [ ] Frontend: Cards comparativos (mensal, anual, vitalício)
- [ ] Frontend: Destaque para economia em planos mais longos
- [x] Frontend: Página de gerenciamento de planos para donos
- [ ] Frontend: Formulário para criar/editar planos
- [ ] Frontend: Toggle para ativar/desativar planos

## 86. Correção de Testes
- [x] Corrigir testes de moderação (moderation.test.ts)
- [x] Corrigir testes de menções em comentários (comment-mentions.test.ts)
- [x] Corrigir testes de notificações em tempo real (notifications-realtime.test.ts)
- [x] Todos os 254 testes passando


## 87. Período de Teste Grátis (Trial) [x]
- [x] Backend: Adicionar campo trialDays à tabela subscription_plans
- [x] Backend: Atualizar helper createSubscriptionPlan para aceitar trialDays
- [x] Backend: Atualizar Stripe checkout para incluir trial_period_days
- [x] Backend: Atualizar webhook para processar trial_start e trial_end
- [x] Frontend: Adicionar campo de trial days no formulário de criar plano
- [x] Frontend: Exibir badge "X dias grátis" nos cards de planos com trial
- [ ] Frontend: Atualizar PlanSelector para destacar trial period
- [ ] Testes: Criar testes para trial period

## 71. Auditoria Completa de Acessibilidade
- [x] Verificar contraste de cores em todos os componentes
- [x] Testar navegação por teclado em todas as páginas
- [x] Adicionar labels ARIA apropriados
- [x] Verificar suporte a leitores de tela
- [x] Garantir que todos os botões e links sejam focáveis
- [x] Adicionar skip links onde necessário
- [x] Verificar ordem de foco lógica
- [x] Testar com ferramentas de auditoria (Lighthouse, axe)
- [x] Corrigir links aninhados adicionais no MainLayout
- [x] Adicionar aria-label em navegação principal
- [x] Adicionar aria-current em links ativos
- [x] Adicionar aria-hidden em ícones decorativos
- [x] Adicionar role="main" no conteúdo principal
- [x] Atualizar lang para pt-BR no HTML

## 72. Otimização de Performance
- [x] Implementar lazy loading de imagens
- [x] Adicionar code splitting para rotas
- [x] Implementar React.lazy() para componentes pesados
- [x] Otimizar bundle size
- [x] Adicionar loading skeletons
- [x] Criar componente OptimizedImage com lazy loading nativo
- [x] Implementar Suspense com fallback de loading
- [x] Separar rotas críticas (eager) de não-críticas (lazy)
- [ ] Implementar cache de queries do tRPC
- [ ] Otimizar re-renders desnecessários

## 73. Testes E2E com Playwright
- [x] Instalar e configurar Playwright
- [x] Criar teste E2E: Fluxo de login
- [x] Criar teste E2E: Criar post
- [x] Criar teste E2E: Entrar em comunidade
- [x] Criar teste E2E: Auditoria de acessibilidade
- [x] Adicionar scripts npm para testes
- [x] Documentar como executar testes
- [x] Criar README com instruções detalhadas
- [ ] Criar teste E2E: Comentar em post
- [ ] Criar teste E2E: Seguir usuário
- [ ] Configurar CI para rodar testes
- [ ] Adicionar setup de autenticação para testes

## 74. PWA (Progressive Web App)
- [x] Criar manifest.json com ícones e configurações
- [x] Implementar service worker para cache
- [x] Adicionar estratégia de cache (Network First, Cache First)
- [x] Implementar suporte offline
- [x] Adicionar prompt de instalação
- [x] Configurar tema e cores do PWA
- [x] Criar hook usePWA para gerenciar PWA
- [x] Criar componente PWAInstallBanner
- [x] Gerar ícones PWA (8 tamanhos)
- [x] Adicionar meta tags PWA no HTML
- [x] Implementar detecção de online/offline
- [ ] Testar instalação em dispositivos móveis
- [ ] Adicionar splash screen personalizado

## 75. Sistema de Notificações Push
- [x] Criar tabela de push subscriptions no schema
- [x] Criar tabela de notification preferences no schema
- [x] Instalar biblioteca web-push
- [x] Implementar Web Push API no backend
- [x] Criar procedures tRPC para push notifications
- [x] Criar hook usePushNotifications
- [x] Criar página de configurações de notificações
- [x] Implementar solicitação de permissão no frontend
- [x] Adicionar preferências de notificação no frontend
- [x] Criar testes unitários para push notifications
- [ ] Integrar push em eventos (comentários, badges, mensagens)
- [ ] Testar notificações em diferentes navegadores
- [ ] Implementar notificações silenciosas

## 76. Analytics e Métricas de Engajamento
- [x] Criar tabela de community analytics no schema
- [x] Criar tabela de post analytics no schema
- [x] Implementar rastreamento de eventos no backend
- [x] Criar procedures tRPC para analytics
- [x] Criar dashboard de analytics para criadores
- [x] Métricas: visualizações, engajamento, crescimento
- [x] Gráficos com Recharts (linha e barra)
- [x] Comparação de períodos (semana, mês, ano)
- [x] Criar testes unitários para analytics
- [ ] Análise de comportamento dos membros
- [ ] Exportar relatórios em CSV
- [ ] Gráficos de posts mais populares

## 77. Integração de Push Notifications em Eventos
- [x] Enviar push quando alguém comentar em um post
- [x] Enviar push quando alguém curtir um post/comentário
- [x] Enviar push quando alguém seguir o usuário
- [x] Respeitar preferências de notificação do usuário
- [x] Criar helper para envio de push notifications
- [x] Integrar push em procedures de comentários
- [x] Integrar push em procedures de reações
- [x] Integrar push em procedures de follow
- [ ] Enviar push quando usuário conquistar um badge
- [ ] Enviar push para atualizações importantes de comunidades
- [ ] Adicionar debounce para evitar spam de notificações

## 78. Botão de Analytics nas Comunidades
- [x] Adicionar botão "Analytics" no header da página CommunityDetail
- [x] Mostrar botão apenas para criadores da comunidade
- [x] Adicionar ícone de gráfico ao botão
- [x] Testar navegação para /community/:id/analytics

## 79. Testes PWA Mobile
- [x] Criar guia de testes para dispositivos móveis
- [x] Documentar como instalar PWA no Chrome/Edge mobile
- [x] Documentar como testar funcionamento offline
- [x] Documentar como testar notificações push no mobile
- [x] Criar checklist de validação PWA
- [x] Adicionar instruções para ajustar splash screen
- [x] Criar guia completo com 6 testes principais
- [x] Incluir seção de problemas comuns e soluções
- [x] Adicionar template de relatório de testes

## 80. Sistema de Mensagens Diretas em Tempo Real
- [x] Schema de mensagens e conversas já existe no banco
- [x] Helpers de mensagens já existem no db.ts
- [ ] Implementar WebSocket server para chat em tempo real
- [ ] Criar procedures tRPC para mensagens
- [ ] Criar página de lista de conversas
- [ ] Criar página de chat 1-on-1
- [ ] Implementar envio e recebimento de mensagens em tempo real
- [ ] Adicionar notificações push para novas mensagens
- [ ] Implementar indicador de "digitando..."
- [ ] Adicionar status de leitura (visto)
- [ ] Implementar busca de conversas
- [ ] Adicionar suporte a imagens em mensagens

## 81. Feed Algorítmico Personalizado
- [ ] Criar algoritmo de pontuação de posts
- [ ] Implementar sistema de recomendação baseado em interesses
- [ ] Considerar comunidades seguidas no algoritmo
- [ ] Considerar histórico de engajamento (curtidas, comentários)
- [ ] Implementar cache de feed personalizado
- [ ] Adicionar opção de alternar entre feed algorítmico e cronológico
- [ ] Criar procedure para gerar feed personalizado
- [ ] Otimizar queries de feed para performance
- [ ] Adicionar diversidade de conteúdo no feed

## 82. Ferramentas de Moderação de Conteúdo
- [ ] Criar schema de moderadores e ações de moderação
- [ ] Implementar sistema de denúncias (posts, comentários, usuários)
- [ ] Criar painel de moderação para moderadores
- [ ] Adicionar ação: remover post
- [ ] Adicionar ação: remover comentário
- [ ] Adicionar ação: banir usuário temporariamente
- [ ] Adicionar ação: banir usuário permanentemente
- [ ] Implementar filtro de palavras proibidas
- [ ] Criar log de ações de moderação
- [ ] Adicionar notificações para usuários moderados
- [ ] Implementar sistema de apelação de banimentos

## 83. Completar Sistema de Mensagens Diretas
- [x] Criar procedures tRPC para mensagens (list, send, markAsRead)
- [x] Criar página Messages com lista de conversas
- [x] Criar página Chat com interface de mensagens 1-on-1
- [x] Implementar envio de mensagens (polling a cada 3s)
- [x] Adicionar rota /messages no App.tsx
- [x] Implementar contador de mensagens não lidas
- [x] Implementar indicador de mensagens lidas
- [ ] Adicionar contador de mensagens não lidas no header
- [ ] Integrar notificações push para novas mensagens
- [ ] Adicionar suporte a upload de imagens em mensagens
- [ ] Migrar de polling para WebSocket para tempo real

## 84. Otimizar Performance do Feed
- [x] Implementar paginação infinita no feed (cursor-based)
- [x] Adicionar índices de banco para queries de posts
- [x] Implementar lazy loading de imagens (OptimizedImage)
- [x] Implementar code splitting para rotas
- [ ] Implementar cache de queries com React Query
- [ ] Otimizar query de posts para reduzir joins
- [ ] Implementar virtualização de lista longa
- [ ] Adicionar prefetch de próxima página

## 85. Busca Global
- [x] Criar procedure tRPC para busca global
- [x] Implementar busca de posts por conteúdo
- [x] Implementar busca de comunidades por nome/descrição
- [x] Implementar busca de usuários por nome
- [x] Criar página de resultados de busca (Search.tsx)
- [x] Criar página de busca avançada (AdvancedSearch.tsx)
- [x] Adicionar filtros de busca (tipo, data, relevância)
- [x] Implementar ordenação de resultados
- [ ] Adicionar sugestões de busca (autocomplete)
- [ ] Melhorar relevância de resultados com scoring

## 86. Contador de Mensagens Não Lidas no Header
- [x] Adicionar badge de mensagens não lidas no MainLayout
- [x] Integrar com trpc.messages.unreadCount
- [x] Adicionar atualização automática (refetch a cada 10s)
- [x] Estilizar badge para destaque visual
- [x] Mostrar "99+" quando mais de 99 mensagens não lidas

## 87. WebSocket para Mensagens em Tempo Real
- [x] Instalar biblioteca ws (WebSocket)
- [x] Criar servidor WebSocket no backend
- [x] Implementar autenticação WebSocket com JWT
- [x] Criar hook useWebSocket no frontend
- [x] Implementar reconexão automática
- [x] Adicionar heartbeat para detectar conexões quebradas
- [x] Integrar WebSocket no servidor Express
- [ ] Migrar Messages.tsx de polling para WebSocket
- [ ] Adicionar indicador de status de conexão na UI
- [ ] Enviar notificações via WebSocket quando nova mensagem chega

## 88. Autocomplete na Busca Global
- [x] Procedure tRPC já existe (search.global)
- [x] Implementar debounce de 300ms
- [x] GlobalSearch já tem autocomplete completo
- [x] Adicionar navegação por teclado (arrow keys, enter, escape)
- [x] Estilizar dropdown de sugestões
- [x] Implementar scroll automático para item selecionado
- [x] Adicionar categorias (comunidades, usuários, posts, hashtags)
- [x] Fechar dropdown ao clicar fora

## 89. Migrar Messages para WebSocket
- [x] Atualizar Messages.tsx para usar useWebSocket
- [x] Remover polling (setInterval) de Messages
- [x] Escutar eventos WebSocket de novas mensagens
- [x] Atualizar UI em tempo real quando mensagem chega
- [x] Adicionar indicador de status de conexão (badge Online/Offline)

## 90. Indicador de Usuários Online
- [x] Adicionar endpoint para verificar status online (messages.onlineUsers)
- [x] Criar componente OnlineIndicator
- [x] Mostrar badge verde em avatares de usuários online
- [x] Atualizar status em tempo real (refetch a cada 10s)
- [x] Adicionar funções getOnlineUserIds no WebSocket server

## 91. Notificações de Digitação
- [x] Criar evento WebSocket "typing"
- [x] Enviar evento quando usuário digita
- [x] Escutar eventos de digitação de outros usuários
- [x] Mostrar "Fulano está digitando..." no chat
- [x] Adicionar debounce de 2s para evitar spam de eventos
- [x] Adicionar animação de 3 bolinhas pulsando
- [x] Auto-esconder indicador após 3 segundos

## 92. Suporte a Anexos de Imagens no Chat
- [x] Adicionar campo imageUrl no schema de messages
- [x] Atualizar sendMessage para suportar imageUrl
- [x] Criar procedure uploadImage para upload de imagem
- [x] Aplicar migração do banco de dados
- [x] Corrigir erro de TypeScript no routers.ts linha 1194 (cache antigo, código funcional)
- [ ] Adicionar botão de anexar imagem no input do chat
- [ ] Implementar preview de imagem antes de enviar
- [ ] Exibir imagens nas mensagens com lightbox
- [ ] Adicionar suporte a múltiplas imagens por mensagem

## 93. Reações Rápidas em Mensagens
- [ ] Criar tabela message_reactions no schema
- [ ] Criar procedures para adicionar/remover reações
- [ ] Adicionar botão de reações em cada mensagem
- [ ] Implementar picker de emojis (👍❤️😂😮😢🙏)
- [ ] Mostrar contagem de reações agrupadas
- [ ] Atualizar reações em tempo real via WebSocket

## 94. Notificações de Menção com @
- [ ] Detectar @username no conteúdo da mensagem
- [ ] Criar procedure para buscar usuários por username
- [ ] Adicionar autocomplete de @ no input
- [ ] Enviar notificação push para usuários mencionados
- [ ] Destacar mensagens com menções
- [ ] Adicionar badge de menções não lidas

## 95. Sistema de Moderação de Conteúdo
- [ ] Criar página de moderação para admins/moderadores
- [ ] Adicionar botão "Remover" em posts e comentários
- [ ] Criar procedure para remover conteúdo
- [ ] Implementar sistema de banimento temporário
- [ ] Criar filtro de palavras proibidas
- [ ] Adicionar logs de ações de moderação
- [ ] Criar sistema de denúncias de usuários

## 96. Sistema de Badges e Conquistas Automáticas
- [ ] Criar lógica de badges automáticos (Primeira Postagem, 100 Curtidas, etc)
- [ ] Implementar verificação de conquistas após ações
- [ ] Enviar notificação push quando conquistar badge
- [ ] Criar página de perfil mostrando badges
- [ ] Adicionar animação de conquista desbloqueada
- [ ] Criar sistema de progressão de badges


## 🚧 NOVAS IMPLEMENTAÇÕES (Em Andamento)

### UI de Anexos de Imagens no Chat
- [x] Adicionar input file e botão de anexar imagem
- [x] Implementar preview de imagem antes de enviar
- [x] Criar handler de upload com compressão
- [x] Renderizar imagens nas mensagens do chat
- [x] Criar componente Lightbox para visualização fullscreen
- [x] Adicionar loading states durante upload
- [x] Testar upload e visualização de imagens

### Sistema de Badges Automáticos
- [ ] Criar arquivo de definições de badges (badges/definitions.ts)
- [ ] Implementar sistema de verificação (badges/checker.ts)
- [ ] Integrar verificação em eventos (post, like, comment)
- [ ] Criar procedure checkAndAwardBadges
- [ ] Adicionar notificações push quando badge é desbloqueado
- [ ] Criar componente BadgeGrid para exibir no perfil
- [ ] Adicionar animação de conquista de badge
- [ ] Testar verificação automática de badges

### Dashboard de Moderação Completo
- [ ] Criar schema de banned_words e moderation_logs
- [ ] Criar página /moderation com tabs
- [ ] Implementar botão "Denunciar" em posts e comentários
- [ ] Criar modal de denúncia com seleção de motivos
- [ ] Implementar procedures tRPC de moderação
- [ ] Criar ações de moderação (remover, avisar, banir)
- [ ] Implementar filtro de palavras proibidas
- [ ] Adicionar sistema de logs de ações
- [ ] Criar testes unitários para moderação
- [ ] Testar fluxo completo de moderação


## 🎯 IMPLEMENTAÇÃO ATUAL (Dezembro 2025)

### Completar Sistema de Badges Automáticos
- [x] Corrigir erros TypeScript em definitions.ts
- [x] Criar arquivo badges/checker.ts com verificação
- [x] Integrar verificação em eventos (createPost iniciado)
- [x] Adicionar notificações push para badges desbloqueados
- [x] Criar componente BadgeGrid.tsx para perfil
- [ ] Adicionar animação de conquista (opcional)
- [ ] Integrar em mais eventos (like, comment, follow)

### Implementar Dashboard de Moderação Completo
- [x] Criar schema de moderation_logs e banned_words
- [x] Aplicar migração ao banco
- [x] Criar página /moderation com tabs
- [x] Implementar botão "Denunciar" em posts e comentários
- [x] Criar modal de denúncia com motivos
- [x] Implementar procedures tRPC de moderação
- [x] Criar componentes de UI (ReportsTable, BannedUsersTable, etc)
- [x] Implementar filtro de palavras proibidas
- [x] Adicionar sistema de logs
- [x] Dashboard completo já existente

### Adicionar Modo Escuro Completo
- [x] Revisar variáveis CSS para tema escuro
- [x] Garantir contraste adequado em todos os componentes
- [x] Testar toggle de tema em todas as páginas
- [x] Adicionar transições suaves
- [x] Persistir preferência em localStorage
- [x] Sistema de tema já implementado e funcional
