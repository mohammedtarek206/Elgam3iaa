const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  nationalId: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    required: true,
    enum: ['عامل نظافة', 'مشرف حلقات', 'إداري'],
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'accepted', 'rejected'],
  },
  // Filled by admin on approval / rejection
  salary: { type: Number, default: 0 },
  joinDate: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  agreedToTerms: { type: Boolean, default: false }
}, { timestamps: true });

JobApplicationSchema.index({ nationalId: 1 });
JobApplicationSchema.index({ status: 1 });

module.exports = mongoose.models.JobApplication || mongoose.model('JobApplication', JobApplicationSchema);
