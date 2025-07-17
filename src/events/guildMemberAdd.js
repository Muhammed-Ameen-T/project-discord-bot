import { EmbedBuilder } from 'discord.js';
import { User } from '../models/User.js';
import { botConfig } from '../config/bot.js';
import { logger } from '../utils/logger.js';

export default {
  name: 'guildMemberAdd',
  execute: async (member) => {
    try {
      // Create user record
      const user = new User({
        discordId: member.id,
        username: member.user.username,
        joinedAt: new Date(),
      });
      await user.save();

      // Send welcome message
      const welcomeChannel = member.guild.channels.cache.get(botConfig.channels.welcome);
      if (welcomeChannel) {
        const welcomeEmbed = new EmbedBuilder()
          .setTitle('Welcome to the Community! 🎉')
          .setDescription(`Hey ${member}, welcome to our open-source community! We're excited to have you here.`)
          .addFields(
            { name: '🚀 Get Started', value: 'Check out our GitHub repository and contribute to the project!', inline: true },
            { name: '💬 Join the Discussion', value: 'Feel free to ask questions and share your ideas!', inline: true },
            { name: '📚 Resources', value: 'Use `/help` to see all available commands.', inline: true }
          )
          .setColor(botConfig.embedColor)
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp();

        await welcomeChannel.send({ embeds: [welcomeEmbed] });
        
        // Update user record
        user.welcomeMessageSent = true;
        await user.save();
      }

      logger.info(`New member joined: ${member.user.username} (${member.id})`);
    } catch (error) {
      logger.error('Error handling new member:', error);
    }
  },
};