import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Event Manager
 * Handles loading and registering Discord events
 */
class EventManager {
  constructor(client) {
    this.client = client;
  }

  /**
   * Load all events from the events directory
   */
  async loadEvents() {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = await fs.readdir(eventsPath);

    for (const file of eventFiles) {
      if (file.endsWith('.js')) {
        const filePath = path.join(eventsPath, file);
        const event = (await import(`file://${filePath}`)).default;

        if (event && event.name && event.execute) {
          if (event.once) {
            this.client.once(event.name, (...args) => event.execute(...args, this.client));
          } else {
            this.client.on(event.name, (...args) => event.execute(...args, this.client));
          }
          console.log(`[EventManager] Loaded event: ${event.name}`);
        }
      }
    }
  }
}

export default EventManager;