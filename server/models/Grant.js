const mongoose = require('mongoose');

const grantSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String, required: true },
  type: String, // 'السداد لغير القادرين', 'دعم مادي', 'منحة حفظ', 'دعم عيني'
  amount: Number,
  unit: String, // For 'دعم عيني'
  donorName: String,
  grantingEntity: String,
  date: String,
  reason: String
}, { timestamps: true });

module.exports = mongoose.models.Grant || mongoose.model('Grant', grantSchema);
