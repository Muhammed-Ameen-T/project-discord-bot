import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { botConfig } from '../../config/bot.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency and API response time'),
  execute: async (interaction) => {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const timeDifference = sent.createdTimestamp - interaction.createdTimestamp;
    
    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor(botConfig.embedColor)
      .addFields(
        { name: 'Bot Latency', value: `${timeDifference}ms`, inline: true },
        { name: 'API Latency', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ content: null, embeds: [embed] });
  },
};