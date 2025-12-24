import initPublicPage from "./modules/public-page.js";
import { initSeasonal } from "./modules/seasonal/index.js";

// Initialize public page functionality
initPublicPage();

// Initialize seasonal theme system
initSeasonal().catch(err => {
  console.warn('[App] Seasonal theme initialization failed:', err);
});
