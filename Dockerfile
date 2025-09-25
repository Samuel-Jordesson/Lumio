# Dockerfile para o backend
FROM node:18-alpine

WORKDIR /app

# Copiar package.json do backend
COPY backend/package*.json ./

# Instalar dependências
RUN npm install --only=production

# Copiar código do backend
COPY backend/ ./

# Criar diretório para uploads
RUN mkdir -p uploads

# Expor porta
EXPOSE 5000

# Comando para iniciar
CMD ["npm", "start"]
