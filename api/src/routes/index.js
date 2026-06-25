import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import skillRoutes from './skills.js';
import matchRoutes from './matches.js';
import messageRoutes from './messages.js';
import reviewRoutes from './reviews.js';
import favoriteRoutes from './favorites.js';
import postRoutes from './posts.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/skills', skillRoutes);
router.use('/matches', matchRoutes);
router.use('/messages', messageRoutes);
router.use('/reviews', reviewRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/posts', postRoutes);

export default router;