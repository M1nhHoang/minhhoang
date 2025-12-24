/**
 * Christmas Theme - Snow Effects
 * Creates beautiful snowfall animation
 */

// Snow configuration
const DEFAULT_CONFIG = {
  minSize: 3,
  maxSize: 8,
  minDuration: 8,
  maxDuration: 15,
  minDelay: 0,
  maxDelay: 10,
  zIndex: 9999
};

let snowContainer = null;
let snowflakes = [];
let animationFrame = null;
let isRunning = false;
let currentIntensity = 0.5;

/**
 * Create the snow container
 */
function createContainer() {
  if (snowContainer) return snowContainer;
  
  snowContainer = document.createElement('div');
  snowContainer.id = 'seasonal-snow-container';
  snowContainer.className = 'snow-container';
  snowContainer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(snowContainer);
  
  return snowContainer;
}

/**
 * Create a single snowflake element
 */
function createSnowflake(config = DEFAULT_CONFIG) {
  const snowflake = document.createElement('div');
  snowflake.className = 'snowflake';
  
  // Random properties
  const size = random(config.minSize, config.maxSize);
  const startX = random(0, 100);
  const duration = random(config.minDuration, config.maxDuration);
  const delay = random(config.minDelay, config.maxDelay);
  const opacity = random(0.4, 1);
  const drift = random(-30, 30); // Horizontal drift
  
  // Apply styles
  snowflake.style.cssText = `
    position: fixed;
    top: -10px;
    left: ${startX}%;
    width: ${size}px;
    height: ${size}px;
    background: radial-gradient(circle, #fff 0%, rgba(255,255,255,0.8) 50%, transparent 100%);
    border-radius: 50%;
    opacity: ${opacity};
    pointer-events: none;
    z-index: ${config.zIndex};
    animation: snowfall ${duration}s linear ${delay}s infinite;
    --drift: ${drift}px;
    box-shadow: 0 0 ${size * 0.5}px rgba(255, 255, 255, 0.5);
  `;
  
  return snowflake;
}

/**
 * Generate random number between min and max
 */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Calculate snowflake count based on intensity
 * @param {number} intensity - 0 to 1
 * @returns {number} Number of snowflakes
 */
function getSnowflakeCount(intensity) {
  const baseCount = 30;
  const maxCount = 150;
  return Math.floor(baseCount + (maxCount - baseCount) * intensity);
}

/**
 * Start snowfall effect
 * @param {number} intensity - 0 to 1 (affects density)
 * @param {Object} config - Configuration overrides
 */
export function start(intensity = 0.5, config = {}) {
  if (isRunning && Math.abs(intensity - currentIntensity) < 0.1) {
    return; // Already running with similar intensity
  }
  
  currentIntensity = intensity;
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Create or clear container
  createContainer();
  clear();
  
  // Generate snowflakes
  const count = getSnowflakeCount(intensity);
  
  for (let i = 0; i < count; i++) {
    const snowflake = createSnowflake(mergedConfig);
    snowContainer.appendChild(snowflake);
    snowflakes.push(snowflake);
  }
  
  isRunning = true;
  console.log(`[ChristmasEffects] Started snowfall with ${count} snowflakes`);
}

/**
 * Stop snowfall effect
 */
export function stop() {
  isRunning = false;
  clear();
  
  if (snowContainer) {
    snowContainer.remove();
    snowContainer = null;
  }
  
  console.log('[ChristmasEffects] Stopped snowfall');
}

/**
 * Clear all snowflakes
 */
function clear() {
  snowflakes.forEach(sf => sf.remove());
  snowflakes = [];
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

/**
 * Update intensity (e.g., when weather changes)
 */
export function updateIntensity(intensity) {
  if (!isRunning) return;
  
  // Significant change - recreate snowflakes
  if (Math.abs(intensity - currentIntensity) >= 0.2) {
    start(intensity);
  }
}

/**
 * Check if effect is running
 */
export function isActive() {
  return isRunning;
}

/**
 * Create snowpile decorations at bottom of elements
 */
export function createSnowPiles() {
  const elements = document.querySelectorAll('.snow-pile-target');
  
  elements.forEach(el => {
    if (el.querySelector('.snow-pile')) return;
    
    const pile = document.createElement('div');
    pile.className = 'snow-pile';
    pile.setAttribute('aria-hidden', 'true');
    el.style.position = 'relative';
    el.appendChild(pile);
  });
}

/**
 * Remove snow piles
 */
export function removeSnowPiles() {
  document.querySelectorAll('.snow-pile').forEach(pile => pile.remove());
}

export default {
  start,
  stop,
  updateIntensity,
  isActive,
  createSnowPiles,
  removeSnowPiles
};
