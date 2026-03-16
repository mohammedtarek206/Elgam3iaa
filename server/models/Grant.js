const mongoose = require('mongoose');

const grantSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  type: String,
  amount: Number,
  date: String,
  reason: String
}, { timestamps: true });

module.exports = mongoose.model('Grant', grantSchema);
