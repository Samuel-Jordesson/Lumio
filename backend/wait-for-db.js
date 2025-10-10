// Script para aguardar o banco de dados estar disponível
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function waitForDatabase(maxRetries = 30, delay = 2000) {
  console.log('🔄 Aguardando banco de dados ficar disponível...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Banco de dados conectado com sucesso!');
      return true;
    } catch (error) {
      console.log(`⏳ Tentativa ${i + 1}/${maxRetries} - Banco ainda não disponível: ${error.message}`);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('❌ Falha ao conectar com o banco de dados após todas as tentativas');
  process.exit(1);
}

module.exports = { waitForDatabase };
