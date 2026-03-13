# Asset Versioning Guide

> **Tài liệu này giải thích cách sử dụng cache busting cho frontend assets.**

## Tổng quan

Để đảm bảo browser load phiên bản mới nhất của CSS/JS sau mỗi lần deploy, chúng ta sử dụng query string versioning với placeholder `__ASSET_VERSION__`.

## Cách hoạt động

### 1. Trong HTML (`public/index.html`)

Thêm `?v=__ASSET_VERSION__` vào cuối URL của mọi static asset:

```html
<!-- CSS files -->
<link rel="stylesheet" href="/styles/app.css?v=__ASSET_VERSION__">
<link rel="stylesheet" href="/styles/admin.css?v=__ASSET_VERSION__">

<!-- Seasonal CSS (nếu load động) -->
<link rel="stylesheet" href="/styles/seasonal/christmas.css?v=__ASSET_VERSION__">

<!-- JavaScript modules -->
<script type="module" src="/scripts/app.js?v=__ASSET_VERSION__"></script>
```

### 2. Server-side replacement (`services/pageService.js`)

Khi serve `index.html`, server sẽ tự động replace `__ASSET_VERSION__` bằng version thực:

```javascript
const ASSET_VERSION = process.env.ASSET_VERSION || Date.now().toString(36);

function getIndexHtml() {
  // ...
  return cachedIndexTemplate.replace(/__ASSET_VERSION__/g, ASSET_VERSION);
}
```

**Kết quả:** Browser sẽ nhận được:
```html
<link rel="stylesheet" href="/styles/app.css?v=m5x7k2">
```

### 3. Trong JavaScript modules (dynamic imports)

Khi cần load CSS động từ JavaScript, sử dụng cùng pattern:

```javascript
// ❌ KHÔNG làm như này - browser có thể cache version cũ
link.href = '/styles/seasonal/christmas.css';

// ✅ Thêm version parameter
link.href = '/styles/seasonal/christmas.css?v=' + Date.now();

// ✅ Hoặc tốt hơn - truyền version từ server
link.href = `/styles/seasonal/christmas.css?v=${window.__ASSET_VERSION__}`;
```

## Checklist khi thêm frontend module mới

### CSS Files
- [ ] Thêm `?v=__ASSET_VERSION__` trong `<link>` tag nếu load trong HTML
- [ ] Thêm version param nếu load động từ JavaScript

### JavaScript Files  
- [ ] Thêm `?v=__ASSET_VERSION__` trong `<script>` tag
- [ ] ES modules import không cần version (browser xử lý qua HTTP cache headers)

### Ví dụ thêm module mới

**1. Thêm CSS mới trong index.html:**
```html
<!-- Thêm vào <head> -->
<link rel="stylesheet" href="/styles/new-feature.css?v=__ASSET_VERSION__">
```

**2. Thêm JS mới trong index.html:**
```html
<!-- Thêm trước </body> -->
<script type="module" src="/scripts/modules/new-feature.js?v=__ASSET_VERSION__"></script>
```

**3. Dynamic CSS load trong JavaScript:**
```javascript
function loadFeatureCSS() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/styles/new-feature.css?v=' + Date.now();
  document.head.appendChild(link);
}
```

## Seasonal Theme CSS

Các file CSS seasonal được load động bởi `SeasonalManager`:

| Theme | CSS Path |
|-------|----------|
| Christmas | `/styles/seasonal/christmas.css` |
| Lunar New Year | `/styles/seasonal/lunarnewyear.css` |
| New Year | `/styles/seasonal/newyear.css` |

Khi load trong JS, nhớ thêm version:
```javascript
this.loadCSS(`/styles/seasonal/${theme}.css?v=${Date.now()}`);
```

## Deploy Flow

1. **GitHub Actions** push code lên server (xem `.github/workflows/deploy.yml`)
2. **Server restart** → `Date.now()` tạo version mới
3. **pageService.js** replace `__ASSET_VERSION__` với version mới
4. **Browser** nhận URL mới → load file mới từ server

## Environment Variable

Có thể set version cố định qua env:
```bash
ASSET_VERSION=v2.1.0 npm start
```

Nếu không set, server tự dùng `Date.now().toString(36)` → version mới mỗi lần restart.

## Troubleshooting

### Browser vẫn load file cũ?
1. Check xem đã thêm `?v=__ASSET_VERSION__` chưa
2. Hard refresh: `Ctrl + Shift + R` (Windows) / `Cmd + Shift + R` (Mac)
3. Clear browser cache

### Version không đổi sau deploy?
- Kiểm tra server đã restart chưa (touch `tmp/restart.txt`)
- Kiểm tra `pageService.js` có được load lại không

---

**Cập nhật lần cuối:** 2025-12-28
