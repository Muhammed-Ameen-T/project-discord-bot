import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  messageCount: {
    type: Number,
    default: 0,
  },
  contributionCount: {
    type: Number,
    default: 0,
  },
  githubUsername: {
    type: String,
    default: null,
  },
  roles: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  welcomeMessageSent: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export const User = mongoose.model('User', userSchema);