import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';


export const requireAuth = async (req, res, next) => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1];

	if (!token) {
		return res.status(401).json({ error: 'No token provided' });
	}

	try {
		const decoded = verifyToken(token);
		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(401).json({ error: 'User no longer exists' });
		}

		req.user = user;
		req.userId = user._id.toString();
		return next();
	} catch (error) {
		return res.status(401).json({ error: 'Token is expired or invalid' });
	}
};

export default requireAuth;
