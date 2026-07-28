# FE_BE_API_AUTH_FIX_REPORT.md

---

### 1. Backend Path
`F:\Phatnt\laragon\www\MindHub-Backend\be`

### 2. Frontend Path
`F:\Phatnt\Documents\MindHub-Frontend`

### 3. API Base URL
`VITE_API_BASE_URL=http://127.0.0.1:8000/api`

---

### 4. Endpoint Category Cũ và Mới
- **Cũ (404 Not Found)**: `GET /api/courses/categories`
- **Mới (Laravel Route Thật)**: `GET /api/categories` (`CatalogController@categories`)
- **Chi tiết sửa**: Đã cập nhật `getCategoriesWithCount()` trong `src/services/api.ts` gọi `apiFetch<any[]>('/categories')` và map cấu trúc danh mục chính xác từ API response.

---

### 5. Endpoint Bestseller Cũ và Mới
- **Cũ (404 Not Found)**: `GET /api/courses/bestsellers`
- **Mới (Route Thật + Dynamic Sorting)**: Backend Laravel chưa định nghĩa riêng route `/bestsellers` nhưng cung cấp route public danh mục `GET /api/courses` (`CatalogController@searchCourses`).
- **Chi tiết sửa**: Đã cập nhật `getBestsellerCourses()` trong `src/services/api.ts` gọi `apiFetch<Course[]>('/courses')` và sắp xếp theo số lượng học viên (`enrollments_count` / `students`) giảm dần từ dữ liệu thật, không gọi endpoint không tồn tại và không dùng mock data.

---

### 6. Lý do Guest Enrollment/Activity bị gọi
- Trong `App.tsx`, khi chưa đăng nhập, state `currentUser.id` được gán bằng `'u-guest'`.
- Code trước đây không kiểm tra trạng thái xác thực mà tự động truyền `'u-guest'` vào `ApiService.getUserEnrollments('u-guest')` và `ApiService.getUserActivities('u-guest')`.
- Việc này làm Frontend tạo HTTP GET request tới `/api/users/guest/enrollments` và `/api/users/guest/activities` làm Backend trả lỗi 404 Not Found liên tục lên Browser Console.

---

### 7. Cách đã sửa Auth Guard
- Trong `App.tsx`:
  Guard kiểm tra `if (isLoggedIn && currentUser && currentUser.id && currentUser.id !== "u-guest")` trước khi gọi các API cá nhân (`getUserEnrollments`, `getUserActivities`, `getMyEnrolledCourses`).
- Trong `src/services/api.ts`:
  Nếu `!userId || userId === 'u-guest'`, hàm `getUserEnrollments` và `getUserActivities` lập tức trả về `[]` mà không gửi bất kỳ HTTP request nào.
  Đối với người dùng đã đăng nhập thật, hàm gọi đúng route Backend:
  - `getUserEnrollments`: `GET /api/me/courses` (`LearningController@myCourses`)
  - `getUserActivities`: `GET /api/learning-logs/my` (`LearningController@learningLogs`)

---

### 8. Login Payload
- Endpoint: `POST http://127.0.0.1:8000/api/auth/login`
- Content-Type: `application/json`
- Accept: `application/json`
- Structure:
  ```json
  {
    "email": "instructor1@mindhub.test",
    "password": "12345678"
  }
  ```

---

### 9. Nguyên nhân Login 401
- Tài khoản học viên seed cũ `learner1@mindhub.test` trong CSDL có hash mật khẩu chưa khớp với `12345678`. Đã cập nhật hash mật khẩu của `learner1@mindhub.test` thành `12345678` chuẩn bằng Laravel bcrypt Hash.
- Hàm `handleQuickLogin` trước đó bỏ qua API call và giả lập đăng nhập bằng client object. Đã cập nhật `handleQuickLogin` tự động điền form và gọi qua real API `POST /api/auth/login` để xác thực chuẩn 100% với Backend CSDL.

---

### 10. Cấu hình Credentials/Session
- Frontend `apiFetch` truyền `credentials: "include"`.
- Token nhận được lưu trong state/localStorage và gửi qua `Authorization: Bearer <token>`.
- Backend tự động tạo `auth_session` trong bảng `sessions` CSDL và liên kết với token session.

---

### 11. CORS Cấu hình Backend (`config/cors.php`)
```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://127.0.0.1:3000',
        'http://localhost:3000',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

---

### 12. Nguyên nhân Vite WebSocket mất kết nối
- `vite.config.ts` trước đó khai báo `host: "127.0.0.1"`, làm cho các truy cập trình duyệt từ `localhost:3000` hoặc WebSocket `ws://localhost:3000` không kết nối được tới dev server socket interface.
- Đã cập nhật `host: "0.0.0.0"`, `port: 3000`, `strictPort: true` trong `vite.config.ts` để Vite dev server nhận cả `127.0.0.1` và `localhost`.

---

### 13. File đã sửa
- `F:\Phatnt\Documents\MindHub-Frontend\vite.config.ts`
- `F:\Phatnt\Documents\MindHub-Frontend\src\services\api.ts`
- `F:\Phatnt\Documents\MindHub-Frontend\src\App.tsx`
- `F:\Phatnt\Documents\MindHub-Frontend\src\components\AuthScreens.tsx`
- `F:\Phatnt\Documents\MindHub-Frontend\src\components\InstructorWithdrawal.tsx`
- `F:\Phatnt\Documents\MindHub-Frontend\src\features\QA\types.ts`
- `F:\Phatnt\laragon\www\MindHub-Backend\be\config\cors.php`
- `F:\Phatnt\laragon\www\MindHub-Backend\be\.env`

---

### 14. Route List liên quan trong Backend
- `GET api/categories` -> `CatalogController@categories`
- `GET api/courses` -> `CatalogController@searchCourses`
- `GET api/courses/featured` -> `CatalogController@featuredCourses`
- `GET api/courses/latest` -> `CatalogController@latestCourses`
- `POST api/auth/login` -> `AuthController@login`
- `GET api/auth/me` -> `AuthController@me`
- `POST api/auth/logout` -> `AuthController@logout`
- `GET api/me/courses` -> `LearningController@myCourses`
- `GET api/learning-logs/my` -> `LearningController@learningLogs`

---

### 15. Test Login Sai (HTTP 401)
- Payload: `{"email": "instructor1@mindhub.test", "password": "wrongpassword"}`
- Status: `401 Unauthorized`
- Phản hồi: `{"success": false, "message": "Email hoặc mật khẩu không đúng.", "errors": []}`

---

### 16. Test Login Đúng (HTTP 200)
- Payload: `{"email": "instructor1@mindhub.test", "password": "12345678"}`
- Status: `200 OK`
- Phản hồi: `{"success": true, "message": "Đăng nhập thành công.", "data": { "access_token": "...", "user": { "id": 2, "email": "instructor1@mindhub.test", "role": "instructor" } } }`

---

### 17. Test Guest (Chưa đăng nhập)
- Truy cập trang chủ khi chưa đăng nhập.
- Không gọi API `enrollments` / `activities` dành cho guest.
- `GET /api/categories` trả HTTP 200 OK thành công.
- `GET /api/courses` và `GET /api/courses/featured` trả HTTP 200 OK thành công.
- Browser Console 100% sạch lỗi 404 / 401.

---

### 18. TypeScript Result
- Lệnh: `npx tsc --noEmit`
- Kết quả: **Pass 100%** (0 errors).

---

### 19. Lint Result
- Không có lỗi syntax / compile lint.

---

### 20. Build Result
- Lệnh: `npm run build`
- Kết quả: **built in 35.05s** (Tạo thành công bundle `dist/`).
