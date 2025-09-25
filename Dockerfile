# Dockerfile para o backend
FROM node:18-alpine

WORKDIR /app

# Instalar OpenSSL para Prisma
RUN apk add --no-cache openssl

# Copiar package.json do backend
COPY backend/package*.json ./

# Instalar dependências (incluindo dev para Prisma CLI)
RUN npm install

# Copiar código do backend
COPY backend/ ./

# Executar Prisma generate
RUN npx prisma generate

# Criar diretório para uploads
RUN mkdir -p uploads

# Expor porta
EXPOSE 5000

# Comando para iniciar
CMD ["npm", "start"]
