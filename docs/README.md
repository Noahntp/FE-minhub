# MindHub Frontend

## Giới thiệu dự án (Project Introduction)
MindHub là một dự án ứng dụng web hiện đại, được xây dựng với các công nghệ Frontend tiên tiến nhất nhằm mang lại trải nghiệm người dùng mượt mà và tối ưu hóa hiệu suất. Dự án áp dụng kiến trúc **Feature-based Colocation** giúp code dễ dàng mở rộng và bảo trì.

**Công nghệ sử dụng:**
- **[React 19](https://react.dev/)**: Thư viện UI cốt lõi.
- **[Vite](https://vitejs.dev/)**: Công cụ build siêu tốc và phát triển frontend.
- **[TypeScript](https://www.typescriptlang.org/)**: Hỗ trợ định kiểu mạnh mẽ giúp code an toàn.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Framework CSS utility-first để tạo kiểu nhanh chóng.
- **[Framer Motion](https://motion.dev/)**: Thư viện tạo animation mượt mà.
- **[Lucide React](https://lucide.dev/)**: Thư viện icon đẹp và nhẹ.

---

## Kiến trúc & Cấu trúc thư mục (Architecture & Folder Structure)

Dự án áp dụng mô hình **Feature-based Colocation**. Mọi thành phần liên quan đến một tính năng nghiệp vụ cụ thể (components, utils, types, API calls...) đều được gom chung vào một thư mục tính năng đó thay vì phân tán.

```text
src/
├── app/                  # File khởi chạy app (main.tsx, App.tsx, CSS toàn cục)
├── assets/               # File tĩnh như hình ảnh, font chữ
├── shared/               # Code dùng chung trên toàn hệ thống
│   ├── components/ui/    # UI cơ bản (Button, Loading, ErrorState...)
│   ├── utils/            # Hàm tiện ích chung (format.ts, safeStorage.ts...)
│   ├── lib/              # Cấu hình thư viện (axios, media-url...)
│   └── types.ts          # Định nghĩa Type TypeScript toàn cục
├── features/             # Các nghiệp vụ chính của ứng dụng
│   ├── admin/            # Dashboard quản trị viên
│   ├── instructor/       # Màn hình giảng viên
│   ├── auth/             # Đăng nhập, đăng ký, OTP
│   ├── classroom/        # Trải nghiệm học tập (Video, Comment)
│   ├── courses/          # Tìm kiếm, danh mục, chi tiết khóa học
│   ├── cart/             # Giỏ hàng & Thanh toán
│   ├── profile/          # Hồ sơ người dùng cá nhân
│   ├── coupons/          # Quản lý mã giảm giá
│   └── qa/               # Quản lý Hỏi đáp
├── layouts/              # Bố cục trang (Navbar, Footer, MainLayout)
├── pages/                # Các trang tĩnh tổng hợp tính năng (About, Contact)
└── router/               # Cấu hình định tuyến (Routing)
```

## Import bằng Alias (Absolute Imports)

Để tránh tình trạng "Import Hell" (ví dụ: `../../../../components/ui/Button`), dự án đã cấu hình alias trỏ thẳng vào thư mục `src/`. Khi import, hãy sử dụng `@/` thay vì đường dẫn tương đối.

**Ví dụ:**
```tsx
// ❌ KHÔNG DÙNG:
import { Loading } from '../../shared/components/ui/Loading';

// ✅ KHUYÊN DÙNG:
import { Loading } from '@/shared/components/ui/Loading/Loading';
import { formatCurrency } from '@/shared/utils/format';
import { UserProfile } from '@/features/profile/types';
```

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
   Copy file mẫu `.env.example` thành file `.env` và cấu hình các thông số phù hợp.
   ```bash
   cp .env.example .env
   ```

4. **Chạy server development:**
   ```bash
   npm run dev
   ```
   *Ứng dụng sẽ mặc định khởi chạy tại địa chỉ: `http://localhost:5173` (Vite).*

---

## Các tập lệnh có sẵn (Available Scripts)

- `npm run dev`: Khởi chạy ứng dụng ở chế độ phát triển (Development mode).
- `npm run build`: Đóng gói ứng dụng để chuẩn bị cho môi trường Production (kết quả nằm trong thư mục `dist`).
- `npm run preview`: Chạy thử bản build production trên môi trường local.
- `npm run clean`: Xóa các file build cũ (`dist`).
- `npm run lint`: Chạy trình kiểm tra cú pháp và lỗi type của TypeScript.

---

## Chuẩn hóa Đặt tên Nhánh (Branch Naming Conventions)

Quy tắc chung để đặt tên nhánh: 
`<type>/<issue-id>-<mô-tả-ngắn-gọn>`

Các `<type>` được phép sử dụng:
- `feature/` hoặc `feat/`: Thêm tính năng mới (VD: `feature/login-page`).
- `bugfix/` hoặc `fix/`: Sửa một lỗi (VD: `fix/header-layout`).
- `hotfix/`: Sửa lỗi khẩn cấp trên Production.
- `chore/`: Cập nhật cấu hình, dependency (VD: `chore/update-react`).
- `refactor/`: Tái cấu trúc code (VD: `refactor/frontend-colocation`).
- `docs/`: Thêm hoặc chỉnh sửa tài liệu.

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

**Ví dụ:**
- `feat(auth): add login form validation`
- `fix(header): resolve overlapping logo issue`
- `refactor(arch): colocate components by features`
