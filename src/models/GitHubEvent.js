import mongoose from 'mongoose';

const githubEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
  },
  eventData: {
    type: Object,
    required: true,
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
  channelId: {
    type: String,
    required: true,
  },
  messageId: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

export const GitHubEvent = mongoose.model('GitHubEvent', githubEventSchema);