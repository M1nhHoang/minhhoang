const mongoose = require('mongoose');
const User = require('../models/userModel');
const { USER_ROLES } = require('../models/userModel');

let isConnected = false;

/**
 * Initialize default super admin account from environment variables
 * This will only create the admin if it doesn't exist in the database
 */
async function initializeDefaultAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  try {
    const existingAdmin = await User.findOne({ username: adminUsername });

    if (!existingAdmin) {
      const adminUser = await User.create({
        username: adminUsername,
        password: adminPassword,
        type: 'admin',
        role: USER_ROLES.SUPER_ADMIN,
        status: 'offline',
        isVerified: true,
        description: 'System Super Administrator',
        metadata: {
          origin: 'system-init',
          createdBy: 'auto-seed'
        }
      });

      console.log(`[database] Default super admin account created: ${adminUser.username}`);
      return adminUser;
    }

    console.log('[database] Admin account already exists, skipping initialization');
    return existingAdmin;
  } catch (error) {
    console.error('[database] Failed to initialize default admin:', error.message);
    throw error;
  }
}

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
  connectDatabase,
  initializeDefaultAdmin
};
