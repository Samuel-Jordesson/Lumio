#!/bin/bash

# Script de build para o Render
echo "🚀 Iniciando build do frontend..."

# Instalar dependências
npm ci

# Build da aplicação
npm run build

echo "✅ Build do frontend concluído!"
