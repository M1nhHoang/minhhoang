const crypto = require('crypto');
const UserModel = require('../models/userModel');
const { USER_STATUSES, USER_TYPES } = UserModel;
const User = UserModel;

function sanitizeStatus(status) {
  if (!status) return undefined;
  const normalized = status.toLowerCase();
  return USER_STATUSES.includes(normalized) ? normalized : undefined;
}

function sanitizeType(type) {
  if (!type) return undefined;
  const normalized = type.toLowerCase();
  return USER_TYPES.includes(normalized) ? normalized : undefined;
}

async function listUsers(filter = {}) {
  const query = {};
  if (filter.status) {
    const normalized = sanitizeStatus(filter.status);
    if (normalized) {
      query.status = normalized;
    }
  }
  if (filter.type) {
    const normalized = sanitizeType(filter.type);
    if (normalized) {
      query.type = normalized;
    }
  }
  return User.find(query).sort({ username: 1 }).lean();
}

async function getUserByName(username) {
  if (!username) return null;
  return User.findOne({ username }).lean();
}

async function createUser(payload) {
  const username = payload.username?.trim();
  if (!username) {
    const error = new Error('username is required');
    error.statusCode = 400;
    throw error;
  }

  const nextType = sanitizeType(payload.type) || 'user';
  const nextStatus = sanitizeStatus(payload.status) || 'offline';

  try {
    return await User.create({
      username,
      password: payload.password || null,
      type: nextType,
      status: nextStatus,
      avatar: payload.avatar || null,
      description: payload.description || ''
    });
  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 409;
      error.message = 'username already exists';
    }
    throw error;
  }
}

async function ensureGuestUser(username) {
  const safeName = username || crypto.randomBytes(6).toString('hex');
  const defaults = {
    username: safeName,
    type: 'guest',
    status: 'offline'
  };

  const result = await User.findOneAndUpdate(
    { username: safeName },
    {
      $setOnInsert: defaults
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  return result ? result.toObject() : null;
}

async function updateStatus(username, status) {
  const normalizedStatus = sanitizeStatus(status);
  if (!normalizedStatus) {
    const error = new Error('status must be one of online|offline|away');
    error.statusCode = 400;
    throw error;
  }
  return User.findOneAndUpdate(
    { username },
    { status: normalizedStatus },
    { new: true }
  ).lean();
}

module.exports = {
  listUsers,
  createUser,
  ensureGuestUser,
  updateStatus,
  getUserByName,
  USER_STATUSES,
  USER_TYPES
};
