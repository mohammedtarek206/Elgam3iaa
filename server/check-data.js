const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check Classes
    const Class = mongoose.model('Class', new mongoose.Schema({ name: String }));
    const classes = await Class.find({});
    console.log('Classes:', classes.map(c => c.name));
    
    // Check Sheikhs
    const Sheikh = mongoose.model('Sheikh', new mongoose.Schema({ name: String }));
    const sheikhs = await Sheikh.find({});
    console.log('Sheikhs:', sheikhs.map(s => s.name));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

connectDB();
