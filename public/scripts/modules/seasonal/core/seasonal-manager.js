/**
 * Seasonal Theme Manager
 * Core module that orchestrates seasonal themes
 */

import dateDetector from './date-detector.js';
import weatherService from './weather-service.js';

// Theme registry
const themes = new Map();

// Current state
let currentTheme = null;
let weatherData = null;
let unsubscribeWeather = null;

/**
 * Register a seasonal theme
 * @param {Object} theme - Theme module
 */
export function registerTheme(theme) {
  if (!theme?.id) {
    console.warn('[SeasonalManager] Invalid theme: missing id');
    return;
  }
  
  themes.set(theme.id, theme);
  console.log(`[SeasonalManager] Registered theme: ${theme.id}`);
}

/**
 * Get a registered theme by id
 */
export function getTheme(themeId) {
  return themes.get(themeId);
}

/**
 * Get all registered themes
 */
export function getAllThemes() {
  return Array.from(themes.values());
}

/**
 * Apply a theme
 * @param {string} themeId - Theme id to apply
 * @param {Object} context - Context to pass to theme
 */
export async function applyTheme(themeId, context = {}) {
  const theme = themes.get(themeId);
  
  if (!theme) {
    console.warn(`[SeasonalManager] Theme not found: ${themeId}`);
    return false;
  }
  
  // Destroy current theme if different
  if (currentTheme && currentTheme.id !== themeId) {
    await destroyCurrentTheme();
  }
  
  // Skip if same theme already active
  if (currentTheme?.id === themeId) {
    return true;
  }
  
  console.log(`[SeasonalManager] Applying theme: ${theme.name || themeId}`);
  
  try {
    // Initialize theme
    if (theme.init) {
      await theme.init({
        ...context,
        weather: weatherData
      });
    }
    
    // Apply decorations
    if (theme.applyDecorations) {
      await theme.applyDecorations();
    }
    
    // Apply effects
    if (theme.applyEffects) {
      await theme.applyEffects(weatherData);
    }
    
    // Add theme class to body
    document.body.classList.add(`theme-${themeId}`);
    document.body.dataset.seasonalTheme = themeId;
    
    currentTheme = theme;
    return true;
  } catch (error) {
    console.error(`[SeasonalManager] Failed to apply theme ${themeId}:`, error);
    return false;
  }
}

/**
 * Destroy current theme
 */
async function destroyCurrentTheme() {
  if (!currentTheme) return;
  
  try {
    if (currentTheme.destroy) {
      await currentTheme.destroy();
    }
    
    document.body.classList.remove(`theme-${currentTheme.id}`);
    delete document.body.dataset.seasonalTheme;
    
    console.log(`[SeasonalManager] Destroyed theme: ${currentTheme.id}`);
  } catch (error) {
    console.error('[SeasonalManager] Error destroying theme:', error);
  }
  
  currentTheme = null;
}

/**
 * Handle weather updates
 */
function onWeatherUpdate(weather) {
  weatherData = weather;
  
  // Update current theme with new weather
  if (currentTheme?.updateWeather) {
    currentTheme.updateWeather(weather);
  }
}

/**
 * Initialize seasonal theme system
 * @param {Object} options - Configuration options
 */
export async function init(options = {}) {
  console.log('[SeasonalManager] Initializing...');
  
  // Subscribe to weather updates
  unsubscribeWeather = weatherService.subscribeToWeather(onWeatherUpdate);
  
  // Wait for initial weather data
  weatherData = await weatherService.fetchWeather();
  
  // Detect active theme
  const { themeId, themeName, isEvent, season } = dateDetector.getActiveTheme();
  
  console.log(`[SeasonalManager] Detected: ${themeName} (${themeId}), Season: ${season}`);
  
  // Try to apply the detected theme
  let applied = await applyTheme(themeId);
  
  // Fallback to season theme if event theme not available
  if (!applied && isEvent) {
    console.log(`[SeasonalManager] Event theme not available, falling back to season: ${season}`);
    applied = await applyTheme(season);
  }
  
  // Fallback to default theme
  if (!applied && themes.has('default')) {
    await applyTheme('default');
  }
  
  console.log('[SeasonalManager] Initialization complete');
  
  return {
    currentTheme: currentTheme?.id,
    weather: weatherData,
    season
  };
}

/**
 * Cleanup and destroy
 */
export function destroy() {
  if (unsubscribeWeather) {
    unsubscribeWeather();
    unsubscribeWeather = null;
  }
  
  destroyCurrentTheme();
  
  console.log('[SeasonalManager] Destroyed');
}

/**
 * Force refresh theme based on current date/weather
 */
export async function refresh() {
  const { themeId } = dateDetector.getActiveTheme();
  await applyTheme(themeId);
}

/**
 * Get current state
 */
export function getState() {
  return {
    currentTheme: currentTheme?.id || null,
    weather: weatherData,
    registeredThemes: Array.from(themes.keys())
  };
}

export default {
  registerTheme,
  getTheme,
  getAllThemes,
  applyTheme,
  init,
  destroy,
  refresh,
  getState
};
