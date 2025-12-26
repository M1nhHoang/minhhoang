const { Setting, THEME_MODES, SETTING_KEYS } = require('../models/settingModel');

/**
 * Get current theme settings
 * @returns {Object} { mode, theme, updatedBy, updatedAt }
 */
async function getThemeSettings() {
  const modeSetting = await Setting.findOne({ key: SETTING_KEYS.THEME_MODE });
  const themeSetting = await Setting.findOne({ key: SETTING_KEYS.ACTIVE_THEME });

  return {
    mode: modeSetting?.value || THEME_MODES.AUTO,
    theme: themeSetting?.value || null,
    updatedBy: themeSetting?.updatedBy || 'system',
    updatedAt: themeSetting?.updatedAt || null
  };
}

/**
 * Set theme to auto-detect mode
 * @param {string} updatedBy - Username of admin
 */
async function setThemeAuto(updatedBy = 'admin') {
  await Setting.set(SETTING_KEYS.THEME_MODE, THEME_MODES.AUTO, updatedBy, 'Theme mode');
  await Setting.set(SETTING_KEYS.ACTIVE_THEME, null, updatedBy, 'Active theme (null = auto)');
  
  return { mode: THEME_MODES.AUTO, theme: null };
}

/**
 * Set theme to default (no theme)
 * @param {string} updatedBy - Username of admin
 */
async function setThemeDefault(updatedBy = 'admin') {
  await Setting.set(SETTING_KEYS.THEME_MODE, THEME_MODES.DEFAULT, updatedBy, 'Theme mode');
  await Setting.set(SETTING_KEYS.ACTIVE_THEME, 'default', updatedBy, 'Active theme');
  
  return { mode: THEME_MODES.DEFAULT, theme: 'default' };
}

/**
 * Set a specific theme manually
 * @param {string} themeId - Theme ID (christmas, halloween, etc.)
 * @param {string} updatedBy - Username of admin
 */
async function setThemeManual(themeId, updatedBy = 'admin') {
  if (!themeId || themeId === 'auto') {
    return setThemeAuto(updatedBy);
  }
  
  if (themeId === 'default') {
    return setThemeDefault(updatedBy);
  }

  await Setting.set(SETTING_KEYS.THEME_MODE, THEME_MODES.MANUAL, updatedBy, 'Theme mode');
  await Setting.set(SETTING_KEYS.ACTIVE_THEME, themeId, updatedBy, 'Active theme');
  
  return { mode: THEME_MODES.MANUAL, theme: themeId };
}

/**
 * Get a general setting value
 */
async function getSetting(key, defaultValue = null) {
  return Setting.get(key, defaultValue);
}

/**
 * Set a general setting value
 */
async function setSetting(key, value, updatedBy = 'system') {
  return Setting.set(key, value, updatedBy);
}

module.exports = {
  getThemeSettings,
  setThemeAuto,
  setThemeDefault,
  setThemeManual,
  getSetting,
  setSetting,
  THEME_MODES,
  SETTING_KEYS
};
