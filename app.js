const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
const fs = require('fs');
const path = require('path');

const app = express();

// create http server using express
const server = http.createServer(app);

// const io = require('socket.io')(server);
// const _chatSocket = require('./sockets/chat');
// _chatSocket(io.of('/chat'));

// Register middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', true)

// API Endpoint
_pageRouter = require('./routes/page');
_pageRouter(app)

_imagesRouter = require('./routes/images')
_imagesRouter(app)

_chessRouter = require('./routes/chess')
_chessRouter(app)

_AiRouter = require('./routes/AI');
_AiRouter(app)


// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
