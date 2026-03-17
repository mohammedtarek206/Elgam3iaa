const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'اسم المستخدم مطلوب'], 
    unique: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'كلمة المرور مطلوبة'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'manager'],
    default: 'admin'
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
