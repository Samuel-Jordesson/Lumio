const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

// @route   GET /api/posts
// @desc    Get all posts (feed)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get users that the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      select: { followingId: true }
    });

    const followingIds = following.map(f => f.followingId);
    followingIds.push(req.user.id); // Include current user's posts

    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: followingIds }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
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
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts
// @desc    Create a post
// @access  Private
router.post('/', auth, upload.array('images', 10), [
  body('content', 'Content is required').not().isEmpty().isLength({ max: 500 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { content } = req.body;
    let images = null;

    // Handle image uploads - Convert to Base64 for Render compatibility
    if (req.files && req.files.length > 0) {
      const imageDataUrls = req.files.map(file => {
        const base64 = file.buffer.toString('base64');
        return `data:${file.mimetype};base64,${base64}`;
      });
      images = JSON.stringify(imageDataUrls);
    }

    const post = await prisma.post.create({
      data: {
        content,
        images,
        authorId: req.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      id: post.id,
      content: post.content,
      images: post.images ? JSON.parse(post.images) : [],
      author: post.author,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      createdAt: post.createdAt
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId: id
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: req.user.id,
            postId: id
          }
        }
      });
      res.json({ message: 'Post unliked' });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: req.user.id,
          postId: id
        }
      });

      // Create notification if user is liking someone else's post
      if (post.authorId !== req.user.id) {
        await prisma.notification.create({
          data: {
            type: 'like',
            userId: post.authorId,
            senderId: req.user.id,
            postId: id
          }
        });
      }

      res.json({ message: 'Post liked' });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', auth, upload.array('images', 10), [
  body('content', 'Content is required').not().isEmpty().isLength({ max: 500 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { id } = req.params;
    const { content } = req.body;

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true, images: true }
    });

    if (!existingPost) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    if (existingPost.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Não autorizado a editar este post' });
    }

    let images = existingPost.images;

    // Handle new image uploads - Convert to Base64 for Render compatibility
    if (req.files && req.files.length > 0) {
      const imageDataUrls = req.files.map(file => {
        const base64 = file.buffer.toString('base64');
        return `data:${file.mimetype};base64,${base64}`;
      });
      images = JSON.stringify(imageDataUrls);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        content,
        images
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    // Check if current user liked the post
    const isLiked = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId: id
        }
      }
    });

    res.json({
      id: updatedPost.id,
      content: updatedPost.content,
      images: updatedPost.images ? JSON.parse(updatedPost.images) : [],
      author: updatedPost.author,
      likesCount: updatedPost._count.likes,
      commentsCount: updatedPost._count.comments,
      isLiked: !!isLiked,
      createdAt: updatedPost.createdAt
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }
    });

    if (!existingPost) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    if (existingPost.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Não autorizado a excluir este post' });
    }

    await prisma.post.delete({
      where: { id }
    });

    res.json({ message: 'Post excluído com sucesso' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// @route   GET /api/posts/trending
// @desc    Get trending posts
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
            username: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: [
        { likes: { _count: 'desc' } },
        { comments: { _count: 'desc' } },
        { createdAt: 'desc' }
      ],
      take: 10
    });

    res.json(posts.map(post => ({
      id: post.id,
      content: post.content,
      images: post.images ? JSON.parse(post.images) : [],
      author: post.author,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      createdAt: post.createdAt
    })));
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/recent
// @desc    Get all recent posts from everyone
// @access  Public
router.get('/recent', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
            username: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(posts.map(post => ({
      id: post.id,
      content: post.content,
      images: post.images ? JSON.parse(post.images) : [],
      author: post.author,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      createdAt: post.createdAt
    })));
  } catch (error) {
    console.error('Get recent posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/posts/:id/comments
// @desc    Get comments for a post
// @access  Private
router.get('/:id/comments', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const comments = await prisma.comment.findMany({
      where: {
        postId: id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/posts/:id/comments
// @desc    Add comment to a post
// @access  Private
router.post('/:id/comments', auth, [
  body('content', 'Comment content is required').not().isEmpty().isLength({ max: 500 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { id } = req.params;
    const { content } = req.body;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, authorId: true }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user.id,
        postId: id
      },
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
    });

    // Create notification if user is commenting on someone else's post
    if (post.authorId !== req.user.id) {
      await prisma.notification.create({
        data: {
          type: 'comment',
          userId: post.authorId,
          senderId: req.user.id,
          postId: id
        }
      });
    }

    res.json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
