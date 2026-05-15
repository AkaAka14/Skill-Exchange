import { Router } from 'express';
import logger from '../utils/logger.js';

const router = Router();

// Helper function to call integrated AI stream endpoint
async function generateEmbedding(skillName) {
  const userMessage = JSON.stringify([
    {
      type: 'text',
      text: `Generate a semantic embedding vector for the skill: ${skillName}. Return ONLY a valid JSON array of 384 numbers representing the embedding. The numbers should be between -1 and 1. Do not include any other text or explanation.`,
    },
  ]);

  const formData = new FormData();
  formData.append('message', userMessage);

  const response = await fetch('http://localhost:3001/hcgi/api/integrated-ai/stream', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to generate embedding: ${response.status} ${response.statusText}`);
  }

  // Parse SSE stream to extract embedding from AI response
  const embedding = await parseEmbeddingFromStream(response.body);
  return embedding;
}

// Helper function to parse SSE stream and extract embedding array
async function parseEmbeddingFromStream(stream) {
  let buffer = '';
  let embeddingText = '';

  const textStream = stream.pipeThrough(new TextDecoderStream());

  for await (const chunk of textStream) {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) {
        continue;
      }

      const jsonStr = line.slice(6);

      if (jsonStr === '[DONE]') {
        break;
      }

      try {
        const event = JSON.parse(jsonStr);
        if (event.type === 'content' && event.data?.content) {
          embeddingText += event.data.content;
        }
      } catch (e) {
        // Skip invalid JSON lines
      }
    }
  }

  // Extract JSON array from the response text
  const jsonMatch = embeddingText.match(/\[\s*-?\d+\.?\d*[\s,\-\d.]*\]/);
  if (!jsonMatch) {
    throw new Error('Could not extract embedding array from AI response');
  }

  const embedding = JSON.parse(jsonMatch[0]);

  if (!Array.isArray(embedding) || embedding.length !== 384) {
    throw new Error(`Invalid embedding format: expected array of 384 numbers, got ${Array.isArray(embedding) ? embedding.length : 'non-array'}`);
  }

  return embedding;
}

// POST /skills/embedding - Generate embedding for a skill
router.post('/embedding', async (req, res) => {
  const { skillName } = req.body;

  if (!skillName || typeof skillName !== 'string' || skillName.trim().length === 0) {
    return res.status(400).json({ error: 'skillName is required and must be a non-empty string' });
  }

  logger.info(`Generating embedding for skill: ${skillName}`);

  const embedding = await generateEmbedding(skillName.trim());

  res.json({
    skillName: skillName.trim(),
    embedding,
  });
});

export default router;