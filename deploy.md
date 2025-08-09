# 🚀 GUIA DE DEPLOY DO LUMIO

## 📋 REQUISITOS

- Conta no GitHub
- Conta no Vercel (grátis)
- Conta no Railway (grátis)

## 🔧 PASSO A PASSO

### 1️⃣ PREPARAR O CÓDIGO

1. **Subir para o GitHub:**

```bash
git add .
git commit -m "Deploy: Lumio ready for production"
git push origin main
```

### 2️⃣ DEPLOY DO BACKEND (Railway)

1. **Acesse:** https://railway.app
2. **Conecte sua conta GitHub**
3. **Clique em "New Project"**
4. **Selecione "Deploy from GitHub repo"**
5. **Escolha seu repositório do Lumio**
6. **Configure as variáveis de ambiente:**

   - `JWT_SECRET`: gere uma string aleatória segura
   - `PORT`: 5000
   - `NODE_ENV`: production
   - `GOOGLE_CLIENT_ID`: seu client ID do Google

7. **Deploy automático será iniciado!**

### 3️⃣ DEPLOY DO FRONTEND (Vercel)

1. **Acesse:** https://vercel.com
2. **Importe seu projeto do GitHub**
3. **Configure:**

   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `cd frontend && npm install`

4. **Adicione variável de ambiente:**
   - `VITE_API_URL`: URL do seu backend no Railway

### 4️⃣ CONFIGURAR CORS

Atualize o CORS no backend com a URL do frontend:

```javascript
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://seu-app.vercel.app"],
    methods: ["GET", "POST"],
  },
});
```

### 5️⃣ CONFIGURAR API NO FRONTEND

Atualize o arquivo de configuração da API:

```typescript
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
```

## 🌟 OPÇÕES ALTERNATIVAS

### Option A: RENDER (Tudo em um)

- Frontend + Backend juntos
- PostgreSQL grátis
- URL: https://render.com

### Option B: NETLIFY + SUPABASE

- Frontend no Netlify
- Backend/DB no Supabase
- Muito rápido e confiável

### Option C: HEROKU (Limitado)

- 550 horas grátis/mês
- Pode dormir após inatividade
- Boa para testes

## 📊 COMPARAÇÃO DE PREÇOS

| Serviço            | Frontend  | Backend   | DB         | Limite   |
| ------------------ | --------- | --------- | ---------- | -------- |
| Vercel + Railway   | ✅ Grátis | $5/mês    | SQLite     | Básico   |
| Render             | ✅ Grátis | ✅ Grátis | PostgreSQL | 750h/mês |
| Netlify + Supabase | ✅ Grátis | ✅ Grátis | PostgreSQL | 2GB      |

## 🎯 RECOMENDAÇÃO

**Para começar:** Vercel + Railway
**Para produção:** Render (mais simples)
**Para escalar:** Vercel + Supabase
