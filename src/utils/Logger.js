import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Logger Utility
 * Handles logging to console and files
 */
class Logger {
  static async log(type, message, category = 'system') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] [${category.toUpperCase()}] ${message}`;
    
    console.log(logMessage);

    const logDir = path.join(__dirname, '../../src/logs');
    const logFile = path.join(logDir, `${category}.log`);

    try {
      await fs.mkdir(logDir, { recursive: true });
      await fs.appendFile(logFile, logMessage + '\n');
    } catch (error) {
      console.error('[Logger] Failed to write to log file:', error);
    }
  }

  static info(message, category) { this.log('info', message, category); }
  static warn(message, category) { this.log('warn', message, category); }
  static error(message, category) { this.log('error', message, category); }
  static debug(message, category) { this.log('debug', message, category); }
}

export default Logger;