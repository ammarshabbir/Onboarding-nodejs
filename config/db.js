const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ debug: false });

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI; // Using single URI variable

    await mongoose.connect(uri, {

    });

    console.log(`MongoDB connected successfully`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;