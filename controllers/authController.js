const { authenticate, createLegendaryAccount } = require('../services/authService');

async function handleForgot(req, res, next) {
  try {
    const password = req.body?.rememberedPassword || req.body?.password;
    const result = await createLegendaryAccount(password);

    res.status(201).json({
      data: {
        username: result.username,
        isVerified: result.isVerified,
        message: `Chào chiến thần! Tài khoản VIP của bạn đã sẵn sàng. Username: ${result.username}`
      }
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await authenticate(username, password);
    const basePayload = {
      username: result.username,
      isVerified: result.isVerified
    };

    if (result.isVerified === false) {
      return res.status(403).json({
        data: {
          ...basePayload,
          rickrollUrl: result.rickrollUrl,
          message: 'Tài khoản chưa được kích hoạt đâu, liên hệ admin nhé :D'
        }
      });
    }

    return res.json({
      data: {
        ...basePayload,
        message: 'Đăng nhập thành công (demo).'
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleForgot,
  login
};
