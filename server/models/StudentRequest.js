const mongoose = require('mongoose');

const studentRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  parentPhone: String,
  level: String,
  socialStatus: String,
  nationalId: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

module.exports = mongoose.models.StudentRequest || mongoose.model('StudentRequest', studentRequestSchema);
