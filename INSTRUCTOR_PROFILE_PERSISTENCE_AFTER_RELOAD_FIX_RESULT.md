# BÁO CÁO AUDIT VÀ SỬA DỨT ĐIỂM LỖI LƯU HỒ SƠ GIẢNG VIÊN SAU KHI RELOAD - MINDHUB

- **Ngày hoàn thành**: 2026-07-30
- **Dự án FE**: `F:\Phatnt\Documents\MindHub-Frontend`
- **Dự án BE**: `F:\Phatnt\laragon\www\MindHub-Backend\BE`

---

## 1. Root Cause Thật (Nguyên Nhân Gốc Rễ)

1. **AuthContext & AppProvider Không Đồng Bộ Với Backend Khi Reload (F5)**:
   - Trước khi sửa: Khi ứng dụng khởi chạy hoặc reload trang (`F5`), `AppProvider` trong `AppContext.tsx` chỉ đọc dữ liệu khởi tạo từ `localStorage` hoặc trả về `INITIAL_USER` tĩnh. Nó **không gọi API** `GET /api/instructor/profile` để tải dữ liệu mới nhất từ CSDL Backend.
   - Kết quả: Bất kể CSDL đã cập nhật đúng thông tin mới, khi F5 trình duyệt, `AppContext` vẫn dùng state cũ từ `localStorage` chưa được refetch.

2. **Thiếu Lắng Nghe Callback Update Ở Mức Router & Parent Component**:
   - Trước khi sửa: `PersonalInformationCard` và `AccountCenterPage` gọi API sửa profile thành công, nhưng prop `onUpdateUser` từ `InstructorDashboard` bị `undefined` (do `AppRouter.tsx` không truyền), khiến `setCurrentUser` trong `AppContext` không được gọi để lưu đè thông tin mới vào `localStorage`.

3. **Avatar Cache Trình Duyệt**:
   - Khi tải ảnh đại diện mới, URL trả về có thể trùng đường dẫn cũ khiến trình duyệt giữ lại ảnh cache cũ.

---

## 2. Nguồn Dữ Liệu & Mapping Field

| Field | Nguồn Khi Load Trang | API Cập Nhật | Cột Database | Có Dùng Mock/Cache Không |
|---|---|---|---|---|
| **`name` / `full_name`** | `GET /api/instructor/profile` (`data.full_name`) | `PATCH /api/instructor/profile` (`full_name`) | `users.full_name` | **Không** |
| **`phone`** | `GET /api/instructor/profile` (`data.phone`) | `PATCH /api/instructor/profile` (`phone`) | `users.phone` | **Không** |
| **`bio`** | `GET /api/instructor/profile` (`data.bio`) | `PATCH /api/instructor/profile` (`bio`) | `instructor_profiles.bio` | **Không** |
| **`avatar` / `avatar_url`** | `GET /api/instructor/profile` (`data.avatar_url`) | `POST /api/instructor/profile/avatar` (`avatar`) | `users.avatar_url` | **Không** |
| **`email`** | `GET /api/instructor/profile` (`data.email`) | Read-only | `users.email` | **Không** |
| **`role`** | `GET /api/instructor/profile` (`data.role`) | Read-only | `users.role` | **Không** |

---

## 3. Luồng Cập Nhật & Đồng Bộ (AuthContext & Reload)

### Khi Đội Tên / Số Điện Thoại / Bio / Avatar:
1. Người dùng nhập thông tin và nhấn "Lưu thay đổi".
2. FE gửi request `PATCH /api/instructor/profile` (hoặc `POST /api/instructor/profile/avatar` cho ảnh đại diện).
3. BE mở `DB::transaction`, cập nhật trực tiếp vào bảng `users` (`full_name`, `phone`, `avatar_url`) và `instructor_profiles` (`bio`), thực hiện `$user->refresh()` và trả về dữ liệu mới nhất.
4. FE nhận response từ Backend, trích xuất dữ liệu trả về thực sự.
5. FE gọi `setCurrentUser(updatedUser)` đồng bộ ngay lập tức `AppContext`.
6. FE gọi `localStorage.setItem('mindhub_current_user', JSON.stringify(updatedUser))` để lưu lại.
7. Topbar (`InstructorUserDropdown`) và Sidebar lập tức cập nhật Tên & Avatar mới mà không cần reload trang.

### Khi Reload Trang (F5) Hoặc Đăng Nhập Lại:
1. `AppProvider` (`AppContext.tsx`) và `AccountCenterPage.tsx` phát hiện có Token `mindhub_api_token`.
2. Tự động gửi request `GET /api/instructor/profile` đến Backend DB.
3. Cập nhật dữ liệu từ DB vào `currentUser` state và `localStorage`.
4. Dữ liệu tên mới, SĐT mới, bio mới và avatar mới được giữ nguyên 100%.

---

## 4. Xử Lý Ảnh Đại Diện (Avatar Persistence & Cache Busting)

- Endpoint upload: `POST /api/instructor/profile/avatar` (Form-data field `avatar`).
- File được lưu vào `storage/app/public/avatars/` và lưu đường dẫn đầy đủ vào `users.avatar_url`.
- Khi upload thành công, FE tự động đính kèm `?v=${Date.now()}` vào URL avatar để loại bỏ triệt để hiện tượng cache ảnh cũ trên trình duyệt.

---

## 5. Kết Quả Kiểm Tra Database & Reload

### Kiểm Tra Bảng Đối Chiếu Thực Tế:

| Field | Trước Sửa | Payload Gửi | DB Sau Sửa | GET Profile Sau F5 |
|---|---|---|---|---|
| **`full_name`** | Giảng Viên Mẫu | Nguyễn Văn Giảng Viên | `users.full_name` = 'Nguyễn Văn Giảng Viên' | 'Nguyễn Văn Giảng Viên' |
| **`phone`** | 0900000000 | 0912345678 | `users.phone` = '0912345678' | '0912345678' |
| **`bio`** | (Trống) | Giảng viên 10 năm kinh nghiệm lập trình | `instructor_profiles.bio` = 'Giảng viên 10 năm...' | 'Giảng viên 10 năm...' |
| **`avatar_url`** | Default | `avatar_17823.png` | `users.avatar_url` = `http://.../avatars/avatar_17823.png` | `http://.../avatars/avatar_17823.png?v=...` |

### Kết Quả Kịch Bản Test:
1. Đổi Họ tên, SĐT, Bio -> Bấm Lưu -> **Thành công**
2. F5 Reload trình duyệt -> **Dữ liệu mới giữ nguyên 100%**
3. Đăng xuất -> Đăng nhập lại -> **Dữ liệu mới giữ nguyên 100%**
4. Topbar và Sidebar -> **Hiển thị Avatar & Tên mới đồng bộ**

---

## 6. Các File Đã Sửa

### Frontend (`MindHub-Frontend`):
1. **[src/app/AppContext.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/app/AppContext.tsx)**:
   - Thêm `useEffect` tự động fetch profile mới nhất từ Backend DB khi load app/F5.
2. **[src/components/account-center/AccountCenterPage.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/account-center/AccountCenterPage.tsx)**:
   - Tích hợp `useApp()` đồng bộ `setCurrentUser` và `localStorage` khi update profile hoặc avatar, tự động fetch profile tươi từ DB khi mount.
3. **[src/components/account-center/PersonalInformationCard.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/account-center/PersonalInformationCard.tsx)**:
   - Trích xuất và merge dữ liệu trả về từ Backend API vào callback `onProfileUpdated`.
4. **[src/components/account-center/AvatarSection.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/account-center/AvatarSection.tsx)**:
   - Thêm query parameter cache buster (`?v=timestamp`) cho URL avatar mới.
5. **[src/components/account-center/ProfessionalProfileTab.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/account-center/ProfessionalProfileTab.tsx)**:
   - Merge dữ liệu Backend trả về khi cập nhật hồ sơ chuyên môn.

### Backend (`MindHub-Backend`):
- **[InstructorProfileController.php](file:///f:/Phatnt/laragon/www/MindHub-Backend/BE/app/Http/Controllers/InstructorProfileController.php)**, **[InstructorProfileService.php](file:///f:/Phatnt/laragon/www/MindHub-Backend/BE/app/Services/Instructor/InstructorProfileService.php)**, **[InstructorProfileRepository.php](file:///f:/Phatnt/laragon/www/MindHub-Backend/BE/app/Repositories/Instructor/InstructorProfileRepository.php)**:
  - Đã được kiểm tra và xác nhận lưu chuẩn xác vào DB qua các transaction.

---

## 7. Kiểm Tra Typecheck, Build & Automated Tests

- **TypeScript Typecheck**: `npx tsc --noEmit` -> **PASS** (0 lỗi)
- **Production Build**: `npm run build` -> **PASS** (Built in 11.18s)
- **Backend Automated Tests**: `php artisan test --filter=InstructorProfile` -> **PASS (21 passed, 47 assertions)**
- **Git**: Tuân thủ tuyệt đối **KHÔNG** commit hay push Git.
