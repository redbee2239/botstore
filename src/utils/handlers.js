import { readdir } from 'fs/promises';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loadEvents = async (client) => {
  const eventsPath = path.join(__dirname, '../events');
  try {
    const eventFiles = await readdir(eventsPath);
    for (const file of eventFiles) {
      if (!file.endsWith('.js')) continue;
      const filePath = pathToFileURL(path.join(eventsPath, file)).href;
      const eventModule = await import(filePath);
      const event = eventModule.default;

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    }
    console.log(`[Handler] Loaded events.`);
  } catch (error) {
    console.error('[Handler] Error loading events:', error);
  }
};

export const loadCommands = async (client) => {
  const commandsPath = path.join(__dirname, '../commands');
  try {
    const commandFolders = await readdir(commandsPath);
    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      try {
        const commandFiles = await readdir(folderPath);
        for (const file of commandFiles) {
          if (!file.endsWith('.js')) continue;
          const filePath = pathToFileURL(path.join(folderPath, file)).href;
          const commandModule = await import(filePath);
          const command = commandModule.default;

          // Hỗ trợ cả Slash Command và Prefix Command
          if (command.data) {
            client.slashCommands.set(command.data.name, command);
          }
          if (command.name) {
            client.prefixCommands.set(command.name, command);
          }
        }
      } catch (err) {
        // Bỏ qua nếu không phải thư mục hợp lệ
        if (err.code !== 'ENOTDIR') throw err;
      }
    }
    console.log(`[Handler] Loaded slash and prefix commands.`);
  } catch (error) {
    console.error('[Handler] Error loading commands:', error);
  }
};

export const loadComponents = async (client) => {
  const componentFolders = ['buttons', 'selectMenus', 'modals'];
  for (const folder of componentFolders) {
    const folderPath = path.join(__dirname, `../${folder}`);
    try {
      const files = await readdir(folderPath);
      for (const file of files) {
        if (!file.endsWith('.js')) continue;
        const filePath = pathToFileURL(path.join(folderPath, file)).href;
        const componentModule = await import(filePath);
        const component = componentModule.default;

        if (folder === 'buttons' && component.customId) client.buttons.set(component.customId, component);
        if (folder === 'selectMenus' && component.customId) client.selectMenus.set(component.customId, component);
        if (folder === 'modals' && component.customId) client.modals.set(component.customId, component);
      }
    } catch (err) {
      // Ignored if folder doesn't exist
    }
  }
  console.log(`[Handler] Loaded components.`);
};
