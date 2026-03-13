'use strict';

const express = require('express');
const router = express.Router();
const { makeMove, info } = require('../controllers/chessController');

// POST /api/games/chess/move
router.post('/move', makeMove);

// GET /api/games/chess/info
router.get('/info', info);

module.exports = router;
