import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLatestCommits } from '../../services/githubService.js';
import { botConfig } from '../../config/bot.js';

export default {
  data: new SlashCommandBuilder()
    .setName('commits')
    .setDescription('Get the latest commits from the repository')
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('Number of commits to display (max 10)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)
    ),
  cooldown: 10,
  execute: async (interaction) => {
    await interaction.deferReply();

    try {
      const count = interaction.options.getInteger('count') || 5;
      const commits = await getLatestCommits(count);

      if (!commits || commits.length === 0) {
        return interaction.editReply('No commits found.');
      }

      const embed = new EmbedBuilder()
        .setTitle(`Latest ${commits.length} Commits`)
        .setColor(botConfig.embedColor)
        .setURL(`https://github.com/${botConfig.github.owner}/${botConfig.github.repo}/commits`)
        .setTimestamp();

      commits.forEach((commit, index) => {
        const author = commit.author?.login || commit.commit.author.name;
        const message = commit.commit.message.split('\n')[0];
        const shortSha = commit.sha.substring(0, 7);
        const date = new Date(commit.commit.author.date).toLocaleDateString();

        embed.addFields({
          name: `${index + 1}. ${shortSha} - ${author}`,
          value: `${message}\n*${date}*`,
          inline: false,
        });
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching commits:', error);
      await interaction.editReply('Error fetching commits. Please try again later.');
    }
  },
};