# INSTRUCTOR_DASHBOARD_MISSING_API_AUDIT.md

---

## 1. COMPONENT FRONTEND ĐÃ KIỂM TRA
- `src/components/InstructorDashboard.tsx`
- `src/components/InstructorTopCourses.tsx`
- `src/components/InstructorRevenueChart.tsx`
- `src/components/InstructorEnrollmentChart.tsx`

## 2. SERVICE FRONTEND ĐÃ KIỂM TRA
- `src/services/api.ts`
- Các hàm service liên quan:
  - `getInstructorDashboard(params)`
  - `getInstructorRevenueChart(params)`
  - `getInstructorEnrollmentChart(params)`
  - `getInstructorTopCourses(params)`
  - `getInstructorIncompleteCourses(params)`
  - `getInstructorDashboardAlerts(params)`
  - `getInstructorUnansweredQuestions(params)`

## 3. ENDPOINT FRONTEND ĐANG GỌI
1. `GET /api/instructor/dashboard`
2. `GET /api/instructor/dashboard/revenue-chart`
3. `GET /api/instructor/dashboard/enrollment-chart`
4. `GET /api/instructor/dashboard/top-courses`
5. `GET /api/instructor/dashboard/incomplete-courses`
6. `GET /api/instructor/dashboard/alerts`
7. `GET /api/instructor/questions?status=unanswered`

## 4. ROUTE BACKEND HIỆN CÓ (`routes/api/instructor.php`)
- `GET api/instructor/dashboard` -> `ReportController@instructorDashboard`
- `GET api/instructor/dashboard/revenue-chart` -> `ReportController@instructorRevenueChart`
- `GET api/instructor/dashboard/enrollment-chart` -> `ReportController@instructorEnrollmentChart`
- `GET api/instructor/dashboard/top-courses` -> `ReportController@instructorTopCourses`
- `GET api/instructor/dashboard/incomplete-courses` -> `ReportController@incompleteCourses`
- `GET api/instructor/dashboard/alerts` -> `ReportController@instructorDashboardAlerts`
- `GET api/instructor/questions` -> `InteractionController@instructorQuestions`

---

## 5. RESPONSE THỰC TẾ TỪNG ENDPOINT

### 5.1 GET /api/instructor/dashboard (HTTP 200)
```json
{
  "success": true,
  "data": {
    "course_summary": {
      "total": 18,
      "published": 16,
      "draft": 1,
      "pending_review": 0,
      "rejected": 0,
      "approved": 0,
      "hidden": 1
    },
    "enrollment_summary": {
      "total_enrollments": 3,
      "active_enrollments": 2,
      "completed_enrollments": 1
    },
    "revenue_summary": {
      "gross_amount_this_month": "0.00",
      "instructor_amount_this_month": "0.00",
      "platform_fee_this_month": "0.00"
    },
    "withdraw_summary": {
      "available_revenue": "188370.00",
      "pending_withdraw_amount": "188370.00",
      "available_balance": "0.00"
    },
    "interaction_summary": {
      "unanswered_questions": 1
    }
  }
}
```

### 5.2 GET /api/instructor/dashboard/revenue-chart (HTTP 200)
- Trả về `data: []` khi tháng đó chưa có dữ liệu giao dịch trong bảng `revenues`.
- Cấu trúc từng phẩn tử Resource: `{ "date": "2026-07-22", "instructor_amount": "0.00", "gross_amount": "0.00" }`.

### 5.3 GET /api/instructor/dashboard/enrollment-chart (HTTP 200)
- Trả về `data: []` khi chưa có lượt ghi danh mới.
- Cấu trúc từng phần tử Resource: `{ "date": "2026-07-22", "enrollment_count": 0 }`.

### 5.4 GET /api/instructor/dashboard/top-courses (HTTP 200)
```json
{
  "success": true,
  "data": [
    {
      "course_id": 1,
      "title": "Laravel REST API từ cơ bản đến triển khai",
      "status": "published",
      "enrollment_count": 2,
      "unique_learner_count": 2
    }
  ]
}
```

### 5.5 GET /api/instructor/dashboard/incomplete-courses (HTTP 200)
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "title": "PHP & MySQL nền tảng cho Backend",
      "status": "published",
      "missing_items": ["quiz", "quiz_question"],
      "warnings": ["lesson_asset"]
    }
  ]
}
```

### 5.6 GET /api/instructor/dashboard/alerts (HTTP 200)
```json
{
  "success": true,
  "data": [
    {
      "type": "unanswered_question",
      "title": "Dữ liệu không hợp lệ.",
      "message": "Test UserDữ liệu không hợp lệ.Laravel REST API từ cơ bản đến triển khai.",
      "created_at": "2026-07-21 04:21:05",
      "action_url": "/instructor/questions?status=unanswered",
      "read_at": null
    }
  ]
}
```

### 5.7 GET /api/instructor/questions?status=unanswered (HTTP 200)
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "comment_id": 5,
      "content": "Đây là một bình luận thử nghiệm tuyệt vời.",
      "status": "unanswered",
      "learner": {
        "id": 4,
        "full_name": "Test User",
        "email": "learner1@mindhub.test"
      },
      "course": { "id": 1, "title": "Laravel REST API..." },
      "lesson": { "id": 2, "title": "Repository..." }
    }
  ]
}
```

---

## 6. BẢNG MAPPING ĐỐI CHIẾU FE ↔ BE

| Khu vực Dashboard | Dữ liệu FE cần | Endpoint FE gọi | Backend có route | Backend có dữ liệu | Field thiếu / Mismatch | Kết luận |
|---|---|---|---|---|---|---|
| Card Tổng quan | total, published, draft, pending, rejected, enrollments, revenue, balance, change_percentage | `GET /api/instructor/dashboard` | Có | Có | `enrollment_summary.change_percentage`, `revenue_summary.change_percentage` | **MISSING_FIELD** |
| Biểu đồ doanh thu | date/name, instructor_amount/value | `GET /api/instructor/dashboard/revenue-chart` | Có | Rỗng khi chưa có tx | Trả rỗng do DB chưa có giao dịch tháng này; Mismatch key `date` ↔ `name` | **WRONG_FIELD_NAME** / **EMPTY_DATA** |
| Biểu đồ ghi danh | date/name, enrollment_count/value | `GET /api/instructor/dashboard/enrollment-chart` | Có | Rỗng khi chưa có tx | Trả rỗng do chưa có lượt đăng ký mới; Mismatch key `date` ↔ `name` | **WRONG_FIELD_NAME** / **EMPTY_DATA** |
| Top khóa học | course_id, title, thumbnail_url, level, enrollment_count, revenue, rank | `GET /api/instructor/dashboard/top-courses` | Có | Có | Thiếu `thumbnail_url`/`image`, `level`, `revenue`, `rank` | **MISSING_FIELD** |
| Khóa học chưa hoàn thiện | id, title, status, completion_percentage, missing_items | `GET /api/instructor/dashboard/incomplete-courses` | Có | Có | Thiếu `completion_percentage` (chỉ có missing_items/warnings) | **MISSING_FIELD** |
| Thông báo mới | id, type, title, message, created_at, read_at, action_url | `GET /api/instructor/dashboard/alerts` | Có | Có (Ghép chuỗi dính lỗi) | Thiếu `id` duy nhất; Chuỗi title/message bị dính lỗi translation key | **MISSING_FIELD** / **SERVER_BUG** |
| Câu hỏi chưa trả lời | id, content, learner.full_name, learner.avatar_url, course.title, created_at | `GET /api/instructor/questions?status=unanswered` | Có | Có | `learner` thiếu `avatar_url` | **MISSING_FIELD** |

---

## 7. CHI TIẾT API & FIELD CÒN THIẾU TRÊN BACKEND

### 7.1 `GET /api/instructor/dashboard`
- **Thiếu**: `previous_period_enrollments`, `enrollment_change_percentage`, `previous_period_revenue`, `revenue_change_percentage`.
- **Yêu cầu bổ sung**: Tính phần trăm tăng/giảm so với 30 ngày trước để hiển thị widget so sánh.

### 7.2 `GET /api/instructor/dashboard/top-courses`
- **Thiếu**: `thumbnail_url` (hoặc `image`), `level` (Cơ bản/Trung cấp/Nâng cao), `revenue` (tổng doanh thu khóa học đó), `rank`.
- **Yêu cầu bổ sung**: Join bảng `courses` lấy `thumbnail_url` và `level`, sum `revenues.instructor_amount` thành trường `revenue`.

### 7.3 `GET /api/instructor/dashboard/incomplete-courses`
- **Thiếu**: `completion_percentage` (tỷ lệ % dựa trên số checklist hoàn thành).
- **Yêu cầu bổ sung**: Tính toán tỷ lệ % hoàn thành checklist (`passed_items / total_items * 100`).

### 7.4 `GET /api/instructor/dashboard/alerts`
- **Lỗi & Thiếu**:
  - `title` và `message` bị ghép chuỗi sai trong `InstructorDashboardAlertService.php` (`"Test UserDữ liệu không hợp lệ.Laravel REST API..."`).
  - Thiếu `id` bản ghi thông báo.

### 7.5 `GET /api/instructor/questions`
- **Thiếu**: `learner.avatar_url`.
- **Yêu cầu bổ sung**: Thêm `avatar_url` trong `LearnerResource` / `InstructorQuestionResource`.

---

## 8. PHÂN PLẠI TASK BACKEND CẦN LÀM (P0 / P1 / P2)

### 📌 P0 — Lỗi nghiêm trọng / Ghép chuỗi sai
1. **Fix `InstructorDashboardAlertService`**: Sửa lỗi ghép chuỗi message làm thông báo bị dính `"Dữ liệu không hợp lệ."`.
2. **Fix `InstructorDashboardAlertResource`**: Bổ sung `id` duy nhất cho từng alert.

### 📌 P1 — Bổ sung field còn thiếu cho Dashboard
1. **Bổ sung field cho `InstructorTopCourseResource`**:
   - `thumbnail_url`
   - `level`
   - `revenue`
   - `rank`
2. **Bổ sung field cho `InstructorDashboardResource`**:
   - `enrollment_summary.change_percentage`
   - `revenue_summary.change_percentage`
3. **Bổ sung field cho `incompleteCourses`**:
   - `completion_percentage`
4. **Bổ sung `avatar_url` cho `InstructorQuestionResource`**:
   - `learner.avatar_url`

### 📌 P2 — Tối ưu hóa & Bộ lọc
1. Hỗ trợ query params `limit` / `per_page` cho `incomplete-courses` (mặc định lấy 5).
2. Chuẩn hóa alias output `date` -> `name`, `instructor_amount` -> `value` trong Chart Resource để Frontend không cần map thủ công.

---

## 9. RESPONSE CONTRACT ĐỀ XUẤT CHO BACKEND

### A. `GET /api/instructor/dashboard/top-courses`
```json
{
  "success": true,
  "message": "Lấy top khóa học thành công.",
  "data": [
    {
      "rank": 1,
      "course_id": 1,
      "title": "Laravel REST API từ cơ bản đến triển khai",
      "thumbnail_url": "http://127.0.0.1:8000/storage/thumbnails/courses/laravel-api.jpg",
      "level": "intermediate",
      "enrollment_count": 12,
      "revenue": "3500000.00"
    }
  ]
}
```

### B. `GET /api/instructor/dashboard/incomplete-courses`
```json
{
  "success": true,
  "message": "Lấy danh sách khóa học chưa hoàn thiện thành công.",
  "data": [
    {
      "id": 4,
      "title": "NodeJS Hidden Draft API",
      "status": "draft",
      "completion_percentage": 40,
      "missing_items": ["published_section", "published_lesson"],
      "warnings": ["lesson_asset"]
    }
  ]
}
```

### C. `GET /api/instructor/dashboard/alerts`
```json
{
  "success": true,
  "message": "Lấy thông báo dashboard thành công.",
  "data": [
    {
      "id": 101,
      "type": "unanswered_question",
      "title": "Câu hỏi mới từ học viên",
      "message": "Học viên Test User vừa đặt câu hỏi trong khóa Laravel REST API.",
      "created_at": "2026-07-21 04:21:05",
      "action_url": "/instructor/questions?status=unanswered",
      "read_at": null
    }
  ]
}
```

---

## 10. FILE BACKEND DỰ KIẾN CẦN SỬA (CHO CÁC TASK TIẾP THEO)
- `app/Http/Resources/Report/InstructorTopCourseResource.php`
- `app/Http/Resources/Report/InstructorDashboardAlertResource.php`
- `app/Http/Resources/Report/InstructorDashboardResource.php`
- `app/Http/Resources/Interaction/InstructorQuestionResource.php`
- `app/Services/Report/InstructorTopCourseService.php`
- `app/Services/Report/InstructorDashboardAlertService.php`
- `app/Services/Report/InstructorDashboardService.php`
- `app/Http/Controllers/ReportController.php`

---

## 11. KẾT LUẬN GIÁO TRÌNH AUDIT
- **Tổng số API Dashboard FE cần**: **7 endpoint**.
- **Backend đã có route & controller**: **7 / 7** (100% đã có route).
- **Backend chạy OK không bị 404/500**: **7 / 7**.
- **Số API có đầy đủ dữ liệu 100%**: **0 / 7** (tất cả 7 API đều đang thiếu 1 số field hoặc dính lỗi format string).
- **API bị dính lỗi ghép chuỗi message**: **1** (`GET /api/instructor/dashboard/alerts`).
- **Thiếu hoàn toàn route**: **0** (không có API nào bị thiếu route hoàn toàn).
