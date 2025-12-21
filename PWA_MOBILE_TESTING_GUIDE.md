# 📱 Guia de Testes PWA Mobile - BeeOn.me

Este guia fornece instruções detalhadas para testar o Progressive Web App (PWA) do BeeOn.me em dispositivos móveis.

---

## 📋 Pré-requisitos

- Dispositivo Android ou iOS
- Navegador compatível:
  - **Android**: Chrome 90+ ou Edge 90+
  - **iOS**: Safari 16.4+ (iOS 16.4+)
- Conexão à internet (para instalação inicial)
- Conta no BeeOn.me

---

## 🚀 Teste 1: Instalação do PWA

### Android (Chrome/Edge)

1. **Abrir o site**
   - Acesse https://beeonme.manus.space no Chrome/Edge
   - Aguarde o carregamento completo da página

2. **Instalar o app**
   - Método 1: Clique no banner "Instalar BeeOn.me" que aparece no topo da página
   - Método 2: Toque no menu (⋮) > "Adicionar à tela inicial" ou "Instalar app"
   
3. **Confirmar instalação**
   - Toque em "Instalar" ou "Adicionar"
   - O ícone do BeeOn.me aparecerá na tela inicial

4. **Abrir o app instalado**
   - Toque no ícone do BeeOn.me na tela inicial
   - O app deve abrir em tela cheia, sem a barra de endereço do navegador

### iOS (Safari)

1. **Abrir o site**
   - Acesse https://beeonme.manus.space no Safari
   - Aguarde o carregamento completo

2. **Adicionar à tela inicial**
   - Toque no botão de compartilhar (quadrado com seta para cima)
   - Role para baixo e toque em "Adicionar à Tela de Início"
   - Edite o nome se desejar e toque em "Adicionar"

3. **Abrir o app instalado**
   - Toque no ícone do BeeOn.me na tela inicial
   - O app deve abrir em tela cheia

### ✅ Checklist de Instalação

- [ ] Banner de instalação aparece automaticamente (Android)
- [ ] Ícone do app aparece na tela inicial após instalação
- [ ] App abre em tela cheia (sem barra de navegador)
- [ ] Ícone do app tem boa resolução (não pixelizado)
- [ ] Nome do app está correto ("BeeOn.me")
- [ ] Splash screen aparece durante o carregamento (Android)

---

## 🔌 Teste 2: Funcionamento Offline

### Preparação

1. **Usar o app online primeiro**
   - Abra o app instalado
   - Faça login na sua conta
   - Navegue por algumas páginas (feed, comunidades, perfil)
   - Aguarde 5-10 segundos em cada página

2. **Ativar modo offline**
   - Ative o modo avião no dispositivo
   - OU desative Wi-Fi e dados móveis

### Testes Offline

1. **Abrir o app offline**
   - Feche completamente o app (remova da lista de apps recentes)
   - Abra o app novamente
   - **Esperado**: App deve abrir normalmente

2. **Navegar entre páginas**
   - Tente acessar páginas visitadas anteriormente
   - **Esperado**: Páginas em cache devem carregar

3. **Tentar ações que requerem internet**
   - Tente criar um post
   - Tente comentar
   - **Esperado**: Mensagem de erro indicando falta de conexão

4. **Reconectar**
   - Desative o modo avião
   - Recarregue a página
   - **Esperado**: Conteúdo atualiza automaticamente

### ✅ Checklist Offline

- [ ] App abre offline (mostra conteúdo em cache)
- [ ] Páginas visitadas anteriormente carregam offline
- [ ] Mensagem clara quando ação requer internet
- [ ] Indicador de status online/offline visível
- [ ] Conteúdo sincroniza automaticamente ao reconectar
- [ ] Imagens em cache carregam offline

---

## 🔔 Teste 3: Notificações Push

### Ativar Notificações

1. **Permitir notificações no navegador**
   - Abra o app
   - Vá para Configurações > Notificações
   - Toque em "Ativar" notificações push
   - Permita notificações quando solicitado pelo sistema

2. **Configurar preferências**
   - Ative/desative tipos específicos de notificações:
     - Comentários
     - Curtidas
     - Novos seguidores
     - Badges
     - Atualizações de comunidades
   - Salve as configurações

### Testar Notificações

1. **Enviar notificação de teste**
   - Na página de Configurações > Notificações
   - Toque em "Enviar Notificação de Teste"
   - **Esperado**: Notificação aparece no dispositivo

2. **Testar notificação real - Comentário**
   - Peça a outro usuário para comentar em seu post
   - **Esperado**: Notificação aparece mostrando o comentário

3. **Testar notificação real - Curtida**
   - Peça a outro usuário para curtir seu post
   - **Esperado**: Notificação aparece mostrando a curtida

4. **Testar notificação real - Seguidor**
   - Peça a outro usuário para seguir você
   - **Esperado**: Notificação aparece mostrando o novo seguidor

5. **Testar com app fechado**
   - Feche completamente o app
   - Peça a alguém para interagir com seu conteúdo
   - **Esperado**: Notificação aparece mesmo com app fechado

6. **Clicar na notificação**
   - Toque na notificação recebida
   - **Esperado**: App abre na página relevante (post, perfil, etc.)

### ✅ Checklist Push Notifications

- [ ] Solicitação de permissão aparece corretamente
- [ ] Notificação de teste funciona
- [ ] Notificações de comentários funcionam
- [ ] Notificações de curtidas funcionam
- [ ] Notificações de seguidores funcionam
- [ ] Notificações aparecem com app fechado
- [ ] Clicar na notificação abre a página correta
- [ ] Ícone e imagem da notificação aparecem
- [ ] Texto da notificação está claro e completo
- [ ] Preferências de notificação são respeitadas

---

## 🎨 Teste 4: Experiência Visual

### Ícones e Splash Screen

1. **Verificar ícone na tela inicial**
   - Ícone tem boa resolução
   - Cores estão corretas
   - Formato está adequado (circular/quadrado)

2. **Verificar splash screen (Android)**
   - Abra o app instalado
   - Observe a tela de carregamento inicial
   - **Esperado**: Splash screen com logo do BeeOn.me

### Interface Responsiva

1. **Testar em orientação retrato**
   - Navegue pelo app em modo retrato
   - **Esperado**: Layout se ajusta corretamente

2. **Testar em orientação paisagem**
   - Gire o dispositivo para modo paisagem
   - **Esperado**: Layout se adapta sem quebrar

3. **Testar em diferentes tamanhos de tela**
   - Teste em celular pequeno (< 5")
   - Teste em celular grande (> 6")
   - Teste em tablet
   - **Esperado**: Interface responsiva em todos

### ✅ Checklist Visual

- [ ] Ícone do app tem boa qualidade
- [ ] Splash screen aparece e está bonito
- [ ] Interface funciona em modo retrato
- [ ] Interface funciona em modo paisagem
- [ ] Botões são fáceis de tocar (tamanho adequado)
- [ ] Texto é legível em telas pequenas
- [ ] Não há elementos cortados ou sobrepostos

---

## 🔐 Teste 5: Autenticação e Segurança

### Login Persistente

1. **Fazer login no app**
   - Abra o app instalado
   - Faça login com sua conta

2. **Fechar e reabrir**
   - Feche completamente o app
   - Abra novamente
   - **Esperado**: Usuário continua logado

3. **Testar após reiniciar dispositivo**
   - Reinicie o dispositivo
   - Abra o app
   - **Esperado**: Usuário continua logado

### ✅ Checklist Autenticação

- [ ] Login persiste após fechar o app
- [ ] Login persiste após reiniciar dispositivo
- [ ] Logout funciona corretamente
- [ ] Dados sensíveis não ficam visíveis

---

## 📊 Teste 6: Performance

### Velocidade de Carregamento

1. **Primeira abertura (com cache limpo)**
   - Desinstale e reinstale o app
   - Abra o app
   - Meça o tempo até a página estar interativa
   - **Meta**: < 3 segundos

2. **Aberturas subsequentes**
   - Feche e reabra o app
   - Meça o tempo de carregamento
   - **Meta**: < 1 segundo

### Navegação

1. **Testar transições entre páginas**
   - Navegue entre diferentes seções
   - **Esperado**: Transições suaves, sem travamentos

2. **Testar scroll**
   - Role o feed de posts
   - **Esperado**: Scroll fluido, sem lag

### ✅ Checklist Performance

- [ ] App carrega em menos de 3 segundos (primeira vez)
- [ ] App carrega em menos de 1 segundo (subsequentes)
- [ ] Navegação é suave e responsiva
- [ ] Scroll é fluido
- [ ] Não há travamentos ou crashes
- [ ] Consumo de bateria é razoável

---

## 🐛 Problemas Comuns e Soluções

### Problema: Banner de instalação não aparece (Android)

**Soluções**:
- Verifique se está usando Chrome/Edge atualizado
- Limpe o cache do navegador
- Acesse via HTTPS
- Aguarde alguns segundos na página

### Problema: Notificações não aparecem

**Soluções**:
- Verifique permissões de notificação nas configurações do sistema
- Certifique-se de que notificações estão ativadas no app
- Verifique se o modo "Não perturbe" está desativado
- Reinstale o app

### Problema: App não funciona offline

**Soluções**:
- Navegue pelas páginas online primeiro (para cache)
- Aguarde alguns segundos em cada página
- Verifique se o service worker está registrado (DevTools)

### Problema: Splash screen não aparece (Android)

**Soluções**:
- Verifique se os ícones estão carregando corretamente
- Limpe o cache e reinstale o app
- Teste em dispositivo diferente

---

## 📝 Relatório de Testes

Ao concluir os testes, preencha este relatório:

### Informações do Dispositivo
- **Dispositivo**: _________________
- **Sistema Operacional**: _________________
- **Navegador**: _________________
- **Versão do Navegador**: _________________

### Resultados dos Testes

| Teste | Status | Observações |
|-------|--------|-------------|
| Instalação do PWA | ⬜ Passou / ⬜ Falhou | |
| Funcionamento Offline | ⬜ Passou / ⬜ Falhou | |
| Notificações Push | ⬜ Passou / ⬜ Falhou | |
| Experiência Visual | ⬜ Passou / ⬜ Falhou | |
| Autenticação | ⬜ Passou / ⬜ Falhou | |
| Performance | ⬜ Passou / ⬜ Falhou | |

### Bugs Encontrados
1. _________________
2. _________________
3. _________________

### Sugestões de Melhoria
1. _________________
2. _________________
3. _________________

---

## 🎯 Critérios de Sucesso

O PWA é considerado pronto para produção quando:

- ✅ Instalação funciona em Android e iOS
- ✅ App funciona offline para páginas em cache
- ✅ Notificações push funcionam com app fechado
- ✅ Interface é responsiva em diferentes tamanhos de tela
- ✅ Login persiste após fechar o app
- ✅ Performance é aceitável (< 3s primeira carga, < 1s subsequentes)
- ✅ Não há bugs críticos que impeçam o uso

---

## 📞 Suporte

Se encontrar problemas durante os testes:
- Documente o bug com screenshots
- Inclua informações do dispositivo
- Descreva os passos para reproduzir
- Reporte no repositório ou para a equipe de desenvolvimento

---

**Última atualização**: Dezembro 2024  
**Versão do guia**: 1.0
