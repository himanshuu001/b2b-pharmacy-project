const mongoose = require('mongoose');

const connectDB = async () => {
  if (process.env.USE_MOCK_DB === 'true') {
    console.log('Using local JSON data store');
    return;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    process.env.USE_MOCK_DB = 'true';
    console.log('MONGO_URI is not defined. Using local JSON data store.');
    return;
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully');
  } catch (error) {
    process.env.USE_MOCK_DB = 'true';
    console.warn('MongoDB connection failed. Using local JSON data store.');
    console.warn(error.message);
  }
};

module.exports = connectDB;
