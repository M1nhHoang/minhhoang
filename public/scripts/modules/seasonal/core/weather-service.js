/**
 * Weather Service (Frontend)
 * Fetches weather data from backend API
 */

const WEATHER_ENDPOINT = '/api/weather';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

let cachedWeather = null;
let cacheTimestamp = 0;

/**
 * Weather effect types for themes
 */
export const WEATHER_EFFECTS = {
  NONE: 'none',
  LIGHT_PRECIPITATION: 'light',
  MODERATE_PRECIPITATION: 'moderate',
  HEAVY_PRECIPITATION: 'heavy'
};

/**
 * Get precipitation effect level based on weather data
 * @param {Object} effects - Weather effects data from API
 * @returns {string} Effect level
 */
export function getPrecipitationEffect(effects) {
  if (!effects) return WEATHER_EFFECTS.NONE;
  
  const intensity = effects.intensity || 0;
  
  if (intensity >= 0.8) return WEATHER_EFFECTS.HEAVY_PRECIPITATION;
  if (intensity >= 0.5) return WEATHER_EFFECTS.MODERATE_PRECIPITATION;
  if (intensity >= 0.2) return WEATHER_EFFECTS.LIGHT_PRECIPITATION;
  
  return WEATHER_EFFECTS.NONE;
}

/**
 * Fetch current weather data
 * @param {boolean} forceRefresh - Bypass cache
 * @returns {Promise<Object>} Weather data
 */
export async function fetchWeather(forceRefresh = false) {
  const now = Date.now();
  
  // Return cached data if valid
  if (!forceRefresh && cachedWeather && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedWeather;
  }
  
  try {
    const response = await fetch(WEATHER_ENDPOINT);
    const result = await response.json();
    
    if (result.success && result.data) {
      cachedWeather = result.data;
      cacheTimestamp = now;
      return result.data;
    }
    
    // Return fallback data
    return result.data || getDefaultWeather();
  } catch (error) {
    console.warn('[WeatherService] Failed to fetch weather:', error);
    return cachedWeather || getDefaultWeather();
  }
}

/**
 * Get default weather data when API fails
 */
export function getDefaultWeather() {
  return {
    location: null,
    current: null,
    effects: {
      category: 'UNKNOWN',
      intensity: 0.3,
      isRainy: false,
      isSnowy: false,
      isCold: false,
      isHot: false,
      isDaytime: isDaytime()
    }
  };
}

/**
 * Simple daytime check based on local time
 */
function isDaytime() {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
}

/**
 * Subscribe to weather updates
 * @param {Function} callback - Called when weather updates
 * @param {number} interval - Update interval in ms (default: 30 min)
 * @returns {Function} Unsubscribe function
 */
export function subscribeToWeather(callback, interval = CACHE_DURATION) {
  let timeoutId = null;
  let isActive = true;
  
  async function update() {
    if (!isActive) return;
    
    const weather = await fetchWeather(true);
    callback(weather);
    
    if (isActive) {
      timeoutId = setTimeout(update, interval);
    }
  }
  
  // Initial fetch
  update();
  
  // Return unsubscribe function
  return () => {
    isActive = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

export default {
  fetchWeather,
  getDefaultWeather,
  getPrecipitationEffect,
  subscribeToWeather,
  WEATHER_EFFECTS
};
