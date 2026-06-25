import { Router } from 'express';
import Skill from '../models/Skill.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();
router.use(requireAuth);

// ─── Weights (must sum to 1.0) ────────────────────────────────────────────────
const W = {
  semantic:    0.35,
  reciprocal:  0.20,
  reputation:  0.10,
  location:    0.10,
  // availability + learning_goals share remaining 0.25 but we don't have those
  // fields yet, so we redistribute to the factors we can compute:
  // Final effective weights when availability/goals missing:
  // semantic=0.44, reciprocal=0.25, reputation=0.13, location=0.13, activity=0.05
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

// Normalise a raw score [0, max] → [0, 1]
function norm(value, max) {
  return max === 0 ? 0 : Math.min(value / max, 1);
}

// ─── Route ────────────────────────────────────────────────────────────────────
router.get('/semantic', async (req, res) => {
  try {
    const userId = req.userId;

    // ── Step 1: current user's want-skills ───────────────────────────────────
    const [userWantSkills, userHaveSkills, currentUser] = await Promise.all([
      Skill.find({ userId, skillType: 'want' }),
      Skill.find({ userId, skillType: 'have' }),
      User.findById(userId),
    ]);

    if (userWantSkills.length === 0) return res.json([]);

    const userWantVecs = userWantSkills.filter(s => s.embedding?.length > 0);
    if (userWantVecs.length === 0) return res.json([]);

    // ── Step 2: all "have" skills from other users ───────────────────────────
    const allHaveSkills = await Skill.find({ userId: { $ne: userId }, skillType: 'have' });
    if (allHaveSkills.length === 0) return res.json([]);

    // Group by owner
    const haveByUser = {};
    allHaveSkills.forEach(s => {
      const id = s.userId.toString();
      (haveByUser[id] ??= []).push(s);
    });

    // ── Step 3: current user's have-skill names (for reciprocal check) ───────
    const userHaveNames = new Set(
      userHaveSkills.map(s => s.skillName.toLowerCase().trim())
    );

    // ── Step 4: load candidate user records (top 50 by candidate count) ──────
    const candidateIds = Object.keys(haveByUser).slice(0, 50);
    const users = await User.find({ _id: { $in: candidateIds } });
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    // Max reputation values for normalisation
    const maxReviews = Math.max(...users.map(u => u.reviewCount || 0), 1);
    const maxRating  = 5;

    // ── Step 5: also need other users' want-skills for reciprocal scoring ─────
    const othersWantSkills = await Skill.find({
      userId: { $in: candidateIds },
      skillType: 'want',
    });
    const wantByUser = {};
    othersWantSkills.forEach(s => {
      const id = s.userId.toString();
      (wantByUser[id] ??= []).push(s);
    });

    // ── Step 6: score each candidate ─────────────────────────────────────────
    const scored = [];

    for (const otherId of candidateIds) {
      const haveSkills = haveByUser[otherId] ?? [];
      const otherUser  = userMap[otherId];
      if (!otherUser) continue;

      const haveVecs = haveSkills.filter(s => s.embedding?.length > 0);
      if (haveVecs.length === 0) continue;

      // ── A) Semantic similarity ─────────────────────────────────────────────
      const pairScores = [];
      for (const want of userWantVecs) {
        for (const have of haveVecs) {
          pairScores.push({
            skillPair: `${want.skillName} ↔ ${have.skillName}`,
            wantSkill: want.skillName,
            haveSkill: have.skillName,
            score: Math.max(0, cosineSimilarity(want.embedding, have.embedding)),
          });
        }
      }
      pairScores.sort((a, b) => b.score - a.score);
      const top3 = pairScores.slice(0, 3);
      const semanticScore = top3.length > 0
        ? top3.reduce((s, p) => s + p.score, 0) / top3.length
        : 0;

      // ── B) Reciprocal exchange ─────────────────────────────────────────────
      // Does this person WANT something the current user can teach?
      const theirWants = (wantByUser[otherId] ?? []).map(s => s.skillName.toLowerCase().trim());
      const reciprocalHits = theirWants.filter(w => userHaveNames.has(w)).length;
      const reciprocalScore = norm(reciprocalHits, Math.max(theirWants.length, 1));

      // ── C) Reputation ─────────────────────────────────────────────────────
      const ratingScore  = norm(otherUser.avgRating  || 0, maxRating);
      const volumeScore  = norm(otherUser.reviewCount || 0, maxReviews);
      const reputationScore = ratingScore * 0.7 + volumeScore * 0.3;

      // ── D) Location (same city = 1, else 0 — extend later) ────────────────
      // We don't have location in User schema yet, default 0
      const locationScore = 0;

      // ── E) Activity (account age proxy — newer = slightly higher) ──────────
      const daysSinceJoin = (Date.now() - new Date(otherUser.createdAt)) / 86400000;
      const activityScore = Math.max(0, 1 - daysSinceJoin / 365); // fades to 0 after 1 yr

      // ── F) Composite — redistribute unavailable weights proportionally ─────
      // Available factors: semantic(0.35), reciprocal(0.20), reputation(0.10),
      //                    location(0.10→0), activity(0.05), remainder(0.20→0)
      // Redistribute the 0.30 from missing factors: +semantic 0.15, +reciprocal 0.10, +reputation 0.05
      const composite =
        semanticScore   * 0.50 +
        reciprocalScore * 0.30 +
        reputationScore * 0.15 +
        activityScore   * 0.05;

      const compatibilityScore = Math.round(composite * 100);

      scored.push({
        userId:             otherId,
        userName:           otherUser.name,
        userAvatar:         otherUser.avatarUrl || '',
        avgRating:          otherUser.avgRating  || null,
        reviewCount:        otherUser.reviewCount || 0,
        compatibilityScore,
        // Score breakdown — sent to frontend for display
        scoreBreakdown: {
          semantic:    Math.round(semanticScore   * 100),
          reciprocal:  Math.round(reciprocalScore * 100),
          reputation:  Math.round(reputationScore * 100),
          activity:    Math.round(activityScore   * 100),
        },
        matchingSkills: top3,
        // Which of the current user's skills this person wants (for reciprocal badge)
        theyWant: theirWants
          .filter(w => userHaveNames.has(w))
          .slice(0, 3),
      });
    }

    // Sort descending, return top 10
    scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    res.json(scored.slice(0, 10));

  } catch (err) {
    logger.error('Match error:', err.message);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

export default router;