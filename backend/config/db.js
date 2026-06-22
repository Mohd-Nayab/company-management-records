import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas using Mongoose.
 * Exits the process on failure so the app never runs in a half-broken state.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('\x1b[31m%s\x1b[0m', 'MONGO_URI is missing. Add it to backend/.env');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('\x1b[32m%s\x1b[0m', `MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `MongoDB connection error: ${error.message}`);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });
};

export default connectDB;
