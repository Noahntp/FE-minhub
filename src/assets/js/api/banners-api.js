import { apiFetchEnvelope } from "@/shared/lib/api-client";

function cleanParams(params) {
  const cleaned = {};
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleaned[key] = params[key];
    }
  }
  return cleaned;
}

export async function fetchBanners(params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();
  const res = await apiFetchEnvelope(`/admin/banners?${query}`);
  if (res && res.data) {
    return {
      success: true,
      message: "Lấy dữ liệu thành công.",
      data: res.data,
      meta: res.meta
    };
  }
  return {
    success: false,
    message: "Lỗi kết nối",
    data: { summary: {}, items: [] },
    meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 }
  };
}

export async function fetchBannerById(id) {
  const res = await apiFetchEnvelope(`/admin/banners/${id}`);
  if (res && res.data) {
    return {
      success: true,
      message: "Lấy chi tiết thành công.",
      data: res.data
    };
  }
  return { success: false, message: "Lỗi kết nối", data: null };
}

export async function createBanner(payload) {
  const res = await apiFetchEnvelope(`/admin/banners`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (res && res.data) {
    return {
      success: true,
      message: "Tạo banner thành công.",
      data: res.data
    };
  }
  return { success: false, message: res?.message || "Lỗi kết nối", data: null };
}

export async function updateBanner(id, payload) {
  const res = await apiFetchEnvelope(`/admin/banners/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (res && res.data) {
    return {
      success: true,
      message: "Cập nhật banner thành công.",
      data: res.data
    };
  }
  return { success: false, message: res?.message || "Lỗi kết nối", data: null };
}

export async function deleteBanner(id) {
  const res = await apiFetchEnvelope(`/admin/banners/${id}`, {
    method: 'DELETE'
  });
  if (res) {
    return {
      success: true,
      message: "Xóa banner thành công."
    };
  }
  return { success: false, message: "Lỗi kết nối" };
}
