import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Collection } from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Command Manager
 * Handles loading and executing slash commands
 */
class CommandManager {
  constructor(client) {
    this.client = client;
    this.client.commands = new Collection();
  }

  /**
   * Load all commands from the commands directory
   */
  async loadCommands() {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = await fs.readdir(commandsPath);

    for (const file of commandFiles) {
      if (file.endsWith('.js')) {
        const filePath = path.join(commandsPath, file);
        const command = (await import(`file://${filePath}`)).default;

        if (command && command.data && command.execute) {
          this.client.commands.set(command.data.name, command);
          console.log(`[CommandManager] Loaded command: ${command.data.name}`);
        }
      }
    }
  }

  /**
   * Handle command execution
   */
  async handleInteraction(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = this.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`[CommandManager] Error executing ${interaction.commandName}:`, error);
      await interaction.reply({ content: 'Có lỗi xảy ra khi thực hiện lệnh này!', ephemeral: true });
    }
  }
}

export default CommandManager;