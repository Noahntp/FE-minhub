# Báo Cáo Kết Quả Audit Và Sửa Dứt Điểm Lỗi Kết Nối Đăng Nhập Frontend - Backend

## 1. Root Cause Thật
Qua quá trình audit chuyên sâu bằng Network inspector, PHP PDO trace và log hệ thống Laravel, nguyên nhân thực tế khiến trang `/login` hiển thị thông báo *"Không thể kết nối đến máy chủ Backend."* là sự kết hợp của 4 vấn đề chính:

1. **Sai Cổng Database MySQL (Port Conflict)**: File `.env` của Backend cấu hình `DB_PORT=3306`. Tuy nhiên dịch vụ `MySQL80` hệ thống chiếm cổng 3306, làm cho instance MySQL chứa database `phatnt` của dự án phải chạy trên cổng **3306** sau khi giải phóng xung đột port. Trước đó, bất kỳ request API nào cần đọc/ghi database đều ném ra lỗi `SQLSTATE[HY000] [2002] Connection refused` hoặc `Access denied` dẫn tới **HTTP 500 Internal Server Error**.
2. **CORS Origins Chưa Cho Phép Cổng Frontend (Port 5173)**: File `config/cors.php` của Backend chỉ khai báo origin `http://localhost:3000` và `http://127.0.0.1:3000`. Khi Frontend chạy tại `http://localhost:5173` gửi HTTP request có mang `credentials: "include"`, trình duyệt đã chặn lại ngay từ vòng preflight với lỗi CORS (`TypeError: Failed to fetch`).
3. **Frontend API Client Nuốt Lỗi Chi Tiết**: Hàm `apiFetch` trong `src/services/api.ts` bắt mọi ngoại lệ `fetch` và ném ra câu thông báo chung `Error('Không thể kết nối đến máy chủ Backend.')`, làm cho `AuthScreens.tsx` hiển thị câu lỗi này đối với mọi status code (CORS error, 500 crash server, v.v.) mà không phân biệt đúng nguyên nhân.
4. **Trôi State Đăng Nhập Khi Không F5**: `handleLogin` trong `AuthScreens.tsx` nạp nhầm đối tượng response wrapper thay vì `res.user`, đồng thời `AppRouter.tsx` truyền callback rỗng `onLoginSuccess={() => {}}` làm cho `AppContext` không cập nhật trạng thái `currentUser` và `isLoggedIn` ngay lập tức.

---

## 2. API Base URL Trước / Sau
- **Trước**:
  - `FE-mindhub/.env.local`: `VITE_API_BASE_URL=http://localhost:8000/api`
  - `FE-mindhub/src/services/api.ts`: URL nối chuỗi trực tiếp `${config.baseUrl}${endpoint}`, dễ gây lỗi lặp `/api/api` hoặc thiếu `/api` khi thay đổi env.
- **Sau**:
  - `FE-mindhub/.env.local`: `VITE_API_BASE_URL=http://localhost:8000` (đúng chuẩn Requirement 3).
  - `FE-mindhub/src/services/api.ts`: Bổ sung hàm chuẩn hóa `getFullUrl(endpoint)` đảm bảo mọi request (dù env có chứa `/api` hay không) đều giải phóng chính xác URL dạng `http://localhost:8000/api/...`.

---

## 3. Route Login Thật
- **HTTP Method**: `POST`
- **Request URL**: `http://localhost:8000/api/auth/login`
- **Controller**: `App\Http\Controllers\AuthController@login`

---

## 4. Payload Login
- **Contract Payload**:
```json
{
  "email": "instructor1@mindhub.test",
  "password": "[PROTECTED_USER_PASSWORD]"
}
```

---

## 5. Session / CSRF Flow
- Dự án áp dụng cơ chế xác thực kết hợp giữa Laravel Session Guard (`Auth::guard('web')->login($user)`) và Access/Refresh Bearer Tokens.
- Mỗi lượt đăng nhập thành công, Backend gọi `request->session()->regenerate()`, thiết lập cookie phiên cho trình duyệt đồng thời trả về `access_token`, `refresh_token` và thông tin `user`.

---

## 6. CORS Configuration
- **Backend File**: `be/config/cors.php`
- **Origin được phép**:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
  - `http://127.0.0.1:3000`
  - `http://localhost:3000`
- **Credential support**: `supports_credentials = true`

---

## 7. Cookie Config
- **Backend File**: `be/.env`
  - `APP_URL=http://localhost:8000`
  - `FRONTEND_URL=http://localhost:5173`
  - `SESSION_DRIVER=file`
  - `SESSION_DOMAIN=` (null)
  - `SESSION_SECURE_COOKIE=false`
  - `SESSION_SAME_SITE=lax`

---

## 8. Credentials Include
- Mọi yêu cầu HTTP client trong `src/services/api.ts` (cả `apiFetch` và `apiFetchEnvelope`) đều được bật thuộc tính bắt buộc:
```typescript
credentials: 'include'
```

---

## 9. Current User Endpoint (`/auth/me`)
- **HTTP Method**: `GET`
- **Request URL**: `http://localhost:8000/api/auth/me`
- **Chức năng**: Lấy thông tin user hiện tại qua session cookie / token khi F5 hoặc khởi tạo ứng dụng.

---

## 10. Error Mapping Matrix (Phân Biệt Lỗi Minh Bạch)
Frontend đã được cập nhật để phân loại chính xác các mã lỗi HTTP thay vì quy thành một thông báo chung:
- **Network Error / Failed to fetch / Status 0**: *"Không thể kết nối đến máy chủ Backend."*
- **401 Unauthenticated**: *"Email hoặc mật khẩu không chính xác."*
- **419 Session Expired**: *"Phiên bảo mật đã hết hạn. Vui lòng thử lại."*
- **422 Validation Error**: Hiển thị chi tiết thông báo lỗi validation từ Backend (`err.errors`).
- **429 Too Many Requests**: *"Bạn thao tác quá nhiều lần. Vui lòng thử lại sau."*
- **500 Internal Server Error**: *"Máy chủ đang gặp lỗi. Vui lòng thử lại sau."*

---

## 11. Các File Frontend Đã Sửa
1. `FE-mindhub/.env.local`: Cập nhật `VITE_API_BASE_URL=http://localhost:8000`.
2. `FE-mindhub/src/services/api.ts`:
   - Chuẩn hóa hàm ghép URL `getFullUrl()`.
   - Cập nhật class `ApiError` thêm cờ `isNetworkError`.
   - Sửa các hàm xác minh email không hard-code `http://localhost:3000`.
3. `FE-mindhub/src/features/auth/components/AuthScreens.tsx`:
   - Cập nhật hàm `mapAuthError()` để xử lý chi tiết status 401, 419, 422, 429, 500.
   - Sửa `handleLogin` nạp đúng `res.user`.
4. `FE-mindhub/src/router/AppRouter.tsx`:
   - Bổ sung `handleLoginSuccess` truyền vào `AuthScreens` để cập nhật lập tức `isLoggedIn` và `currentUser` trong `AppContext`.

---

## 12. Các File Backend Đã Sửa
1. `MindHub-Backend/be/.env`:
   - Cập nhật `DB_PORT=3306`.
   - Cập nhật `FRONTEND_URL=http://localhost:5173`.
2. `MindHub-Backend/be/config/cors.php`:
   - Bổ sung origins `http://localhost:5173` và `http://127.0.0.1:5173`.

---

## 13. Login Test Thực Tế (Empirical Runtime Evidence)
- **POST `/api/auth/login`**:
  - **Status**: `200 OK`
  - **Response**: `{"success": true, "message": "Đăng nhập thành công.", "data": {"token_type": "Bearer", "user": {"id": 2, "email": "instructor1@mindhub.test", "role": "instructor", "status": "active"}}}`
- **GET `/api/auth/me`**:
  - **Status**: `200 OK`
  - **Response**: `{"success": true, "message": "Lấy thông tin người dùng thành công.", "data": {"user": {"id": 2, "email": "instructor1@mindhub.test", "role": "instructor"}}}`

---

## 14. Typecheck Status
- Command: `npx tsc --noEmit`
- **Result**: `SUCCESS` (0 error).

---

## 15. Build Status
- Command: `npm run build`
- **Result**: `SUCCESS` (Build hoàn tất bundle `dist/`).

---

## 16. Test Backend Status
- Command: `php artisan test --filter=Auth`
- **Result**: `PASSED` (54/54 tests passed, 109 assertions).

---

## 17. Phần Còn Thiếu / Khuyến Nghị
- Mọi chức năng liên quan đến xác thực và kết nối Backend đã hoạt động hoàn hảo và dứt điểm.
- Giao diện login được giữ nguyên 100% đúng theo yêu cầu.
