/**
 * Admin Dashboard Module
 * 
 * Chỉ dành cho users có role ADMIN (99)
 * Các chức năng:
 * - Xem danh sách users
 * - Thay đổi role users
 * - Verify/Unverify users
 * - Xem system stats
 * - Quản lý Seasonal Themes
 */

import { isAdmin, getCurrentUser, USER_ROLES, onAuthStateChange } from '../auth/index.js';
import seasonalManager from '../seasonal/core/seasonal-manager.js';

const API_ENDPOINTS = {
  users: '/api/users',
  stats: '/api/admin/stats'
};

const SELECTORS = {
  dashboard: '#admin-dashboard',
  userList: '[data-admin-user-list]',
  statsContainer: '[data-admin-stats]',
  searchInput: '[data-admin-search]',
  filterRole: '[data-admin-filter-role]',
  refreshBtn: '[data-admin-refresh]',
  // Theme selectors
  themeContainer: '[data-admin-theme]',
  currentTheme: '[data-current-theme]',
  themeSelect: '[data-theme-select]',
  themeApplyBtn: '[data-theme-apply]',
  themeResetBtn: '[data-theme-reset]',
  dayNightToggle: '[data-daynight-toggle]'
};

// State
let users = [];
let isLoading = false;
let isInitialized = false;

/**
 * Kiểm tra quyền admin
 */
function checkAdminAccess() {
  if (!isAdmin()) {
    console.warn('[Admin] Access denied - not an admin');
    return false;
  }
  return true;
}

/**
 * Fetch danh sách users
 */
async function fetchUsers() {
  const response = await fetch(API_ENDPOINTS.users);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  const body = await response.json();
  return body.data || body || [];
}

/**
 * Render user row
 */
function renderUserRow(user) {
  const roleClass = getRoleClass(user.role);
  const roleName = getRoleName(user.role);
  const statusClass = user.status === 'online' ? 'status--online' : 'status--offline';
  const verifiedIcon = user.isVerified 
    ? '<i class="fa fa-check-circle text-success"></i>' 
    : '<i class="fa fa-times-circle text-danger"></i>';

  return `
    <tr class="admin-user-row" data-username="${sanitize(user.username)}">
      <td class="admin-user-cell">
        <div class="admin-user-info">
          <img src="${user.avatar || 'https://minhhoang.info/images/doglagging.png'}" 
               alt="${sanitize(user.username)}" 
               class="admin-user-avatar">
          <div>
            <span class="admin-user-name">${sanitize(user.username)}</span>
            <span class="admin-user-type">${sanitize(user.type || 'guest')}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="role-badge ${roleClass}">${roleName}</span>
      </td>
      <td>
        <span class="status-dot ${statusClass}"></span>
        ${sanitize(user.status || 'offline')}
      </td>
      <td>${verifiedIcon}</td>
      <td class="admin-actions-cell">
        <div class="admin-actions">
          <select class="admin-role-select" data-action="change-role" data-username="${sanitize(user.username)}">
            <option value="0" ${user.role === 0 ? 'selected' : ''}>Guest</option>
            <option value="1" ${user.role === 1 ? 'selected' : ''}>Verified</option>
            <option value="2" ${user.role === 2 ? 'selected' : ''}>VIP</option>
            <option value="99" ${user.role === 99 ? 'selected' : ''}>Admin</option>
          </select>
          <button class="admin-btn admin-btn--verify" 
                  data-action="toggle-verify" 
                  data-username="${sanitize(user.username)}"
                  data-verified="${user.isVerified}">
            ${user.isVerified ? 'Unverify' : 'Verify'}
          </button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Render user list
 */
function renderUserList(userList, container) {
  if (!container) return;

  if (userList.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" class="admin-empty-state">
          <i class="fa fa-users"></i>
          <p>Không có user nào</p>
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = userList.map(renderUserRow).join('');
}

/**
 * Render stats
 */
function renderStats(stats, container) {
  if (!container) return;

  container.innerHTML = `
    <div class="admin-stat-card">
      <div class="admin-stat-icon"><i class="fa fa-users"></i></div>
      <div class="admin-stat-content">
        <span class="admin-stat-value">${stats.totalUsers || 0}</span>
        <span class="admin-stat-label">Total Users</span>
      </div>
    </div>
    <div class="admin-stat-card">
      <div class="admin-stat-icon admin-stat-icon--success"><i class="fa fa-circle"></i></div>
      <div class="admin-stat-content">
        <span class="admin-stat-value">${stats.onlineUsers || 0}</span>
        <span class="admin-stat-label">Online</span>
      </div>
    </div>
    <div class="admin-stat-card">
      <div class="admin-stat-icon admin-stat-icon--vip"><i class="fa fa-star"></i></div>
      <div class="admin-stat-content">
        <span class="admin-stat-value">${stats.vipUsers || 0}</span>
        <span class="admin-stat-label">VIP</span>
      </div>
    </div>
    <div class="admin-stat-card">
      <div class="admin-stat-icon admin-stat-icon--admin"><i class="fa fa-shield"></i></div>
      <div class="admin-stat-content">
        <span class="admin-stat-value">${stats.adminUsers || 0}</span>
        <span class="admin-stat-label">Admins</span>
      </div>
    </div>
  `;
}

/**
 * Calculate stats from users
 */
function calculateStats(userList) {
  return {
    totalUsers: userList.length,
    onlineUsers: userList.filter(u => u.status === 'online').length,
    vipUsers: userList.filter(u => u.role >= USER_ROLES.VIP).length,
    adminUsers: userList.filter(u => u.role >= USER_ROLES.ADMIN).length
  };
}

/**
 * Filter users by search and role
 */
function filterUsers(userList, searchTerm, roleFilter) {
  let filtered = userList;

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(u => 
      u.username.toLowerCase().includes(term)
    );
  }

  if (roleFilter && roleFilter !== 'all') {
    const roleValue = parseInt(roleFilter, 10);
    filtered = filtered.filter(u => u.role === roleValue);
  }

  return filtered;
}

/**
 * Handle role change
 */
async function handleRoleChange(username, newRole) {
  try {
    const response = await fetch(`${API_ENDPOINTS.users}/${username}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: parseInt(newRole, 10) })
    });

    if (!response.ok) {
      throw new Error('Failed to update role');
    }

    // Refresh user list
    await loadDashboard();
    showNotification('Role updated successfully', 'success');
  } catch (error) {
    console.error('[Admin] Role change failed:', error);
    showNotification('Failed to update role', 'error');
  }
}

/**
 * Handle verify toggle
 */
async function handleVerifyToggle(username, currentVerified) {
  try {
    const response = await fetch(`${API_ENDPOINTS.users}/${username}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVerified: !currentVerified })
    });

    if (!response.ok) {
      throw new Error('Failed to toggle verification');
    }

    // Refresh user list
    await loadDashboard();
    showNotification('User verification updated', 'success');
  } catch (error) {
    console.error('[Admin] Verify toggle failed:', error);
    showNotification('Failed to update verification', 'error');
  }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  // Simple notification - có thể thay bằng toast library
  const notification = document.createElement('div');
  notification.className = `admin-notification admin-notification--${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('admin-notification--fade');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Setup event handlers
 */
function setupEventHandlers() {
  const dashboard = document.querySelector(SELECTORS.dashboard);
  if (!dashboard) return;

  // Search input
  const searchInput = dashboard.querySelector(SELECTORS.searchInput);
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      const searchTerm = searchInput.value;
      const roleFilter = dashboard.querySelector(SELECTORS.filterRole)?.value;
      const filtered = filterUsers(users, searchTerm, roleFilter);
      renderUserList(filtered, dashboard.querySelector(SELECTORS.userList));
    }, 300));
  }

  // Role filter
  const filterRole = dashboard.querySelector(SELECTORS.filterRole);
  if (filterRole) {
    filterRole.addEventListener('change', () => {
      const searchTerm = searchInput?.value || '';
      const filtered = filterUsers(users, searchTerm, filterRole.value);
      renderUserList(filtered, dashboard.querySelector(SELECTORS.userList));
    });
  }

  // Refresh button
  const refreshBtn = dashboard.querySelector(SELECTORS.refreshBtn);
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadDashboard());
  }

  // Delegate events for user actions
  dashboard.addEventListener('change', (e) => {
    if (e.target.matches('[data-action="change-role"]')) {
      const username = e.target.dataset.username;
      const newRole = e.target.value;
      handleRoleChange(username, newRole);
    }
  });

  dashboard.addEventListener('click', (e) => {
    if (e.target.matches('[data-action="toggle-verify"]')) {
      const username = e.target.dataset.username;
      const currentVerified = e.target.dataset.verified === 'true';
      handleVerifyToggle(username, currentVerified);
    }
  });
}

/**
 * Load dashboard data
 */
async function loadDashboard() {
  if (!checkAdminAccess()) return;

  const dashboard = document.querySelector(SELECTORS.dashboard);
  if (!dashboard) return;

  isLoading = true;

  try {
    users = await fetchUsers();
    
    const stats = calculateStats(users);
    renderStats(stats, dashboard.querySelector(SELECTORS.statsContainer));
    renderUserList(users, dashboard.querySelector(SELECTORS.userList));
    
    // Load theme panel
    const themeContainer = dashboard.querySelector(SELECTORS.themeContainer);
    renderThemePanel(themeContainer);
  } catch (error) {
    console.error('[Admin] Failed to load dashboard:', error);
    showNotification('Failed to load dashboard data', 'error');
  } finally {
    isLoading = false;
  }
}

/**
 * Initialize admin dashboard
 */
/**
 * Setup dashboard event handlers (only once)
 */
function setupDashboard() {
  if (isInitialized) return;
  
  if (!checkAdminAccess()) {
    console.log('[Admin] Skipping dashboard setup - not admin');
    return;
  }

  console.log('[Admin] Setting up dashboard event handlers');
  setupEventHandlers();
  setupThemeEventHandlers();
  isInitialized = true;
}

/**
 * Initialize admin dashboard
 */
export function initAdminDashboard() {
  // Load data when dashboard becomes visible
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#admin-dashboard' && isAdmin()) {
      setupDashboard();
      loadDashboard();
    }
  });

  // Subscribe to auth state changes - reinitialize when user becomes admin
  onAuthStateChange((user) => {
    if (user && user.role >= USER_ROLES.ADMIN) {
      console.log('[Admin] Admin user detected, initializing dashboard');
      setupDashboard();
      
      // If already on admin page, load data
      if (window.location.hash === '#admin-dashboard') {
        loadDashboard();
      }
    } else {
      // Reset initialization flag when user logs out
      isInitialized = false;
    }
  });

  // Initial setup attempt
  setupDashboard();
  
  // Load if already on admin page
  if (window.location.hash === '#admin-dashboard' && isAdmin()) {
    loadDashboard();
  }
}

// Helpers
function sanitize(text = '') {
  return text.replace(/[<>&"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;'
  }[c] || c));
}

function getRoleClass(role) {
  const classes = {
    [USER_ROLES.GUEST]: 'role-badge--guest',
    [USER_ROLES.VERIFIED]: 'role-badge--verified',
    [USER_ROLES.VIP]: 'role-badge--vip',
    [USER_ROLES.ADMIN]: 'role-badge--admin'
  };
  return classes[role] || 'role-badge--guest';
}

function getRoleName(role) {
  const names = {
    [USER_ROLES.GUEST]: 'Guest',
    [USER_ROLES.VERIFIED]: 'Verified',
    [USER_ROLES.VIP]: 'VIP',
    [USER_ROLES.ADMIN]: 'Admin'
  };
  return names[role] || 'Guest';
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ============================================
// THEME MANAGEMENT
// ============================================

/**
 * Get theme icon based on theme id
 */
function getThemeIcon(themeId) {
  const icons = {
    christmas: '🎄',
    newyear: '🎆',
    lunarnewyear: '🧧',
    valentine: '💕',
    halloween: '🎃',
    spring: '🌸',
    summer: '☀️',
    autumn: '🍂',
    winter: '❄️',
    default: '🚧'
  };
  return icons[themeId] || '🎨';
}

/**
 * Render theme management panel
 */
function renderThemePanel(container) {
  if (!container) return;

  const state = seasonalManager.getState();
  const currentThemeId = state.currentTheme || null;
  const currentMode = state.mode || 'auto';
  const registeredThemes = state.registeredThemes || [];
  const weather = state.weather;
  
  // Get current day/night mode
  const isDayMode = document.body.classList.contains('christmas-day') || 
                    document.body.classList.contains('newyear-day');
  const isNightMode = document.body.classList.contains('christmas-night') || 
                      document.body.classList.contains('newyear-night');
  const currentDayNight = isNightMode ? 'night' : (isDayMode ? 'day' : 'auto');

  // Build theme options (registered themes + default)
  const allThemes = ['default', ...registeredThemes];
  const themeOptions = allThemes.map(id => {
    const icon = getThemeIcon(id);
    const isActive = (currentMode === 'default' && id === 'default') || id === currentThemeId;
    const label = id === 'default' ? 'Mặc định (không theme)' : capitalize(id);
    return `<option value="${id}" ${isActive ? 'selected' : ''}>${icon} ${label}</option>`;
  }).join('');

  // Mode label
  let modeLabel;
  if (currentMode === 'default') {
    modeLabel = '<span class="admin-theme-mode admin-theme-mode--default"><i class="fa fa-ban"></i> Mặc định</span>';
  } else if (currentMode === 'manual') {
    modeLabel = '<span class="admin-theme-mode admin-theme-mode--manual"><i class="fa fa-hand-pointer-o"></i> Thủ công</span>';
  } else {
    modeLabel = '<span class="admin-theme-mode admin-theme-mode--auto"><i class="fa fa-magic"></i> Tự động</span>';
  }

  const displayThemeName = currentMode === 'default' 
    ? 'Không có theme' 
    : (currentThemeId ? capitalize(currentThemeId) : 'Không có');
  
  // Check if current theme supports day/night
  const supportsDayNight = ['christmas', 'newyear', 'lunarnewyear'].includes(currentThemeId);

  container.innerHTML = `
    <div class="admin-theme-current">
      <div class="admin-theme-badge">
        <span class="admin-theme-icon">${currentMode === 'default' ? '🚫' : getThemeIcon(currentThemeId)}</span>
        <div class="admin-theme-info">
          <span class="admin-theme-label">Theme hiện tại ${modeLabel}</span>
          <span class="admin-theme-name" data-current-theme>${displayThemeName}</span>
        </div>
      </div>
      ${weather ? `
        <div class="admin-theme-weather">
          <i class="fa fa-cloud"></i>
          <span>${weather.current?.temp_c || '--'}°C - ${weather.current?.condition?.text || 'N/A'}</span>
          <span class="admin-theme-daytime">${weather.effects?.isDaytime ? '☀️ Ngày' : '🌙 Đêm'}</span>
        </div>
      ` : ''}
    </div>
    
    <div class="admin-theme-controls">
      <div class="admin-theme-select-wrapper">
        <label for="theme-select">Chọn theme:</label>
        <select id="theme-select" class="admin-filter-select" data-theme-select>
          <option value="">-- Chọn theme --</option>
          ${themeOptions}
        </select>
      </div>
      <div class="admin-theme-actions">
        <button class="admin-btn admin-btn--primary" data-theme-apply>
          <i class="fa fa-paint-brush"></i> Apply Theme
        </button>
        <button class="admin-btn admin-btn--refresh" data-theme-reset title="Tự động phát hiện theme theo ngày/mùa">
          <i class="fa fa-refresh"></i> Auto Detect
        </button>
      </div>
    </div>
    
    ${supportsDayNight ? `
      <div class="admin-theme-daynight">
        <label><i class="fa fa-adjust"></i> Chế độ Ngày/Đêm:</label>
        <div class="admin-daynight-toggle" data-daynight-toggle>
          <button class="admin-daynight-btn ${currentDayNight === 'auto' ? 'admin-daynight-btn--active' : ''}" 
                  data-daynight="auto" title="Tự động theo thời gian thực">
            <i class="fa fa-magic"></i> Auto
          </button>
          <button class="admin-daynight-btn ${currentDayNight === 'day' ? 'admin-daynight-btn--active' : ''}" 
                  data-daynight="day" title="Chế độ ban ngày">
            ☀️ Ngày
          </button>
          <button class="admin-daynight-btn ${currentDayNight === 'night' ? 'admin-daynight-btn--active' : ''}" 
                  data-daynight="night" title="Chế độ ban đêm">
            🌙 Đêm
          </button>
        </div>
      </div>
    ` : ''}
    
    ${currentMode !== 'auto' ? `
      <div class="admin-theme-notice">
        <i class="fa fa-info-circle"></i>
        ${currentMode === 'default' 
          ? 'Đang ở chế độ <strong>Mặc định</strong> (không có theme). Nhấn <strong>Auto Detect</strong> để tự động theo ngày/mùa.'
          : 'Theme đang được đặt <strong>thủ công</strong>. Nhấn <strong>Auto Detect</strong> để quay về chế độ tự động.'}
      </div>
    ` : ''}
    
    <div class="admin-theme-list">
      <h4>Themes đã đăng ký:</h4>
      <div class="admin-theme-chips">
        <span class="admin-theme-chip ${currentMode === 'default' ? 'admin-theme-chip--active' : ''}"
              data-theme-id="default">
          🚫 Mặc định
        </span>
        ${registeredThemes.map(id => `
          <span class="admin-theme-chip ${id === currentThemeId && currentMode !== 'default' ? 'admin-theme-chip--active' : ''}"
                data-theme-id="${id}">
            ${getThemeIcon(id)} ${capitalize(id)}
          </span>
        `).join('')}
        ${registeredThemes.length === 0 ? '<span class="text-muted">Chưa có theme nào được đăng ký</span>' : ''}
      </div>
    </div>
  `;
}

/**
 * Handle theme apply
 */
async function handleThemeApply() {
  const dashboard = document.querySelector(SELECTORS.dashboard);
  const select = dashboard?.querySelector(SELECTORS.themeSelect);
  const themeId = select?.value;

  if (!themeId) {
    showNotification('Vui lòng chọn theme', 'error');
    return;
  }

  try {
    const success = await seasonalManager.applyTheme(themeId, { saveToServer: true });
    if (success) {
      const msg = themeId === 'default' ? 'Đã chuyển về chế độ mặc định (không theme)' : `Đã apply theme: ${capitalize(themeId)}`;
      showNotification(msg, 'success');
      // Refresh theme panel
      const themeContainer = dashboard?.querySelector(SELECTORS.themeContainer);
      renderThemePanel(themeContainer);
    } else {
      showNotification(`Không thể apply theme: ${themeId}`, 'error');
    }
  } catch (error) {
    console.error('[Admin] Theme apply failed:', error);
    showNotification('Lỗi khi apply theme. Bạn có quyền admin không?', 'error');
  }
}

/**
 * Handle theme reset (auto detect)
 */
async function handleThemeReset() {
  try {
    await seasonalManager.refresh();
    showNotification('Đã chuyển về chế độ tự động theo ngày/mùa', 'success');
    // Refresh theme panel
    const dashboard = document.querySelector(SELECTORS.dashboard);
    const themeContainer = dashboard?.querySelector(SELECTORS.themeContainer);
    renderThemePanel(themeContainer);
  } catch (error) {
    console.error('[Admin] Theme reset failed:', error);
    showNotification('Lỗi khi reset theme. Bạn có quyền admin không?', 'error');
  }
}

/**
 * Handle theme chip click
 */
async function handleThemeChipClick(themeId) {
  if (!themeId) return;

  try {
    const success = await seasonalManager.applyTheme(themeId, { saveToStorage: true });
    if (success) {
      const msg = themeId === 'default' ? 'Đã chuyển về chế độ mặc định' : `Đã apply theme: ${capitalize(themeId)}`;
      showNotification(msg, 'success');
      // Refresh theme panel
      const dashboard = document.querySelector(SELECTORS.dashboard);
      const themeContainer = dashboard?.querySelector(SELECTORS.themeContainer);
      renderThemePanel(themeContainer);
    }
  } catch (error) {
    console.error('[Admin] Theme chip click failed:', error);
    showNotification('Lỗi khi apply theme. Bạn có quyền admin không?', 'error');
  }
}

/**
 * Handle day/night mode toggle
 */
function handleDayNightToggle(mode) {
  const body = document.body;
  const state = seasonalManager.getState();
  const currentThemeId = state.currentTheme;
  
  // Remove existing day/night classes for all themes
  body.classList.remove(
    'christmas-day', 'christmas-night',
    'newyear-day', 'newyear-night',
    'lunarnewyear-day', 'lunarnewyear-night'
  );
  
  if (mode === 'auto') {
    // Auto mode - determine based on current hour
    const hour = new Date().getHours();
    const isDaytime = hour >= 6 && hour < 18;
    
    if (currentThemeId === 'christmas') {
      body.classList.add(isDaytime ? 'christmas-day' : 'christmas-night');
    } else if (currentThemeId === 'newyear') {
      body.classList.add(isDaytime ? 'newyear-day' : 'newyear-night');
    } else if (currentThemeId === 'lunarnewyear') {
      body.classList.add(isDaytime ? 'lunarnewyear-day' : 'lunarnewyear-night');
    }
    
    showNotification(`Chế độ tự động: ${isDaytime ? '☀️ Ngày' : '🌙 Đêm'}`, 'success');
  } else if (mode === 'day') {
    if (currentThemeId === 'christmas') {
      body.classList.add('christmas-day');
    } else if (currentThemeId === 'newyear') {
      body.classList.add('newyear-day');
    } else if (currentThemeId === 'lunarnewyear') {
      body.classList.add('lunarnewyear-day');
    }
    showNotification('☀️ Đã chuyển sang chế độ Ngày', 'success');
  } else if (mode === 'night') {
    if (currentThemeId === 'christmas') {
      body.classList.add('christmas-night');
    } else if (currentThemeId === 'newyear') {
      body.classList.add('newyear-night');
    } else if (currentThemeId === 'lunarnewyear') {
      body.classList.add('lunarnewyear-night');
    }
    showNotification('🌙 Đã chuyển sang chế độ Đêm', 'success');
  }
  
  // Save preference to localStorage
  localStorage.setItem('minhhoang_daynight_mode', mode);
  
  // Refresh panel
  const dashboard = document.querySelector(SELECTORS.dashboard);
  const themeContainer = dashboard?.querySelector(SELECTORS.themeContainer);
  renderThemePanel(themeContainer);
}

/**
 * Setup theme event handlers
 */
function setupThemeEventHandlers() {
  const dashboard = document.querySelector(SELECTORS.dashboard);
  if (!dashboard) return;

  // Apply button
  dashboard.addEventListener('click', (e) => {
    if (e.target.matches('[data-theme-apply]') || e.target.closest('[data-theme-apply]')) {
      handleThemeApply();
    }
    
    if (e.target.matches('[data-theme-reset]') || e.target.closest('[data-theme-reset]')) {
      handleThemeReset();
    }

    // Theme chip click
    const chip = e.target.closest('[data-theme-id]');
    if (chip) {
      handleThemeChipClick(chip.dataset.themeId);
    }
    
    // Day/night toggle click
    const dayNightBtn = e.target.closest('[data-daynight]');
    if (dayNightBtn) {
      handleDayNightToggle(dayNightBtn.dataset.daynight);
    }
  });
}

/**
 * Load theme panel
 */
function loadThemePanel() {
  const dashboard = document.querySelector(SELECTORS.dashboard);
  const themeContainer = dashboard?.querySelector(SELECTORS.themeContainer);
  renderThemePanel(themeContainer);
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default {
  initAdminDashboard,
  loadDashboard,
  loadThemePanel
};
