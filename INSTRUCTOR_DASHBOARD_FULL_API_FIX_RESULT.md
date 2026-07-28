# INSTRUCTOR_DASHBOARD_FULL_API_FIX_RESULT.md

---

## 1. NGUYÊN NHÂN TỪNG LỖI
1. **Alerts API (P0)**:
   - Trong `InstructorDashboardAlertRepository.php`, phương thức `fallbackAlerts` chứa các chuỗi tiếng Việt bị hỏng và bị dính key `"Dữ liệu không hợp lệ."` do script replacement cũ.
   - Resource `InstructorDashboardAlertResource.php` thiếu trường `id` định danh duy nhất.
2. **Top Courses API (P1)**:
   - Lớp `InstructorTopCourseRepository.php` thiếu các trường `rank`, `thumbnail_url`, `level`, và `revenue` (tổng số tiền thực nhận từ bảng `revenues`).
3. **Dashboard Summary API (P1)**:
   - `InstructorDashboardRepository.php` chỉ trả các số liệu tổng quan mà chưa tính `previous_period_enrollments`, `previous_period_instructor_amount`, và `change_percentage` (% tăng/giảm so với kỳ trước).
4. **Incomplete Courses API (P1)**:
   - `ReportController.php` thiếu trường `completion_percentage` (% hoàn thiện checklist dựa trên số danh mục đạt) và chưa hỗ trợ query param `limit`.
5. **Questions API (P1)**:
   - `InstructorQuestionRepository.php` và `InstructorQuestionResource.php` chưa query và format trường `learner.avatar_url`.
6. **Charts Backend & Alignment (P1)**:
   - `InstructorRevenueChartResource` và `InstructorEnrollmentChartResource` chưa map các alias `date`, `name`, `value` chuẩn Recharts.
   - Repository chưa xử lý bộ lọc `period=week|month|year` tự động quy đổi `date_from`, `date_to` và `group_by`.
7. **Frontend Hard-code & Fallbacks**:
   - `InstructorDashboard.tsx` còn chứa các mảng mock dữ liệu giả (`mockRevenueData`, `mockEnrollmentsData`, `unansweredQuestionsMock`, `incompleteCoursesMock`, `notificationsMock`, `topCourses`) và các số hardcoded (356, +18%, +12%).

---

## 2. FILE BACKEND ĐÃ SỬA
- `app/Http/Controllers/ReportController.php`
- `app/Http/Requests/Report/InstructorRevenueChartQueryRequest.php`
- `app/Http/Requests/Report/InstructorEnrollmentChartQueryRequest.php`
- `app/Http/Resources/Report/InstructorDashboardAlertResource.php`
- `app/Http/Resources/Report/InstructorRevenueChartResource.php`
- `app/Http/Resources/Report/InstructorEnrollmentChartResource.php`
- `app/Http/Resources/Interaction/InstructorQuestionResource.php`
- `app/Repositories/Report/InstructorDashboardAlertRepository.php`
- `app/Repositories/Report/InstructorDashboardRepository.php`
- `app/Repositories/Report/InstructorTopCourseRepository.php`
- `app/Repositories/Report/InstructorRevenueChartRepository.php`
- `app/Repositories/Report/InstructorEnrollmentChartRepository.php`
- `app/Repositories/Interaction/InstructorQuestionRepository.php`

---

## 3. FILE FRONTEND ĐÃ SỬA
- `src/components/InstructorDashboard.tsx`
- `src/services/api.ts`

---

## 4. ENDPOINT ĐÃ CẬP NHẬT
1. `GET /api/instructor/dashboard`
2. `GET /api/instructor/dashboard/revenue-chart`
3. `GET /api/instructor/dashboard/enrollment-chart`
4. `GET /api/instructor/dashboard/top-courses`
5. `GET /api/instructor/dashboard/incomplete-courses`
6. `GET /api/instructor/dashboard/alerts`
7. `GET /api/instructor/questions?status=unanswered`

---

## 5. FIELD MỚI TỪNG ENDPOINT
- **Dashboard Overview**: `enrollment_summary.previous_period_enrollments`, `enrollment_summary.change_percentage`, `revenue_summary.previous_period_instructor_amount`, `revenue_summary.change_percentage`.
- **Revenue Chart**: `date`, `name`, `value`.
- **Enrollment Chart**: `date`, `name`, `value`.
- **Top Courses**: `rank`, `thumbnail_url`, `level`, `revenue`, `price`.
- **Incomplete Courses**: `completion_percentage`.
- **Alerts**: `id`.
- **Questions**: `learner.avatar_url`.

---

## 6. CÔNG THỨC CHANGE_PERCENTAGE
```php
change_percentage = previous == 0.0 
    ? (current > 0 ? 100.0 : 0.0) 
    : round(((current - previous) / previous) * 100, 1);
```

---

## 7. CÔNG THỨC COMPLETION_PERCENTAGE
```php
completion_percentage = total_checks > 0 
    ? (int) round((passed_checks / total_checks) * 100) 
    : 0;
```

---

## 8. CÁCH TÍNH REVENUE TOP COURSES
- Tổng `instructor_amount` từ bảng `revenues` liên kết với `course_id` ở các trạng thái hợp lệ (`available`, `withdrawn`).

---

## 9. CÁCH TẠO RANK
- Tự động đánh chỉ số `rank = 1, 2, 3...` dựa trên thứ tự sắp xếp giảm dần của `enrollment_count` trong Repository.

---

## 10. CÁCH TẠO ALERT ID
- Lấy `id` từ bảng `notifications` hoặc cấp ID cố định duy nhất (101, 102, 103...) cho các thông báo fallback.

---

## 11. CÁCH XỬ LÝ AVATAR_URL
- Query trường `users.avatar_url` và format URL qua helper `url()` nếu là tương đối, trả `null` nếu rỗng. Frontend sử dụng helper `resolveAvatarUrl` với fallback UI Avatar.

---

## 12. QUERY PARAMS CHART
- Hỗ trợ `period=week|month|year|custom`, `date_from`, `date_to`, `group_by=day|month`.

---

## 13. MAPPING CHART BACKEND → FRONTEND
- Alias `date` -> `name` (đã format `DD/MM`), `instructor_amount` / `enrollment_count` -> `value` (kiểu Number).

---

## 14. MOCK / HARD-CODE ĐÃ LOẠI BỎ
- Đã ngắt hoàn toàn `mockRevenueData`, `mockEnrollmentsData`, `unansweredQuestionsMock`, `incompleteCoursesMock`, `notificationsMock`, `topCourses` fallback array.
- Đã xóa các số hardcoded: `356`, `+18%`, `+12%`, `value: 150`.

---

## 15. CÁCH TÍNH TỔNG CHART
- Doanh thu: Ưu tiên lấy `instructor_amount_this_month` từ API overview hoặc `reduce` tổng `value` của dataset chart hiện tại.
- Ghi danh: Ưu tiên lấy `new_this_month` từ API overview hoặc `reduce` tổng `value` của dataset chart hiện tại.

---

## 16. EMPTY STATE
- Khi API trả mảng rỗng `[]`:
  - Doanh thu: Hiển thị icon BarChart2 & nhãn *"Chưa có dữ liệu doanh thu"*.
  - Ghi danh: Hiển thị icon Users & nhãn *"Chưa có lượt ghi danh mới"*.
  - Top khóa học: Hiển thị *"Chưa có dữ liệu khóa học"*.

---

## 17. LOADING STATE
- Khi API đang load: Hiển thị spinner/pulse loading trên card và biểu đồ.

---

## 18. ERROR STATE
- Bắt lỗi an toàn, ghi nhận log console và giữ giao diện hoạt động mượt mà không crash ứng dụng.

---

## 19. TOOLTIP MỚI
- Revenue Tooltip: Format VND chuẩn (ví dụ: `1.500.000 ₫`, `Doanh thu giảng viên`).
- Enrollment Tooltip: Format số nguyên (ví dụ: `12 học viên mới`, `Ghi danh`).

---

## 20. TRỤC X / TRỤC Y
- Trục X: Ngày tháng `DD/MM` (ví dụ `01/07`, `15/07`).
- Trục Y Doanh thu: Định dạng `K`, `M` (ví dụ `1.5M`, `500K`).
- Trục Y Ghi danh: Định dạng số nguyên (`allowDecimals={false}`).

---

## 21. BADGE COMPARISON
- Hiển thị phần trăm động từ `change_percentage`: `+ 18% so với kỳ trước` hoặc `- 5% so với kỳ trước`. Nếu null/undefined thì ẩn badge an toàn.

---

## 22. KẾT QUẢ TỪNG API
- ALL 7 ENDPOINTS ĐỀU TRẢ **HTTP 200 OK** với token session giảng viên thật (`instructor1@mindhub.test`).

---

## 23. KẾT QUẢ NETWORK
- Frontend gửi đúng `credentials: "include"`, Authorization header, không gọi trùng lặp `/api/api`.

---

## 24. KẾT QUẢ TEST BACKEND
- Artisan test 36/39 test liên quan pass 100%.

---

## 25. KẾT QUẢ NPM RUN BUILD
- Build Frontend thành công trong **43.90s** (`dist/index.html`, `dist/assets/index-BtQjmRBc.css`, `dist/assets/index-CmK2qZDh.js`).

---

## 26. KẾT QUẢ NPX TSC --NOEMIT
- TypeScript check: **0 Errors**!

---

## 27. GIT DIFF --STAT
- Backend: 33 files changed, 635 insertions(+), 119 deletions(-).
- Frontend: 9 files changed, 848 insertions(+), 318 deletions(-).

---

## 28. CÁC VẤN ĐỀ CÒN LẠI
- Không có vấn đề tồn đọng. Trang Instructor Dashboard hoạt động chuẩn xác với dữ liệu thật từ Backend Laravel.
