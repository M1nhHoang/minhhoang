# Chess service (đã tách)

## Tóm tắt
- Endpoint cũ: `GET /api/chess/getbestmove?fen=<FEN>&time=<ms>`.
- Triển khai bằng `child_process.spawn` chạy binary `stockfish_10_x64`.
- Không còn tồn tại trong codebase và binary đã bị xoá.

## Lý do gỡ
- Binary nặng (~1.2MB) và khó triển khai cross-platform.
- Tăng footprint dependencies (Socket, request) không cần thiết cho phiên bản hiện tại.

## Thành phần đã bỏ
- `controllers/chess.js`, `routes/chess.js`.
- Binary `services/stockfish_10_x64`.
- Tham chiếu Socket/AI trong frontend.

## Mang trở lại như thế nào
1. Cài lại engine: dùng Docker image Stockfish, hoặc đặt binary vào `services/engines/stockfish` (thêm vào `.gitignore`).
2. Cài dependency nếu muốn dùng npm: `npm i stockfish` hoặc giữ `child_process`.
3. Tạo controller mới (ví dụ `controllers/chessController.js`) theo chuẩn hiện tại:
   ```js
   const { spawn } = require('child_process');

   async function getBestMove(req, res, next) {
     try {
       const { fen, time = 500 } = req.query;
       if (!fen) return res.status(400).json({ message: 'fen is required' });
       const thinkTime = Math.min(Number(time) || 500, 5000);
       const engine = spawn(pathToBinary);
       // ghi lệnh UCI, đọc stdout và trả về bestmove...
     } catch (error) {
       next(error);
     }
   }
   module.exports = { getBestMove };
   ```
4. Đăng ký route trong `routes/apiRoutes.js`: `router.get('/chess/getbestmove', chessController.getBestMove);`.
5. Nếu cần lưu lịch sử, tạo schema mới trong `models/` (ví dụ `chessMatchModel.js`) và dùng MongoDB để audit.

## Ghi chú triển khai
- Giới hạn `movetime` để tránh chặn event loop.
- Đảm bảo cleanup process khi request bị huỷ.
- Với môi trường serverless, ưu tiên container hoặc microservice riêng thay vì spawn trực tiếp.
