#!/bin/bash

# Script de build para o Render
echo "🚀 Iniciando build do backend..."

# Instalar dependências
npm install

# Gerar cliente Prisma
npx prisma generate

# Deploy das migrations para PostgreSQL
npx prisma migrate deploy

echo "✅ Build do backend concluído!"
