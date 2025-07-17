import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getOpenIssues } from '../../services/githubService.js';
import { botConfig } from '../../config/bot.js';

export default {
  data: new SlashCommandBuilder()
    .setName('issues')
    .setDescription('Get open issues from the repository')
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('Number of issues to display (max 10)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)
    ),
  cooldown: 10,
  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const count = interaction.options.getInteger('count') || 5;
      const issues = await getOpenIssues(count);

      if (!issues || issues.length === 0) {
        return interaction.editReply('No open issues found.');
      }

      const embed = new EmbedBuilder()
        .setTitle(`Open Issues (${issues.length})`)
        .setColor(botConfig.warningColor)
        .setURL(`https://github.com/${botConfig.github.owner}/${botConfig.github.repo}/issues`)
        .setTimestamp();

      issues.forEach((issue, index) => {
        const labels = issue.labels.map(label => label.name).join(', ');
        const author = issue.user.login;
        const created = new Date(issue.created_at).toLocaleDateString();

        embed.addFields({
          name: `${index + 1}. #${issue.number} - ${issue.title}`,
          value: `**Author:** ${author}\n**Created:** ${created}${labels ? `\n**Labels:** ${labels}` : ''}`,
          inline: false,
        });
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching issues:', error);
      await interaction.editReply('Error fetching issues. Please try again later.');
    }
  },
};