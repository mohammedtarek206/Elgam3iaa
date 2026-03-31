const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ['فرد', 'جهة', 'فاعل خير'], default: 'فرد' },
  phone: String,
  totalDonated: { type: Number, default: 0 },
  balance: { type: Number, default: 0 }, // For tracking if user wants to see specific donor balance
  notes: String
}, { timestamps: true });

module.exports = mongoose.models.Donor || mongoose.model('Donor', donorSchema);
