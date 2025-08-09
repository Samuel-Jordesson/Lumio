# 🚀 Deploy no Render - Lumio

Este guia explica como fazer deploy da aplicação Lumio no Render.

## 📋 Pré-requisitos

1. Conta no GitHub
2. Conta no Render (gratuita): https://render.com
3. Código do projeto no GitHub

## 🗃️ 1. Criar o Banco de Dados

1. **Acesse o Render Dashboard**
2. **Clique em "New +"**
3. **Selecione "PostgreSQL"**
4. **Configure:**
   - Name: `lumio-database`
   - Database: `lumio`
   - User: `lumio_user`
   - Region: `Oregon (US West)`
   - Plan: `Free`
5. **Clique em "Create Database"**
6. **Anote a "Internal Database URL"** (será usada depois)

## 🔧 2. Deploy do Backend

1. **No Render Dashboard, clique em "New +"**
2. **Selecione "Web Service"**
3. **Conecte seu repositório GitHub**
4. **Configure:**

   - Name: `lumio-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Region: `Oregon (US West)`
   - Branch: `main`
   - Build Command: `npm ci && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`

5. **Adicione as variáveis de ambiente:**

   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=[Cole a Internal Database URL do PostgreSQL]
   JWT_SECRET=[Gere uma chave secreta forte - pode usar: https://generate-secret.vercel.app/32]
   GOOGLE_CLIENT_ID=[Seu Google Client ID]
   GOOGLE_CLIENT_SECRET=[Seu Google Client Secret]
   ```

6. **Clique em "Create Web Service"**
7. **Aguarde o deploy (pode demorar 5-10 minutos)**
8. **Anote a URL do backend** (ex: `https://lumio-backend.onrender.com`)

## 🌐 3. Deploy do Frontend

1. **No Render Dashboard, clique em "New +"**
2. **Selecione "Static Site"**
3. **Conecte seu repositório GitHub**
4. **Configure:**

   - Name: `lumio-frontend`
   - Root Directory: `frontend`
   - Branch: `main`
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `dist`

5. **Adicione as variáveis de ambiente:**

   ```
   VITE_API_URL=https://lumio-backend.onrender.com
   ```

6. **Clique em "Create Static Site"**
7. **Aguarde o deploy (pode demorar 3-5 minutos)**

## ✅ 4. Testar a Aplicação

1. **Acesse a URL do frontend**
2. **Teste:**
   - ✅ Cadastro de usuário
   - ✅ Login
   - ✅ Criação de posts
   - ✅ Upload de imagens
   - ✅ Sistema de mensagens
   - ✅ Busca de usuários
   - ✅ Follow/Unfollow

## 🔧 Configurações Adicionais

### Google OAuth (Opcional)

1. **Acesse o Google Cloud Console**
2. **Vá em "APIs & Services" > "Credentials"**
3. **Edite seu OAuth 2.0 Client**
4. **Adicione nas "Authorized redirect URIs":**
   ```
   https://[seu-frontend].onrender.com
   ```

### Domínio Personalizado (Opcional)

1. **No painel do frontend no Render**
2. **Vá em "Settings" > "Custom Domains"**
3. **Adicione seu domínio**
4. **Configure os DNS records conforme instruções**

## 🐛 Troubleshooting

### Backend não conecta com o banco

- Verifique se a `DATABASE_URL` está correta
- Certifique-se que o banco PostgreSQL está ativo

### Frontend não se conecta com backend

- Verifique se a `VITE_API_URL` está correta
- Confirme que o backend está rodando

### Erro de CORS

- Verifique se o domínio do frontend está nas configurações de CORS do backend

### Images não carregam

- No Render, arquivos enviados não persistem entre deploys
- Para produção, considere usar serviços como Cloudinary ou AWS S3

## 💡 Dicas

1. **Free Tier Limitations:**

   - Backend hiberna após 15 min de inatividade
   - Primeiro acesso pode demorar 30-60 segundos
   - 750 horas gratuitas por mês

2. **Monitoramento:**

   - Use os logs do Render para debug
   - Configure alertas para monitorar uptime

3. **Atualizações:**
   - Pushes na branch main fazem redeploy automático
   - Use branches para testar mudanças

## 🎉 Sucesso!

Sua aplicação Lumio está agora rodando no Render! 🚀

**URLs finais:**

- Frontend: `https://lumio-frontend.onrender.com`
- Backend: `https://lumio-backend.onrender.com`
- Banco: PostgreSQL gerenciado pelo Render
