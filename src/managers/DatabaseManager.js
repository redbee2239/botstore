import JsonManager from '../database/JsonManager.js';

/**
 * Database Manager
 * Centralizes all JSON database instances
 */
class DatabaseManager {
  constructor() {
    this.orders = new JsonManager('orders.json');
    this.tickets = new JsonManager('tickets.json');
    this.users = new JsonManager('users.json');
    this.products = new JsonManager('products.json');
    this.categories = new JsonManager('categories.json');
    this.queue = new JsonManager('queue.json');
    this.staffs = new JsonManager('staffs.json');
    this.statistics = new JsonManager('statistics.json');
    this.settings = new JsonManager('settings.json');
    this.reviews = new JsonManager('reviews.json');
    this.blacklist = new JsonManager('blacklist.json');
    this.logs = new JsonManager('logs.json');
  }

  /**
   * Initialize all database instances
   */
  async init() {
    const databases = [
      this.orders,
      this.tickets,
      this.users,
      this.products,
      this.categories,
      this.queue,
      this.staffs,
      this.statistics,
      this.settings,
      this.reviews,
      this.blacklist,
      this.logs
    ];

    await Promise.all(databases.map(db => db.init()));
    console.log('[DatabaseManager] All databases initialized');
  }

  /**
   * Backup all databases
   */
  async backupAll() {
    const databases = [
      this.orders,
      this.tickets,
      this.users,
      this.products,
      this.categories,
      this.queue,
      this.staffs,
      this.statistics,
      this.settings,
      this.reviews,
      this.blacklist,
      this.logs
    ];

    await Promise.all(databases.map(db => db.backup()));
    console.log('[DatabaseManager] All databases backed up');
  }
}

export default new DatabaseManager();