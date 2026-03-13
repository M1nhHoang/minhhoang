'use strict';

const { gomokuEngine } = require('../engines/gomoku/gomokuEngine');
const { Rule, Player } = require('../engines/gomoku/gomocup_engine/nodejs/src/gomocup-engine');

const VALID_RULES = [Rule.FREESTYLE, Rule.STANDARD, Rule.FREE_RENJU];
const VALID_PLAYERS = [Player.OWN, Player.OPPONENT, Player.OWN_SWAP];

/**
 * Validate and execute a gomoku move request.
 * @param {object} body - Request body
 * @param {string} ip - Client IP
 * @returns {Promise<{move: {x: number, y: number}, engineTime: number}>}
 */
async function computeMove(body, ip) {
  const { boardSize = 15, rule = 0, moves = [], maxDepth = 10 } = body;

  // Validate types
  if (typeof boardSize !== 'number' || boardSize < 10 || boardSize > 22) {
    throw createValidationError('boardSize must be a number between 10 and 22');
  }

  if (!VALID_RULES.includes(rule)) {
    throw createValidationError(`rule must be one of: ${VALID_RULES.join(', ')}`);
  }

  if (!Array.isArray(moves)) {
    throw createValidationError('moves must be an array');
  }

  if (typeof maxDepth !== 'number' || maxDepth < 1) {
    throw createValidationError('maxDepth must be a positive number');
  }

  // Validate each move
  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    if (!m || typeof m.x !== 'number' || typeof m.y !== 'number' || !VALID_PLAYERS.includes(m.player)) {
      throw createValidationError(`moves[${i}] must have numeric x, y and valid player (${VALID_PLAYERS.join(', ')})`);
    }
    if (m.x < 0 || m.x >= boardSize || m.y < 0 || m.y >= boardSize) {
      throw createValidationError(`moves[${i}] coordinates out of bounds (0-${boardSize - 1})`);
    }
  }

  // Check for duplicate positions
  const seen = new Set();
  for (let i = 0; i < moves.length; i++) {
    const key = `${moves[i].x},${moves[i].y}`;
    if (seen.has(key)) {
      throw createValidationError(`moves[${i}] duplicate position: ${key}`);
    }
    seen.add(key);
  }

  return gomokuEngine.executeMove({ boardSize, rule, moves, maxDepth, ip });
}

/**
 * Get engine info.
 */
async function getEngineInfo() {
  return gomokuEngine.getInfo();
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
