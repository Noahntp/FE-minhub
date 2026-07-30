# Kiểm tra và báo cáo sau thay đổi
## Trước khi code
Agent phải báo ngắn gọn:
- Phạm vi sẽ sửa.
- File nguồn chính.
- Code legacy hoặc dependency liên quan.
- Rủi ro có thể ảnh hưởng.
Nếu nhiệm vụ lớn, lập kế hoạch trước nhưng không trì hoãn bằng kế hoạch quá dài.
## Trong khi code
- Chỉnh theo từng phần nhỏ.
- Không thay đổi file ngoài phạm vi.
- Không tự ý format toàn repo.
- Không tạo duplicate identifier, helper, event listener hoặc status map.
- Effect có side effect phải cleanup.
- Request bất đồng bộ phải tránh cập nhật state sau unmount khi cần.
- Không nuốt lỗi bằng catch rỗng.
## Kiểm tra tối thiểu
Tùy phạm vi, kiểm tra:
- TypeScript.
- Import.
- Console error.
- React warning.
- Sidebar đóng/mở.
- Responsive.
- Loading.
- Data.
- Empty.
- Filter empty.
- Error.
- Filter và Reset.
- Sort.
- Pagination.
- URL query.
- Drawer/modal.
- Row action và stopPropagation.
Chỉ chạy npm run build sau thay đổi đáng kể hoặc khi người dùng yêu cầu. Không lặp lại build nếu code không đổi.
## Báo cáo cuối
Báo cáo phải nêu:
1. Đã sửa gì.
2. Danh sách file đã sửa.
3. Logic nào đã được giữ.
4. Đã kiểm tra bằng cách nào.
5. Phần nào chưa thể kiểm tra.
6. Rủi ro hoặc bước tiếp theo nếu có.
Không tuyên bố “đã sửa toàn bộ” nếu chưa kiểm tra đầy đủ.
Không nói trang hoàn thành chỉ vì build pass; phải kiểm tra hành vi UI liên quan.
