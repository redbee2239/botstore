import { EmbedBuilder } from 'discord.js';
import config from '../config/config.js';

/**
 * Custom Embed Builder for consistent UI
 */
class CustomEmbed {
  /**
   * Create a base embed with default settings
   * @param {Object} data
   * @returns {EmbedBuilder}
   */
  static create(data = {}) {
    return new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTimestamp()
      .setFooter({ text: 'BotStore System', iconURL: 'https://cdn.discordapp.com/embed/avatars/0.png' })
      .setTitle(data.title || null)
      .setDescription(data.description || null);
  }

  /**
   * Success embed
   */
  static success(description) {
    return this.create({ description })
      .setColor(config.colors.success)
      .setTitle(`${config.emojis.check} Thành công`);
  }

  /**
   * Error embed
   */
  static error(description) {
    return this.create({ description })
      .setColor(config.colors.error)
      .setTitle(`${config.emojis.cross} Lỗi`);
  }

  /**
   * Info embed
   */
  static info(description) {
    return this.create({ description })
      .setColor(config.colors.info)
      .setTitle(`${config.emojis.info} Thông tin`);
  }

  /**
   * Warning embed
   */
  static warning(description) {
    return this.create({ description })
      .setColor(config.colors.warning)
      .setTitle(`${config.emojis.warning} Cảnh báo`);
  }
}

export default CustomEmbed;