/**
 * Seasonal Theme System - Entry Point
 * 
 * This module initializes the seasonal theme system and registers all available themes.
 * 
 * Structure:
 * - core/: Core functionality (manager, weather service, date detector)
 * - themes/: Individual theme modules
 *   - christmas/: 🎄 Christmas theme (Dec 20-26)
 *   - tet/: 🧧 Vietnamese New Year theme
 *   - spring/: 🌸 Spring season theme
 *   - summer/: ☀️ Summer season theme
 *   - autumn/: 🍂 Autumn season theme
 *   - winter/: ❄️ Winter season theme
 * 
 * Each theme exports:
 * - id: Unique identifier
 * - name: Display name
 * - priority: Higher = takes precedence
 * - init(context): Initialize theme
 * - applyEffects(weather): Apply visual effects
 * - applyDecorations(): Apply UI decorations
 * - updateWeather(weather): Handle weather changes
 * - destroy(): Cleanup
 */

import seasonalManager from './core/seasonal-manager.js';

// Import themes
import christmasTheme from './themes/christmas/index.js';
// Future themes:
// import tetTheme from './themes/tet/index.js';
// import springTheme from './themes/spring/index.js';
// import summerTheme from './themes/summer/index.js';
// import autumnTheme from './themes/autumn/index.js';
// import winterTheme from './themes/winter/index.js';

/**
 * Register all available themes
 */
function registerThemes() {
  // Register Christmas theme
  seasonalManager.registerTheme(christmasTheme);
  
  // Future themes registration:
  // seasonalManager.registerTheme(tetTheme);
  // seasonalManager.registerTheme(springTheme);
  // seasonalManager.registerTheme(summerTheme);
  // seasonalManager.registerTheme(autumnTheme);
  // seasonalManager.registerTheme(winterTheme);
}

/**
 * Initialize the seasonal theme system
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Initialization result
 */
export async function initSeasonal(options = {}) {
  console.log('[Seasonal] Starting initialization...');
  
  // Register all themes
  registerThemes();
  
  // Initialize the manager
  const result = await seasonalManager.init(options);
  
  console.log('[Seasonal] Initialization complete:', result);
  
  return result;
}

/**
 * Cleanup seasonal system
 */
export function destroySeasonal() {
  seasonalManager.destroy();
}

/**
 * Get seasonal system state
 */
export function getSeasonalState() {
  return seasonalManager.getState();
}

/**
 * Force apply a specific theme (for testing/demo)
 * @param {string} themeId - Theme to apply
 */
export function forceTheme(themeId) {
  return seasonalManager.applyTheme(themeId);
}

// Export manager for advanced usage
export { seasonalManager };

export default {
  init: initSeasonal,
  destroy: destroySeasonal,
  getState: getSeasonalState,
  forceTheme,
  manager: seasonalManager
};
