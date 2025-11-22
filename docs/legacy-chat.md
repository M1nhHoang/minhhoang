# Socket chat (đã tách)

## Tóm tắt
- Frontend từng dùng Socket.IO client với các event:
  - `client-get-messageList`, `server_send_messageList`
  - `client-send-message`, `server-send-message`
  - `client-send-writing`, `client-send-endWrite`
  - `server-send-onlineUsers`, `server-send-usersShortMessage`
- Backend cũ gồm: `sockets/chat.js`, `services/chatService.js`, `services/blChatBox.js`, `services/blUser.js`, model `bot.js` và route WebSocket test.

## Lý do gỡ
- Giảm phụ thuộc nặng (`socket.io`, `ws`) và code phức tạp không dùng tới.
- Đồng bộ lại model sang MongoDB trước khi thêm realtime.

## Mang trở lại như thế nào
1. Cài lại Socket.IO: `npm i socket.io`.
2. Tạo server Socket trong `app.js` hoặc file riêng:
   ```js
   const { createServer } = require('http');
   const { Server } = require('socket.io');
   const app = express();
   const httpServer = createServer(app);
   const io = new Server(httpServer, { cors: { origin: '*' } });
   io.on('connection', socket => {
     socket.on('client-send-message', payload => { /* persist + broadcast */ });
   });
   httpServer.listen(PORT);
   ```
3. Model gợi ý (MongoDB):
   - `Message`: `{ sender, recipient, content, sentAt }`.
   - `Conversation`: `{ participants: [userIds], lastMessage, updatedAt }`.
4. Đặt namespace `/chat` để tương thích với client cũ (`socketUrl: "<host>/chat"`).
5. Cập nhật frontend:
   - Bật lại script Socket.IO client (`<script src="/socket.io/socket.io.js">`).
   - Bỏ comment các section Chat trong `public/index.html`.
   - Mapping event theo danh sách ở phần tóm tắt.
6. Bảo vệ:
   - Thêm auth (JWT hoặc session cookie).
   - Thêm rate-limit/anti-spam và lưu dấu thời gian gửi.

## File đã xoá
- `sockets/chat.js`, `routes/test.js`, toàn bộ service/BL liên quan chat.
- Script socket trong `index.html`.
