import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		recipientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		messageText: {
			type: String,
			required: [true, 'Message text is required'],
			trim: true,
			maxlength: 2000,
		},
		isRead: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
);


messageSchema.index({ senderId: 1, recipientId: 1, createdAt: 1 });

messageSchema.methods.toSafeObject = function toSafeObject() {
	return {
		id: this._id.toString(),
		senderId: this.senderId.toString(),
		recipientId: this.recipientId.toString(),
		messageText: this.messageText,
		isRead: this.isRead,
		created: this.createdAt,
	};
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
