# MindHub Admin React Migration Setup
## Hiện trạng
Repo React hiện vẫn là kiến trúc lai:
- React render JSX.
- Một số trang import initPage từ JavaScript cũ.
- JavaScript cũ thao tác DOM trực tiếp.
- public/assets và src/assets/js có thể chứa các bản legacy trùng nhau.
- Admin navigation còn phụ thuộc activeTab.
- Router, auth và API cần chuẩn hóa theo từng giai đoạn.
## Quyết định
- Không dựa vào README để chuyển Admin.
- Không chuyển thêm trang theo cách JSX + initPage.
- Dùng HTML cũ làm tài liệu đối chiếu, không dùng làm kiến trúc runtime.
- Chuyển từng trang sang React + TypeScript thuần.
- Categories là trang mẫu đầu tiên.
- Không xóa code legacy cho đến khi xác minh không còn import.
- Không sửa router/auth/API toàn hệ thống trong nhiệm vụ riêng của một trang.
## File rule
- .agent/rules/00-source-of-truth.md
- .agent/rules/01-react-admin-architecture.md
- .agent/rules/02-admin-ui-ux.md
- .agent/rules/03-data-url-api-states.md
- .agent/rules/04-legacy-migration.md
- .agent/rules/05-verification-and-reporting.md
## Workflow
Dùng workflow `.agent/workflows/migrate-admin-page.md` khi bắt đầu chuyển một trang.
