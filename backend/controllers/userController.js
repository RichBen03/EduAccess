import { validationResult } from 'express-validator';
import User from '../models/User.js';
import School from '../models/School.js';
import Resource from '../models/Resource.js';
import Download from '../models/Download.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get user profile by ID
 * @route   GET /api/users/:id
 * @access  Private (Admin or same user)
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('school', 'name code address');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check permissions (admin or same user)
  if (req.user.role !== 'admin' && req.user.id !== user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: { user }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/:id
 * @access  Private (Admin or same user)
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check permissions (admin or same user)
  if (req.user.role !== 'admin' && req.user.id !== user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const { firstName, lastName, grade, strand, profilePicture } = req.body;

  // Update allowed fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (grade !== undefined) user.grade = grade;
  if (strand !== undefined) user.strand = strand;
  if (profilePicture !== undefined) user.profilePicture = profilePicture;

  // Only admin can change role and school
  if (req.user.role === 'admin') {
    if (req.body.role) user.role = req.body.role;
    if (req.body.school) user.school = req.body.school;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
  }

  await user.save();
  await user.populate('school', 'name code');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

/**
 * @desc    Get user's uploaded resources
 * @route   GET /api/users/:id/resources
 * @access  Private (Admin or same user)
 */
const getUserResources = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Check permissions (admin or same user)
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [resources, total] = await Promise.all([
    Resource.find({ uploader: userId })
      .populate('school', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Resource.countDocuments({ uploader: userId })
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
 * @desc    Get user's download history
 * @route   GET /api/users/:id/downloads
 * @access  Private (Admin or same user)
 */
const getUserDownloads = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Check permissions (admin or same user)
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [downloads, total] = await Promise.all([
    Download.find({ user: userId })
      .populate({
        path: 'resource',
        populate: {
          path: 'uploader school',
          select: 'firstName lastName name'
        }
      })
      .sort({ downloadedAt: -1 })
      .skip(skip)
      .limit(limit),
    Download.countDocuments({ user: userId })
  ]);

  res.json({
    success: true,
    data: {
      downloads,
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
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private (Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const role = req.query.role;
  const school = req.query.school;
  const search = req.query.search;

  // Build query
  const query = {};
  if (role) query.role = role;
  if (school) query.school = school;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .populate('school', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      users,
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
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from deleting themselves
  if (req.user.id === user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

export {
  getUserProfile,
  updateUserProfile,
  getUserResources,
  getUserDownloads,
  getAllUsers,
  deleteUser
};