'use strict';

const path = require('path');
const logger = require('../../config/logger');
const { GomocupEngine, Rule } = require('./gomocup_engine/nodejs/src/gomocup-engine');

// Engine binary - AVX-512 build for Linux x86_64
const ENGINE_PATH = path.join(__dirname, 'gomocup_engine', 'engine', 'pbrain-rapfi-linux-clang-avx512');
const ENGINE_DIR = path.join(__dirname, 'gomocup_engine', 'engine');

const MAX_DEPTH = 15;
const DEFAULT_DEPTH = 10;
const DEFAULT_BOARD_SIZE = 15;
const DEFAULT_TIMEOUT_TURN = 5000;
const IDLE_TIMEOUT_MS = 60_000;        // Auto-stop after 60s idle
const QUEUE_WAIT_TIMEOUT_MS = 30_000;  // Max wait time in queue
const MAX_PENDING_PER_IP = 5;          // Max pending requests per IP

/** Singleton Gomoku engine manager */
class GomokuEngineManager {
  constructor() {
    this._engine = null;
    this._idleTimer = null;
    this._processing = false;
    this._queue = [];          // { resolve, reject, ip }
    this._ipPendingCount = {}; // IP → count of pending requests in queue
  }

  /**
   * Check if an IP can enqueue more requests.
   * @param {string} ip
   * @returns {boolean}
   */
  canEnqueue(ip) {
    return (this._ipPendingCount[ip] || 0) < MAX_PENDING_PER_IP;
  }

  /**
   * Get engine info.
   * @returns {Promise<{running: boolean, about: string|null}>}
   */
  async getInfo() {
    if (!this._engine || !this._engine.isRunning) {
      return { running: false, about: null };
    }
    try {
      const about = await this._engine.about();
      return { running: true, about };
    } catch {
      return { running: true, about: null };
    }
  }

  /**
   * Execute a move request. Queues if engine is busy.
   * @param {object} params
   * @param {number} params.boardSize
   * @param {number} params.rule
   * @param {Array} params.moves
   * @param {number} params.maxDepth
   * @param {string} params.ip - Client IP for rate limiting
   * @returns {Promise<{move: {x: number, y: number}, engineTime: number}>}
   */
  executeMove(params) {
    const { ip } = params;

    if (!this.canEnqueue(ip)) {
      return Promise.reject(new RateLimitError('Too many pending requests'));
    }

    return new Promise((resolve, reject) => {
      // Track per-IP count
      this._ipPendingCount[ip] = (this._ipPendingCount[ip] || 0) + 1;

      // Queue wait timeout
      const timer = setTimeout(() => {
        this._removeFromQueue(entry);
        reject(new QueueTimeoutError('Request timed out waiting in queue'));
      }, QUEUE_WAIT_TIMEOUT_MS);

      const entry = { resolve, reject, params, timer, ip };
      this._queue.push(entry);

      this._processQueue();
    });
  }

  /**
   * Graceful shutdown - stop engine and reject pending requests.
   */
  async shutdown() {
    this._clearIdleTimer();

    // Reject all pending requests
    for (const entry of this._queue) {
      clearTimeout(entry.timer);
      this._decrementIp(entry.ip);
      entry.reject(new Error('Server shutting down'));
    }
    this._queue = [];

    if (this._engine) {
      try {
        await this._engine.stop();
      } catch {
        // Ignore stop errors during shutdown
      }
      this._engine = null;
    }
  }

  // ── Internal ──────────────────────────────────────────────────

  async _processQueue() {
    if (this._processing || this._queue.length === 0) return;
    this._processing = true;

    while (this._queue.length > 0) {
      const entry = this._queue.shift();
      clearTimeout(entry.timer);
      this._decrementIp(entry.ip);

      try {
        const result = await this._computeMove(entry.params);
        entry.resolve(result);
      } catch (err) {
        entry.reject(err);
      }
    }

    this._processing = false;
    this._resetIdleTimer();
  }

  async _computeMove({ boardSize = DEFAULT_BOARD_SIZE, rule = Rule.FREESTYLE, moves = [], maxDepth = DEFAULT_DEPTH }) {
    // Clamp maxDepth
    maxDepth = Math.min(Math.max(1, maxDepth || DEFAULT_DEPTH), MAX_DEPTH);
    boardSize = Math.min(Math.max(10, boardSize || DEFAULT_BOARD_SIZE), 22);

    // Ensure engine is running
    await this._ensureEngine(boardSize);

    // Restart board for clean stateless computation
    await this._engine.restart();

    // Configure
    this._engine.configure({
      timeoutTurn: DEFAULT_TIMEOUT_TURN,
      maxDepth,
      rule,
    });

    const startTime = Date.now();
    let move;

    if (moves.length === 0) {
      // No moves yet - engine plays first as Black
      move = await this._engine.begin();
    } else {
      // Send full board position
      move = await this._engine.board(moves);
    }

    const engineTime = Date.now() - startTime;

    if (!move) {
      throw new EngineComputeError('Engine failed to compute a move');
    }

    return { move, engineTime };
  }

  async _ensureEngine(boardSize) {
    this._clearIdleTimer();

    if (this._engine && this._engine.isRunning) {
      return;
    }

    logger.info('[gomoku] Starting engine...');
    this._engine = new GomocupEngine(ENGINE_PATH, ENGINE_DIR);

    const ok = await this._engine.start(boardSize);
    if (!ok) {
      this._engine = null;
      throw new EngineComputeError('Engine failed to start');
    }
    logger.info('[gomoku] Engine started');
  }

  _resetIdleTimer() {
    this._clearIdleTimer();
    this._idleTimer = setTimeout(async () => {
      if (this._queue.length === 0 && !this._processing && this._engine) {
        logger.info('[gomoku] Idle timeout - stopping engine');
        try {
          await this._engine.stop();
        } catch {
          // Ignore
        }
        this._engine = null;
      }
    }, IDLE_TIMEOUT_MS);
  }

  _clearIdleTimer() {
    if (this._idleTimer) {
      clearTimeout(this._idleTimer);
      this._idleTimer = null;
    }
  }

  _removeFromQueue(entry) {
    const idx = this._queue.indexOf(entry);
    if (idx !== -1) {
      this._queue.splice(idx, 1);
      clearTimeout(entry.timer);
      this._decrementIp(entry.ip);
    }
  }

  _decrementIp(ip) {
    if (this._ipPendingCount[ip]) {
      this._ipPendingCount[ip]--;
      if (this._ipPendingCount[ip] <= 0) {
        delete this._ipPendingCount[ip];
      }
    }
  }
}

// Custom error types
class RateLimitError extends Error {
  constructor(message) { super(message); this.name = 'RateLimitError'; this.statusCode = 429; }
}

class QueueTimeoutError extends Error {
  constructor(message) { super(message); this.name = 'QueueTimeoutError'; this.statusCode = 408; }
}

class EngineComputeError extends Error {
  constructor(message) { super(message); this.name = 'EngineComputeError'; this.statusCode = 500; }
}

// Singleton instance
const gomokuEngine = new GomokuEngineManager();

// Graceful shutdown
process.on('SIGTERM', () => gomokuEngine.shutdown());
process.on('SIGINT', () => gomokuEngine.shutdown());

module.exports = {
  gomokuEngine,
  RateLimitError,
  QueueTimeoutError,
  EngineComputeError,
};
