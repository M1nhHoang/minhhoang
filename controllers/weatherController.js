const { fetchWeatherByIP } = require('../services/weatherService');

/**
 * Get current weather based on user's IP
 */
async function getCurrentWeather(req, res, next) {
  try {
    // Get client IP from request
    const ip = req.ip || req.connection?.remoteAddress || 'auto:ip';
    
    const weather = await fetchWeatherByIP(ip);
    
    res.json({
      success: true,
      data: weather
    });
  } catch (error) {
    // Return a default/fallback response instead of failing
    // This ensures the UI can still work without weather data
    res.json({
      success: false,
      error: error.message,
      data: {
        location: null,
        current: null,
        effects: {
          category: 'UNKNOWN',
          intensity: 0.3,
          isRainy: false,
          isSnowy: false,
          isCold: false,
          isHot: false,
          isDaytime: true
        }
      }
    });
  }
}

module.exports = {
  getCurrentWeather
};
