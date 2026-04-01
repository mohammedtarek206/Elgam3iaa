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
}, { timestamps: true });

module.exports = mongoose.models.JobApplication || mongoose.model('JobApplication', JobApplicationSchema);
