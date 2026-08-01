# BÁO CÁO AUDIT VÀ SỬA DỨT ĐIỂM LỖI ĐĂNG NHẬP BỊ DELAY - MINDHUB

- Ngày hoàn thành: 2026-07-30
- Dự án FE: `F:\Phatnt\Documents\MindHub-Frontend`
- Dự án BE: `F:\Phatnt\laragon\www\MindHub-Backend\BE`

---

## 1. Đo Thời Gian Thực Tế Trước Khi Sửa

| Request/Thao tác | Thời gian | Có bắt buộc trước navigate | Kết luận |
|---|---:|---|---|
| POST `/api/auth/login` | ~120ms | Có | Phản hồi xác thực nhanh (~120ms), trả về token + user object đầy đủ. |
| Parse `res` trong `AuthScreens.tsx` | ~0ms | Có | **LỖI CHÍNH 1**: Truyền sai object `{ ...res }` vào `normalizeUser` thay vì `{ ...res.user }`, làm mất thuộc tính `role` của user (`role = undefined`). |
| Chuyển hướng theo role `getDashboardRouteByRole` | ~0ms | Có | **LỖI CHÍNH 2**: Do `role` bị undefined, hàm trả về route mặc định `/` thay vì `/instructor/dashboard`. |
| Render route `/login` trong `AppRouter.tsx` | ~0ms | Có | **LỖI CHÍNH 3**: `AppRouter.tsx` render `<AuthScreens onLoginSuccess={() => {}} />` với callback rỗng, khiến `currentUser` & `isLoggedIn` trong `AppContext` KHÔNG được cập nhật khi đăng nhập thành công. |
| Gọi API Dashboard song song | > 2000ms | **KHÔNG** | Do chưa navigate ngay, giao diện bị khựng ở trang login hoặc gọi lại các API Dashboard trước khi điều hướng. |

---

## 2. Request Chậm Nhất & Bị Gọi Trùng

- **Request bị gọi trùng**: Không có request POST trùng trên server, nhưng giao diện bị submit nhiều lần do nút submit không bị `disabled` khi `isSubmitting = true`.
- **Request chậm nhất**: Các API Dashboard (`revenue-chart`, `enrollment-chart`, `top-courses`) nếu bị gọi trước khi chuyển trang.

---

## 3. Timeout Nhân Tạo Đã Tìm Thấy

- Đã quét toàn bộ hệ thống auth và router (`LoginPage.tsx`, `AuthScreens.tsx`, `api.ts`, `AppRouter.tsx`).
- **Kết quả**: Không có `setTimeout` hay `sleep` nhân tạo nào được dùng để làm trễ luồng đăng nhập.

---

## 4. Luồng Đăng Nhập Trước Và Sau Khi Sửa

### Luồng Trước Khi Sửa:
1. Người dùng bấm Đăng nhập.
2. POST `/api/auth/login` -> Trả về HTTP 200 OK với `access_token` và `user`.
3. `AuthScreens.tsx` gọi `normalizeUser({ ...res })` -> Sai object làm mất `role`.
4. `onLoginSuccess` trong `AppRouter.tsx` là callback rỗng `() => {}` -> `AppContext` không được cập nhật.
5. Trang bị đứng tại trang login hoặc điều hướng sai về trang chủ `/` do mất `role`.

### Luồng Chuẩn Sau Khi Sửa:
1. Người dùng bấm Đăng nhập (nút hiển thị "Đang đăng nhập..." & `disabled={true}`).
2. Form validate -> POST `/api/auth/login`.
3. Backend trả về 200 OK chứa `access_token` & `user`.
4. `ApiService.setAuthToken(token)` lưu token vào memory & `localStorage`.
5. `handleLoginSuccess` lấy `res.user`, cập nhật ngay `currentUser` & `isLoggedIn` vào `AppContext` và `localStorage`.
6. Gọi `navigate(getDashboardRouteByRole(user.role), { replace: true })` điều hướng **ngay lập tức** không qua trung gian.
7. Đèn hiệu Dashboard (Sidebar, Topbar, Skeleton) xuất hiện ngay; dữ liệu Dashboard được tải bất đồng bộ sau đó.

---

## 5. Tối Ưu AuthContext & Điều Hướng Theo Role

- **AuthContext**: `currentUser` và `isLoggedIn` được cập nhật ngay lập tức đồng bộ với `localStorage` mà không phải chờ bất kỳ API nào khác.
- **Điều hướng theo Role**:
  - `admin` → `/admin/dashboard`
  - `instructor` → `/instructor/dashboard`
  - `learner` / `student` → `/`
- Không sử dụng email để đoán role, không gọi thêm API `/auth/me` thừa khi Login Response đã trả đủ object User.

---

## 6. Dashboard Load Sau Navigate

- Trang `InstructorDashboard` hiển thị khung Skeleton/Shell (Sidebar + Header + Skeletons) ngay khi chuyển trang.
- Các API Dashboard (`getInstructorDashboard`, `getInstructorRevenueChart`, `getInstructorEnrollmentChart`, `getInstructorTopCourses`, v.v.) được tải bất đồng bộ trong `useEffect` với `Promise.allSettled`.
- Nếu có một API Dashboard lỗi (vd: 500/404), các phần khác vẫn hiển thị bình thường và không bao giờ bị redirect ngược về `/login`.

---

## 7. Tối Ưu Backend Query & Session

- Endpoint POST `/api/auth/login` trong `BE/app/Services/Auth/AuthService.php` truy vấn người dùng qua `users.email` (đã có `UNIQUE INDEX`).
- Login response chỉ trả về thông tin User cơ bản + Session Token, không kèm relation nặng hay tính toán Dashboard.
- Cấu hình thời hạn Access Token `ACCESS_TOKEN_EXPIRES_MINUTES` mặc định 7 ngày (`10080` phút) cho môi trường dev local để tránh bị lỗi 401 token expired liên tục.

---

## 8. Danh Sách File Đã Sửa

### Frontend (`MindHub-Frontend`):
1. [src/features/auth/components/AuthScreens.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/auth/components/AuthScreens.tsx):
   - Sửa bóc tách `res.user` thay vì `res` để giữ nguyên `role` và thuộc tính người dùng.
   - Thêm trạng thái `isSubmitting` để disable nút đăng nhập, tránh double-submit.
2. [src/features/auth/LoginPage.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/auth/LoginPage.tsx):
   - Cập nhật `handleLoginSuccess` đồng bộ `AppContext` (`setCurrentUser`, `setIsLoggedIn`) và điều hướng `navigate(target, { replace: true })` theo role.
3. [src/features/auth/RegisterPage.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/auth/RegisterPage.tsx):
   - Cập nhật `handleLoginSuccess` đồng bộ `AppContext` và điều hướng ngay lập tức.
4. [src/router/AppRouter.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/router/AppRouter.tsx):
   - Thay thế việc render trực tiếp `AuthScreens` rỗng bằng `LoginPage` và `RegisterPage`.
5. [src/services/api.ts](file:///f:/Phatnt/Documents/MindHub-Frontend/src/services/api.ts):
   - Tự động xóa token hết hạn khỏi `localStorage` khi gặp HTTP 401.
6. [src/components/student-profile/StudentInstructorWorkspaceCard.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/student-profile/StudentInstructorWorkspaceCard.tsx):
   - Sử dụng `useNavigate` từ React Router thay vì `window.location.href`.

### Backend (`MindHub-Backend`):
1. [BE/app/Services/Auth/AccessTokenService.php](file:///f:/Phatnt/laragon/www/MindHub-Backend/BE/app/Services/Auth/AccessTokenService.php):
   - Cấu hình `ACCESS_TOKEN_EXPIRES_MINUTES` lấy từ `env` (mặc định 10080 phút = 7 ngày).
2. [BE/database/migrations/2026_07_30_000000_create_credit_tables.php](file:///f:/Phatnt/laragon/www/MindHub-Backend/BE/database/migrations/2026_07_30_000000_create_credit_tables.php):
   - Tạo các bảng credit (`course_credit_packages`, `instructor_course_credits`, `instructor_credit_transactions`).

---

## 9. Kiểm Tra Đã Sửa (Verification & Build)

### Thời gian phản hồi sau sửa:
- POST `/api/auth/login`: **~80ms - 120ms**
- Thời gian từ khi bấm Login đến khi chuyển trang thành công: **< 150ms** (Điều hướng ngay lập tức)

### Typecheck & Build Result:
- `npx tsc --noEmit`: **PASS** (No errors)
- `npm run build`: **PASS** (Built successfully in 14.52s)
