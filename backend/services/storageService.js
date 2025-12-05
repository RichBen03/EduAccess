import LocalStorageService from './localStorageService.js';
import S3StorageService from './s3StorageService.js';

/**
 * Storage service factory
 * Provides unified interface for different storage drivers (local, S3)
 */
class StorageService {
  constructor() {
    this.driver = process.env.STORAGE_DRIVER || 'local';
    this.service = this.driver === 's3' 
      ? new S3StorageService() 
      : new LocalStorageService();
  }

  /**
   * Get multer storage configuration
   */
  getMulterStorage() {
    return this.service.getMulterStorage();
  }

  /**
   * Get download URL for a file
   * @param {string} key - File identifier
   * @param {string} originalName - Original file name
   * @returns {Promise<string>} Download URL
   */
  async getDownloadUrl(key, originalName) {
    return this.service.getDownloadUrl(key, originalName);
  }

  /**
   * Delete a file
   * @param {string} key - File identifier
   * @returns {Promise<void>}
   */
  async deleteFile(key) {
    return this.service.deleteFile(key);
  }

  /**
   * Get storage driver name
   */
  getDriver() {
    return this.driver;
  }
}

export default new StorageService();