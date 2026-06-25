import { Router } from 'express';
import Post from '../models/Post.js';
import { requireAuth } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

// GET /posts?userId=<id>  — public, paginated
router.get('/', async (req, res) => {
  try {
    const { userId, limit = 20, skip = 0 } = req.query;
    const filter = userId ? { userId } : {};
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    res.json(posts.map((p) => p.toSafeObject()));
  } catch (err) {
    logger.error('GET /posts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST /posts — auth required
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const post = await Post.create({
      userId: req.userId,
      title: title.trim(),
      content: content.trim(),
      tags: tags.slice(0, 5),
    });
    res.status(201).json(post.toSafeObject());
  } catch (err) {
    logger.error('POST /posts error:', err.message);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// DELETE /posts/:id — only owner
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not your post' });
    }
    await post.deleteOne();
    res.json({ deleted: true });
  } catch (err) {
    logger.error('DELETE /posts error:', err.message);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;