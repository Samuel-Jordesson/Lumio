#!/usr/bin/env node

// Build script manual para contornar problemas de permissão no Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Iniciando build manual do frontend...');

try {
  // Usar node diretamente em vez de npx
  console.log('📦 Executando Vite build...');
  
  const vitePath = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
  
  if (fs.existsSync(vitePath)) {
    console.log('✅ Vite encontrado, executando...');
    execSync(`node "${vitePath}" build`, { 
      stdio: 'inherit',
      cwd: __dirname
    });
  } else {
    console.log('⚠️ Vite não encontrado, tentando npx...');
    execSync('npx --yes vite build', { 
      stdio: 'inherit',
      cwd: __dirname
    });
  }
  
  console.log('✅ Build concluído com sucesso!');
  
} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}
