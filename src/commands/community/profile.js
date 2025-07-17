import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { User } from '../../models/User.js';
import { botConfig } from '../../config/bot.js';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your or another user\'s profile')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to view')
        .setRequired(false)
    ),
  execute: async (interaction) => {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    
    try {
      const userProfile = await User.findOne({ discordId: targetUser.id });
      
      if (!userProfile) {
        return interaction.reply({
          content: `${targetUser.username} is not registered in the database.`,
          ephemeral: true,
        });
      }

      const member = interaction.guild.members.cache.get(targetUser.id);
      const joinedDiscord = member ? member.joinedAt : null;

      const embed = new EmbedBuilder()
        .setTitle(`${targetUser.username}'s Profile`)
        .setThumbnail(targetUser.displayAvatarURL())
        .setColor(botConfig.embedColor)
        .addFields(
          { name: 'Messages Sent', value: userProfile.messageCount.toString(), inline: true },
          { name: 'Contributions', value: userProfile.contributionCount.toString(), inline: true },
          { name: 'Status', value: userProfile.isActive ? 'Active' : 'Inactive', inline: true },
          { name: 'Joined Community', value: joinedDiscord ? joinedDiscord.toLocaleDateString() : 'Unknown', inline: true },
          { name: 'Last Activity', value: userProfile.lastActivity.toLocaleDateString(), inline: true },
          { name: 'GitHub Username', value: userProfile.githubUsername || 'Not linked', inline: true }
        )
        .setTimestamp();

      if (userProfile.roles.length > 0) {
        embed.addFields({
          name: 'Roles',
          value: userProfile.roles.join(', '),
          inline: false,
        });
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching profile:', error);
      await interaction.reply({
        content: 'Error fetching profile. Please try again later.',
        ephemeral: true,
      });
    }
  },
};