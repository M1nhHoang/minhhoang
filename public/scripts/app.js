import initPublicPage from "./modules/public-page.js";
import { initSeasonal } from "./modules/seasonal/index.js";
import auth, { initAuth } from "./modules/auth/index.js";
import { initAuthUI } from "./modules/auth/auth-ui.js";
import { initAdminDashboard } from "./modules/dashboard/index.js";

// Initialize auth first
initAuth();

// Initialize auth UI (updates navigation, visibility based on auth state)
initAuthUI();

// Initialize public page functionality
initPublicPage();

// Initialize admin dashboard (only loads for admin users)
initAdminDashboard();

// Initialize seasonal theme system
initSeasonal().catch(err => {
  console.warn('[App] Seasonal theme initialization failed:', err);
});

// Expose auth to window for debugging
if (typeof window !== 'undefined') {
  window.minhhoangAuth = auth;
}
