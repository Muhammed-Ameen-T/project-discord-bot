import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { User } from '../../models/User.js';
import { botConfig } from '../../config/bot.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the community leaderboard')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of leaderboard')
        .setRequired(false)
        .addChoices(
          { name: 'Messages', value: 'messages' },
          { name: 'Contributions', value: 'contributions' }
        )
    ),
  execute: async (interaction) => {
    const type = interaction.options.getString('type') || 'messages';
    
    try {
      const sortField = type === 'messages' ? 'messageCount' : 'contributionCount';
      const topUsers = await User.find({})
        .sort({ [sortField]: -1 })
        .limit(10);

      if (topUsers.length === 0) {
        return interaction.reply('No users found in the leaderboard.');
      }

      const embed = new EmbedBuilder()
        .setTitle(`🏆 ${type.charAt(0).toUpperCase() + type.slice(1)} Leaderboard`)
        .setColor(botConfig.embedColor)
        .setTimestamp();

      topUsers.forEach((user, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        const count = type === 'messages' ? user.messageCount : user.contributionCount;
        
        embed.addFields({
          name: `${medal} ${user.username}`,
          value: `**${type === 'messages' ? 'Messages' : 'Contributions'}:** ${count}`,
          inline: true,
        });
      });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      await interaction.reply({
        content: 'Error fetching leaderboard. Please try again later.',
        ephemeral: true,
      });
    }
  },
};