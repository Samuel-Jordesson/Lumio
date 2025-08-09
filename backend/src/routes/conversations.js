const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/conversations
// @desc    Get user conversations
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const conversationsWithData = conversations.map(conversation => {
      const otherParticipant = conversation.participants.find(
        p => p.user.id !== req.user.id
      );

      const lastMessage = conversation.messages[0];
      const unreadCount = conversation.messages.filter(
        m => !m.isFromMe && m.senderId !== req.user.id
      ).length;

      return {
        id: conversation.id,
        user: otherParticipant?.user,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isFromMe: lastMessage.senderId === req.user.id
        } : null,
        unreadCount
      };
    });

    res.json(conversationsWithData);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/conversations/:id/messages
// @desc    Get conversation messages
// @access  Private
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is part of this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        participants: {
          some: {
            userId: req.user.id
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages.map(message => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      isFromMe: message.senderId === req.user.id
    })));
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/conversations/:id/messages
// @desc    Send a message
// @access  Private
router.post('/:id/messages', auth, [
  body('content', 'Message content is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { id } = req.params;
    const { content } = req.body;

    // Check if user is part of this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        participants: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        participants: {
          where: {
            userId: { not: req.user.id }
          },
          include: {
            user: {
              select: { id: true }
            }
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const receiverId = conversation.participants[0]?.user.id;

    const message = await prisma.message.create({
      data: {
        content,
        senderId: req.user.id,
        receiverId,
        conversationId: id
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    // Emit via socket para todos na conversa
    try {
      const { io } = require('../server');
      if (io) {
        // Emite para todos na sala da conversa
        io.to(id).emit('new-message', {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          senderId: req.user.id,  // Adiciona senderId para identificar quem enviou
          isFromMe: false  // O frontend vai ajustar baseado no senderId
        });
        
        console.log(`Message emitted to conversation ${id} from user ${req.user.id}`);
      }
    } catch (error) {
      console.log('Socket error:', error);
    }

    res.json({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      isFromMe: true
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/conversations
// @desc    Create or get conversation with user
// @access  Private
router.post('/', auth, [
  body('userId', 'User ID is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { userId } = req.body;

    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    // Check if user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { userId: req.user.id }
            }
          },
          {
            participants: {
              some: { userId: userId }
            }
          }
        ]
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: req.user.id },
              { userId }
            ]
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true
                }
              }
            }
          }
        }
      });
    }

    const otherParticipant = conversation.participants.find(
      p => p.user.id !== req.user.id
    );

    res.json({
      id: conversation.id,
      user: otherParticipant?.user,
      lastMessage: null,
      unreadCount: 0
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
