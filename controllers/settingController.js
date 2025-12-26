const settingService = require('../services/settingService');

/**
 * GET /api/settings/theme
 * Get current theme settings (public - all users can read)
 */
async function getTheme(req, res, next) {
  try {
    const settings = await settingService.getThemeSettings();
    res.json({
      data: settings
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/settings/theme
 * Set theme (admin only)
 * Body: { mode: 'auto' | 'manual' | 'default', theme?: string }
 */
async function setTheme(req, res, next) {
  try {
    const { mode, theme } = req.body;
    const updatedBy = req.user?.username || 'admin';

    let result;

    if (mode === 'auto') {
      result = await settingService.setThemeAuto(updatedBy);
    } else if (mode === 'default') {
      result = await settingService.setThemeDefault(updatedBy);
    } else if (mode === 'manual' && theme) {
      result = await settingService.setThemeManual(theme, updatedBy);
    } else {
      return res.status(400).json({
        error: 'Invalid request. Provide mode (auto/manual/default) and theme for manual mode.'
      });
    }

    res.json({
      data: {
        ...result,
        message: `Theme đã được cập nhật: ${result.mode === 'auto' ? 'Tự động' : result.mode === 'default' ? 'Mặc định (không theme)' : result.theme}`
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTheme,
  setTheme
};
