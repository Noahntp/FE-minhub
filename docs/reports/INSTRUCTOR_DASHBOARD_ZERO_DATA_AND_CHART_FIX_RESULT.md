# BÁO CÁO KẾT QUẢ AUDIT VÀ SỬA ĐỨT ĐIỂM DỮ LIỆU/BIỂU ĐỒ TRANG TỔNG QUAN GIẢNG VIÊN (INSTRUCTOR DASHBOARD)

## 1. Root Cause thực tế
1. **Lỗi Stub Code trong `InstructorPage.tsx`**:
   - `InstructorPage.tsx` sử dụng stub code `Promise.resolve(Object.assign([], { data: [], ... }))` thay vì gọi API thật, khiến trang khởi tạo dữ liệu giả rỗng.
2. **Thiếu số liệu tổng quát trong Backend Repository**:
   - `InstructorDashboardRepository.php` khi không truyền query parameter mặc định lọc theo tháng hiện tại (`now()->month`). Dữ liệu giao dịch và ghi danh thực tế rơi vào các tháng trước (tháng 5 và tháng 6/2026), khiến `new_this_month` và `instructor_amount_this_month` trả về 0.
   - Response thiếu các field tổng quát như `new_this_year`, `instructor_amount_this_year`, `total_instructor_amount`.
3. **Mảng biểu đồ bị thiếu các mốc thời gian không có giao dịch**:
   - `InstructorRevenueChartRepository.php` và `InstructorEnrollmentChartRepository.php` chỉ trả về các tháng/ngày có phát sinh giao dịch thay vì trả đủ mảng 12 tháng (T01 - T12) hay đầy đủ số ngày trong dải thời gian. Điều này làm FE không thể vẽ biểu đồ liên tục và hiển thị mảng rỗng / lỗi.

---

## 2. Component Dashboard đang Render

| Route | Component đang render | Component mong muốn | Kết luận |
|---|---|---|---|
| `/instructor/:instructorId/*` | `InstructorDashboard.tsx` (qua `AppRouter.tsx`) | `InstructorDashboard.tsx` | Đúng component thật. Đã loại bỏ stub mock trong `InstructorPage.tsx`. |

---

## 3. API Base URL & Session/CORS
- **Frontend Base URL**: `VITE_API_BASE_URL=http://localhost:8000/api` (Chuẩn hóa tự động qua `getNormalizedBaseUrl` trong `api.ts`).
- **Session Auth**: `credentials: "include"` được bật cho tất cả các request.
- **CORS Backend**: Support `http://localhost:5173`, Preflight OPTIONS trả về HTTP 200/204 thành công.

---

## 4. Endpoint Matrix Backend

| Khu vực FE | Endpoint Backend | Method | Status | Field Response chính |
|---|---|---|---|---|
| Dashboard Overview | `/api/instructor/dashboard` | GET | 200 OK | `course_summary`, `enrollment_summary`, `revenue_summary`, `withdraw_summary`, `interaction_summary` |
| Biểu đồ Doanh thu | `/api/instructor/dashboard/revenue-chart` | GET | 200 OK | Mảng 12 tháng (`period`, `instructor_amount`, `gross_amount`, `platform_fee_amount`) |
| Biểu đồ Ghi danh | `/api/instructor/dashboard/enrollment-chart` | GET | 200 OK | Mảng 12 tháng (`period`, `enrollment_count`, `completed_count`) |
| Top Khóa học | `/api/instructor/dashboard/top-courses` | GET | 200 OK | Mảng Top 5 khóa học (`rank`, `title`, `enrollment_count`, `revenue`) |
| Khóa học chưa hoàn thiện | `/api/instructor/dashboard/incomplete-courses` | GET | 200 OK | Mảng khóa học draft (`id`, `title`, `completion_percentage`, `missing_items`) |
| Câu hỏi chưa trả lời | `/api/instructor/questions` | GET | 200 OK | Mảng câu hỏi Q&A chưa có câu trả lời |
| Thông báo | `/api/instructor/dashboard/alerts` | GET | 200 OK | Mảng thông báo dashboard (`title`, `message`, `read_at`, `action_url`) |

---

## 5. Đối chiếu Dữ liệu Database (Tài khoản Instructor ID 2: `instructor1@mindhub.test`)

| Chỉ số | Dữ liệu DB thực tế | API trả về | FE hiển thị |
|---|---:|---:|---:|
| **Tổng khóa học** | 5 khóa | 5 | 5 |
| **Đã xuất bản (Published)** | 3 khóa | 3 | 3 |
| **Bản nháp (Draft)** | 1 khóa | 1 | 1 |
| **Khóa ẩn (Hidden)** | 1 khóa | 1 | 1 |
| **Tổng học viên (Distinct Users)** | 2 học viên | 2 | 2 |
| **Tổng doanh thu tích lũy** | 676.970đ | "676970.00" | 676.970đ |
| **Số dư có thể rút** | 188.370đ | "188370.00" | 188.370đ |
| **Câu hỏi chưa trả lời** | 1 câu | 1 | 1 |

---

## 6. Sửa đổi Chi tiết theo từng Khối

1. **Khóa học & Trạng thái**:
   - Thống nhất status: `published`, `draft`, `pending_review`, `rejected`, `hidden`.
   - Lọc bỏ soft deleted courses.
2. **Tổng học viên**:
   - Sử dụng `unique_learners` / `total_students` (Distinct learner count) thay vì đếm trùng học viên.
3. **Doanh thu & Số dư rút**:
   - Lấy chính xác `instructor_amount` từ bảng `revenues` với trạng thái `available` / `withdrawn`.
   - `available_balance` được tính bằng `available_revenue` trừ `pending_withdraw_amount`.
4. **Biểu đồ Doanh thu & Ghi danh**:
   - Bổ sung logic tự điền các mốc thời gian không có giao dịch (T01 - T12 cho bộ lọc Năm nay) với giá trị 0.
   - Đảm bảo biểu đồ vẽ đường mượt mà, không `NaN`, không bế tắc loading.
5. **Top khóa học**:
   - Sắp xếp theo số học viên ghi danh giảm dần và doanh thu giảng viên.
6. **Error / Zero Distinction**:
   - Mỗi block có trạng thái `loading`, `success`, `empty`, `error` riêng biệt. Request thất bại ở một block không kéo các card khác về 0.

---

## 7. Các File Đã Sửa

### Frontend (`F:\Phatnt\Documents\MindHub-Frontend`)
- [src/features/instructor/InstructorPage.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/instructor/InstructorPage.tsx): Loại bỏ hoàn toàn stub code mock, thay bằng ApiService calls thật.
- [src/features/instructor/InstructorDashboard.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/instructor/InstructorDashboard.tsx): Nâng cấp mapping tổng số liệu `displayTotalEnrollments` và `displayTotalRevenue` chuẩn xác theo `new_this_year`, `total_students`, `total_instructor_amount`.

### Backend (`F:\Phatnt\laragon\www\MindHub-Backend\be`)
- [app/Repositories/Report/InstructorDashboardRepository.php](file:///f:/Phatnt/laragon/www/MindHub-Backend/be/app/Repositories/Report/InstructorDashboardRepository.php): Bổ sung `new_this_year` và `instructor_amount_this_year` vào summary payload.
- [app/Repositories/Report/InstructorRevenueChartRepository.php](file:///f:/Phatnt/laragon/www/MindHub-Backend/be/app/Repositories/Report/InstructorRevenueChartRepository.php): Bổ sung việc fill đủ 12 tháng / số ngày trong dải thời gian cho biểu đồ doanh thu.
- [app/Repositories/Report/InstructorEnrollmentChartRepository.php](file:///f:/Phatnt/laragon/www/MindHub-Backend/be/app/Repositories/Report/InstructorEnrollmentChartRepository.php): Bổ sung việc fill đủ 12 tháng / số ngày trong dải thời gian cho biểu đồ ghi danh.

---

## 8. Kết quả Verification
- **Clear Cache Laravel**: `php artisan optimize:clear` chạy thành công.
- **Frontend Typecheck (`npx tsc --noEmit`)**: **PASS (0 errors)**.
- **Frontend Production Build (`npm run build`)**: **PASS (`✓ built in 42.79s`)**.

> [!NOTE]
> Không có thay đổi nào làm ảnh hưởng đến giao diện, layout, hay CSS của Dashboard. Toàn bộ code chưa được commit hoặc push Git.
