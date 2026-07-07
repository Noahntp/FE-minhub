# MindHub Frontend

## Giới thiệu dự án (Project Introduction)
MindHub là một dự án ứng dụng web hiện đại, được xây dựng với các công nghệ Frontend tiên tiến nhất nhằm mang lại trải nghiệm người dùng mượt mà và tối ưu hóa hiệu suất. Dự án có sự tích hợp của công nghệ AI (Google GenAI) để cung cấp các tính năng thông minh.

**Công nghệ sử dụng:**
- **[React 19](https://react.dev/)**: Thư viện UI cốt lõi.
- **[Vite](https://vitejs.dev/)**: Công cụ build siêu tốc và phát triển frontend.
- **[TypeScript](https://www.typescriptlang.org/)**: Hỗ trợ định kiểu mạnh mẽ giúp code an toàn và dễ bảo trì.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Framework CSS utility-first để tạo kiểu nhanh chóng.
- **[Framer Motion](https://motion.dev/)**: Thư viện tạo animation mượt mà.
- **[Lucide React](https://lucide.dev/)**: Thư viện icon đẹp và nhẹ.
- **[Express](https://expressjs.com/)**: Hỗ trợ chạy server local hoặc API (nếu cần thiết).

---

## Yêu cầu hệ thống (Prerequisites)
- **Node.js**: Phiên bản 18.0.0 hoặc mới hơn.
- **npm** (hoặc **yarn** / **pnpm**)

---

## Cài đặt & Chạy dự án (Getting Started)

1. **Clone repository:**
   ```bash
   git clone <đường_dẫn_repository>
   cd MindHub-Frontend
   ```

2. **Cài đặt các gói phụ thuộc (Dependencies):**
   ```bash
   npm install
   ```

3. **Thiết lập biến môi trường:**
   Copy file mẫu `.env.example` thành file `.env` và cấu hình các thông số phù hợp (ví dụ: API keys, URL,...).
   ```bash
   cp .env.example .env
   ```

4. **Chạy server development:**
   ```bash
   npm run dev
   ```
   *Ứng dụng sẽ mặc định khởi chạy tại địa chỉ: `http://localhost:3000` hoặc `http://0.0.0.0:3000`.*

---

## Các tập lệnh có sẵn (Available Scripts)

- `npm run dev`: Khởi chạy ứng dụng ở chế độ phát triển (Development mode).
- `npm run build`: Đóng gói ứng dụng để chuẩn bị cho môi trường Production (kết quả nằm trong thư mục `dist`).
- `npm run preview`: Chạy thử bản build production trên môi trường local.
- `npm run clean`: Xóa các file build cũ (`dist`) và file tự tạo để dọn dẹp thư mục dự án.
- `npm run lint`: Chạy trình kiểm tra cú pháp và lỗi type của TypeScript.

---

## Chuẩn hóa Đặt tên Nhánh (Branch Naming Conventions)

Quy tắc chung để đặt tên nhánh: 
`<type>/<issue-id>-<mô-tả-ngắn-gọn>`

Các `<type>` được phép sử dụng:
- `feature/` hoặc `feat/`: Khi thêm một tính năng mới (VD: `feature/login-page`).
- `bugfix/` hoặc `fix/`: Khi sửa một lỗi (VD: `fix/header-layout`).
- `hotfix/`: Khi sửa lỗi khẩn cấp trên môi trường Production.
- `chore/`: Cập nhật cấu hình, dependency, v.v... không liên quan đến logic code (VD: `chore/update-react`).
- `refactor/`: Tái cấu trúc code (không thêm tính năng, không sửa lỗi) (VD: `refactor/auth-context`).
- `docs/`: Thêm hoặc chỉnh sửa tài liệu.

**Ví dụ một nhánh chuẩn:** `feature/TICKET-123-add-dark-mode`

---

## Chuẩn hóa Commit (Commit Message Conventions)

Dự án áp dụng tiêu chuẩn [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
Cấu trúc chung: `<type>(<scope>): <subject>`

Các `<type>` phổ biến:
- `feat`: Thêm tính năng mới.
- `fix`: Sửa lỗi (bug).
- `docs`: Cập nhật tài liệu (README, comments...).
- `style`: Thay đổi format code (thêm khoảng trắng, dấu phẩy,... không làm thay đổi logic).
- `refactor`: Thay đổi cấu trúc code nhưng không sửa lỗi hay thêm tính năng.
- `perf`: Cải thiện hiệu năng.
- `test`: Thêm hoặc sửa mã kiểm thử.
- `chore`: Cập nhật quy trình build, cấu hình hoặc thư viện bên ngoài.

**Quy tắc viết phần `<subject>`:**
- Viết bằng tiếng Anh (hoặc tiếng Việt tùy quy định team), bắt đầu bằng động từ, viết thường, không viết hoa chữ cái đầu (VD: `add`, `change`, `remove`).
- Không có dấu chấm `.` ở cuối câu.
- Có thể đính kèm mã Issue/Ticket ở cuối.

**Ví dụ:**
- `feat(auth): add login form validation (#123)`
- `fix(header): resolve overlapping logo issue`
- `chore: update dependencies`
