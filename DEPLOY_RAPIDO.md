# ⚡ DEPLOY RÁPIDO DO LUMIO

## 🎯 MÉTODO MAIS SIMPLES (5 MINUTOS)

### 1️⃣ RENDER (Tudo em um lugar)

```
1. Acesse: https://render.com
2. Conecte seu GitHub
3. Novo Web Service
4. Escolha seu repo
5. Configure:
   - Build Command: node build.js
   - Start Command: cd backend && npm start
   - Environment: Node
6. Adicione variáveis:
   - JWT_SECRET: gere uma senha forte
   - NODE_ENV: production
```

**Pronto! Seu app estará online em 3-5 minutos!**

### 2️⃣ RAILWAY + VERCEL (Mais rápido)

**Backend (Railway):**

```
1. https://railway.app
2. Deploy from GitHub
3. Selecionar pasta "backend"
4. Variáveis de ambiente automáticas
```

**Frontend (Vercel):**

```
1. https://vercel.com
2. Import do GitHub
3. Framework: Vite
4. Root Directory: frontend
```

### 3️⃣ NETLIFY (Alternativa)

```
1. https://netlify.com
2. Drag & Drop da pasta frontend/dist
3. Para backend: usar Netlify Functions
```

## 🔧 VARIÁVEIS OBRIGATÓRIAS

**Backend:**

- `JWT_SECRET`: qualquer string longa e aleatória
- `PORT`: 5000 (ou $PORT para Railway)
- `NODE_ENV`: production

**Frontend:**

- `VITE_API_URL`: URL do seu backend

## 🌐 URLS ESPERADAS

Após deploy você terá:

- **Frontend**: https://lumio.vercel.app
- **Backend**: https://lumio-api.railway.app
- **API**: https://lumio-api.railway.app/api/health

## 🚨 CHECKLIST FINAL

- [ ] Código no GitHub
- [ ] Build funcionando local
- [ ] Variáveis configuradas
- [ ] CORS configurado
- [ ] Health check respondendo
- [ ] Frontend conectando no backend

## 💡 DICAS PRO

1. **Teste local primeiro**: `npm run dev`
2. **Use nomes descritivos**: lumio-frontend, lumio-backend
3. **Configure domínio custom**: depois no Vercel/Railway
4. **Monitor logs**: Railway e Vercel têm logs em tempo real
5. **SSL automático**: Vercel e Railway incluem HTTPS

## 🆘 PROBLEMAS COMUNS

**❌ CORS Error:**

```javascript
// backend/src/server.js
const io = new Server(server, {
  cors: {
    origin: ["https://seu-frontend.vercel.app"],
    methods: ["GET", "POST"],
  },
});
```

**❌ API não conecta:**

- Verifique VITE_API_URL no frontend
- Teste a health check: /api/health

**❌ Database error:**

- Railway: usar PostgreSQL
- Render: SQLite funciona
- Vercel: precisa DB externo

## 🎉 RESULTADO

Seu Lumio estará online em:

- **Render**: ~5 minutos (mais simples)
- **Railway+Vercel**: ~3 minutos (mais rápido)
- **Netlify**: ~2 minutos (só frontend)

**🚀 Escolha o Render para começar - é o mais fácil!**
