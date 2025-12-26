# Role Matrix - Hệ thống phân quyền

## Tổng quan

Hệ thống sử dụng **3 loại role chính** để quản lý quyền truy cập:

| Role | Mã số | Mô tả |
|------|-------|-------|
| **Guest** | 0 | Người dùng chưa đăng nhập hoặc chưa xác thực |
| **Verified** | 1 | Người dùng đã đăng ký và được xác thực |
| **VIP** | 2 | Người dùng VIP với quyền mở rộng |
| **Admin** | 99 | Quản trị viên hệ thống (Super Admin) |

---

## Chi tiết Role

### 🔓 Guest (Role: 0)
- Người dùng truy cập lần đầu
- Được tạo tự động với cookie `userId`
- Quyền hạn cơ bản nhất

### ✅ Verified (Role: 1)
- Người dùng đã đăng ký tài khoản
- Đã được admin xác thực (`isVerified: true`)
- Có thể sử dụng các tính năng cơ bản

### ⭐ VIP (Role: 2)
- Người dùng đặc biệt
- Có quyền truy cập các tính năng nâng cao
- Ưu tiên hỗ trợ

### 👑 Admin (Role: 99)
- Quản trị viên cao nhất
- Toàn quyền truy cập hệ thống
- Tài khoản mặc định: `admin/admin` (từ ENV)

---

## Ma trận quyền truy cập

### 📱 Trang & Giao diện (Pages)

| Trang/Màn hình | Guest | Verified | VIP | Admin | Ghi chú |
|----------------|:-----:|:--------:|:---:|:-----:|---------|
| Trang chủ (`/`) | ✅ | ✅ | ✅ | ✅ | Public |
| Đăng nhập (`/login`) | ✅ | ❌ | ❌ | ❌ | Chỉ khi chưa login |
| Đăng ký (`/register`) | ✅ | ❌ | ❌ | ❌ | Chỉ khi chưa login |
| Profile cá nhân (`/profile`) | ❌ | ✅ | ✅ | ✅ | Cần đăng nhập |
| Cài đặt (`/settings`) | ❌ | ✅ | ✅ | ✅ | Cần đăng nhập |
| VIP Zone (`/vip`) | ❌ | ❌ | ✅ | ✅ | Chỉ VIP+ |
| **Admin Dashboard (`/admin`)** | ❌ | ❌ | ❌ | ✅ | **Chỉ Admin** |
| Quản lý Users (`/admin/users`) | ❌ | ❌ | ❌ | ✅ | Chỉ Admin |
| Quản lý Settings (`/admin/settings`) | ❌ | ❌ | ❌ | ✅ | Chỉ Admin |
| System Logs (`/admin/logs`) | ❌ | ❌ | ❌ | ✅ | Chỉ Admin |

### 🔌 API Endpoints

| Endpoint | Method | Guest | Verified | VIP | Admin | Mô tả |
|----------|--------|:-----:|:--------:|:---:|:-----:|-------|
| `/api/health` | GET | ✅ | ✅ | ✅ | ✅ | Health check |
| `/api/auth/login` | POST | ✅ | ✅ | ✅ | ✅ | Đăng nhập |
| `/api/auth/forgot` | POST | ✅ | ✅ | ✅ | ✅ | Quên mật khẩu |
| `/api/auth/logout` | POST | ❌ | ✅ | ✅ | ✅ | Đăng xuất |
| `/api/users` | GET | ❌ | ✅ | ✅ | ✅ | Xem danh sách users |
| `/api/users/:username` | GET | ❌ | ✅ | ✅ | ✅ | Xem thông tin user |
| `/api/users` | POST | ✅ | ❌ | ❌ | ✅ | Tạo user mới |
| `/api/users/:username/status` | PATCH | ❌ | ⚠️ | ⚠️ | ✅ | Cập nhật status (chỉ của mình) |
| `/api/users/:username` | DELETE | ❌ | ❌ | ❌ | ✅ | Xoá user |
| `/api/users/:username/role` | PATCH | ❌ | ❌ | ❌ | ✅ | Thay đổi role |
| `/api/users/:username/verify` | PATCH | ❌ | ❌ | ❌ | ✅ | Xác thực user |
| `/api/weather` | GET | ❌ | ✅ | ✅ | ✅ | Xem thời tiết |
| `/api/weather/forecast` | GET | ❌ | ❌ | ✅ | ✅ | Xem dự báo (VIP feature) |

**Chú thích:**
- ✅ = Được phép
- ❌ = Không được phép
- ⚠️ = Được phép có điều kiện (chỉ với resource của chính mình)

---

## Chức năng theo Role

### Guest có thể:
- Xem trang chủ
- Đăng ký tài khoản
- Đăng nhập

### Verified có thể:
- Tất cả của Guest +
- Xem/sửa profile cá nhân
- Xem danh sách users
- Sử dụng API weather
- Thay đổi status của chính mình

### VIP có thể:
- Tất cả của Verified +
- Truy cập VIP Zone
- Xem weather forecast chi tiết
- Các tính năng premium khác (sẽ bổ sung)

### Admin có thể:
- **Toàn quyền hệ thống**
- Truy cập Admin Dashboard
- Quản lý tất cả users (CRUD)
- Thay đổi role của users
- Xác thực/huỷ xác thực users
- Xem system logs
- Cấu hình hệ thống

---

## Cấu hình trong Code

### Model (userModel.js)
```javascript
const USER_ROLES = {
  GUEST: 0,
  VERIFIED: 1,    // User đã xác thực
  VIP: 2,         // User VIP
  ADMIN: 99       // Super Admin
};
```

### Middleware Usage
```javascript
const { requireAuth, requireRole, requireAdmin } = require('./middleware/authMiddleware');
const { USER_ROLES } = require('./models/userModel');

// Chỉ verified users
router.get('/profile', requireAuth, requireRole(USER_ROLES.VERIFIED), controller.profile);

// Chỉ VIP
router.get('/vip-zone', requireAuth, requireRole(USER_ROLES.VIP), controller.vipZone);

// Chỉ Admin
router.get('/admin', requireAuth, requireAdmin, controller.adminDashboard);
```

---

## Luồng xác thực User

```
┌─────────────────────────────────────────────────────────────┐
│                     User Flow                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   [Truy cập lần đầu]                                        │
│          │                                                   │
│          ▼                                                   │
│   ┌─────────────┐                                           │
│   │   GUEST     │  role: 0                                  │
│   │ (Auto-created)│                                         │
│   └──────┬──────┘                                           │
│          │ Đăng ký + Admin verify                           │
│          ▼                                                   │
│   ┌─────────────┐                                           │
│   │  VERIFIED   │  role: 1                                  │
│   │ (isVerified)│                                           │
│   └──────┬──────┘                                           │
│          │ Admin nâng cấp                                   │
│          ▼                                                   │
│   ┌─────────────┐                                           │
│   │    VIP      │  role: 2                                  │
│   │ (Premium)   │                                           │
│   └─────────────┘                                           │
│                                                              │
│   ┌─────────────┐                                           │
│   │   ADMIN     │  role: 99 (tạo từ ENV hoặc được chỉ định) │
│   │(Super Admin)│                                           │
│   └─────────────┘                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Biến môi trường

```env
# Default Admin Account
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
```

Admin mặc định sẽ được tạo tự động khi khởi động server nếu chưa tồn tại trong database.

---

## Tính năng Admin Dashboard

### 🎨 Quản lý Theme (Admin Only)

Admin có thể quản lý Seasonal Theme của hệ thống:

| Chức năng | Mô tả |
|-----------|-------|
| **Xem theme hiện tại** | Hiển thị theme đang active và mode (Thủ công/Tự động) |
| **Chọn theme** | Chọn từ danh sách: Christmas, Halloween, Valentine, Summer, Default |
| **Apply theme** | Áp dụng theme đã chọn cho toàn hệ thống |
| **Reset về tự động** | Xóa theme thủ công, để hệ thống auto-detect theo mùa/thời tiết |

#### Theme Persistence

Theme được lưu vào `localStorage` để giữ nguyên sau khi:
- Refresh trang
- Đăng xuất / Đăng nhập lại
- Đóng trình duyệt

```javascript
// Storage key
localStorage['minhhoang_seasonal_theme'] = 'christmas';

// Khi init, ưu tiên đọc từ localStorage
const savedTheme = loadThemeFromStorage();
if (savedTheme) {
  applyTheme(savedTheme); // Manual mode
} else {
  autoDetectTheme();      // Auto mode
}
```

#### Mode hiển thị

| Mode | Icon | Ý nghĩa |
|------|------|---------|
| 🔧 Thủ công | Manual | Theme được admin chọn thủ công |
| 🔄 Tự động | Auto | Theme tự detect theo mùa/thời tiết |

---

## TODO - Chức năng cần triển khai

- [x] Trang Admin Dashboard (`/admin`)
- [x] API quản lý users cho Admin
- [x] Trang VIP Zone (`/vip`)
- [x] API thay đổi role
- [x] Theme Management với persistence
- [ ] Session/JWT authentication
- [ ] Logging cho admin actions
- [ ] Rate limiting theo role

---

## Changelog

| Ngày | Thay đổi |
|------|----------|
| 2025-12-26 | Khởi tạo document Role Matrix |
| 2025-12-26 | Thêm USER_ROLES vào userModel |
| 2025-12-26 | Tạo authMiddleware với requireRole |
| 2025-12-27 | Hoàn thành Admin Dashboard với User Management |
| 2025-12-27 | Thêm Theme Management vào Admin Dashboard |
| 2025-12-27 | Thêm Theme Persistence (localStorage) - giữ theme sau refresh/logout |
