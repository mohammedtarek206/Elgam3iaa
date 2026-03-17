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

studentSchema.index({ name: 1 });
studentSchema.index({ phone: 1 });
studentSchema.index({ sheikh: 1 });
studentSchema.index({ className: 1 });

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);
