const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// @route   POST /api/notifications/subscribe
// @desc    Subscribe user to push notifications
// @access  Private
router.post('/subscribe', auth, [
  body('subscription', 'Subscription is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { subscription } = req.body;

    // Atualizar subscription do usuário
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        pushSubscription: JSON.stringify(subscription)
      }
    });

    console.log(`Push subscription updated for user ${req.user.id}`);
    res.json({ message: 'Subscription updated successfully' });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/subscribe
// @desc    Unsubscribe user from push notifications
// @access  Private
router.delete('/subscribe', auth, async (req, res) => {
  try {
    // Remover subscription do usuário
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        pushSubscription: null
      }
    });

    console.log(`Push subscription removed for user ${req.user.id}`);
    res.json({ message: 'Subscription removed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notifications/subscribe
// @desc    Get user subscription status
// @access  Private
router.get('/subscribe', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { pushSubscription: true }
    });

    res.json({
      subscribed: !!user?.pushSubscription,
      subscription: user?.pushSubscription ? JSON.parse(user.pushSubscription) : null
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notifications/test
// @desc    Send test notification to user
// @access  Private
router.post('/test', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { 
        id: true, 
        name: true, 
        pushSubscription: true 
      }
    });

    if (!user?.pushSubscription) {
      return res.status(400).json({ message: 'User not subscribed to notifications' });
    }

    // Enviar notificação de teste
    const notificationData = {
      title: 'Lumio - Teste',
      body: 'Esta é uma notificação de teste!',
      icon: '/Group 140.png',
      tag: 'test-notification',
      data: {
        type: 'test',
        timestamp: Date.now()
      }
    };

    // TODO: Implementar envio real da notificação
    console.log(`Test notification for user ${req.user.id}:`, notificationData);

    res.json({ message: 'Test notification sent' });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;