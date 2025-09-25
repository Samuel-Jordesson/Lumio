const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const prisma = new PrismaClient();

// Google OAuth2 Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('name', 'Name is required').not().isEmpty(),
  body('username', 'Username is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { name, username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true
      }
    });

    // Create JWT token
    const payload = {
      userId: user.id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        ...user,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        password: true,
        avatar: true,
        bio: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Get user stats
    const [followersCount, followingCount, postsCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } }),
      prisma.post.count({ where: { authorId: user.id } })
    ]);

    // Create JWT token
    const payload = {
      userId: user.id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: {
        ...userWithoutPassword,
        followersCount,
        followingCount,
        postsCount
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const [followersCount, followingCount, postsCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: req.user.id } }),
      prisma.follow.count({ where: { followerId: req.user.id } }),
      prisma.post.count({ where: { authorId: req.user.id } })
    ]);

    res.json({
      ...req.user,
      followersCount,
      followingCount,
      postsCount
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    console.log('Received Google login request with token:', token ? 'present' : 'missing');

    if (!token) {
      return res.status(400).json({ message: 'Token do Google é obrigatório' });
    }

    // Verificar o token do Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    console.log('Google token verified successfully for user:', email);

    // Verificar se o usuário já existe pelo email
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Criar novo usuário se não existir
      const username = email.split('@')[0] + Math.random().toString(36).substring(2, 6);
      
      user = await prisma.user.create({
        data: {
          email,
          name,
          username,
          password: '', // Senha vazia para login com Google
          avatar: picture,
          bio: `Usuário registrado via Google`
        }
      });
    } else {
      // Atualizar avatar se veio do Google e não tem
      if (picture && !user.avatar) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatar: picture }
        });
      }
    }

    // Obter estatísticas do usuário
    const [followersCount, followingCount, postsCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } }),
      prisma.post.count({ where: { authorId: user.id } })
    ]);

    // Criar JWT token
    const jwtPayload = {
      userId: user.id
    };

    const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token: jwtToken,
      user: {
        ...userWithoutPassword,
        followersCount,
        followingCount,
        postsCount
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    if (error.message && error.message.includes('Token used too early')) {
      res.status(400).json({ message: 'Token do Google inválido ou expirado' });
    } else if (error.message && error.message.includes('Invalid token')) {
      res.status(400).json({ message: 'Token do Google inválido' });
    } else {
      res.status(500).json({ message: 'Erro no login com Google: ' + error.message });
    }
  }
});

module.exports = router;
