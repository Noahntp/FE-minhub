/**
 * API Layer cho Module ADM-05: Kiểm duyệt khóa học
 * Kết nối trực tiếp với Laravel Backend API.
 */

import { apiFetchEnvelope } from "@/shared/lib/api-client";

export const USE_MOCK = false;
export const USE_MOCK_DATA = false;

// Adapter ánh xạ an toàn dữ liệu từ backend sang format dùng trong component
function adaptCourse(item) {
  if (!item) return null;
  return {
    ...item,
    price: parseFloat(item.price) || 0,
    sale_price: item.sale_price ? parseFloat(item.sale_price) : null,
    thumbnail_url: getThumbnailUrl(item.thumbnail_url, item.title),
    instructor: item.instructor ? {
      id: item.instructor.id,
      full_name: item.instructor.full_name || item.instructor.name || "Chưa rõ",
      email: item.instructor.email || "",
      status: item.instructor.status || "active",
      avatar_url: item.instructor.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    } : null
  };
}

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

/**
 * Lấy danh sách khóa học cần kiểm duyệt
 * @param {Object} params - { page, per_page, search, sort, category_id, date_from, date_to }
 */
export async function getCourseReviews(params = {}) {
  const query = {};
  if (params.page) query.page = params.page;
  if (params.per_page) query.per_page = params.per_page;
  if (params.search) query.search = params.search;
  if (params.category_id) query.category_id = params.category_id;
  if (params.status && params.status !== 'all') query.status = params.status;
  if (params.reviewed_date) query.reviewed_date = params.reviewed_date;
  if (params.date_from) query.date_from = params.date_from;
  if (params.date_to) query.date_to = params.date_to;

  // Ánh xạ kiểu sắp xếp phù hợp backend
  if (params.sort) {
    if (params.sort === "submitted_desc") query.sort = "newest";
    else if (params.sort === "submitted_asc") query.sort = "oldest";
    else if (params.sort === "title_asc") query.sort = "title_asc";
    else if (params.sort === "title_desc") query.sort = "title_desc";
  }

  const res = await apiFetchEnvelope("/admin/course-reviews", {
    method: "GET",
    query
  });

  if (res && res.data) {
    const adaptedItems = (res.data.items || []).map((item) => {
      const adapted = adaptCourse(item);
      adapted.category_name = item.category_name;
      return adapted;
    });

    return {
      success: true,
      message: "Lấy danh sách khóa học kiểm duyệt thành công.",
      data: {
        summary: res.data.summary || { pending_count: 0, approved_today: 0, rejected_today: 0 },
        items: adaptedItems,
      },
      meta: res.meta
    };
  }

  return { success: false, message: "Lỗi kết nối", data: null };
}

/**
 * Lấy chi tiết một khóa học (kèm sections, lessons và checklist)
 * @param {number|string} id 
 */
export async function getCourseReview(id) {
  const res = await apiFetchEnvelope(`/admin/courses/${id}`, {
    method: "GET"
  });

  if (res && res.data) {
    const courseData = res.data;
    const adapted = adaptCourse(courseData);
    return {
      success: true,
      message: "Lấy chi tiết khóa học thành công.",
      data: {
        course: adapted,
        sections: courseData.sections || [],
        lessons: courseData.lessons || [],
        checklist: courseData.checklist || { passed: true, summary: "Đạt checklist" }
      }
    };
  }

  return { success: false, message: "Lỗi kết nối", data: null };
}

/**
 * Duyệt chấp thuận khóa học
 * Endpoint: PATCH /api/admin/courses/{id}/approve
 * @param {number|string} id 
 */
export async function approveCourse(id) {
  const res = await apiFetchEnvelope(`/admin/courses/${id}/approve`, {
    method: "PATCH"
  });

  if (res && res.data) {
    return {
      success: true,
      message: "Khóa học đã được duyệt chấp thuận thành công.",
      data: adaptCourse(res.data)
    };
  }

  return { success: false, message: "Lỗi kết nối", data: null };
}

/**
 * Từ chối duyệt khóa học
 * Endpoint: PATCH /api/admin/courses/{id}/reject
 * @param {number|string} id 
 * @param {Object} payload - { admin_reject_reason }
 */
export async function rejectCourse(id, payload = {}) {
  const res = await apiFetchEnvelope(`/admin/courses/${id}/reject`, {
    method: "PATCH",
    body: {
      reason: payload.admin_reject_reason
    }
  });

  if (res && res.data) {
    return {
      success: true,
      message: "Khóa học đã bị từ chối duyệt.",
      data: adaptCourse(res.data)
    };
  }

  return { success: false, message: "Lỗi kết nối", data: null };
}
