import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    bio: { type: String, default: '', maxlength: 500 },
    avatarUrl: { type: String, default: '' },

    skillsOffered: [{ type: String, trim: true }],
    skillsWanted:  [{ type: String, trim: true }],
    embedding:     { type: [Number], default: [] },

    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    avgRating:   { type: Number, default: null },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};


userSchema.methods.toSafeObject = function () {
  return {
    id:            this._id.toString(),
    _id:           this._id.toString(),  
    name:          this.name,
    email:         this.email,
    bio:           this.bio,
    avatarUrl:     this.avatarUrl,
    skillsOffered: this.skillsOffered,
    skillsWanted:  this.skillsWanted,
    avgRating:     this.avgRating,
    reviewCount:   this.reviewCount,
    createdAt:     this.createdAt,
  };
};

export default mongoose.model('User', userSchema);