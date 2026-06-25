import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		skillName: {
			type: String,
			required: [true, 'Skill name is required'],
			trim: true,
			maxlength: 100,
		},
		skillType: {
			type: String,
			enum: ['have', 'want'],
			required: true,
		},
		category: {
			type: String,
			trim: true,
			maxlength: 60,
			default: '',
		},
		level: {
			type: String,
			enum: ['beginner', 'intermediate', 'advanced'],
			default: 'intermediate',
		},
		// 384-dimensional sentence embedding : the local MiniLM model,
		// cosine-similarity matching : routes/matches.js
		embedding: {
			type: [Number],
			default: [],
		},
	},
	{ timestamps: true },
);

skillSchema.index({ userId: 1, skillType: 1 });

skillSchema.methods.toSafeObject = function toSafeObject() {
	return {
		id: this._id.toString(),
		userId: this.userId.toString(),
		skillName: this.skillName,
		skillType: this.skillType,
		category: this.category || '',
		level: this.level || 'intermediate',
		createdAt: this.createdAt,
	};
};

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;