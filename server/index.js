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
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    // Create default admin if not exists
    const User = require('./models/User');
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        password: 'password123'
      });
      await admin.save();
      console.log('🚀 Default admin user created (admin/password123)');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  })
  .catch(err => console.error('❌ Could not connect to MongoDB', err));

app.get('/api/test', (req, res) => {
  res.send({ 
    status: 'ok', 
    message: 'Backend is working!',
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

const User = require('./models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log(`User not found: ${username}`);
      return res.status(401).send({ message: 'بيانات الدخول غير صحيحة' });
    }
    
    const isMatch = await user.comparePassword(password);
    console.log(`Password match for ${username}: ${isMatch}`);
    
    if (!isMatch) {
      return res.status(401).send({ message: 'بيانات الدخول غير صحيحة' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });
    res.send({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send({ message: err.message });
  }
});

// Middleware to protect routes
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    const user = await User.findById(decoded.id);
    if (!user) throw new Error();
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ message: 'يرجى تسجيل الدخول' });
  }
};

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
