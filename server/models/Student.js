const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  sheikh: String,
  className: String, // 'class' is a reserved word in some contexts
  level: String,
  currentSurah: String,
  socialStatus: String,
  birthDate: String,
  monthlyFees: Number,
  joinDate: String,
  notes: String,
  attendance: [{ date: String, status: String }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
