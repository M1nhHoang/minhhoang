# Tổng quan tính năng

Dự án đã được làm gọn lại để tập trung vào các thành phần cốt lõi: API đơn giản cho người dùng, trang tĩnh và kết nối MongoDB. Các tính năng Chess/AI/Chat đã được tách ra (xem các file `docs/legacy-*.md`).

## Kiến trúc
- **Express 4** cho HTTP server và static assets.
- **MongoDB + Mongoose** cho persistence.
- **Cấu hình qua `.env`** (xem `.env.example`).
- **Ghi log**: `morgan` với định dạng có thể chỉnh qua biến `LOG_FORMAT`.

## API hiện có
- `GET /api/health` — kiểm tra nhanh trạng thái server.
- `GET /api/users` — liệt kê người dùng, có thể lọc `?status=` (`online|offline|away`) và `?type=` (`guest|user|admin|bot`).
- `GET /api/users/:username` — lấy thông tin theo username.
- `POST /api/users` — tạo người dùng mới. Body tối thiểu: `{ "username": "your-name" }`. Trả `409` nếu trùng.
- `PATCH /api/users/:username/status` — cập nhật trạng thái, body: `{ "status": "online|offline|away" }`.

## Luồng trang chủ
- Mỗi client được gán cookie `userId` (30 ngày). Nếu chưa tồn tại trong DB, backend tạo một bản ghi guest.
- Trang tĩnh nằm trong `public/`; nếu truy cập sai route bằng trình duyệt, server trả về `public/index.html` cho phép client-side routing nhẹ.

## Cấu hình môi trường
Sao chép `.env.example` thành `.env` và chỉnh:
- `PORT`: cổng service.
- `MONGODB_URI`: connection string (ví dụ `mongodb://localhost:27017`).
- `MONGODB_DB`: tên database.
- `LOG_FORMAT`: định dạng log cho morgan (mặc định `dev`).
- `COOKIE_DOMAIN`: tuỳ chọn, nếu cần giới hạn domain cookie.

## Cấu trúc thư mục chính
- `app.js`: entrypoint Express.
- `config/database.js`: khởi tạo kết nối MongoDB.
- `controllers/`: controller cho page, user, image.
- `routes/`: khai báo route chính (`pageRoutes`, `apiRoutes`, `userRoutes`, `imageRoutes`).
- `services/`: nghiệp vụ (`pageService`, `userService`).
- `models/userModel.js`: schema Mongoose.
- `public/`: static assets (HTML/CSS/JS/images).
- `docs/`: tài liệu kiến trúc và tính năng legacy.

## Chạy & triển khai
1. `npm install`
2. Tạo `.env` từ `.env.example`.
3. `npm run dev` (dev với nodemon) hoặc `npm start`.
4. Đảm bảo MongoDB khả dụng theo `MONGODB_URI`.

## Tính năng đã gỡ
- Chess/Stockfish, AI captcha proxy, Socket chat: xem `docs/legacy-chess.md`, `docs/legacy-ai.md`, `docs/legacy-chat.md` để bật lại khi cần.
