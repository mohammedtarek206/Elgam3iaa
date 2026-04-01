const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  nationalId: {
    type: String,
    required: true,
    unique: true,
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
  salary: {
    type: Number,
    required: true,
    default: 0,
  },
  joinDate: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
