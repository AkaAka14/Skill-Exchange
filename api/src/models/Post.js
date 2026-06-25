import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    likes:    { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.methods.toSafeObject = function () {
  return {
    id:        this._id.toString(),
    userId:    this.userId.toString(),
    title:     this.title,
    content:   this.content,
    tags:      this.tags,
    likes:     this.likes,
    comments:  this.comments,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('Post', postSchema);