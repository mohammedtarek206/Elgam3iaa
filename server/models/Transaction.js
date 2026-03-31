const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['دخل', 'مصروف'], required: true },
  category: String,
  amount: { type: Number, default: 0 }, // Monetary
  quantity: { type: Number, default: 0 }, // For In-Kind (e.g. 500)
  itemName: String, // Item name for In-Kind (e.g. 'شنط رمضان')
  unit: String, // Full description (e.g. "500 شنطة رمضان")
  date: { type: String, required: true },
  notes: String,
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
  refId: String,
  refName: String
}, { timestamps: true });

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
