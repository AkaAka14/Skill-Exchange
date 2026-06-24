import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name avatarUrl')
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length === 0
        ? null
        : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    res.json({
      reviews,
      avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      count: reviews.length,
    });
  } catch (err) {
    console.error('GET /reviews/:userId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/:userId', requireAuth, async (req, res) => {
  try {
    const revieweeId = req.params.userId;
    const reviewerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(revieweeId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }
    if (revieweeId === reviewerId) {
      return res.status(400).json({ error: 'You cannot review yourself' });
    }

    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review = await Review.findOneAndUpdate(
      { reviewer: reviewerId, reviewee: revieweeId },
      { rating, comment: comment || '' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('reviewer', 'name avatarUrl');

    const allReviews = await Review.find({ reviewee: revieweeId });
    const avg =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(revieweeId, {
      avgRating: Math.round(avg * 10) / 10,
      reviewCount: allReviews.length,
    });

    res.json(review);
  } catch (err) {
    console.error('POST /reviews/:userId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:userId', requireAuth, async (req, res) => {
  try {
    const revieweeId = req.params.userId;
    const reviewerId = req.user.id;

    const deleted = await Review.findOneAndDelete({
      reviewer: reviewerId,
      reviewee: revieweeId,
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const allReviews = await Review.find({ reviewee: revieweeId });
    const avg =
      allReviews.length === 0
        ? null
        : allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(revieweeId, {
      avgRating: avg ? Math.round(avg * 10) / 10 : null,
      reviewCount: allReviews.length,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /reviews/:userId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
