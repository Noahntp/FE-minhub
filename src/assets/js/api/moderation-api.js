import { apiFetchEnvelope } from "@/shared/lib/api-client";

export const USE_MOCK = false;

/**
 * GET /api/admin/moderation/items
 */
export async function getModerationItems(params = {}) {
  const urlParams = new URLSearchParams();
  if (params.page) urlParams.set("page", params.page);
  if (params.per_page) urlParams.set("per_page", params.per_page);
  if (params.search) urlParams.set("search", params.search);
  if (params.target_type) urlParams.set("target_type", params.target_type);
  if (params.status) urlParams.set("status", params.status);
  if (params.time_preset) urlParams.set("time_preset", params.time_preset);
  if (params.reply_status) urlParams.set("reply_status", params.reply_status);
  if (params.date_from) urlParams.set("date_from", params.date_from);
  if (params.date_to) urlParams.set("date_to", params.date_to);
  if (params.user_id) urlParams.set("user_id", params.user_id);
  if (params.course_id) urlParams.set("course_id", params.course_id);
  if (params.sort_by) urlParams.set("sort_by", params.sort_by);
  if (params.sort_direction) urlParams.set("sort_direction", params.sort_direction);

  const res = await apiFetchEnvelope(`/admin/moderation/items?${urlParams.toString()}`, {
    method: "GET"
  });

  if (res && res.data) {
    return {
      success: true,
      message: "Lấy danh sách thành công.",
      data: res.data,
      meta: res.meta
    };
  }

  return { success: false, message: "Lỗi kết nối", data: null };
}

/**
 * GET /api/admin/moderation/items/{targetType}/{id}
 */
export async function getModerationItemDetail(targetType, id) {
  const res = await apiFetchEnvelope(`/admin/moderation/items/${targetType}/${id}`, {
    method: "GET"
  });

  if (res && res.data) {
    return {
      success: true,
      message: "Lấy chi tiết thành công.",
      data: res.data
    };
  }

  return { success: false, message: "Lỗi kết nối", data: null };
}

/**
 * PATCH /api/admin/moderation/items/{id}
 */
export async function moderateItem(id, payload = {}) {
  const res = await apiFetchEnvelope(`/admin/moderation/items/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      target_type: payload.target_type,
      status: payload.status,
      reason: payload.reason || ""
    })
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
