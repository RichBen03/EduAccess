import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
  subject_name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  subject_code: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Subject = mongoose.model('Subject', SubjectSchema);
export default Subject;