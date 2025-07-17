import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { connectDatabase } from './src/config/database.js';
import { loadCommands } from './src/handlers/commandHandler.js';
import { loadEvents } from './src/handlers/eventHandler.js';
import { startWebhookServer } from './src/services/webhookServer.js';
import { startScheduledTasks } from './src/services/scheduler.js';
import { logger } from './src/utils/logger.js';

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

// Initialize collections
client.commands = new Collection();
client.cooldowns = new Collection();

async function startBot() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Load commands and events
    await loadCommands(client);
    await loadEvents(client);
    
    // Start webhook server
    await startWebhookServer(client);
    
    // Start scheduled tasks
    startScheduledTasks(client);
    
    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);
    
    logger.info('Bot started successfully!');
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  logger.info('Shutting down bot...');
  client.destroy();
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection:', error);
});

startBot();