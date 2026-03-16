const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: String,
  className: String,
  results: [{
    studentName: String,
    score: Number,
    grade: String,
    reward: String
  }]
}, { timestamps: true });

module.exports = mongoose.models.Exam || mongoose.model('Exam', examSchema);
