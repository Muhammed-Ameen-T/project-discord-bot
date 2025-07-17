import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { botConfig } from '../../config/bot.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with bot commands')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('Get help for a specific command')
        .setRequired(false)
    ),
  execute: async (interaction) => {
    const commandName = interaction.options.getString('command');
    
    if (commandName) {
      const command = interaction.client.commands.get(commandName);
      
      if (!command) {
        return interaction.reply({
          content: `No command found with name \`${commandName}\`.`,
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(`Help: /${command.data.name}`)
        .setDescription(command.data.description)
        .setColor(botConfig.embedColor);

      if (command.data.options && command.data.options.length > 0) {
        const options = command.data.options.map(option => {
          const required = option.required ? '(Required)' : '(Optional)';
          return `**${option.name}** ${required}: ${option.description}`;
        }).join('\n');

        embed.addFields({ name: 'Options', value: options });
      }

      if (command.cooldown) {
        embed.addFields({ name: 'Cooldown', value: `${command.cooldown} seconds` });
      }

      return interaction.reply({ embeds: [embed] });
    }

    // Show all commands
    const embed = new EmbedBuilder()
      .setTitle('🤖 Bot Commands')
      .setDescription('Here are all available commands:')
      .setColor(botConfig.embedColor)
      .addFields(
        {
          name: '📊 GitHub Commands',
          value: '`/commits` - View latest commits\n`/issues` - View open issues\n`/pulls` - View open pull requests\n`/contributors` - View top contributors',
          inline: false,
        },
        {
          name: '👥 Community Commands',
          value: '`/profile` - View user profile\n`/leaderboard` - View community leaderboard',
          inline: false,
        },
        {
          name: '🔧 Utility Commands',
          value: '`/help` - Show this help message\n`/ping` - Check bot latency',
          inline: false,
        }
      )
      .setFooter({ text: 'Use /help <command> for detailed information about a command' });

    await interaction.reply({ embeds: [embed] });
  },
};