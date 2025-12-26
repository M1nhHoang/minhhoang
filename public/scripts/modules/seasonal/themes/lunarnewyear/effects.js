/**
 * Lunar New Year - Effects
 * Fireworks shooting from bottom up (pháo hoa bắn từ dưới lên)
 * 
 * Performance optimizations:
 * - Page Visibility API to pause when tab is hidden
 * - Object pooling for DOM elements
 * - Throttled animation frame
 * - Automatic cleanup on page unload
 */

// Lunar New Year color palette - traditional Vietnamese Tết colors
const COLORS = [
  '#FF0000',   // Red - Đỏ (chủ đạo)
  '#FFD700',   // Gold - Vàng
  '#FF6B6B',   // Light red - Đỏ nhạt
  '#FFA500',   // Orange - Cam
  '#FF69B4',   // Pink - Hồng (màu hoa đào)
  '#FFFF00',   // Yellow - Vàng chanh
  '#FF4500',   // Red-orange - Đỏ cam
];

const DEFAULT_CONFIG = {
  minParticleSize: 3,
  maxParticleSize: 6,
  particlesPerFirework: 30,  // Reduced from 40
  trailParticles: 6,         // Reduced from 8
  gravity: 0.15,
  friction: 0.99,
  zIndex: 9999,
  maxParticles: 200,         // Limit total particles
  poolSize: 250              // Object pool size
};

let container = null;
let isRunning = false;
let isPaused = false;        // For visibility API
let currentIntensity = 0.5;
let fireworkInterval = null;
let animationFrame = null;
let activeParticles = [];
let activeRockets = [];

// Object pool for particle elements
const particlePool = [];
const rocketPool = [];
const trailPool = [];

/**
 * Random helper
 */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Get element from pool or create new one
 */
function getPooledElement(pool, className) {
  if (pool.length > 0) {
    const el = pool.pop();
    el.style.display = 'block';
    return el;
  }
  
  const el = document.createElement('div');
  el.className = className;
  return el;
}

/**
 * Return element to pool
 */
function returnToPool(pool, el, maxSize = DEFAULT_CONFIG.poolSize) {
  if (pool.length < maxSize) {
    el.style.display = 'none';
    pool.push(el);
  } else {
    el.remove();
  }
}

/**
 * Create container for effects
 */
function createContainer() {
  if (container) return container;
  
  container = document.createElement('div');
  container.className = 'lunarnewyear-effects-container';
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);
  
  return container;
}

/**
 * Handle page visibility change - pause/resume effects
 */
function handleVisibilityChange() {
  if (document.hidden) {
    isPaused = true;
    // Clear interval when hidden
    if (fireworkInterval) {
      clearInterval(fireworkInterval);
      fireworkInterval = null;
    }
    console.log('[Lunar New Year Effects] Tạm dừng - tab ẩn');
  } else {
    isPaused = false;
    // Restart interval when visible
    if (isRunning && !fireworkInterval) {
      startFireworkInterval();
    }
    console.log('[Lunar New Year Effects] Tiếp tục - tab hiện');
  }
}

/**
 * Start firework launch interval
 */
function startFireworkInterval() {
  if (fireworkInterval) return;
  
  const minInterval = 800;   // Slower minimum (was 500)
  const maxInterval = 3500;  // Slower max (was 3000)
  const interval = maxInterval - (currentIntensity * (maxInterval - minInterval));
  
  fireworkInterval = setInterval(() => {
    if (isRunning && !isPaused) {
      launchFirework();
      
      // Sometimes launch multiple fireworks at high intensity
      if (currentIntensity > 0.7 && Math.random() > 0.6) {
        setTimeout(launchFirework, random(150, 400));
      }
    }
  }, interval);
}

/**
 * Create a firework rocket (shoots from bottom up)
 */
function createFireworkRocket() {
  const startX = random(10, 90); // Random horizontal position (%)
  const targetY = random(20, 50); // Explosion height (% from top)
  
  const rocket = {
    x: (startX / 100) * window.innerWidth,
    y: window.innerHeight + 20, // Start below screen
    targetY: (targetY / 100) * window.innerHeight,
    vx: random(-1, 1),
    vy: -random(12, 16), // Slightly slower upward velocity
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    trail: [],
    exploded: false,
    el: null
  };
  
  return rocket;
}

/**
 * Create explosion particles
 */
function createExplosionParticles(x, y, color) {
  const particles = [];
  const particleCount = DEFAULT_CONFIG.particlesPerFirework;
  
  // Check if we're at max capacity
  if (activeParticles.length > DEFAULT_CONFIG.maxParticles) {
    // Clean up oldest particles
    const toRemove = activeParticles.splice(0, 50);
    toRemove.forEach(p => {
      if (p.el) {
        returnToPool(particlePool, p.el);
      }
    });
  }
  
  // Main explosion particles
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const velocity = random(3, 7);
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity + random(-0.5, 0.5),
      vy: Math.sin(angle) * velocity + random(-0.5, 0.5),
      color,
      size: random(DEFAULT_CONFIG.minParticleSize, DEFAULT_CONFIG.maxParticleSize),
      life: 1,
      decay: random(0.015, 0.03),
      type: 'explosion',
      el: null
    });
  }
  
  // Sparkle particles (smaller, faster decay) - reduced count
  for (let i = 0; i < 12; i++) {
    const angle = random(0, Math.PI * 2);
    const velocity = random(5, 10);
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      color: '#FFFFFF',
      size: random(1, 2.5),
      life: 1,
      decay: random(0.04, 0.06),
      type: 'sparkle',
      el: null
    });
  }
  
  return particles;
}

/**
 * Render a particle to DOM using object pooling
 */
function renderParticle(particle) {
  const el = getPooledElement(particlePool, `firework-particle firework-${particle.type}`);
  el.style.cssText = `
    position: fixed;
    left: ${particle.x}px;
    top: ${particle.y}px;
    width: ${particle.size}px;
    height: ${particle.size}px;
    background: ${particle.color};
    border-radius: 50%;
    pointer-events: none;
    z-index: ${DEFAULT_CONFIG.zIndex};
    box-shadow: 0 0 ${particle.size * 2}px ${particle.color};
    opacity: ${particle.life};
    will-change: transform, opacity;
  `;
  
  if (!el.parentNode) {
    container.appendChild(el);
  }
  
  particle.el = el;
}

/**
 * Update and render rocket trail
 */
function updateRocket(rocket) {
  // Add trail particle
  rocket.trail.push({
    x: rocket.x,
    y: rocket.y,
    size: random(2, 3),
    life: 1,
    el: null
  });
  
  // Keep trail short
  while (rocket.trail.length > DEFAULT_CONFIG.trailParticles) {
    const old = rocket.trail.shift();
    if (old.el) {
      returnToPool(trailPool, old.el);
    }
  }
  
  // Apply physics
  rocket.x += rocket.vx;
  rocket.y += rocket.vy;
  rocket.vy += DEFAULT_CONFIG.gravity * 0.5;
  
  // Check if reached target height
  if (rocket.y <= rocket.targetY) {
    return true; // Should explode
  }
  
  return false;
}

/**
 * Render rocket and trail using object pooling
 */
function renderRocket(rocket) {
  // Render trail
  rocket.trail.forEach((t, i) => {
    if (!t.el) {
      t.el = getPooledElement(trailPool, 'rocket-trail');
      if (!t.el.parentNode) {
        container.appendChild(t.el);
      }
    }
    
    const opacity = (i / rocket.trail.length) * 0.7;
    t.el.style.cssText = `
      position: fixed;
      left: ${t.x}px;
      top: ${t.y}px;
      width: ${t.size}px;
      height: ${t.size}px;
      background: ${rocket.color};
      border-radius: 50%;
      pointer-events: none;
      z-index: ${DEFAULT_CONFIG.zIndex - 1};
      opacity: ${opacity};
      box-shadow: 0 0 ${t.size * 2}px ${rocket.color};
    `;
  });
  
  // Render rocket head
  if (!rocket.el) {
    rocket.el = getPooledElement(rocketPool, 'rocket-head');
    if (!rocket.el.parentNode) {
      container.appendChild(rocket.el);
    }
  }
  
  rocket.el.style.cssText = `
    position: fixed;
    left: ${rocket.x}px;
    top: ${rocket.y}px;
    width: 5px;
    height: 8px;
    background: linear-gradient(to top, ${rocket.color}, #fff);
    border-radius: 50% 50% 30% 30%;
    pointer-events: none;
    z-index: ${DEFAULT_CONFIG.zIndex};
    box-shadow: 0 0 8px ${rocket.color}, 0 0 15px ${rocket.color};
  `;
}

/**
 * Clean up rocket DOM elements
 */
function cleanupRocket(rocket) {
  if (rocket.el) {
    returnToPool(rocketPool, rocket.el);
    rocket.el = null;
  }
  rocket.trail.forEach(t => {
    if (t.el) {
      returnToPool(trailPool, t.el);
      t.el = null;
    }
  });
  rocket.trail = [];
}

/**
 * Update particle physics
 */
function updateParticle(particle) {
  particle.x += particle.vx;
  particle.y += particle.vy;
  particle.vy += DEFAULT_CONFIG.gravity;
  particle.vx *= DEFAULT_CONFIG.friction;
  particle.vy *= DEFAULT_CONFIG.friction;
  particle.life -= particle.decay;
  
  if (particle.el) {
    particle.el.style.left = particle.x + 'px';
    particle.el.style.top = particle.y + 'px';
    particle.el.style.opacity = particle.life;
    particle.el.style.transform = `scale(${particle.life})`;
  }
  
  return particle.life > 0;
}

/**
 * Launch a single firework
 */
function launchFirework() {
  if (isPaused || !isRunning) return;
  
  const rocket = createFireworkRocket();
  activeRockets.push(rocket);
  
  function animateRocket() {
    if (!isRunning || isPaused) {
      cleanupRocket(rocket);
      return;
    }
    
    const shouldExplode = updateRocket(rocket);
    renderRocket(rocket);
    
    if (shouldExplode) {
      // Clean up rocket
      cleanupRocket(rocket);
      
      // Remove from active rockets
      const idx = activeRockets.indexOf(rocket);
      if (idx > -1) activeRockets.splice(idx, 1);
      
      // Create explosion
      const explosionParticles = createExplosionParticles(rocket.x, rocket.y, rocket.color);
      explosionParticles.forEach(p => {
        renderParticle(p);
        activeParticles.push(p);
      });
      
      // Play visual "boom" effect
      createExplosionFlash(rocket.x, rocket.y, rocket.color);
      
      return;
    }
    
    if (isRunning && !isPaused && rocket.y > -50) {
      requestAnimationFrame(animateRocket);
    } else {
      cleanupRocket(rocket);
    }
  }
  
  animateRocket();
}

/**
 * Create explosion flash effect
 */
function createExplosionFlash(x, y, color) {
  const flash = document.createElement('div');
  flash.className = 'explosion-flash';
  flash.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: 8px;
    height: 8px;
    background: ${color};
    border-radius: 50%;
    pointer-events: none;
    z-index: ${DEFAULT_CONFIG.zIndex + 1};
    animation: explosion-flash 0.25s ease-out forwards;
    box-shadow: 0 0 25px ${color}, 0 0 50px ${color};
  `;
  container.appendChild(flash);
  
  setTimeout(() => flash.remove(), 250);
}

/**
 * Main animation loop for particles
 */
let lastFrameTime = 0;
const targetFPS = 30; // Limit to 30 FPS for performance
const frameInterval = 1000 / targetFPS;

function animationLoop(currentTime) {
  if (!isRunning) return;
  
  // Skip frame if paused or not enough time elapsed
  if (isPaused) {
    animationFrame = requestAnimationFrame(animationLoop);
    return;
  }
  
  const deltaTime = currentTime - lastFrameTime;
  
  if (deltaTime >= frameInterval) {
    lastFrameTime = currentTime - (deltaTime % frameInterval);
    
    // Update all active particles
    activeParticles = activeParticles.filter(particle => {
      const alive = updateParticle(particle);
      if (!alive && particle.el) {
        returnToPool(particlePool, particle.el);
        particle.el = null;
      }
      return alive;
    });
  }
  
  animationFrame = requestAnimationFrame(animationLoop);
}

/**
 * Start fireworks effect
 * @param {number} intensity - 0 to 1
 */
export function start(intensity = 0.5) {
  if (isRunning) {
    updateIntensity(intensity);
    return;
  }
  
  currentIntensity = intensity;
  isRunning = true;
  isPaused = false;
  
  createContainer();
  
  // Add visibility change listener
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Add beforeunload cleanup
  window.addEventListener('beforeunload', cleanup);
  
  // Start firework interval
  startFireworkInterval();
  
  // Start animation loop
  lastFrameTime = performance.now();
  animationLoop(lastFrameTime);
  
  // Launch initial firework
  launchFirework();
  
  console.log(`[Lunar New Year Effects] Pháo hoa bắt đầu! 🎆 Cường độ: ${(intensity * 100).toFixed(0)}%`);
}

/**
 * Cleanup function for page unload
 */
function cleanup() {
  stop();
  
  // Clear all pools
  particlePool.forEach(el => el.remove());
  rocketPool.forEach(el => el.remove());
  trailPool.forEach(el => el.remove());
  particlePool.length = 0;
  rocketPool.length = 0;
  trailPool.length = 0;
}

/**
 * Stop fireworks effect
 */
export function stop() {
  isRunning = false;
  isPaused = false;
  
  // Remove event listeners
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('beforeunload', cleanup);
  
  if (fireworkInterval) {
    clearInterval(fireworkInterval);
    fireworkInterval = null;
  }
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  
  // Clean up all active rockets
  activeRockets.forEach(rocket => cleanupRocket(rocket));
  activeRockets = [];
  
  // Clean up all particles - return to pool
  activeParticles.forEach(p => {
    if (p.el) {
      returnToPool(particlePool, p.el);
      p.el = null;
    }
  });
  activeParticles = [];
  
  // Remove container
  if (container) {
    container.remove();
    container = null;
  }
  
  console.log('[Lunar New Year Effects] Pháo hoa dừng 🛑');
}

/**
 * Update effect intensity
 */
export function updateIntensity(intensity) {
  if (!isRunning) return;
  
  if (Math.abs(intensity - currentIntensity) >= 0.2) {
    stop();
    start(intensity);
  }
}

/**
 * Check if effects are active
 */
export function isActive() {
  return isRunning;
}

/**
 * Trigger celebration burst (multiple fireworks at once)
 */
export function celebrationBurst() {
  if (!container) createContainer();
  
  // Launch 4-6 fireworks rapidly (reduced from 5-8)
  const burstCount = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < burstCount; i++) {
    setTimeout(() => launchFirework(), i * 200);
  }
  
  console.log('[Lunar New Year Effects] Chúc Mừng Năm Mới! 🎊🎆');
}

export default {
  start,
  stop,
  updateIntensity,
  isActive,
  celebrationBurst
};
