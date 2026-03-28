const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: String,
  classNames: [String], // Support for multiple classes
  examModel: String, // Global model (أ، ب، ج، د)
  examiner: String, 
  notes: String,
  results: [{
    studentName: String,
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    className: String, // Tracking which class the student belongs to in this exam
    score: Number,
    grade: String,
    reward: String,
    examModel: String, // Specific model if different from global
    examiner: String,
    notes: String
  }]
}, { timestamps: true });

module.exports = mongoose.models.Exam || mongoose.model('Exam', examSchema);
