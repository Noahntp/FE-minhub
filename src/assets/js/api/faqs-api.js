import { apiFetchEnvelope } from "@/shared/lib/api-client";

export const USE_MOCK = false;

/**
 * Lấy danh sách FAQ (phân trang, lọc theo type, status, scope, search, sort)
 * @param {Object} params - Query parameters
 */
export async function getFaqs(params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", params.page);
  if (params.per_page) query.set("per_page", params.per_page);
  if (params.search) query.set("search", params.search);
  if (params.type && params.type !== "all") query.set("type", params.type);
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.scope && params.scope !== "all") query.set("scope", params.scope);
  if (params.sort_by) query.set("sort_by", params.sort_by);
  if (params.sort_direction) query.set("sort_direction", params.sort_direction);

  const res = await apiFetchEnvelope(`/admin/faqs?${query.toString()}`, {
    method: "GET"
  });

  if (res && res.data) {
    return {
      success: true,
      message: "Lấy dữ liệu thành công.",
      data: res.data,
      meta: res.meta
    };
  }

  return { success: false, message: "Lỗi kết nối", data: null };
}

/**
 * Lấy chi tiết một FAQ theo ID
 * @param {number|string} id 
 */
export async function getFaqDetail(id) {
  const res = await apiFetchEnvelope(`/admin/faqs/${id}`, {
    method: "GET"
  });

  if (res && res.data) {
    return {
      success: true,
      message: "Thao tác thành công.",
      data: res.data
    };
  }

  return { success: false, message: "Lỗi kết nối", data: null };
}

/**
 * Tạo mới FAQ
 * @param {Object} payload 
 */
export async function createFaq(payload) {
  const res = await apiFetchEnvelope("/admin/faqs", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (res && res.data) {
    return {
      success: true,
      message: "Tạo FAQ mới thành công.",
      data: res.data
    };
  }

  return { success: false, message: "Lỗi kết nối", data: null };
}

/**
 * Cập nhật thông tin FAQ (PATCH)
 * @param {number|string} id 
 * @param {Object} payload 
 */
export async function updateFaq(id, payload) {
  const res = await apiFetchEnvelope(`/admin/faqs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });

  if (res && res.data) {
    return {
      success: true,
      message: "Cập nhật FAQ thành công.",
      data: res.data
    };
  }

  return { success: false, message: "Lỗi kết nối", data: null };
}

/**
 * Xóa mềm FAQ (DELETE /api/admin/faqs/{id})
 * @param {number|string} id 
 */
export async function deleteFaq(id) {
  const res = await apiFetchEnvelope(`/admin/faqs/${id}`, {
    method: "DELETE"
  });

  return {
    success: true,
    message: "Xóa FAQ thành công."
  };
}

/**
 * Đồng bộ liên kết khóa học (PATCH /api/admin/faqs/{id}/courses)
 * @param {number|string} id 
 * @param {Array<number>} courseIds - Danh sách integer course IDs
 */
export async function syncFaqCourses(id, courseIds = []) {
  const res = await apiFetchEnvelope(`/admin/faqs/${id}/courses`, {
    method: "PATCH",
    body: JSON.stringify({ course_ids: courseIds })
  });

  if (res && res.data) {
    return {
      success: true,
      message: "Cập nhật liên kết khóa học thành công.",
      data: res.data
    };
  }

  return { success: false, message: "Lỗi kết nối", data: null };
}

/**
 * Cập nhật thứ tự hiển thị hàng loạt
 * @param {Array<{id: number, sort_order: number}>} items
 */
export async function reorderFaqs(items = []) {
  try {
    const res = await apiFetchEnvelope(`/admin/faqs/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ items })
    });

    if (res && res.data && res.data.success) {
      return {
        success: true,
        message: res.data.message || "Lưu thứ tự thành công.",
      };
    }

    return { success: false, message: res?.data?.message || "Lỗi lưu dữ liệu", data: null };
  } catch (error) {
    return { success: false, message: error?.message || "Có lỗi xảy ra", data: null };
  }
}
