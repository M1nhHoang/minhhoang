const mongoose = require('mongoose');

const USER_TYPES = ['guest', 'user', 'admin', 'bot'];
const USER_STATUSES = ['online', 'offline', 'away'];

// Role hierarchy: higher number = more privileges
const USER_ROLES = {
  GUEST: 0,      // Người dùng chưa xác thực
  VERIFIED: 1,   // Người dùng đã đăng ký và được xác thực
  VIP: 2,        // Người dùng VIP với quyền mở rộng
  ADMIN: 99      // Quản trị viên hệ thống (Super Admin)
};

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      default: null
    },
    type: {
      type: String,
      enum: USER_TYPES,
      default: 'guest'
    },
    role: {
      type: Number,
      default: USER_ROLES.GUEST,
      min: 0,
      max: 99
    },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: 'offline'
    },
    avatar: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    metadata: {
      type: Map,
      of: String,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
module.exports.USER_STATUSES = USER_STATUSES;
module.exports.USER_TYPES = USER_TYPES;
module.exports.USER_ROLES = USER_ROLES;
