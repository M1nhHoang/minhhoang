# AI/Captcha proxy (đã tách)

## Tóm tắt
- Endpoint cũ: `POST /api/ai/captchahusc` nhận `image` (base64) và forward tới `http://117.2.182.218:7777/captchahusc`.
- Sử dụng package `request` (đã deprecated).

## Lý do gỡ
- Phụ thuộc vào service bên ngoài, dễ lỗi và không cần cho phiên bản tối giản.
- Giảm bề mặt tấn công và gọn package.

## Thành phần đã bỏ
- `controllers/AI.js`, `routes/AI.js`.
- Package `request`.

## Mang trở lại như thế nào
1. Cài HTTP client hiện đại: `npm i node-fetch` hoặc `npm i axios`.
2. Tạo controller mới (ví dụ `controllers/aiController.js`):
   ```js
   const fetch = require('node-fetch');

   async function captchaHUSC(req, res, next) {
     try {
       const base64 = (req.body.image || '').replace(/^data:image\\/\\w+;base64,/, '');
       if (!base64) return res.status(400).json({ message: 'image is required (base64)' });
       const upstream = process.env.CAPTCHA_SERVICE_URL;
       const response = await fetch(upstream, {
         method: 'POST',
         body: new URLSearchParams({ image: base64 })
       });
       const text = await response.text();
       if (!response.ok) throw new Error(text);
       return res.json({ status: 'success', result: text });
     } catch (error) {
       next(error);
     }
   }
   module.exports = { captchaHUSC };
   ```
3. Khai báo route trong `routes/apiRoutes.js`: `router.post('/ai/captchahusc', aiController.captchaHUSC);`.
4. Thêm biến môi trường `CAPTCHA_SERVICE_URL` vào `.env`.

## Lưu ý bảo mật
- Xác thực input (kích thước, loại ảnh) để tránh abuse.
- Thêm rate-limit và auth nếu public.
- Log lỗi nhưng không log nội dung ảnh nếu chứa dữ liệu nhạy cảm.
