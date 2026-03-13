'use strict';

const path = require('path');
const logger = require('../../config/logger');
const { UciEngine } = require('./stockfish_engine/nodejs/src/uci-engine');

// Engine binary - x86-64 SSE2 build for Linux
const ENGINE_PATH = path.join(__dirname, 'stockfish_engine', 'engine', 'stockfish-ubuntu-x86-64');
const ENGINE_DIR = path.join(__dirname, 'stockfish_engine', 'engine');

const MAX_DEPTH = 15;
const DEFAULT_DEPTH = 12;
const MAX_MULTI_PV = 3;
const DEFAULT_MULTI_PV = 1;
const DEFAULT_SKILL_LEVEL = 20;
const IDLE_TIMEOUT_MS = 60_000;
const QUEUE_WAIT_TIMEOUT_MS = 30_000;
const MAX_PENDING_PER_IP = 5;

// Fixed config for shared hosting
const ENGINE_THREADS = 1;
const ENGINE_HASH_MB = 64;

/** Singleton Chess engine manager */
class ChessEngineManager {
  constructor() {
    this._engine = null;
    this._idleTimer = null;
    this._processing = false;
    this._queue = [];
    this._ipPendingCount = {};
  }

  canEnqueue(ip) {
    return (this._ipPendingCount[ip] || 0) < MAX_PENDING_PER_IP;
  }

  async getInfo() {
    if (!this._engine || !this._engine.isRunning) {
      return { running: false, name: null, author: null };
    }
    return { running: true, name: this._engine.id.name, author: this._engine.id.author };
  }

  /**
   * Execute a chess move request. Queues if engine is busy.
   * @param {object} params
   * @param {string} [params.fen]
   * @param {string[]} [params.moves]
   * @param {number} params.depth
   * @param {number} params.multiPV
   * @param {number} params.skillLevel
   * @param {string} params.ip
   * @returns {Promise<object>}
   */
  executeMove(params) {
    const { ip } = params;

    if (!this.canEnqueue(ip)) {
      return Promise.reject(new RateLimitError('Too many pending requests'));
    }

    return new Promise((resolve, reject) => {
      this._ipPendingCount[ip] = (this._ipPendingCount[ip] || 0) + 1;

      const timer = setTimeout(() => {
        this._removeFromQueue(entry);
        reject(new QueueTimeoutError('Request timed out waiting in queue'));
      }, QUEUE_WAIT_TIMEOUT_MS);

      const entry = { resolve, reject, params, timer, ip };
      this._queue.push(entry);

      this._processQueue();
    });
  }

  async shutdown() {
    this._clearIdleTimer();

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
        // Ignore
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

  async _computeMove({ fen, moves, depth = DEFAULT_DEPTH, multiPV = DEFAULT_MULTI_PV, skillLevel = DEFAULT_SKILL_LEVEL }) {
    depth = Math.min(Math.max(1, depth || DEFAULT_DEPTH), MAX_DEPTH);
    multiPV = Math.min(Math.max(1, multiPV || DEFAULT_MULTI_PV), MAX_MULTI_PV);
    skillLevel = Math.min(Math.max(0, skillLevel != null ? skillLevel : DEFAULT_SKILL_LEVEL), 20);

    await this._ensureEngine();

    // Configure per-request settings
    this._engine.setOption('MultiPV', multiPV);
    this._engine.setOption('Skill Level', skillLevel);
    await this._engine.newGame();

    // Set position
    if (fen) {
      this._engine.setPositionFen(fen);
    } else {
      this._engine.setPosition(moves || []);
    }

    const startTime = Date.now();
    const result = await this._engine.go({ depth });
    const engineTime = Date.now() - startTime;

    if (!result.bestmove || result.bestmove === '(none)') {
      throw new EngineComputeError('No legal moves available (game may be over)');
    }

    // Build evaluation from the last info line of PV 1
    let evaluation = null;
    const lastInfo = result.info.filter(i => (!i.multipv || i.multipv === 1) && i.score).pop();
    if (lastInfo && lastInfo.score) {
      evaluation = lastInfo.score;
    }

    // Build lines for multiPV
    let lines = null;
    if (multiPV > 1) {
      const pvMap = new Map();
      for (const info of result.info) {
        if (info.multipv && info.score && info.pv) {
          pvMap.set(info.multipv, info);
        }
      }
      lines = [];
      for (let i = 1; i <= multiPV; i++) {
        const info = pvMap.get(i);
        if (info) {
          lines.push({
            rank: i,
            move: info.pv[0],
            score: info.score,
            pv: info.pv,
          });
        }
      }
    }

    return {
      bestmove: result.bestmove,
      ponder: result.ponder,
      evaluation,
      lines,
      engineTime,
    };
  }

  async _ensureEngine() {
    this._clearIdleTimer();

    if (this._engine && this._engine.isRunning) {
      return;
    }

    logger.info('[chess] Starting engine...');
    this._engine = new UciEngine(ENGINE_PATH, ENGINE_DIR);

    try {
      await this._engine.start();
    } catch (err) {
      this._engine = null;
      throw new EngineComputeError('Failed to start chess engine: ' + err.message);
    }

    this._engine.configure({
      Threads: ENGINE_THREADS,
      Hash: ENGINE_HASH_MB,
      'Debug Log File': '',
      'Write Search Log': 'false',
    });
    await this._engine.isReady();
    logger.info('[chess] Engine started: ' + this._engine.id.name);
  }

  _resetIdleTimer() {
    this._clearIdleTimer();
    this._idleTimer = setTimeout(async () => {
      if (this._queue.length === 0 && !this._processing && this._engine) {
        logger.info('[chess] Idle timeout - stopping engine');
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

class RateLimitError extends Error {
  constructor(message) { super(message); this.name = 'RateLimitError'; this.statusCode = 429; }
}

class QueueTimeoutError extends Error {
  constructor(message) { super(message); this.name = 'QueueTimeoutError'; this.statusCode = 408; }
}

class EngineComputeError extends Error {
  constructor(message) { super(message); this.name = 'EngineComputeError'; this.statusCode = 500; }
}

const chessEngine = new ChessEngineManager();

process.on('SIGTERM', () => chessEngine.shutdown());
process.on('SIGINT', () => chessEngine.shutdown());

module.exports = {
  chessEngine,
  RateLimitError,
  QueueTimeoutError,
  EngineComputeError,
};
