const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const weatherRoutes = require('./weatherRoutes');
const settingRoutes = require('./settingRoutes');
const gomokuRoutes = require('./gomokuRoutes');
const chessRoutes = require('./chessRoutes');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/weather', weatherRoutes);
router.use('/settings', settingRoutes);
router.use('/games/gomoku', gomokuRoutes);
router.use('/games/chess', chessRoutes);

module.exports = router;
