/**
 * Auth UI Module - Cập nhật giao diện theo trạng thái auth
 */

import auth, { USER_ROLES, onAuthStateChange, isLoggedIn, isAdmin, isVIP, getCurrentUser } from './index.js';

const SELECTORS = {
  // Navigation
  navLoginLink: '[data-nav-login]',
  navProfileLink: '[data-nav-profile]',
  navAdminLink: '[data-nav-admin]',
  navVipLink: '[data-nav-vip]',
  navLogoutBtn: '[data-nav-logout]',
  
  // User info displays
  userAvatar: '[data-user-avatar]',
  userName: '[data-user-name]',
  userRole: '[data-user-role]',
  
  // Conditional visibility
  showIfGuest: '[data-show-if="guest"]',
  showIfLoggedIn: '[data-show-if="logged-in"]',
  showIfVerified: '[data-show-if="verified"]',
  showIfVip: '[data-show-if="vip"]',
  showIfAdmin: '[data-show-if="admin"]',
  
  // Views that require auth
  protectedViews: '[data-require-role]'
};

/**
 * Cập nhật visibility của elements dựa trên auth state
 */
function updateVisibility(user) {
  const isGuest = !user || !user.isVerified;
  const loggedIn = isLoggedIn();
  const role = user?.role || 0;

  // Guest-only elements (login button, etc.)
  document.querySelectorAll(SELECTORS.showIfGuest).forEach(el => {
    el.classList.toggle('is-hidden', !isGuest);
  });

  // Logged-in only elements
  document.querySelectorAll(SELECTORS.showIfLoggedIn).forEach(el => {
    el.classList.toggle('is-hidden', isGuest);
  });

  // Verified+ elements
  document.querySelectorAll(SELECTORS.showIfVerified).forEach(el => {
    el.classList.toggle('is-hidden', role < USER_ROLES.VERIFIED);
  });

  // VIP+ elements
  document.querySelectorAll(SELECTORS.showIfVip).forEach(el => {
    el.classList.toggle('is-hidden', role < USER_ROLES.VIP);
  });

  // Admin-only elements
  document.querySelectorAll(SELECTORS.showIfAdmin).forEach(el => {
    el.classList.toggle('is-hidden', role < USER_ROLES.ADMIN);
  });
}

/**
 * Cập nhật thông tin user hiển thị
 */
function updateUserInfo(user) {
  // Update avatars
  document.querySelectorAll(SELECTORS.userAvatar).forEach(img => {
    if (user?.avatar) {
      img.src = user.avatar;
      img.alt = user.username || 'User';
    } else {
      img.src = 'https://minhhoang.info/images/doglagging.png';
      img.alt = 'Guest';
    }
  });

  // Update usernames
  document.querySelectorAll(SELECTORS.userName).forEach(el => {
    el.textContent = user?.username || 'Guest';
  });

  // Update role badges
  document.querySelectorAll(SELECTORS.userRole).forEach(el => {
    el.textContent = user?.roleName || 'Guest';
    el.className = 'user-role-badge';
    if (user?.isAdmin) {
      el.classList.add('user-role-badge--admin');
    } else if (user?.isVIP) {
      el.classList.add('user-role-badge--vip');
    } else if (user?.isVerified) {
      el.classList.add('user-role-badge--verified');
    }
  });
}

/**
 * Cập nhật navigation links
 */
function updateNavigation(user) {
  const loggedIn = isLoggedIn();
  const isUserAdmin = isAdmin();
  const isUserVIP = isVIP();

  // Login link - ẩn khi đã đăng nhập
  document.querySelectorAll(SELECTORS.navLoginLink).forEach(el => {
    el.classList.toggle('is-hidden', loggedIn);
  });

  // Profile link - hiện khi đã đăng nhập
  document.querySelectorAll(SELECTORS.navProfileLink).forEach(el => {
    el.classList.toggle('is-hidden', !loggedIn);
    if (loggedIn && user) {
      const nameSpan = el.querySelector('span');
      if (nameSpan) nameSpan.textContent = user.username;
    }
  });

  // Admin link - chỉ hiện cho admin
  document.querySelectorAll(SELECTORS.navAdminLink).forEach(el => {
    el.classList.toggle('is-hidden', !isUserAdmin);
  });

  // VIP link - chỉ hiện cho VIP+
  document.querySelectorAll(SELECTORS.navVipLink).forEach(el => {
    el.classList.toggle('is-hidden', !isUserVIP);
  });

  // Logout button
  document.querySelectorAll(SELECTORS.navLogoutBtn).forEach(el => {
    el.classList.toggle('is-hidden', !loggedIn);
  });
}

/**
 * Kiểm tra protected views và redirect nếu cần
 */
function checkProtectedViews(user) {
  const currentHash = window.location.hash || '#personal-info';
  const role = user?.role || 0;

  document.querySelectorAll(SELECTORS.protectedViews).forEach(view => {
    const requiredRole = parseInt(view.dataset.requireRole, 10) || 0;
    const viewHash = `#${view.id}`;
    
    // Nếu đang ở view này mà không đủ quyền, redirect về home
    if (currentHash === viewHash && role < requiredRole) {
      window.location.hash = '#personal-info';
    }
  });
}

/**
 * Setup logout button handlers
 */
function setupLogoutHandlers() {
  document.querySelectorAll(SELECTORS.navLogoutBtn).forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      await auth.logout();
      window.location.hash = '#personal-info';
    });
  });
}

/**
 * Auth state change handler
 */
function handleAuthStateChange(user) {
  updateVisibility(user);
  updateUserInfo(user);
  updateNavigation(user);
  checkProtectedViews(user);
}

/**
 * Initialize Auth UI
 */
export function initAuthUI() {
  // Setup logout handlers
  setupLogoutHandlers();

  // Subscribe to auth state changes
  onAuthStateChange(handleAuthStateChange);

  // Check protected views on hash change
  window.addEventListener('hashchange', () => {
    checkProtectedViews(getCurrentUser());
  });

  // Initial UI update
  handleAuthStateChange(getCurrentUser());
}

export default {
  initAuthUI
};
