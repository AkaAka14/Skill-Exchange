import { Router } from 'express';
import pocketbaseClient from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';

const router = Router();

// Apply PocketBase authentication to all routes
router.use(pocketbaseAuth);

// Helper function to calculate cosine similarity between two vectors
function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

// GET /matches/semantic - Find semantic skill matches
router.get('/semantic', async (req, res) => {
  const userId = req.pocketbaseUserId;

  if (!userId) {
    throw new Error('User authentication required');
  }

  logger.info(`Finding semantic matches for user: ${userId}`);

  // Fetch current user's 'want' skills with embeddings
  const userWantSkills = await pocketbaseClient.collection('skills').getFullList({
    filter: pocketbaseClient.filter('userId = {:userId} && skillType = "want"', { userId }),
  });

  logger.info(`User ${userId} has ${userWantSkills.length} 'want' skills`);

  if (userWantSkills.length === 0) {
    logger.info(`User ${userId} has no 'want' skills`);
    return res.json([]);
  }

  // Extract embeddings for user's want skills
  const userWantEmbeddings = userWantSkills
    .filter(skill => skill.embedding && Array.isArray(skill.embedding) && skill.embedding.length > 0)
    .map(skill => ({
      skillId: skill.id,
      skillName: skill.skillName,
      embedding: skill.embedding,
    }));

  logger.info(`User ${userId} has ${userWantEmbeddings.length} 'want' skills with embeddings`);

  if (userWantEmbeddings.length === 0) {
    logger.warn(`User ${userId} has no embeddings for 'want' skills - embeddings may not be generated yet`);
    return res.json([]);
  }

  // Fetch all other users' 'have' skills with embeddings
  const allHaveSkills = await pocketbaseClient.collection('skills').getFullList({
    filter: pocketbaseClient.filter('userId != {:userId} && skillType = "have"', { userId }),
  });

  logger.info(`Found ${allHaveSkills.length} 'have' skills from other users`);

  // Group 'have' skills by user
  const skillsByUser = {};
  for (const skill of allHaveSkills) {
    if (!skillsByUser[skill.userId]) {
      skillsByUser[skill.userId] = [];
    }
    skillsByUser[skill.userId].push(skill);
  }

  logger.info(`Skills grouped by ${Object.keys(skillsByUser).length} other users`);

  // Fetch user details for all users with 'have' skills
  const userIds = Object.keys(skillsByUser);
  const userDetails = {};

  for (const uid of userIds) {
    const user = await pocketbaseClient.collection('users').getOne(uid).catch(() => null);
    if (user) {
      userDetails[uid] = {
        userName: user.name || user.username || 'Unknown',
        userAvatar: user.avatar || '',
        email: user.email || '',
      };
      logger.debug(`Fetched details for user ${uid}: ${userDetails[uid].userName}`);
    } else {
      logger.warn(`Could not fetch details for user ${uid}`);
    }
  }

  // Calculate compatibility scores
  const matches = [];

  for (const [otherUserId, haveSkills] of Object.entries(skillsByUser)) {
    const haveSkillsWithEmbeddings = haveSkills
      .filter(skill => skill.embedding && Array.isArray(skill.embedding) && skill.embedding.length > 0)
      .map(skill => ({
        skillId: skill.id,
        skillName: skill.skillName,
        embedding: skill.embedding,
      }));

    if (haveSkillsWithEmbeddings.length === 0) {
      logger.debug(`User ${otherUserId} has no 'have' skills with embeddings`);
      continue;
    }

    // Calculate similarities between all want and have skill pairs
    const similarities = [];

    for (const wantSkill of userWantEmbeddings) {
      for (const haveSkill of haveSkillsWithEmbeddings) {
        const similarity = cosineSimilarity(wantSkill.embedding, haveSkill.embedding);
        similarities.push({
          wantSkillName: wantSkill.skillName,
          haveSkillName: haveSkill.skillName,
          similarity: Math.max(0, similarity), // Clamp to [0, 1]
        });
      }
    }

    // Sort by similarity and get top matches
    similarities.sort((a, b) => b.similarity - a.similarity);
    const topMatches = similarities.slice(0, 5);

    // Calculate overall compatibility score as average of top similarities
    const compatibilityScore = topMatches.length > 0
      ? Math.round((topMatches.reduce((sum, m) => sum + m.similarity, 0) / topMatches.length) * 100)
      : 0;

    logger.debug(`User ${otherUserId} compatibility score: ${compatibilityScore}%`);

    // Filter out matches below 40%
    if (compatibilityScore >= 40) {
      matches.push({
        userId: otherUserId,
        userName: userDetails[otherUserId]?.userName || 'Unknown',
        userAvatar: userDetails[otherUserId]?.userAvatar || '',
        compatibilityScore,
        matchingSkills: topMatches.map(m => ({
          skillName: `${m.wantSkillName} ↔ ${m.haveSkillName}`,
          similarity: Math.round(m.similarity * 100) / 100,
        })),
      });
    }
  }

  // Sort by compatibility score (highest first)
  matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  logger.info(`Found ${matches.length} matches for user ${userId} with compatibility >= 40%`);
  res.json(matches);
});

export default router;