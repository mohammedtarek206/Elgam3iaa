const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Student = require('./models/Student');
const Sheikh = require('./models/Sheikh');
const Class = require('./models/Class');
const Attendance = require('./models/Attendance');
const Transaction = require('./models/Transaction');
const Grant = require('./models/Grant');
const Exam = require('./models/Exam');

const app = express();
app.use(cors());
app.use(express.json());

// Diagnostic: Check environment variables
if (!process.env.MONGODB_URI) {
  console.error('❌ CRITICAL: MONGODB_URI is not defined in environment variables');
}
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET is not defined. Using default "secret_key"');
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Seed default admin
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        password: 'password123',
        role: 'admin'
      });
      await admin.save();
      console.log('🚀 Default admin user created (admin/password123)');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
};

// Connect on startup
connectDB();

// Middleware to ensure DB connection (for Vercel)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.get('/api/test', (req, res) => {
  res.send({ 
    status: 'ok', 
    message: 'Backend is working!',
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Disconnected',
    env: {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET
    }
  });
});

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
app.get('/api/students', auth, async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.send(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/students', auth, async (req, res) => {
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

app.put('/api/students/:id', auth, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(student);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

app.delete('/api/students/:id', auth, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.send({ message: 'Deleted' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// --- Sheikh Routes ---
app.get('/api/sheikhs', auth, async (req, res) => {
  try {
    const sheikhs = await Sheikh.find().sort({ createdAt: -1 });
    res.send(sheikhs);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/sheikhs', auth, async (req, res) => {
  try {
    const sheikh = new Sheikh(req.body);
    await sheikh.save();
    res.send(sheikh);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

app.put('/api/sheikhs/:id', auth, async (req, res) => {
  try {
    const sheikh = await Sheikh.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(sheikh);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

app.delete('/api/sheikhs/:id', auth, async (req, res) => {
  try {
    await Sheikh.findByIdAndDelete(req.params.id);
    res.send({ message: 'Deleted' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// --- Class Routes ---
app.get('/api/classes', auth, async (req, res) => {
  try {
    const classes = await Class.find().sort({ createdAt: -1 });
    res.send(classes);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/classes', auth, async (req, res) => {
  try {
    const cls = new Class(req.body);
    await cls.save();
    res.send(cls);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

app.put('/api/classes/:id', auth, async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(cls);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

app.delete('/api/classes/:id', auth, async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.send({ message: 'Deleted' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// --- Attendance Routes ---
app.get('/api/attendance', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ date: -1 });
    res.send(attendance);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/attendance', auth, async (req, res) => {
  try {
    const record = new Attendance(req.body);
    await record.save();
    res.send(record);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// --- Transaction Routes (Finance) ---
app.get('/api/transactions', auth, async (req, res) => {
  try {
    const txs = await Transaction.find().sort({ date: -1 });
    res.send(txs);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/transactions', auth, async (req, res) => {
  try {
    const tx = new Transaction(req.body);
    await tx.save();
    res.send(tx);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// --- Grant Routes ---
app.get('/api/grants', auth, async (req, res) => {
  try {
    const grants = await Grant.find().sort({ date: -1 });
    res.send(grants);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/grants', auth, async (req, res) => {
  try {
    const grant = new Grant(req.body);
    await grant.save();
    res.send(grant);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// --- Exam Routes ---
app.get('/api/exams', auth, async (req, res) => {
  try {
    const exams = await Exam.find().sort({ date: -1 });
    res.send(exams);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/exams', auth, async (req, res) => {
  try {
    const exam = new Exam(req.body);
    await exam.save();
    res.send(exam);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
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
