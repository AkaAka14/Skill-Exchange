import { Router } from 'express';
import pocketbaseClient from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';

const router = Router();

// Apply PocketBase authentication to all routes
router.use(pocketbaseAuth);

/**
 * Helper to calculate cosine similarity between two embedding vectors
 */
function cosineSimilarity(vectorA, vectorB) {
    if (!vectorA || !vectorB || vectorA.length !== vectorB.length) return 0;

    let dotProduct = 0, magA = 0, magB = 0;
    for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];
        magA += vectorA[i] * vectorA[i];
        magB += vectorB[i] * vectorB[i];
    }
    
    const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * GET /matches/semantic
 * Finds users whose 'have' skills semantically match the current user's 'want' skills.
 */
router.get('/semantic', async (req, res) => {
    try {
        const userId = req.pocketbaseUserId;
        if (!userId) {
            return res.status(401).json({ error: 'User authentication required' });
        }

        logger.info(`🔍 Finding semantic matches for user: ${userId}`);

        // 1. Fetch current user's 'want' skills
        const userWantSkills = await pocketbaseClient.collection('skills').getFullList({
            filter: `userId = "${userId}" && skillType = "want"`,
        });

        logger.info(`📊 Current user has ${userWantSkills.length} 'want' skills.`);
        if (userWantSkills.length === 0) return res.json([]);

        const userWantEmbeddings = userWantSkills
            .filter(s => Array.isArray(s.embedding) && s.embedding.length > 0)
            .map(s => ({ name: s.skillName, vector: s.embedding }));

        // 2. Fetch all other users' 'have' skills
        const allHaveSkills = await pocketbaseClient.collection('skills').getFullList({
            filter: `userId != "${userId}" && skillType = "have"`,
        });

        logger.info(`📊 Found ${allHaveSkills.length} 'have' skills from other users.`);

        // 3. Group skills by User
        const skillsByUser = {};
        allHaveSkills.forEach(skill => {
            if (!skill.userId) return;
            if (!skillsByUser[skill.userId]) skillsByUser[skill.userId] = [];
            skillsByUser[skill.userId].push(skill);
        });

        const otherUserIds = Object.keys(skillsByUser);
        const userDetails = {};

        // 4. Hydrate User Details (Names and Avatars)
        if (otherUserIds.length > 0) {
            const filterString = otherUserIds.map(id => `id = "${id}"`).join(' || ');
            
            try {
                const users = await pocketbaseClient.collection('users').getFullList({ 
                    filter: filterString 
                });
                
                users.forEach(u => {
                    userDetails[u.id] = {
                        userName: u.name || u.username || 'Collaborator',
                        userAvatar: u.avatar || '',
                    };
                });
                logger.info(`✅ Hydrated names for: ${Object.values(userDetails).map(u => u.userName).join(', ')}`);
            } catch (err) {
                logger.error(`❌ User Fetch Failed: ${err.message}`);
            }
        }

        // 5. Calculate Semantic Scores
        const matches = [];
        for (const [otherId, haveSkills] of Object.entries(skillsByUser)) {
            const otherHaveEmbeddings = haveSkills.filter(s => Array.isArray(s.embedding) && s.embedding.length > 0);
            if (otherHaveEmbeddings.length === 0) continue;

            const currentMatchUser = userDetails[otherId] || { userName: 'Unknown User' };
            const similarities = [];

            for (const want of userWantEmbeddings) {
                for (const have of otherHaveEmbeddings) {
                    const sim = cosineSimilarity(want.vector, have.embedding);
                    const scorePercentage = Math.round(sim * 100);

                    // LOG: The specific comparison result
                    logger.info(`⚖️  Comparing [Your Want: ${want.name}] vs [User: ${currentMatchUser.userName} Have: ${have.skillName}] | Value: ${scorePercentage}%`);

                    similarities.push({
                        skillPair: `${want.name} ↔ ${have.skillName}`,
                        score: Math.max(0, sim)
                    });
                }
            }

            // Calculate average of top 3 skill similarities for this user
            similarities.sort((a, b) => b.score - a.score);
            const topMatches = similarities.slice(0, 3);
            const avgScore = topMatches.length > 0 
                ? Math.round((topMatches.reduce((a, b) => a + b.score, 0) / topMatches.length) * 100) 
                : 0;

            // Use 0 as threshold for testing to ensure cards appear
            if (avgScore >= 0) {
                matches.push({
                    userId: otherId,
                    userName: currentMatchUser.userName,
                    userAvatar: currentMatchUser.userAvatar,
                    compatibilityScore: avgScore,
                    matchingSkills: topMatches
                });
            }
        }

        // Sort matches by highest score first
        res.json(matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore));

    } catch (error) {
        logger.error('❌ Match Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});

export default router;