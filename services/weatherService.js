/**
 * Weather Service
 * Fetches weather data from WeatherAPI.com based on user IP
 */

const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

/**
 * Weather condition codes mapping
 * @see https://www.weatherapi.com/docs/weather_conditions.json
 */
const WEATHER_CONDITIONS = {
  // Clear/Sunny
  CLEAR: [1000],
  // Cloudy
  CLOUDY: [1003, 1006, 1009],
  // Mist/Fog
  MIST: [1030, 1135, 1147],
  // Rain
  LIGHT_RAIN: [1063, 1150, 1153, 1180, 1183, 1240],
  MODERATE_RAIN: [1186, 1189, 1243],
  HEAVY_RAIN: [1192, 1195, 1246],
  // Snow
  LIGHT_SNOW: [1066, 1114, 1210, 1213, 1255],
  MODERATE_SNOW: [1216, 1219, 1258],
  HEAVY_SNOW: [1117, 1222, 1225, 1261, 1264],
  // Sleet/Ice
  SLEET: [1069, 1072, 1168, 1171, 1198, 1201, 1204, 1207, 1237, 1249, 1252],
  // Thunder
  THUNDER: [1087, 1273, 1276, 1279, 1282]
};

/**
 * Get weather category from condition code
 */
function getWeatherCategory(code) {
  for (const [category, codes] of Object.entries(WEATHER_CONDITIONS)) {
    if (codes.includes(code)) {
      return category;
    }
  }
  return 'UNKNOWN';
}

/**
 * Get weather intensity (0-1) for effects
 */
function getWeatherIntensity(category) {
  const intensityMap = {
    CLEAR: 0,
    CLOUDY: 0.1,
    MIST: 0.2,
    LIGHT_RAIN: 0.3,
    MODERATE_RAIN: 0.6,
    HEAVY_RAIN: 1,
    LIGHT_SNOW: 0.3,
    MODERATE_SNOW: 0.6,
    HEAVY_SNOW: 1,
    SLEET: 0.5,
    THUNDER: 0.8
  };
  return intensityMap[category] ?? 0.2;
}

/**
 * Check if weather is rainy
 */
function isRainy(category) {
  return ['LIGHT_RAIN', 'MODERATE_RAIN', 'HEAVY_RAIN', 'SLEET', 'THUNDER'].includes(category);
}

/**
 * Check if weather is snowy
 */
function isSnowy(category) {
  return ['LIGHT_SNOW', 'MODERATE_SNOW', 'HEAVY_SNOW'].includes(category);
}

/**
 * Fetch current weather by IP address
 * @param {string} ip - IP address to lookup
 * @returns {Promise<Object>} Weather data
 */
async function fetchWeatherByIP(ip) {
  const apiKey = process.env.WEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error('WEATHER_API_KEY not configured');
  }

  // Clean IP address (remove ::ffff: prefix for IPv4-mapped IPv6)
  const cleanIP = ip.replace(/^::ffff:/, '');
  
  // Don't query for localhost/private IPs - use a default location
  const isPrivateIP = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|localhost|::1)/.test(cleanIP);
  const queryIP = isPrivateIP ? 'auto:ip' : cleanIP;

  const url = `${WEATHER_API_BASE}/current.json?key=${apiKey}&q=${queryIP}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || 'Failed to fetch weather data');
  }

  const data = await response.json();
  const conditionCode = data.current?.condition?.code;
  const category = getWeatherCategory(conditionCode);

  return {
    location: {
      name: data.location?.name,
      region: data.location?.region,
      country: data.location?.country,
      lat: data.location?.lat,
      lon: data.location?.lon,
      localtime: data.location?.localtime,
      timezone: data.location?.tz_id
    },
    current: {
      temp_c: data.current?.temp_c,
      temp_f: data.current?.temp_f,
      feelslike_c: data.current?.feelslike_c,
      feelslike_f: data.current?.feelslike_f,
      humidity: data.current?.humidity,
      cloud: data.current?.cloud,
      is_day: Boolean(data.current?.is_day),
      wind_kph: data.current?.wind_kph,
      wind_dir: data.current?.wind_dir,
      condition: {
        text: data.current?.condition?.text,
        icon: data.current?.condition?.icon,
        code: conditionCode
      }
    },
    // Processed data for seasonal effects
    effects: {
      category,
      intensity: getWeatherIntensity(category),
      isRainy: isRainy(category),
      isSnowy: isSnowy(category),
      isCold: data.current?.temp_c < 15,
      isHot: data.current?.temp_c > 30,
      isDaytime: Boolean(data.current?.is_day)
    }
  };
}

module.exports = {
  fetchWeatherByIP,
  getWeatherCategory,
  getWeatherIntensity,
  WEATHER_CONDITIONS
};
