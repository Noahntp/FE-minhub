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

export async function fetchPayoutAccounts(params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();
  const res = await apiFetchEnvelope(`/admin/payout-accounts?${query}`);
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

export async function fetchPayoutAccountById(id) {
  const res = await apiFetchEnvelope(`/admin/payout-accounts/${id}`);
  if (res && res.data) {
    return {
      success: true,
      message: "Lấy chi tiết thành công.",
      data: res.data
    };
  }
  return { success: false, message: "Lỗi kết nối", data: null };
}

export async function approvePayoutAccountApi(id) {
  const res = await apiFetchEnvelope(`/admin/payout-accounts/${id}/approve`, {
    method: 'PATCH'
  });
  if (res && res.data) {
    return {
      success: true,
      message: "Duyệt tài khoản nhận tiền thành công.",
      data: res.data
    };
  }
  return { success: false, message: "Lỗi kết nối", data: null };
}

export async function rejectPayoutAccountApi(id, rejectedReason = null) {
  const payload = {};
  if (rejectedReason) {
    payload.reason = rejectedReason;
  }
  const res = await apiFetchEnvelope(`/admin/payout-accounts/${id}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (res && res.data) {
    return {
      success: true,
      message: "Từ chối tài khoản nhận tiền thành công.",
      data: res.data
    };
  }
  return { success: false, message: "Lỗi kết nối", data: null };
}

export async function disablePayoutAccountApi(id) {
  const res = await apiFetchEnvelope(`/admin/payout-accounts/${id}/disable`, {
    method: 'PATCH'
  });
  if (res && res.data) {
    return {
      success: true,
      message: "Vô hiệu hóa tài khoản nhận tiền thành công.",
      data: res.data
    };
  }
  return { success: false, message: "Lỗi kết nối", data: null };
}
