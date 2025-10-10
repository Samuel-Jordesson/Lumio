// Script para manter o banco de dados ativo
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function keepAlive() {
  try {
    // Query simples para manter a conexão ativa
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection alive:', new Date().toISOString());
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Executar a cada 5 minutos
setInterval(keepAlive, 5 * 60 * 1000);

// Executar imediatamente
keepAlive();

console.log('🔄 Database keep-alive started');
