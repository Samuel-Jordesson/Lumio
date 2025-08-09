const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

// IMPORTANTE: Rotas estáticas antes das rotas com :username
// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { username: { contains: q } }
        ],
        NOT: { id: req.user.id }
      },
      select: { id: true, name: true, username: true, avatar: true, bio: true },
      take: 10
    });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [followersCount, postsCount, isFollowing] = await Promise.all([
          prisma.follow.count({ where: { followingId: user.id } }),
          prisma.post.count({ where: { authorId: user.id } }),
          prisma.follow.findUnique({
            where: {
              followerId_followingId: { followerId: req.user.id, followingId: user.id }
            }
          })
        ]);

        return { ...user, followersCount, postsCount, isFollowing: !!isFollowing };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:username
// @desc    Get user profile
// @access  Private
router.get('/:username', auth, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
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

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [followersCount, followingCount, postsCount, isFollowing] = await Promise.all([
      prisma.follow.count({ where: { followingId: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } }),
      prisma.post.count({ where: { authorId: user.id } }),
      prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId: req.user.id, followingId: user.id }
        }
      })
    ]);

    console.log('Profile query result:', { 
      username: user.username, 
      currentUser: req.user.username,
      isFollowing: !!isFollowing,
      followRecord: isFollowing 
    });
    
    res.json({
      ...user,
      followersCount,
      followingCount,
      postsCount,
      isFollowing: !!isFollowing
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:username/posts
// @desc    Get user posts
// @access  Private
router.get('/:username/posts', auth, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      include: {
        author: { select: { name: true, username: true, avatar: true } },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Check if current user liked each post
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const isLiked = await prisma.like.findUnique({
          where: {
            userId_postId: {
              userId: req.user.id,
              postId: post.id
            }
          }
        });

        return {
          id: post.id,
          content: post.content,
          images: post.images ? JSON.parse(post.images) : [],
          author: post.author,
          likesCount: post._count.likes,
          commentsCount: post._count.comments,
          isLiked: !!isLiked,
          createdAt: post.createdAt
        };
      })
    );

    res.json(postsWithLikes);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, upload.single('avatar'), [
  body('name', 'Name is required').not().isEmpty(),
  body('bio').optional().isLength({ max: 500 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { name, bio } = req.body;
    console.log('Update profile - Body:', { name, bio });
    console.log('Update profile - File:', req.file);
    
    const updateData = { name, bio };
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
      console.log('Avatar path set to:', updateData.avatar);
    } else {
      console.log('No file received in req.file');
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, name: true, username: true, email: true, avatar: true, bio: true, createdAt: true }
    });

    const [followersCount, followingCount, postsCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } }),
      prisma.post.count({ where: { authorId: user.id } })
    ]);

    res.json({ ...user, followersCount, followingCount, postsCount });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:username/follow
// @desc    Follow user
// @access  Private
router.post('/:username/follow', auth, async (req, res) => {
  try {
    const { username } = req.params;
    console.log('Follow attempt:', { currentUser: req.user.username, targetUser: username });
    
    if (req.user.username === username) {
      console.log('Error: User trying to follow themselves');
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: req.user.id, followingId: userToFollow.id } }
    });
    if (existingFollow) {
      console.log('Error: Already following this user');
      return res.status(400).json({ message: 'Already following this user' });
    }

    await prisma.follow.create({ data: { followerId: req.user.id, followingId: userToFollow.id } });
    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:username/follow
// @desc    Unfollow user
// @access  Private
router.delete('/:username/follow', auth, async (req, res) => {
  try {
    const { username } = req.params;
    const userToUnfollow = await prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: req.user.id, followingId: userToUnfollow.id } }
    });
    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
