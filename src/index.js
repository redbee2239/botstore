import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import JsonManager from './database/JsonManager.js';
import { loadEvents, loadCommands, loadComponents } from './utils/handlers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User],
});

// Global Collections
client.slashCommands = new Collection();
client.prefixCommands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();

// Khởi tạo Database với JsonManager
const dataDir = path.join(__dirname, '../../data');
client.db = {
  orders: new JsonManager(path.join(dataDir, 'orders.json')),
  tickets: new JsonManager(path.join(dataDir, 'tickets.json')),
  users: new JsonManager(path.join(dataDir, 'users.json')),
  products: new JsonManager(path.join(dataDir, 'products.json')),
  categories: new JsonManager(path.join(dataDir, 'categories.json')),
  queue: new JsonManager(path.join(dataDir, 'queue.json')),
  staffs: new JsonManager(path.join(dataDir, 'staffs.json')),
  settings: new JsonManager(path.join(dataDir, 'settings.json')),
  reviews: new JsonManager(path.join(dataDir, 'reviews.json')),
  blacklist: new JsonManager(path.join(dataDir, 'blacklist.json')),
  statistics: new JsonManager(path.join(dataDir, 'statistics.json'))
};

const init = async () => {
  try {
    // 1. Tải tất cả dữ liệu lên Cache RAM
    for (const [name, db] of Object.entries(client.db)) {
      await db.load();
    }
    console.log('[System] All JSON data loaded to memory.');

    // 2. Load Handlers
    await loadEvents(client);
    await loadCommands(client);
    await loadComponents(client);

    // 3. Login
    if (!process.env.DISCORD_TOKEN || process.env.DISCORD_TOKEN === 'your_bot_token_here') {
      console.warn('[Warning] Missing DISCORD_TOKEN in .env file!');
    } else {
      await client.login(process.env.DISCORD_TOKEN);
    }
  } catch (error) {
    console.error('[System] Failed to initialize bot:', error);
  }
};

init();