const mongoose = require('mongoose');

const grantSchema = new mongoose.Schema({
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  studentNames: String, // Comma separated for quick display
  type: String, // 'السداد لغير القادرين', 'دعم مادي', 'منحة حفظ', 'دعم عيني'
  amount: Number, // Total amount given to the group (monetary)
  quantityPerStudent: { type: Number, default: 0 }, // For In-Kind (e.g. 2 bags per student)
  itemName: String, // For In-Kind (e.g. 'شنط رمضان')
  unit: String, // Full description (e.g. "2 شنطة لكل طالب")
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
  donorName: String,
  grantingEntity: String,
  date: String,
  reason: String
}, { timestamps: true });

module.exports = mongoose.models.Grant || mongoose.model('Grant', grantSchema);
