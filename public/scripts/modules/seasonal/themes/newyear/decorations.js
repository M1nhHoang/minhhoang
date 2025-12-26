/**
 * New Year Theme - Decorations
 * Adds sparkles, party hats, and festive decorations
 */

// Track decorated elements
const decoratedElements = new Set();

/**
 * Decoration configs
 */
const DECORATIONS = {
  partyHat: {
    selector: '.site-nav__link--profile img, .profile-card__media img',
    className: 'newyear-party-hat'
  }
};

/**
 * Create party hat overlay for avatars
 */
function createPartyHat(targetImg) {
  const wrapper = document.createElement('div');
  wrapper.className = 'party-hat-wrapper';
  
  const hat = document.createElement('div');
  hat.className = 'party-hat';
  hat.innerHTML = `
    <svg viewBox="0 0 100 80" class="party-hat-svg">
      <!-- Party hat cone -->
      <defs>
        <linearGradient id="partyHatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#9b59b6"/>
          <stop offset="50%" style="stop-color:#e74c3c"/>
          <stop offset="100%" style="stop-color:#f39c12"/>
        </linearGradient>
      </defs>
      <!-- Hat body -->
      <polygon points="50,5 20,75 80,75" fill="url(#partyHatGradient)"/>
      <!-- Decorative stripes -->
      <line x1="35" y1="40" x2="30" y2="65" stroke="#ffd700" stroke-width="3"/>
      <line x1="50" y1="10" x2="50" y2="70" stroke="#ffd700" stroke-width="2" opacity="0.6"/>
      <line x1="65" y1="40" x2="70" y2="65" stroke="#ffd700" stroke-width="3"/>
      <!-- Pompom on top -->
      <circle cx="50" cy="8" r="8" fill="#ffd700"/>
      <circle cx="47" cy="5" r="3" fill="#fff" opacity="0.6"/>
      <!-- Elastic band -->
      <ellipse cx="50" cy="75" rx="32" ry="5" fill="#333" opacity="0.3"/>
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
 * Apply party hats to avatars/profile images
 */
export function applyPartyHats() {
  const images = document.querySelectorAll(DECORATIONS.partyHat.selector);
  
  images.forEach(img => {
    if (decoratedElements.has(img)) return;
    
    // Skip if already has hat
    if (img.closest('.party-hat-wrapper')) return;
    
    createPartyHat(img);
    decoratedElements.add(img);
  });
  
  console.log(`[NewYearDecorations] Applied ${images.length} party hats`);
}

/**
 * Remove party hats
 */
export function removePartyHats() {
  document.querySelectorAll('.party-hat-wrapper').forEach(wrapper => {
    const img = wrapper.querySelector('img');
    if (img) {
      wrapper.parentElement.insertBefore(img, wrapper);
    }
    wrapper.remove();
  });
  
  decoratedElements.clear();
}

/**
 * Add sparkle effect to icons
 */
export function applySparkleEffect() {
  document.body.classList.add('newyear-sparkle-icons');
}

/**
 * Remove sparkle effect
 */
export function removeSparkleEffect() {
  document.body.classList.remove('newyear-sparkle-icons');
}

/**
 * Add festive glow to buttons and cards
 */
export function applyFestiveGlow() {
  document.body.classList.add('newyear-festive-glow');
}

/**
 * Remove festive glow
 */
export function removeFestiveGlow() {
  document.body.classList.remove('newyear-festive-glow');
}

/**
 * Create corner decorations with balloons and streamers
 */
export function createCornerDecorations() {
  // Create left corner decoration
  const leftCorner = document.createElement('div');
  leftCorner.className = 'newyear-corner newyear-corner--left';
  leftCorner.setAttribute('aria-hidden', 'true');
  leftCorner.innerHTML = `
    <svg viewBox="0 0 150 200" width="100" height="150">
      <!-- Balloons -->
      <ellipse cx="40" cy="50" rx="25" ry="30" fill="#e74c3c" opacity="0.9"/>
      <ellipse cx="38" cy="45" rx="8" ry="10" fill="#fff" opacity="0.3"/>
      <path d="M40 80 Q42 90 38 95" stroke="#e74c3c" stroke-width="2" fill="none"/>
      
      <ellipse cx="80" cy="35" rx="22" ry="28" fill="#9b59b6" opacity="0.9"/>
      <ellipse cx="78" cy="30" rx="7" ry="9" fill="#fff" opacity="0.3"/>
      <path d="M80 63 Q82 75 78 85" stroke="#9b59b6" stroke-width="2" fill="none"/>
      
      <ellipse cx="115" cy="55" rx="20" ry="25" fill="#f39c12" opacity="0.9"/>
      <ellipse cx="113" cy="50" rx="6" ry="8" fill="#fff" opacity="0.3"/>
      <path d="M115 80 Q117 90 113 98" stroke="#f39c12" stroke-width="2" fill="none"/>
      
      <!-- Strings -->
      <path d="M38 95 L50 180" stroke="#333" stroke-width="1" opacity="0.5"/>
      <path d="M78 85 L50 180" stroke="#333" stroke-width="1" opacity="0.5"/>
      <path d="M113 98 L50 180" stroke="#333" stroke-width="1" opacity="0.5"/>
    </svg>
  `;
  
  // Create right corner decoration (stars)
  const rightCorner = document.createElement('div');
  rightCorner.className = 'newyear-corner newyear-corner--right';
  rightCorner.setAttribute('aria-hidden', 'true');
  rightCorner.innerHTML = `
    <svg viewBox="0 0 120 120" width="80" height="80">
      <!-- Stars -->
      <polygon points="60,5 68,40 105,40 75,60 85,95 60,75 35,95 45,60 15,40 52,40" 
               fill="#ffd700" opacity="0.9"/>
      <polygon points="25,15 29,28 42,28 31,36 35,49 25,41 15,49 19,36 8,28 21,28" 
               fill="#f39c12" opacity="0.8"/>
      <polygon points="95,70 98,78 106,78 100,83 102,91 95,86 88,91 90,83 84,78 92,78" 
               fill="#e74c3c" opacity="0.8"/>
    </svg>
  `;
  
  document.body.appendChild(leftCorner);
  document.body.appendChild(rightCorner);
}

/**
 * Remove corner decorations
 */
export function removeCornerDecorations() {
  document.querySelectorAll('.newyear-corner').forEach(el => el.remove());
}

/**
 * Create "Happy New Year" banner (optional, for special moments)
 */
export function createNewYearBanner() {
  const banner = document.createElement('div');
  banner.className = 'newyear-banner';
  banner.setAttribute('aria-hidden', 'true');
  banner.innerHTML = `
    <span class="newyear-banner__text">🎉 Happy New Year 2025! 🎊</span>
  `;
  
  document.body.appendChild(banner);
  
  // Auto-hide after animation
  setTimeout(() => {
    banner.classList.add('newyear-banner--hide');
    setTimeout(() => banner.remove(), 1000);
  }, 5000);
}

/**
 * Create countdown display (shows time until midnight on Dec 31)
 */
export function createCountdown() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  
  // Only show countdown on Dec 31 before midnight
  if (month !== 11 || day !== 31) return;
  
  const countdown = document.createElement('div');
  countdown.className = 'newyear-countdown';
  countdown.setAttribute('aria-live', 'polite');
  countdown.innerHTML = `
    <div class="newyear-countdown__label">Countdown to ${year + 1}</div>
    <div class="newyear-countdown__time">
      <span class="newyear-countdown__hours">00</span>:
      <span class="newyear-countdown__minutes">00</span>:
      <span class="newyear-countdown__seconds">00</span>
    </div>
  `;
  
  document.body.appendChild(countdown);
  
  // Update countdown every second
  const updateCountdown = () => {
    const now = new Date();
    const midnight = new Date(year + 1, 0, 1, 0, 0, 0);
    const diff = midnight - now;
    
    if (diff <= 0) {
      countdown.remove();
      createNewYearBanner();
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    countdown.querySelector('.newyear-countdown__hours').textContent = String(hours).padStart(2, '0');
    countdown.querySelector('.newyear-countdown__minutes').textContent = String(minutes).padStart(2, '0');
    countdown.querySelector('.newyear-countdown__seconds').textContent = String(seconds).padStart(2, '0');
  };
  
  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);
  
  // Store interval for cleanup
  countdown.dataset.interval = interval;
}

/**
 * Remove countdown
 */
export function removeCountdown() {
  const countdown = document.querySelector('.newyear-countdown');
  if (countdown) {
    const interval = countdown.dataset.interval;
    if (interval) clearInterval(parseInt(interval));
    countdown.remove();
  }
}

/**
 * Apply all decorations
 */
export function applyAll() {
  applyPartyHats();
  applySparkleEffect();
  applyFestiveGlow();
  createCornerDecorations();
  createCountdown();
  
  // Add theme class to body
  document.body.classList.add('theme-newyear');
  
  console.log('[NewYearDecorations] All decorations applied');
}

/**
 * Remove all decorations
 */
export function removeAll() {
  removePartyHats();
  removeSparkleEffect();
  removeFestiveGlow();
  removeCornerDecorations();
  removeCountdown();
  
  // Remove theme class and day/night classes
  document.body.classList.remove('theme-newyear', 'newyear-day', 'newyear-night');
  
  decoratedElements.clear();
  
  console.log('[NewYearDecorations] All decorations removed');
}

export default {
  applyPartyHats,
  removePartyHats,
  applySparkleEffect,
  removeSparkleEffect,
  applyFestiveGlow,
  removeFestiveGlow,
  createCornerDecorations,
  removeCornerDecorations,
  createNewYearBanner,
  applyAll,
  removeAll
};
