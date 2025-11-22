const User = require('../models/userModel');

const WORD_FIRST = [
  'nguoi',
  'anh',
  'chi',
  'ban',
  'thanh',
  'meo',
  'cho',
  'lofi',
  'tho',
  'hacker',
  'trum'
];

const WORD_MIDDLE = [
  'langthang',
  'matngu',
  'banhmi',
  'gauhong',
  'bactom',
  'tradao',
  'anhhangxom',
  'thanhnien',
  'tuhoc',
  'rickroller',
  'memay'
];

const WORD_ENDING = [
  '69',
  '420',
  'vip',
  'pro',
  'legend',
  'idol',
  'ghost',
  'rick'
];

const RICKROLL_LINKS = [
  'https://www.youtube.com/shorts/HXe3DieZHNI',
  'https://www.youtube.com/watch?v=bU3dvNu_jss'
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

async function generateFunUsername() {
  const maxAttempts = 8;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const parts = [pickRandom(WORD_FIRST), pickRandom(WORD_MIDDLE)];
    if (Math.random() > 0.35) {
      parts.push(pickRandom(WORD_ENDING));
    }
    const candidate = parts.join('_');
    // eslint-disable-next-line no-await-in-loop
    const exists = await User.exists({ username: candidate });
    if (!exists) {
      return candidate;
    }
  }

  const fallback = `${pickRandom(WORD_FIRST)}_${pickRandom(WORD_MIDDLE)}_${Math.floor(
    100 + Math.random() * 900
  )}`;
  return fallback;
}

function errorWithStatus(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createLegendaryAccount(rememberedPassword) {
  const normalizedPassword = (rememberedPassword || "").trim();
  if (!normalizedPassword) {
    throw errorWithStatus('rememberedPassword is required', 400);
  }

  const username = await generateFunUsername();
  const created = await User.create({
    username,
    password: normalizedPassword,
    type: 'user',
    status: 'offline',
    isVerified: false,
    metadata: {
      origin: 'forgot-password',
      vibe: 'vip_unverified'
    }
  });

  return {
    username: created.username,
    isVerified: created.isVerified
  };
}

function pickRickroll() {
  return pickRandom(RICKROLL_LINKS);
}

async function authenticate(username, password) {
  const normalizedUsername = (username || "").trim();
  const normalizedPassword = (password || "").trim();

  if (!normalizedUsername || !normalizedPassword) {
    throw errorWithStatus('username and password are required', 400);
  }

  const user = await User.findOne({ username: normalizedUsername }).lean();
  if (!user || (user.password || '') !== normalizedPassword) {
    throw errorWithStatus('invalid credentials', 401);
  }

  if (user.isVerified === false) {
    return {
      username: user.username,
      isVerified: false,
      rickrollUrl: pickRickroll()
    };
  }

  return {
    username: user.username,
    isVerified: true
  };
}

module.exports = {
  authenticate,
  createLegendaryAccount,
  pickRickroll,
  RICKROLL_LINKS
};
