import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getOpenPullRequests } from '../../services/githubService.js';
import { botConfig } from '../../config/bot.js';

export default {
  data: new SlashCommandBuilder()
    .setName('pulls')
    .setDescription('Get open pull requests from the repository')
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('Number of pull requests to display (max 10)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)
    ),
  cooldown: 10,
  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const count = interaction.options.getInteger('count') || 5;
      const pulls = await getOpenPullRequests(count);

      if (!pulls || pulls.length === 0) {
        return interaction.editReply('No open pull requests found.');
      }

      const embed = new EmbedBuilder()
        .setTitle(`Open Pull Requests (${pulls.length})`)
        .setColor(botConfig.embedColor)
        .setURL(`https://github.com/${botConfig.github.owner}/${botConfig.github.repo}/pulls`)
        .setTimestamp();

      pulls.forEach((pr, index) => {
        const author = pr.user.login;
        const created = new Date(pr.created_at).toLocaleDateString();
        const draft = pr.draft ? ' (Draft)' : '';

        embed.addFields({
          name: `${index + 1}. #${pr.number} - ${pr.title}${draft}`,
          value: `**Author:** ${author}\n**Created:** ${created}\n**Branch:** ${pr.head.ref} → ${pr.base.ref}`,
          inline: false,
        });
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching pull requests:', error);
      await interaction.editReply('Error fetching pull requests. Please try again later.');
    }
  },
};