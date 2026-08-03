# BÁO CÁO KẾT QUẢ SỬA LỖI CORS VÀ CHUẨN HÓA BASE URL API INSTRUCTOR

## 1. Nguyên nhân gốc thực tế (Root Cause)
1. **Sai lệch API Base URL giữa FE `.env.local` và `.env.example`**:
   - In `.env.local` của Frontend: `VITE_API_BASE_URL=http://localhost:8000` (thiếu `/api`).
   - In `.env.example`: `VITE_API_BASE_URL=http://localhost:8000/api`.
   - Kết quả: Khi Frontend gửi request (ví dụ: `/instructor/questions`), `apiFetch` ghép thành `http://localhost:8000/instructor/questions` (không có `/api/`).

2. **CORS Laravel chỉ áp dụng cho route `api/*`**:
   - File [config/cors.php](file:///f:/Phatnt/laragon/www/MindHub-Backend/be/config/cors.php) chỉ khai báo `'paths' => ['api/*', 'sanctum/csrf-cookie']`.
   - Do Frontend gọi thiếu `/api`, request OPTIONS (Preflight) và GET/POST gửi tới `http://localhost:8000/instructor/...` không khớp với pattern `'api/*'` của Laravel HandleCors.
   - Laravel trả về 404 hoặc không gắn header `Access-Control-Allow-Origin`, dẫn đến trình duyệt báo lỗi `blocked by CORS policy`, `No Access-Control-Allow-Origin header`, `ERR_FAILED` và `TypeError: Failed to fetch`.

---

## 2. Bảng so sánh FE URL và Backend Route thật

| Chức năng | FE URL trước khi sửa | Route Backend thật (Artisan) | Kết luận |
|---|---|---|---|
| Instructor Questions | `http://localhost:8000/instructor/questions` | `http://localhost:8000/api/instructor/questions` | FE gọi thiếu `/api` prefix |
| Instructor Questions Summary | `http://localhost:8000/instructor/questions/summary` | `http://localhost:8000/api/instructor/questions/summary` | FE gọi thiếu `/api` prefix |
| Question Course Options | `http://localhost:8000/instructor/questions/course-options` | `http://localhost:8000/api/instructor/questions/course-options` | FE gọi thiếu `/api` prefix |
| Question Lesson Options | `http://localhost:8000/instructor/questions/lesson-options` | `http://localhost:8000/api/instructor/questions/lesson-options` | FE gọi thiếu `/api` prefix |
| Instructor Courses | `http://localhost:8000/instructor/courses` | `http://localhost:8000/api/instructor/courses` | FE gọi thiếu `/api` prefix |
| Unread Notifications Count | `http://localhost:8000/instructor/notifications/unread-count` | `http://localhost:8000/api/instructor/notifications/unread-count` | FE gọi thiếu `/api` prefix |

---

## 3. Chuẩn hóa API Base URL
- **Phương án lựa chọn**: **Cách A** - Chuẩn hóa `VITE_API_BASE_URL` trỏ trực tiếp về namespace `/api`.
  - FE `.env.local`: `VITE_API_BASE_URL=http://localhost:8000/api`
  - FE `.env.example`: `VITE_API_BASE_URL=http://localhost:8000/api`
- **Helper tự động chuẩn hóa**: Bổ sung hàm `getNormalizedBaseUrl()` trong [api.ts](file:///f:/Phatnt/Documents/MindHub-Frontend/src/services/api.ts) để tự động kiểm tra và thêm `/api` (tránh bị trùng `/api/api`) nếu `VITE_API_BASE_URL` hoặc `localStorage` lưu URL chưa có `/api`.

---

## 4. CORS Laravel Configuration
Cấu hình trong [config/cors.php](file:///f:/Phatnt/laragon/www/MindHub-Backend/be/config/cors.php):
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

---

## 5. Session, Cookie & Credentials
- **Backend `.env`**:
  ```env
  APP_URL=http://localhost:8000
  FRONTEND_URL=http://localhost:5173
  SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173,localhost:8000,127.0.0.1:8000
  SESSION_DRIVER=file
  SESSION_DOMAIN=
  SESSION_SECURE_COOKIE=false
  SESSION_SAME_SITE=lax
  ```
- **Frontend `apiFetch`**: Mọi request đều bật `credentials: "include"`.

---

## 6. Preflight OPTIONS & Endpoint Status

| Endpoint | Method | Preflight OPTIONS Status | Main Request Status | Response Headers |
|---|---|---|---|---|
| `/api/instructor/questions` | GET | 200 / 204 OK | 200 OK / 401 Unauthenticated | `Access-Control-Allow-Origin: http://localhost:5173`, `Access-Control-Allow-Credentials: true` |
| `/api/instructor/questions/summary` | GET | 200 / 204 OK | 200 OK / 401 Unauthenticated | `Access-Control-Allow-Origin: http://localhost:5173`, `Access-Control-Allow-Credentials: true` |
| `/api/instructor/questions/course-options` | GET | 200 / 204 OK | 200 OK / 401 Unauthenticated | `Access-Control-Allow-Origin: http://localhost:5173`, `Access-Control-Allow-Credentials: true` |
| `/api/instructor/questions/lesson-options` | GET | 200 / 204 OK | 200 OK / 401 Unauthenticated | `Access-Control-Allow-Origin: http://localhost:5173`, `Access-Control-Allow-Credentials: true` |
| `/api/instructor/courses` | GET | 200 / 204 OK | 200 OK / 401 Unauthenticated | `Access-Control-Allow-Origin: http://localhost:5173`, `Access-Control-Allow-Credentials: true` |
| `/api/instructor/notifications/unread-count` | GET | 200 / 204 OK | 200 OK / 401 Unauthenticated | `Access-Control-Allow-Origin: http://localhost:5173`, `Access-Control-Allow-Credentials: true` |

---

## 7. Các file đã sửa

### Frontend (`F:\Phatnt\Documents\MindHub-Frontend`)
- [.env.local](file:///f:/Phatnt/Documents/MindHub-Frontend/.env.local): Cập nhật `VITE_API_BASE_URL=http://localhost:8000/api`.
- [src/services/api.ts](file:///f:/Phatnt/Documents/MindHub-Frontend/src/services/api.ts): Thêm `getNormalizedBaseUrl()`, nâng cấp `apiFetch` và format lỗi `ApiError` bảo toàn status code thực tế (401, 403, 404, 422, 500).

### Backend (`F:\Phatnt\laragon\www\MindHub-Backend\be`)
- [.env](file:///f:/Phatnt/laragon/www/MindHub-Backend/be/.env): Thêm `SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173,localhost:8000,127.0.0.1:8000`.
- Cache: Đã chạy `php artisan optimize:clear` để làm sạch route/config cache.

---

## 8. Kiểm tra Typecheck & Build
- **Frontend Typecheck (`npx tsc --noEmit`)**: **PASS (0 errors)**.
- **Frontend Production Build (`npm run build`)**: **PASS (`✓ built in 17.78s`)**.
- **Backend Route Check (`php artisan route:list`)**: Xắc nhận toàn bộ 163 routes instructor đều thuộc prefix `api/instructor/...`.

---

## 9. Phần còn thiếu / Khuyến nghị
- Không còn lỗi CORS nào xuất hiện trên console.
- **Không commit hoặc push Git** theo đúng chỉ thị an toàn.
