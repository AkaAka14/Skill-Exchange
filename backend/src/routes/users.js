import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Skill from '../models/Skill.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadFiles } from '../middleware/file-upload.js';
import { uploadBufferToCloudinary, default as cloudinary } from '../config/cloudinary.js';
import logger from '../utils/logger.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
	try {
		const users = await User.find({ _id: { $ne: req.userId } }).sort({ createdAt: -1 });
		const userIds = users.map((u) => u._id);

		const skills = await Skill.find({ userId: { $in: userIds } });
		const skillsByUser = {};
		skills.forEach((s) => {
			const key = s.userId.toString();
			if (!skillsByUser[key]) skillsByUser[key] = [];
			skillsByUser[key].push(s.toSafeObject());
		});

		const usersWithSkills = users.map((u) => {
			const userSkills = skillsByUser[u._id.toString()] || [];
			return {
				...u.toSafeObject(),
				skillsHave: userSkills.filter((s) => s.skillType === 'have'),
				skillsWant: userSkills.filter((s) => s.skillType === 'want'),
			};
		});

		res.json(usersWithSkills);
	} catch (error) {
		logger.error('List users error:', error.message);
		res.status(500).json({ error: 'Failed to fetch users' });
	}
});


router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const skills = await Skill.find({ userId: req.params.id });
    const skillsHave = skills.filter(s => s.skillType === 'have').map(s => s.skillName);
    const skillsWant = skills.filter(s => s.skillType === 'want').map(s => s.skillName);

    res.json({
      ...user.toSafeObject(),
      skillsOffered: skillsHave,
      skillsWanted: skillsWant,
    });
  } catch (error) {
    logger.error('Get user error:', error.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});


router.put(
	'/me',
	uploadFiles({ maxCount: 1, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'], fieldName: 'avatar' }),
	async (req, res) => {
		try {
			const { name, bio } = req.body;
			const user = await User.findById(req.userId);

			if (name) user.name = name.trim();
			if (bio !== undefined) user.bio = bio.trim();

			if (req.files?.length > 0) {
				
				if (user.avatarPublicId) {
					await cloudinary.uploader.destroy(user.avatarPublicId).catch(() => {});
				}
				const { url, publicId } = await uploadBufferToCloudinary(req.files[0].buffer, 'avatars');
				user.avatarUrl = url;
				user.avatarPublicId = publicId;
			}

			await user.save();
			res.json(user.toSafeObject());
		} catch (error) {
			logger.error('Update profile error:', error.message);
			res.status(500).json({ error: 'Failed to update profile' });
		}
	},
);

export default router;
