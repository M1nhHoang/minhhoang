const crypto = require('crypto');
const path = require('path');
const {
  ensureGuestUser,
  getUserByName
} = require('./userService');

const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;
const SESSION_COOKIE = process.env.COOKIE_NAME || 'userId';

function buildCookieOptions() {
  const options = {
    maxAge: ONE_MONTH,
    sameSite: 'lax'
  };

  if (process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  return options;
}

async function ensureVisitorSession(req, res) {
  const cookieValue = req.cookies?.[SESSION_COOKIE];

  if (cookieValue) {
    const existingUser = await getUserByName(cookieValue);
    if (existingUser) {
      return cookieValue;
    }
  }

  const userId = crypto.randomBytes(6).toString('hex');
  await ensureGuestUser(userId);

  res.cookie(SESSION_COOKIE, userId, buildCookieOptions());
  return userId;
}

function resolveIndexFile() {
  return path.join(__dirname, '..', 'public', 'index.html');
}

module.exports = {
  ensureVisitorSession,
  resolveIndexFile
};
