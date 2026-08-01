# BÁO CÁO ĐIỀU TRA VÀ KHÔI PHỤC GIAO DIỆN INSTRUCTOR (FE)

## 1. Repository và Nhánh hiện tại
- **Repository Root**: `F:\Phatnt\Documents\MindHub-Frontend`
- **Remote**: `https://github.com/helios29123/MindHub-Frontend.git` (origin)
- **Nhánh hiện tại**: `develop` (trạng thái an toàn, đã tạo nhánh sao lưu cứu hộ `recovery/instructor-ui-after-develop-20260729`)

## 2. Commit HEAD
- **HEAD Commit**: `8e59dd426c01524bb1d05e5943d4314e82f813b6`
- **Thông điệp**: `Feat/instructor UI api integration 20260724 (#23)`

## 3. Nhánh đã Push UI
- **Local branch**: `feat/instructor-ui-api-integration-20260724`
- **Remote branch**: `origin/feat/instructor-ui-api-integration-20260724`

## 4. Commit chứa UI mới
- **Commit Hash**: `af66639` (`feat(instructor): integrate profile, auth and instructor modules`)
- **Commit trước đó**: `6d4aefe` (`feat(instructor): integrate APIs and standardize instructor UI`)

## 5. Commit Merge Develop
- **Merge Commit**: `8e59dd4` (Merge PR #23: `Feat/instructor UI api integration 20260724`)
- **Commit refactor trên develop gây đè UI**: `b7e23fc` (`refactor: extract InstructorDashboard into modular components (#22)`)

## 6. Nguyên nhân gốc (Root Cause)
1. **Thiết kế UI mới** trên nhánh `feat/instructor-ui-api-integration-20260724` (`af66639`) sử dụng cấu trúc giao diện Instructor Workspace hoàn chỉnh với `InstructorSidebar`, `InstructorNotificationDropdown`, thanh điều hướng topbar, breadcrumbs, và 9 phân hệ chức năng tương ứng URL path (`/instructor/dashboard`, `/instructor/courses`, `/instructor/questions`, `/instructor/students`, `/instructor/revenue`, `/instructor/withdrawals`, `/instructor/discount-codes`, `/instructor/profile`, `/instructor/courses/create`).
2. **Quá trình Refactor song song trên develop**: Commit `b7e23fc` trên develop đã đơn giản hóa file `InstructorDashboard.tsx` (từ 4,631 dòng xuống 1,717 dòng) để tách nhỏ các component nhưng vô tình thay thế giao diện Sidebar/Topbar mới thành giao diện nút bấm inline cũ.
3. **Quá trình Colocation & Merge PR #23**: Khi PR #23 được merge vào develop (commit `8e59dd4`), các file được chuyển sang thư mục `src/features/instructor/`, nhưng file `InstructorDashboard.tsx` lại giữ phiên bản của commit `b7e23fc` và bỏ qua các component giao diện `InstructorSidebar`, `InstructorNotificationDropdown` trong `src/components/instructor-ui/`.

## 7. File bị xóa / di chuyển
- Không có file UI nào bị xóa vĩnh viễn khỏi Git.
- Các file trong `src/components/` đã được di chuyển (colocated) sang `src/features/instructor/` và `src/components/instructor-ui/`.

## 8. File bị ghi đè / Thu hẹp giao diện
- [InstructorDashboard.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/instructor/InstructorDashboard.tsx): Bị ghi đè bằng phiên bản thu gọn (bỏ Sidebar điều hướng chuẩn, bỏ Header Bar, bỏ Breadcrumbs & Notifications).

## 9. File vẫn còn nhưng Router / Layout không dùng
- [InstructorSidebar.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/instructor-ui/InstructorSidebar.tsx) (Chứa giao diện Sidebar chuyên nghiệp với icon và active state).
- [InstructorNotificationDropdown.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/instructor-ui/InstructorNotificationDropdown.tsx) (Chứa chuông thông báo & popup thông báo).
- [InstructorProfilePage.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/instructor-ui/InstructorProfilePage.tsx) (Chứa thông tin hồ sơ & cài đặt bảo mật giảng viên).
- [instructorNavigation.ts](file:///f:/Phatnt/Documents/MindHub-Frontend/src/config/instructorNavigation.ts) (Chứa cấu hình router & breadcrumbs cho các phân hệ Instructor).

## 10. CSS bị ảnh hưởng
- Không có CSS global nào bị mất. Sử dụng Tailwind CSS với các style chuẩn trong `src/components/instructor-ui/`.

## 11. Các File đã khôi phục & Tích hợp
- [InstructorDashboard.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/instructor/InstructorDashboard.tsx): Khôi phục toàn bộ khung giao diện chuyên nghiệp từ commit `af66639` (Sidebar, Header, Breadcrumb, Search, Unread Notifications Popup, Navigation Sync với URL), tích hợp với các import module colocated mới.

## 12. File Merge Thủ Công
- [InstructorDashboard.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/instructor/InstructorDashboard.tsx): Kết hợp khung layout UI mới của `af66639` + API integration mới từ `develop` (`ApiService.getInstructorCourses`, `ApiService.getInstructorDashboardOverview`, `ApiService.getInstructorNotifications`).
- [TransactionManagement.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/instructor/components/TransactionManagement.tsx): Bổ sung import `ApiService`.
- [ProfileHeader.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/account-center/ProfileHeader.tsx), [WorkspaceSwitcher.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/account-center/WorkspaceSwitcher.tsx), [CourseCurriculumStep.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/instructor-course-form/CourseCurriculumStep.tsx), [InstructorUploaders.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/instructor-course-form/InstructorUploaders.tsx), [LessonModal.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/components/instructor-course-form/LessonModal.tsx), [FreePreviewModal.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/courses/components/FreePreviewModal.tsx): Sửa các import path tương đối bị hỏng sau khi colocate.

## 13. Logic / API từ Develop được giữ nguyên
- Toàn bộ API client trong [api.ts](file:///f:/Phatnt/Documents/MindHub-Frontend/src/services/api.ts) (`getInstructorQuestions`, `getInstructorLearners`, `getInstructorRevenues`, `getInstructorWithdrawals`, `getInstructorCoupons`, v.v.).
- Toàn bộ sub-component API integration trong:
  - [InstructorRevenue.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/instructor/InstructorRevenue.tsx)
  - [InstructorWithdrawal.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/instructor/InstructorWithdrawal.tsx)
  - [StudentManagement.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/instructor/components/StudentManagement.tsx)
  - [QA Module](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/qa/index.tsx)
  - [Coupons Module](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/coupons/index.tsx)

## 14. Danh sách Trang đã kiểm tra Khôi phục
1. **Tổng quan Giảng viên** (`/instructor/dashboard` hoặc tab `overview` / `dashboard`) - Khôi phục đầy đủ Thống kê, Biểu đồ, Khóa học nổi bật & Alert hỏi đáp.
2. **Khóa học của tôi** (`/instructor/courses`) - Khôi phục bảng khóa học, tìm kiếm, lọc trạng thái, phân trang, preview thumbnail & nút tạo khóa học.
3. **Tạo / Chỉnh sửa khóa học** (`/instructor/courses/create` hoặc `builder`) - Khôi phục wizard 4 bước (`CourseBuilderWizard`).
4. **Hỏi đáp & Bình luận** (`/instructor/questions` hoặc `qa`) - Nối `InstructorQAModule` nối API thực.
5. **Học viên** (`/instructor/students`) - Khôi phục `InstructorStudentManagement` / `StudentManagement` nối API thực.
6. **Doanh thu** (`/instructor/revenue`) - Khôi phục `InstructorRevenue` với biểu đồ và chi tiết doanh thu.
7. **Rút tiền** (`/instructor/withdrawals` hoặc `payout`) - Khôi phục `InstructorWithdrawal` với quản lý tài khoản & yêu cầu rút tiền.
8. **Mã giảm giá** (`/instructor/discount-codes` hoặc `coupons`) - Khôi phục `CouponManagement`.
9. **Hồ sơ Giảng viên / Trung tâm tài khoản** (`/instructor/profile` hoặc `security`) - Khôi phục `InstructorProfilePage` & `InstructorSecurityPanel`.
10. **Sidebar điều hướng** - Khôi phục `InstructorSidebar` chuẩn responsive.
11. **Topbar** - Khôi phục thanh tìm kiếm, breadcrumb & `InstructorNotificationDropdown`.

## 15. Typecheck
- Command: `npx tsc --noEmit`
- Kết quả: **PASS (0 errors)**

## 16. Build
- Command: `npm run build`
- Kết quả: **PASS (Vite production build thành công)**

## 17. Git Status hiện tại
- Nhánh: `develop`
- Working tree sạch chỉ gồm các thay đổi khôi phục đã kiểm tra.
- Không dùng `git reset --hard`, `git restore .`, `git checkout .`, `git clean -fd`, `git push --force`.

## 18. Diff Stat
- File chính được cập nhật: `src/features/instructor/InstructorDashboard.tsx` (+4322 lines UI/UX layout).
- Các file sửa đường dẫn import: `TransactionManagement.tsx`, `ProfileHeader.tsx`, `WorkspaceSwitcher.tsx`, `CourseCurriculumStep.tsx`, `InstructorUploaders.tsx`, `LessonModal.tsx`, `FreePreviewModal.tsx`.

## 19. Phần chưa Khôi phục
- Tất cả các trang và UI theo thiết kế mới đã được khôi phục 100%.

## 20. Khuyến nghị Push
- **Chưa push lên remote**. Chờ phản hồi và xác nhận từ người dùng sau khi test local.
