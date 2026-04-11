const mongoose = require('mongoose');

const sheikhRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nationalId: { type: String, required: true },
  qualification: String,
  phone: String,
  address: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  // Filled by admin on approval
  approvedClasses: { type: [String], default: [] },
  adminNotes: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  agreedToTerms: { type: Boolean, default: false }
}, { timestamps: true });

sheikhRequestSchema.index({ nationalId: 1 });
sheikhRequestSchema.index({ status: 1 });

module.exports = mongoose.models.SheikhRequest || mongoose.model('SheikhRequest', sheikhRequestSchema);
