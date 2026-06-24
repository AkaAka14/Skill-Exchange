import { Router } from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { emitToUser } from '../sockets/index.js';
import logger from '../utils/logger.js';

const router = Router();

router.use(requireAuth);


router.get('/conversations', async (req, res) => {
	try {
		const userId = req.userId;

		const messages = await Message.find({
			$or: [{ senderId: userId }, { recipientId: userId }],
		}).sort({ createdAt: -1 });

		const convMap = new Map();
		messages.forEach((msg) => {
			const otherId = msg.senderId.toString() === userId ? msg.recipientId.toString() : msg.senderId.toString();

			if (!convMap.has(otherId)) {
				convMap.set(otherId, {
					otherUserId: otherId,
					lastMessage: msg.toSafeObject(),
					unreadCount: msg.recipientId.toString() === userId && !msg.isRead ? 1 : 0,
				});
			} else if (msg.recipientId.toString() === userId && !msg.isRead) {
				convMap.get(otherId).unreadCount += 1;
			}
		});

		const otherIds = Array.from(convMap.keys());
		const users = await User.find({ _id: { $in: otherIds } });
		const userById = {};
		users.forEach((u) => {
			userById[u._id.toString()] = u.toSafeObject();
		});

		const conversations = Array.from(convMap.values())
			.filter((c) => userById[c.otherUserId]) 
			.map((c) => ({ ...c, otherUser: userById[c.otherUserId] }));

		res.json(conversations);
	} catch (error) {
		logger.error('Get conversations error:', error.message);
		res.status(500).json({ error: 'Failed to fetch conversations' });
	}
});

router.get('/:otherUserId', async (req, res) => {
	try {
		const { otherUserId } = req.params;
		if (!mongoose.isValidObjectId(otherUserId)) {
			return res.status(400).json({ error: 'Invalid user id' });
		}

		const messages = await Message.find({
			$or: [
				{ senderId: req.userId, recipientId: otherUserId },
				{ senderId: otherUserId, recipientId: req.userId },
			],
		}).sort({ createdAt: 1 });

		res.json(messages.map((m) => m.toSafeObject()));
	} catch (error) {
		logger.error('Get message history error:', error.message);
		res.status(500).json({ error: 'Failed to fetch messages' });
	}
});

router.post('/', async (req, res) => {
	try {
		const { recipientId, messageText } = req.body;

		if (!mongoose.isValidObjectId(recipientId)) {
			return res.status(400).json({ error: 'Invalid recipientId' });
		}
		if (!messageText?.trim()) {
			return res.status(400).json({ error: 'messageText is required' });
		}

		const recipientExists = await User.exists({ _id: recipientId });
		if (!recipientExists) {
			return res.status(404).json({ error: 'Recipient not found' });
		}

		const message = await Message.create({
			senderId: req.userId,
			recipientId,
			messageText: messageText.trim(),
		});

		const safeMessage = message.toSafeObject();

		emitToUser(recipientId, 'message:new', safeMessage);

		res.status(201).json(safeMessage);
	} catch (error) {
		logger.error('Send message error:', error.message);
		res.status(500).json({ error: 'Failed to send message' });
	}
});

router.put('/:id/read', async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).json({ error: 'Invalid message id' });
		}

		const message = await Message.findById(req.params.id);
		if (!message) return res.status(404).json({ error: 'Message not found' });

		if (message.recipientId.toString() !== req.userId) {
			return res.status(403).json({ error: 'Not allowed' });
		}

		message.isRead = true;
		await message.save();

		emitToUser(message.senderId.toString(), 'message:read', { messageId: message._id.toString() });

		res.json(message.toSafeObject());
	} catch (error) {
		logger.error('Mark as read error:', error.message);
		res.status(500).json({ error: 'Failed to mark message as read' });
	}
});

export default router;
