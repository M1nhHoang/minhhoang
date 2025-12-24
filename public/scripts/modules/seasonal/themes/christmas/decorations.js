/**
 * Christmas Theme - Decorations
 * Adds Santa hats, snow on icons, and other festive decorations
 */

// Track decorated elements
const decoratedElements = new Set();

/**
 * Decoration configs
 */
const DECORATIONS = {
  santaHat: {
    selector: '.site-nav__link--profile img, .profile-card__media img',
    className: 'christmas-santa-hat'
  },
  snowCap: {
    selector: '.social-button i, .profile-card__meta i, .chip i',
    className: 'christmas-snow-cap'
  },
  iconSnow: {
    selector: '.fa',
    className: 'christmas-icon-snow'
  }
};

/**
 * Create Santa hat overlay for avatars
 */
function createSantaHat(targetImg) {
  const wrapper = document.createElement('div');
  wrapper.className = 'santa-hat-wrapper';
  
  const hat = document.createElement('div');
  hat.className = 'santa-hat';
  hat.innerHTML = `
    <svg viewBox="0 0 100 60" class="santa-hat-svg">
      <!-- Hat base (red) -->
      <path d="M10 55 Q15 30 50 25 Q85 30 90 55 Z" fill="#d42426"/>
      <!-- White fur trim -->
      <ellipse cx="50" cy="55" rx="45" ry="8" fill="#fff"/>
      <!-- Hat top curve -->
      <path d="M50 25 Q70 10 85 20 Q75 5 60 8 Q50 0 40 8 Q25 5 15 20 Q30 10 50 25" fill="#d42426"/>
      <!-- Pompom -->
      <circle cx="85" cy="15" r="10" fill="#fff"/>
      <!-- Fur details -->
      <ellipse cx="50" cy="55" rx="42" ry="5" fill="#f0f0f0" opacity="0.5"/>
    </svg>
  `;
  
  // Wrap the image
  const parent = targetImg.parentElement;
  parent.insertBefore(wrapper, targetImg);
  wrapper.appendChild(targetImg);
  wrapper.appendChild(hat);
  
  return wrapper;
}

/**
 * Apply Santa hats to avatars/profile images
 */
export function applySantaHats() {
  const images = document.querySelectorAll(DECORATIONS.santaHat.selector);
  
  images.forEach(img => {
    if (decoratedElements.has(img)) return;
    
    // Skip if already has hat
    if (img.closest('.santa-hat-wrapper')) return;
    
    createSantaHat(img);
    decoratedElements.add(img);
  });
  
  console.log(`[ChristmasDecorations] Applied ${images.length} Santa hats`);
}

/**
 * Remove Santa hats
 */
export function removeSantaHats() {
  document.querySelectorAll('.santa-hat-wrapper').forEach(wrapper => {
    const img = wrapper.querySelector('img');
    if (img) {
      wrapper.parentElement.insertBefore(img, wrapper);
    }
    wrapper.remove();
  });
  
  decoratedElements.clear();
}

/**
 * Add snow effect to icons
 */
export function applyIconSnow() {
  // Add class to body for CSS-based snow effects on icons
  document.body.classList.add('christmas-icons-decorated');
}

/**
 * Remove icon snow
 */
export function removeIconSnow() {
  document.body.classList.remove('christmas-icons-decorated');
}

/**
 * Add festive glow to buttons and cards
 */
export function applyFestiveGlow() {
  document.body.classList.add('christmas-festive-glow');
}

/**
 * Remove festive glow
 */
export function removeFestiveGlow() {
  document.body.classList.remove('christmas-festive-glow');
}

/**
 * Create floating ornaments
 */
export function createOrnaments() {
  const container = document.createElement('div');
  container.className = 'christmas-ornaments-container';
  container.setAttribute('aria-hidden', 'true');
  
  const ornamentColors = ['#d42426', '#2d5a27', '#c4a000', '#1e88e5'];
  const ornamentCount = 5;
  
  for (let i = 0; i < ornamentCount; i++) {
    const ornament = document.createElement('div');
    ornament.className = 'christmas-ornament';
    ornament.style.cssText = `
      left: ${10 + (i * 20)}%;
      animation-delay: ${i * 0.5}s;
      --ornament-color: ${ornamentColors[i % ornamentColors.length]};
    `;
    container.appendChild(ornament);
  }
  
  document.body.appendChild(container);
}

/**
 * Remove ornaments
 */
export function removeOrnaments() {
  document.querySelectorAll('.christmas-ornaments-container').forEach(c => c.remove());
}

/**
 * Create corner decorations - Santa sleigh and clouds
 */
export function createCornerDecorations() {
  // Top-left: Santa with sleigh and reindeer
  const topLeft = document.createElement('div');
  topLeft.className = 'christmas-corner christmas-corner--top-left';
  topLeft.innerHTML = `
    <svg viewBox="0 0 280 100" class="christmas-santa-sleigh">
      <!-- Reindeer 1 (front) -->
      <g class="reindeer reindeer-1">
        <ellipse cx="40" cy="55" rx="12" ry="8" fill="#8B4513"/>
        <circle cx="30" cy="48" r="6" fill="#8B4513"/>
        <ellipse cx="28" cy="50" rx="3" ry="2" fill="#D2691E"/>
        <circle cx="27" cy="47" r="1.5" fill="#000"/>
        <circle cx="29" cy="44" r="2" fill="#d42426"/>
        <!-- Antlers -->
        <path d="M32 42 Q35 35 32 30 M32 42 Q38 38 40 32" stroke="#5D4037" stroke-width="2" fill="none"/>
        <!-- Legs -->
        <line x1="35" y1="62" x2="33" y2="75" stroke="#8B4513" stroke-width="2"/>
        <line x1="45" y1="62" x2="47" y2="75" stroke="#8B4513" stroke-width="2"/>
      </g>
      
      <!-- Reindeer 2 -->
      <g class="reindeer reindeer-2">
        <ellipse cx="75" cy="52" rx="14" ry="9" fill="#A0522D"/>
        <circle cx="63" cy="44" r="7" fill="#A0522D"/>
        <ellipse cx="60" cy="46" rx="3" ry="2" fill="#D2691E"/>
        <circle cx="59" cy="43" r="1.5" fill="#000"/>
        <circle cx="61" cy="40" r="2" fill="#d42426"/>
        <!-- Antlers -->
        <path d="M65 38 Q68 30 65 24 M65 38 Q72 32 75 25" stroke="#5D4037" stroke-width="2" fill="none"/>
        <!-- Legs -->
        <line x1="68" y1="60" x2="66" y2="75" stroke="#A0522D" stroke-width="2"/>
        <line x1="82" y1="60" x2="84" y2="75" stroke="#A0522D" stroke-width="2"/>
      </g>
      
      <!-- Reins -->
      <path d="M50 52 Q80 48 110 55" stroke="#8B0000" stroke-width="1.5" fill="none"/>
      <path d="M88 50 Q105 48 120 52" stroke="#8B0000" stroke-width="1.5" fill="none"/>
      
      <!-- Sleigh -->
      <g class="sleigh">
        <path d="M110 45 Q100 45 95 55 L95 70 Q95 78 105 78 L180 78 Q195 78 195 70 L195 55 Q195 45 185 45 Z" fill="#d42426"/>
        <path d="M95 75 Q85 80 80 85 Q95 82 110 80" fill="#8B0000"/>
        <path d="M195 75 Q205 80 210 85 Q195 82 180 80" fill="#8B0000"/>
        <rect x="100" y="50" width="90" height="25" fill="#c41e22" rx="3"/>
        <rect x="100" y="50" width="90" height="5" fill="#ffd700"/>
      </g>
      
      <!-- Santa -->
      <g class="santa">
        <!-- Body -->
        <ellipse cx="150" cy="42" rx="20" ry="15" fill="#d42426"/>
        <rect x="135" y="30" width="30" height="25" fill="#d42426" rx="5"/>
        <!-- Belt -->
        <rect x="135" y="45" width="30" height="6" fill="#2a2a2a"/>
        <rect x="147" y="44" width="8" height="8" fill="#ffd700" rx="1"/>
        <!-- Head -->
        <circle cx="150" cy="20" r="12" fill="#FFDAB9"/>
        <!-- Beard -->
        <ellipse cx="150" cy="28" rx="10" ry="8" fill="#fff"/>
        <circle cx="143" cy="26" r="4" fill="#fff"/>
        <circle cx="157" cy="26" r="4" fill="#fff"/>
        <!-- Face -->
        <circle cx="146" cy="18" r="1.5" fill="#000"/>
        <circle cx="154" cy="18" r="1.5" fill="#000"/>
        <circle cx="150" cy="22" r="2" fill="#ffb6c1"/>
        <path d="M145 25 Q150 28 155 25" stroke="#d42426" stroke-width="1" fill="none"/>
        <!-- Hat -->
        <path d="M138 15 Q140 5 150 3 Q160 5 162 15 Z" fill="#d42426"/>
        <ellipse cx="150" cy="15" rx="14" ry="3" fill="#fff"/>
        <circle cx="165" cy="5" r="5" fill="#fff"/>
        <!-- Arm waving -->
        <ellipse cx="175" cy="35" rx="6" ry="4" fill="#d42426" transform="rotate(-30, 175, 35)"/>
        <circle cx="180" cy="32" r="4" fill="#fff"/>
      </g>
      
      <!-- Gift bag -->
      <ellipse cx="125" cy="45" rx="12" ry="15" fill="#2d5a27"/>
      <path d="M118 35 Q125 30 132 35" stroke="#ffd700" stroke-width="2" fill="none"/>
    </svg>
  `;
  
  document.body.appendChild(topLeft);
  
  // Create floating clouds across the header
  createHeaderClouds();
}

/**
 * Create soft clouds across the header area with natural random distribution
 */
function createHeaderClouds() {
  const container = document.createElement('div');
  container.className = 'christmas-clouds-container';
  container.setAttribute('aria-hidden', 'true');
  
  // Generate clouds with natural distribution
  const clouds = generateNaturalClouds();
  
  clouds.forEach((config) => {
    const cloud = document.createElement('div');
    cloud.className = 'header-cloud';
    cloud.style.cssText = `
      left: ${config.left}%;
      top: ${config.top}px;
      width: ${config.width}px;
      height: ${config.height}px;
      opacity: ${config.opacity};
      animation-delay: ${config.delay}s;
      animation-duration: ${config.duration}s;
    `;
    cloud.innerHTML = createCloudSVG();
    container.appendChild(cloud);
  });
  
  document.body.appendChild(container);
}

/**
 * Generate clouds with natural random distribution
 * Designer approach: Create dreamy winter sky atmosphere
 * With collision avoidance to prevent overlapping
 */
function generateNaturalClouds() {
  const clouds = [];
  
  // Random helper
  const random = (min, max) => Math.random() * (max - min) + min;
  const randomInt = (min, max) => Math.floor(random(min, max + 1));
  
  /**
   * Check if a new cloud overlaps with existing clouds
   * Allow slight overlap for natural layering effect
   */
  const checkOverlap = (newCloud, existingClouds) => {
    const overlapThreshold = 0.40; // Max 40% overlap allowed
    
    for (const cloud of existingClouds) {
      const newLeft = newCloud.left;
      const newRight = newCloud.left + (newCloud.width / 14);
      const existLeft = cloud.left;
      const existRight = cloud.left + (cloud.width / 14);
      
      // Calculate horizontal overlap
      const overlapLeft = Math.max(newLeft, existLeft);
      const overlapRight = Math.min(newRight, existRight);
      const horizontalOverlap = Math.max(0, overlapRight - overlapLeft);
      const minWidth = Math.min(newRight - newLeft, existRight - existLeft);
      
      if (horizontalOverlap / minWidth > overlapThreshold) {
        // Check vertical overlap too
        const newTop = newCloud.top;
        const newBottom = newCloud.top + newCloud.height * 0.5;
        const existTop = cloud.top;
        const existBottom = cloud.top + cloud.height * 0.5;
        
        const verticalOverlap = !(newBottom < existTop || newTop > existBottom);
        
        if (verticalOverlap) {
          return true;
        }
      }
    }
    return false;
  };
  
  /**
   * Try to place a cloud, adjusting position if overlap detected
   */
  const placeCloud = (config, maxAttempts = 10) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const cloud = { ...config };
      
      if (attempt > 0) {
        cloud.left = Math.max(10, Math.min(90, config.left + random(-12, 12)));
        cloud.top = randomInt(-8, 20);
      }
      
      if (!checkOverlap(cloud, clouds)) {
        clouds.push(cloud);
        return true;
      }
    }
    // Place anyway if can't find non-overlapping spot (with adjusted opacity)
    const cloud = { ...config, opacity: config.opacity * 0.7 };
    clouds.push(cloud);
    return true;
  };
  
  // === DESIGN: DREAMY WINTER SKY ===
  
  // Layer 1: Soft background wisps (create atmospheric depth)
  const bgCount = randomInt(5, 7);
  for (let i = 0; i < bgCount; i++) {
    const baseLeft = (i / bgCount) * 85 + 8;
    placeCloud({
      left: baseLeft + random(-4, 4),
      top: randomInt(-10, 8),
      width: randomInt(70, 110),
      height: randomInt(35, 55),
      opacity: random(0.15, 0.28),
      delay: random(0, 6),
      duration: randomInt(28, 40),
      layer: 'bg'
    });
  }
  
  // Layer 2: Main cloud layer (prominent, evenly distributed)
  const midCount = randomInt(6, 8);
  for (let i = 0; i < midCount; i++) {
    const basePos = (i / midCount) * 82 + 10;
    placeCloud({
      left: basePos + random(-3, 3),
      top: randomInt(-5, 15),
      width: randomInt(120, 170),
      height: randomInt(60, 85),
      opacity: random(0.35, 0.55),
      delay: random(0, 5),
      duration: randomInt(22, 32),
      layer: 'mid'
    });
  }
  
  // Layer 3: Hero clouds (large, eye-catching accents)
  const heroPositions = [15, 35, 55, 75, 92];
  const heroCount = randomInt(3, 4);
  const selectedHeroes = heroPositions.sort(() => Math.random() - 0.5).slice(0, heroCount);
  
  selectedHeroes.forEach(baseLeft => {
    placeCloud({
      left: baseLeft + random(-3, 3),
      top: randomInt(0, 12),
      width: randomInt(150, 200),
      height: randomInt(75, 100),
      opacity: random(0.45, 0.65),
      delay: random(0, 4),
      duration: randomInt(20, 28),
      layer: 'hero'
    });
  });
  
  return clouds;
}

/**
 * Create a soft fluffy cloud SVG
 */
function createCloudSVG() {
  return `
    <svg viewBox="0 0 100 50" class="cloud-svg">
      <defs>
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1"/>
          <stop offset="100%" style="stop-color:#e8f4fc;stop-opacity:0.8"/>
        </linearGradient>
        <filter id="cloudSoft">
          <feGaussianBlur stdDeviation="1" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#cloudSoft)">
        <ellipse cx="50" cy="30" rx="35" ry="18" fill="url(#cloudGrad)"/>
        <ellipse cx="30" cy="32" rx="22" ry="14" fill="url(#cloudGrad)"/>
        <ellipse cx="70" cy="32" rx="22" ry="14" fill="url(#cloudGrad)"/>
        <ellipse cx="40" cy="25" rx="18" ry="12" fill="#fff"/>
        <ellipse cx="60" cy="25" rx="18" ry="12" fill="#fff"/>
        <ellipse cx="50" cy="22" rx="15" ry="10" fill="#fff"/>
      </g>
    </svg>
  `;
}

/**
 * Remove corner decorations
 */
export function removeCornerDecorations() {
  document.querySelectorAll('.christmas-corner').forEach(c => c.remove());
  document.querySelectorAll('.christmas-clouds-container').forEach(c => c.remove());
}

/**
 * Create Christmas trees at the bottom of the screen
 */
export function createChristmasTrees() {
  // Remove existing trees
  removeChristmasTrees();
  
  const container = document.createElement('div');
  container.className = 'christmas-trees-container';
  container.setAttribute('aria-hidden', 'true');
  
  // Add ground snow first
  const groundSnow = document.createElement('div');
  groundSnow.className = 'christmas-ground-snow';
  container.appendChild(groundSnow);
  
  // Generate more trees with randomization
  const trees = [];
  
  // Left side trees (more dense)
  const leftPositions = [-3, 2, 6, 10, 14, 18, 22, 26];
  leftPositions.forEach((left, i) => {
    const height = 100 + Math.random() * 120;
    const isDecorated = Math.random() > 0.4; // 60% chance to be decorated
    const zIndex = Math.floor(Math.random() * 3) + 1;
    trees.push({ left, height, z: zIndex, type: isDecorated ? 'decorated' : 'simple' });
  });
  
  // Right side trees (more dense)
  const rightPositions = [74, 78, 82, 86, 90, 94, 98, 102];
  rightPositions.forEach((left, i) => {
    const height = 100 + Math.random() * 120;
    const isDecorated = Math.random() > 0.4; // 60% chance to be decorated
    const zIndex = Math.floor(Math.random() * 3) + 1;
    trees.push({ left, height, z: zIndex, type: isDecorated ? 'decorated' : 'simple' });
  });
  
  // Sort by z-index so trees in back are rendered first
  trees.sort((a, b) => a.z - b.z);
  
  trees.forEach((config, index) => {
    const tree = document.createElement('div');
    tree.className = `christmas-tree christmas-tree--${config.type}`;
    tree.style.cssText = `
      left: ${config.left}%;
      height: ${config.height}px;
      z-index: ${config.z};
    `;
    
    if (config.type === 'decorated') {
      tree.innerHTML = createDecoratedTreeSVG(index);
    } else {
      tree.innerHTML = createSimpleTreeSVG(index);
    }
    
    container.appendChild(tree);
  });
  
  // Add more snow mounds
  for (let i = 0; i < 8; i++) {
    const mound = document.createElement('div');
    mound.className = 'christmas-snow-mound';
    const side = i < 4 ? (i * 8 + 2) : (70 + (i - 4) * 8);
    mound.style.left = `${side}%`;
    mound.style.width = `${40 + Math.random() * 50}px`;
    container.appendChild(mound);
  }
  
  document.body.appendChild(container);
  console.log('[ChristmasDecorations] Created Christmas trees');
}

/**
 * Create decorated tree SVG with lights and ornaments
 */
function createDecoratedTreeSVG(index) {
  const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff8a5b', '#a8e6cf'];
  const lightColor = colors[index % colors.length];
  
  return `
    <svg viewBox="0 0 100 150" class="christmas-tree-svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="treeGrad${index}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#1a472a"/>
          <stop offset="50%" style="stop-color:#2d5a27"/>
          <stop offset="100%" style="stop-color:#1a472a"/>
        </linearGradient>
        <filter id="glow${index}">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="snowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff"/>
          <stop offset="100%" style="stop-color:#e8f4fc"/>
        </linearGradient>
      </defs>
      
      <!-- Shadow -->
      <ellipse cx="50" cy="145" rx="25" ry="4" fill="rgba(0,0,0,0.1)"/>
      
      <!-- Trunk -->
      <rect x="42" y="125" width="16" height="20" fill="#5d4037" rx="2"/>
      <rect x="44" y="125" width="4" height="20" fill="#6d5047" rx="1"/>
      
      <!-- Tree layers with gradient -->
      <polygon points="50,8 25,50 75,50" fill="url(#treeGrad${index})"/>
      <polygon points="50,30 20,80 80,80" fill="url(#treeGrad${index})"/>
      <polygon points="50,55 15,115 85,115" fill="url(#treeGrad${index})"/>
      <polygon points="50,80 12,130 88,130" fill="url(#treeGrad${index})"/>
      
      <!-- Snow patches -->
      <path d="M50,8 Q55,20 48,25 Q42,22 50,8" fill="url(#snowGrad)"/>
      <path d="M35,45 Q50,42 65,48 L60,50 Q50,46 40,50 Z" fill="url(#snowGrad)" opacity="0.9"/>
      <path d="M28,75 Q50,70 72,78 L65,80 Q50,74 35,80 Z" fill="url(#snowGrad)" opacity="0.85"/>
      <path d="M20,110 Q50,102 80,112 L72,115 Q50,108 28,115 Z" fill="url(#snowGrad)" opacity="0.8"/>
      
      <!-- Twinkling lights -->
      <circle cx="35" cy="42" r="3" fill="#ff6b6b" filter="url(#glow${index})" class="tree-light"/>
      <circle cx="62" cy="38" r="2.5" fill="#ffe66d" filter="url(#glow${index})" class="tree-light" style="animation-delay: 0.3s"/>
      <circle cx="30" cy="68" r="3" fill="#4ecdc4" filter="url(#glow${index})" class="tree-light" style="animation-delay: 0.6s"/>
      <circle cx="55" cy="62" r="2.5" fill="#ff8a5b" filter="url(#glow${index})" class="tree-light" style="animation-delay: 0.9s"/>
      <circle cx="72" cy="72" r="3" fill="#a8e6cf" filter="url(#glow${index})" class="tree-light" style="animation-delay: 1.2s"/>
      <circle cx="25" cy="98" r="3" fill="#ffe66d" filter="url(#glow${index})" class="tree-light" style="animation-delay: 0.4s"/>
      <circle cx="50" cy="88" r="2.5" fill="#ff6b6b" filter="url(#glow${index})" class="tree-light" style="animation-delay: 0.7s"/>
      <circle cx="75" cy="95" r="3" fill="#4ecdc4" filter="url(#glow${index})" class="tree-light" style="animation-delay: 1s"/>
      <circle cx="35" cy="118" r="2.5" fill="#ff8a5b" filter="url(#glow${index})" class="tree-light" style="animation-delay: 0.5s"/>
      <circle cx="65" cy="122" r="3" fill="#a8e6cf" filter="url(#glow${index})" class="tree-light" style="animation-delay: 0.8s"/>
      
      <!-- Ornaments -->
      <circle cx="42" cy="55" r="5" fill="#d42426" stroke="#ffd700" stroke-width="0.5"/>
      <circle cx="60" cy="85" r="5" fill="#1e88e5" stroke="#fff" stroke-width="0.5"/>
      <circle cx="38" cy="105" r="5" fill="#9c27b0" stroke="#ffd700" stroke-width="0.5"/>
      <circle cx="68" cy="108" r="4" fill="#d42426" stroke="#fff" stroke-width="0.5"/>
      
      <!-- Star on top -->
      <g transform="translate(50, 5)" filter="url(#glow${index})">
        <polygon points="0,-8 2,-2 8,-2 3,2 5,8 0,4 -5,8 -3,2 -8,-2 -2,-2" fill="#ffd700" class="tree-star"/>
      </g>
      
      <!-- Snow on ground -->
      <ellipse cx="50" cy="145" rx="30" ry="5" fill="url(#snowGrad)"/>
    </svg>
  `;
}

/**
 * Create simple tree SVG (background trees)
 */
function createSimpleTreeSVG(index) {
  return `
    <svg viewBox="0 0 80 120" class="christmas-tree-svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="simpleTreeGrad${index}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#1a3d2e"/>
          <stop offset="50%" style="stop-color:#234d38"/>
          <stop offset="100%" style="stop-color:#1a3d2e"/>
        </linearGradient>
      </defs>
      
      <!-- Trunk -->
      <rect x="34" y="100" width="12" height="15" fill="#4a3728" rx="1"/>
      
      <!-- Tree silhouette -->
      <polygon points="40,5 20,45 60,45" fill="url(#simpleTreeGrad${index})"/>
      <polygon points="40,25 15,70 65,70" fill="url(#simpleTreeGrad${index})"/>
      <polygon points="40,50 10,105 70,105" fill="url(#simpleTreeGrad${index})"/>
      
      <!-- Snow on top -->
      <path d="M40,5 Q45,15 38,20 Q35,15 40,5" fill="#fff" opacity="0.8"/>
      <path d="M25,42 Q40,38 55,44 L50,46 Q40,42 30,46 Z" fill="#fff" opacity="0.7"/>
      <path d="M18,68 Q40,62 62,70 L55,72 Q40,66 25,72 Z" fill="#fff" opacity="0.6"/>
      
      <!-- Snow at base -->
      <ellipse cx="40" cy="115" rx="22" ry="4" fill="#fff"/>
    </svg>
  `;
}

/**
 * Remove Christmas trees
 */
export function removeChristmasTrees() {
  document.querySelectorAll('.christmas-trees-container').forEach(c => c.remove());
}

/**
 * Apply snow caps to buttons and profile card
 */
export function applyButtonSnowCaps() {
  document.body.classList.add('christmas-snow-buttons');
  
  // Add SVG snow to profile card
  addSnowToProfileCard();
  
  console.log('[ChristmasDecorations] Applied snow caps to buttons and profile card');
}

/**
 * Remove snow caps from buttons and profile card
 */
export function removeButtonSnowCaps() {
  document.body.classList.remove('christmas-snow-buttons');
  removeSnowFromProfileCard();
}

/**
 * Add realistic SVG snow pile to profile card
 */
function addSnowToProfileCard() {
  const profileCard = document.querySelector('.profile-card');
  if (!profileCard) return;
  
  // Remove existing snow
  removeSnowFromProfileCard();
  
  // Get card's border radius
  const cardStyle = getComputedStyle(profileCard);
  const borderRadius = parseInt(cardStyle.borderRadius) || 16;
  
  const snowContainer = document.createElement('div');
  snowContainer.className = 'profile-snow-svg';
  snowContainer.setAttribute('aria-hidden', 'true');
  
  // Create realistic snow pile SVG that follows card's rounded corners
  snowContainer.innerHTML = `
    <svg viewBox="0 0 500 45" preserveAspectRatio="none" class="snow-pile-svg">
      <defs>
        <linearGradient id="snowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1"/>
          <stop offset="60%" style="stop-color:#f8faff;stop-opacity:1"/>
          <stop offset="100%" style="stop-color:#e8f0f8;stop-opacity:0.95"/>
        </linearGradient>
        <filter id="snowSoft" x="-2%" y="-2%" width="104%" height="104%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.3"/>
        </filter>
      </defs>
      
      <!-- Snow pile with rounded corners matching card -->
      <path d="
        M0 45
        L0 28
        C0 22, 8 18, 20 20
        Q50 26, 80 14
        Q120 4, 160 18
        Q200 28, 250 12
        Q300 2, 350 16
        Q400 26, 440 14
        Q470 8, 490 20
        C500 22, 500 26, 500 32
        L500 45
        Z
      " fill="url(#snowGradient)" filter="url(#snowSoft)"/>
      
      <!-- Top snow texture for depth -->
      <path d="
        M20 22
        Q60 28, 100 18
        Q150 10, 200 22
        Q250 30, 300 16
        Q350 6, 400 20
        Q450 28, 480 20
      " fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
    
    <!-- Icicles hanging from snow -->
    <svg viewBox="0 0 500 20" preserveAspectRatio="none" class="snow-icicles-svg">
      <defs>
        <linearGradient id="icicleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1"/>
          <stop offset="100%" style="stop-color:#dce8f4;stop-opacity:0.5"/>
        </linearGradient>
      </defs>
      <path d="M60 0 Q63 8 60 14 Q57 8 60 0" fill="url(#icicleGrad)"/>
      <path d="M130 0 Q134 11 130 18 Q126 11 130 0" fill="url(#icicleGrad)"/>
      <path d="M200 0 Q202 5 200 9 Q198 5 200 0" fill="url(#icicleGrad)"/>
      <path d="M280 0 Q284 10 280 17 Q276 10 280 0" fill="url(#icicleGrad)"/>
      <path d="M360 0 Q362 6 360 10 Q358 6 360 0" fill="url(#icicleGrad)"/>
      <path d="M430 0 Q434 9 430 15 Q426 9 430 0" fill="url(#icicleGrad)"/>
    </svg>
  `;
  
  profileCard.insertBefore(snowContainer, profileCard.firstChild);
}

/**
 * Remove SVG snow from profile card
 */
function removeSnowFromProfileCard() {
  document.querySelectorAll('.profile-snow-svg').forEach(el => el.remove());
}

/**
 * Check if it's currently nighttime (6 PM - 6 AM)
 */
function isNightTime() {
  const hour = new Date().getHours();
  return hour < 6 || hour >= 18;
}

/**
 * Apply day/night mode based on current time
 */
export function applyDayNightMode() {
  const isNight = isNightTime();
  
  document.body.classList.toggle('christmas-night', isNight);
  document.body.classList.toggle('christmas-day', !isNight);
  
  console.log(`[ChristmasDecorations] Applied ${isNight ? 'night' : 'day'} mode`);
}

/**
 * Remove day/night mode
 */
export function removeDayNightMode() {
  document.body.classList.remove('christmas-night', 'christmas-day');
}

/**
 * Start auto day/night updates (checks every 5 minutes)
 */
let dayNightInterval = null;

export function startDayNightUpdates() {
  applyDayNightMode();
  
  // Update every 5 minutes
  dayNightInterval = setInterval(applyDayNightMode, 5 * 60 * 1000);
}

export function stopDayNightUpdates() {
  if (dayNightInterval) {
    clearInterval(dayNightInterval);
    dayNightInterval = null;
  }
  removeDayNightMode();
}

/**
 * Apply all decorations
 */
export function applyAll() {
  applySantaHats();
  applyIconSnow();
  applyFestiveGlow();
  createCornerDecorations();
  createChristmasTrees();
  applyButtonSnowCaps();
  startDayNightUpdates();
}

/**
 * Remove all decorations
 */
export function removeAll() {
  removeSantaHats();
  removeIconSnow();
  removeFestiveGlow();
  removeOrnaments();
  removeCornerDecorations();
  removeChristmasTrees();
  removeButtonSnowCaps();
  stopDayNightUpdates();
  decoratedElements.clear();
}

export default {
  applySantaHats,
  removeSantaHats,
  applyIconSnow,
  removeIconSnow,
  applyFestiveGlow,
  removeFestiveGlow,
  createOrnaments,
  removeOrnaments,
  createCornerDecorations,
  removeCornerDecorations,
  createChristmasTrees,
  removeChristmasTrees,
  applyButtonSnowCaps,
  removeButtonSnowCaps,
  applyDayNightMode,
  removeDayNightMode,
  startDayNightUpdates,
  stopDayNightUpdates,
  applyAll,
  removeAll
};
