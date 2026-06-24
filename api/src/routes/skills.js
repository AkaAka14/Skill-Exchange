import { Router } from 'express';
import mongoose from 'mongoose';
import Skill from '../models/Skill.js';
import { requireAuth } from '../middleware/auth.js';
import { generateEmbedding } from '../utils/embeddings.js';
import logger from '../utils/logger.js';

const router = Router();

router.use(requireAuth);


router.get('/', async (req, res) => {
	try {
		const { userId, skillType } = req.query;
		const filter = {};

		if (userId) {
			if (!mongoose.isValidObjectId(userId)) {
				return res.status(400).json({ error: 'Invalid userId' });
			}
			filter.userId = userId;
		}
		if (skillType) {
			if (!['have', 'want'].includes(skillType)) {
				return res.status(400).json({ error: 'skillType must be "have" or "want"' });
			}
			filter.skillType = skillType;
		}

		const skills = await Skill.find(filter).sort({ createdAt: -1 });
		res.json(skills.map((s) => s.toSafeObject()));
	} catch (error) {
		logger.error('List skills error:', error.message);
		res.status(500).json({ error: 'Failed to fetch skills' });
	}
});

router.post('/', async (req, res) => {
	try {
		const { skillName, skillType } = req.body;

		if (!skillName?.trim()) {
			return res.status(400).json({ error: 'skillName is required' });
		}
		if (!['have', 'want'].includes(skillType)) {
			return res.status(400).json({ error: 'skillType must be "have" or "want"' });
		}

		let embedding = [];
		try {
			embedding = await generateEmbedding(skillName.trim());
		} catch (err) {
			
			logger.error(`Embedding generation failed for "${skillName}": ${err.message}`);
		}

		const skill = await Skill.create({
			userId: req.userId,
			skillName: skillName.trim(),
			skillType,
			embedding,
		});

		res.status(201).json(skill.toSafeObject());
	} catch (error) {
		logger.error('Create skill error:', error.message);
		res.status(500).json({ error: 'Failed to create skill' });
	}
});

router.delete('/:id', async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).json({ error: 'Invalid skill id' });
		}

		const skill = await Skill.findById(req.params.id);
		if (!skill) return res.status(404).json({ error: 'Skill not found' });

		if (skill.userId.toString() !== req.userId) {
			return res.status(403).json({ error: 'You can only delete your own skills' });
		}

		await skill.deleteOne();
		res.json({ success: true });
	} catch (error) {
		logger.error('Delete skill error:', error.message);
		res.status(500).json({ error: 'Failed to delete skill' });
	}
});

export default router;
