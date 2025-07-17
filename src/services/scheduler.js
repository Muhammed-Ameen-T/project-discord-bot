import cron from 'node-cron';
import { EmbedBuilder } from 'discord.js';
import { User } from '../models/User.js';
import { getRepositoryInfo } from './githubService.js';
import { botConfig } from '../config/bot.js';
import { logger } from '../utils/logger.js';

export function startScheduledTasks(client) {
  // Weekly project status summary (every Sunday at 9 AM)
  cron.schedule('0 9 * * 0', async () => {
    await sendWeeklyStatus(client);
  });

  // Check for inactive members (daily at 8 AM)
  cron.schedule('0 8 * * *', async () => {
    await checkInactiveMembers(client);
  });

  // Daily fun fact (every day at 10 AM)
  cron.schedule('0 10 * * *', async () => {
    await sendDailyFunFact(client);
  });

  logger.info('Scheduled tasks started');
}

async function sendWeeklyStatus(client) {
  try {
    const channel = client.channels.cache.get(botConfig.channels.general);
    if (!channel) return;

    const repoInfo = await getRepositoryInfo();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const newMembers = await User.countDocuments({
      joinedAt: { $gte: weekAgo }
    });

    const activeMembers = await User.countDocuments({
      lastActivity: { $gte: weekAgo }
    });

    const embed = new EmbedBuilder()
      .setTitle('📊 Weekly Project Status')
      .setDescription('Here\'s what happened this week in our community!')
      .setColor(botConfig.embedColor)
      .addFields(
        { name: '⭐ Repository Stars', value: repoInfo.stargazers_count.toString(), inline: true },
        { name: '🍴 Forks', value: repoInfo.forks_count.toString(), inline: true },
        { name: '👥 New Members', value: newMembers.toString(), inline: true },
        { name: '🔥 Active Members', value: activeMembers.toString(), inline: true },
        { name: '🐛 Open Issues', value: repoInfo.open_issues_count.toString(), inline: true },
        { name: '📝 Language', value: repoInfo.language || 'Multiple', inline: true }
      )
      .setThumbnail(repoInfo.owner.avatar_url)
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    logger.info('Weekly status sent');
  } catch (error) {
    logger.error('Error sending weekly status:', error);
  }
}

async function checkInactiveMembers(client) {
  try {
    const inactiveThreshold = new Date(Date.now() - botConfig.inactiveThresholdDays * 24 * 60 * 60 * 1000);
    const inactiveMembers = await User.find({
      lastActivity: { $lt: inactiveThreshold },
      isActive: true
    });

    if (inactiveMembers.length === 0) return;

    const channel = client.channels.cache.get(botConfig.channels.general);
    if (!channel) return;

    // Randomly select a few inactive members to ping
    const membersToEngage = inactiveMembers
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(3, inactiveMembers.length));

    for (const member of membersToEngage) {
      const user = await client.users.fetch(member.discordId);
      if (user) {
        const messages = [
          `Hey ${user}, we miss you! Check out what's new in the project 🚀`,
          `${user}, your expertise would be valuable on our latest discussions! 💡`,
          `${user}, we'd love to see you back in the community! 🌟`,
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        await channel.send(randomMessage);
        
        // Small delay to avoid spam
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info(`Engaged ${membersToEngage.length} inactive members`);
  } catch (error) {
    logger.error('Error checking inactive members:', error);
  }
}

async function sendDailyFunFact(client) {
  try {
    const channel = client.channels.cache.get(botConfig.channels.general);
    if (!channel) return;

    const funFacts = [
      '💡 Fun fact: The first computer bug was an actual bug - a moth found in a Harvard Mark II computer in 1947!',
      '🚀 Fun fact: The term "debugging" was coined by Grace Hopper, a pioneering computer scientist!',
      '🌐 Fun fact: The first website ever created is still online: http://info.cern.ch/hypertext/WWW/TheProject.html',
      '💻 Fun fact: The first computer mouse was made of wood and had only one button!',
      '🔢 Fun fact: The word "pixel" is a combination of "picture" and "element"!',
      '🎮 Fun fact: The first video game was "Tennis for Two" created in 1958!',
      '📱 Fun fact: The first text message was sent in 1992 and said "Merry Christmas"!',
      '🔐 Fun fact: The qwerty keyboard layout was designed to slow down typing to prevent typewriter jams!',
    ];

    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
    await channel.send(randomFact);
    
    logger.info('Daily fun fact sent');
  } catch (error) {
    logger.error('Error sending daily fun fact:', error);
  }
}