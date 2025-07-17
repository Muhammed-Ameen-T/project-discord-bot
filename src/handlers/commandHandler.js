import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { REST, Routes } from 'discord.js';
import { logger } from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadCommands(client) {
  const commandsPath = join(__dirname, '..', 'commands');
  const commandCategories = readdirSync(commandsPath);
  const commands = [];

  for (const category of commandCategories) {
    const categoryPath = join(commandsPath, category);
    const commandFiles = readdirSync(categoryPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = join(categoryPath, file);
      const command = await import(`file://${filePath}`);
      
      if (command.default?.data && command.default?.execute) {
        client.commands.set(command.default.data.name, command.default);
        commands.push(command.default.data.toJSON());
        logger.info(`Loaded command: ${command.default.data.name}`);
      }
    }
  }

  // Register slash commands
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  
  try {
    logger.info('Started refreshing application (/) commands.');
    
    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
      { body: commands }
    );
    
    logger.info('Successfully reloaded application (/) commands.');
  } catch (error) {
    logger.error('Failed to register slash commands:', error);
  }
}