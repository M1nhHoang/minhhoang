const fs = require('fs');
const path = require('path');

function getImagePath(filename) {
  const safeName = path.basename(filename);
  return path.join(__dirname, '..', 'public', 'images', safeName);
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.jpeg':
    case '.jpg':
    default:
      return 'image/jpeg';
  }
}

function sendImage(res, filePath) {
  const stream = fs.createReadStream(filePath);
  stream.on('open', () => {
    res.setHeader('Content-Type', getMimeType(filePath));
    stream.pipe(res);
  });
  stream.on('error', () => res.sendStatus(500));
}

function get(req, res) {
  const filePath = getImagePath(req.params.filename);
  fs.access(filePath, fs.constants.F_OK, error => {
    if (error) {
      return res.sendStatus(404);
    }
    return sendImage(res, filePath);
  });
}

module.exports = {
  get
};
