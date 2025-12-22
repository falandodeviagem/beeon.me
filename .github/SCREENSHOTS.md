# 📸 Screenshots do Projeto

Este arquivo contém instruções para adicionar screenshots ao README.md

## Screenshots Necessários

Para completar a documentação, capture os seguintes screenshots:

### 1. Feed Principal (Home)
- **Caminho**: `/`
- **O que mostrar**: Feed com posts, filtros, sidebar
- **Nome do arquivo**: `feed-home.png`
- **Dimensões recomendadas**: 1920x1080

### 2. Perfil do Usuário com Badges
- **Caminho**: `/profile/:userId`
- **O que mostrar**: Perfil completo com BadgeProgress e BadgeGrid
- **Nome do arquivo**: `profile-badges.png`
- **Dimensões recomendadas**: 1920x1080

### 3. Chat em Tempo Real
- **Caminho**: `/messages`
- **O que mostrar**: Interface de chat com conversas e mensagens
- **Nome do arquivo**: `chat-messages.png`
- **Dimensões recomendadas**: 1920x1080

### 4. Dashboard de Moderação
- **Caminho**: `/moderation`
- **O que mostrar**: Painel de moderação com denúncias
- **Nome do arquivo**: `moderation-dashboard.png`
- **Dimensões recomendadas**: 1920x1080

### 5. Comunidade
- **Caminho**: `/community/:id`
- **O que mostrar**: Página de comunidade com posts
- **Nome do arquivo**: `community-page.png`
- **Dimensões recomendadas**: 1920x1080

## Como Adicionar Screenshots

1. **Capturar screenshots**:
   - Acesse https://3000-iqz9n4dazb5t7kk9tycj3-07f76c86.manusvm.computer
   - Navegue até cada página listada acima
   - Capture screenshot em tela cheia (F11 no navegador)
   - Salve com o nome especificado

2. **Adicionar ao repositório**:
   ```bash
   # Copie os screenshots para o diretório
   cp ~/Downloads/*.png .github/screenshots/
   
   # Adicione ao git
   git add .github/screenshots/
   git commit -m "docs: adicionar screenshots do projeto"
   git push origin main
   ```

3. **Atualizar README.md**:
   - Localize a seção "## 🎯 Sobre o Projeto"
   - Adicione as imagens após o parágrafo de introdução:
   
   ```markdown
   ## 🎯 Sobre o Projeto
   
   **BeeOn.me** é uma rede social completa desenvolvida com as tecnologias mais modernas do mercado...
   
   ### 📸 Screenshots
   
   <div align="center">
   
   #### Feed Principal
   ![Feed](.github/screenshots/feed-home.png)
   
   #### Perfil com Sistema de Badges
   ![Perfil](.github/screenshots/profile-badges.png)
   
   #### Chat em Tempo Real
   ![Chat](.github/screenshots/chat-messages.png)
   
   #### Dashboard de Moderação
   ![Moderação](.github/screenshots/moderation-dashboard.png)
   
   #### Página de Comunidade
   ![Comunidade](.github/screenshots/community-page.png)
   
   </div>
   ```

4. **Commit e push**:
   ```bash
   git add README.md
   git commit -m "docs: adicionar screenshots ao README"
   git push origin main
   ```

## Dicas para Bons Screenshots

- ✅ Use modo claro ou escuro consistentemente
- ✅ Preencha com dados realistas (não "test test test")
- ✅ Mostre funcionalidades principais em ação
- ✅ Capture em resolução alta (1920x1080 ou superior)
- ✅ Evite informações sensíveis (emails reais, etc)
- ✅ Use ferramentas como [Cleanshot](https://cleanshot.com/) ou [ShareX](https://getsharex.com/) para capturas profissionais
