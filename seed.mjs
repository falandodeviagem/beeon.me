import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.js';
import 'dotenv/config';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('🌱 Iniciando seed do banco de dados...');

// Limpar dados existentes (cuidado em produção!)
console.log('🗑️  Limpando dados antigos...');
await db.delete(schema.postReactions);
await db.delete(schema.postLikes);
await db.delete(schema.commentLikes);
await db.delete(schema.comments);
await db.delete(schema.posts);
await db.delete(schema.messages);
await db.delete(schema.conversations);
await db.delete(schema.userFollows);
await db.delete(schema.communityMembers);
await db.delete(schema.communities);
await db.delete(schema.notifications);
await db.delete(schema.userBadges);
await db.delete(schema.gamificationActions);
await db.delete(schema.reports);
await db.delete(schema.users);

// Criar usuários
console.log('👥 Criando usuários...');
const users = [
  { openId: 'user1', name: 'Ana Silva', email: 'ana@example.com', bio: 'Apaixonada por tecnologia e inovação 🚀', avatar: null, points: 2600, level: 27, role: 'admin' },
  { openId: 'user2', name: 'Bruno Costa', email: 'bruno@example.com', bio: 'Desenvolvedor full-stack | Coffee lover ☕', avatar: null, points: 1800, level: 18, role: 'user' },
  { openId: 'user3', name: 'Carla Mendes', email: 'carla@example.com', bio: 'Designer UX/UI | Criando experiências incríveis ✨', avatar: null, points: 2100, level: 21, role: 'user' },
  { openId: 'user4', name: 'Diego Santos', email: 'diego@example.com', bio: 'Empreendedor digital | Sempre aprendendo 📚', avatar: null, points: 1500, level: 15, role: 'user' },
  { openId: 'user5', name: 'Elena Rodrigues', email: 'elena@example.com', bio: 'Marketing digital | Growth hacker 📈', avatar: null, points: 1900, level: 19, role: 'user' },
  { openId: 'user6', name: 'Felipe Alves', email: 'felipe@example.com', bio: 'Fotógrafo profissional | Capturando momentos 📸', avatar: null, points: 1200, level: 12, role: 'user' },
  { openId: 'user7', name: 'Gabriela Lima', email: 'gabriela@example.com', bio: 'Escritora e poeta | Palavras são minha paixão ✍️', avatar: null, points: 1600, level: 16, role: 'user' },
  { openId: 'user8', name: 'Hugo Ferreira', email: 'hugo@example.com', bio: 'Músico independente | Rock and roll 🎸', avatar: null, points: 1400, level: 14, role: 'user' },
];

const userIds = [];
for (const user of users) {
  const [result] = await db.insert(schema.users).values(user);
  userIds.push(Number(result.insertId));
}

// Criar comunidades
console.log('🏘️  Criando comunidades...');
const communities = [
  { name: 'Tecnologia e Inovação', description: 'Discussões sobre as últimas tendências em tech, startups e inovação digital', isPaid: false, price: 0, ownerId: userIds[0], memberCount: 0 },
  { name: 'Design Criativo', description: 'Comunidade para designers compartilharem trabalhos, dicas e inspirações', isPaid: false, price: 0, ownerId: userIds[2], memberCount: 0 },
  { name: 'Empreendedorismo Premium', description: 'Networking exclusivo, mentorias e conteúdo avançado para empreendedores', isPaid: true, price: 4999, ownerId: userIds[3], memberCount: 0 },
  { name: 'Fotografia Profissional', description: 'Técnicas avançadas, equipamentos e oportunidades para fotógrafos', isPaid: true, price: 2999, ownerId: userIds[5], memberCount: 0 },
  { name: 'Desenvolvimento Web', description: 'Comunidade de devs: tutoriais, code reviews e projetos colaborativos', isPaid: false, price: 0, ownerId: userIds[1], memberCount: 0 },
];

const communityIds = [];
for (const community of communities) {
  const [result] = await db.insert(schema.communities).values(community);
  communityIds.push(Number(result.insertId));
}

// Adicionar membros às comunidades
console.log('👨‍👩‍👧‍👦 Adicionando membros às comunidades...');
const memberships = [
  // Tecnologia e Inovação (todos)
  ...userIds.map(userId => ({ userId, communityId: communityIds[0], role: userId === userIds[0] ? 'admin' : 'member' })),
  // Design Criativo
  { userId: userIds[2], communityId: communityIds[1], role: 'admin' },
  { userId: userIds[0], communityId: communityIds[1], role: 'member' },
  { userId: userIds[4], communityId: communityIds[1], role: 'member' },
  { userId: userIds[6], communityId: communityIds[1], role: 'member' },
  // Empreendedorismo Premium
  { userId: userIds[3], communityId: communityIds[2], role: 'admin' },
  { userId: userIds[0], communityId: communityIds[2], role: 'member' },
  { userId: userIds[4], communityId: communityIds[2], role: 'member' },
  // Fotografia Profissional
  { userId: userIds[5], communityId: communityIds[3], role: 'admin' },
  { userId: userIds[2], communityId: communityIds[3], role: 'member' },
  // Desenvolvimento Web
  { userId: userIds[1], communityId: communityIds[4], role: 'admin' },
  { userId: userIds[0], communityId: communityIds[4], role: 'member' },
  { userId: userIds[3], communityId: communityIds[4], role: 'member' },
  { userId: userIds[7], communityId: communityIds[4], role: 'member' },
];

for (const membership of memberships) {
  await db.insert(schema.communityMembers).values(membership);
}

// Atualizar contadores de membros
for (let i = 0; i < communityIds.length; i++) {
  const count = memberships.filter(m => m.communityId === communityIds[i]).length;
  await db.update(schema.communities)
    .set({ memberCount: count })
    .where(eq(schema.communities.id, communityIds[i]));
}

// Criar posts
console.log('📝 Criando posts...');
const posts = [
  { content: 'Acabei de lançar meu novo projeto! Uma plataforma de networking para empreendedores. O que acham? 🚀', imageUrl: null, authorId: userIds[0], communityId: communityIds[0], likeCount: 0, commentCount: 0, shareCount: 0 },
  { content: 'Dica de produtividade: use a técnica Pomodoro! 25min focado + 5min de pausa. Funciona demais! ⏰', imageUrl: null, authorId: userIds[1], communityId: communityIds[0], likeCount: 0, commentCount: 0, shareCount: 0 },
  { content: 'Alguém mais está animado com as novidades do React 19? As Server Actions vão mudar tudo! 💙', imageUrl: null, authorId: userIds[1], communityId: communityIds[4], likeCount: 0, commentCount: 0, shareCount: 0 },
  { content: 'Compartilhando meu workflow de design: Figma → Prototipagem → Testes com usuários → Iteração. Qual é o de vocês? 🎨', imageUrl: null, authorId: userIds[2], communityId: communityIds[1], likeCount: 0, commentCount: 0, shareCount: 0 },
  { content: 'Acabei de validar minha ideia de negócio com 50 entrevistas. Próximo passo: MVP! Quem quer acompanhar a jornada? 💼', imageUrl: null, authorId: userIds[3], communityId: communityIds[2], likeCount: 0, commentCount: 0, shareCount: 0 },
  { content: 'Golden hour hoje estava perfeito! Consegui algumas fotos incríveis no parque. A luz natural é tudo! 📸✨', imageUrl: null, authorId: userIds[5], communityId: communityIds[3], likeCount: 0, commentCount: 0, shareCount: 0 },
  { content: 'Reflexão do dia: o marketing digital não é sobre vender, é sobre construir relacionamentos genuínos. 💚', imageUrl: null, authorId: userIds[4], communityId: communityIds[0], likeCount: 0, commentCount: 0, shareCount: 0 },
  { content: 'Acabei de terminar meu novo poema. Alguém mais aqui escreve? Adoraria trocar ideias! ✍️📖', imageUrl: null, authorId: userIds[6], communityId: communityIds[0], likeCount: 0, commentCount: 0, shareCount: 0 },
  { content: 'Ensaio da banda hoje! Estamos preparando um setlist incrível para o próximo show. Rock on! 🎸🔥', imageUrl: null, authorId: userIds[7], communityId: communityIds[0], likeCount: 0, commentCount: 0, shareCount: 0 },
  { content: 'Tutorial: Como criar animações suaves com Framer Motion. Vou postar um vídeo em breve! 🎬', imageUrl: null, authorId: userIds[1], communityId: communityIds[4], likeCount: 0, commentCount: 0, shareCount: 0 },
  { content: 'Qual ferramenta de prototipagem vocês preferem? Figma, Adobe XD ou Sketch? Quero ouvir opiniões! 🤔', imageUrl: null, authorId: userIds[2], communityId: communityIds[1], likeCount: 0, commentCount: 0, shareCount: 0 },
  { content: 'Lição aprendida: validar antes de construir economiza MUITO tempo e dinheiro. Não cometa meu erro! 💡', imageUrl: null, authorId: userIds[3], communityId: communityIds[2], likeCount: 0, commentCount: 0, shareCount: 0 },
  { content: 'Investir em equipamento fotográfico ou em cursos? Minha opinião: conhecimento sempre vem primeiro! 📚', imageUrl: null, authorId: userIds[5], communityId: communityIds[3], likeCount: 0, commentCount: 0, shareCount: 0 },
  { content: 'SEO em 2024: conteúdo de qualidade ainda é rei, mas a experiência do usuário está cada vez mais importante! 👑', imageUrl: null, authorId: userIds[4], communityId: communityIds[0], likeCount: 0, commentCount: 0, shareCount: 0 },
  { content: 'Acabei de publicar meu primeiro livro de poesias! Disponível em todas as plataformas digitais. 📚❤️', imageUrl: null, authorId: userIds[6], communityId: communityIds[0], likeCount: 0, commentCount: 0, shareCount: 0 },
];

const postIds = [];
for (const post of posts) {
  const [result] = await db.insert(schema.posts).values(post);
  postIds.push(Number(result.insertId));
}

// Criar comentários
console.log('💬 Criando comentários...');
const comments = [
  { content: 'Parabéns pelo lançamento! Vou testar e dar feedback 🎉', postId: postIds[0], authorId: userIds[1], likeCount: 0 },
  { content: 'Adorei a ideia! Quando vai estar disponível?', postId: postIds[0], authorId: userIds[3], likeCount: 0 },
  { content: 'Uso Pomodoro há anos, realmente funciona! 👍', postId: postIds[1], authorId: userIds[2], likeCount: 0 },
  { content: 'React 19 está incrível mesmo! Já testou as Server Actions?', postId: postIds[2], authorId: userIds[0], likeCount: 0 },
  { content: 'Meu workflow é parecido! Adiciono também testes A/B no final', postId: postIds[3], authorId: userIds[4], likeCount: 0 },
  { content: 'Que legal! Vou acompanhar sim. Boa sorte! 🍀', postId: postIds[4], authorId: userIds[0], likeCount: 0 },
  { content: 'Suas fotos são sempre incríveis! 📸', postId: postIds[5], authorId: userIds[2], likeCount: 0 },
  { content: 'Concordo 100%! Marketing é sobre pessoas, não produtos', postId: postIds[6], authorId: userIds[3], likeCount: 0 },
  { content: 'Eu escrevo também! Vamos trocar ideias sim 📝', postId: postIds[7], authorId: userIds[4], likeCount: 0 },
  { content: 'Mal posso esperar pelo show! 🤘', postId: postIds[8], authorId: userIds[6], likeCount: 0 },
  { content: 'Framer Motion é demais! Ansioso pelo tutorial', postId: postIds[9], authorId: userIds[3], likeCount: 0 },
  { content: 'Figma sem dúvidas! A colaboração em tempo real é game changer', postId: postIds[10], authorId: userIds[0], likeCount: 0 },
  { content: 'Aprendi isso da pior forma também 😅 Ótimo conselho!', postId: postIds[11], authorId: userIds[4], likeCount: 0 },
  { content: 'Concordo! Técnica vem antes de equipamento sempre', postId: postIds[12], authorId: userIds[2], likeCount: 0 },
  { content: 'Core Web Vitals estão cada vez mais importantes também!', postId: postIds[13], authorId: userIds[1], likeCount: 0 },
  { content: 'Parabéns! Onde posso comprar? 📚', postId: postIds[14], authorId: userIds[5], likeCount: 0 },
];

for (const comment of comments) {
  await db.insert(schema.comments).values(comment);
}

// Atualizar contadores de comentários
for (let i = 0; i < postIds.length; i++) {
  const count = comments.filter(c => c.postId === postIds[i]).length;
  if (count > 0) {
    await db.update(schema.posts)
      .set({ commentCount: count })
      .where(eq(schema.posts.id, postIds[i]));
  }
}

// Criar reações
console.log('❤️  Criando reações...');
const reactions = [
  { postId: postIds[0], userId: userIds[1], reactionType: 'love' },
  { postId: postIds[0], userId: userIds[2], reactionType: 'like' },
  { postId: postIds[0], userId: userIds[3], reactionType: 'wow' },
  { postId: postIds[1], userId: userIds[0], reactionType: 'like' },
  { postId: postIds[1], userId: userIds[2], reactionType: 'like' },
  { postId: postIds[2], userId: userIds[0], reactionType: 'love' },
  { postId: postIds[2], userId: userIds[3], reactionType: 'like' },
  { postId: postIds[3], userId: userIds[0], reactionType: 'like' },
  { postId: postIds[3], userId: userIds[4], reactionType: 'love' },
  { postId: postIds[4], userId: userIds[0], reactionType: 'wow' },
  { postId: postIds[5], userId: userIds[2], reactionType: 'love' },
  { postId: postIds[6], userId: userIds[3], reactionType: 'like' },
  { postId: postIds[7], userId: userIds[4], reactionType: 'love' },
  { postId: postIds[8], userId: userIds[6], reactionType: 'like' },
  { postId: postIds[9], userId: userIds[3], reactionType: 'like' },
  { postId: postIds[10], userId: userIds[0], reactionType: 'like' },
  { postId: postIds[11], userId: userIds[4], reactionType: 'laugh' },
  { postId: postIds[12], userId: userIds[2], reactionType: 'like' },
  { postId: postIds[13], userId: userIds[1], reactionType: 'like' },
  { postId: postIds[14], userId: userIds[5], reactionType: 'love' },
];

for (const reaction of reactions) {
  await db.insert(schema.postReactions).values(reaction);
}

// Criar relacionamentos de follows
console.log('🤝 Criando relacionamentos...');
const follows = [
  { followerId: userIds[0], followingId: userIds[1] },
  { followerId: userIds[0], followingId: userIds[2] },
  { followerId: userIds[1], followingId: userIds[0] },
  { followerId: userIds[2], followingId: userIds[0] },
  { followerId: userIds[3], followingId: userIds[0] },
  { followerId: userIds[4], followingId: userIds[0] },
  { followerId: userIds[1], followingId: userIds[2] },
  { followerId: userIds[2], followingId: userIds[1] },
];

for (const follow of follows) {
  await db.insert(schema.userFollows).values(follow);
}

// Contadores de seguidores serão calculados dinamicamente pelas queries

console.log('✅ Seed concluído com sucesso!');
console.log(`
📊 Resumo:
- ${users.length} usuários criados
- ${communities.length} comunidades criadas
- ${memberships.length} membros adicionados
- ${posts.length} posts criados
- ${comments.length} comentários criados
- ${reactions.length} reações adicionadas
- ${follows.length} relacionamentos de follow criados

🎉 Banco de dados populado e pronto para uso!
`);

await connection.end();
process.exit(0);
