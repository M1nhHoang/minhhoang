const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    updatedBy: {
      type: String,
      default: 'system'
    }
  },
  {
    timestamps: true
  }
);

// Static methods
settingSchema.statics.get = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

settingSchema.statics.set = async function(key, value, updatedBy = 'system', description = '') {
  const result = await this.findOneAndUpdate(
    { key },
    { 
      value, 
      updatedBy,
      ...(description && { description })
    },
    { upsert: true, new: true }
  );
  return result;
};

// Theme setting constants
const THEME_MODES = {
  AUTO: 'auto',      // Auto detect based on date/weather
  MANUAL: 'manual',  // Manually selected theme
  DEFAULT: 'default' // No theme (plain)
};

const SETTING_KEYS = {
  ACTIVE_THEME: 'site_theme',
  THEME_MODE: 'site_theme_mode'
};

const Setting = mongoose.model('Setting', settingSchema);

module.exports = {
  Setting,
  THEME_MODES,
  SETTING_KEYS
};
