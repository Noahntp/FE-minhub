import { getCourses as getRepoCourses, saveCourses as saveRepoCourses, populateCourse } from "../mocks/mock-repository.js";

// Cấu hình nguồn dữ liệu: true để dùng mock (localStorage), false để gọi API thật
const USE_MOCK = true;
const API_BASE_URL = "/api/admin/courses";

/**
 * Lấy toàn bộ danh sách từ localStorage (chỉ dùng nội bộ cho Mock)
 */
function getRawMockCourses() {
    return getRepoCourses().map(populateCourse);
}

/**
 * Lưu danh sách vào localStorage (chỉ dùng nội bộ cho Mock)
 */
function saveRawMockCourses(courses) {
    const raw = courses.map(c => {
        const { instructor, categories, ...rest } = c;
        return rest;
    });
    saveRepoCourses(raw);
}

/**
 * Lấy danh sách khóa học (hỗ trợ phân trang, lọc, sắp xếp)
 */
export async function getCourses(params = {}) {
    if (!USE_MOCK) {
        // Gọi API thật khi sẵn sàng
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}?${query}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    // --- Xử lý MOCK DATA ---
    // Giả lập độ trễ mạng 350ms
    await new Promise(resolve => setTimeout(resolve, 350));

    try {
        const rawCourses = getRawMockCourses();
        // Giả sử không có xóa mềm hoặc lọc bỏ các bản ghi đã xóa
        const activeCoursesList = [...rawCourses];

        // 1. Tính toán các chỉ số thống kê (Summary) trên TOÀN BỘ dữ liệu mock (trước khi lọc)
        // Các trạng thái: draft, pending_review, approved, rejected, published, hidden
        const summary = {
            total_courses: activeCoursesList.length,
            published_courses: activeCoursesList.filter(c => c.status === "published").length,
            pending_review_courses: activeCoursesList.filter(c => c.status === "pending_review").length,
            draft_courses: activeCoursesList.filter(c => c.status === "draft").length,
            hidden_courses: activeCoursesList.filter(c => c.status === "hidden").length,
            rejected_courses: activeCoursesList.filter(c => c.status === "rejected").length,
            
            // Các chỉ số phụ cho quick insight
            new_courses_30_days: activeCoursesList.filter(c => {
                // Giả lập khóa học mới trong 30 ngày gần nhất
                if (c.published_at) {
                    const diffTime = Math.abs(new Date() - new Date(c.published_at));
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 30;
                }
                return false;
            }).length,
            total_enrollments: activeCoursesList.reduce((sum, c) => sum + (c.enrollment_count || 0), 0),
            total_paid_orders: activeCoursesList.reduce((sum, c) => sum + (c.paid_order_count || 0), 0),
            total_gross_revenue: activeCoursesList.reduce((sum, c) => sum + (c.gross_revenue || 0), 0)
        };

        // Tính điểm đánh giá trung bình hệ thống (có trọng số theo review_count)
        let totalRatingPoints = 0;
        let totalReviews = 0;
        activeCoursesList.forEach(c => {
            if (c.average_rating && c.review_count) {
                totalRatingPoints += c.average_rating * c.review_count;
                totalReviews += c.review_count;
            }
        });
        summary.average_rating = totalReviews > 0 ? parseFloat((totalRatingPoints / totalReviews).toFixed(1)) : 0;

        // 2. Lọc dữ liệu theo tham số truy vấn
        let filtered = [...activeCoursesList];

        // Lọc theo search (title, slug, instructor name, instructor email)
        if (params.search) {
            const searchKeyword = params.search.toLowerCase().trim();
            filtered = filtered.filter(c => 
                (c.title && c.title.toLowerCase().includes(searchKeyword)) ||
                (c.slug && c.slug.toLowerCase().includes(searchKeyword)) ||
                (c.instructor && c.instructor.full_name && c.instructor.full_name.toLowerCase().includes(searchKeyword)) ||
                (c.instructor && c.instructor.email && c.instructor.email.toLowerCase().includes(searchKeyword))
            );
        }

        // Lọc theo trạng thái (status)
        if (params.status && params.status !== "" && params.status !== "all") {
            filtered = filtered.filter(c => c.status === params.status);
        }

        // Lọc theo giảng viên (instructor_id)
        if (params.instructor_id && params.instructor_id !== "") {
            filtered = filtered.filter(c => c.instructor && c.instructor.id === parseInt(params.instructor_id));
        }

        // Lọc theo danh mục (category_id)
        if (params.category_id && params.category_id !== "") {
            filtered = filtered.filter(c => c.categories && c.categories.some(cat => cat.id === parseInt(params.category_id)));
        }

        // Lọc theo trình độ (level)
        if (params.level && params.level !== "") {
            filtered = filtered.filter(c => c.level === params.level);
        }

        // Lọc theo nổi bật (is_featured)
        if (params.is_featured !== undefined && params.is_featured !== "" && params.is_featured !== "all") {
            const isFeaturedBool = params.is_featured === "true" || params.is_featured === true;
            filtered = filtered.filter(c => c.is_featured === isFeaturedBool);
        }

        // Lọc theo khoảng ngày tạo/cập nhật (date_from, date_to)
        // Spec ghi: Khoảng thời gian cập nhật.
        if (params.date_from) {
            const fromDate = new Date(params.date_from);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(c => new Date(c.updated_at) >= fromDate);
        }
        if (params.date_to) {
            const toDate = new Date(params.date_to);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(c => new Date(c.updated_at) <= toDate);
        }

        // 3. Sắp xếp dữ liệu (Sort)
        const sortBy = params.sort_by || "updated_at";
        const sortDir = params.sort_direction || "desc";

        filtered.sort((a, b) => {
            let comparison = 0;
            if (sortBy === "updated_at") {
                comparison = new Date(a.updated_at) - new Date(b.updated_at);
            } else if (sortBy === "created_at") {
                // Nếu không có created_at, ta fallback về updated_at
                const dateA = a.published_at ? new Date(a.published_at) : new Date(a.updated_at);
                const dateB = b.published_at ? new Date(b.published_at) : new Date(b.updated_at);
                comparison = dateA - dateB;
            } else if (sortBy === "title") {
                comparison = a.title.localeCompare(b.title, "vi");
            } else if (sortBy === "enrollment_count") {
                comparison = (a.enrollment_count || 0) - (b.enrollment_count || 0);
            } else if (sortBy === "gross_revenue") {
                comparison = (a.gross_revenue || 0) - (b.gross_revenue || 0);
            } else if (sortBy === "average_rating") {
                comparison = (a.average_rating || 0) - (b.average_rating || 0);
            } else if (sortBy === "price") {
                comparison = (a.price || 0) - (b.price || 0);
            }
            return sortDir === "desc" ? -comparison : comparison;
        });

        // 4. Phân trang (Pagination)
        const total = filtered.length;
        const perPage = parseInt(params.per_page) || 20;
        const currentPage = parseInt(params.page) || 1;
        const lastPage = Math.max(1, Math.ceil(total / perPage));
        
        const startIndex = (currentPage - 1) * perPage;
        const paginatedItems = filtered.slice(startIndex, startIndex + perPage);

        return {
            success: true,
            message: "Lấy dữ liệu thành công.",
            data: {
                summary: summary,
                items: paginatedItems
            },
            meta: {
                current_page: currentPage,
                last_page: lastPage,
                per_page: perPage,
                total: total
            }
        };
    } catch (error) {
        console.error("Lỗi Mock API getCourses:", error);
        return {
            success: false,
            message: "Lỗi hệ thống khi tải danh sách khóa học.",
            error_code: 500
        };
    }
}

/**
 * Lấy chi tiết một khóa học
 */
export async function getCourse(id) {
    const courseId = parseInt(id);
    if (!USE_MOCK) {
        const response = await fetch(`${API_BASE_URL}/${courseId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    const rawCourses = getRawMockCourses();
    const course = rawCourses.find(c => c.id === courseId);

    if (course) {
        return {
            success: true,
            message: "Lấy chi tiết khóa học thành công.",
            data: course
        };
    } else {
        return {
            success: false,
            message: "Không tìm thấy khóa học.",
            error_code: 404
        };
    }
}

/**
 * Cập nhật thông tin khóa học (chỉ hỗ trợ is_featured hoặc status ẩn/hiện)
 */
export async function updateCourse(id, payload) {
    const courseId = parseInt(id);
    if (!USE_MOCK) {
        const response = await fetch(`${API_BASE_URL}/${courseId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    const rawCourses = getRawMockCourses();
    const index = rawCourses.findIndex(c => c.id === courseId);

    if (index !== -1) {
        const course = rawCourses[index];

        // Validate payload chỉ được gửi các thuộc tính cho phép
        // is_featured? status?
        const allowedKeys = ["is_featured", "status"];
        const keys = Object.keys(payload);
        const isValid = keys.every(key => allowedKeys.includes(key));

        if (!isValid) {
            return {
                success: false,
                message: "Payload chứa các trường không được phép chỉnh sửa.",
                error_code: 422
            };
        }

        // Cập nhật is_featured
        if (payload.is_featured !== undefined) {
            course.is_featured = payload.is_featured === true || payload.is_featured === "true";
        }

        // Cập nhật status (chỉ cho phép published <-> hidden)
        if (payload.status !== undefined) {
            const targetStatus = payload.status;
            if (targetStatus === "hidden" && course.status === "published") {
                course.status = "hidden";
            } else if (targetStatus === "published" && course.status === "hidden") {
                course.status = "published";
                course.published_at = course.published_at || new Date().toISOString();
            } else {
                return {
                    success: false,
                    message: "Trạng thái chuyển đổi không hợp lệ.",
                    error_code: 409
                };
            }
        }

        course.updated_at = new Date().toISOString();
        rawCourses[index] = course;
        saveRawMockCourses(rawCourses);

        return {
            success: true,
            message: "Cập nhật khóa học thành công.",
            data: course
        };
    } else {
        return {
            success: false,
            message: "Không tìm thấy khóa học để cập nhật.",
            error_code: 404
        };
    }
}
