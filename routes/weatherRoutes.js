const express = require('express');
const router = express.Router();
const { getCurrentWeather } = require('../controllers/weatherController');

// GET /api/weather - Get current weather based on user IP
router.get('/', getCurrentWeather);

module.exports = router;
