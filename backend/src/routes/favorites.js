import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();


router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favorites', 'name avatarUrl bio skillsOffered skillsWanted avgRating');

    res.json(user.favorites || []);
  } catch (err) {
    console.error('GET /favorites error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/:userId', requireAuth, async (req, res) => {
  try {
    const targetId = req.params.userId;
    const myId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }
    if (targetId === myId) {
      return res.status(400).json({ error: 'You cannot favorite yourself' });
    }

    const me = await User.findById(myId);
    const alreadyFavorited = me.favorites.some(
      (id) => id.toString() === targetId
    );

    if (alreadyFavorited) {
  
      await User.findByIdAndUpdate(myId, {
        $pull: { favorites: new mongoose.Types.ObjectId(targetId) },
      });
      res.json({ favorited: false });
    } else {

      await User.findByIdAndUpdate(myId, {
        $addToSet: { favorites: new mongoose.Types.ObjectId(targetId) },
      });
      res.json({ favorited: true });
    }
  } catch (err) {
    console.error('POST /favorites/:userId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/:userId/status', requireAuth, async (req, res) => {
  try {
    const targetId = req.params.userId;
    const me = await User.findById(req.user.id, 'favorites');
    const favorited = me.favorites.some((id) => id.toString() === targetId);
    res.json({ favorited });
  } catch (err) {
    console.error('GET /favorites/:userId/status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
