import { validationResult } from 'express-validator';
import School from '../models/School.js';
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get all schools
 * @route   GET /api/schools
 * @access  Public
 */
const getAllSchools = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search;
  const city = req.query.city;
  const state = req.query.state;

  // Build query
  const query = { isActive: true };
  if (search) {
    query.$text = { $search: search };
  }
  if (city) query['address.city'] = { $regex: city, $options: 'i' };
  if (state) query['address.state'] = { $regex: state, $options: 'i' };

  const [schools, total] = await Promise.all([
    School.find(query)
      .populate('admin', 'firstName lastName email')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    School.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      schools,
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
 * @desc    Get school by ID
 * @route   GET /api/schools/:id
 * @access  Public
 */
const getSchoolById = asyncHandler(async (req, res) => {
  const school = await School.findById(req.params.id)
    .populate('admin', 'firstName lastName email');

  if (!school || !school.isActive) {
    return res.status(404).json({
      success: false,
      message: 'School not found'
    });
  }

  res.json({
    success: true,
    data: { school }
  });
});

/**
 * @desc    Create new school (Admin only)
 * @route   POST /api/schools
 * @access  Private (Admin)
 */
const createSchool = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, code, address, contact, description, logo, admin } = req.body;

  // Check if school code already exists
  const existingSchool = await School.findOne({ 
    $or: [{ name }, { code: code.toUpperCase() }] 
  });
  
  if (existingSchool) {
    return res.status(409).json({
      success: false,
      message: 'School with this name or code already exists'
    });
  }

  // Verify admin user exists and is an admin
  const adminUser = await User.findOne({ 
    _id: admin, 
    role: 'admin' 
  });
  
  if (!adminUser) {
    return res.status(404).json({
      success: false,
      message: 'Admin user not found'
    });
  }

  const school = await School.create({
    name,
    code: code.toUpperCase(),
    address,
    contact,
    description,
    logo,
    admin
  });

  await school.populate('admin', 'firstName lastName email');

  res.status(201).json({
    success: true,
    message: 'School created successfully',
    data: { school }
  });
});

/**
 * @desc    Update school (Admin only)
 * @route   PUT /api/schools/:id
 * @access  Private (Admin)
 */
const updateSchool = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const school = await School.findById(req.params.id);
  if (!school) {
    return res.status(404).json({
      success: false,
      message: 'School not found'
    });
  }

  const { name, code, address, contact, description, logo, admin, isActive } = req.body;

  // Check for duplicate name/code
  if (name || code) {
    const duplicateQuery = {
      _id: { $ne: school._id },
      $or: []
    };
    
    if (name) duplicateQuery.$or.push({ name });
    if (code) duplicateQuery.$or.push({ code: code.toUpperCase() });
    
    if (duplicateQuery.$or.length > 0) {
      const existingSchool = await School.findOne(duplicateQuery);
      if (existingSchool) {
        return res.status(409).json({
          success: false,
          message: 'Another school with this name or code already exists'
        });
      }
    }
  }

  // Update fields
  if (name) school.name = name;
  if (code) school.code = code.toUpperCase();
  if (address) school.address = { ...school.address, ...address };
  if (contact) school.contact = { ...school.contact, ...contact };
  if (description !== undefined) school.description = description;
  if (logo !== undefined) school.logo = logo;
  if (admin) {
    // Verify new admin user exists and is an admin
    const adminUser = await User.findOne({ 
      _id: admin, 
      role: 'admin' 
    });
    
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }
    school.admin = admin;
  }
  if (isActive !== undefined) school.isActive = isActive;

  await school.save();
  await school.populate('admin', 'firstName lastName email');

  res.json({
    success: true,
    message: 'School updated successfully',
    data: { school }
  });
});

/**
 * @desc    Get school statistics
 * @route   GET /api/schools/:id/statistics
 * @access  Public
 */
const getSchoolStatistics = asyncHandler(async (req, res) => {
  const schoolId = req.params.id;

  const [school, resourceCount, userCount, recentResources] = await Promise.all([
    School.findById(schoolId),
    Resource.countDocuments({ school: schoolId, status: 'approved' }),
    User.countDocuments({ school: schoolId, isActive: true }),
    Resource.find({ school: schoolId, status: 'approved' })
      .populate('uploader', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  if (!school) {
    return res.status(404).json({
      success: false,
      message: 'School not found'
    });
  }

  // Calculate popular subjects
  const popularSubjects = await Resource.aggregate([
    {
      $match: { 
        school: school._id, 
        status: 'approved' 
      }
    },
    {
      $group: {
        _id: '$subject',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    }
  ]);

  res.json({
    success: true,
    data: {
      statistics: {
        totalResources: resourceCount,
        totalUsers: userCount,
        totalDownloads: school.statistics.totalDownloads,
        popularSubjects
      },
      recentResources
    }
  });
});

/**
 * @desc    Get school resources
 * @route   GET /api/schools/:id/resources
 * @access  Public
 */
const getSchoolResources = asyncHandler(async (req, res) => {
  const schoolId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  const subject = req.query.subject;
  const grade = req.query.grade;

  // Build query
  const query = { 
    school: schoolId, 
    status: 'approved' 
  };
  
  if (subject) query.subject = subject;
  if (grade) query.grade = grade;

  const [resources, total, subjects, grades] = await Promise.all([
    Resource.find(query)
      .populate('uploader', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Resource.countDocuments(query),
    Resource.distinct('subject', { school: schoolId, status: 'approved' }),
    Resource.distinct('grade', { school: schoolId, status: 'approved' })
  ]);

  res.json({
    success: true,
    data: {
      resources,
      filters: {
        subjects,
        grades
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

export {
  getAllSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  getSchoolStatistics,
  getSchoolResources
};