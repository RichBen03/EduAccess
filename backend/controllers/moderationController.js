import { validationResult } from 'express-validator';
import Resource from '../models/Resource.js';
import ModerationLog from '../models/ModerationLog.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get pending resources for moderation
 * @route   GET /api/moderation/pending
 * @access  Private (Admin)
 */
const getPendingResources = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [resources, total] = await Promise.all([
    Resource.find({ status: 'pending' })
      .populate('uploader', 'firstName lastName email')
      .populate('school', 'name code')
      .sort({ createdAt: 1 }) // Oldest first
      .skip(skip)
      .limit(limit),
    Resource.countDocuments({ status: 'pending' })
  ]);

  res.json({
    success: true,
    data: {
      resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * @desc    Approve a resource
 * @route   POST /api/moderation/resources/:id/approve
 * @access  Private (Admin)
 */
const approveResource = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  if (resource.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Resource is not pending moderation'
    });
  }

  const previousStatus = resource.status;
  resource.status = 'approved';
  resource.moderatedBy = req.user.id;
  resource.moderatedAt = new Date();
  resource.moderationNotes = req.body.notes || null;

  await resource.save();

  // Log moderation action
  await ModerationLog.create({
    resource: resource._id,
    moderator: req.user.id,
    action: 'approved',
    notes: req.body.notes,
    previousStatus,
    newStatus: resource.status
  });

  await resource.populate('uploader', 'firstName lastName email');
  await resource.populate('school', 'name code');
  await resource.populate('moderatedBy', 'firstName lastName');

  res.json({
    success: true,
    message: 'Resource approved successfully',
    data: { resource }
  });
});

/**
 * @desc    Reject a resource
 * @route   POST /api/moderation/resources/:id/reject
 * @access  Private (Admin)
 */
const rejectResource = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { notes } = req.body;

  if (!notes || notes.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Rejection notes are required'
    });
  }

  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  if (resource.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Resource is not pending moderation'
    });
  }

  const previousStatus = resource.status;
  resource.status = 'rejected';
  resource.moderatedBy = req.user.id;
  resource.moderatedAt = new Date();
  resource.moderationNotes = notes;

  await resource.save();

  // Log moderation action
  await ModerationLog.create({
    resource: resource._id,
    moderator: req.user.id,
    action: 'rejected',
    notes,
    previousStatus,
    newStatus: resource.status
  });

  await resource.populate('uploader', 'firstName lastName email');
  await resource.populate('school', 'name code');
  await resource.populate('moderatedBy', 'firstName lastName');

  res.json({
    success: true,
    message: 'Resource rejected successfully',
    data: { resource }
  });
});

/**
 * @desc    Get moderation history
 * @route   GET /api/moderation/history
 * @access  Private (Admin)
 */
const getModerationHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const action = req.query.action;
  const moderator = req.query.moderator;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // Build query
  const query = {};
  if (action) query.action = action;
  if (moderator) query.moderator = moderator;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const [history, total] = await Promise.all([
    ModerationLog.find(query)
      .populate('resource', 'title uploader school')
      .populate('moderator', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ModerationLog.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * @desc    Get moderation statistics
 * @route   GET /api/moderation/statistics
 * @access  Private (Admin)
 */
const getModerationStatistics = asyncHandler(async (req, res) => {
  const [totalPending, todayApproved, todayRejected, moderatorStats] = await Promise.all([
    Resource.countDocuments({ status: 'pending' }),
    ModerationLog.countDocuments({
      action: 'approved',
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    }),
    ModerationLog.countDocuments({
      action: 'rejected',
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    }),
    ModerationLog.aggregate([
      {
        $group: {
          _id: '$moderator',
          approved: {
            $sum: { $cond: [{ $eq: ['$action', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$action', 'rejected'] }, 1, 0] }
          },
          total: { $sum: 1 },
          lastActivity: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'moderator'
        }
      },
      {
        $unwind: '$moderator'
      },
      {
        $project: {
          'moderator.password': 0,
          'moderator.__v': 0
        }
      },
      {
        $sort: { total: -1 }
      }
    ])
  ]);

  res.json({
    success: true,
    data: {
      statistics: {
        totalPending,
        today: {
          approved: todayApproved,
          rejected: todayRejected,
          total: todayApproved + todayRejected
        }
      },
      moderatorStats
    }
  });
});

/**
 * @desc    Get resource moderation history
 * @route   GET /api/moderation/resources/:id/history
 * @access  Private (Admin)
 */
const getResourceModerationHistory = asyncHandler(async (req, res) => {
  const history = await ModerationLog.getResourceHistory(req.params.id);

  res.json({
    success: true,
    data: { history }
  });
});

export {
  getPendingResources,
  approveResource,
  rejectResource,
  getModerationHistory,
  getModerationStatistics,
  getResourceModerationHistory
};