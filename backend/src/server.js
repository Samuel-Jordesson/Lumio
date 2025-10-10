const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://localhost:3000", 
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.onrender\.com$/,
      /^https:\/\/.*\.railway\.app$/,
      "https://lumio-brown.vercel.app",
      "https://frontend-lumio-az9k-en13h6lps-samueljordessons-projects.vercel.app",
      "https://backend-lumio-production.up.railway.app",
      "https://lumio-frontend.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Configure trust proxy for Railway
app.set('trust proxy', 1);

// Middleware - Configurar Helmet com CSP mais permissivo para desenvolvimento
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Desabilitar CSP temporariamente para debug
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://localhost:3000",
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/.*\.onrender\.com$/,
    "https://lumio-brown.vercel.app",
    "https://frontend-lumio-az9k-en13h6lps-samueljordessons-projects.vercel.app",
    "https://backend-lumio-production.up.railway.app",
    "https://lumio-frontend.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Accept-Language", "Content-Language"]
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - Configuração mais permissiva para desenvolvimento
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (aumentado para desenvolvimento)
  trustProxy: true, // trust Railway proxy
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular rate limiting em desenvolvimento local
    return process.env.NODE_ENV === 'development' && req.ip === '::1';
  }
});
app.use('/api/', limiter);

// Static files - Temporary compatibility for old uploads (will be removed when all images are Base64)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Testar conexão com o banco
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({ 
      status: 'OK', 
      message: 'Lumio API is running!',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      database: 'Disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
})

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    return next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
  
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    console.log(`Rooms for user ${socket.userId}:`, Array.from(socket.rooms));
  });
  
  socket.on('leave-conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.userId} left conversation ${conversationId}`);
  });

  // Eventos de digitação
  socket.on('typing-start', (conversationId) => {
    socket.to(conversationId).emit('user-typing', {
      userId: socket.userId,
      conversationId,
      isTyping: true
    });
  });

  socket.on('typing-stop', (conversationId) => {
    socket.to(conversationId).emit('user-typing', {
      userId: socket.userId,
      conversationId,
      isTyping: false
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/notifications', require('./routes/notifications'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
