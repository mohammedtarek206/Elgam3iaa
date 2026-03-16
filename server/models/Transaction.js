const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['دخل', 'مصروف'], required: true },
  category: String,
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  notes: String,
  refId: String,
  refName: String
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
