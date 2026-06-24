import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export async function connectDB() {
	const uri = process.env.MONGODB_URI;

	if (!uri) {
		logger.error('MONGODB_URI is not set in .env');
		process.exit(1);
	}

	try {
		await mongoose.connect(uri);
		logger.info('✅ MongoDB connected');
	} catch (error) {
		logger.error('❌ MongoDB connection failed:', error.message);
		process.exit(1);
	}
}

export default connectDB;
