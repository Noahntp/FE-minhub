# BÁO CÁO KẾT QUẢ SỬA LỖI NÚT TRÊN TOPBAR GIẢNG VIÊN KHÔNG THỂ CLICK - MINDHUB

- **Ngày hoàn thành**: 2026-07-30
- **Dự án**: `F:\Phatnt\Documents\MindHub-Frontend`

---

## 1. Component Topbar Thật
- **Component thật**: `<header>` trong `InstructorDashboard.tsx` ([src/features/instructor/InstructorDashboard.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/instructor/InstructorDashboard.tsx)).
- **Sub-components liên quan**:
  - `InstructorNotificationDropdown.tsx` ([src/components/instructor-ui/InstructorNotificationDropdown.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/instructor-ui/InstructorNotificationDropdown.tsx))
  - `InstructorUserDropdown.tsx` ([src/components/instructor-ui/InstructorUserDropdown.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/instructor-ui/InstructorUserDropdown.tsx))

---

## 2. Root Cause (Nguyên Nhân Gốc Rễ)

1. **Nút "Xem trang học viên"**:
   - Trước khi sửa: Nút gán `onClick={onClose}`. Nhưng từ router (`AppRouter.tsx`), `InstructorDashboard` được render theo route `/instructor/:instructorId/*` mà KHÔNG truyền prop `onClose`.
   - Kết quả: `onClose` bị `undefined`, bấm nút không có bất kỳ phản hồi nào.

2. **Avatar / Tên người dùng / Account Menu**:
   - Trước khi sửa: Khu vực Avatar + Tên là một `<div>` đơn thuần với `onClick={() => handleTabChange('security')}`. Không có Menu Dropdown tài khoản (Hồ sơ, Dashboard, Xem trang học viên, Đăng xuất) như yêu cầu thiết kế hệ thống.

3. **Stacking Context & Z-Index Topbar**:
   - Trước khi sửa: Thẻ `<header>` của Topbar không khai báo `relative z-30`. Khi các menu dropdown (`z-50`) mở ra, có khả năng bị che khuất hoặc đè lên bởi các phần tử `relative` ở vùng main content bên dưới.

---

## 3. Element Phủ & Pointer-Events
- Không có div vô hình hay overlay trôi nổi đè lên Topbar trên Desktop.
- Thẻ `<header>` của Topbar đã được thiết lập `relative z-30 pointer-events-auto` để đảm bảo nhận đầy đủ sự kiện con trỏ chuột (click/hover) và hiển thị các Popover/Dropdown đè lên trên nội dung phía dưới.

---

## 4. Handler Các Nút Trên Topbar

| Thành phần | Component/File | Handler Đã Sửa | Hành Vi / Action |
|---|---|---|---|
| **Nút "Xem trang học viên"** | `InstructorDashboard.tsx` | `onClick={() => { if (onClose) onClose(); else navigate('/'); }}` | Sử dụng React Router `navigate('/')` chuyển mượt về trang chủ Học viên, không reload toàn trang. |
| **Nút Chuông thông báo** | `InstructorNotificationDropdown.tsx` | `onClick={handleToggle}` (`setIsOpen(!isOpen)`) | Bấm chuông mở/đóng Dropdown danh sách thông báo hệ thống, hiển thị badge số lượng chưa đọc (`pointer-events-none`). |
| **Avatar & Account Menu** | `InstructorUserDropdown.tsx` | `onClick={handleToggle}` (`setIsOpen(!isOpen)`) | Bấm vào Avatar/Tên mở Dropdown gồm 4 hành động: Hồ sơ cá nhân, Tổng quan Dashboard, Xem trang học viên, Đăng xuất tài khoản. |

---

## 5. Logic Outside-Click & Accessibility

- **Outside-click logic**:
  - `InstructorNotificationDropdown` & `InstructorUserDropdown` đều sử dụng `containerRef.current.contains(event.target)` kiểm tra xem sự kiện click có nằm ngoài vùng Dropdown hay không.
  - Thêm lắng nghe phím `Escape` để đóng dropdown nhanh chóng.
  - Lắng nghe `mousedown` khi `isOpen === true` và cleanup sạch sẽ khi unmount/đóng dropdown, không làm nhiễu sự kiện ngoài.
- **Accessibility**:
  - Tất cả nút đều có `type="button"`.
  - Khai báo thuộc tính accessibility: `aria-label`, `aria-expanded={isOpen}`, `aria-haspopup="menu"`, `role="menuitem"`.

---

## 6. Danh Sách File Đã Tạo & Sửa

1. **[src/components/instructor-ui/InstructorUserDropdown.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/instructor-ui/InstructorUserDropdown.tsx)** (TẠO MỚI):
   - Component Dropdown Tài khoản giảng viên gồm Avatar, thông tin cá nhân, các hành động chuyển trang và Đăng xuất (`logout`).
2. **[src/features/instructor/InstructorDashboard.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/instructor/InstructorDashboard.tsx)** (CẬP NHẬT):
   - Tích hợp `useNavigate` cho nút "Xem trang học viên".
   - Tích hợp `InstructorUserDropdown` cho khu vực Avatar & Tên người dùng.
   - Thêm `relative z-30 pointer-events-auto` cho thẻ `<header>` Topbar.
3. **[src/components/instructor-ui/InstructorNotificationDropdown.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/instructor-ui/InstructorNotificationDropdown.tsx)** (KIỂM TRA & XÁC NHẬN):
   - Đã có đầy đủ nút `type="button"`, badge `pointer-events-none` và outside-click handler chuẩn.

---

## 7. Kiểm Tra Typecheck & Build Production

- `npx tsc --noEmit`: **PASS** (Không có lỗi TypeScript).
- `npm run build`: **PASS** (Vite build thành công trong 19.10s).
- **Git**: Đã tuân thủ nghiêm ngặt **KHÔNG** thực hiện lệnh `git commit` hay `git push`.
