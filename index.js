import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { connectDatabase } from './src/config/database.js';
import { loadCommands } from './src/handlers/commandHandler.js';
import { loadEvents } from './src/handlers/eventHandler.js';
import { startWebhookServer } from './src/services/webhookServer.js';
import { startScheduledTasks } from './src/services/scheduler.js';
import { logger } from './src/utils/logger.js';
import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();


app.use(express.json());

app.get('/ping', (req, res) => {
  res.send('Bot is alive');
});


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
    app.listen(3000, () => {
      logger.info('Express server is running on http://localhost:3000');
    });
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

import axios from 'axios';

app.get('/auth/discord/callback', async (req, res) => {
  const code = req.query.code;
  console.log('OAuth2 callback query:', req.query);
  if (!code) return res.status(400).send('Missing authorization code');

  try {
    const params = new URLSearchParams();
    params.append('client_id', process.env.DISCORD_CLIENT_ID);
    params.append('client_secret', process.env.CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', 'http://localhost:3000/auth/discord/callback');
    params.append('scope', 'identify email');

    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, token_type } = tokenRes.data;

    // Fetch user profile info using the access token
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `${token_type} ${access_token}`
      }
    });

    const user = userRes.data;

    res.send(`Welcome, ${user.username}! Your Discord ID is ${user.id}`);
  } catch (err) {
    console.error('OAuth2 error:', err.response?.data || err.message);
    res.status(500).send('Discord OAuth2 failed');
  }
});


startBot();