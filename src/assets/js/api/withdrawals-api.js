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

export async function fetchWithdrawals(params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();
  const res = await apiFetchEnvelope(`/admin/withdrawals?${query}`);
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

export async function fetchWithdrawalById(id) {
  const res = await apiFetchEnvelope(`/admin/withdrawals/${id}`);
  if (res && res.data) {
    return {
      success: true,
      message: "Lấy chi tiết thành công.",
      data: res.data
    };
  }
  return { success: false, message: "Lỗi kết nối", data: null };
}

export async function approveWithdrawalApi(id) {
  const res = await apiFetchEnvelope(`/admin/withdrawals/${id}/approve`, {
    method: 'PATCH'
  });
  if (res && res.data) {
    return {
      success: true,
      message: "Duyệt yêu cầu rút tiền thành công.",
      data: res.data
    };
  }
  return { success: false, message: "Lỗi kết nối", data: null };
}

export async function rejectWithdrawalApi(id, rejectedReason) {
  const res = await apiFetchEnvelope(`/admin/withdrawals/${id}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason: rejectedReason })
  });
  if (res && res.data) {
    return {
      success: true,
      message: "Đã từ chối yêu cầu rút tiền.",
      data: res.data
    };
  }
  return { success: false, message: "Lỗi kết nối", data: null };
}

export async function markPaidWithdrawalApi(id, providerPayoutId) {
  const res = await apiFetchEnvelope(`/admin/withdrawals/${id}/mark-paid`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ provider_payout_id: providerPayoutId })
  });
  if (res && res.data) {
    return {
      success: true,
      message: "Đã đánh dấu hoàn tất thanh toán.",
      data: res.data
    };
  }
  return { success: false, message: "Lỗi kết nối", data: null };
}
