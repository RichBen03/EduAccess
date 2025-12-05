import { validationResult } from 'express-validator';
import Resource from '../models/Resource.js';
import Download from '../models/Download.js';
import School from '../models/School.js';
import storageService from '../services/storageService.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Upload a new resource
 * @route   POST /api/resources
 * @access  Private (Teacher, Admin)
 */
const uploadResource = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'File is required'
    });
  }

  const { title, description, subject, grade, strand, tags, isPublic } = req.body;

  // Parse tags if provided as string
  const tagsArray = typeof tags === 'string' 
    ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    : tags || [];

  // Create resource
  const resource = await Resource.create({
    title,
    description,
    subject,
    grade,
    strand: strand || null,
    tags: tagsArray,
    isPublic: isPublic !== 'false',
    uploader: req.user.id,
    school: req.user.school,
    file: {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      key: req.file.key
    }
  });

  // Update school statistics
  await School.findByIdAndUpdate(req.user.school, {
    $inc: { 'statistics.totalResources': 1 }
  });

  await resource.populate('uploader', 'firstName lastName');
  await resource.populate('school', 'name code');

  res.status(201).json({
    success: true,
    message: 'Resource uploaded successfully and is pending moderation',
    data: { resource }
  });
});

/**
 * @desc    Get all resources with filtering and pagination
 * @route   GET /api/resources
 * @access  Public
 */
const getResources = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  const search = req.query.search;
  const subject = req.query.subject;
  const grade = req.query.grade;
  const school = req.query.school;
  const strand = req.query.strand;
  const tags = req.query.tags;
  const uploader = req.query.uploader;

  // Build query - only show approved resources to non-admins
  const query = { status: 'approved' };
  
  // Admin can see all statuses
  if (req.user?.role === 'admin' && req.query.status) {
    query.status = req.query.status;
  } else if (req.user?.role === 'admin' && !req.query.status) {
    // Admin sees all by default
    delete query.status;
  }

  // Apply filters
  if (search) {
    query.$text = { $search: search };
  }
  if (subject) query.subject = subject;
  if (grade) query.grade = grade;
  if (school) query.school = school;
  if (strand) query.strand = strand;
  if (tags) {
    const tagsArray = typeof tags === 'string' ? tags.split(',') : tags;
    query.tags = { $in: tagsArray };
  }
  if (uploader) query.uploader = uploader;

  const [resources, total, uniqueSubjects, uniqueGrades] = await Promise.all([
    Resource.find(query)
      .populate('uploader', 'firstName lastName')
      .populate('school', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Resource.countDocuments(query),
    Resource.distinct('subject', { status: 'approved' }),
    Resource.distinct('grade', { status: 'approved' })
  ]);

  res.json({
    success: true,
    data: {
      resources,
      filters: {
        subjects: uniqueSubjects,
        grades: uniqueGrades
      },
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
 * @desc    Get resource by ID
 * @route   GET /api/resources/:id
 * @access  Public
 */
const getResourceById = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id)
    .populate('uploader', 'firstName lastName email')
    .populate('school', 'name code address')
    .populate('moderatedBy', 'firstName lastName');

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  // Only show approved resources to non-admins
  if (resource.status !== 'approved' && req.user?.role !== 'admin') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  res.json({
    success: true,
    data: { resource }
  });
});

/**
 * @desc    Download resource file
 * @route   GET /api/resources/:id/download
 * @access  Private
 */
const downloadResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  // Check if resource is approved or user is admin/uploader
  if (resource.status !== 'approved' && 
      req.user.role !== 'admin' && 
      resource.uploader.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  try {
    // Get download URL from storage service
    const downloadUrl = await storageService.getDownloadUrl(resource.file.key, resource.file.originalName);
    
    // Increment download count
    await resource.incrementDownload();

    // Record download in history
    await Download.create({
      user: req.user.id,
      resource: resource._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        downloadUrl,
        resource: {
          id: resource._id,
          title: resource.title,
          file: resource.file
        }
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating download URL'
    });
  }
});

/**
 * @desc    Update resource
 * @route   PUT /api/resources/:id
 * @access  Private (Uploader or Admin)
 */
const updateResource = asyncHandler(async (req, res) => {
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

  // Check permissions (uploader or admin)
  if (resource.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const { title, description, subject, grade, strand, tags, isPublic } = req.body;

  // Update fields
  if (title) resource.title = title;
  if (description) resource.description = description;
  if (subject) resource.subject = subject;
  if (grade) resource.grade = grade;
  if (strand !== undefined) resource.strand = strand;
  if (tags !== undefined) {
    const tagsArray = typeof tags === 'string' 
      ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : tags;
    resource.tags = tagsArray;
  }
  if (isPublic !== undefined) resource.isPublic = isPublic;

  // If admin is updating, reset to pending for re-moderation
  if (req.user.role === 'admin' && resource.status === 'approved') {
    resource.status = 'pending';
    resource.moderatedBy = null;
    resource.moderatedAt = null;
    resource.moderationNotes = null;
  }

  await resource.save();
  await resource.populate('uploader', 'firstName lastName');
  await resource.populate('school', 'name code');

  res.json({
    success: true,
    message: 'Resource updated successfully',
    data: { resource }
  });
});

/**
 * @desc    Delete resource
 * @route   DELETE /api/resources/:id
 * @access  Private (Uploader or Admin)
 */
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  // Check permissions (uploader or admin)
  if (resource.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  try {
    // Delete file from storage
    await storageService.deleteFile(resource.file.key);
    
    // Delete resource from database
    await Resource.findByIdAndDelete(req.params.id);

    // Update school statistics
    await School.findByIdAndUpdate(resource.school, {
      $inc: { 'statistics.totalResources': -1 }
    });

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting resource'
    });
  }
});

/**
 * @desc    Get related resources
 * @route   GET /api/resources/:id/related
 * @access  Public
 */
const getRelatedResources = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    return res.status(404).json({
      success: false,
      message: 'Resource not found'
    });
  }

  const relatedResources = await Resource.find({
    _id: { $ne: resource._id },
    status: 'approved',
    $or: [
      { subject: resource.subject },
      { grade: resource.grade },
      { tags: { $in: resource.tags } },
      { school: resource.school }
    ]
  })
  .populate('uploader', 'firstName lastName')
  .populate('school', 'name code')
  .limit(6)
  .sort({ downloadCount: -1, createdAt: -1 });

  res.json({
    success: true,
    data: { resources: relatedResources }
  });
});

export {
  uploadResource,
  getResources,
  getResourceById,
  downloadResource,
  updateResource,
  deleteResource,
  getRelatedResources
};