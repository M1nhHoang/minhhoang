# 🎨 Hướng Dẫn Thêm Sự Kiện Seasonal Theme

Tài liệu này hướng dẫn chi tiết cách thêm các sự kiện/theme mới vào hệ thống Seasonal Theme.

---

## 📋 Mục Lục

1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [Cấu Trúc Thư Mục](#2-cấu-trúc-thư-mục)
3. [Bước 1: Đăng Ký Sự Kiện](#3-bước-1-đăng-ký-sự-kiện)
4. [Bước 2: Tạo Theme Module](#4-bước-2-tạo-theme-module)
5. [Bước 3: Tạo CSS Styles](#5-bước-3-tạo-css-styles)
6. [Bước 4: Đăng Ký Theme](#6-bước-4-đăng-ký-theme)
7. [Theme Interface API](#7-theme-interface-api)
8. [Tích Hợp Weather](#8-tích-hợp-weather)
9. [Best Practices](#9-best-practices)
10. [Ví Dụ Hoàn Chỉnh: Valentine Theme](#10-ví-dụ-hoàn-chỉnh-valentine-theme)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────────────┐
│                         app.js                               │
│                    initSeasonal()                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   seasonal/index.js                          │
│              Đăng ký themes & khởi tạo                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│  date-detector  │ │   manager   │ │ weather-service │
│  Phát hiện ngày │ │ Quản lý     │ │ Lấy thời tiết   │
│  & sự kiện      │ │ themes      │ │ theo IP         │
└─────────────────┘ └──────┬──────┘ └─────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│   christmas/    │ │    tet/     │ │   valentine/    │
│   Theme 🎄      │ │  Theme 🧧   │ │   Theme 💕      │
└─────────────────┘ └─────────────┘ └─────────────────┘
```

### Luồng Hoạt Động

1. `app.js` gọi `initSeasonal()`
2. `seasonal/index.js` đăng ký tất cả themes với manager
3. `date-detector.js` xác định sự kiện/mùa hiện tại
4. `weather-service.js` lấy thông tin thời tiết
5. `seasonal-manager.js` apply theme phù hợp
6. Theme module khởi tạo decorations và effects

---

## 2. Cấu Trúc Thư Mục

```
public/
├── scripts/
│   └── modules/
│       └── seasonal/
│           ├── index.js                 # Entry point
│           ├── core/
│           │   ├── date-detector.js     # Phát hiện ngày/sự kiện
│           │   ├── seasonal-manager.js  # Quản lý themes
│           │   └── weather-service.js   # Lấy thời tiết
│           └── themes/
│               ├── christmas/           # 🎄 Theme Giáng Sinh
│               │   ├── index.js
│               │   ├── decorations.js
│               │   └── effects.js
│               ├── tet/                 # 🧧 Theme Tết (tạo mới)
│               │   ├── index.js
│               │   ├── decorations.js
│               │   └── effects.js
│               └── valentine/           # 💕 Theme Valentine (tạo mới)
│                   ├── index.js
│                   ├── decorations.js
│                   └── effects.js
└── styles/
    └── seasonal/
        ├── christmas.css
        ├── tet.css                      # (tạo mới)
        └── valentine.css                # (tạo mới)
```

---

## 3. Bước 1: Đăng Ký Sự Kiện

### File: `public/scripts/modules/seasonal/core/date-detector.js`

Thêm sự kiện mới vào object `EVENTS`:

```javascript
const EVENTS = {
  // ... existing events ...
  
  // ✨ THÊM SỰ KIỆN MỚI TẠI ĐÂY
  yourEvent: {
    id: 'yourEvent',           // ID duy nhất (camelCase)
    name: 'Tên Hiển Thị',      // Tên tiếng Việt
    priority: 90,              // Độ ưu tiên (xem bảng bên dưới)
    getDateRange: (year) => ({
      start: new Date(year, month - 1, day),  // Tháng 0-indexed!
      end: new Date(year, month - 1, day, 23, 59, 59)
    })
  }
};
```

### Bảng Priority

| Loại | Priority | Mô Tả |
|------|----------|-------|
| Sự kiện đặc biệt lớn | 100 | Christmas, Tết |
| Sự kiện đặc biệt | 90 | Valentine, Halloween |
| Sự kiện nhỏ | 80 | Quốc Khánh, v.v. |
| Mùa trong năm | 10 | Spring, Summer, Autumn, Winter |

> **Lưu ý:** Priority cao hơn sẽ được ưu tiên khi có nhiều sự kiện trùng ngày.

### Ví Dụ Các Loại Date Range

```javascript
// 1. Ngày cố định hàng năm
valentine: {
  id: 'valentine',
  name: 'Valentine',
  priority: 90,
  getDateRange: (year) => ({
    start: new Date(year, 1, 12),      // Feb 12 (tháng 1 = February)
    end: new Date(year, 1, 15, 23, 59, 59)  // Feb 15
  })
}

// 2. Ngày thay đổi theo năm (ví dụ: Tết Âm Lịch)
tet: {
  id: 'tet',
  name: 'Tết Nguyên Đán',
  priority: 100,
  getDateRange: (year) => {
    // Lookup table cho các năm
    const tetDates = {
      2025: { start: new Date(2025, 0, 25), end: new Date(2025, 1, 9) },
      2026: { start: new Date(2026, 1, 14), end: new Date(2026, 1, 28) },
      2027: { start: new Date(2027, 1, 3), end: new Date(2027, 1, 17) }
    };
    // Fallback cho năm chưa định nghĩa
    return tetDates[year] || { start: new Date(year, 0, 25), end: new Date(year, 1, 9) };
  }
}

// 3. Mùa (khoảng thời gian dài)
summer: {
  id: 'summer',
  name: 'Mùa Hè',
  priority: 10,
  getDateRange: (year) => ({
    start: new Date(year, 4, 16),      // May 16
    end: new Date(year, 7, 31, 23, 59, 59)  // Aug 31
  })
}

// 4. Sự kiện qua năm (ví dụ: Mùa Đông)
winter: {
  id: 'winter',
  name: 'Mùa Đông',
  priority: 10,
  getDateRange: (year) => ({
    start: new Date(year, 10, 16),     // Nov 16
    end: new Date(year + 1, 1, 14, 23, 59, 59)  // Feb 14 năm sau
  })
}
```

---

## 4. Bước 2: Tạo Theme Module

### 4.1. Tạo thư mục theme

```
public/scripts/modules/seasonal/themes/yourTheme/
├── index.js          # Main entry point
├── decorations.js    # Trang trí UI
└── effects.js        # Hiệu ứng động (particles, animations)
```

### 4.2. File `index.js` - Theme Entry Point

```javascript
/**
 * Your Theme Name
 * 🎨 Mô tả ngắn về theme
 */

import effects from './effects.js';
import decorations from './decorations.js';

// Theme configuration
const CONFIG = {
  id: 'yourTheme',           // PHẢI KHỚP với id trong date-detector.js
  name: 'Tên Theme 🎨',
  priority: 90,
  dateRange: {
    start: [2, 12],          // [month, day] - Feb 12
    end: [2, 15]             // [month, day] - Feb 15
  }
};

let isInitialized = false;
let currentWeather = null;

/**
 * Tính toán effect intensity dựa trên weather
 * @param {Object} weather - Weather data từ API
 * @returns {number} 0-1
 */
function calculateEffectIntensity(weather) {
  if (!weather?.effects) {
    return 0.5; // Default
  }
  
  // Customize logic theo theme của bạn
  const { intensity, isRainy, isSnowy } = weather.effects;
  
  // Ví dụ: Tăng intensity khi trời mưa
  if (isRainy) {
    return Math.max(0.6, intensity);
  }
  
  return 0.5;
}

/**
 * Khởi tạo theme
 * @param {Object} context - { weather: Object }
 */
async function init(context = {}) {
  if (isInitialized) return;
  
  console.log(`[${CONFIG.name}] Initializing...`);
  
  currentWeather = context.weather;
  
  // Load CSS
  await loadStyles();
  
  isInitialized = true;
  console.log(`[${CONFIG.name}] Ready!`);
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
  link.href = `/styles/seasonal/${CONFIG.id}.css`;
  
  return new Promise((resolve, reject) => {
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

/**
 * Apply visual effects
 * @param {Object} weather - Weather data
 */
async function applyEffects(weather) {
  currentWeather = weather;
  const intensity = calculateEffectIntensity(weather);
  
  console.log(`[${CONFIG.name}] Starting effects with intensity: ${intensity.toFixed(2)}`);
  
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
 * @param {Object} weather - New weather data
 */
function updateWeather(weather) {
  if (!isInitialized) return;
  
  currentWeather = weather;
  const intensity = calculateEffectIntensity(weather);
  
  effects.updateIntensity(intensity);
}

/**
 * Cleanup theme
 */
async function destroy() {
  console.log(`[${CONFIG.name}] Destroying...`);
  
  effects.stop();
  decorations.removeAll();
  
  // Remove CSS
  const styleEl = document.getElementById(`${CONFIG.id}-theme-styles`);
  if (styleEl) styleEl.remove();
  
  isInitialized = false;
  currentWeather = null;
  
  console.log(`[${CONFIG.name}] Goodbye!`);
}

/**
 * Get current state
 */
function getState() {
  return {
    isInitialized,
    weather: currentWeather,
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
```

### 4.3. File `decorations.js` - UI Decorations

```javascript
/**
 * Your Theme - Decorations
 * Adds visual decorations to the UI
 */

const decoratedElements = new Set();

/**
 * Decoration selectors
 */
const DECORATIONS = {
  profileImage: {
    selector: '.site-nav__link--profile img, .profile-card__media img',
    className: 'your-theme-decoration'
  }
};

/**
 * Apply decoration to profile images
 */
export function applyProfileDecorations() {
  const images = document.querySelectorAll(DECORATIONS.profileImage.selector);
  
  images.forEach(img => {
    if (decoratedElements.has(img)) return;
    
    // Tạo wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'your-decoration-wrapper';
    
    // Tạo decoration element
    const decoration = document.createElement('div');
    decoration.className = 'your-decoration';
    decoration.innerHTML = `
      <!-- SVG hoặc HTML cho decoration -->
      <svg viewBox="0 0 100 100">
        <!-- ... -->
      </svg>
    `;
    
    // Wrap element
    const parent = img.parentElement;
    parent.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    wrapper.appendChild(decoration);
    
    decoratedElements.add(img);
  });
  
  console.log(`[YourTheme] Applied decorations to ${images.length} elements`);
}

/**
 * Remove profile decorations
 */
export function removeProfileDecorations() {
  document.querySelectorAll('.your-decoration-wrapper').forEach(wrapper => {
    const img = wrapper.querySelector('img');
    if (img) {
      wrapper.parentElement.insertBefore(img, wrapper);
    }
    wrapper.remove();
  });
  
  decoratedElements.clear();
}

/**
 * Add corner decorations
 */
export function createCornerDecorations() {
  const corner = document.createElement('div');
  corner.className = 'your-theme-corner';
  corner.setAttribute('aria-hidden', 'true');
  corner.innerHTML = `
    <!-- Corner decoration SVG/HTML -->
  `;
  
  document.body.appendChild(corner);
}

/**
 * Remove corner decorations
 */
export function removeCornerDecorations() {
  document.querySelectorAll('.your-theme-corner').forEach(el => el.remove());
}

/**
 * Apply body classes for CSS styling
 */
export function applyBodyClasses() {
  document.body.classList.add('your-theme-active');
}

/**
 * Remove body classes
 */
export function removeBodyClasses() {
  document.body.classList.remove('your-theme-active');
}

/**
 * Apply all decorations
 */
export function applyAll() {
  applyProfileDecorations();
  createCornerDecorations();
  applyBodyClasses();
}

/**
 * Remove all decorations
 */
export function removeAll() {
  removeProfileDecorations();
  removeCornerDecorations();
  removeBodyClasses();
  decoratedElements.clear();
}

export default {
  applyProfileDecorations,
  removeProfileDecorations,
  createCornerDecorations,
  removeCornerDecorations,
  applyAll,
  removeAll
};
```

### 4.4. File `effects.js` - Visual Effects

```javascript
/**
 * Your Theme - Effects
 * Creates particle/animation effects
 */

const DEFAULT_CONFIG = {
  minSize: 5,
  maxSize: 15,
  minDuration: 5,
  maxDuration: 12,
  zIndex: 9999
};

let container = null;
let particles = [];
let isRunning = false;
let currentIntensity = 0.5;

/**
 * Random helper
 */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Calculate particle count based on intensity
 */
function getParticleCount(intensity) {
  const baseCount = 20;
  const maxCount = 100;
  return Math.floor(baseCount + (maxCount - baseCount) * intensity);
}

/**
 * Create particle container
 */
function createContainer() {
  if (container) return container;
  
  container = document.createElement('div');
  container.id = 'your-theme-effects-container';
  container.className = 'your-effects-container';
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);
  
  return container;
}

/**
 * Create a single particle
 */
function createParticle(config = DEFAULT_CONFIG) {
  const particle = document.createElement('div');
  particle.className = 'your-particle';
  
  const size = random(config.minSize, config.maxSize);
  const startX = random(0, 100);
  const duration = random(config.minDuration, config.maxDuration);
  const delay = random(0, 5);
  
  particle.style.cssText = `
    position: fixed;
    top: -20px;
    left: ${startX}%;
    width: ${size}px;
    height: ${size}px;
    animation: your-fall-animation ${duration}s linear ${delay}s infinite;
    z-index: ${config.zIndex};
    pointer-events: none;
  `;
  
  // Thêm content (icon, SVG, emoji, etc.)
  particle.innerHTML = '💕'; // Ví dụ: emoji
  
  return particle;
}

/**
 * Start effect
 * @param {number} intensity - 0 to 1
 * @param {Object} config - Config overrides
 */
export function start(intensity = 0.5, config = {}) {
  if (isRunning && Math.abs(intensity - currentIntensity) < 0.1) {
    return;
  }
  
  currentIntensity = intensity;
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  createContainer();
  clear();
  
  const count = getParticleCount(intensity);
  
  for (let i = 0; i < count; i++) {
    const particle = createParticle(mergedConfig);
    container.appendChild(particle);
    particles.push(particle);
  }
  
  isRunning = true;
  console.log(`[YourTheme Effects] Started with ${count} particles`);
}

/**
 * Stop effect
 */
export function stop() {
  isRunning = false;
  clear();
  
  if (container) {
    container.remove();
    container = null;
  }
  
  console.log('[YourTheme Effects] Stopped');
}

/**
 * Clear all particles
 */
function clear() {
  particles.forEach(p => p.remove());
  particles = [];
}

/**
 * Update intensity
 */
export function updateIntensity(intensity) {
  if (!isRunning) return;
  
  if (Math.abs(intensity - currentIntensity) >= 0.2) {
    start(intensity);
  }
}

/**
 * Check if running
 */
export function isActive() {
  return isRunning;
}

export default {
  start,
  stop,
  updateIntensity,
  isActive
};
```

---

## 5. Bước 3: Tạo CSS Styles

### File: `public/styles/seasonal/yourTheme.css`

```css
/**
 * Your Theme Styles 🎨
 */

/* ============================================
   CSS Variables
   ============================================ */
:root {
  --your-theme-primary: #ff69b4;
  --your-theme-secondary: #ff1493;
  --your-theme-accent: #ffc0cb;
}

/* ============================================
   Body Theme Class
   ============================================ */
body.theme-yourTheme {
  --color-primary: var(--your-theme-primary);
  background: linear-gradient(180deg, 
    var(--your-theme-accent) 0%, 
    var(--color-bg) 30%
  );
  transition: background 0.5s ease;
}

/* ============================================
   Effects Container
   ============================================ */
.your-effects-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

/* ============================================
   Particle Animation
   ============================================ */
@keyframes your-fall-animation {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.your-particle {
  will-change: transform;
  font-size: 1.5rem;
}

/* ============================================
   Decorations
   ============================================ */
.your-decoration-wrapper {
  position: relative;
  display: inline-block;
}

.your-decoration {
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  pointer-events: none;
  z-index: 10;
}

/* ============================================
   Corner Decorations
   ============================================ */
.your-theme-corner {
  position: fixed;
  pointer-events: none;
  z-index: 100;
}

/* ============================================
   UI Element Overrides
   ============================================ */
body.theme-yourTheme .social-button {
  background: rgba(255, 105, 180, 0.1);
}

body.theme-yourTheme .social-button:hover {
  background: rgba(255, 105, 180, 0.2);
  box-shadow: 0 0 15px rgba(255, 105, 180, 0.3);
}

/* ============================================
   Responsive
   ============================================ */
@media (max-width: 768px) {
  .your-decoration {
    width: 50%;
  }
}

/* ============================================
   Reduced Motion
   ============================================ */
@media (prefers-reduced-motion: reduce) {
  .your-particle,
  .your-decoration {
    animation: none;
  }
}

/* ============================================
   Print - Hide decorations
   ============================================ */
@media print {
  .your-effects-container,
  .your-theme-corner,
  .your-decoration {
    display: none !important;
  }
}
```

---

## 6. Bước 4: Đăng Ký Theme

### File: `public/scripts/modules/seasonal/index.js`

```javascript
import seasonalManager from './core/seasonal-manager.js';

// Import themes
import christmasTheme from './themes/christmas/index.js';
import yourTheme from './themes/yourTheme/index.js';  // ✨ THÊM IMPORT

/**
 * Register all available themes
 */
function registerThemes() {
  seasonalManager.registerTheme(christmasTheme);
  seasonalManager.registerTheme(yourTheme);  // ✨ THÊM ĐĂNG KÝ
}

// ... rest of the file remains the same
```

---

## 7. Theme Interface API

Mỗi theme **BẮT BUỘC** phải export các properties và methods sau:

### Required Properties

| Property | Type | Mô Tả |
|----------|------|-------|
| `id` | `string` | ID duy nhất, phải khớp với id trong date-detector |
| `name` | `string` | Tên hiển thị |
| `priority` | `number` | Độ ưu tiên |

### Required Methods

| Method | Parameters | Return | Mô Tả |
|--------|------------|--------|-------|
| `init(context)` | `{ weather: Object }` | `Promise<void>` | Khởi tạo theme |
| `applyEffects(weather)` | `Object` | `Promise<void>` | Áp dụng hiệu ứng |
| `applyDecorations()` | - | `Promise<void>` | Áp dụng trang trí |
| `updateWeather(weather)` | `Object` | `void` | Cập nhật khi thời tiết thay đổi |
| `destroy()` | - | `Promise<void>` | Cleanup theme |

### Optional Methods

| Method | Parameters | Return | Mô Tả |
|--------|------------|--------|-------|
| `getState()` | - | `Object` | Trả về state hiện tại |

---

## 8. Tích Hợp Weather

### Weather Data Structure

```javascript
{
  location: {
    name: "Ho Chi Minh City",
    region: "Ho Chi Minh",
    country: "Vietnam",
    lat: 10.82,
    lon: 106.63,
    localtime: "2025-12-25 14:30",
    timezone: "Asia/Ho_Chi_Minh"
  },
  current: {
    temp_c: 28,
    temp_f: 82.4,
    humidity: 75,
    cloud: 50,
    is_day: true,
    wind_kph: 15,
    condition: {
      text: "Partly cloudy",
      code: 1003
    }
  },
  effects: {
    category: "CLOUDY",      // CLEAR, CLOUDY, LIGHT_RAIN, HEAVY_RAIN, LIGHT_SNOW, etc.
    intensity: 0.3,          // 0-1
    isRainy: false,
    isSnowy: false,
    isCold: false,           // temp_c < 15
    isHot: false,            // temp_c > 30
    isDaytime: true
  }
}
```

### Sử Dụng Weather trong Theme

```javascript
function calculateEffectIntensity(weather) {
  if (!weather?.effects) {
    return 0.5; // Default
  }
  
  const { intensity, isRainy, isSnowy, isCold, isDaytime } = weather.effects;
  
  // Ví dụ logic cho Valentine:
  // - Mưa = nhiều trái tim rơi
  // - Ban đêm = hiệu ứng lung linh
  
  let finalIntensity = 0.5;
  
  if (isRainy) {
    finalIntensity = Math.max(0.7, intensity);
  }
  
  if (!isDaytime) {
    // Giảm particles ban đêm, tăng glow effects
    finalIntensity *= 0.8;
  }
  
  return finalIntensity;
}
```

---

## 9. Best Practices

### ✅ Nên Làm

1. **Accessibility**
   ```javascript
   // Thêm aria-hidden cho decorative elements
   element.setAttribute('aria-hidden', 'true');
   ```

2. **Performance**
   ```css
   /* Sử dụng will-change cho animations */
   .particle {
     will-change: transform;
   }
   ```

3. **Cleanup**
   ```javascript
   // Luôn cleanup trong destroy()
   async function destroy() {
     effects.stop();
     decorations.removeAll();
     // Remove CSS
     document.getElementById('your-styles')?.remove();
   }
   ```

4. **Responsive**
   ```css
   @media (max-width: 768px) {
     .decoration { width: 50%; }
   }
   ```

5. **Reduced Motion**
   ```css
   @media (prefers-reduced-motion: reduce) {
     .particle { animation: none; }
   }
   ```

### ❌ Không Nên Làm

1. **Memory leaks** - Không cleanup elements
2. **Blocking animations** - Animation quá nặng
3. **Missing z-index management** - Elements chồng lên UI quan trọng
4. **Hardcoded dates** - Không dùng date-detector
5. **No print styles** - Decorations xuất hiện khi in

---

## 10. Ví Dụ Hoàn Chỉnh: Valentine Theme

### Bước 1: Thêm vào date-detector.js

```javascript
valentine: {
  id: 'valentine',
  name: 'Valentine',
  priority: 90,
  getDateRange: (year) => ({
    start: new Date(year, 1, 12),  // Feb 12
    end: new Date(year, 1, 15, 23, 59, 59)  // Feb 15
  })
}
```

### Bước 2: Tạo theme files

**`themes/valentine/index.js`**
```javascript
import effects from './effects.js';
import decorations from './decorations.js';

const CONFIG = {
  id: 'valentine',
  name: 'Valentine 💕',
  priority: 90
};

let isInitialized = false;
let currentWeather = null;

async function init(context = {}) {
  if (isInitialized) return;
  currentWeather = context.weather;
  await loadStyles();
  isInitialized = true;
}

async function loadStyles() {
  const link = document.createElement('link');
  link.id = 'valentine-theme-styles';
  link.rel = 'stylesheet';
  link.href = '/styles/seasonal/valentine.css';
  document.head.appendChild(link);
}

async function applyEffects(weather) {
  currentWeather = weather;
  const intensity = weather?.effects?.isRainy ? 0.8 : 0.5;
  effects.start(intensity);
}

async function applyDecorations() {
  decorations.applyAll();
}

function updateWeather(weather) {
  currentWeather = weather;
  effects.updateIntensity(weather?.effects?.intensity || 0.5);
}

async function destroy() {
  effects.stop();
  decorations.removeAll();
  document.getElementById('valentine-theme-styles')?.remove();
  isInitialized = false;
}

export default { ...CONFIG, init, applyEffects, applyDecorations, updateWeather, destroy };
```

**`themes/valentine/effects.js`**
```javascript
let container = null;
let isRunning = false;

const HEARTS = ['💕', '💗', '💖', '💘', '❤️', '🩷'];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createHeart() {
  const heart = document.createElement('div');
  heart.className = 'valentine-heart';
  heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
  heart.style.cssText = `
    position: fixed;
    top: -30px;
    left: ${random(0, 100)}%;
    font-size: ${random(1, 2.5)}rem;
    animation: heart-fall ${random(6, 12)}s linear ${random(0, 5)}s infinite;
    z-index: 9999;
    pointer-events: none;
  `;
  return heart;
}

export function start(intensity = 0.5) {
  if (isRunning) return;
  
  container = document.createElement('div');
  container.id = 'valentine-effects';
  container.setAttribute('aria-hidden', 'true');
  
  const count = Math.floor(20 + 80 * intensity);
  for (let i = 0; i < count; i++) {
    container.appendChild(createHeart());
  }
  
  document.body.appendChild(container);
  isRunning = true;
}

export function stop() {
  container?.remove();
  container = null;
  isRunning = false;
}

export function updateIntensity(intensity) {
  if (isRunning) {
    stop();
    start(intensity);
  }
}

export function isActive() { return isRunning; }

export default { start, stop, updateIntensity, isActive };
```

**`themes/valentine/decorations.js`**
```javascript
export function applyAll() {
  document.body.classList.add('valentine-active');
  createCornerHearts();
}

export function removeAll() {
  document.body.classList.remove('valentine-active');
  document.querySelectorAll('.valentine-corner').forEach(el => el.remove());
}

function createCornerHearts() {
  const corner = document.createElement('div');
  corner.className = 'valentine-corner';
  corner.setAttribute('aria-hidden', 'true');
  corner.innerHTML = `
    <svg viewBox="0 0 100 100" width="80" height="80">
      <path d="M50 88 C20 60 5 40 25 25 C40 15 50 30 50 30 
               C50 30 60 15 75 25 C95 40 80 60 50 88" 
            fill="#ff69b4"/>
    </svg>
  `;
  corner.style.cssText = 'position:fixed;top:10px;right:10px;z-index:100;';
  document.body.appendChild(corner);
}

export default { applyAll, removeAll };
```

### Bước 3: CSS

**`styles/seasonal/valentine.css`**
```css
:root {
  --valentine-pink: #ff69b4;
  --valentine-red: #ff1493;
}

body.theme-valentine {
  --color-primary: var(--valentine-pink);
}

@keyframes heart-fall {
  0% { transform: translateY(-30px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
}

.valentine-heart { will-change: transform; }

body.valentine-active .social-button:hover {
  box-shadow: 0 0 20px rgba(255, 105, 180, 0.4);
}

@media (prefers-reduced-motion: reduce) {
  .valentine-heart { animation: none; }
}
```

### Bước 4: Đăng ký

```javascript
// seasonal/index.js
import valentineTheme from './themes/valentine/index.js';

function registerThemes() {
  // ...existing themes
  seasonalManager.registerTheme(valentineTheme);
}
```

---

## 11. Troubleshooting

### Theme không được apply

1. **Kiểm tra ID khớp nhau**
   ```javascript
   // date-detector.js
   valentine: { id: 'valentine', ... }
   
   // themes/valentine/index.js
   const CONFIG = { id: 'valentine', ... }  // PHẢI KHỚP
   ```

2. **Kiểm tra đã đăng ký theme**
   ```javascript
   // seasonal/index.js
   seasonalManager.registerTheme(valentineTheme);
   ```

3. **Kiểm tra date range**
   ```javascript
   // Console debug
   import dateDetector from './core/date-detector.js';
   console.log(dateDetector.getActiveTheme());
   ```

### CSS không load

1. **Kiểm tra đường dẫn**
   ```javascript
   link.href = '/styles/seasonal/valentine.css';  // Bắt đầu bằng /
   ```

2. **Kiểm tra file tồn tại**
   ```
   public/styles/seasonal/valentine.css
   ```

### Effects không hiển thị

1. **Kiểm tra z-index**
   ```css
   .your-effects-container { z-index: 9999; }
   ```

2. **Kiểm tra pointer-events**
   ```css
   .your-particle { pointer-events: none; }
   ```

### Memory leak

1. **Cleanup trong destroy()**
   ```javascript
   async function destroy() {
     effects.stop();           // Stop animations
     decorations.removeAll();  // Remove DOM elements
     // Remove CSS
     document.getElementById('your-styles')?.remove();
   }
   ```

---

## 📝 Checklist Khi Tạo Theme Mới

- [ ] Thêm event vào `date-detector.js` với đúng format
- [ ] Tạo folder `themes/yourTheme/` với 3 files
- [ ] Implement tất cả required methods trong `index.js`
- [ ] Tạo CSS file trong `styles/seasonal/`
- [ ] Đăng ký theme trong `seasonal/index.js`
- [ ] Test với các screen sizes khác nhau
- [ ] Test với `prefers-reduced-motion`
- [ ] Verify cleanup hoạt động đúng
- [ ] Check accessibility (aria-hidden)
- [ ] Test print styles

---

## 🎉 Kết Luận

Hệ thống Seasonal Theme được thiết kế modular và dễ mở rộng. Mỗi theme hoạt động độc lập và có thể:

- Respond to weather data
- Có hiệu ứng particles riêng
- Có decorations riêng
- Tự động cleanup khi chuyển theme

Nếu có thắc mắc, hãy xem implementation của Christmas theme làm reference tại:
- `public/scripts/modules/seasonal/themes/christmas/`
- `public/styles/seasonal/christmas.css`

---

*Tài liệu được cập nhật: December 2025*
