import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

export default class JsonManager {
  /**
   * @param {string} filePath - Absolute or relative path to the JSON file
   */
  constructor(filePath) {
    this.filePath = filePath;
    this.tempPath = `${filePath}.tmp`;
    this.data = null; // Cache in RAM
    this.queue = Promise.resolve(); // Queue for atomic writes

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Tải dữ liệu từ file lên Cache RAM.
   */
  async load() {
    try {
      if (existsSync(this.filePath)) {
        const fileContent = await fs.readFile(this.filePath, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        // Nếu file chưa tồn tại, khởi tạo mặc định là array hoặc object tùy cấu trúc
        // Ở đây mặc định khởi tạo Array để dễ quản lý dạng collection
        this.data = [];
        await this.save();
      }
    } catch (error) {
      console.error(`[JsonManager] Failed to load ${this.filePath}:`, error);
      this.data = [];
    }
    return this.data;
  }

  /**
   * Atomic Write & Queue Write
   * Ghi dữ liệu từ Cache RAM xuống file.
   */
  async save() {
    this.queue = this.queue.then(async () => {
      try {
        const jsonContent = JSON.stringify(this.data, null, 2);
        // Bước 1: Ghi vào file .tmp (Atomic)
        await fs.writeFile(this.tempPath, jsonContent, 'utf-8');
        // Bước 2: Rename đè lên file chính (Đảm bảo an toàn không bị corrupt nếu crash)
        await fs.rename(this.tempPath, this.filePath);
      } catch (error) {
        console.error(`[JsonManager] Failed to save ${this.filePath}:`, error);
      }
    });

    return this.queue;
  }

  /**
   * Helper: Đảm bảo dữ liệu đã được load lên Cache.
   */
  async ensureLoaded() {
    if (this.data === null) {
      await this.load();
    }
  }

  /**
   * Lấy toàn bộ dữ liệu.
   */
  async all() {
    await this.ensureLoaded();
    return this.data;
  }

  /**
   * Tạo mới một bản ghi
   */
  async create(record) {
    await this.ensureLoaded();
    if (!Array.isArray(this.data)) throw new Error("Data is not an array");
    this.data.push(record);
    await this.save();
    return record;
  }

  /**
   * Cập nhật bản ghi dựa trên predicate hoặc ID
   */
  async update(predicate, updatedFields) {
    await this.ensureLoaded();
    const item = await this.findOne(predicate);
    if (!item) return null;
    
    Object.assign(item, updatedFields);
    await this.save();
    return item;
  }

  /**
   * Xóa bản ghi
   */
  async delete(predicate) {
    await this.ensureLoaded();
    const initialLength = this.data.length;
    this.data = this.data.filter(item => {
      if (typeof predicate === 'function') {
        return !predicate(item);
      } else if (typeof predicate === 'object') {
        const key = Object.keys(predicate)[0];
        return item[key] !== predicate[key];
      }
      return true;
    });

    if (this.data.length !== initialLength) {
      await this.save();
      return true;
    }
    return false;
  }

  /**
   * Tìm nhiều bản ghi
   */
  async find(predicate) {
    await this.ensureLoaded();
    if (typeof predicate === 'function') {
      return this.data.filter(predicate);
    } else if (typeof predicate === 'object') {
      return this.data.filter(item => {
        for (const key in predicate) {
          if (item[key] !== predicate[key]) return false;
        }
        return true;
      });
    }
    return this.data;
  }

  /**
   * Tìm 1 bản ghi
   */
  async findOne(predicate) {
    await this.ensureLoaded();
    if (typeof predicate === 'function') {
      return this.data.find(predicate) || null;
    } else if (typeof predicate === 'object') {
      return this.data.find(item => {
        for (const key in predicate) {
          if (item[key] !== predicate[key]) return false;
        }
        return true;
      });
    }
    return null;
  }

  /**
   * Lọc dữ liệu (Tương tự find nhưng chuyên cho custom function)
   */
  async filter(predicate) {
    return this.find(predicate);
  }

  /**
   * Sắp xếp
   */
  async sort(compareFn) {
    await this.ensureLoaded();
    return [...this.data].sort(compareFn);
  }

  /**
   * Đếm số lượng
   */
  async count(predicate = null) {
    if (predicate) {
      const results = await this.find(predicate);
      return results.length;
    }
    await this.ensureLoaded();
    return this.data.length;
  }

  /**
   * Kiểm tra tồn tại
   */
  async exists(predicate) {
    const item = await this.findOne(predicate);
    return item !== null;
  }

  /**
   * Tăng giá trị của một field
   */
  async increment(predicate, field, amount = 1) {
    await this.ensureLoaded();
    const item = await this.findOne(predicate);
    if (item && typeof item[field] === 'number') {
      item[field] += amount;
      await this.save();
      return item;
    }
    return null;
  }

  /**
   * Sinh ID tự động (Ví dụ: prefix000001)
   */
  async generateId(prefix = '', padding = 6) {
    await this.ensureLoaded();
    const currentCount = this.data.length;
    const nextIdNumber = currentCount + 1;
    return `${prefix}${String(nextIdNumber).padStart(padding, '0')}`;
  }

  /**
   * Tạo bản Backup (ZIP hoặc copy file sang thư mục backup)
   */
  async Backup(backupDir) {
    try {
      if (!existsSync(backupDir)) {
        mkdirSync(backupDir, { recursive: true });
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseName = path.basename(this.filePath);
      const backupPath = path.join(backupDir, `${baseName}.${timestamp}.bak`);
      
      // Đảm bảo dữ liệu mới nhất trên RAM được ghi xuống trước khi backup
      await this.save(); 
      await fs.copyFile(this.filePath, backupPath);
      return backupPath;
    } catch (error) {
      console.error(`[JsonManager] Failed to backup ${this.filePath}:`, error);
      return null;
    }
  }

  /**
   * Phục hồi từ bản Backup
   */
  async Restore(backupPath) {
    try {
      if (existsSync(backupPath)) {
        await fs.copyFile(backupPath, this.filePath);
        await this.load(); // Reload to memory
        return true;
      }
      return false;
    } catch (error) {
      console.error(`[JsonManager] Failed to restore ${this.filePath}:`, error);
      return false;
    }
  }
}