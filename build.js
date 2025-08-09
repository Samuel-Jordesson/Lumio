#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build do Lumio...\n');

try {
  // 1. Install dependencies
  console.log('📦 Instalando dependências do frontend...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  
  console.log('📦 Instalando dependências do backend...');
  execSync('cd backend && npm install', { stdio: 'inherit' });
  
  // 2. Build frontend
  console.log('🏗️  Fazendo build do frontend...');
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  
  // 3. Setup Prisma
  console.log('🗄️  Configurando banco de dados...');
  execSync('cd backend && npx prisma generate', { stdio: 'inherit' });
  execSync('cd backend && npx prisma db push', { stdio: 'inherit' });
  
  console.log('\n✅ Build concluído com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Faça push para o GitHub');
  console.log('2. Configure o deploy no Vercel (frontend)');
  console.log('3. Configure o deploy no Railway (backend)');
  console.log('4. Configure as variáveis de ambiente');
  
} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}
