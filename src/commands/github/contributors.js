import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getContributors } from '../../services/githubService.js';
import { botConfig } from '../../config/bot.js';

export default {
  data: new SlashCommandBuilder()
    .setName('contributors')
    .setDescription('Get the top contributors to the repository')
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('Number of contributors to display (max 10)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)
    ),
  cooldown: 15,
  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const count = interaction.options.getInteger('count') || 5;
      const contributors = await getContributors(count);

      if (!contributors || contributors.length === 0) {
        return interaction.editReply('No contributors found.');
      }

      const embed = new EmbedBuilder()
        .setTitle(`Top ${contributors.length} Contributors`)
        .setColor(botConfig.embedColor)
        .setURL(`https://github.com/${botConfig.github.owner}/${botConfig.github.repo}/graphs/contributors`)
        .setTimestamp();

      contributors.forEach((contributor, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        embed.addFields({
          name: `${medal} ${contributor.login}`,
          value: `**Contributions:** ${contributor.contributions}`,
          inline: true,
        });
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching contributors:', error);
      await interaction.editReply('Error fetching contributors. Please try again later.');
    }
  },
};