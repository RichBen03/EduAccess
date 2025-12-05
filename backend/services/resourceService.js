import Resource from '../models/Resource.js';

/**
 * Resource service for business logic operations
 */
class ResourceService {
  /**
   * Search resources with advanced filtering
   */
  async searchResources(filters = {}, pagination = {}) {
    const {
      search,
      subject,
      grade,
      school,
      strand,
      tags,
      uploader,
      status = 'approved'
    } = filters;

    const {
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = pagination;

    // Build query
    const query = { status };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (subject) query.subject = subject;
    if (grade) query.grade = grade;
    if (school) query.school = school;
    if (strand) query.strand = strand;
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagsArray };
    }
    if (uploader) query.uploader = uploader;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .populate('uploader', 'firstName lastName')
        .populate('school', 'name code')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Resource.countDocuments(query)
    ]);

    return {
      resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get popular resources
   */
  async getPopularResources(limit = 10, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await Resource.find({
      status: 'approved',
      createdAt: { $gte: startDate }
    })
    .populate('uploader', 'firstName lastName')
    .populate('school', 'name code')
    .sort({ downloadCount: -1 })
    .limit(limit);
  }

  /**
   * Get resources needing moderation
   */
  async getResourcesForModeration(pagination = {}) {
    const {
      page = 1,
      limit = 20
    } = pagination;

    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      Resource.find({ status: 'pending' })
        .populate('uploader', 'firstName lastName email')
        .populate('school', 'name code')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Resource.countDocuments({ status: 'pending' })
    ]);

    return {
      resources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update resource download count and record download
   */
  async recordDownload(resourceId, userId, downloadInfo = {}) {
    const [resource] = await Promise.all([
      Resource.findByIdAndUpdate(
        resourceId,
        { $inc: { downloadCount: 1 } },
        { new: true }
      ),
      this.createDownloadRecord(resourceId, userId, downloadInfo)
    ]);

    return resource;
  }

  /**
   * Create download record
   */
  async createDownloadRecord(resourceId, userId, downloadInfo) {
    const Download = (await import('../models/Download.js')).default;
    
    return await Download.create({
      user: userId,
      resource: resourceId,
      ipAddress: downloadInfo.ipAddress,
      userAgent: downloadInfo.userAgent,
      offline: downloadInfo.offline || false
    });
  }

  /**
   * Get resource statistics
   */
  async getResourceStatistics() {
    const [
      totalResources,
      totalDownloads,
      pendingModeration,
      popularSubjects
    ] = await Promise.all([
      Resource.countDocuments({ status: 'approved' }),
      Resource.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$downloadCount' } } }
      ]),
      Resource.countDocuments({ status: 'pending' }),
      Resource.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$subject', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    return {
      totalResources,
      totalDownloads: totalDownloads[0]?.total || 0,
      pendingModeration,
      popularSubjects
    };
  }
}

export default new ResourceService();