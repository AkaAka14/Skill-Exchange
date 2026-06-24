import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });
//console.log('CLOUDINARY CHECK:', process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY ? 'KEY_SET' : 'KEY_MISSING');
import { initCloudinary } from './config/cloudinary.js';
initCloudinary();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import routes from './routes/index.js';
import { errorMiddleware } from './middleware/error.js';
import { globalRateLimit } from './middleware/global-rate-limit.js';
import logger from './utils/logger.js';
import { BodyLimit } from './constants/common.js';
import connectDB from './config/db.js';
import { warmUpEmbeddingModel } from './utils/embeddings.js';
import { createServer } from 'http';
import { initSocket } from './sockets/index.js';

const app = express();

await connectDB();
warmUpEmbeddingModel();

app.set('trust proxy', 1);

process.on('uncaughtException', (error) => {
	logger.error('Uncaught exception:', error);
});
  
process.on('unhandledRejection', (reason, promise) => {
	logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', async () => {
	logger.info('Interrupted');
	process.exit(0);
});

process.on('SIGTERM', async () => {
	logger.info('SIGTERM signal received');

	await new Promise(resolve => setTimeout(resolve, 3000));

	logger.info('Exiting');
	process.exit();
});

app.use(helmet());
app.use(cors({
	origin: process.env.CORS_ORIGIN,
	credentials: true,
}));
app.use(morgan('combined'));
app.use(globalRateLimit);
app.use(express.json({
	limit: BodyLimit,
}));
app.use(express.urlencoded({ 
	extended: true,
	limit: BodyLimit,
}));

app.use('/', routes);

app.use(errorMiddleware);

app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3001;

// Socket.io needs to attach to the raw HTTP server, not the Express app
// directly, so both REST and realtime traffic share the same port.
const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(port, () => {
	logger.info(`🚀 API Server running on http://localhost:${port}`);
});

export default app;