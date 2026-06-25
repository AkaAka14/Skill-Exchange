import { Router } from 'express';
import Skill from '../models/Skill.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();
router.use(requireAuth);

// ─── Level compatibility matrix ───────────────────────────────────────────────
// When a teacher's level meets a learner's desired level:
//   - Teacher advanced → great for anyone wanting beginner/intermediate/advanced
//   - Teacher intermediate → great for beginner/intermediate, ok for advanced
//   - Teacher beginner → ok for beginner learners only
const LEVEL_COMPAT = {
  // [teacherLevel][learnerLevel] → 0..1 score
  advanced:     { beginner: 1.0, intermediate: 1.0, advanced: 1.0 },
  intermediate: { beginner: 1.0, intermediate: 1.0, advanced: 0.5 },
  beginner:     { beginner: 0.8, intermediate: 0.4, advanced: 0.1 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const mag = Math.sqrt(magA) * Math.sqrt(magB);
  return mag === 0 ? 0 : dot / mag;
}

function norm(value, max) {
  return max === 0 ? 0 : Math.min(value / max, 1);
}

// Level-adjusted semantic score:
// combines cosine similarity with how well the teacher's level serves the learner
function levelAdjustedScore(semanticScore, teacherLevel, learnerLevel) {
  const tl = teacherLevel  || 'intermediate';
  const ll = learnerLevel  || 'intermediate';
  const levelFit = LEVEL_COMPAT[tl]?.[ll] ?? 0.5;
  // Weight: 75% semantic relevance, 25% level fit
  return semanticScore * 0.75 + levelFit * semanticScore * 0.25;
}

// Fuzzy skill name match for reciprocal scoring
function skillNamesMatch(a, b) {
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  return false;
}

// ─── Route ────────────────────────────────────────────────────────────────────
router.get('/semantic', async (req, res) => {
  try {
    const userId = req.userId;
    const SIMILARITY_THRESHOLD = 0.25;

    // ── Step 1: current user's skills ────────────────────────────────────────
    const [userWantSkills, userHaveSkills, currentUser] = await Promise.all([
      Skill.find({ userId, skillType: 'want' }),
      Skill.find({ userId, skillType: 'have' }),
      User.findById(userId),
    ]);

    if (userWantSkills.length === 0) return res.json([]);

    const userWantVecs = userWantSkills.filter(s => s.embedding?.length > 0);
    if (userWantVecs.length === 0) return res.json([]);

    const userHaveNames = new Set(
      userHaveSkills.map(s => s.skillName.toLowerCase().trim())
    );

    // ── Step 2: all "have" skills from other users ────────────────────────────
    const allHaveSkills = await Skill.find({ userId: { $ne: userId }, skillType: 'have' });
    if (allHaveSkills.length === 0) return res.json([]);

    const haveByUser = {};
    allHaveSkills.forEach(s => {
      const id = s.userId.toString();
      (haveByUser[id] ??= []).push(s);
    });

    // ── Step 3: pre-score all candidates to pick the top 50 by relevance ─────
    const allCandidateIds = Object.keys(haveByUser);

    const preScored = allCandidateIds.map(otherId => {
      const haveVecs = haveByUser[otherId].filter(s => s.embedding?.length > 0);
      if (haveVecs.length === 0) return { otherId, bestScore: 0 };

      let bestScore = 0;
      for (const want of userWantVecs) {
        for (const have of haveVecs) {
          const sim = cosineSimilarity(want.embedding, have.embedding);
          if (sim > bestScore) bestScore = sim;
        }
      }
      return { otherId, bestScore };
    });

    // Sort by relevance and take top 50
    preScored.sort((a, b) => b.bestScore - a.bestScore);
    const candidateIds = preScored
      .filter(p => p.bestScore >= SIMILARITY_THRESHOLD)
      .slice(0, 50)
      .map(p => p.otherId);

    if (candidateIds.length === 0) return res.json([]);

    // ── Step 4: load user records + their want-skills ─────────────────────────
    const [users, othersWantSkills] = await Promise.all([
      User.find({ _id: { $in: candidateIds } }),
      Skill.find({ userId: { $in: candidateIds }, skillType: 'want' }),
    ]);

    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const wantByUser = {};
    othersWantSkills.forEach(s => {
      const id = s.userId.toString();
      (wantByUser[id] ??= []).push(s);
    });

    const maxReviews = Math.max(...users.map(u => u.reviewCount || 0), 1);

    // ── Step 5: full scoring ──────────────────────────────────────────────────
    const scored = [];

    for (const otherId of candidateIds) {
      const haveSkills = haveByUser[otherId] ?? [];
      const otherUser  = userMap[otherId];
      if (!otherUser) continue;

      const haveVecs = haveSkills.filter(s => s.embedding?.length > 0);
      if (haveVecs.length === 0) continue;

      // ── A) Semantic + level score ──────────────────────────────────────────
      const pairScores = [];
      for (const want of userWantVecs) {
        for (const have of haveVecs) {
          const rawSim = Math.max(0, cosineSimilarity(want.embedding, have.embedding));
          if (rawSim < SIMILARITY_THRESHOLD) continue;

          // Adjust score based on level compatibility
          const adjusted = levelAdjustedScore(rawSim, have.level, want.level);

          pairScores.push({
            skillPair: `${want.skillName} ↔ ${have.skillName}`,
            wantSkill: want.skillName,
            haveSkill: have.skillName,
            teacherLevel: have.level || 'intermediate',
            learnerLevel: want.level || 'intermediate',
            score: adjusted,
            rawScore: rawSim,
          });
        }
      }
      if (pairScores.length === 0) continue;

      pairScores.sort((a, b) => b.score - a.score);
      // Use best pair score as the semantic signal (not average — top pair is what matters)
      const semanticScore = pairScores[0].score;

      // ── B) Reciprocal exchange (fuzzy match) ───────────────────────────────
      const theirWants = (wantByUser[otherId] ?? []).map(s => s.skillName.toLowerCase().trim());
      const userHaveArr = Array.from(userHaveNames);
      const reciprocalHits = theirWants.filter(w =>
        userHaveArr.some(have => skillNamesMatch(have, w))
      ).length;
      const reciprocalScore = norm(reciprocalHits, Math.max(theirWants.length, 1));

      // ── C) Reputation ──────────────────────────────────────────────────────
      const ratingScore    = norm(otherUser.avgRating  || 0, 5);
      const volumeScore    = norm(otherUser.reviewCount || 0, maxReviews);
      const reputationScore = ratingScore * 0.7 + volumeScore * 0.3;

      // ── D) Activity (exponential decay — doesn't punish older users) ────────
      const daysSinceJoin = (Date.now() - new Date(otherUser.createdAt)) / 86400000;
      const activityScore = Math.exp(-daysSinceJoin / 180); // ~0.6 at 3mo, ~0.4 at 6mo

      // ── E) Composite ───────────────────────────────────────────────────────
      const composite =
        semanticScore   * 0.50 +
        reciprocalScore * 0.34 +
        reputationScore * 0.15 +
        activityScore   * 0.01;

      const compatibilityScore = Math.round(composite * 100);

      scored.push({
        userId:             otherId,
        userName:           otherUser.name,
        userAvatar:         otherUser.avatarUrl || '',
        avgRating:          otherUser.avgRating  || null,
        reviewCount:        otherUser.reviewCount || 0,
        compatibilityScore,
        scoreBreakdown: {
          semantic:    Math.round(semanticScore   * 100),
          reciprocal:  Math.round(reciprocalScore * 100),
          reputation:  Math.round(reputationScore * 100),
          activity:    Math.round(activityScore   * 100),
        },
        matchingSkills: pairScores.slice(0, 3),
        theyWant: theirWants
          .filter(w => userHaveArr.some(have => skillNamesMatch(have, w)))
          .slice(0, 3),
      });
    }

    scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    res.json(scored.slice(0, 10));

  } catch (err) {
    logger.error('Match error:', err.message);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

export default router;