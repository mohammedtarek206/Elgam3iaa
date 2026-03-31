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
const SheikhRequest = require('./models/SheikhRequest');
const Donor = require('./models/Donor');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
    const { nationalId } = req.body;
    if (nationalId) {
      if (nationalId.length !== 14) {
        return res.status(400).send({ message: 'الرقم القومي يجب أن يكون 14 رقم' });
      }
      const existing = await Student.findOne({ nationalId });
      const existingReq = await StudentRequest.findOne({ nationalId });
      if (existing || existingReq) {
        return res.status(400).send({ message: 'هذا الرقم القومي مسجل من قبل' });
      }
    }
    if (req.body.phone && req.body.phone.length !== 11) {
      return res.status(400).send({ message: 'رقم الهاتف يجب أن يكون 11 رقم' });
    }
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

app.post('/api/admin/bulk-import-students', [auth, isAdmin], async (req, res) => {
  try {
    const students = req.body;
    if (!Array.isArray(students)) {
      return res.status(400).send({ message: 'Expected an array of students' });
    }

    const today = new Date().toISOString().split('T')[0];
    const studentsToInsert = students.map(s => ({
      ...s,
      joinDate: s.joinDate || today,
      isActive: true,
      monthlyFees: s.monthlyFees || 0,
      isNewStudent: false
    }));

    await Student.insertMany(studentsToInsert);
    res.send({ message: `تم استيراد ${studentsToInsert.length} طالب بنجاح` });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// --- Student Request Routes (New) ---
app.post('/api/public/register', async (req, res) => {
  try {
    const { nationalId, phone } = req.body;
    if (nationalId) {
      if (nationalId.length !== 14) {
        return res.status(400).send({ message: 'الرقم القومي يجب أن يكون 14 رقم' });
      }
      const existing = await Student.findOne({ nationalId });
      const existingReq = await StudentRequest.findOne({ nationalId });
      if (existing || existingReq) {
        return res.status(400).send({ message: 'هذا الرقم القومي مسجل من قبل' });
      }
    }
    if (phone && phone.length !== 11) {
      return res.status(400).send({ message: 'رقم الهاتف يجب أن يكون 11 رقم' });
    }
    const request = new StudentRequest(req.body);
    await request.save();
    res.status(201).send({ message: 'تم استلام طلبك بنجاح، سيتم مراجعته من قبل الإدارة' });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// --- Public Guardian Follow-up Route ---
app.get('/api/public/student-followup/:nationalId', async (req, res) => {
  try {
    const { nationalId } = req.params;

    // 1. Find the student
    const student = await Student.findOne({ nationalId });
    if (!student) {
      return res.status(404).send({ message: 'عذراً، لا يوجد طالب مسجل بهذا الرقم القومي.' });
    }

    if (student.isActive === false) {
      return res.status(403).send({ message: 'هذا الطالب مستبعد يرجى التواصل واتساب على الرقم 01111347255' });
    }

    // 2. Fetch Attendance (only extracting this student's status)
    const attendances = await Attendance.find({
      'records.personId': student._id.toString()
    }).sort({ date: -1 }).limit(30); // Last 30 records

    const studentAttendance = attendances.map(att => {
      const record = att.records.find(r => r.personId === student._id.toString());
      return {
        date: att.date,
        status: record ? record.status : 'absent'
      };
    });

    // 3. Fetch Transactions (matching student._id as refId)
    const transactions = await Transaction.find({
      refId: student._id.toString()
    }).sort({ date: -1 });

    // 4. Fetch Exams (matching student._id in results array)
    const allExams = await Exam.find({
      'results.studentId': student._id
    }).sort({ date: -1 });

    const studentExams = allExams.map(exam => {
      const result = exam.results.find(r => r.studentId && r.studentId.toString() === student._id.toString());
      return {
        examName: exam.name,
        date: exam.date,
        score: result ? result.score : 0,
        grade: result ? result.grade : '',
        reward: result ? result.reward : '',
        notes: result ? result.notes : ''
      };
    });

    res.send({
      student: {
        name: student.name,
        className: student.className,
        level: student.level,
        currentSurah: student.currentSurah,
        sheikh: student.sheikh,
        joinDate: student.joinDate
      },
      attendance: studentAttendance,
      transactions: transactions.map(t => ({ date: t.date, amount: t.amount, category: t.category, notes: t.notes })),
      exams: studentExams
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
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
      parentPhone: request.parentPhone,
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

// --- Sheikh Request Routes (New) ---
app.post('/api/public/register-sheikh', async (req, res) => {
  try {
    const request = new SheikhRequest(req.body);
    await request.save();
    res.status(201).send({ message: 'تم استلام طلبك بنجاح، سيتم مراجعته من قبل الإدارة' });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

app.get('/api/admin/sheikh-requests', [auth, isAdmin], async (req, res) => {
  try {
    const requests = await SheikhRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.send(requests);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/admin/approve-sheikh/:id', [auth, isAdmin], async (req, res) => {
  try {
    const { className } = req.body;
    const request = await SheikhRequest.findById(req.params.id);
    if (!request) return res.status(404).send({ message: 'الطلب غير موجود' });

    // Create Sheikh
    const sheikh = new Sheikh({
      name: request.name,
      nationalId: request.nationalId,
      qualification: request.qualification,
      phone: request.phone,
      address: request.address,
      assignedClasses: [className], // Assigning to the list of classes
      hireDate: new Date().toISOString().split('T')[0],
      salary: 0, // default
      isNewRegistration: true
    });

    await sheikh.save();

    // Delete Request after approval
    await SheikhRequest.findByIdAndDelete(req.params.id);

    res.send({ message: 'تم قبول المحفظ وتعيينه للفصل بنجاح', sheikh });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/admin/reject-sheikh/:id', [auth, isAdmin], async (req, res) => {
  try {
    await SheikhRequest.findByIdAndDelete(req.params.id);
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
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).send({ message: 'Transaction not found' });

    // REVERSION LOGIC: If transaction had a donor, revert their balance/stock
    if (tx.donorId) {
      const donor = await Donor.findById(tx.donorId);
      if (donor) {
        // If it was income (donation), subtract from balance/stock
        if (tx.type === 'دخل') {
          if (tx.amount > 0) {
            donor.balance -= tx.amount;
            donor.totalDonated -= tx.amount;
          }
          if (tx.itemName && tx.quantity > 0) {
            const current = donor.inKindStock.get(tx.itemName) || 0;
            donor.inKindStock.set(tx.itemName, Math.max(0, current - tx.quantity));
          }
        } 
        // If it was expense (grant reversal), add back to balance/stock
        else {
          if (tx.amount > 0) {
            donor.balance += tx.amount;
          }
          if (tx.itemName && tx.quantity > 0) {
            const current = donor.inKindStock.get(tx.itemName) || 0;
            donor.inKindStock.set(tx.itemName, current + tx.quantity);
          }
        }
        await donor.save();
      }
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.send({ message: 'تم حذف المعاملة وتحديث رصيد المتبرع' });
  } catch (err) {
    console.error('Deletion error:', err);
    res.status(500).send({ message: err.message });
  }
});

// --- Grant Routes ---
app.get('/api/grants', auth, async (req, res) => {
  try {
    const grants = await Grant.find()
      .sort({ createdAt: -1 })
      .populate('studentIds', 'name className')
      .populate('donorId', 'name type');
    res.send(grants);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/grants', auth, async (req, res) => {
  try {
    const grant = new Grant(req.body);
    await grant.save();

    // 1. If it's a monetary grant, record an expense transaction and decrement financial balance
    if (grant.type !== 'دعم عيني' && grant.amount > 0) {
      const transaction = new Transaction({
        type: 'مصروف',
        category: 'منح وعطاءات',
        amount: grant.amount,
        donorId: grant.donorId,
        date: grant.date,
        notes: `منحة لـ: ${grant.studentNames || 'مجموعة طلاب'} | المتبرع: ${grant.donorName || '---'}`,
        refId: grant._id,
        refName: grant.studentNames
      });
      await transaction.save();

      if (grant.donorId) {
        // Double check: subtract amount from specific donor balance
        await Donor.findByIdAndUpdate(grant.donorId, { $inc: { balance: -grant.amount } });
      }
    }

    // 2. If it's an In-Kind grant, decrement the donor's specific item stock
    if (grant.type === 'دعم عيني' && grant.itemName && grant.quantityPerStudent > 0) {
      const totalQuantity = grant.quantityPerStudent * (grant.studentIds?.length || 1);
      
      const transaction = new Transaction({
        type: 'مصروف',
        category: 'منح وعطاءات',
        amount: 0,
        quantity: totalQuantity,
        itemName: grant.itemName,
        unit: `${grant.quantityPerStudent} لكل طالب (الإجمالي: ${totalQuantity})`,
        donorId: grant.donorId,
        date: grant.date,
        notes: `توزيع دعم عيني: ${grant.itemName} | المتبرع: ${grant.donorName || '---'}`,
        refId: grant._id,
        refName: grant.studentNames
      });
      await transaction.save();

      if (grant.donorId) {
        // Update the Map in Donor: decrease quantity for this specific item
        const donor = await Donor.findById(grant.donorId);
        if (donor) {
          const currentStock = donor.inKindStock.get(grant.itemName) || 0;
          donor.inKindStock.set(grant.itemName, currentStock - totalQuantity);
          await donor.save();
        }
      }
    }

    res.send(grant);
  } catch (err) {
    console.error('Error creating grant:', err);
    res.status(400).send({ message: err.message });
  }
});

app.delete('/api/grants/:id', [auth, isAdmin], async (req, res) => {
  try {
    const grant = await Grant.findById(req.params.id);
    if (!grant) return res.status(404).send({ message: 'Grant not found' });

    // 1. Revert Donor Balance/Stock
    if (grant.donorId) {
      if (grant.type === 'دعم عيني' && grant.itemName) {
        const totalQty = grant.quantityPerStudent * (grant.studentIds?.length || 1);
        const donor = await Donor.findById(grant.donorId);
        if (donor) {
          const current = donor.inKindStock.get(grant.itemName) || 0;
          donor.inKindStock.set(grant.itemName, current + totalQty);
          await donor.save();
        }
      } else if (grant.amount > 0) {
        await Donor.findByIdAndUpdate(grant.donorId, { $inc: { balance: grant.amount } });
      }
    }

    // 2. Delete linked transactions
    await Transaction.deleteMany({ refId: grant._id });
    
    // 3. Delete the grant
    await Grant.findByIdAndDelete(req.params.id);
    
    res.send({ message: 'تم حذف المنحة وتعديل الرصيد بنجاح' });
  } catch (err) {
    console.error('Error deleting grant:', err);
    res.status(500).send({ message: err.message });
  }
});

// --- Donor & Donation Routes ---
app.get('/api/donors', auth, async (req, res) => {
  try {
    const donors = await Donor.find().sort({ name: 1 });
    // Fetch in-kind history and formatted stock for each donor using explicitly linked donorId
    const donorsProcessed = await Promise.all(donors.map(async (d) => {
      const inKindTxs = await Transaction.find({
        donorId: d._id,
        itemName: { $exists: true, $ne: '' }
      }).sort({ date: -1 });
      
      const donorObj = d.toObject();
      const stockObj = {};
      const totalsObj = {}; // To store total received/distributed per item
      
      if (d.inKindStock) {
        for (let [key, value] of d.inKindStock) {
          stockObj[key] = value;
          totalsObj[key] = { received: 0, distributed: 0 };
        }
      }

      // Calculate totals from history
      inKindTxs.forEach(tx => {
        if (!totalsObj[tx.itemName]) totalsObj[tx.itemName] = { received: 0, distributed: 0 };
        if (tx.type === 'دخل') totalsObj[tx.itemName].received += (tx.quantity || 0);
        else totalsObj[tx.itemName].distributed += (tx.quantity || 0);
      });

      return {
        ...donorObj,
        inKindStock: stockObj,
        inKindTotals: totalsObj,
        inKindHistory: inKindTxs.map(h => ({ 
          unit: h.unit, 
          itemName: h.itemName, 
          quantity: h.quantity, 
          date: h.date, 
          type: h.type,
          notes: h.notes 
        }))
      };
    }));
    res.send(donorsProcessed);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/donors', auth, async (req, res) => {
  const { name, type, phone, notes, initialAmount, initialUnit } = req.body;
  try {
    const donor = new Donor({ name, type, phone, notes });
    
    if (Number(initialAmount) > 0 || initialUnit) {
      donor.totalDonated = Number(initialAmount) || 0;
      donor.balance = Number(initialAmount) || 0;
      await donor.save();

      const transaction = new Transaction({
        type: 'دخل',
        category: 'تبرعات',
        amount: Number(initialAmount) || 0,
        unit: initialUnit || '',
        date: new Date().toISOString().split('T')[0],
        notes: `تبرع افتتاحي عند التسجيل: ${donor.name}`,
        donorId: donor._id,
        refId: donor._id,
        refName: donor.name
      });
      await transaction.save();
    } else {
      await donor.save();
    }
    res.send(donor);
  } catch (err) {
    console.error('Error creating donor:', err);
    res.status(400).send({ message: err.message });
  }
});

app.put('/api/donors/:id', [auth, isAdmin], async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(donor);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

app.delete('/api/donors/:id', [auth, isAdmin], async (req, res) => {
  try {
    // Check if donor has active grants or non-zero balance
    const donor = await Donor.findById(req.params.id);
    if (donor && donor.balance > 0) {
      return res.status(400).send({ message: 'لا يمكن حذف متبرع لديه رصيد متبقي. يرجى تصفية الرصيد أولاً.' });
    }
    await Donor.findByIdAndDelete(req.params.id);
    // Note: We keep transactions for financial history
    res.send({ message: 'تم حذف المتبرع بنجاح' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post('/api/donations', auth, async (req, res) => {
  const { donorId, amount, unit, itemName, quantity, date, notes } = req.body;
  try {
    const donor = await Donor.findById(donorId);
    if (!donor) return res.status(404).send({ message: 'المتبرع غير موجود' });

    // 1. Create Income Transaction
    const transaction = new Transaction({
      type: 'دخل',
      category: 'تبرعات',
      amount: Number(amount) || 0,
      quantity: Number(quantity) || 0,
      itemName: itemName || '',
      unit: unit || (itemName ? `${quantity} ${itemName}` : ''),
      date,
      notes,
      donorId: donor._id,
      refId: donor._id,
      refName: donor.name
    });
    await transaction.save();

    // 2. Update Donor stats (monetary)
    if (Number(amount) > 0) {
      donor.totalDonated += Number(amount);
      donor.balance += Number(amount);
    }

    // 3. Update Donor stock (In-Kind)
    if (itemName && Number(quantity) > 0) {
      const currentStock = donor.inKindStock.get(itemName) || 0;
      donor.inKindStock.set(itemName, currentStock + Number(quantity));
    }

    await donor.save();
    res.send(transaction);
  } catch (err) {
    console.error('Error recording donation:', err);
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

app.delete('/api/exams/:id', [auth, isAdmin], async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.send({ message: 'تم حذف الاختبار بنجاح' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// --- Stats Endpoint for Dashboard ---
app.get('/api/stats', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const targetMonth = req.query.month || today.slice(0, 7);

    const [studentCount, sheikhCount, classCount, transactions, todayAtt] = await Promise.all([
      Student.countDocuments(),
      Sheikh.countDocuments(),
      Class.countDocuments(),
      Transaction.find({ type: 'دخل' }),
      Attendance.findOne({ date: today, attendanceType: 'student' })
    ]);

    // 1. Total monetary revenue
    const totalRevenue = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // 2. Grant Fund Balance (Monetary)
    const donationTxs = await Transaction.find({ category: 'تبرعات', type: 'دخل' });
    const grantTxs = await Transaction.find({ category: 'منح وعطاءات', type: 'مصروف' });

    const totalDonations = donationTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalGrantsPaid = grantTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const grantFundBalance = totalDonations - totalGrantsPaid;

    // 3. In-kind Stats
    const inKindCount = await Transaction.countDocuments({ 
      category: 'تبرعات', 
      unit: { $exists: true, $ne: '' } 
    });
    const recentInKind = await Transaction.find({ 
      category: 'تبرعات', 
      unit: { $exists: true, $ne: '' } 
    }).sort({ date: -1 }).limit(10);

    // 4. Attendance Rate
    let attendanceRate = 0;
    if (todayAtt && todayAtt.records.length > 0) {
      const present = todayAtt.records.filter(r => r.status === 'present' || r.status === 'late').length;
      attendanceRate = Math.round((present / todayAtt.records.length) * 100);
    }

    // 5. Recent student additions
    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5).select('name className');

    // 6. Paid vs Unpaid for targetMonth
    const paidTxs = await Transaction.find({
      type: 'دخل',
      category: 'رسوم طلاب',
      date: { $regex: `^${targetMonth}` }
    }, 'refId amount');

    const paidStudentIds = new Set(paidTxs.map(t => t.refId));
    const allActiveStudents = await Student.find({ isActive: true }, '_id name className monthlyFees');

    const paidList = allActiveStudents.filter(s => paidStudentIds.has(s._id.toString()));
    const unpaidList = allActiveStudents.filter(s => !paidStudentIds.has(s._id.toString()) && s.monthlyFees > 0);

    // 7. Attendance Warnings (Risk Analysis - last 30 records)
    const allRecentAttendance = await Attendance.find({ attendanceType: 'student' })
      .sort({ date: -1 })
      .limit(30);

    const studentsWithAbsences = [];
    for (const student of allActiveStudents) {
      let absenceCount = 0;
      allRecentAttendance.forEach(att => {
        const record = att.records.find(r => r.personId === student._id.toString());
        if (record && record.status === 'absent') absenceCount++;
      });
      if (absenceCount > 3) {
        studentsWithAbsences.push({
          _id: student._id,
          name: student.name,
          className: student.className,
          absenceCount
        });
      }
    }

    // 8. In-Kind Inventory (Actual current stock from across all donors)
    const allDonorsWithStock = await Donor.find({ inKindStock: { $exists: true } });
    const liveInventoryObj = {};
    
    allDonorsWithStock.forEach(d => {
      if (d.inKindStock) {
        for (let [item, qty] of d.inKindStock) {
          if (!liveInventoryObj[item]) liveInventoryObj[item] = 0;
          liveInventoryObj[item] += qty;
        }
      }
    });

    const inKindInventory = Object.keys(liveInventoryObj).map(unit => ({
      unit,
      count: liveInventoryObj[unit]
    })).sort((a, b) => b.count - a.count);

    res.send({
      totalStudents: studentCount,
      totalSheikhs: sheikhCount,
      totalClasses: classCount,
      totalRevenue,
      attendanceRate,
      recentStudents,
      paidList: paidList.map(s => ({ _id: s._id, name: s.name, className: s.className })),
      unpaidList: unpaidList.map(s => ({ _id: s._id, name: s.name, className: s.className, monthlyFees: s.monthlyFees })),
      atRiskStudents: studentsWithAbsences,
      grantFundBalance,
      inKindCount,
      recentInKind,
      inKindInventory,
      targetMonth
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
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
