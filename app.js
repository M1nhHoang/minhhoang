require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { connectDatabase } = require('./config/database');
const logger = require('./config/logger');

const pageRoutes = require('./routes/pageRoutes');
const apiRoutes = require('./routes/apiRoutes');
const imageRoutes = require('./routes/imageRoutes');

const app = express();
const logFormat = process.env.LOG_FORMAT || 'dev';

app.set('trust proxy', true);
app.use(morgan(logFormat, { stream: logger.streamWithConsole }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', pageRoutes);
app.use('/images', imageRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Not found' });
  }
  return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// error handler
app.use((err, req, res, next) => {
  logger.error('[error]', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal server error'
  });
});

const port = process.env.PORT || 3000;

async function start() {
  await connectDatabase();
  app.listen(port, () => {
    logger.info(`Server started on port ${port}`);
  });
}

start().catch(error => {
  logger.error('Unable to start server without database connection:', error);
  process.exit(1);
});
