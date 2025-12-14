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
