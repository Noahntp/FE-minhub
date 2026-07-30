# Nguồn sự thật và phạm vi làm việc
## Thứ tự ưu tiên
Khi phân tích hoặc sửa code, dùng thứ tự ưu tiên sau:
1. Yêu cầu mới nhất của người dùng.
2. Code thực tế đang được import và chạy.
3. REACT_ARCHITECTURE_REPORT.md.
4. HTML_ADMIN_INVENTORY_REPORT.md.
5. Tài liệu nghiệp vụ trong knowledge/admin.
6. Giao diện HTML cũ để đối chiếu UI và hành vi.
7. README.md chỉ dùng tham khảo, không dùng làm nguồn quyết định kiến trúc.
Nếu tài liệu và code thực tế khác nhau, phải báo rõ điểm khác nhau trước khi thay đổi.
## Phạm vi
- Chỉ sửa đúng trang, module hoặc lỗi được giao.
- Không tự ý tái cấu trúc toàn bộ dự án.
- Không sửa Client, Instructor, Auth hoặc module khác khi nhiệm vụ chỉ thuộc Admin.
- Không tự ý đổi router, auth, API client hoặc cấu hình Vite nếu nhiệm vụ không yêu cầu.
- Không tự xóa file trùng, file legacy hoặc component nghi là dư khi chưa chứng minh nó không còn được import.
- Không sửa README trừ khi người dùng yêu cầu trực tiếp.
## Bảo vệ code hiện tại
Trước khi sửa:
- Kiểm tra Git status.
- Xác định file nguồn thực sự được import.
- Đọc component, service, hook và helper liên quan.
- Kiểm tra ID, query parameter, event và API contract đang được sử dụng.
- Không ghi đè hoặc hoàn tác code chưa commit của người dùng.
Nếu thấy thay đổi chưa commit có liên quan trực tiếp đến file cần sửa, phải giữ nguyên và chỉnh nối tiếp cẩn thận.
## Sử dụng terminal
- Hạn chế tối đa lệnh terminal.
- Không chạy quét toàn dự án cho một lỗi của một trang.
- Không chạy build/lint nhiều lần không cần thiết.
- Chỉ dùng terminal để kiểm tra file liên quan, Git status, lỗi cú pháp, type hoặc build cuối.
- Không tự chạy lệnh xóa, reset, checkout hoặc clean.
