/**
 * Christmas Theme
 * 🎄 Festive theme for December 20-26
 * 
 * Features:
 * - Snowfall effect (intensity based on weather)
 * - Santa hats on avatars
 * - Snow-capped icons
 * - Festive color scheme
 * - Corner holly decorations
 */

import effects from './effects.js';
import decorations from './decorations.js';

// Theme configuration
const CONFIG = {
  id: 'christmas',
  name: 'Giáng Sinh 🎄',
  priority: 100,
  dateRange: {
    start: [12, 20], // December 20
    end: [12, 26]    // December 26
  }
};

// State
let isInitialized = false;
let currentWeather = null;

/**
 * Calculate snow intensity based on weather
 * For Christmas: rain = snow effect
 */
function calculateSnowIntensity(weather) {
  if (!weather?.effects) {
    return 0.4; // Default light snow
  }
  
  const { intensity, isRainy, isSnowy } = weather.effects;
  
  // If actually snowing, use real intensity
  if (isSnowy) {
    return Math.max(0.3, intensity);
  }
  
  // Convert rain to snow for Christmas theme
  if (isRainy) {
    return Math.max(0.4, intensity);
  }
  
  // Default: light decorative snow
  return 0.3;
}

/**
 * Initialize the Christmas theme
 * @param {Object} context - Context with weather data
 */
async function init(context = {}) {
  if (isInitialized) return;
  
  console.log('[ChristmasTheme] Initializing...');
  
  currentWeather = context.weather;
  
  // Load CSS dynamically if not already loaded
  await loadStyles();
  
  isInitialized = true;
  console.log('[ChristmasTheme] Ready! 🎄');
}

/**
 * Load Christmas CSS
 */
async function loadStyles() {
  const styleId = 'christmas-theme-styles';
  
  if (document.getElementById(styleId)) return;
  
  const link = document.createElement('link');
  link.id = styleId;
  link.rel = 'stylesheet';
  link.href = '/styles/seasonal/christmas.css';
  
  return new Promise((resolve, reject) => {
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

/**
 * Apply visual effects
 * @param {Object} weather - Current weather data
 */
async function applyEffects(weather) {
  currentWeather = weather;
  const intensity = calculateSnowIntensity(weather);
  
  console.log(`[ChristmasTheme] Starting snow with intensity: ${intensity.toFixed(2)}`);
  
  effects.start(intensity);
}

/**
 * Apply decorations
 */
async function applyDecorations() {
  decorations.applyAll();
}

/**
 * Update based on weather changes
 * @param {Object} weather - New weather data
 */
function updateWeather(weather) {
  if (!isInitialized) return;
  
  currentWeather = weather;
  const intensity = calculateSnowIntensity(weather);
  
  effects.updateIntensity(intensity);
}

/**
 * Cleanup and destroy theme
 */
async function destroy() {
  console.log('[ChristmasTheme] Destroying...');
  
  effects.stop();
  decorations.removeAll();
  
  // Remove CSS
  const styleEl = document.getElementById('christmas-theme-styles');
  if (styleEl) styleEl.remove();
  
  isInitialized = false;
  currentWeather = null;
  
  console.log('[ChristmasTheme] Goodbye! 🎄');
}

/**
 * Get current theme state
 */
function getState() {
  return {
    isInitialized,
    weather: currentWeather,
    snowActive: effects.isActive()
  };
}

// Export theme object
export default {
  ...CONFIG,
  init,
  applyEffects,
  applyDecorations,
  updateWeather,
  destroy,
  getState
};
