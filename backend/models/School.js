import mongoose from 'mongoose';

/**
 * School model representing educational institutions
 * Each school has its own profile and resource collection
 */
const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'School name is required'],
    trim: true,
    maxlength: [100, 'School name cannot exceed 100 characters'],
    unique: true
  },
  code: {
    type: String,
    required: [true, 'School code is required'],
    uppercase: true,
    trim: true,
    unique: true,
    match: [/^[A-Z0-9]{3,10}$/, 'School code must be 3-10 alphanumeric characters']
  },
  address: {
    street: String,
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: String,
    country: {
      type: String,
      default: 'United States'
    }
  },
  contact: {
    phone: String,
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    website: String
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  logo: {
    type: String, // URL to school logo
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'School admin is required']
  },
  statistics: {
    totalResources: {
      type: Number,
      default: 0
    },
    totalDownloads: {
      type: Number,
      default: 0
    },
    activeUsers: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
schoolSchema.index({ 'address.city': 1, 'address.state': 1 });

// Virtual for full address
schoolSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.zipCode
  ].filter(part => part && part.trim());
  
  return parts.join(', ');
});

// Update statistics when resources are added/removed
schoolSchema.methods.updateStatistics = async function() {
  const Resource = mongoose.model('Resource');
  
  const [resourceCount, downloadCount, userCount] = await Promise.all([
    Resource.countDocuments({ school: this._id, status: 'approved' }),
    Resource.aggregate([
      { $match: { school: this._id, status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]),
    mongoose.model('User').countDocuments({ school: this._id, isActive: true })
  ]);

  this.statistics.totalResources = resourceCount;
  this.statistics.totalDownloads = downloadCount[0]?.total || 0;
  this.statistics.activeUsers = userCount;
  
  await this.save();
};

const School = mongoose.model('School', schoolSchema);

export default School;