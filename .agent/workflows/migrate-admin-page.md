# Workflow: Chuyển một trang Admin sang React thuần
Mục tiêu: Chuyển đúng một trang Admin từ JSX + JavaScript DOM cũ sang React + TypeScript thuần.
## Bước 1 — Xác định phạm vi
- Kiểm tra Git status.
- Xác định route/component đang thực sự được render.
- Tìm mọi import của component và JavaScript legacy liên quan.
- Không sửa code ở bước này.
## Bước 2 — Đọc nguồn liên quan
Đọc:
- Component React hiện tại.
- JavaScript trang cũ.
- API adapter.
- Mock repository hoặc mock database liên quan.
- Tài liệu trong knowledge/admin.
- Hai file báo cáo nếu cần xác minh kiến trúc.
## Bước 3 — Lập bảng hành vi
Liệt kê:
- Summary cards.
- Filter.
- Sort.
- Pagination.
- URL query.
- Loading.
- Data.
- Empty.
- Filter empty.
- Error.
- Drawer.
- Modal.
- Row action.
- API/mock.
- Responsive.
Phân loại: giữ nguyên, sửa lỗi, chuyển sang React hoặc chưa có dữ liệu.
## Bước 4 — Đề xuất file thay đổi
Ưu tiên cấu trúc colocate trong src/features/admin/<feature>/.
Không tạo nhiều file hình thức nếu logic nhỏ.
Phải nêu rõ file nào sẽ sửa trước khi triển khai.
## Bước 5 — Chuyển đổi
- Tạo type.
- Tách service.
- Tạo mapper nếu DTO khác UI model.
- Tạo hook quản lý state khi cần.
- Chuyển UI sang controlled state.
- Đồng bộ URL an toàn.
- Gỡ initPage của riêng trang.
- Không xóa legacy khi chưa kiểm tra import.
## Bước 6 — Kiểm tra
Kiểm tra đầy đủ các trạng thái và thao tác được liệt kê ở Bước 3.
Chỉ chạy lệnh terminal cần thiết.
## Bước 7 — Báo cáo
Nêu file đã sửa, logic đã giữ, lỗi đã sửa, kiểm tra đã chạy và phần còn lại.
