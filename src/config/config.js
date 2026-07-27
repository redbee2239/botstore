import dotenv from 'dotenv';
dotenv.config();

/**
 * Application Configuration
 */
export default {
  // Discord Configuration
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
  },

  // Bot Settings
  bot: {
    prefix: process.env.PREFIX || '!',
    ownerIds: process.env.OWNER_IDS?.split(',') || [],
    developerIds: process.env.DEVELOPER_IDS?.split(',') || [],
  },

  // Channel IDs
  channels: {
    log: process.env.LOG_CHANNEL_ID,
    order: process.env.ORDER_CHANNEL_ID,
    ticketLog: process.env.TICKET_LOG_CHANNEL_ID,
    review: process.env.REVIEW_CHANNEL_ID,
    staffLog: process.env.STAFF_LOG_CHANNEL_ID,
  },

  // Category IDs
  categories: {
    ticket: process.env.TICKET_CATEGORY_ID,
    closedTicket: process.env.CLOSED_TICKET_CATEGORY_ID,
  },

  // Role IDs
  roles: {
    owner: process.env.OWNER_ROLE_ID,
    manager: process.env.MANAGER_ROLE_ID,
    admin: process.env.ADMIN_ROLE_ID,
    staff: process.env.STAFF_ROLE_ID,
    support: process.env.SUPPORT_ROLE_ID,
    helper: process.env.HELPER_ROLE_ID,
    customer: process.env.CUSTOMER_ROLE_ID,
  },

  // Bot Behavior
  behavior: {
    autoBackupInterval: parseInt(process.env.AUTO_BACKUP_INTERVAL) || 3600000,
    autoSaveInterval: parseInt(process.env.AUTO_SAVE_INTERVAL) || 60000,
    maxTicketsPerUser: parseInt(process.env.MAX_TICKETS_PER_USER) || 3,
    ticketInactivityTime: parseInt(process.env.TICKET_INACTIVITY_TIME) || 86400000,
    cooldownTime: parseInt(process.env.COOLDOWN_TIME) || 5000,
  },

  // System
  system: {
    nodeEnv: process.env.NODE_ENV || 'production',
    timezone: process.env.TZ || 'Asia/Saigon',
  },

  // Colors for embeds
  colors: {
    primary: 0x5865F2,
    success: 0x57F287,
    warning: 0xFEE75C,
    error: 0xED4245,
    info: 0x5865F2,
    secondary: 0x99AAB5,
  },

  // Order Status
  orderStatus: {
    WAITING: 'Waiting',
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    PAUSED: 'Paused',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
    FAILED: 'Failed',
  },

  // Emojis
  emojis: {
    cart: '🛒',
    ticket: '🎫',
    support: '❓',
    contact: '💬',
    track: '📦',
    settings: '⚙️',
    star: '⭐',
    check: '✅',
    cross: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    loading: '⏳',
    pin: '📌',
    package: '📦',
    money: '💰',
    clock: '🕐',
    user: '👤',
    staff: '👔',
    admin: '👑',
    orders: '📋',
    review: '⭐',
    pause: '⏸️',
    play: '▶️',
    stop: '⏹️',
  },
};