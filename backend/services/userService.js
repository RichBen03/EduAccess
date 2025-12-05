import User from '../models/User.js';

/**
 * User service for business logic operations
 */
class UserService {
  /**
   * Create a new user with validation
   */
  async createUser(userData) {
    // Additional business logic can be added here
    return await User.create(userData);
  }

  /**
   * Update user profile with validation
   */
  async updateUser(userId, updateData) {
    const allowedFields = ['firstName', 'lastName', 'grade', 'strand', 'profilePicture'];
    const updateFields = {};
    
    // Filter only allowed fields
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields[key] = updateData[key];
      }
    });

    return await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId) {
    const [uploadCount, downloadCount, recentUploads] = await Promise.all([
      this.getUserUploadCount(userId),
      this.getUserDownloadCount(userId),
      this.getRecentUserUploads(userId)
    ]);

    return {
      uploadCount,
      downloadCount,
      recentUploads
    };
  }

  /**
   * Get user's upload count
   */
  async getUserUploadCount(userId) {
    const Resource = (await import('../models/Resource.js')).default;
    return await Resource.countDocuments({ uploader: userId });
  }

  /**
   * Get user's download count
   */
  async getUserDownloadCount(userId) {
    const Download = (await import('../models/Download.js')).default;
    return await Download.countDocuments({ user: userId });
  }

  /**
   * Get user's recent uploads
   */
  async getRecentUserUploads(userId, limit = 5) {
    const Resource = (await import('../models/Resource.js')).default;
    return await Resource.find({ uploader: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('school', 'name code');
  }
}

export default new UserService();