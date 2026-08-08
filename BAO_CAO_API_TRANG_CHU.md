# BÁO CÁO CÁC API NỐI TRANG CHỦ MINDHUB

> **Dự án**: MindHub E-Learning Platform  
> **Phiên bản API**: v1  
> **Endpoint chính**: `GET /api/home` (Hoặc `GET /api/v1/home`)  
> **Mục tiêu**: Tổng hợp toàn bộ dữ liệu Catalog, khóa học, danh mục, đánh giá, voucher và thống kê trên Trang Chủ trong **1 HTTP Request duy nhất** nhằm tối ưu hóa hiệu năng và tốc độ tải trang.

---

## 📌 1. BẢNG TỔNG HỢP API & ĐIỀU KIỆN LỌC DỮ LIỆU

| STT | Tính năng / Section trên Trang Chủ | Component Frontend | Key Dữ Liệu API | Endpoint API | Điều kiện lọc dữ liệu ở Backend (Filter & Sort Rules) | Số lượng bản ghi |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **1** | **Hero Banners (Banner Quảng Cáo)** | `HeroSection.tsx` | `banners` | `GET /api/home` | • `status = 'active'`<br>• `deleted_at IS NULL`<br>• Sắp xếp: `sort_order ASC`, `id DESC` | Động (Theo admin) |
| **2** | **Thanh Thống Kê (Stats Overview)** | `StatsBarSection.tsx` | `stats` | `GET /api/home` | • Thống kê số lượng thực tế từ DB:<br>&nbsp;&nbsp;- `total_courses`: Khóa học `status = 'published'`<br>&nbsp;&nbsp;- `total_students`: Người dùng `role = 'learner'`<br>&nbsp;&nbsp;- `total_instructors`: Người dùng `role = 'instructor'`<br>&nbsp;&nbsp;- `total_reviews`: Tổng số đánh giá bài học | 4 chỉ số |
| **3** | **Danh Mục Nổi Bật (Categories)** | `FeaturedCategoriesSection.tsx` | `categories` | `GET /api/home` | • `status = 'active'`, `deleted_at IS NULL`<br>• Đếm số khóa học đang xuất bản `withCount(['courses' => status = 'published'])`<br>• Sắp xếp: `sort_order ASC`, `id DESC` | 12 danh mục |
| **4** | **Khóa Học Nổi Bật (Featured)** | `FeaturedCoursesSection.tsx` | `featured_courses` | `GET /api/home` | • `courses.status = 'published'`<br>• `courses.is_featured = true`<br>• Giảng viên có `status = 'active'` và `locked = 0`<br>• Sắp xếp: `enrollments_count DESC` (nhiều học viên nhất), `average_rating DESC` (đánh giá cao nhất), `published_at DESC` | 5 khóa học |
| **5** | **Khóa Học Mới Nhất (Latest)** | `NewCoursesSection.tsx` | `latest_courses` | `GET /api/home` | • `courses.status = 'published'`<br>• Giảng viên có `status = 'active'` và `locked = 0`<br>• Sắp xếp: `published_at DESC` (mới xuất bản nhất), `id DESC` | 5 khóa học |
| **6** | **Khóa Học Giảm Giá (Discounted)** | `DiscountedCoursesSection.tsx` | `discounted_courses` | `GET /api/home` | • `courses.status = 'published'`<br>• `courses.sale_price IS NOT NULL` và `courses.sale_price < courses.price`<br>• Giảng viên active<br>• Sắp xếp: Tỷ lệ `%` giảm giá cao nhất `((price - sale_price) / price) DESC`, `published_at DESC` | 5 khóa học |
| **7** | **Mã Ưu Đãi (Promo Vouchers)** | `PromoVoucherSection.tsx` | `vouchers` | `GET /api/home` | • `status = 'active'`<br>• `deleted_at IS NULL`<br>• Trong thời gian hiệu lực: `start_at <= NOW()` và `end_at >= NOW()` (hoặc `NULL`)<br>• Sắp xếp: `id DESC` | 4 mã voucher |
| **8** | **Cảm Nhận Học Viên (Testimonials)** | `StudentTestimonialsSection.tsx` | `testimonials` | `GET /api/home` | • `rating >= 4`<br>• `comment IS NOT NULL` & `comment != ''`<br>• Join lấy thông tin học viên mua khóa (`order.user: id, full_name, avatar_url`)<br>• Sắp xếp: `rating DESC`, `id DESC`<br>• Frontend tự động lọc trùng lặp nhận xét | 6 đánh giá |
| **9** | **Câu Hỏi Thường Gặp (FAQ)** | `HomeFaqSection.tsx` | `faqs` | `GET /api/home` | • `status = 'active'`<br>• `deleted_at IS NULL`<br>• Sắp xếp: `sort_order ASC`, `id DESC`<br>• Frontend hiển thị ban đầu 3 câu kèm nút toggle **Xem thêm câu hỏi** | 6 câu hỏi |
| **10** | **Giảng Viên Tiêu Biểu** | `TopInstructors.tsx` | `featured_instructors` | `GET /api/home` | • `role = 'instructor'`<br>• `status = 'active'` và không bị khóa<br>• Sắp xếp theo tổng số học viên đăng ký & đánh giá | 8 giảng viên |
| **11** | **Trang Chi Tiết Danh Mục** | `CategoryDetailPage.tsx` | `courses`, `category` | `GET /api/courses?category_slug={slug}` | • Lọc tất cả khóa học thuộc `category_slug`<br>• Sắp xếp: theo bộ lọc (`popular`, `latest`, `rating_desc`, `price_asc`, `price_desc`) | Động theo danh mục |
| **12** | **Trang Chi Tiết Khóa Học** | `CourseDetailPage.tsx` | `course` | `GET /api/courses/{slug}` | • Truy vấn chi tiết 1 khóa học bằng `slug` hoặc `id`<br>• Nạp mối quan hệ: `instructor`, `sections`, `lessons`, `reviews`, `faqs`, `outcomes`, `requirements` | 1 khóa học |

---

## 🔍 2. CHI TIẾT CẤU TRÚC PHẢN HỒI DỮ LIỆU (RESPONSE SCHEMA)

```json
{
  "success": true,
  "message": "Lấy dữ liệu thành công",
  "data": {
    "banners": [
      {
        "id": 1,
        "title": "Học Lập Trình Thực Chiến",
        "image_url": "https://...",
        "target_url": "/courses",
        "position": "home_hero",
        "sort_order": 1
      }
    ],
    "stats": {
      "total_courses": 7,
      "total_students": 12,
      "total_instructors": 5,
      "total_reviews": 18
    },
    "categories": [
      {
        "id": 1,
        "name": "Lập trình Web",
        "slug": "web-development",
        "description": "Xây dựng website chuyên nghiệp",
        "sort_order": 1,
        "courses_count": 5
      }
    ],
    "featured_courses": [
      {
        "id": 101,
        "title": "Laravel REST API từ cơ bản đến triển khai",
        "slug": "laravel-rest-api",
        "thumbnail_url": "https://...",
        "price": 499000,
        "sale_price": 299000,
        "level": "beginner",
        "average_rating": 4.8,
        "reviews_count": 120,
        "enrollments_count": 1200,
        "instructor": {
          "id": 12,
          "full_name": "Nguyễn Văn A"
        }
      }
    ],
    "latest_courses": [ ... ],
    "discounted_courses": [ ... ],
    "vouchers": [
      {
        "id": 1,
        "code": "WELCOME100",
        "name": "Giảm 100K cho học viên mới",
        "discount_type": "fixed",
        "discount_value": 100000
      }
    ],
    "testimonials": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Khóa học rất thực tế, ví dụ sát dự án.",
        "user_name": "Trịnh Khánh An",
        "user_role": "Học viên",
        "user_avatar": "https://..."
      }
    ],
    "faqs": [
      {
        "id": 1,
        "question": "Tôi có được học lại khóa đã mua không?",
        "answer": "Có. Bạn được truy cập trọn đời.",
        "sort_order": 1
      }
    ]
  }
}
```

---

## 🛠 3. CÁC FILE CODE ĐÃ NỐI VÀ XỬ LÝ

### Backend (`MindHub-Backend/BE`)
1. [CatalogController.php](file:///f:/Phatnt/laragon/www/MindHub-Backend/BE/app/Http/Controllers/CatalogController.php): Tiếp nhận request `GET /api/home`.
2. [CatalogService.php](file:///f:/Phatnt/laragon/www/MindHub-Backend/BE/app/Services/Catalog/CatalogService.php): Xử lý logic query, đếm stats, filter mã voucher, faqs và testimonials.
3. [CatalogCourseRepository.php](file:///f:/Phatnt/laragon/www/MindHub-Backend/BE/app/Repositories/Catalog/CatalogCourseRepository.php): Thêm query `discounted()`, `featured()`, `latest()` với giới hạn 5 bản ghi.
4. [HomeResource.php](file:///f:/Phatnt/laragon/www/MindHub-Backend/BE/app/Http/Resources/Catalog/HomeResource.php): Formatting dữ liệu chuẩn hóa RESTful JSON.

### Frontend (`MindHub-Frontend`)
1. [useHomepageData.ts](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/home/hooks/useHomepageData.ts): Gọi API `homeApi.getHomepageData()`, chuẩn hóa dữ liệu khóa học bằng `mapApiCourseToHomeCourseItem`.
2. [HomePage.tsx](file:///f:/Phatnt/Documents/MindHub-Frontend/src/features/home/HomePage.tsx): Truyền prop dữ liệu chuẩn cho tất cả các Section.
3. Các Component Section: `FeaturedCategoriesSection.tsx`, `FeaturedCoursesSection.tsx`, `NewCoursesSection.tsx`, `DiscountedCoursesSection.tsx`, `PromoVoucherSection.tsx`, `StudentTestimonialsSection.tsx`, `HomeFaqSection.tsx`, `StatsBarSection.tsx`.
