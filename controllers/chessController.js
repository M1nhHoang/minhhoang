'use strict';

const { computeMove, getEngineInfo } = require('../services/chessService');

/**
 * POST /api/games/chess/move
 */
async function makeMove(req, res, next) {
  try {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const result = await computeMove(req.body, ip);

    res.json({
      success: true,
      bestmove: result.bestmove,
      ponder: result.ponder,
      evaluation: result.evaluation,
      lines: result.lines,
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
 * GET /api/games/chess/info
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
