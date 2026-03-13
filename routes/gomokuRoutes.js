'use strict';

const express = require('express');
const router = express.Router();
const { makeMove, info } = require('../controllers/gomokuController');

// POST /api/games/gomoku/move
router.post('/move', makeMove);

// GET /api/games/gomoku/info
router.get('/info', info);

module.exports = router;
