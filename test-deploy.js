#!/usr/bin/env node

// Script para testar se tudo está pronto para deploy
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testando preparação para deploy Railway + Vercel...\n');

// Testes
const tests = [
  {
    name: 'Verificar se backend existe',
    test: () => fs.existsSync('backend/package.json')
  },
  {
    name: 'Verificar se frontend existe',
    test: () => fs.existsSync('frontend/package.json')
  },
  {
    name: 'Verificar railway.json',
    test: () => fs.existsSync('railway.json')
  },
  {
    name: 'Verificar vercel.json',
    test: () => fs.existsSync('frontend/vercel.json')
  },
  {
    name: 'Verificar se backend tem build script',
    test: () => {
      const pkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
      return pkg.scripts && pkg.scripts.start;
    }
  },
  {
    name: 'Verificar se frontend tem build script',
    test: () => {
      const pkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
      return pkg.scripts && pkg.scripts.build;
    }
  },
  {
    name: 'Verificar se CORS está configurado',
    test: () => {
      const serverContent = fs.readFileSync('backend/src/server.js', 'utf8');
      return serverContent.includes('vercel.app') && serverContent.includes('railway.app');
    }
  },
  {
    name: 'Verificar se health check existe',
    test: () => {
      const serverContent = fs.readFileSync('backend/src/server.js', 'utf8');
      return serverContent.includes('/api/health');
    }
  }
];

let passed = 0;
let total = tests.length;

console.log('📋 Executando testes...\n');

tests.forEach((test, index) => {
  try {
    const result = test.test();
    if (result) {
      console.log(`✅ ${index + 1}. ${test.name}`);
      passed++;
    } else {
      console.log(`❌ ${index + 1}. ${test.name}`);
    }
  } catch (error) {
    console.log(`❌ ${index + 1}. ${test.name} - Erro: ${error.message}`);
  }
});

console.log(`\n📊 Resultado: ${passed}/${total} testes passaram`);

if (passed === total) {
  console.log('\n🎉 Tudo pronto para deploy!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Faça commit e push do código');
  console.log('2. Configure Railway (backend)');
  console.log('3. Configure Vercel (frontend)');
  console.log('4. Teste as URLs');
  console.log('\n🚀 Boa sorte com o deploy!');
} else {
  console.log('\n⚠️  Alguns testes falharam. Verifique os erros acima.');
  process.exit(1);
}
