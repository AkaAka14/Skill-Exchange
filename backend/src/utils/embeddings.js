import { pipeline } from '@xenova/transformers';
import logger from './logger.js';

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';

let embedderPromise = null;

function getEmbedder() {
  if (!embedderPromise) {
    logger.info(`Loading local embedding model (${MODEL_NAME})... first load can take ~30-60s`);
    embedderPromise = pipeline('feature-extraction', MODEL_NAME);
  }
  return embedderPromise;
}

/**
 * Build a descriptive sentence from a skill name + optional category.
 * Including the category gives MiniLM the domain context it needs to
 * place vectors correctly — "Spanish (Languages)" ends up near other
 * language skills, far from "Python (Programming)".
 */
export function buildSkillText(skillName, category = '') {
  const name = skillName.trim();
  const cat  = category.trim();
  if (cat) {
    return `${name} is a skill in the ${cat} category. Someone with this skill can teach or practice ${name}.`;
  }
  return `This is a skill called "${name}". Someone who has this skill is able to teach or practice ${name}.`;
}

/**
 * Generates a semantic embedding for a skill.
 * @param {string} skillName
 * @param {string} [category]
 * @returns {Promise<number[]>} 384-dimensional normalised vector
 */
export async function generateEmbedding(skillName, category = '') {
  const embedder = await getEmbedder();
  const text = buildSkillText(skillName, category);
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export function warmUpEmbeddingModel() {
  getEmbedder()
    .then(() => logger.info('✅ Embedding model ready'))
    .catch((err) => logger.error('Failed to load embedding model:', err.message));
}