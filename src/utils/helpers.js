/**
 * Helper Utilities
 */

/**
 * Generate Order ID with auto-increment format
 * @param {number} count - Current order count
 * @returns {string} Order ID (e.g., OD000001)
 */
export function generateOrderId(count) {
  return `OD${String(count + 1).padStart(6, '0')}`;
}

/**
 * Format currency
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * Format date
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Saigon'
  }).format(new Date(date));
}

/**
 * Format relative time
 * @param {Date|string} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return `${seconds} giây trước`;
}

/**
 * Format duration
 * @param {number} ms - Milliseconds
 * @returns {string}
 */
export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Create progress bar
 * @param {number} current
 * @param {number} total
 * @param {number} length - Bar length
 * @returns {string}
 */
export function createProgressBar(current, total, length = 10) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  const filledLength = Math.floor((percentage / 100) * length);
  const emptyLength = length - filledLength;
  
  const filled = '█'.repeat(filledLength);
  const empty = '░'.repeat(emptyLength);
  
  return `${filled}${empty} ${percentage.toFixed(0)}%`;
}

/**
 * Truncate text
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Sleep utility
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Chunk array
 * @param {Array} array
 * @param {number} size
 * @returns {Array<Array>}
 */
export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Sanitize text input
 * @param {string} text
 * @returns {string}
 */
export function sanitizeInput(text) {
  return text.replace(/[<>]/g, '').trim().substring(0, 1000);
}