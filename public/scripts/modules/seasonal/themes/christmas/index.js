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
let isDaytime = true;

/**
 * Apply day/night mode based on weather
 * @param {Object} weather - Weather data
 */
function applyDayNightMode(weather) {
  const body = document.body;
  
  // Determine if it's day or night
  if (weather?.effects?.isDaytime !== undefined) {
    isDaytime = weather.effects.isDaytime;
  } else {
    // Fallback: check current hour (6h-18h = day)
    const hour = new Date().getHours();
    isDaytime = hour >= 6 && hour < 18;
  }
  
  // Remove existing mode classes
  body.classList.remove('christmas-day', 'christmas-night');
  
  // Apply appropriate mode
  if (isDaytime) {
    body.classList.add('christmas-day');
    console.log('[ChristmasTheme] Day mode activated ☀️');
  } else {
    body.classList.add('christmas-night');
    console.log('[ChristmasTheme] Night mode activated 🌙');
  }
}

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
  // Add version param for cache busting (see docs/asset-versioning.md)
  link.href = `/styles/seasonal/christmas.css?v=${Date.now()}`;
  
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
  
  // Apply day/night mode
  applyDayNightMode(weather);
  
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
  
  // Update day/night mode
  applyDayNightMode(weather);
  
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
  
  // Remove day/night mode classes
  document.body.classList.remove('christmas-day', 'christmas-night');
  
  // Remove CSS
  const styleEl = document.getElementById('christmas-theme-styles');
  if (styleEl) styleEl.remove();
  
  isInitialized = false;
  currentWeather = null;
  isDaytime = true;
  
  console.log('[ChristmasTheme] Goodbye! 🎄');
}

/**
 * Get current theme state
 */
function getState() {
  return {
    isInitialized,
    weather: currentWeather,
    snowActive: effects.isActive(),
    isDaytime
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
