const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ Could not connect to MongoDB', err));

// Test route
app.get('/api/test', (req, res) => {
  res.send({ status: 'ok', message: 'Backend is working!' });
});

// Models
const Student = require('./models/Student');
const Sheikh = require('./models/Sheikh');
const Class = require('./models/Class');
const Attendance = require('./models/Attendance');
const Transaction = require('./models/Transaction');
const Grant = require('./models/Grant');
const Exam = require('./models/Exam');

// --- Student Routes ---
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.send(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  console.log('Incoming student data:', req.body);
  try {
    const student = new Student(req.body);
    await student.save();
    console.log('✅ Student saved successfully');
    res.send(student);
  } catch (err) {
    console.error('❌ Error saving student:', err);
    res.status(400).send({ message: err.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(student);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.send({ message: 'Deleted' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// --- Sheikh Routes ---
app.get('/api/sheikhs', async (req, res) => {
  const sheikhs = await Sheikh.find().sort({ createdAt: -1 });
  res.send(sheikhs);
});

app.post('/api/sheikhs', async (req, res) => {
  const sheikh = new Sheikh(req.body);
  await sheikh.save();
  res.send(sheikh);
});

app.put('/api/sheikhs/:id', async (req, res) => {
  const sheikh = await Sheikh.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(sheikh);
});

app.delete('/api/sheikhs/:id', async (req, res) => {
  await Sheikh.findByIdAndDelete(req.params.id);
  res.send({ message: 'Deleted' });
});

// --- Class Routes ---
app.get('/api/classes', async (req, res) => {
  const classes = await Class.find().sort({ createdAt: -1 });
  res.send(classes);
});

app.post('/api/classes', async (req, res) => {
  const cls = new Class(req.body);
  await cls.save();
  res.send(cls);
});

app.put('/api/classes/:id', async (req, res) => {
  const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(cls);
});

app.delete('/api/classes/:id', async (req, res) => {
  await Class.findByIdAndDelete(req.params.id);
  res.send({ message: 'Deleted' });
});

// --- Attendance Routes ---
app.get('/api/attendance', async (req, res) => {
  const attendance = await Attendance.find().sort({ date: -1 });
  res.send(attendance);
});

app.post('/api/attendance', async (req, res) => {
  const record = new Attendance(req.body);
  await record.save();
  res.send(record);
});

// --- Transaction Routes (Finance) ---
app.get('/api/transactions', async (req, res) => {
  const txs = await Transaction.find().sort({ date: -1 });
  res.send(txs);
});

app.post('/api/transactions', async (req, res) => {
  const tx = new Transaction(req.body);
  await tx.save();
  res.send(tx);
});

// --- Grant Routes ---
app.get('/api/grants', async (req, res) => {
  const grants = await Grant.find().sort({ date: -1 });
  res.send(grants);
});

app.post('/api/grants', async (req, res) => {
  const grant = new Grant(req.body);
  await grant.save();
  res.send(grant);
});

// --- Exam Routes ---
app.get('/api/exams', async (req, res) => {
  const exams = await Exam.find().sort({ date: -1 });
  res.send(exams);
});

app.post('/api/exams', async (req, res) => {
  const exam = new Exam(req.body);
  await exam.save();
  res.send(exam);
});

const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
  res.send('Server is running! MongoDB Atlas: ' + (mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Disconnected'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://127.0.0.1:${PORT}`);
  console.log(`📡 Local check: http://localhost:${PORT}/api/test`);
});

module.exports = app;
