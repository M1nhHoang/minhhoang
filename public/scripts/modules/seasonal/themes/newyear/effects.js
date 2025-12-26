/**
 * New Year Theme - Fireworks Effects
 * Creates beautiful firework explosions and confetti
 */

// Firework configuration
const DEFAULT_CONFIG = {
  // Firework settings
  fireworkInterval: 800,     // ms between fireworks
  particlesPerExplosion: 50,
  minExplosionSize: 80,
  maxExplosionSize: 150,
  
  // Confetti settings
  confettiCount: 100,
  confettiColors: ['#e74c3c', '#f39c12', '#9b59b6', '#3498db', '#2ecc71', '#ffd700', '#ff69b4'],
  
  zIndex: 9999
};

// Color palettes for fireworks
const FIREWORK_COLORS = [
  ['#ff0000', '#ff6b6b', '#ffa500'],  // Red-Orange
  ['#ffd700', '#ffed4a', '#fff'],     // Gold
  ['#9b59b6', '#8e44ad', '#e74c3c'], // Purple-Red
  ['#3498db', '#5dade2', '#85c1e9'], // Blue
  ['#2ecc71', '#58d68d', '#abebc6'], // Green
  ['#ff69b4', '#ff1493', '#ffc0cb'], // Pink
  ['#00ffff', '#00ced1', '#20b2aa']  // Cyan
];

let effectsContainer = null;
let confettiContainer = null;
let fireworkInterval = null;
let isRunning = false;
let currentIntensity = 0.5;

/**
 * Create the effects container
 */
function createContainer() {
  if (effectsContainer) return effectsContainer;
  
  effectsContainer = document.createElement('div');
  effectsContainer.id = 'newyear-effects-container';
  effectsContainer.className = 'newyear-effects-container';
  effectsContainer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(effectsContainer);
  
  return effectsContainer;
}

/**
 * Create confetti container
 */
function createConfettiContainer() {
  if (confettiContainer) return confettiContainer;
  
  confettiContainer = document.createElement('div');
  confettiContainer.id = 'newyear-confetti-container';
  confettiContainer.className = 'newyear-confetti-container';
  confettiContainer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(confettiContainer);
  
  return confettiContainer;
}

/**
 * Generate random number between min and max
 */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Get random item from array
 */
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Create a single firework explosion
 */
function createFirework(config = DEFAULT_CONFIG) {
  const container = createContainer();
  
  // Random position in upper 70% of screen
  const x = random(10, 90);
  const y = random(10, 50);
  
  // Random color palette
  const colors = randomItem(FIREWORK_COLORS);
  
  // Create explosion container
  const explosion = document.createElement('div');
  explosion.className = 'firework-explosion';
  explosion.style.cssText = `
    position: fixed;
    left: ${x}%;
    top: ${y}%;
    width: 0;
    height: 0;
    z-index: ${config.zIndex};
    pointer-events: none;
  `;
  
  // Create particles
  const particleCount = Math.floor(config.particlesPerExplosion * currentIntensity);
  const explosionSize = random(config.minExplosionSize, config.maxExplosionSize);
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'firework-particle';
    
    const angle = (i / particleCount) * 360;
    const velocity = random(0.5, 1);
    const size = random(3, 6);
    const color = randomItem(colors);
    const duration = random(0.8, 1.5);
    
    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      box-shadow: 0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color};
      --angle: ${angle}deg;
      --velocity: ${velocity};
      --distance: ${explosionSize}px;
      animation: firework-particle ${duration}s ease-out forwards;
    `;
    
    explosion.appendChild(particle);
  }
  
  // Add sparkle trail
  const sparkle = document.createElement('div');
  sparkle.className = 'firework-sparkle';
  sparkle.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 10px #fff, 0 0 20px #ffd700;
    animation: firework-sparkle 0.3s ease-out forwards;
  `;
  explosion.appendChild(sparkle);
  
  container.appendChild(explosion);
  
  // Remove after animation
  setTimeout(() => {
    explosion.remove();
  }, 2000);
}

/**
 * Create confetti pieces
 */
function createConfetti(config = DEFAULT_CONFIG) {
  const container = createConfettiContainer();
  
  const count = Math.floor(config.confettiCount * currentIntensity);
  
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'newyear-confetti';
    
    const color = randomItem(config.confettiColors);
    const size = random(5, 12);
    const startX = random(0, 100);
    const duration = random(3, 6);
    const delay = random(0, 3);
    const rotation = random(0, 360);
    const drift = random(-50, 50);
    
    // Random shape
    const shapes = ['square', 'circle', 'triangle'];
    const shape = randomItem(shapes);
    
    let shapeStyle = '';
    if (shape === 'circle') {
      shapeStyle = 'border-radius: 50%;';
    } else if (shape === 'triangle') {
      shapeStyle = `
        width: 0;
        height: 0;
        border-left: ${size/2}px solid transparent;
        border-right: ${size/2}px solid transparent;
        border-bottom: ${size}px solid ${color};
        background: transparent;
      `;
    }
    
    confetti.style.cssText = `
      position: fixed;
      top: -20px;
      left: ${startX}%;
      width: ${size}px;
      height: ${size}px;
      background: ${shape !== 'triangle' ? color : 'transparent'};
      ${shapeStyle}
      opacity: 0.9;
      z-index: ${config.zIndex - 1};
      pointer-events: none;
      --rotation: ${rotation}deg;
      --drift: ${drift}px;
      animation: confetti-fall ${duration}s linear ${delay}s infinite;
    `;
    
    container.appendChild(confetti);
  }
}

/**
 * Start fireworks effect
 * @param {number} intensity - 0 to 1 (affects frequency and particle count)
 * @param {Object} config - Configuration overrides
 */
export function start(intensity = 0.5, config = {}) {
  if (isRunning && Math.abs(intensity - currentIntensity) < 0.1) {
    return;
  }
  
  currentIntensity = intensity;
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Create containers
  createContainer();
  createConfettiContainer();
  
  // Clear existing
  clear();
  
  // Start confetti
  createConfetti(mergedConfig);
  
  // Start fireworks
  const interval = Math.max(300, mergedConfig.fireworkInterval * (1.5 - intensity));
  
  // Create initial firework
  createFirework(mergedConfig);
  
  // Continue creating fireworks
  fireworkInterval = setInterval(() => {
    if (isRunning) {
      createFirework(mergedConfig);
    }
  }, interval);
  
  isRunning = true;
  console.log(`[NewYearEffects] Started fireworks with intensity ${intensity.toFixed(2)}`);
}

/**
 * Stop all effects
 */
export function stop() {
  isRunning = false;
  
  if (fireworkInterval) {
    clearInterval(fireworkInterval);
    fireworkInterval = null;
  }
  
  clear();
  
  if (effectsContainer) {
    effectsContainer.remove();
    effectsContainer = null;
  }
  
  if (confettiContainer) {
    confettiContainer.remove();
    confettiContainer = null;
  }
  
  console.log('[NewYearEffects] Stopped all effects');
}

/**
 * Clear all particles
 */
function clear() {
  if (effectsContainer) {
    effectsContainer.innerHTML = '';
  }
  if (confettiContainer) {
    confettiContainer.innerHTML = '';
  }
}

/**
 * Update intensity
 * @param {number} intensity - New intensity value
 */
export function updateIntensity(intensity) {
  if (!isRunning) return;
  
  if (Math.abs(intensity - currentIntensity) >= 0.2) {
    start(intensity);
  }
}

/**
 * Check if effects are running
 */
export function isActive() {
  return isRunning;
}

/**
 * Create a burst of fireworks (for special moments like midnight)
 */
export function celebrationBurst() {
  const burstCount = 10;
  
  for (let i = 0; i < burstCount; i++) {
    setTimeout(() => {
      createFirework({ ...DEFAULT_CONFIG, particlesPerExplosion: 80 });
    }, i * 200);
  }
}

export default {
  start,
  stop,
  updateIntensity,
  isActive,
  celebrationBurst
};
