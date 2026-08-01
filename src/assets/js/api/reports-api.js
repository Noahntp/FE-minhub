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

export async function getRevenueReport(params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();
  const res = await apiFetchEnvelope(`/admin/reports/revenue?${query}`);
  if (res && res.data) {
    return {
      success: true,
      message: "Lấy báo cáo doanh thu thành công.",
      data: res.data,
      meta: res.meta
    };
  }
  return { success: false, message: "Lỗi kết nối", data: { summary: {}, items: [], all_periods: [] } };
}

export async function getTopCoursesReport(params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();
  const res = await apiFetchEnvelope(`/admin/reports/top-courses?${query}`);
  if (res && res.data) {
    return {
      success: true,
      message: "Lấy báo cáo khóa học nổi bật thành công.",
      data: res.data,
      meta: res.meta
    };
  }
  return { success: false, message: "Lỗi kết nối", data: { summary: {}, items: [] } };
}

export async function getTopInstructorsReport(params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();
  const res = await apiFetchEnvelope(`/admin/reports/instructors?${query}`);
  if (res && res.data) {
    return {
      success: true,
      message: "Lấy báo cáo giảng viên nổi bật thành công.",
      data: res.data,
      meta: res.meta
    };
  }
  return { success: false, message: "Lỗi kết nối", data: { summary: {}, items: [] } };
}
