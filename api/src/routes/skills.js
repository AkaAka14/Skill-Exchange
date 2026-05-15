import { Router } from 'express';
import logger from '../utils/logger.js';

const router = Router();

// Helper function to call integrated AI stream endpoint
async function generateEmbedding(skillName, req) {
  // 1. Controller to cancel the request if it takes > 10 seconds
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const userMessage = JSON.stringify([{
      type: 'text',
      text: `Generate a 384-float array representing the semantic meaning of the skill: "${skillName}". Return ONLY the JSON array of numbers.`
    }]);

    const formData = new FormData();
    formData.append('message', userMessage);

    // We use req.headers.authorization to pass the token forward
    const response = await fetch('http://localhost:3001/integrated-ai/stream', {
      method: 'POST',
      body: formData,
      headers: { 
        'Authorization': req.headers.authorization 
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI Server responded with ${response.status}: ${errorText}`);
    }

    return await parseEmbeddingFromStream(response.body);
  } catch (error) {
    clearTimeout(timeout);
    // If the real AI fails, we still return a MOCK vector so the 
    // user's skill actually gets saved to the DB.
    logger.error(`⚠️ AI Streaming failed: ${error.message}. Falling back to mock vector.`);
    return Array.from({ length: 384 }, () => parseFloat((Math.random() * 2 - 1).toFixed(4)));
  }
}


// Helper function to call integrated AI stream endpoint
// async function generateEmbedding(skillName, req) {
//   // 1. Add a Controller to cancel the request if it takes > 5 seconds
//   const controller = new AbortController();
//   const timeout = setTimeout(() => controller.abort(), 5000);

//   try {
//     const userMessage = JSON.stringify([{
//       type: 'text',
//       text: `Generate a 384-float array for: ${skillName}. Return ONLY [0.1, -0.2, ...].`
//     }]);

//     const formData = new FormData();
//     formData.append('message', userMessage);

//     const response = await fetch('http://localhost:3001/integrated-ai/stream', {
//       method: 'POST',
//       body: formData,
//       headers: { 'Authorization': req.headers.authorization },
//       signal: controller.signal // Link the timeout
//     });

//     clearTimeout(timeout);

//     if (!response.ok) throw new Error('AI Server Down');

//     return await parseEmbeddingFromStream(response.body);
//   } catch (error) {
//     clearTimeout(timeout);
//     console.error("AI Failed, using dummy vector:", error.message);
    
//     // 2. FALLBACK: Return a dummy vector of 384 zeros so the skill actually gets saved!
//     return new Array(384).fill(0); 
//   }
// }

// // Helper function to parse SSE stream and extract embedding array
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
  try {
    const { skillName } = req.body;
    if (!skillName) return res.status(400).json({ error: 'Name required' });

    logger.info(`Generating embedding for skill: ${skillName}`);
    const embedding = await generateEmbedding(skillName.trim(), req);

    res.json({ skillName: skillName.trim(), embedding });
  } catch (error) {
    logger.error('Embedding generation failed:', error.message);
    res.status(500).json({ error: 'Failed to generate AI embedding' });
  }
});
export default router;