import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { uploadFiles } from '../middleware/file-upload.js';
import Skill from '../models/Skill.js';
import logger from '../utils/logger.js';

const router = Router();
router.use(requireAuth);

async function callGemini(prompt, pdfBase64 = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in .env');

  const parts = [];

  if (pdfBase64) {
    parts.push({
      inline_data: {
        mime_type: 'application/pdf',
        data: pdfBase64,
      },
    });
  }

  parts.push({ text: prompt });

  const body = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return text;
}

function parseJSON(raw) {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

router.post(
  '/analyze',
  uploadFiles({
    maxCount: 1,
    maxSizeMB: 10,
    allowedMimeTypes: ['application/pdf'],
    fieldName: 'resume',
  }),
  async (req, res) => {
    try {
      const file = req.files?.[0];
      if (!file) return res.status(400).json({ error: 'Resume PDF is required' });

      const userSkills = await Skill.find({ userId: req.userId });
      const haveSkills = userSkills.filter(s => s.skillType === 'have').map(s => `${s.skillName}${s.category ? ` (${s.category})` : ''}${s.level ? ` [${s.level}]` : ''}`);
      const wantSkills = userSkills.filter(s => s.skillType === 'want').map(s => s.skillName);

      const pdfBase64 = file.buffer.toString('base64');

      const prompt = `You are an expert career coach and technical recruiter. Analyze the attached resume and provide structured career guidance.

The user already has these skills on their profile:
- Skills they can teach: ${haveSkills.length > 0 ? haveSkills.join(', ') : 'none listed yet'}
- Skills they want to learn: ${wantSkills.length > 0 ? wantSkills.join(', ') : 'none listed yet'}

Analyze the resume and respond with ONLY a valid JSON object (no markdown, no explanation) in this exact shape:

{
  "name": "candidate's name from resume",
  "currentRole": "their most recent job title",
  "experienceYears": 3,
  "summary": "2-3 sentence professional summary based on the resume",
  "extractedSkills": [
    { "name": "Python", "category": "Programming", "level": "advanced", "source": "where you found it in the resume" }
  ],
  "careerGoal": "inferred career goal based on trajectory",
  "skillGaps": [
    {
      "skill": "System Design",
      "category": "Programming",
      "importance": "high",
      "reason": "why this gap matters for their career trajectory",
      "timeToLearn": "3-6 months"
    }
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "roadmap": [
    {
      "phase": 1,
      "title": "Foundation",
      "duration": "1-2 months",
      "description": "What to focus on and why",
      "milestones": ["milestone 1", "milestone 2"],
      "skills": ["Skill A", "Skill B"]
    },
    {
      "phase": 2,
      "title": "Growth",
      "duration": "2-4 months",
      "description": "Next steps",
      "milestones": ["milestone 1"],
      "skills": ["Skill C"]
    },
    {
      "phase": 3,
      "title": "Mastery",
      "duration": "3-6 months",
      "description": "Advanced targets",
      "milestones": ["milestone 1"],
      "skills": ["Skill D"]
    }
  ],
  "suggestedRoles": [
    { "title": "Senior Backend Engineer", "matchScore": 85, "reason": "strong Python + API experience" }
  ]
}

Be specific and actionable. Base everything on what's actually in the resume. Provide 3-5 skill gaps and exactly 3 roadmap phases.`;

      const raw = await callGemini(prompt, pdfBase64);

      let analysis;
      try {
        analysis = parseJSON(raw);
      } catch (e) {
        logger.error('Failed to parse Gemini JSON response:', raw.slice(0, 500));
        return res.status(500).json({ error: 'AI returned an unexpected response. Please try again.' });
      }

      res.json({ success: true, analysis });
    } catch (err) {
      logger.error('Career analyze error:', err.message);
      res.status(500).json({ error: err.message || 'Analysis failed' });
    }
  }
);

export default router;