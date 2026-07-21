/**
 * API Layer cho Module ADM-05: Kiểm duyệt khóa học
 * Hoàn toàn đồng bộ với Unified Mock Database qua mock-repository.js.
 * Tuân thủ 100% API Contract của MindHub Backend.
 */

import {
  getCourses as getRepoCourses,
  updateCourse,
  getCourseById,
  populateCourse,
  getPopulatedCourseReview,
} from "../mocks/mock-repository.js";

export const USE_MOCK = true;
export const USE_MOCK_DATA = true;

// Helper to get submitted date for reviews
function getReviewSubmittedDate(item) {
  if (!item) return null;
  const value = item.submitted_at ?? item.created_at ?? item.updated_at ?? null;
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const strVal = String(value).trim().replace(" ", "T");
  const date = new Date(strVal);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Lấy danh sách khóa học cần kiểm duyệt
 * @param {Object} params - { page, per_page, search, sort }
 */
export async function getCourseReviews(params = {}) {
  // Giả lập delay mạng 250ms
  await new Promise((resolve) => setTimeout(resolve, 250));

  const page = parseInt(params.page) || 1;
  const per_page = parseInt(params.per_page) || 20;
  const search = (params.search || "").toLowerCase().trim();
  const sort = params.sort || "submitted_desc";
  const date_preset = params.date_preset || params.review_date_preset || "";
  const date_from = params.date_from || params.review_date_from || "";
  const date_to = params.date_to || params.review_date_to || "";

  // 1. Chỉ lấy các khóa học có status === "pending_review" và populate dữ liệu
  const allCourses = getRepoCourses().map(populateCourse);
  let items = allCourses.filter((c) => c.status === "pending_review");

  // 2. Lọc theo search
  if (search) {
    items = items.filter((item) => {
      const titleMatch = (item.title || "").toLowerCase().includes(search);
      const slugMatch = (item.slug || "").toLowerCase().includes(search);
      const instructorMatch = (item.instructor?.full_name || "")
        .toLowerCase()
        .includes(search);
      return titleMatch || slugMatch || instructorMatch;
    });
  }

  // 3. Lọc theo Khoảng thời gian gửi
  if (date_from || date_to || (date_preset && date_preset !== "all")) {
    let fromTimestamp = null;
    let toTimestamp = null;

    if (date_preset && date_preset !== "custom" && date_preset !== "all") {
      const now = new Date();
      // Đảm bảo mốc tham chiếu cho dữ liệu mock năm 2026 nếu trình duyệt client ở năm khác
      let anchorDate = now;
      if (now.getFullYear() < 2026) {
        anchorDate = new Date(2026, 6, 14, 23, 59, 59, 999);
      }
      const todayEnd = new Date(
        anchorDate.getFullYear(),
        anchorDate.getMonth(),
        anchorDate.getDate(),
        23,
        59,
        59,
        999,
      );
      toTimestamp = todayEnd.getTime();

      let daysToSubtract = 0;
      if (date_preset === "last_7_days") daysToSubtract = 6;
      else if (date_preset === "last_30_days") daysToSubtract = 29;
      else if (date_preset === "last_1_year") daysToSubtract = 365;

      const fromDate = new Date(
        anchorDate.getFullYear(),
        anchorDate.getMonth(),
        anchorDate.getDate() - daysToSubtract,
        0,
        0,
        0,
        0,
      );
      fromTimestamp = fromDate.getTime();
    } else {
      if (date_from) {
        const parts = date_from.split("-");
        if (parts.length === 3) {
          fromTimestamp = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
            0,
            0,
            0,
            0,
          ).getTime();
        }
      }
      if (date_to) {
        const parts = date_to.split("-");
        if (parts.length === 3) {
          toTimestamp = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
            23,
            59,
            59,
            999,
          ).getTime();
        }
      }
    }

    items = items.filter((item) => {
      const itemDate = getReviewSubmittedDate(item);
      if (!itemDate) return false;
      const itemTime = itemDate.getTime();
      if (fromTimestamp && itemTime < fromTimestamp) return false;
      if (toTimestamp && itemTime > toTimestamp) return false;
      return true;
    });
  }

  // 4. Sắp xếp
  items.sort((a, b) => {
    const dateA = getReviewSubmittedDate(a);
    const dateB = getReviewSubmittedDate(b);
    switch (sort) {
      case "submitted_asc":
      case "created_at_asc":
        return (dateA ? dateA.getTime() : 0) - (dateB ? dateB.getTime() : 0);
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "title_desc":
        return b.title.localeCompare(a.title);
      case "price_desc":
        return (b.sale_price || b.price) - (a.sale_price || a.price);
      case "price_asc":
        return (a.sale_price || a.price) - (b.sale_price || b.price);
      case "duration_desc":
        return (
          (b.total_duration_seconds || 0) - (a.total_duration_seconds || 0)
        );
      case "submitted_desc":
      case "created_at_desc":
      default:
        return (dateB ? dateB.getTime() : 0) - (dateA ? dateA.getTime() : 0);
    }
  });

  // Tính toán summary động
  const todayStr = "2026-07-14"; // Lấy mốc thời gian hệ thống giả lập
  const approvedToday = allCourses.filter(
    (c) =>
      c.status === "published" &&
      c.updated_at &&
      c.updated_at.startsWith(todayStr),
  ).length;
  const rejectedToday = allCourses.filter(
    (c) =>
      c.status === "rejected" &&
      c.updated_at &&
      c.updated_at.startsWith(todayStr),
  ).length;

  const total = items.length;
  const last_page = Math.ceil(total / per_page) || 1;
  const start = (page - 1) * per_page;
  const paginatedItems = items.slice(start, start + per_page);

  return {
    success: true,
    message: "Lấy danh sách khóa học kiểm duyệt thành công (Mock).",
    data: {
      summary: {
        pending_count: items.length,
        approved_today: approvedToday,
        rejected_today: rejectedToday,
      },
      items: paginatedItems,
    },
    meta: {
      current_page: page,
      last_page: last_page,
      per_page: per_page,
      total: total,
    },
  };
}

/**
 * Lấy chi tiết một khóa học (kèm sections, lessons và checklist)
 * @param {number|string} id 
 */
export async function getCourseReview(id) {
  // Giả lập delay mạng 200ms
  await new Promise((resolve) => setTimeout(resolve, 200));

  const populated = getPopulatedCourseReview(id);
  if (!populated) {
    throw {
      status: 404,
      data: {
        success: false,
        message: "Không tìm thấy khóa học kiểm duyệt có ID " + id,
        errors: { id: ["Khóa học không tồn tại trong danh sách chờ."] },
      },
    };
  }

  return {
    success: true,
    message: "Lấy chi tiết khóa học thành công (Mock).",
    data: populated,
  };
}

/**
 * Duyệt chấp thuận khóa học
 * Endpoint: PATCH /api/admin/courses/{id}/approve
 * @param {number|string} id 
 */
export async function approveCourse(id) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const course = getCourseById(id);
  if (!course) {
    throw {
      status: 404,
      data: {
        success: false,
        message: "Khóa học không tồn tại.",
      },
    };
  }

  if (course.status !== "pending_review") {
    throw {
      status: 409,
      data: {
        success: false,
        message: "Khóa học này đã được xử lý trước đó.",
      },
    };
  }

  // Cập nhật trạng thái khóa học
  const now = new Date().toISOString();
  updateCourse(id, {
    status: "published",
    published_at: now,
    updated_at: now,
  });

  return {
    success: true,
    message: `Khóa học "${course.title}" đã được chấp thuận thành công.`,
    data: populateCourse(getCourseById(id)),
  };
}

/**
 * Từ chối duyệt khóa học
 * Endpoint: PATCH /api/admin/courses/{id}/reject
 * @param {number|string} id 
 * @param {Object} payload - { admin_reject_reason }
 */
export async function rejectCourse(id, payload = {}) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const course = getCourseById(id);
  if (!course) {
    throw {
      status: 404,
      data: {
        success: false,
        message: "Khóa học không tồn tại.",
      },
    };
  }

  if (course.status !== "pending_review") {
    throw {
      status: 409,
      data: {
        success: false,
        message: "Khóa học này đã được xử lý trước đó.",
      },
    };
  }

  const reason = (payload.admin_reject_reason || "").trim();
  if (!reason) {
    throw {
      status: 422,
      data: {
        success: false,
        message: "Vui lòng nhập lý do từ chối.",
        errors: {
          admin_reject_reason: ["Lý do từ chối không được để trống."],
        },
      },
    };
  }

  if (reason.length > 1000) {
    throw {
      status: 422,
      data: {
        success: false,
        message: "Lý do từ chối không được vượt quá 1000 ký tự.",
        errors: {
          admin_reject_reason: [
            "Lý do từ chối không được vượt quá 1000 ký tự.",
          ],
        },
      },
    };
  }

  const now = new Date().toISOString();
  updateCourse(id, {
    status: "rejected",
    admin_reject_reason: reason,
    updated_at: now,
  });

  return {
    success: true,
    message: `Đã từ chối duyệt khóa học "${course.title}".`,
    data: populateCourse(getCourseById(id)),
  };
}
