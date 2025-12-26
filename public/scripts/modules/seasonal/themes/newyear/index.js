/**
 * New Year Theme 🎆
 * Festive theme for December 27 - January 3
 * 
 * Features:
 * - Fireworks effect (particle explosions)
 * - Vibrant color scheme (gold, purple, blue)
 * - Countdown decorations
 * - Sparkle effects on UI elements
 * - Celebratory confetti
 */

import effects from './effects.js';
import decorations from './decorations.js';

// Theme configuration
const CONFIG = {
  id: 'newyear',
  name: 'Năm Mới 🎆',
  priority: 100,
  dateRange: {
    start: [12, 27], // December 27
    end: [1, 3]      // January 3
  }
};

// State
let isInitialized = false;
let currentWeather = null;
let isDaytime = true;

/**
 * Calculate firework intensity based on weather
 */
function calculateFireworkIntensity(weather) {
  if (!weather?.effects) {
    return 0.6; // Default festive intensity
  }
  
  const { intensity, isDaytime: isDay } = weather.effects;
  
  // Fireworks look better at night!
  if (!isDay) {
    return Math.max(0.7, intensity);
  }
  
  // During day, reduce intensity slightly
  return Math.max(0.4, intensity * 0.8);
}

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
    // Fallback: check current hour
    const hour = new Date().getHours();
    isDaytime = hour >= 6 && hour < 18;
  }
  
  // Remove existing mode classes
  body.classList.remove('newyear-day', 'newyear-night');
  
  // Apply appropriate mode
  if (isDaytime) {
    body.classList.add('newyear-day');
    console.log('[NewYearTheme] Day mode activated ☀️');
  } else {
    body.classList.add('newyear-night');
    console.log('[NewYearTheme] Night mode activated 🌙');
  }
}

/**
 * Initialize the New Year theme
 * @param {Object} context - Context with weather data
 */
async function init(context = {}) {
  if (isInitialized) return;
  
  console.log('[NewYearTheme] Initializing...');
  
  currentWeather = context.weather;
  
  // Load CSS dynamically
  await loadStyles();
  
  isInitialized = true;
  console.log('[NewYearTheme] Ready! 🎆');
}

/**
 * Load New Year CSS
 */
async function loadStyles() {
  const styleId = 'newyear-theme-styles';
  
  if (document.getElementById(styleId)) return;
  
  const link = document.createElement('link');
  link.id = styleId;
  link.rel = 'stylesheet';
  link.href = '/styles/seasonal/newyear.css';
  
  return new Promise((resolve, reject) => {
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

/**
 * Apply visual effects (fireworks)
 * @param {Object} weather - Current weather data
 */
async function applyEffects(weather) {
  currentWeather = weather;
  
  // Apply day/night mode
  applyDayNightMode(weather);
  
  const intensity = calculateFireworkIntensity(weather);
  
  console.log(`[NewYearTheme] Starting fireworks with intensity: ${intensity.toFixed(2)}`);
  
  effects.start(intensity);
}

/**
 * Apply decorations (sparkles, countdown, etc.)
 */
async function applyDecorations() {
  decorations.applyAll();
}

/**
 * Handle weather updates
 * @param {Object} weather - New weather data
 */
function updateWeather(weather) {
  if (!isInitialized) return;
  
  currentWeather = weather;
  
  // Update day/night mode
  applyDayNightMode(weather);
  
  const intensity = calculateFireworkIntensity(weather);
  
  effects.updateIntensity(intensity);
}

/**
 * Cleanup theme
 */
async function destroy() {
  console.log('[NewYearTheme] Destroying...');
  
  effects.stop();
  decorations.removeAll();
  
  // Remove day/night mode classes
  document.body.classList.remove('newyear-day', 'newyear-night');
  
  // Remove CSS
  const styleEl = document.getElementById('newyear-theme-styles');
  if (styleEl) styleEl.remove();
  
  isInitialized = false;
  currentWeather = null;
  isDaytime = true;
  
  console.log('[NewYearTheme] Goodbye! 🎆');
}

/**
 * Get current state
 */
function getState() {
  return {
    isInitialized,
    weather: currentWeather,
    effectsActive: effects.isActive(),
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
