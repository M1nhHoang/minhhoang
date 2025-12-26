/**
 * Lunar New Year Theme - Tết Nguyên Đán 🧧
 * Features: Mai & Đào garden (vườn mai đào), Peach blossoms (hoa đào), Fireworks
 */

import effects from './effects.js';
import decorations from './decorations.js';

// Theme configuration
const CONFIG = {
  id: 'lunarnewyear',
  name: 'Tết Nguyên Đán 🧧',
  priority: 100,
  dateRange: {
    // Dynamic based on lunar calendar - see date-detector.js
  }
};

let isInitialized = false;
let currentWeather = null;
let isDaytime = true;

/**
 * Calculate effect intensity based on weather
 */
function calculateEffectIntensity(weather) {
  if (!weather?.effects) {
    return 0.6; // Default higher for Tết celebration
  }
  
  const { intensity, isDaytime: isDay } = weather.effects;
  
  // More fireworks at night
  if (!isDay) {
    return Math.max(0.8, intensity);
  }
  
  return 0.5;
}

/**
 * Initialize theme
 */
async function init(context = {}) {
  if (isInitialized) return;
  
  console.log(`[${CONFIG.name}] Khởi động theme Tết Nguyên Đán...`);
  
  currentWeather = context.weather;
  
  // Load CSS
  await loadStyles();
  
  // Add theme class to body
  document.body.classList.add(`theme-${CONFIG.id}`);
  
  isInitialized = true;
  console.log(`[${CONFIG.name}] Chúc Mừng Năm Mới! 🎊`);
}

/**
 * Load CSS dynamically
 */
async function loadStyles() {
  const styleId = `${CONFIG.id}-theme-styles`;
  
  if (document.getElementById(styleId)) return;
  
  const link = document.createElement('link');
  link.id = styleId;
  link.rel = 'stylesheet';
  link.href = `/styles/seasonal/lunarnewyear.css`;
  
  return new Promise((resolve, reject) => {
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

/**
 * Apply day/night mode
 */
function applyDayNightMode(weather) {
  // Check admin override
  const savedMode = localStorage.getItem('minhhoang_daynight_mode');
  
  if (savedMode === 'day') {
    isDaytime = true;
  } else if (savedMode === 'night') {
    isDaytime = false;
  } else {
    // Auto mode: use weather API or fallback to time
    isDaytime = weather?.effects?.isDaytime ?? 
      (new Date().getHours() >= 6 && new Date().getHours() < 18);
  }
  
  // Apply CSS classes
  document.body.classList.remove('lunarnewyear-day', 'lunarnewyear-night');
  document.body.classList.add(isDaytime ? 'lunarnewyear-day' : 'lunarnewyear-night');
  
  console.log(`[${CONFIG.name}] Mode: ${isDaytime ? 'Ngày ☀️' : 'Đêm 🌙'}`);
}

/**
 * Apply visual effects
 */
async function applyEffects(weather) {
  currentWeather = weather;
  
  // Apply day/night mode first
  applyDayNightMode(weather);
  
  const intensity = calculateEffectIntensity(weather);
  
  console.log(`[${CONFIG.name}] Bắn pháo hoa với cường độ: ${intensity.toFixed(2)}`);
  
  effects.start(intensity);
}

/**
 * Apply decorations
 */
async function applyDecorations() {
  decorations.applyAll();
}

/**
 * Handle weather updates
 */
function updateWeather(weather) {
  if (!isInitialized) return;
  
  currentWeather = weather;
  
  // Re-apply day/night mode
  applyDayNightMode(weather);
  
  const intensity = calculateEffectIntensity(weather);
  effects.updateIntensity(intensity);
}

/**
 * Cleanup theme
 */
async function destroy() {
  console.log(`[${CONFIG.name}] Tạm biệt...`);
  
  effects.stop();
  decorations.removeAll();
  
  // Remove theme classes
  document.body.classList.remove(`theme-${CONFIG.id}`, 'lunarnewyear-day', 'lunarnewyear-night');
  
  // Remove CSS
  const styleEl = document.getElementById(`${CONFIG.id}-theme-styles`);
  if (styleEl) styleEl.remove();
  
  isInitialized = false;
  currentWeather = null;
  
  console.log(`[${CONFIG.name}] Hẹn gặp lại năm sau! 👋`);
}

/**
 * Get current state
 */
function getState() {
  return {
    isInitialized,
    weather: currentWeather,
    isDaytime,
    effectsActive: effects.isActive()
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
