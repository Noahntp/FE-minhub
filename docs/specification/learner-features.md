# Bàn giao Công việc - Các màn hình (Screens) còn thiếu

Dưới đây là danh sách các màn hình (UI Screens) dành cho **Khách (Guest)** và **Học viên (Student)** hiện tại vẫn chỉ là file rỗng (placeholder) hoặc chưa hoàn thiện mức Production, cần tiếp tục phát triển trong ca làm việc tới. 

*(Ghi chú: Đã loại trừ các trang dành riêng cho Giảng viên / Admin như dashboard, quản lý khoá học, doanh thu...)*

## Danh sách các trang cần xây dựng tiếp:

### 1. Trang Chi tiết khóa học (Course Detail Page)
- **Đường dẫn Route**: `/courses/:courseId`
- **File gốc**: `src/features/courses/CourseDetailPage.tsx`
- **Yêu cầu UI cơ bản**:
  - Hero section với Video intro (hoặc ảnh cover), Tên khoá học, Đánh giá (Rating), Thông tin Giảng viên.
  - Sticky Sidebar (hoặc Floating Box) bên phải hiển thị Giá tiền, Nút "Thêm vào giỏ hàng" / "Mua ngay", Danh sách quyền lợi (VD: Thời lượng video, Truy cập trọn đời, Chứng chỉ).
  - Tab nội dung: Đề cương (Curriculum/Syllabus), Giới thiệu (About), Đánh giá của học viên (Reviews - có thể tái sử dụng component `ReviewList`).

### 2. Trang Khám phá / Danh sách khóa học (Course List Page)
- **Đường dẫn Route**: `/courses`
- **File gốc**: `src/features/courses/CourseListPage.tsx`
- **Yêu cầu UI cơ bản**:
  - Giao diện dạng Catalog duyệt toàn bộ khoá học.
  - Sidebar bên trái chứa các bộ lọc (Filter): Danh mục, Đánh giá, Giá (Miễn phí/Trả phí), Cấp độ học.
  - Sắp xếp (Sort): Mới nhất, Đánh giá cao nhất, Xem nhiều nhất.
  - *(Lưu ý: MindHub hiện đã có trang `SearchPage`, nhóm có thể cân nhắc tích hợp chung hoặc tách riêng `CourseListPage` làm trang Browse).*

### 3. Không gian học tập (Classroom / Learning Workspace)
- **Đường dẫn Route**: `/learn/:courseId`
- **File gốc**: `src/features/classroom/ClassroomPage.tsx`
- **Yêu cầu UI cơ bản**:
  - Layout đặc thù (thường là full-screen không có Navbar/Footer thông thường).
  - Khu vực chính: Video Player lớn (hỗ trợ Youtube/Vimeo/HTML5).
  - Sidebar (có thể toggle đóng/mở): Danh sách chương và bài học (Curriculum Tree) có đánh dấu tiến độ (Checkmark).
  - Tab bên dưới Video: Tổng quan (Overview), Hỏi đáp (Q&A), Ghi chú cá nhân (Notes), Tài nguyên đính kèm (Resources).

---

## Tình trạng các trang khác (Để tham khảo không cần làm lại)
- **Auth (Login/Register)**: Đã hoàn thiện trong `AuthScreens.tsx`.
- **Cart & Checkout**: Đã hoàn thiện trong `CartAndCheckout.tsx`.
- **Trang hồ sơ (Profile / Settings)**: Đã hoàn thiện giao diện cài đặt (Basic Info, Security...).
- **Trang phụ trợ (FAQ, Contact, About, Roadmap, Instructor Profile)**: Đã hoàn thiện.

Chúc bạn code mượt mà và không bug! 🚀
