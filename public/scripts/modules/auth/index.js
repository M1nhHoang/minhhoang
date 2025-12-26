/**
 * Auth Module - Quản lý xác thực và session người dùng
 * 
 * Responsibilities:
 * - Đăng nhập / đăng xuất
 * - Lưu trữ session (localStorage)
 * - Kiểm tra quyền truy cập
 * - Cập nhật UI theo trạng thái auth
 */

// Role constants - phải khớp với backend
export const USER_ROLES = {
  GUEST: 0,
  VERIFIED: 1,
  VIP: 2,
  ADMIN: 99
};

export const ROLE_NAMES = {
  [USER_ROLES.GUEST]: 'Guest',
  [USER_ROLES.VERIFIED]: 'Verified',
  [USER_ROLES.VIP]: 'VIP',
  [USER_ROLES.ADMIN]: 'Admin'
};

const AUTH_STORAGE_KEY = 'minhhoang_auth';
const AUTH_ENDPOINTS = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  forgot: '/api/auth/forgot'
};

// State
let currentUser = null;
let authListeners = [];

/**
 * Lấy thông tin user hiện tại từ storage
 */
export function loadUserFromStorage() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      currentUser = JSON.parse(stored);
      return currentUser;
    }
  } catch (e) {
    console.warn('[Auth] Failed to load user from storage:', e);
  }
  return null;
}

/**
 * Lưu user vào storage
 */
function saveUserToStorage(user) {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('[Auth] Failed to save user to storage:', e);
  }
}

/**
 * Lấy thông tin user hiện tại
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Kiểm tra đã đăng nhập chưa
 */
export function isLoggedIn() {
  return currentUser !== null && currentUser.isVerified === true;
}

/**
 * Kiểm tra user có role tối thiểu
 */
export function hasRole(requiredRole) {
  if (!currentUser) return false;
  return (currentUser.role || 0) >= requiredRole;
}

/**
 * Kiểm tra có phải Admin không
 */
export function isAdmin() {
  return hasRole(USER_ROLES.ADMIN);
}

/**
 * Kiểm tra có phải VIP không
 */
export function isVIP() {
  return hasRole(USER_ROLES.VIP);
}

/**
 * Kiểm tra có phải Verified user không
 */
export function isVerified() {
  return hasRole(USER_ROLES.VERIFIED);
}

/**
 * Đăng ký listener cho auth state changes
 */
export function onAuthStateChange(callback) {
  authListeners.push(callback);
  // Trả về hàm unsubscribe
  return () => {
    authListeners = authListeners.filter(cb => cb !== callback);
  };
}

/**
 * Notify tất cả listeners về auth state change
 */
function notifyAuthChange() {
  authListeners.forEach(callback => {
    try {
      callback(currentUser);
    } catch (e) {
      console.error('[Auth] Listener error:', e);
    }
  });
}

/**
 * POST JSON helper
 */
async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  const data = body?.data ?? body;

  if (!response.ok) {
    const error = new Error(body?.message || data?.message || 'Request failed');
    error.data = data;
    error.status = response.status;
    throw error;
  }

  return data;
}

/**
 * Đăng nhập
 */
export async function login(username, password) {
  const data = await postJson(AUTH_ENDPOINTS.login, { username, password });
  
  currentUser = {
    username: data.username,
    isVerified: data.isVerified,
    type: data.type,
    role: data.role || USER_ROLES.GUEST,
    roleName: data.roleName || ROLE_NAMES[data.role] || 'Guest',
    isAdmin: data.isAdmin || false,
    isVIP: data.isVIP || false,
    loginTime: Date.now()
  };

  saveUserToStorage(currentUser);
  notifyAuthChange();

  return {
    user: currentUser,
    message: data.message
  };
}

/**
 * Đăng xuất
 */
export async function logout() {
  try {
    await postJson(AUTH_ENDPOINTS.logout, {});
  } catch (e) {
    // Ignore logout errors
  }

  currentUser = null;
  saveUserToStorage(null);
  notifyAuthChange();
}

/**
 * Khởi tạo auth module
 */
export function initAuth() {
  loadUserFromStorage();
  notifyAuthChange();
  return currentUser;
}

export default {
  USER_ROLES,
  ROLE_NAMES,
  initAuth,
  getCurrentUser,
  isLoggedIn,
  hasRole,
  isAdmin,
  isVIP,
  isVerified,
  login,
  logout,
  onAuthStateChange
};
