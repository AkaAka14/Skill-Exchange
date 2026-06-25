import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

const authRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Too many auth attempts, please try again later' },
});

function isValidEmail(email) {
	return /^\S+@\S+\.\S+$/.test(email);
}

router.post('/register', authRateLimit, async (req, res) => {
	try {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({ error: 'Name, email and password are required' });
		}
		if (!isValidEmail(email)) {
			return res.status(400).json({ error: 'Invalid email format' });
		}
		if (password.length < 8) {
			return res.status(400).json({ error: 'Password must be at least 8 characters' });
		}

		const existing = await User.findOne({ email: email.toLowerCase().trim() });
		if (existing) {
			return res.status(409).json({ error: 'An account with this email already exists' });
		}

		const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
		const token = signToken(user._id);

		res.status(201).json({ token, user: user.toSafeObject() });
	} catch (error) {
		logger.error('Register error:', error.message);
		res.status(500).json({ error: 'Failed to register' });
	}
});

router.post('/login', authRateLimit, async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: 'Email and password are required' });
		}

	
		const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

		if (!user || !(await user.comparePassword(password))) {
			return res.status(401).json({ error: 'Invalid email or password' });
		}

		const token = signToken(user._id);

		res.json({ token, user: user.toSafeObject() });
	} catch (error) {
		logger.error('Login error:', error.message);
		res.status(500).json({ error: 'Failed to log in' });
	}
});

router.get('/me', requireAuth, async (req, res) => {
	res.json({ user: req.user.toSafeObject() });
});

export default router;