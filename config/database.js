const mongoose = require('mongoose');

let isConnected = false;

async function connectDatabase() {
  if (isConnected) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || undefined;

  if (!uri) {
    throw new Error('[database] MONGODB_URI is missing; cannot connect');
  }

  try {
    const connection = await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log('[database] Connected to MongoDB');
    return connection;
  } catch (error) {
    console.error('[database] Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

module.exports = {
  connectDatabase
};
