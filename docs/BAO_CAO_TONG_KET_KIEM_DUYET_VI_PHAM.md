# BÁO CÁO TỔNG KẾT: TÍNH NĂNG TỰ ĐỘNG QUÉT BÌNH LUẬN VI PHẠM & VỊ TRÍ HIỂN THỊ

---

## I. TỔNG KẾT CÁC PHẦN VIỆC ĐÃ HOÀN THÀNH

### 1. Xây dựng Trình kiểm duyệt Tự động 100% Miễn phí (ContentModeratorService)
- **Vị trí file**: `BE/app/Services/Moderation/ContentModeratorService.php`
- **Công nghệ & Cơ chế**:
  - **Tầng 1 (Rule-Based NLP & Regex Tiếng Việt)**: Tự động chuẩn hóa teencode (`đ.m`, `v~l`, `f*ck`...), nhận diện từ ngữ thô tục/xúc phạm, rải link nhóm chat/cờ bạc (`zalo.me/`, `t.me/`, `kubet`...), lộ số điện thoại cá nhân (`03x-09x`). Chạy tức thì **0ms, chi phí 0 VNĐ, không phụ thuộc mạng**.
  - **Tầng 2 (Google Gemini AI Free Tier)**: Tự động phân tích ngữ nghĩa chuyên sâu nếu có cấu hình API Key.

### 2. Tích hợp Quét tự động vào Toàn bộ Luồng Tương tác
- **Bình luận bài học & Trả lời Q&A** (`BE/app/Services/Interaction/InteractionService.php`):
  - Khi học viên tạo bình luận (`createComment`) hoặc giảng viên trả lời (`replyToComment`), hệ thống **tự động kiểm duyệt ngay lập tức**.
  - Nếu vi phạm: Tự động gán `status = 'hidden'`.
  - Nếu an toàn: Tự động gán `status = 'visible'`.
- **Đánh giá khóa học (Course Reviews)** (`BE/app/Services/Interaction/ReviewService.php`):
  - Tự động kiểm tra nội dung đánh giá của học viên. Nếu phát hiện chửi bới, lừa đảo hoặc rải link spam, hệ thống từ chối lưu và đưa ra cảnh báo lỗi phù hợp.

### 3. Kết quả Kiểm thử Hệ thống:
- ✅ Nội dung sạch: *"Khóa học rất hay và chất lượng!"* -> Cho phép hiển thị bình thường (`status: visible`).
- 🚫 Chửi bới thô tục: *"Khóa học như cc đ.m lừa đảo"* -> **Tự động ẩn (`status: hidden`)**.
- 🚫 Rải link nhóm: *"Nhận làm đồ án liên hệ https://zalo.me/g/abc"* -> **Tự động ẩn (`status: hidden`)**.
- 🚫 Spam số điện thoại/bán nick: *"Bán tài khoản giá rẻ lh 0987654321"* -> **Tự động ẩn (`status: hidden`)**.

---

## II. VỊ TRÍ XEM VÀ HIỂN THỊ BÌNH LUẬN VI PHẠM TRÊN HỆ THỐNG

Bình luận vi phạm được phân luồng xử lý rõ ràng ở 3 vị trí giao diện:

### 1. Phía Quản trị viên (Admin Dashboard - Màn hình Kiểm duyệt)
- **Đường dẫn trên giao diện Admin**: `http://localhost:5173/admin/moderation` (Mục **Kiểm duyệt nội dung / Moderation** trên thanh Sidebar Admin).
- **File mã nguồn Frontend**: `src/features/admin/components/pages/Moderation.tsx`.
- **Tại đây, Admin có thể**:
  - Xem danh sách toàn bộ các bình luận / đánh giá bị hệ thống tự động ẩn (`status = 'hidden'`).
  - Lọc theo loại nội dung: **Tất cả**, **Bình luận (Comment)**, hoặc **Đánh giá (Review)**.
  - Xem chi tiết: Tên học viên, Email, Khóa học, Bài học liên quan và Nội dung bình luận vi phạm.
  - **Hành động 1-click**:
    - `Ẩn / Hiện (Toggle)`: Bấm để mở lại nếu muốn cho phép hiển thị.
    - `Xóa vĩnh viễn (Delete)`: Xóa hoàn toàn bình luận khỏi hệ thống.

---

### 2. Phía Giảng viên (Instructor Dashboard - Quản lý Câu hỏi Q&A)
- **File mã nguồn**: `BE/app/Services/Interaction/InstructorQuestionService.php` & `src/features/instructor/...`
- **Chức năng**:
  - Giảng viên theo dõi các câu hỏi và thảo luận của học viên trong các khóa học do mình giảng dạy.
  - Giảng viên có quyền **Ẩn câu hỏi vi phạm (`hideInstructorQuestion`)** hoặc **Hiển thị lại (`showHiddenInstructorQuestion`)**.

---

### 3. Phía Học viên (Learner - Phòng học & Trang khóa học)
- **File API**: `BE/app/Services/Interaction/InteractionService.php@getLessonComments` (có điều kiện cố định: `where('status', 'visible')`).
- **Giao diện**: Khi bất kỳ học viên nào vào xem bài học hoặc trang khóa học, **tất cả bình luận vi phạm (đã bị gắn `status = 'hidden'`) đều KHÔNG hiển thị**, đảm bảo môi trường học tập luôn sạch sẽ và văn minh.
