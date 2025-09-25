# 🚀 DEPLOY RAILWAY + VERCEL - LUMIO

## 📋 CHECKLIST PRÉ-DEPLOY

- [ ] Código no GitHub
- [ ] Build funcionando local (`npm run dev`)
- [ ] Variáveis de ambiente preparadas
- [ ] CORS configurado

## 🔧 1. DEPLOY BACKEND NO RAILWAY

### Via GitHub (Recomendado):

1. **Acesse**: https://railway.app
2. **Login**: Conecte sua conta GitHub
3. **New Project**: "Deploy from GitHub repo"
4. **Selecione**: Seu repositório Lumio
5. **Configure**:
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`
6. **Adicione PostgreSQL**: "Add PostgreSQL" (gratuito)
7. **Variáveis de Ambiente**:
   ```
   NODE_ENV=production
   JWT_SECRET=sua_chave_secreta_super_forte_aqui
   GOOGLE_CLIENT_ID=seu_google_client_id
   GOOGLE_CLIENT_SECRET=seu_google_client_secret
   PORT=5000
   ```
8. **Deploy**: Automático após push no GitHub

### Via CLI (Alternativo):

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up

# Adicionar PostgreSQL
railway add postgresql
```

## 🌐 2. DEPLOY FRONTEND NO VERCEL

### Via GitHub (Recomendado):

1. **Acesse**: https://vercel.com
2. **Login**: Conecte sua conta GitHub
3. **New Project**: "Import Git Repository"
4. **Selecione**: Seu repositório Lumio
5. **Configure**:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. **Variável de Ambiente**:
   ```
   VITE_API_URL=https://seu-backend.railway.app
   ```
7. **Deploy**: Automático após push no GitHub

### Via CLI (Alternativo):

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel

# Adicionar variável de ambiente
vercel env add VITE_API_URL
# Valor: https://seu-backend.railway.app
```

## 🔗 3. CONFIGURAR INTEGRAÇÃO

### Atualizar CORS no Backend:

Após obter a URL do Vercel, adicione no backend:

```javascript
// backend/src/server.js
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://localhost:3000",
      /^https:\/\/.*\.vercel\.app$/,
      "https://seu-frontend.vercel.app", // SUA URL DO VERCEL
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

## 🧪 4. TESTAR DEPLOY

### URLs esperadas:

- **Frontend**: `https://seu-frontend.vercel.app`
- **Backend**: `https://seu-backend.railway.app`
- **API Health**: `https://seu-backend.railway.app/api/health`

### Testes:

```bash
# Testar API
curl https://seu-backend.railway.app/api/health

# Deve retornar:
# {"status":"OK","timestamp":"2024-..."}
```

## 🎯 5. CONFIGURAR DOMÍNIO PERSONALIZADO (OPCIONAL)

### Railway (Backend):
1. **Settings** → **Domains**
2. **Custom Domain**: `api.seu-dominio.com`
3. **Configure DNS**: CNAME para Railway

### Vercel (Frontend):
1. **Settings** → **Domains**
2. **Add Domain**: `seu-dominio.com`
3. **Configure DNS**: CNAME para Vercel

## 🚨 TROUBLESHOOTING

### ❌ CORS Error:
```javascript
// Adicionar sua URL do Vercel no CORS
origin: [
  "https://seu-frontend.vercel.app"
]
```

### ❌ Database Error:
```bash
# Verificar variáveis no Railway
railway variables
```

### ❌ Build Error:
```bash
# Verificar logs no Railway
railway logs
```

## 🎉 RESULTADO FINAL

Após seguir este guia:

✅ **Frontend**: https://seu-frontend.vercel.app
✅ **Backend**: https://seu-backend.railway.app
✅ **Database**: PostgreSQL 1GB (Railway)
✅ **SSL**: Automático em ambos
✅ **Deploy**: Automático via GitHub

## 💰 CUSTOS

- **Railway**: $5/mês (após trial gratuito)
- **Vercel**: Gratuito (frontend)
- **Total**: $5/mês

## 🚀 PRÓXIMOS PASSOS

1. **Testar todas as funcionalidades**
2. **Configurar domínio personalizado**
3. **Implementar CI/CD avançado**
4. **Configurar monitoramento**
5. **Otimizar performance**

---

**🎯 Sua aplicação estará online em 5-10 minutos!**
