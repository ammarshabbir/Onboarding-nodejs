const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ debug: false });



const connectDB = async () => {
  try {
    const uri =
      process.env.NODE_ENV === 'production'
        ? process.env.MONGO_URI_LIVE
        : process.env.MONGO_URI_LOCAL;

    await mongoose.connect(uri, {

    });

    console.log(`MongoDB connected to ${process.env.NODE_ENV === 'production' ? 'LIVE' : 'LOCAL'} database`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
