import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

export default {
  name: 'messageCreate',
  execute: async (message) => {
    if (message.author.bot) return;

    try {
      // Update user activity
      await User.findOneAndUpdate(
        { discordId: message.author.id },
        {
          discordId: message.author.id,
          username: message.author.username,
          lastActivity: new Date(),
          $inc: { messageCount: 1 },
        },
        { upsert: true, new: true }
      );

      // Check for helpful replies (basic implementation)
      if (message.content.toLowerCase().includes('thank') || 
          message.content.toLowerCase().includes('helpful') ||
          message.content.toLowerCase().includes('solved')) {
        
        // Give appreciation reaction
        await message.react('👍');
        
        if (Math.random() < 0.1) { // 10% chance to send appreciation message
          await message.reply('Great job helping out the community! 🌟');
        }
      }

    } catch (error) {
      logger.error('Error handling message:', error);
    }
  },
};