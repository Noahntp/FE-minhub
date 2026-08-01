import { getCourses as getRepoCourses, saveCourses as saveRepoCourses, populateCourse } from "@/assets/js/mocks/mock-repository.js";
import { config } from "@/shared/lib/api-client";

// Hàm adapter ánh xạ an toàn dữ liệu từ backend sang format mock dùng trong component
function adaptCourse(item) {
    if (!item) return null;

    // 1. Ánh xạ Giảng viên (instructor)
    let instructor = null;
    if (item.instructor) {
        instructor = {
            id: item.instructor.id || 0,
            full_name: item.instructor.full_name || item.instructor.name || item.instructor_name || "Chưa rõ",
            email: item.instructor.email || "",
            status: item.instructor.status || "active",
        };
    } else if (item.instructor_name) {
        instructor = {
            id: 0,
            full_name: item.instructor_name,
            email: "",
            status: "active",
        };
    }

    // 2. Ánh xạ Danh mục (categories)
    let categories = [];
    if (Array.isArray(item.categories)) {
        categories = item.categories.map(c => ({
            id: c.id || 0,
            name: c.name || c.category_name || "",
            slug: c.slug || ""
        }));
    } else if (item.category_name) {
        categories = [{
            id: 0,
            name: item.category_name,
            slug: ""
        }];
    } else if (item.category) {
        categories = [{
            id: item.category.id || 0,
            name: item.category.name || item.category.category_name || "",
            slug: item.category.slug || ""
        }];
    }

    // 3. Ép kiểu an toàn cho các trường chỉ số và số tiền (tránh null/undefined/NaN)
    const enrollment_count = Number(item.enrollments_count ?? item.students_count ?? item.enrollment_count ?? 0) || 0;
    const paid_order_count = Number(item.paid_orders_count ?? item.paid_order_count ?? 0) || 0;
    const gross_revenue = Number(item.gross_revenue ?? item.revenue ?? 0) || 0;
    const average_rating = Number(item.average_rating ?? item.rating_average ?? 0) || 0;
    const review_count = Number(item.reviews_count ?? item.ratings_count ?? item.review_count ?? 0) || 0;
    const comment_count = Number(item.comments_count ?? item.comment_count ?? 0) || 0;

    // 4. Trả về đúng schema mock
    return {
        id: item.id || 0,
        title: item.title || "Khóa học không tên",
        slug: item.slug || "",
        thumbnail_url: item.thumbnail_url || item.image || "",
        description: item.description || "",
        short_description: item.short_description || item.subtitle || "Không có mô tả ngắn.",
        level: item.level || "all_levels",
        language: item.language || "Tiếng Việt",
        price: Number(item.price) || 0,
        sale_price: item.sale_price !== null && item.sale_price !== undefined ? Number(item.sale_price) : null,
        is_featured: item.is_featured === true || item.is_featured === 1 || item.is_featured === "true",
        status: item.status || "draft",
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        published_at: item.published_at || null,
        enrollment_count,
        paid_order_count,
        gross_revenue,
        average_rating,
        review_count,
        comment_count,
        instructor,
        categories,
        requirements: Array.isArray(item.requirements) ? item.requirements : [],
        outcomes: Array.isArray(item.outcomes) ? item.outcomes : (Array.isArray(item.will_learn) ? item.will_learn : (Array.isArray(item.willLearn) ? item.willLearn : [])),
        summary: item.summary ? {
            section_count: Number(item.summary.section_count || 0),
            lesson_count: Number(item.summary.lesson_count || 0),
            asset_count: Number(item.summary.asset_count || 0),
            comment_count: comment_count
        } : {
            section_count: Number(item.section_count || 0),
            lesson_count: Number(item.lesson_count || 0),
            asset_count: Number(item.asset_count || 0),
            comment_count: comment_count
        }
    };
}

// Giải bọc các kiểu đóng gói dữ liệu của backend: data, data.data, data.items
function unwrapResponse(json) {
    if (!json) return { items: [], summary: {}, meta: {} };

    let items = [];
    let summary = null;
    let meta = null;

    if (json.data && Array.isArray(json.data.items)) {
        items = json.data.items;
        summary = json.data.summary;
        meta = json.meta || json.data.meta;
    } else if (json.data && Array.isArray(json.data.data)) {
        items = json.data.data;
        summary = json.data.summary;
        meta = json.data.meta || json.meta;
    } else if (Array.isArray(json.data)) {
        items = json.data;
        summary = json.summary;
        meta = json.meta;
    } else if (json.items && Array.isArray(json.items)) {
        items = json.items;
        summary = json.summary;
        meta = json.meta;
    } else {
        items = json.items || json.data || [];
        if (!Array.isArray(items)) {
            items = [];
        }
        summary = json.summary;
        meta = json.meta;
    }

    // Adapt items
    const adaptedItems = items.map(adaptCourse);

    // Xây dựng KPI Summary từ danh sách nếu backend không trả về summary
    if (!summary) {
        summary = {
            total_courses: adaptedItems.length,
            published_courses: adaptedItems.filter(c => c.status === "published").length,
            pending_review_courses: adaptedItems.filter(c => c.status === "pending_review").length,
            draft_courses: adaptedItems.filter(c => c.status === "draft").length,
            hidden_courses: adaptedItems.filter(c => c.status === "hidden").length,
            rejected_courses: adaptedItems.filter(c => c.status === "rejected").length,
            
            new_courses_30_days: adaptedItems.filter(c => {
                if (c.published_at) {
                    const diffTime = Math.abs(new Date().getTime() - new Date(c.published_at).getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 30;
                }
                return false;
            }).length,
            total_enrollments: adaptedItems.reduce((sum, c) => sum + (c.enrollment_count || 0), 0),
            total_paid_orders: adaptedItems.reduce((sum, c) => sum + (c.paid_order_count || 0), 0),
            total_gross_revenue: adaptedItems.reduce((sum, c) => sum + (c.gross_revenue || 0), 0)
        };

        let totalRatingPoints = 0;
        let totalReviews = 0;
        adaptedItems.forEach(c => {
            if (c.average_rating && c.review_count) {
                totalRatingPoints += c.average_rating * c.review_count;
                totalReviews += c.review_count;
            }
        });
        summary.average_rating = totalReviews > 0 ? parseFloat((totalRatingPoints / totalReviews).toFixed(1)) : 0;
    }

    return {
        items: adaptedItems,
        summary: summary,
        meta: meta || {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: adaptedItems.length
        }
    };
}

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
    const apiConfig = config;

    if (apiConfig.mode === "api") {
        try {
            const query = new URLSearchParams(params).toString();
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
            };
            if (apiConfig.authToken) {
                headers["Authorization"] = `Bearer ${apiConfig.authToken}`;
            }

            const response = await fetch(`${apiConfig.baseUrl}/admin/courses?${query}`, {
                headers,
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const json = await response.json();
            const unwrapped = unwrapResponse(json);

            return {
                success: true,
                message: "Lấy dữ liệu từ API thành công.",
                data: {
                    summary: unwrapped.summary,
                    items: unwrapped.items
                },
                meta: unwrapped.meta
            };
        } catch (error) {
            console.error("Lỗi API getCourses, chuyển sang Mock fallback:", error);
            // Fallback về Mock khi gọi API lỗi hoặc server chưa sẵn sàng
        }
    }

    // --- Xử lý MOCK DATA ---
    // Giả lập độ trễ mạng 350ms
    await new Promise(resolve => setTimeout(resolve, 350));

    try {
        const rawCourses = getRawMockCourses();
        const activeCoursesList = [...rawCourses];

        // 1. Tính toán các chỉ số thống kê (Summary) trên TOÀN BỘ dữ liệu mock (trước khi lọc)
        const summary = {
            total_courses: activeCoursesList.length,
            published_courses: activeCoursesList.filter(c => c.status === "published").length,
            pending_review_courses: activeCoursesList.filter(c => c.status === "pending_review").length,
            draft_courses: activeCoursesList.filter(c => c.status === "draft").length,
            hidden_courses: activeCoursesList.filter(c => c.status === "hidden").length,
            rejected_courses: activeCoursesList.filter(c => c.status === "rejected").length,
            
            new_courses_30_days: activeCoursesList.filter(c => {
                if (c.published_at) {
                    const diffTime = Math.abs(new Date().getTime() - new Date(c.published_at).getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 30;
                }
                return false;
            }).length,
            total_enrollments: activeCoursesList.reduce((sum, c) => sum + (c.enrollment_count || 0), 0),
            total_paid_orders: activeCoursesList.reduce((sum, c) => sum + (c.paid_order_count || 0), 0),
            total_gross_revenue: activeCoursesList.reduce((sum, c) => sum + (c.gross_revenue || 0), 0)
        };

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

        if (params.search) {
            const searchKeyword = params.search.toLowerCase().trim();
            filtered = filtered.filter(c => 
                (c.title && c.title.toLowerCase().includes(searchKeyword)) ||
                (c.slug && c.slug.toLowerCase().includes(searchKeyword)) ||
                (c.instructor && c.instructor.full_name && c.instructor.full_name.toLowerCase().includes(searchKeyword)) ||
                (c.instructor && c.instructor.email && c.instructor.email.toLowerCase().includes(searchKeyword))
            );
        }

        if (params.status && params.status !== "" && params.status !== "all") {
            filtered = filtered.filter(c => c.status === params.status);
        }

        if (params.instructor_id && params.instructor_id !== "") {
            filtered = filtered.filter(c => c.instructor && c.instructor.id === parseInt(params.instructor_id));
        }

        if (params.category_id && params.category_id !== "") {
            filtered = filtered.filter(c => c.categories && c.categories.some(cat => cat.id === parseInt(params.category_id)));
        }

        if (params.level && params.level !== "") {
            filtered = filtered.filter(c => c.level === params.level);
        }

        if (params.is_featured !== undefined && params.is_featured !== "" && params.is_featured !== "all") {
            const isFeaturedBool = params.is_featured === "true" || params.is_featured === true;
            filtered = filtered.filter(c => c.is_featured === isFeaturedBool);
        }

        if (params.price_type && params.price_type !== "") {
            if (params.price_type === "free") {
                filtered = filtered.filter(c => (c.price || 0) === 0);
            } else if (params.price_type === "paid") {
                filtered = filtered.filter(c => (c.price || 0) > 0);
            }
        }

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
                comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
            } else if (sortBy === "created_at") {
                const dateA = a.published_at ? new Date(a.published_at).getTime() : new Date(a.updated_at).getTime();
                const dateB = b.published_at ? new Date(b.published_at).getTime() : new Date(b.updated_at).getTime();
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
            } else if (sortBy === "instructor_name") {
                const nameA = a.instructor?.full_name || "";
                const nameB = b.instructor?.full_name || "";
                comparison = nameA.localeCompare(nameB, "vi");
            } else if (sortBy === "category_name") {
                const catA = a.categories?.[0]?.name || "";
                const catB = b.categories?.[0]?.name || "";
                comparison = catA.localeCompare(catB, "vi");
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
            message: "Lấy dữ liệu mock thành công.",
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
    const apiConfig = ApiService.getConfig();

    if (apiConfig.mode === "api") {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
            };
            if (apiConfig.authToken) {
                headers["Authorization"] = `Bearer ${apiConfig.authToken}`;
            }

            const response = await fetch(`${apiConfig.baseUrl}/admin/courses/${courseId}`, {
                headers,
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const json = await response.json();
            const adapted = adaptCourse(json.data || json);

            return {
                success: true,
                message: "Lấy chi tiết khóa học từ API thành công.",
                data: adapted
            };
        } catch (error) {
            console.error("Lỗi API getCourse, chuyển sang Mock fallback:", error);
        }
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
    const apiConfig = ApiService.getConfig();

    if (apiConfig.mode === "api") {
        try {
            const headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
            };
            if (apiConfig.authToken) {
                headers["Authorization"] = `Bearer ${apiConfig.authToken}`;
            }

            const response = await fetch(`${apiConfig.baseUrl}/admin/courses/${courseId}`, {
                method: "PATCH",
                headers,
                credentials: "include",
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const json = await response.json();
            const adapted = adaptCourse(json.data || json);

            return {
                success: true,
                message: "Cập nhật khóa học trên API thành công.",
                data: adapted
            };
        } catch (error) {
            console.error("Lỗi API updateCourse, chuyển sang Mock fallback:", error);
        }
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    const rawCourses = getRawMockCourses();
    const index = rawCourses.findIndex(c => c.id === courseId);

    if (index !== -1) {
        const course = rawCourses[index];

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

        if (payload.is_featured !== undefined) {
            course.is_featured = payload.is_featured === true || payload.is_featured === "true";
        }

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
