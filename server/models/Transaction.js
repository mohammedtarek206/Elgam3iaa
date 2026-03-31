const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['دخل', 'مصروف'], required: true },
  category: String,
  amount: { type: Number, default: 0 }, // Optional for in-kind
  unit: String, // Description or quantity for in-kind (e.g. "50 شنطة رمضان")
  date: { type: String, required: true },
  notes: String,
  refId: String,
  refName: String
}, { timestamps: true });

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
