const mongoose = require('mongoose');

const grantSchema = new mongoose.Schema({
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  studentNames: String, // Comma separated for quick display
  type: String, // 'السداد لغير القادرين', 'دعم مادي', 'منحة حفظ', 'دعم عيني'
  amount: Number, // Total amount given to the group
  unit: String, // For 'دعم عيني'
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
  donorName: String,
  grantingEntity: String,
  date: String,
  reason: String
}, { timestamps: true });

module.exports = mongoose.models.Grant || mongoose.model('Grant', grantSchema);
