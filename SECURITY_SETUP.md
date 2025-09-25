# 🔒 CONFIGURAÇÃO DE SEGURANÇA - LUMIO

## ⚠️ IMPORTANTE: Configuração Obrigatória

Após este deploy, você DEVE configurar as variáveis de ambiente nos serviços de deploy para que o Google OAuth funcione corretamente.

## 🚀 CONFIGURAÇÃO NO RAILWAY (Backend)

1. **Acesse o Railway Dashboard**
2. **Vá para seu projeto backend**
3. **Clique em "Variables"**
4. **Adicione as seguintes variáveis:**

```
GOOGLE_CLIENT_ID=67187945075-kkibh65tnabbfo8qs6uej2ejon6256bc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

## 🌐 CONFIGURAÇÃO NO VERCEL (Frontend)

1. **Acesse o Vercel Dashboard**
2. **Vá para seu projeto frontend**
3. **Clique em "Settings" → "Environment Variables"**
4. **Adicione a seguinte variável:**

```
VITE_GOOGLE_CLIENT_ID=67187945075-kkibh65tnabbfo8qs6uej2ejon6256bc.apps.googleusercontent.com
```

## 🔧 CONFIGURAÇÃO LOCAL (Desenvolvimento)

### Backend (.env)
```env
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
DATABASE_URL=file:./dev.db
PORT=5000
NODE_ENV=development
GOOGLE_CLIENT_ID=67187945075-kkibh65tnabbfo8qs6uej2ejon6256bc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=67187945075-kkibh65tnabbfo8qs6uej2ejon6256bc.apps.googleusercontent.com
```

## ✅ MELHORIAS DE SEGURANÇA IMPLEMENTADAS

1. **✅ Google Client ID movido para variáveis de ambiente**
2. **✅ Arquivo com credenciais removido do repositório**
3. **✅ .gitignore atualizado para proteger credenciais**
4. **✅ Frontend e backend usando variáveis de ambiente**
5. **✅ Exemplo de configuração documentado**

## 🚨 PRÓXIMOS PASSOS

1. **Configure as variáveis no Railway e Vercel**
2. **Teste o login com Google**
3. **Verifique se tudo está funcionando**
4. **Considere gerar novas credenciais do Google para maior segurança**

## 🔐 DICAS DE SEGURANÇA ADICIONAIS

- **Nunca commite arquivos .env**
- **Use senhas fortes para JWT_SECRET**
- **Monitore logs de acesso**
- **Considere usar secrets managers em produção**
- **Revise permissões do Google OAuth regularmente**
