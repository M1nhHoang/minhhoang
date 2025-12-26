/**
 * Lunar New Year - Decorations
 * Mai & Đào garden (vườn mai đào), peach blossoms (hoa đào), lucky money envelopes (bao lì xì)
 */

const decoratedElements = new Set();

/**
 * Create peach blossom tree (cây đào) SVG - Pink blossoms
 */
function createPeachTreeSVG(height, scale) {
  const h = height;
  const branchColor = '#5D3A1A';
  const branchShadow = '#3c2a16';
  const blossomColor1 = '#FFB7C5'; // Light pink
  const blossomColor2 = '#FF69B4'; // Hot pink
  const centerColor = '#FFD700';   // Gold center
  
  return `
    <svg class="tree-svg peach-tree" viewBox="0 0 100 ${h}" xmlns="http://www.w3.org/2000/svg" 
         style="transform: scale(${scale});">
      <defs>
        <linearGradient id="peach-trunk" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${branchColor}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="${branchShadow}" stop-opacity="0.9" />
        </linearGradient>
      </defs>
      
      <!-- Main trunk -->
      <path d="M50 ${h} Q48 ${h*0.72} 52 ${h*0.52} Q54 ${h*0.32} 50 ${h*0.14}" 
            stroke="url(#peach-trunk)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      
      <!-- Branches with slight curvature -->
      <path d="M50 ${h*0.62} Q34 ${h*0.45} 24 ${h*0.53}" 
            stroke="${branchColor}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <path d="M52 ${h*0.46} Q66 ${h*0.35} 78 ${h*0.42}" 
            stroke="${branchColor}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M50 ${h*0.36} Q38 ${h*0.25} 30 ${h*0.32}" 
            stroke="${branchColor}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M51 ${h*0.24} Q60 ${h*0.17} 70 ${h*0.22}" 
            stroke="${branchColor}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      
      <!-- Blossoms clusters -->
      ${createPeachCluster(50, h*0.12, 6, blossomColor1, blossomColor2, centerColor)}
      ${createPeachCluster(28, h*0.48, 5.5, blossomColor1, blossomColor2, centerColor)}
      ${createPeachCluster(32, h*0.28, 4.5, blossomColor1, blossomColor2, centerColor)}
      ${createPeachCluster(72, h*0.38, 5.5, blossomColor1, blossomColor2, centerColor)}
      ${createPeachCluster(65, h*0.2, 4.5, blossomColor1, blossomColor2, centerColor)}
      ${createPeachCluster(42, h*0.22, 4, blossomColor1, blossomColor2, centerColor)}
      ${createPeachCluster(56, h*0.32, 4.2, blossomColor1, blossomColor2, centerColor)}
      ${createPeachCluster(38, h*0.42, 4, blossomColor1, blossomColor2, centerColor)}
    </svg>
  `;
}

function createPeachCluster(cx, cy, r, c1, c2, center) {
  return `
    <g class="blossom-group">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${c1}" class="blossom-pulse"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="${c2}"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.25}" fill="${center}"/>
    </g>
  `;
}

/**
 * Create yellow apricot tree (cây mai) SVG - Yellow/Gold blossoms
 */
function createMaiTreeSVG(height, scale) {
  const h = height;
  const branchColor = '#4A3728';
  const branchShadow = '#3b2a1f';
  const blossomColor1 = '#FFD700'; // Gold
  const blossomColor2 = '#FFA500'; // Orange accent
  
  return `
    <svg class="tree-svg mai-tree" viewBox="0 0 100 ${h}" xmlns="http://www.w3.org/2000/svg"
         style="transform: scale(${scale});">
      <defs>
        <linearGradient id="mai-trunk" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${branchColor}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="${branchShadow}" stop-opacity="0.9" />
        </linearGradient>
      </defs>
      
      <!-- Main trunk -->
      <path d="M50 ${h} Q46 ${h*0.66} 48 ${h*0.46} Q50 ${h*0.3} 52 ${h*0.1}" 
            stroke="url(#mai-trunk)" stroke-width="5.2" fill="none" stroke-linecap="round"/>
      
      <!-- Branches -->
      <path d="M48 ${h*0.56} Q30 ${h*0.4} 18 ${h*0.46}" 
            stroke="${branchColor}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M49 ${h*0.4} Q70 ${h*0.28} 82 ${h*0.36}" 
            stroke="${branchColor}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <path d="M50 ${h*0.3} Q34 ${h*0.2} 26 ${h*0.26}" 
            stroke="${branchColor}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M51 ${h*0.2} Q62 ${h*0.12} 72 ${h*0.18}" 
            stroke="${branchColor}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      
      <!-- 5-petal mai blossoms -->
      <g class="mai-blossom blossom-group">
        ${createMaiFlower(52, h*0.1, 7, blossomColor1, blossomColor2)}
      </g>
      <g class="mai-blossom blossom-group">
        ${createMaiFlower(22, h*0.43, 6, blossomColor1, blossomColor2)}
      </g>
      <g class="mai-blossom blossom-group">
        ${createMaiFlower(75, h*0.33, 5.5, blossomColor1, blossomColor2)}
      </g>
      <g class="mai-blossom blossom-group">
        ${createMaiFlower(30, h*0.23, 5.2, blossomColor1, blossomColor2)}
      </g>
      <g class="mai-blossom blossom-group">
        ${createMaiFlower(68, h*0.14, 4.5, blossomColor1, blossomColor2)}
      </g>
      
      <!-- Additional small blossoms -->
      ${createMaiScatter(40, h*0.35, 3, blossomColor1)}
      ${createMaiScatter(58, h*0.25, 3.6, blossomColor1)}
      ${createMaiScatter(45, h*0.48, 2.6, blossomColor1)}
    </svg>
  `;
}

/**
 * Create 5-petal mai flower
 */
function createMaiFlower(cx, cy, size, c1, c2) {
  const petals = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * Math.PI / 180;
    const px = cx + Math.cos(angle) * size * 0.7;
    const py = cy + Math.sin(angle) * size * 0.7;
    petals.push(`<ellipse cx="${px}" cy="${py}" rx="${size*0.5}" ry="${size*0.38}" 
                          fill="${c1}" transform="rotate(${i*72-90} ${px} ${py})" class="blossom-pulse"/>`);
  }
  return `
    ${petals.join('')}
    <circle cx="${cx}" cy="${cy}" r="${size*0.3}" fill="${c2}"/>
    <circle cx="${cx}" cy="${cy}" r="${size*0.16}" fill="#8B4513"/>
  `;
}

function createMaiScatter(cx, cy, r, c1) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c1}" opacity="0.9"/>`;
}

/**
 * Create lucky envelope (bao lì xì) SVG
 */
function createLuckyEnvelopeSVG() {
  return `
    <svg class="lucky-envelope-svg" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
      <!-- Envelope body -->
      <rect x="5" y="10" width="50" height="65" rx="3" fill="#FF0000"/>
      <rect x="8" y="13" width="44" height="59" rx="2" fill="#CC0000"/>
      
      <!-- Flap -->
      <path d="M5 10 L30 30 L55 10" fill="#FF0000" stroke="#FFD700" stroke-width="1"/>
      
      <!-- Gold decoration -->
      <circle cx="30" cy="45" r="15" fill="#FFD700"/>
      <text x="30" y="52" text-anchor="middle" fill="#FF0000" 
            font-size="16" font-weight="bold" font-family="serif">福</text>
      
      <!-- Border decoration -->
      <rect x="5" y="10" width="50" height="65" rx="3" 
            fill="none" stroke="#FFD700" stroke-width="2"/>
    </svg>
  `;
}

/**
 * Create peach blossom branch SVG for corners
 */
function createPeachBlossomSVG() {
  return `
    <svg class="peach-blossom-svg" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <!-- Branch -->
      <path d="M50 120 Q45 80 55 60 Q60 40 50 10" 
            stroke="#5D3A1A" stroke-width="3" fill="none"/>
      <path d="M50 70 Q35 55 25 60" 
            stroke="#5D3A1A" stroke-width="2" fill="none"/>
      <path d="M55 50 Q70 35 75 40" 
            stroke="#5D3A1A" stroke-width="2" fill="none"/>
      
      <!-- Blossoms -->
      <g class="blossom blossom-1">
        <circle cx="50" cy="15" r="8" fill="#FFB7C5"/>
        <circle cx="50" cy="15" r="4" fill="#FF69B4"/>
        <circle cx="50" cy="15" r="2" fill="#FFD700"/>
      </g>
      <g class="blossom blossom-2">
        <circle cx="30" cy="55" r="7" fill="#FFB7C5"/>
        <circle cx="30" cy="55" r="3.5" fill="#FF69B4"/>
        <circle cx="30" cy="55" r="1.5" fill="#FFD700"/>
      </g>
      <g class="blossom blossom-3">
        <circle cx="70" cy="38" r="6" fill="#FFB7C5"/>
        <circle cx="70" cy="38" r="3" fill="#FF69B4"/>
        <circle cx="70" cy="38" r="1.2" fill="#FFD700"/>
      </g>
      <g class="blossom blossom-4">
        <circle cx="45" cy="35" r="5" fill="#FFB7C5"/>
        <circle cx="45" cy="35" r="2.5" fill="#FF69B4"/>
        <circle cx="45" cy="35" r="1" fill="#FFD700"/>
      </g>
      
      <!-- Falling petals -->
      <circle class="petal petal-1" cx="40" cy="25" r="2" fill="#FFB7C5" opacity="0.8"/>
      <circle class="petal petal-2" cx="60" cy="45" r="1.5" fill="#FFB7C5" opacity="0.7"/>
      <circle class="petal petal-3" cx="35" cy="70" r="2" fill="#FFB7C5" opacity="0.6"/>
    </svg>
  `;
}

/**
 * Create Mai & Dao garden at the bottom of the screen
 */
export function createTreeGarden() {
  // Remove existing garden if any
  removeTreeGarden();
  
  const gardenContainer = document.createElement('div');
  gardenContainer.className = 'lunarnewyear-garden';
  gardenContainer.setAttribute('aria-hidden', 'true');
  
  // Generate random trees
  const treeCount = Math.floor(Math.random() * 7) + 10; // 10-16 trees
  const trees = [];
  const positions = [];
  const minDistance = 6; // percent spacing to reduce overlap
  
  for (let i = 0; i < treeCount; i++) {
    const isMai = Math.random() > 0.45; // Slightly more mai
    const height = 130 + Math.random() * 80; // 130-210 height
    const scale = 0.7 + Math.random() * 0.5; // 0.7-1.2 scale
    const posBase = (i / Math.max(treeCount - 1, 1)) * 90 + 5;
    let posX = Math.min(95, Math.max(5, posBase + (Math.random() - 0.5) * 8));
    // Simple separation to avoid overlap: nudge until far enough from existing
    let attempts = 0;
    while (attempts < 8) {
      const tooClose = positions.some(p => Math.abs(p - posX) < minDistance);
      if (!tooClose) break;
      posX = Math.min(95, Math.max(5, posX + (Math.random() - 0.5) * 6));
      attempts++;
    }
    positions.push(posX);
    const zIndex = Math.floor(Math.random() * 3) + 1; // Layering for depth
    
    trees.push({
      isMai,
      height,
      scale,
      posX,
      zIndex
    });
  }
  
  // Sort by zIndex for proper layering (back to front)
  trees.sort((a, b) => a.zIndex - b.zIndex);
  
  trees.forEach((tree, index) => {
    const treeWrapper = document.createElement('div');
    treeWrapper.className = `garden-tree ${tree.isMai ? 'mai' : 'dao'}`;
    treeWrapper.style.cssText = `
      position: absolute;
      bottom: 0;
      left: ${tree.posX}%;
      transform: translateX(-50%);
      z-index: ${tree.zIndex};
      opacity: ${0.7 + tree.zIndex * 0.1};
      filter: ${tree.zIndex === 1 ? 'brightness(0.8)' : 'none'};
      animation: tree-sway ${3 + Math.random() * 2}s ease-in-out infinite;
      animation-delay: ${Math.random() * 2}s;
    `;
    
    treeWrapper.innerHTML = tree.isMai 
      ? createMaiTreeSVG(tree.height, tree.scale)
      : createPeachTreeSVG(tree.height, tree.scale);
    
    gardenContainer.appendChild(treeWrapper);
  });
  
  document.body.appendChild(gardenContainer);
  
  console.log(`[Lunar New Year] Created garden with ${treeCount} trees (Mai & Đào) 🌸🌼`);
}

/**
 * Remove tree garden
 */
export function removeTreeGarden() {
  document.querySelectorAll('.lunarnewyear-garden').forEach(el => el.remove());
}

/**
 * Create peach blossom corner decorations
 */
export function createPeachBlossomCorners() {
  // Left corner - peach blossom
  const leftCorner = document.createElement('div');
  leftCorner.className = 'lunarnewyear-corner lunarnewyear-corner--left';
  leftCorner.setAttribute('aria-hidden', 'true');
  leftCorner.innerHTML = createPeachBlossomSVG();
  document.body.appendChild(leftCorner);
  
  // Right corner - lucky envelope
  const rightCorner = document.createElement('div');
  rightCorner.className = 'lunarnewyear-corner lunarnewyear-corner--right';
  rightCorner.setAttribute('aria-hidden', 'true');
  rightCorner.innerHTML = createLuckyEnvelopeSVG();
  document.body.appendChild(rightCorner);
}

/**
 * Remove corner decorations
 */
export function removePeachBlossomCorners() {
  document.querySelectorAll('.lunarnewyear-corner').forEach(el => el.remove());
}

/**
 * Create floating peach petals
 */
export function createFloatingPetals() {
  const container = document.createElement('div');
  container.className = 'lunarnewyear-petals-container';
  container.setAttribute('aria-hidden', 'true');
  
  const petalCount = 15;
  
  for (let i = 0; i < petalCount; i++) {
    const petal = document.createElement('div');
    petal.className = 'floating-petal';
    
    // Mix of pink (đào) and yellow (mai) petals
    const isPink = Math.random() > 0.4;
    
    const size = 8 + Math.random() * 8;
    const startX = Math.random() * 100;
    const duration = 8 + Math.random() * 7;
    const delay = Math.random() * 10;
    
    petal.style.cssText = `
      --petal-size: ${size}px;
      --petal-color: ${isPink ? '#FFB7C5' : '#FFD700'};
      --start-x: ${startX}%;
      --fall-duration: ${duration}s;
      --fall-delay: ${delay}s;
      --drift: ${(Math.random() - 0.5) * 100}px;
      --rotation: ${Math.random() * 720}deg;
    `;
    
    container.appendChild(petal);
  }
  
  document.body.appendChild(container);
}

/**
 * Remove floating petals
 */
export function removeFloatingPetals() {
  document.querySelectorAll('.lunarnewyear-petals-container').forEach(el => el.remove());
}

/**
 * Apply body classes for CSS styling
 */
export function applyBodyClasses() {
  document.body.classList.add('lunarnewyear-active');
  document.body.classList.add('lunarnewyear-festive-glow');
}

/**
 * Remove body classes
 */
export function removeBodyClasses() {
  document.body.classList.remove('lunarnewyear-active');
  document.body.classList.remove('lunarnewyear-festive-glow');
}

/**
 * Apply all decorations
 */
export function applyAll() {
  createTreeGarden();      // Tree garden at bottom
  createPeachBlossomCorners();
  createFloatingPetals();
  applyBodyClasses();
  
  console.log('[Lunar New Year] All decorations applied! 🧧');
}

/**
 * Remove all decorations
 */
export function removeAll() {
  removeTreeGarden();
  removePeachBlossomCorners();
  removeFloatingPetals();
  removeBodyClasses();
  decoratedElements.clear();
  
  console.log('[Lunar New Year] All decorations removed');
}

export default {
  createTreeGarden,
  removeTreeGarden,
  createPeachBlossomCorners,
  removePeachBlossomCorners,
  createFloatingPetals,
  removeFloatingPetals,
  applyAll,
  removeAll
};
