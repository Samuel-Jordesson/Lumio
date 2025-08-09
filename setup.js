const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando SocialBC...\n');

// Função para executar comandos
function runCommand(command, cwd = '.') {
  try {
    console.log(`📦 Executando: ${command}`);
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Erro ao executar: ${command}`);
    return false;
  }
}

// Função para criar arquivo .env no backend
function createEnvFile() {
  const envContent = `DATABASE_URL="file:./dev.db"
JWT_SECRET="socialbc-super-secret-key-change-in-production"
PORT=5000
NODE_ENV=development`;

  const envPath = path.join(__dirname, 'backend', '.env');
  
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env criado no backend');
  } else {
    console.log('ℹ️  Arquivo .env já existe no backend');
  }
}

// Função para criar diretório uploads
function createUploadsDir() {
  const uploadsPath = path.join(__dirname, 'backend', 'uploads');
  
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('✅ Diretório uploads criado');
  } else {
    console.log('ℹ️  Diretório uploads já existe');
  }
}

// Função para criar avatar padrão
function createDefaultAvatar() {
  const publicPath = path.join(__dirname, 'frontend', 'public');
  const avatarPath = path.join(publicPath, 'default-avatar.png');
  
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }
  
  if (!fs.existsSync(avatarPath)) {
    // Criar um arquivo placeholder (você pode substituir por uma imagem real)
    const placeholderContent = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    fs.writeFileSync(avatarPath, Buffer.from(placeholderContent.split(',')[1], 'base64'));
    console.log('✅ Avatar padrão criado');
  } else {
    console.log('ℹ️  Avatar padrão já existe');
  }
}

async function setup() {
  console.log('1️⃣ Instalando dependências do projeto principal...');
  if (!runCommand('npm install')) {
    console.error('❌ Falha ao instalar dependências do projeto principal');
    process.exit(1);
  }

  console.log('\n2️⃣ Instalando dependências do frontend...');
  if (!runCommand('npm install', 'frontend')) {
    console.error('❌ Falha ao instalar dependências do frontend');
    process.exit(1);
  }

  console.log('\n3️⃣ Instalando dependências do backend...');
  if (!runCommand('npm install', 'backend')) {
    console.error('❌ Falha ao instalar dependências do backend');
    process.exit(1);
  }

  console.log('\n4️⃣ Configurando arquivos...');
  createEnvFile();
  createUploadsDir();
  createDefaultAvatar();

  console.log('\n5️⃣ Configurando banco de dados...');
  if (!runCommand('npx prisma generate', 'backend')) {
    console.error('❌ Falha ao gerar cliente Prisma');
    process.exit(1);
  }

  if (!runCommand('npx prisma db push', 'backend')) {
    console.error('❌ Falha ao configurar banco de dados');
    process.exit(1);
  }

  console.log('\n✅ Setup concluído com sucesso!');
  console.log('\n🎉 Para iniciar o projeto:');
  console.log('   npm run dev');
  console.log('\n📱 Frontend: http://localhost:3000');
  console.log('🔧 Backend: http://localhost:5000');
  console.log('\n📚 Consulte o README.md para mais informações');
}

setup().catch(console.error);
