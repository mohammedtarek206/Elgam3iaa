const mongoose = require('mongoose');

const studentRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, minlength: 12, maxlength: 12 },
  parentPhone: { type: String, minlength: 12, maxlength: 12 },
  level: String,
  socialStatus: String,
  nationalId: { type: String, minlength: 14, maxlength: 14 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

module.exports = mongoose.models.StudentRequest || mongoose.model('StudentRequest', studentRequestSchema);
