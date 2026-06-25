import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

let io = null;

/**
 * Initializes Socket.io on top of the existing HTTP server.
 * Every connecting client must send a valid JWT (the same one used for
 * REST calls) via `socket.handshake.auth.token`. On success, the socket
 * joins a private room named `user:<userId>` - this is how we target
 * "send this event only to this specific user" without tracking raw
 * socket ids ourselves (a user could have multiple tabs/devices open).
 */
export function initSocket(httpServer) {
	io = new Server(httpServer, {
		cors: {
			origin: process.env.CORS_ORIGIN,
			credentials: true,
		},
	});

	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth?.token;
			if (!token) return next(new Error('No token provided'));

			const decoded = verifyToken(token);
			const user = await User.findById(decoded.id);
			if (!user) return next(new Error('User no longer exists'));

			socket.userId = user._id.toString();
			next();
		} catch (err) {
			next(new Error('Invalid or expired token'));
		}
	});

	io.on('connection', (socket) => {
		socket.join(`user:${socket.userId}`);
		logger.info(`Socket connected: user ${socket.userId}`);

		socket.on('disconnect', () => {
			logger.info(`Socket disconnected: user ${socket.userId}`);
		});
	});

	return io;
}

/**
 * Emits an event to every socket/tab a specific user has open.
 * Safe to call even if that user isn't currently connected (no-op).
 */
export function emitToUser(userId, event, payload) {
	if (!io) return;
	io.to(`user:${userId}`).emit(event, payload);
}
