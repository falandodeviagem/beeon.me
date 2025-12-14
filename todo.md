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
