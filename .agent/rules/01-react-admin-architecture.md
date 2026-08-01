# Kiến trúc React Admin bắt buộc
## Công nghệ
- React 19.
- TypeScript.
- Vite.
- Tailwind CSS v4.
- React Router.
- Lucide React cho icon.
- Giữ hệ thống thư viện hiện có, không tự cài thêm package khi chưa cần thiết.
## Nguyên tắc React thuần
Component React không được dùng JavaScript DOM cũ để điều khiển vùng giao diện do React render.
Không thêm mới:
- initPage().
- document.getElementById().
- document.querySelector().
- innerHTML.
- classList để điều khiển trạng thái UI.
- addEventListener trực tiếp lên phần tử React.
- onclick hoặc thuộc tính sự kiện HTML dạng chuỗi.
Thay thế bằng:
- useState.
- useEffect có cleanup khi thật sự cần.
- useMemo.
- useCallback.
- React event handlers.
- Props.
- Controlled components.
- Custom hooks.
- Render có điều kiện bằng JSX.
Không chép HTML sang JSX rồi gọi lại initPage().
## Tổ chức module
Code Admin mới đặt trong:
src/features/admin/
Mỗi nghiệp vụ nên colocate theo dạng:
feature-name/
- FeaturePage.tsx
- components/
- hooks/
- feature.service.ts
- feature.types.ts
- feature.mapper.ts
- feature.constants.ts
- feature.utils.ts
Chỉ tạo file thực sự cần. Không bắt buộc tạo đủ tất cả file nếu module nhỏ.
Code dùng chung cho nhiều trang Admin đặt trong:
src/features/admin/components/
src/features/admin/hooks/
src/features/admin/services/
src/features/admin/types/
src/features/admin/utils/
Code dùng chung toàn hệ thống mới đặt trong src/shared/.
## Import
- Ưu tiên alias @/.
- Không tạo chuỗi import tương đối ../../../../.
- Không tạo import vòng.
- Không khai báo trùng type, constant, status map hoặc helper đã tồn tại.
- Phải tìm helper dùng chung trước khi viết helper mới.
## TypeScript
- Không dùng any nếu có thể mô tả kiểu dữ liệu.
- Tách DTO API và model hiển thị khi cấu trúc khác nhau.
- Không giả định field API tồn tại.
- Dùng fallback có ý nghĩa cho dữ liệu nullable.
- Không che lỗi type bằng @ts-ignore nếu chưa giải thích nguyên nhân.
## Layout
- AdminLayout là layout chung.
- Trang con không tự tạo thêm sidebar hoặc topbar.
- Không lồng thêm main nếu AdminLayout đã có main.
- Không tạo hai vùng cuộn dọc cạnh nhau.
- Sidebar đóng/mở không được làm vỡ chiều rộng nội dung.
