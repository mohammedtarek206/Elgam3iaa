const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: String,
  className: String,
  examiner: String, // Default examiner for the whole exam
  notes: String,
  results: [{
    studentName: String,
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    score: Number,
    grade: String,
    reward: String,
    examModel: String, // أ، ب، ج، د
    examiner: String,  // Specific examiner for this student
    notes: String
  }]
}, { timestamps: true });

module.exports = mongoose.models.Exam || mongoose.model('Exam', examSchema);
