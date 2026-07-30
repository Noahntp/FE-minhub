# Tiêu chuẩn UI/UX Admin MindHub
## Nguyên tắc chung
- Giữ giao diện gọn, dễ quét và đồng nhất giữa các trang.
- Không làm lại thiết kế nếu người dùng chỉ yêu cầu sửa logic.
- Không làm mất những phần giao diện đang hoạt động.
- Không tạo cuộn ngang toàn trang.
- Bán kính góc chủ đạo khoảng 6px.
- Khoảng cách giữa filter, bảng, card và phân trang phải cân đối.
- Header bảng ưu tiên một dòng.
- Nội dung dài phải truncate và có title hoặc tooltip phù hợp.
## Trạng thái
Trạng thái mặc định hiển thị bằng chấm màu và chữ màu, không dùng badge nền nặng:
- Xanh lá: thành công, hoạt động, đã duyệt.
- Vàng/cam: đang chờ, cần xử lý.
- Đỏ: từ chối, thất bại, lỗi.
- Xanh dương: thông tin, đã rút hoặc trạng thái trung tính tích cực.
- Xám: ẩn, hủy, không hoạt động.
Không tự đổi ý nghĩa màu giữa các trang.
## Bộ lọc
- Search khoảng 30% chiều rộng khi đủ không gian.
- Status khoảng 190–220px.
- Sort khoảng 200–230px.
- Input/select thường cao h-9 hoặc h-10.
- Nút Đặt lại và Áp dụng nhỏ gọn, đặt phía phải.
- Responsive phải chuyển hàng hợp lý, không ép tràn ngang.
Nếu có lọc thời gian:
- Tất cả.
- 1 ngày, 3 ngày, 7 ngày hoặc preset đúng nghiệp vụ.
- Tùy chọn từ ngày đến ngày.
- Ngày kết thúc không nhỏ hơn ngày bắt đầu.
Khi đang lọc:
- Hiển thị hàng ĐANG LỌC.
- Cho phép xóa từng điều kiện.
- Cho phép xóa tất cả.
- Reset phải xóa input, state, URL query và tải lại dữ liệu.
- Đổi filter phải đưa phân trang về trang 1.
## Bảng và phân trang
- Bảng không được làm trang cuộn ngang nếu có thể gộp hoặc rút gọn cột.
- Không dùng --- nếu có thể hiển thị Chưa cập nhật, Chưa thanh toán hoặc nội dung có nghĩa.
- Phân trang hiển thị x–y trên tổng z.
- Hỗ trợ kích thước 10, 20, 50, 100 khi nghiệp vụ cần.
- Previous/Next phải disabled đúng.
- Empty phải hiển thị 0–0 và disable điều hướng.
- Phân trang phải cùng chiều rộng wrapper với bảng.
## Drawer và modal
- Click hàng có thể mở drawer khi nghiệp vụ yêu cầu.
- Nút, checkbox và action trong hàng phải stopPropagation.
- Deep link dùng URL query như open_* nếu trang cũ có hành vi này.
- Đóng drawer chỉ xóa query của drawer, không làm mất filter.
- Modal nguy hiểm phải có bước xác nhận.
- Không đóng modal khi thao tác API đang xử lý nếu gây mất trạng thái.
## Responsive
- Desktop ưu tiên compact.
- Tablet không được vỡ sidebar hoặc bảng.
- Mobile phải dùng bố cục phù hợp, không chỉ thu nhỏ desktop.
- Nút thao tác phải đủ vùng bấm.
- Không để chữ, mã đơn, mã doanh thu hoặc trạng thái rớt dòng bất hợp lý.
