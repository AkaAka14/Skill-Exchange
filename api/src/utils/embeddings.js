import { pipeline } from '@xenova/transformers';
import logger from './logger.js';

// The model (~30MB) downloads once from Hugging Face's CDN and is cached
// in the OS temp/cache dir afterwards, so only the very first request is slow.
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
 * Generates a real semantic embedding for a piece of text using a small
 * local transformer model (runs in-process, no external API call, no API key).
 * @param {string} text
 * @returns {Promise<number[]>} a 384-dimensional vector
 */
export async function generateEmbedding(text) {
	const embedder = await getEmbedder();
	const output = await embedder(text, { pooling: 'mean', normalize: true });
	return Array.from(output.data);
}

// Warm the model up as soon as the server boots, so the first real
// request from a user isn't the one that eats the 30-60s cold start.
export function warmUpEmbeddingModel() {
	getEmbedder()
		.then(() => logger.info('✅ Embedding model ready'))
		.catch((err) => logger.error('Failed to load embedding model:', err.message));
}
