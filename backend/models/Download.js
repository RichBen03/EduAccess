import mongoose from 'mongoose';

/**
 * Download model for tracking user download history
 * Used for analytics and personal download history
 */
const downloadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  downloadedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  offline: {
    type: Boolean,
    default: false
  },
  syncStatus: {
    type: String,
    enum: ['synced', 'pending', 'failed'],
    default: 'synced'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
downloadSchema.index({ user: 1, downloadedAt: -1 });
downloadSchema.index({ resource: 1, downloadedAt: -1 });
downloadSchema.index({ user: 1, resource: 1 }, { unique: true }); // Prevent duplicate tracking

// Static method to get user download history
downloadSchema.statics.getUserDownloads = function(userId, limit = 50) {
  return this.find({ user: userId })
    .populate({
      path: 'resource',
      populate: {
        path: 'uploader school',
        select: 'firstName lastName name'
      }
    })
    .sort({ downloadedAt: -1 })
    .limit(limit);
};

// Static method to get popular resources
downloadSchema.statics.getPopularResources = function(days = 30, limit = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        downloadedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$resource',
        downloadCount: { $sum: 1 }
      }
    },
    {
      $sort: { downloadCount: -1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'resources',
        localField: '_id',
        foreignField: '_id',
        as: 'resource'
      }
    },
    {
      $unwind: '$resource'
    },
    {
      $match: {
        'resource.status': 'approved'
      }
    }
  ]);
};

const Download = mongoose.model('Download', downloadSchema);

export default Download;