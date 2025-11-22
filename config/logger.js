const fs = require('fs');
const path = require('path');

const LOG_ROOT = path.join(__dirname, '..', 'log');
const baseConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  debug: (console.debug || console.log).bind(console)
};

let currentStream = null;
let currentDateKey = null;

function formatDateParts(date = new Date()) {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return { year, month, day, key: `${year}-${month}-${day}` };
}

// Keep a single write stream per day; rotate automatically on date change.
function ensureStream() {
  const { key } = formatDateParts();

  if (currentStream && currentDateKey === key) {
    return currentStream;
  }

  if (currentStream) {
    currentStream.end();
  }

  fs.mkdirSync(LOG_ROOT, { recursive: true });
  const filePath = path.join(LOG_ROOT, `${key}.log`);
  currentStream = fs.createWriteStream(filePath, { flags: 'a' });
  currentDateKey = key;

  return currentStream;
}

function write(message) {
  ensureStream().write(message);
}

function normalizeLine(message) {
  const trimmed = message.endsWith('\n') ? message.slice(0, -1) : message;
  return `[${new Date().toISOString()}] ${trimmed}`;
}

function writeWithConsole(message) {
  const line = normalizeLine(message);
  write(`${line}\n`);
  process.stdout.write(`${line}\n`);
}

function formatLogPart(part) {
  if (part instanceof Error) {
    return part.stack || part.message;
  }
  if (typeof part === 'object') {
    try {
      return JSON.stringify(part);
    } catch (_) {
      return String(part);
    }
  }
  return String(part);
}

function logLine(loggerFn, ...args) {
  const message = args.map(formatLogPart).join(' ');
  const line = normalizeLine(message);
  write(`${line}\n`);
  loggerFn(line);
}

function patchConsole() {
  console.log = (...args) => logLine(baseConsole.log, ...args);
  console.info = (...args) => logLine(baseConsole.info, ...args);
  console.warn = (...args) => logLine(baseConsole.warn, ...args);
  console.error = (...args) => logLine(baseConsole.error, ...args);
  console.debug = (...args) => logLine(baseConsole.debug, ...args);
}

patchConsole();

module.exports = {
  stream: { write },
  streamWithConsole: { write: writeWithConsole },
  info: (...args) => logLine(baseConsole.log, ...args),
  warn: (...args) => logLine(baseConsole.warn, ...args),
  error: (...args) => logLine(baseConsole.error, ...args)
};
