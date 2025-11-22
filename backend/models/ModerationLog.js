import mongoose from 'mongoose';

/**
 * ModerationLog model for tracking content moderation actions
 * Provides audit trail for all moderation decisions
 */
const moderationActions = ['approved', 'rejected'];

const moderationLogSchema = new mongoose.Schema({
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: moderationActions,
    required: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  previousStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    required: true
  },
  newStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
moderationLogSchema.index({ resource: 1, createdAt: -1 });
moderationLogSchema.index({ moderator: 1 });
moderationLogSchema.index({ createdAt: -1 });

// Pre-save middleware to validate status transition
moderationLogSchema.pre('save', function(next) {
  const validTransitions = {
    'pending': ['approved', 'rejected'],
    'approved': ['rejected'], // Re-approval not needed
    'rejected': ['approved']
  };

  if (!validTransitions[this.previousStatus]?.includes(this.newStatus)) {
    return next(new Error(`Invalid status transition from ${this.previousStatus} to ${this.newStatus}`));
  }
  
  next();
});

// Static method to get moderation history for a resource
moderationLogSchema.statics.getResourceHistory = function(resourceId) {
  return this.find({ resource: resourceId })
    .populate('moderator', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Static method to get moderator activity
moderationLogSchema.statics.getModeratorActivity = function(moderatorId, startDate, endDate) {
  const query = { moderator: moderatorId };
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .populate('resource', 'title uploader')
    .sort({ createdAt: -1 });
};

const ModerationLog = mongoose.model('ModerationLog', moderationLogSchema);

export default ModerationLog;