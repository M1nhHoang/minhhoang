const mongoose = require('mongoose');

const USER_TYPES = ['guest', 'user', 'admin', 'bot'];
const USER_STATUSES = ['online', 'offline', 'away'];

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
