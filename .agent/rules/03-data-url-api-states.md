# Dữ liệu, URL, API và trạng thái trang
## Trạng thái dữ liệu bắt buộc
Trang danh sách phải phân biệt:
1. Loading.
2. Có dữ liệu.
3. Empty do hệ thống chưa có dữ liệu.
4. Filter empty do bộ lọc không có kết quả.
5. Error do tải dữ liệu thất bại.
Không dùng cùng một thông báo cho empty và filter empty.
Không để lỗi một phần dữ liệu làm toàn trang trắng nếu có thể hiển thị phần còn lại an toàn.
## URL là nguồn trạng thái chia sẻ được
Filter, sort, page, page size và drawer deep link nên đồng bộ URL query khi trang yêu cầu.
Yêu cầu:
- Refresh giữ được trang và điều kiện lọc.
- Back/Forward hoạt động đúng.
- Reset xóa query liên quan.
- Không xóa query không thuộc module hiện tại.
- Không tạo vòng lặp giữa state và URL.
- Parse số, enum và ngày an toàn trước khi dùng.
## Router Admin
Kiến trúc đích:
- /admin/:adminId/dashboard
- /admin/:adminId/users
- /admin/:adminId/categories
- /admin/:adminId/courses
- Các module Admin còn lại theo cùng quy tắc.
Không tiếp tục dùng activeTab cục bộ làm nguồn điều hướng chính.
Tuy nhiên, không tự chuyển toàn bộ router trong một nhiệm vụ sửa một trang. Việc chuẩn hóa router phải có kế hoạch và kiểm tra link hiện có.
## API
- API Admin tách theo module, không tiếp tục làm src/services/api.ts phình lớn.
- Component không tự ghép URL API rải rác nếu đã có service.
- Service chịu trách nhiệm gọi API.
- Mapper chuẩn hóa DTO sang dữ liệu UI khi cần.
- Hook quản lý loading, error, pagination và thao tác trang.
- UI chỉ xử lý hiển thị và tương tác.
## Xác thực
Backend hiện cần được xác minh là dùng session/cookie hay Bearer token trước khi sửa auth.
Không được:
- Tự trộn session và Bearer token.
- Mặc định người dùng đã đăng nhập khi chưa có phiên thật.
- Tự đổi toàn bộ auth vì một lỗi Admin UI.
- Hardcode token, mật khẩu hoặc dữ liệu nhạy cảm.
Phải phân biệt:
- authLoading.
- authenticated.
- unauthenticated.
- forbidden.
- expired.
API trả 401 và 403 phải được xử lý khác nhau.
## Mock và API thật
- Mock chỉ là nguồn hỗ trợ phát triển.
- Không để mock âm thầm thay thế lỗi API thật trên production.
- Không trộn dữ liệu mock và API thật trong cùng danh sách nếu không có chế độ rõ ràng.
- Khi chuyển một trang, xác định cụ thể trang đang dùng mock, adapter hay API thật.
