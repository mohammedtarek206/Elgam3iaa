const mongoose = require('mongoose');

const sheikhRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nationalId: { type: String, required: true },
  qualification: String,
  phone: String,
  address: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

module.exports = mongoose.models.SheikhRequest || mongoose.model('SheikhRequest', sheikhRequestSchema);
