# MindHub E-Learning CI/CD Documentation

Tài liệu này mô tả chi tiết quy trình Tích hợp Liên tục (CI) và Triển khai Liên tục (CD) cho toàn bộ hệ thống MindHub (bao gồm cả Backend Laravel và Frontend React/Vite).

## 1. Branch & Deployment Strategy
* **Các nhánh chính**:
  - `main`: Chứa code đã được release lên Production. Bất cứ code nào gộp vào đây đều sẵn sàng chạy thật.
  - `develop`: Nhánh gom tính năng (integration branch). Tất cả các PR đều merge vào đây trước. Môi trường Staging (nếu có) sẽ map với nhánh này.
* **Quy trình Deploy**:
  - Khi có Push hoặc PR được merge vào nhánh `main` hoặc `develop`, luồng CI sẽ tự động chạy trước.
  - Sau khi CI hoàn tất và thành công (PASS), luồng CD tương ứng sẽ kích hoạt (qua event `workflow_run`) để bắt đầu quá trình triển khai lên server thật.

## 2. CI Flow (Tích hợp liên tục)
CI đóng vai trò rào chắn, kiểm tra lỗi sớm.

### Backend CI (`MindHub-Backend/BE/.github/workflows/ci.yml`)
* **Môi trường**: PHP 8.3, MariaDB.
* **Quá trình**:
  1. Cài đặt các thư viện thông qua `composer install`.
  2. Copy file `.env` chuẩn bị cho test.
  3. Chạy lệnh migrate trên database test MariaDB.
  4. Chạy toàn bộ các bài kiểm thử tự động bằng framework **Pest**.
* **Đầu ra**: Chỉ báo Pass/Fail (không có artifact vật lý).

### Frontend CI (`MindHub-Frontend/FE-minhub/.github/workflows/ci.yml`)
* **Môi trường**: Node.js 22.x.
* **Quá trình**:
  1. Cài đặt các package qua `npm ci`.
  2. Kiểm tra type và lỗi cú pháp (Lint) qua `npm run lint`.
  3. Đảm bảo ứng dụng build thành công bằng `npm run build`.
* **Đầu ra**: Trạng thái Pass/Fail của mã nguồn Frontend.

## 3. CD Flow (Triển khai liên tục)
Mục tiêu là mang bản dựng/code cuối cùng lên Server một cách an toàn mà không làm gián đoạn hệ thống. Hai CD workflow chạy song song nhưng hoạt động riêng lẻ.

### Backend CD (`MindHub-Backend/BE/.github/workflows/cd.yml`)
* Khi CI của BE hoàn thành thành công, GitHub Actions dùng `appleboy/ssh-action` đăng nhập vào Server.
* **Process**:
  1. Tạo thư mục release mới đánh dấu bằng Timestamp: `releases/202XXXXXXXXXX`.
  2. Kéo code trực tiếp từ nhánh tương ứng trên GitHub về server (`git clone`).
  3. Cài đặt package Production-only: `composer install --no-dev --optimize-autoloader`.
  4. **Migration Policy**: Chạy an toàn với lệnh `php artisan migrate --force`. (Tuyệt đối **không dùng** `migrate:fresh`).
  5. Đổi symlink `current` trỏ sang folder release mới (giữ lại bản cũ trong `previous`).
  6. Xóa cache và khởi động lại dịch vụ ngầm (Queue workers).
  7. Xóa các release cũ để dọn dẹp, chỉ giữ lại 3 bản gần nhất.

### Frontend CD (`MindHub-Frontend/FE-minhub/.github/workflows/cd.yml`)
* Khi CI của FE hoàn thành thành công, Runner sẽ build mã nguồn tại chỗ.
* **Process**:
  1. Build mã nguồn bằng `npm run build`. Đầu ra là folder `dist/`.
  2. Tạo thư mục release theo timestamp trên server qua SSH.
  3. Dùng SCP (`appleboy/scp-action`) chép toàn bộ folder `dist` vào thư mục release vừa tạo.
  4. Đổi symlink `current` trỏ sang folder release mới.

## 4. Health Check
Ngay sau khi đổi symlink (Deploy thành công), CD sẽ không dừng lại mà tiếp tục bước kiểm tra.
* **Backend Health Check**: Server tự động gửi cURL tới `http://localhost/api/up`. Trạng thái trả về bắt buộc phải là `200 OK`.
* **Frontend Health Check**: Gửi cURL tới `http://localhost/` để xem trang web có đang hiển thị nội dung HTML (Trạng thái `200`) hay không.

## 5. Rollback Procedure
Hệ thống áp dụng kiến trúc **Symlink Reversion**.
1. Trước khi đổi Symlink `current` sang bản code mới, hệ thống tự động gắn thư mục `current` hiện tại vào biến `previous`.
2. Nếu bước **Health Check FAILED**, kịch bản CD sẽ chủ động chạy lệnh khôi phục: gỡ symlink hiện tại và trỏ `current` về thẳng `previous`.
3. Nhờ cơ chế này, hệ thống sẽ hồi phục code (FE) và dịch vụ (BE) chỉ trong tích tắc, đồng thời kết thúc Workflow bằng một thông báo LỖI (Fail) đỏ rực trên GitHub báo hiệu cho Lập trình viên biết bản deploy vừa rồi có lỗi.

## 6. Server Requirements
Để kịch bản chạy thành công, Server mục tiêu cần:
- Ubuntu/Debian Linux Server.
- Có cài đặt Nginx (trỏ Web Root của domain FE và proxy tới API của BE).
- Có cài đặt PHP, Composer (cho Backend).
- Có thư mục `releases/` cho cả BE và FE (nằm độc lập) với phân quyền an toàn.
- File `.env` chứa mọi dữ liệu cơ sở hạ tầng được quản lý trực tiếp bằng tay trên Host.

## 7. Required GitHub Secrets
Vào tab **Settings > Secrets and variables > Actions** của cả 2 Repositories để cấu hình bắt buộc:
| Tên Secret | Công dụng |
| --- | --- |
| `SSH_HOST` | Địa chỉ IP (hoặc domain) của Production Server |
| `SSH_USER` | Tên người dùng SSH (khuyên dùng user không phải root nhưng có quyền vào www) |
| `SSH_PRIVATE_KEY` | Mã khóa dạng RSA/Ed25519 Private Key để xác thực vào máy chủ |

*(Các thông tin kết nối Database, API Key như Sepay, Cloudinary không lưu ở GitHub Secrets mà được quản lý trong file `.env` trên Server)*

## 8. Troubleshooting
* **Deploy thất bại nhưng Health Check báo thành công?**
  - Rất hiếm khi xảy ra. Hãy truy cập Server, trỏ Symlink thủ công bằng lệnh `ln -snf /đường/dẫn/đến/release/ổn/định /đường/dẫn/đến/current` sau đó khởi động lại Nginx/PHP.
* **Lỗi Authentication khi chạy CD?**
  - Kiểm tra lại định dạng `SSH_PRIVATE_KEY`, chắc chắn rằng nó bao gồm cả dòng `-----BEGIN OPENSSH PRIVATE KEY-----` và `-----END OPENSSH PRIVATE KEY-----`.
* **Báo lỗi Permission Denied khi symlink?**
  - Hãy kiểm tra quyền sở hữu của thư mục deploy (`chown -R www-data:www-data`).
