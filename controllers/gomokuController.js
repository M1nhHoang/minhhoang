'use strict';

const { computeMove, getEngineInfo } = require('../services/gomokuService');

/**
 * POST /api/games/gomoku/move
 */
async function makeMove(req, res, next) {
  try {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const result = await computeMove(req.body, ip);

    res.json({
      success: true,
      move: result.move,
      engineTime: result.engineTime,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /api/games/gomoku/info
 */
async function info(req, res, next) {
  try {
    const data = await getEngineInfo();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  makeMove,
  info,
};
