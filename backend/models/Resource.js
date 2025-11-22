import mongoose from 'mongoose';

/**
 * Resource model representing educational materials
 * Supports various file types and metadata for advanced filtering
 */
const resourceStatus = ['pending', 'approved', 'rejected'];

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  file: {
    originalName: {
      type: String,
      required: true
    },
    storedName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number, // in bytes
      required: true
    },
    key: {
      type: String, // S3 key or local path
      required: true
    }
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  grade: {
    type: String,
    required: [true, 'Grade level is required'],
    trim: true
  },
  strand: {
    type: String,
    trim: true // For specialized tracks/programs
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: resourceStatus,
    default: 'pending'
  },
  moderationNotes: {
    type: String,
    maxlength: [500, 'Moderation notes cannot exceed 500 characters']
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  metadata: {
    pages: Number, // For PDFs
    duration: Number, // For videos/audio in seconds
    language: {
      type: String,
      default: 'English'
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
resourceSchema.index({ school: 1, status: 1, createdAt: -1 });
resourceSchema.index({ subject: 1, grade: 1 });
resourceSchema.index({ uploader: 1, status: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text',
  subject: 'text'
});

// Virtual for file URL (generated on demand)
resourceSchema.virtual('fileUrl').get(function() {
  return `/api/resources/${this._id}/download`;
});

// Instance method to increment download count
resourceSchema.methods.incrementDownload = async function() {
  this.downloadCount += 1;
  await this.save();
  
  // Update school statistics
  const School = mongoose.model('School');
  await School.findByIdAndUpdate(this.school, {
    $inc: { 'statistics.totalDownloads': 1 }
  });
};

// Static method to find approved resources
resourceSchema.statics.findApproved = function(query = {}) {
  return this.find({ ...query, status: 'approved' });
};

// Static method for search with filters
resourceSchema.statics.search = function(searchTerm, filters = {}) {
  const query = { status: 'approved' };
  
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  // Apply filters
  if (filters.subject) query.subject = filters.subject;
  if (filters.grade) query.grade = filters.grade;
  if (filters.school) query.school = filters.school;
  if (filters.strand) query.strand = filters.strand;
  if (filters.tags) query.tags = { $in: filters.tags };
  if (filters.uploader) query.uploader = filters.uploader;
  
  return this.find(query);
};

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;