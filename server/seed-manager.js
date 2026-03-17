const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager'], default: 'admin' }
});

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedManager() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const username = 'alsharea';
    const password = '12345678';

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log(`User ${username} already exists. Updating role to manager...`);
      existingUser.role = 'manager';
      existingUser.password = password; // pre-save hook will hash it
      await existingUser.save();
    } else {
      console.log(`Creating user ${username}...`);
      const newUser = new User({
        username,
        password,
        role: 'manager'
      });
      await newUser.save();
    }

    console.log('✅ Manager user seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding manager:', err);
    process.exit(1);
  }
}

seedManager();
