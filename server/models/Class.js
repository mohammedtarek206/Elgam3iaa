const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sheikh: { type: String, default: "" },
  studentsCount: { type: Number, default: 0 },
  location: String,
  timing: String
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
