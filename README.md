# SocialBC - Rede Social de Barcarena

Uma rede social completa inspirada no Instagram e Facebook, desenvolvida para a comunidade de Barcarena.

## 🚀 Funcionalidades

### ✅ Implementadas

- **Autenticação completa** - Registro, login e logout
- **Perfil de usuário** - Edição de perfil, avatar, bio
- **Feed de posts** - Timeline com posts dos usuários seguidos
- **Sistema de posts** - Criar posts com texto e imagens (até 10)
- **Sistema de likes** - Curtir e descurtir posts
- **Sistema de comentários** - Comentar em posts com modal interativo
- **Sistema de seguir** - Seguir e deixar de seguir usuários
- **Mensagens em tempo real** - Chat com Socket.io e indicador de digitação
- **Sistema de notificações** - Notificações para likes, follows e comentários
- **Busca de usuários** - Busca com sugestões em tempo real
- **Exploração** - Ver posts recentes e usuários populares
- **Configurações de conta** - Alterar senha, email e username
- **Design responsivo** - Interface moderna e intuitiva
- **Logo personalizada** - Branding completo com favicon

### 🔄 Em desenvolvimento

- Stories
- Notificações push
- Compartilhamento de posts
- Filtros e hashtags
- Modo escuro

## 🛠️ Tecnologias Utilizadas

### Frontend

- **React 18** com TypeScript
- **Vite** para build rápido
- **React Router** para navegação
- **Tailwind CSS** para estilização
- **React Query** para gerenciamento de estado
- **React Hook Form** para formulários
- **Lucide React** para ícones
- **Framer Motion** para animações
- **Socket.io Client** para mensagens em tempo real

### Backend

- **Node.js** com Express
- **Prisma** como ORM
- **SQLite** como banco de dados
- **JWT** para autenticação
- **Multer** para upload de arquivos
- **Socket.io** para comunicação em tempo real
- **bcryptjs** para hash de senhas

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd socialbc
```

### 2. Instale as dependências

```bash
# Instalar dependências do projeto principal
npm install

# Instalar dependências do frontend
cd frontend
npm install

# Instalar dependências do backend
cd ../backend
npm install
```

### 3. Configure o banco de dados

```bash
cd backend

# Criar arquivo .env
echo 'DATABASE_URL="file:./dev.db"
JWT_SECRET="socialbc-super-secret-key-change-in-production"
PORT=5000
NODE_ENV=development' > .env

# Gerar cliente Prisma
npx prisma generate

# Criar e migrar banco de dados
npx prisma db push
```

### 4. Execute o projeto

```bash
# Na raiz do projeto
npm run dev
```

Isso irá iniciar:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🗄️ Estrutura do Banco de Dados

### Tabelas principais:

- **users** - Informações dos usuários
- **posts** - Posts dos usuários
- **likes** - Relacionamento de curtidas
- **comments** - Comentários nos posts
- **follows** - Relacionamento de seguidores
- **conversations** - Conversas entre usuários
- **messages** - Mensagens das conversas

## 🔧 APIs Disponíveis

### Autenticação

- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter usuário atual

### Usuários

- `GET /api/users/:username` - Obter perfil do usuário
- `GET /api/users/:username/posts` - Obter posts do usuário
- `PUT /api/users/profile` - Atualizar perfil
- `POST /api/users/:username/follow` - Seguir usuário
- `DELETE /api/users/:username/follow` - Deixar de seguir
- `GET /api/users/search` - Buscar usuários

### Posts

- `GET /api/posts` - Obter feed de posts
- `POST /api/posts` - Criar post
- `POST /api/posts/:id/like` - Curtir/descurtir post
- `GET /api/posts/trending` - Obter posts em alta

### Conversas

- `GET /api/conversations` - Obter conversas
- `GET /api/conversations/:id/messages` - Obter mensagens
- `POST /api/conversations/:id/messages` - Enviar mensagem
- `POST /api/conversations` - Criar conversa

## 🎨 Design System

### Cores

- **Primary**: Azul (#3b82f6)
- **Secondary**: Cinza (#64748b)
- **Success**: Verde (#10b981)
- **Warning**: Amarelo (#f59e0b)
- **Error**: Vermelho (#ef4444)

### Componentes

- Botões primários e secundários
- Campos de input padronizados
- Cards com sombras suaves
- Loading states com skeleton
- Modais responsivos

## 📱 Funcionalidades por Página

### Login/Registro

- Formulários com validação
- Toggle de visibilidade da senha
- Redirecionamento automático

### Feed

- Posts em tempo real
- Upload de imagens
- Sistema de likes
- Modal para criar posts

### Perfil

- Informações do usuário
- Estatísticas (seguidores, seguindo, posts)
- Lista de posts do usuário
- Botão de seguir/deixar de seguir

### Mensagens

- Lista de conversas
- Chat em tempo real
- Indicador de mensagens não lidas
- Busca de conversas

### Explorar

- Busca de usuários
- Posts em alta
- Sugestões de usuários para seguir

## 🔒 Segurança

- Autenticação JWT
- Hash de senhas com bcrypt
- Rate limiting
- Validação de dados
- Sanitização de inputs
- CORS configurado

## 🚀 Deploy

### Railway + Vercel (Recomendado)

O projeto está configurado para deploy automático:

- **Backend**: Railway (PostgreSQL + Node.js)
- **Frontend**: Vercel (React + Vite)

#### Configuração rápida:

1. **Railway (Backend)**:
   - Acesse: https://railway.app
   - Deploy from GitHub → Selecione o repositório
   - Adicione PostgreSQL
   - Configure variáveis: `NODE_ENV`, `JWT_SECRET`

2. **Vercel (Frontend)**:
   - Acesse: https://vercel.com
   - Import Git Repository → Selecione o repositório
   - Root Directory: `frontend`
   - Configure: `VITE_API_URL=https://seu-backend.railway.app`

### Alternativas

- **Render**: Tudo em um lugar (gratuito)
- **AWS**: EC2 + RDS + CloudFront (escalável)
- **Heroku**: Simples mas limitado

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Equipe

- **Desenvolvedor**: [Seu Nome]
- **Design**: [Designer]
- **Testes**: [QA]

## 📞 Suporte

Para suporte, envie um email para [seu-email@exemplo.com] ou abra uma issue no GitHub.

---

**SocialBC** - Conectando a comunidade de Barcarena! 🌟
