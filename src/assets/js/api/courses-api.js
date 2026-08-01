import { apiFetchEnvelope } from "@/shared/lib/api-client";

function getThumbnailUrl(url, title = "") {
    const rawUrl = url || "";
    if (rawUrl.includes("demo/courses") || rawUrl.trim() === "") {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes("laravel") || lowerTitle.includes("php")) {
            return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80";
        }
        if (lowerTitle.includes("react") || lowerTitle.includes("frontend")) {
            return "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&auto=format&fit=crop&q=80";
        }
        if (lowerTitle.includes("node")) {
            return "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&auto=format&fit=crop&q=80";
        }
        if (lowerTitle.includes("ui/ux") || lowerTitle.includes("design") || lowerTitle.includes("thiết kế")) {
            return "https://images.unsplash.com/photo-1561070791-26c113006238?w=400&auto=format&fit=crop&q=80";
        }
        if (lowerTitle.includes("git") || lowerTitle.includes("github")) {
            return "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=400&auto=format&fit=crop&q=80";
        }
        if (lowerTitle.includes("ai") || lowerTitle.includes("intelligence") || lowerTitle.includes("trí tuệ nhân tạo")) {
            return "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=400&auto=format&fit=crop&q=80";
        }
        return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80";
    }
    return rawUrl;
}

// Hàm adapter ánh xạ an toàn dữ liệu từ backend sang format dùng trong component
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

    const enrollment_count = Number(item.enrollments_count ?? item.students_count ?? item.enrollment_count ?? 0) || 0;
    const paid_order_count = Number(item.paid_orders_count ?? item.paid_order_count ?? 0) || 0;
    const gross_revenue = Number(item.gross_revenue ?? item.revenue ?? 0) || 0;
    const average_rating = Number(item.average_rating ?? item.rating_average ?? 0) || 0;
    const review_count = Number(item.reviews_count ?? item.ratings_count ?? item.review_count ?? 0) || 0;
    const comment_count = Number(item.comments_count ?? item.comment_count ?? 0) || 0;

    const courseTitle = item.title || "Khóa học không tên";

    return {
        id: item.id || 0,
        title: courseTitle,
        slug: item.slug || "",
        thumbnail_url: getThumbnailUrl(item.thumbnail_url || item.image || "", courseTitle),
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
 * Lấy danh sách khóa học (hỗ trợ phân trang, lọc, sắp xếp)
 */
export async function getCourses(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, String(params[key]));
        }
    });
    const queryStr = queryParams.toString();
    const url = queryStr ? `/admin/courses?${queryStr}` : '/admin/courses';

    try {
        const envelope = await apiFetchEnvelope(url);
        const unwrapped = unwrapResponse(envelope);

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
        console.error("Lỗi API getCourses:", error);
        return {
            success: false,
            message: error.message || "Lỗi hệ thống khi tải danh sách khóa học.",
            error_code: error.status || 500
        };
    }
}

/**
 * Lấy chi tiết một khóa học
 */
export async function getCourse(id) {
    const courseId = parseInt(id);
    try {
        const envelope = await apiFetchEnvelope(`/admin/courses/${courseId}`);
        const adapted = adaptCourse(envelope.data || envelope);

        return {
            success: true,
            message: "Lấy chi tiết khóa học từ API thành công.",
            data: adapted
        };
    } catch (error) {
        console.error("Lỗi API getCourse:", error);
        return {
            success: false,
            message: error.message || "Không tìm thấy khóa học.",
            error_code: error.status || 500
        };
    }
}

/**
 * Cập nhật thông tin khóa học (chỉ hỗ trợ is_featured hoặc status ẩn/hiện)
 */
export async function updateCourse(id, payload) {
    const courseId = parseInt(id);
    try {
        const envelope = await apiFetchEnvelope(`/admin/courses/${courseId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const adapted = adaptCourse(envelope.data || envelope);

        return {
            success: true,
            message: "Cập nhật khóa học trên API thành công.",
            data: adapted
        };
    } catch (error) {
        console.error("Lỗi API updateCourse:", error);
        return {
            success: false,
            message: error.message || "Cập nhật khóa học thất bại.",
            error_code: error.status || 500
        };
    }
}
