const mongoose = require('mongoose');

const studentRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, minlength: 11, maxlength: 11 },
  parentPhone: { type: String, minlength: 11, maxlength: 11 },
  level: String,
  socialStatus: String,
  nationalId: { type: String, minlength: 14, maxlength: 14 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  // Filled by admin on approval
  approvedClassName: { type: String, default: '' },
  approvedSheikh: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  agreedToTerms: { type: Boolean, required: true }
}, { timestamps: true });

studentRequestSchema.index({ nationalId: 1 });
studentRequestSchema.index({ status: 1 });

module.exports = mongoose.models.StudentRequest || mongoose.model('StudentRequest', studentRequestSchema);
