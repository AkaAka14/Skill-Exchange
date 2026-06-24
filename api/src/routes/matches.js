import { Router } from 'express';
import Skill from '../models/Skill.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

router.use(requireAuth);


function cosineSimilarity(vectorA, vectorB) {
	if (!vectorA || !vectorB || vectorA.length !== vectorB.length || vectorA.length === 0) return 0;

	let dotProduct = 0;
	let magA = 0;
	let magB = 0;
	for (let i = 0; i < vectorA.length; i++) {
		dotProduct += vectorA[i] * vectorB[i];
		magA += vectorA[i] * vectorA[i];
		magB += vectorB[i] * vectorB[i];
	}

	const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
	return magnitude === 0 ? 0 : dotProduct / magnitude;
}


router.get('/semantic', async (req, res) => {
	try {
		const userId = req.userId;

		
		const userWantSkills = await Skill.find({ userId, skillType: 'want' });
		if (userWantSkills.length === 0) return res.json([]);

		const userWantEmbeddings = userWantSkills
			.filter((s) => Array.isArray(s.embedding) && s.embedding.length > 0)
			.map((s) => ({ name: s.skillName, vector: s.embedding }));

		if (userWantEmbeddings.length === 0) return res.json([]);

	
		const allHaveSkills = await Skill.find({ userId: { $ne: userId }, skillType: 'have' });
		if (allHaveSkills.length === 0) return res.json([]);


		const skillsByUser = {};
		allHaveSkills.forEach((skill) => {
			const ownerId = skill.userId.toString();
			if (!skillsByUser[ownerId]) skillsByUser[ownerId] = [];
			skillsByUser[ownerId].push(skill);
		});

		const otherUserIds = Object.keys(skillsByUser);

		
		const users = await User.find({ _id: { $in: otherUserIds } });
		const userDetails = {};
		users.forEach((u) => {
			userDetails[u._id.toString()] = { userName: u.name, userAvatar: u.avatar || '' };
		});

		// 5. Score each candidate
		const matches = [];
		for (const [otherId, haveSkills] of Object.entries(skillsByUser)) {
			const otherHaveEmbeddings = haveSkills.filter((s) => Array.isArray(s.embedding) && s.embedding.length > 0);
			if (otherHaveEmbeddings.length === 0) continue;

			const currentMatchUser = userDetails[otherId] || { userName: 'Collaborator', userAvatar: '' };
			const similarities = [];

			for (const want of userWantEmbeddings) {
				for (const have of otherHaveEmbeddings) {
					const sim = cosineSimilarity(want.vector, have.embedding);
					similarities.push({
						skillPair: `${want.name} ↔ ${have.skillName}`,
						score: Math.max(0, sim),
					});
				}
			}

			similarities.sort((a, b) => b.score - a.score);
			const topMatches = similarities.slice(0, 3);
			const avgScore = topMatches.length > 0
				? Math.round((topMatches.reduce((a, b) => a + b.score, 0) / topMatches.length) * 100)
				: 0;

			matches.push({
				userId: otherId,
				userName: currentMatchUser.userName,
				userAvatar: currentMatchUser.userAvatar,
				compatibilityScore: avgScore,
				matchingSkills: topMatches,
			});
		}

		res.json(matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore));
	} catch (error) {
		logger.error('Match error:', error.message);
		res.status(500).json({ error: 'Failed to fetch matches' });
	}
});

export default router;
