/**
 * Seasonal Theme Manager
 * Core module that orchestrates seasonal themes
 * Reads theme settings from server API (site-wide for all users)
 */

import dateDetector from './date-detector.js';
import weatherService from './weather-service.js';

// API endpoint for theme settings
const THEME_API_URL = '/api/settings/theme';

// Theme modes
const THEME_MODES = {
  AUTO: 'auto',      // Auto detect based on date/weather
  MANUAL: 'manual',  // Manually selected theme
  DEFAULT: 'default' // No theme (plain)
};

// Theme registry
const themes = new Map();

// Current state
let currentTheme = null;
let weatherData = null;
let unsubscribeWeather = null;
let currentMode = THEME_MODES.AUTO;
let serverThemeSettings = null;

/**
 * Get auth headers for API requests
 */
function getAuthHeaders() {
  try {
    const stored = localStorage.getItem('minhhoang_auth');
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.username) {
        return { 'X-Username': user.username };
      }
    }
  } catch (e) {
    console.warn('[SeasonalManager] Failed to get auth headers:', e);
  }
  return {};
}

/**
 * Fetch theme settings from server API
 */
async function fetchThemeSettings() {
  try {
    const response = await fetch(THEME_API_URL);
    if (!response.ok) {
      console.warn('[SeasonalManager] Failed to fetch theme settings:', response.status);
      return null;
    }
    const result = await response.json();
    serverThemeSettings = result.data;
    return serverThemeSettings;
  } catch (error) {
    console.warn('[SeasonalManager] Error fetching theme settings:', error);
    return null;
  }
}

/**
 * Save theme settings to server API (admin only)
 */
async function saveThemeToServer(mode, themeId = null) {
  try {
    const body = { mode };
    if (mode === THEME_MODES.MANUAL && themeId) {
      body.theme = themeId;
    }
    
    const response = await fetch(THEME_API_URL, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save theme');
    }
    
    const result = await response.json();
    serverThemeSettings = result.data;
    return result.data;
  } catch (error) {
    console.error('[SeasonalManager] Error saving theme to server:', error);
    throw error;
  }
}

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
 * @param {boolean} context.saveToServer - Whether to save to server API (default: false)
 */
export async function applyTheme(themeId, context = {}) {
  const { saveToServer = false } = context;
  
  // Handle 'default' theme (no theme)
  if (themeId === 'default') {
    await destroyCurrentTheme();
    currentMode = THEME_MODES.DEFAULT;
    
    if (saveToServer) {
      try {
        await saveThemeToServer(THEME_MODES.DEFAULT);
        console.log('[SeasonalManager] Theme set to default (no theme) - saved to server');
      } catch (error) {
        console.error('[SeasonalManager] Failed to save default mode to server:', error);
        throw error;
      }
    }
    
    return true;
  }
  
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
    // Still save to server if requested
    if (saveToServer) {
      await saveThemeToServer(THEME_MODES.MANUAL, themeId);
    }
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
    
    // Save to server if requested (admin manual selection)
    if (saveToServer) {
      await saveThemeToServer(THEME_MODES.MANUAL, themeId);
      currentMode = THEME_MODES.MANUAL;
      console.log(`[SeasonalManager] Theme saved to server: ${themeId}`);
    }
    
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
  
  // Fetch theme settings from server
  const settings = await fetchThemeSettings();
  console.log('[SeasonalManager] Server theme settings:', settings);
  
  // Handle based on server mode
  if (settings) {
    currentMode = settings.mode || THEME_MODES.AUTO;
    
    // DEFAULT mode - no theme
    if (currentMode === THEME_MODES.DEFAULT) {
      console.log('[SeasonalManager] Mode: DEFAULT (no theme)');
      await destroyCurrentTheme();
      console.log('[SeasonalManager] Initialization complete (no theme)');
      return {
        currentTheme: null,
        mode: THEME_MODES.DEFAULT,
        weather: weatherData,
        season: dateDetector.getActiveTheme().season
      };
    }
    
    // MANUAL mode - use server-specified theme
    if (currentMode === THEME_MODES.MANUAL && settings.theme) {
      console.log(`[SeasonalManager] Mode: MANUAL, theme: ${settings.theme}`);
      const applied = await applyTheme(settings.theme, { saveToServer: false });
      if (applied) {
        console.log('[SeasonalManager] Initialization complete (manual theme from server)');
        return {
          currentTheme: currentTheme?.id,
          mode: THEME_MODES.MANUAL,
          weather: weatherData,
          season: dateDetector.getActiveTheme().season
        };
      }
    }
  }
  
  // AUTO mode - detect based on date
  currentMode = THEME_MODES.AUTO;
  const { themeId, themeName, isEvent, season } = dateDetector.getActiveTheme();
  
  console.log(`[SeasonalManager] Mode: AUTO, detected: ${themeName} (${themeId}), Season: ${season}`);
  
  // Try to apply the detected theme
  let applied = await applyTheme(themeId, { saveToServer: false });
  
  // Fallback to season theme if event theme not available
  if (!applied && isEvent) {
    console.log(`[SeasonalManager] Event theme not available, falling back to season: ${season}`);
    applied = await applyTheme(season, { saveToServer: false });
  }
  
  // Fallback to default (no theme)
  if (!applied) {
    console.log('[SeasonalManager] No theme applied');
  }
  
  console.log('[SeasonalManager] Initialization complete');
  
  return {
    currentTheme: currentTheme?.id,
    mode: currentMode,
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
 * This sets to AUTO mode on the server
 */
export async function refresh() {
  currentMode = THEME_MODES.AUTO;
  
  // Save AUTO mode to server
  try {
    await saveThemeToServer(THEME_MODES.AUTO);
    console.log('[SeasonalManager] Set to AUTO mode on server');
  } catch (error) {
    console.warn('[SeasonalManager] Failed to save AUTO mode to server:', error);
  }
  
  const { themeId } = dateDetector.getActiveTheme();
  console.log(`[SeasonalManager] Refreshing to auto-detected theme: ${themeId}`);
  
  // Apply without saving to server (already saved mode above)
  await applyTheme(themeId, { saveToServer: false });
}

/**
 * Set to default mode (no theme)
 */
export async function setDefaultMode() {
  try {
    await saveThemeToServer(THEME_MODES.DEFAULT);
    await destroyCurrentTheme();
    currentMode = THEME_MODES.DEFAULT;
    console.log('[SeasonalManager] Set to DEFAULT mode (no theme)');
    return true;
  } catch (error) {
    console.error('[SeasonalManager] Failed to set default mode:', error);
    throw error;
  }
}

/**
 * Get current state
 */
export function getState() {
  return {
    currentTheme: currentTheme?.id || null,
    mode: currentMode,
    weather: weatherData,
    registeredThemes: Array.from(themes.keys()),
    serverSettings: serverThemeSettings
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
  setDefaultMode,
  getState,
  THEME_MODES
};
