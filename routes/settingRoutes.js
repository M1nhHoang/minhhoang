const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Public - anyone can get current theme
router.get('/theme', settingController.getTheme);

// Admin only - set theme
router.put('/theme', requireAuth, requireAdmin, settingController.setTheme);

module.exports = router;
