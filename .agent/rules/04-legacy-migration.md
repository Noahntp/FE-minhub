# Quy tắc chuyển HTML Admin sang React
## Nguồn tham chiếu
HTML Admin cũ được dùng để đối chiếu:
- Giao diện.
- Nghiệp vụ.
- Tên cột.
- Bộ lọc.
- Pagination.
- Loading, empty, filter-empty và error.
- Drawer, modal và row action.
- Query parameter.
- API adapter và mock behavior.
Không sao chép nguyên cách thao tác DOM của HTML cũ sang React.
## Hai bộ JavaScript legacy
Repo có thể đồng thời tồn tại:
- public/assets/
- src/assets/js/
Trước khi sửa phải xác định file nào thực sự được import hoặc tải trực tiếp.
Không sửa cả hai bản theo phỏng đoán.
Trong component React hiện tại, nguồn thường được import là src/assets/js/. Sau khi một trang chuyển hoàn toàn sang React:
1. Gỡ import initPage của đúng trang.
2. Xác nhận không còn nơi nào sử dụng file legacy.
3. Chỉ đề xuất xóa file legacy sau khi có bằng chứng.
4. Không xóa hàng loạt JavaScript của trang khác.
## Quy trình chuyển một trang
1. Đọc component React hiện tại.
2. Đọc JavaScript trang cũ.
3. Đọc API adapter, mock repository và tài liệu nghiệp vụ.
4. Liệt kê hành vi cần giữ.
5. Xác định route và URL query.
6. Xác định DTO, type và mapper.
7. Tách service/hook/component hợp lý.
8. Chuyển từng hành vi sang React state.
9. Gỡ initPage của riêng trang đó.
10. Kiểm tra loading, data, empty, filter-empty và error.
11. Kiểm tra filter, reset, sort, pagination, drawer và modal.
12. Kiểm tra console và build.
## Trang mẫu đầu tiên
Categories là trang mẫu ưu tiên vì có:
- Danh mục cha/con.
- Đóng/mở cây.
- Sắp xếp.
- Bộ lọc.
- Phân trang.
- Drawer/modal.
- Trạng thái.
- URL query.
- Mock/API.
- Các trạng thái dữ liệu.
Không chuyển hàng loạt các trang khác trước khi Categories React thuần hoạt động ổn định.
## Categories
Khi chuyển Categories:
- Dùng một component nguồn chính đã được router hoặc Admin layout render.
- Xác minh Categories.tsx và CategoriesManagement.tsx trước khi chọn file.
- Không giữ hai component cùng gọi initPage().
- Danh mục cha có thể đóng/mở danh mục con.
- Thứ tự con chỉ thay đổi trong đúng danh mục cha nếu nghiệp vụ quy định vậy.
- Giữ vị trí cuộn khi thao tác nếu có thể.
- Chỉ lưu thứ tự sau xác nhận.
- Giá trị thứ tự phải hợp lệ và dương.
- Trạng thái dùng chấm màu + chữ màu.
- Không lồng main bên trong main của AdminLayout.
