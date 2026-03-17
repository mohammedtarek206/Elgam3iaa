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
const StudentRequest = require('./models/StudentRequest');

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

// MongoDB Connection Caching for Serverless
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB Atlas');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).send({ message: "خطأ في الاتصال بقاعدة البيانات" });
  }
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
    
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username }, 
      process.env.JWT_SECRET || 'secret_key', 
      { expiresIn: '1d' }
    );
    res.send({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send({ message: err.message });
  }
});

// Middleware to protect routes
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    // Using decoded data directly to avoid DB trip
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).send({ message: 'يرجى تسجيل الدخول' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).send({ message: 'غير مسموح! هذه الصلاحية للمدير فقط' });
  }
};

// --- Bulk Data Route for Optimization ---
app.get('/api/init-data', auth, async (req, res) => {
  try {
    const [students, sheikhs, classes] = await Promise.all([
      Student.find().sort({ createdAt: -1 }),
      Sheikh.find().sort({ createdAt: -1 }),
      Class.find().sort({ createdAt: -1 })
    ]);
    res.send({ students, sheikhs, classes });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

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

app.delete('/api/students/:id', [auth, isAdmin], async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.send({ message: 'Deleted' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// --- Student Request Routes (New) ---
app.post('/api/public/register', async (req, res) => {
  try {
    const request = new StudentRequest(req.body);
    await request.save();
    res.status(201).send({ message: 'تم استلام طلبك بنجاح، سيتم مراجعته من قبل الإدارة' });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

app.get('/api/admin/student-requests', [auth, isAdmin], async (req, res) => {
  try {
    const requests = await StudentRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.send(requests);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/admin/approve-student/:id', [auth, isAdmin], async (req, res) => {
  try {
    const { className, sheikh } = req.body;
    const request = await StudentRequest.findById(req.params.id);
    if (!request) return res.status(404).send({ message: 'الطلب غير موجود' });

    // Create Student
    const student = new Student({
      name: request.name,
      phone: request.phone,
      sheikh: sheikh,
      className: className,
      level: request.level,
      socialStatus: request.socialStatus,
      nationalId: request.nationalId,
      isNewStudent: true,
      joinDate: new Date().toISOString().split('T')[0]
    });

    await student.save();
    
    // Delete Request after approval
    await StudentRequest.findByIdAndDelete(req.params.id);
    
    res.send({ message: 'تم قبول الطالب وتوجيهه لقسم الطلاب', student });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/admin/reject-student/:id', [auth, isAdmin], async (req, res) => {
  try {
    await StudentRequest.findByIdAndDelete(req.params.id);
    res.send({ message: 'تم رفض الطلب وحذفه' });
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

app.delete('/api/sheikhs/:id', [auth, isAdmin], async (req, res) => {
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

app.delete('/api/classes/:id', [auth, isAdmin], async (req, res) => {
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
    const query = {};
    if (req.query.type) {
      query.attendanceType = req.query.type;
    }
    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.send(attendance);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/attendance', auth, async (req, res) => {
  const { date, attendanceType, records } = req.body;
  try {
    console.log(`📥 Upserting Attendance for ${date} (${attendanceType})`);
    
    // Find existing document for this date and type
    const existing = await Attendance.findOne({ date, attendanceType });
    
    if (existing) {
      // Merge records: update existing ones, add new ones
      const recordMap = new Map(existing.records.map(r => [r.personId, r]));
      records.forEach(newRec => {
        recordMap.set(newRec.personId, newRec);
      });
      existing.records = Array.from(recordMap.values());
      await existing.save();
      res.send(existing);
    } else {
      const record = new Attendance(req.body);
      await record.save();
      res.send(record);
    }
    console.log('✅ Attendance updated successfully');
  } catch (err) {
    console.error('❌ Error saving attendance:', err);
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

app.delete('/api/transactions/:id', [auth, isAdmin], async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.send({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).send({ message: err.message });
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

app.put('/api/exams/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(exam);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// --- Stats Endpoint for Dashboard ---
app.get('/api/stats', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [studentCount, sheikhCount, classCount, transactions, todayAtt] = await Promise.all([
      Student.countDocuments(),
      Sheikh.countDocuments(),
      Class.countDocuments(),
      Transaction.find({ type: 'دخل' }, 'amount'),
      Attendance.findOne({ date: today, attendanceType: 'student' })
    ]);

    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    let attendanceRate = 0;
    if (todayAtt && todayAtt.records.length > 0) {
      const present = todayAtt.records.filter(r => r.status === 'present' || r.status === 'late').length;
      attendanceRate = Math.round((present / todayAtt.records.length) * 100);
    }

    // Get last 5 students for "Recent Activity"
    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5).select('name className');

    res.send({
      totalStudents: studentCount,
      totalSheikhs: sheikhCount,
      totalClasses: classCount,
      totalRevenue,
      attendanceRate,
      recentStudents
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
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
