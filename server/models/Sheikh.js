const mongoose = require('mongoose');

const sheikhSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nationalId: { type: String, unique: true, sparse: true },
  phone: String,
  address: String,
  assignedClasses: [String],
  hireDate: String,
  salary: Number,
  notes: String,
  studentsCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Sheikh', sheikhSchema);
