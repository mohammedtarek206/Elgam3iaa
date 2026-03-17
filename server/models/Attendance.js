const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: { type: String, required: true },
  attendanceType: { type: String, enum: ['student', 'sheikh'], required: true },
  records: [{
    personId: String,
    name: String,
    status: { type: String, enum: ['present', 'absent', 'late'] }
  }]
}, { timestamps: true });

attendanceSchema.index({ date: 1, attendanceType: 1 });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
