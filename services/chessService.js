'use strict';

const { chessEngine } = require('../engines/chess/chessEngine');

// FEN regex: simplified validation for basic structure
const FEN_REGEX = /^([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+\s[wb]\s[KQkq-]+\s[a-h1-8-]+\s\d+\s\d+$/;

// UCI move: e2e4, e7e8q (with optional promotion)
const UCI_MOVE_REGEX = /^[a-h][1-8][a-h][1-8][qrbn]?$/;

/**
 * Validate and execute a chess move request.
 */
async function computeMove(body, ip) {
  const { fen, moves, depth = 12, multiPV = 1, skillLevel = 20 } = body;

  // Must have fen or moves (or neither = starting position)
  if (fen != null && typeof fen !== 'string') {
    throw createValidationError('fen must be a string');
  }

  if (fen && !FEN_REGEX.test(fen.trim())) {
    throw createValidationError('Invalid FEN string format');
  }

  if (moves != null) {
    if (!Array.isArray(moves)) {
      throw createValidationError('moves must be an array of strings');
    }
    for (let i = 0; i < moves.length; i++) {
      if (typeof moves[i] !== 'string' || !UCI_MOVE_REGEX.test(moves[i])) {
        throw createValidationError(`moves[${i}] must be a valid UCI move (e.g. "e2e4", "e7e8q")`);
      }
    }
  }

  if (typeof depth !== 'number' || depth < 1) {
    throw createValidationError('depth must be a positive number');
  }

  if (typeof multiPV !== 'number' || multiPV < 1) {
    throw createValidationError('multiPV must be a positive number (1-3)');
  }

  if (typeof skillLevel !== 'number' || skillLevel < 0 || skillLevel > 20) {
    throw createValidationError('skillLevel must be a number between 0 and 20');
  }

  return chessEngine.executeMove({
    fen: fen ? fen.trim() : undefined,
    moves,
    depth,
    multiPV,
    skillLevel,
    ip,
  });
}

async function getEngineInfo() {
  return chessEngine.getInfo();
}

function createValidationError(message) {
  const err = new Error(message);
  err.name = 'ValidationError';
  err.statusCode = 400;
  return err;
}

module.exports = {
  computeMove,
  getEngineInfo,
};
