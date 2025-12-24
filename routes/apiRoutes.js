const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const weatherRoutes = require('./weatherRoutes');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/weather', weatherRoutes);

module.exports = router;
