#!/bin/bash

# Script de build para o Render
echo "🚀 Iniciando build do backend..."

# Instalar dependências
npm ci

# Gerar cliente Prisma
npx prisma generate

# Push do schema para o banco (cria as tabelas)
npx prisma db push

echo "✅ Build do backend concluído!"
