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

export async function getRevenues(params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();
  const res = await apiFetchEnvelope(`/admin/revenues?${query}`);
  if (res && res.data) {
    return {
      success: true,
      message: "Lấy dữ liệu thành công.",
      data: res.data,
      meta: res.meta
    };
  }
  return { success: false, message: "Lỗi kết nối", data: { summary: {}, items: [] } };
}

export async function getRevenueReport(params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();
  const res = await apiFetchEnvelope(`/admin/reports/revenue?${query}`);
  if (res && res.data) {
    return {
      success: true,
      message: "Lấy dữ liệu thành công.",
      data: res.data,
      meta: res.meta
    };
  }
  return { success: false, message: "Lỗi kết nối", data: { items: [] } };
}

export async function getRevenueById(id) {
  const res = await apiFetchEnvelope(`/admin/revenues/${id}`);
  if (res && res.data) {
    return {
      success: true,
      message: "Lấy dữ liệu thành công.",
      data: res.data
    };
  }
  return { success: false, message: "Lỗi kết nối", data: null };
}
