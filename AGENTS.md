# MindHub React Admin — Agent Instructions
Đọc toàn bộ rule trong `.agent/rules/` trước khi phân tích hoặc sửa Admin.
## Nguồn sự thật
Không dùng README làm nguồn quyết định kiến trúc.
Ưu tiên:
1. Yêu cầu mới nhất của người dùng.
2. Code thực tế đang chạy.
3. REACT_ARCHITECTURE_REPORT.md.
4. HTML_ADMIN_INVENTORY_REPORT.md.
5. knowledge/admin.
6. HTML Admin cũ để đối chiếu UI và nghiệp vụ.
## Mục tiêu hiện tại
Chuyển Admin HTML/JavaScript cũ sang React + TypeScript thuần theo từng trang.
Không tiếp tục mô hình:
- Chép HTML sang JSX.
- Import initPage().
- Dùng document/querySelector/innerHTML/classList để điều khiển React DOM.
Categories là trang mẫu đầu tiên. Chỉ chuyển các trang tiếp theo sau khi trang mẫu ổn định.
## Giới hạn
- Không sửa README nếu chưa được yêu cầu.
- Không sửa ngoài phạm vi.
- Không tự xóa code legacy.
- Không tự đổi router/auth/API toàn hệ thống.
- Không làm mất code chưa commit.
- Không chạy terminal hoặc build dư thừa.
- Không tuyên bố hoàn tất nếu chưa kiểm tra hành vi.
- Không tự động tạo commit khi chưa có yêu cầu từ người dùng.
