const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, minlength: 11, maxlength: 11 },
  sheikh: String,
  className: String, // 'class' is a reserved word in some contexts
  level: String,
  currentSurah: String,
  socialStatus: String,
  birthDate: String,
  monthlyFees: Number,
  joinDate: String,
  nationalId: { type: String, unique: true, sparse: true, minlength: 14, maxlength: 14 },
  isNewStudent: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  notes: String,
  attendance: [{ date: String, status: String }]
}, { timestamps: true });

studentSchema.index({ name: 1 });
studentSchema.index({ phone: 1 });
studentSchema.index({ sheikh: 1 });
studentSchema.index({ className: 1 });
studentSchema.index({ nationalId: 1 });

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);
