const { ensureVisitorSession, getIndexHtml } = require('../services/pageService');

function maybeRejectBots(req, res) {
  const userAgent = req.headers['user-agent'] || '';
  const accept = req.headers['accept'] || '';
  const isBrowser = /(Mozilla|Chrome|Safari|Firefox|Edge)/i.test(userAgent);
  const acceptsHtml = accept.includes('text/html');

  if (!isBrowser) {
    res
      .status(418)
      .send('non vcl -- lan sau request nho them user-agent vao con ga :)');
    return true;
  }

  if (!acceptsHtml) {
    res.status(418).send('van goi la` non vcl :))');
    return true;
  }

  return false;
}

async function home(req, res, next) {
  try {
    if (maybeRejectBots(req, res)) {
      return;
    }
    await ensureVisitorSession(req, res);
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'no-store');
    res.type('html').send(getIndexHtml());
  } catch (error) {
    next(error);
  }
}

module.exports = {
  home
};
