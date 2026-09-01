import { apiFetchEnvelope } from "@/shared/lib/api-client";

// Cấu hình nguồn dữ liệu: true để dùng mock (localStorage), false để gọi API thật
const USE_MOCK_DATA = false;
const API_BASE_URL = "/admin/instructor-upgrade-requests";

/**
 * Lấy danh sách yêu cầu nâng cấp (hỗ trợ phân trang, lọc, sắp xếp)
 */
export async function getUpgradeRequests(params = {}) {
    if (!USE_MOCK_DATA) {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                queryParams.append(key, String(params[key]));
            }
        });
        const queryStr = queryParams.toString();
        const url = queryStr ? `${API_BASE_URL}?${queryStr}` : API_BASE_URL;
        
        try {
            const envelope = await apiFetchEnvelope(url);
            return {
                success: true,
                message: "Lấy dữ liệu thành công.",
                data: envelope.data, // Chứa { summary, items }
                meta: envelope.meta
            };
        } catch (error) {
            console.error("Lỗi khi tải danh sách yêu cầu nâng cấp:", error);
            return {
                success: false,
                message: error.message || "Lỗi hệ thống khi tải danh sách yêu cầu.",
                error_code: error.status || 500
            };
        }
    }
}

/**
 * Lấy chi tiết yêu cầu nâng cấp
 */
export async function getUpgradeRequest(userId) {
    const uId = parseInt(userId);
    if (!USE_MOCK_DATA) {
        try {
            const envelope = await apiFetchEnvelope(`${API_BASE_URL}/${uId}`);
            return {
                success: true,
                message: "Lấy chi tiết thành công.",
                data: envelope.data
            };
        } catch (error) {
            console.error("Lỗi khi tải chi tiết yêu cầu nâng cấp:", error);
            return {
                success: false,
                message: error.message || "Lỗi khi tải chi tiết yêu cầu nâng cấp.",
                error_code: error.status || 500
            };
        }
    }
}

/**
 * Duyệt yêu cầu nâng cấp (Nâng cấp role thành instructor)
 */
export async function approveUpgradeRequest(userId) {
    const uId = parseInt(userId);
    if (!USE_MOCK_DATA) {
        try {
            const envelope = await apiFetchEnvelope(`${API_BASE_URL}/${uId}/approve`, {
                method: "PATCH"
            });
            return {
                success: true,
                message: "Phê duyệt yêu cầu nâng cấp thành công.",
                data: envelope.data
            };
        } catch (error) {
            console.error("Lỗi khi phê duyệt yêu cầu nâng cấp:", error);
            if (error.status === 409) {
                return { success: false, message: "Hồ sơ đã được xử lý trước đó.", error_code: 409 };
            }
            return {
                success: false,
                message: error.message || "Lỗi khi phê duyệt yêu cầu nâng cấp.",
                error_code: error.status || 500
            };
        }
    }
}

/**
 * Từ chối yêu cầu nâng cấp (Giữ nguyên role learner)
 */
export async function rejectUpgradeRequest(userId, reason = null) {
    const uId = parseInt(userId);
    if (!USE_MOCK_DATA) {
        try {
            const envelope = await apiFetchEnvelope(`${API_BASE_URL}/${uId}/reject`, {
                method: "PATCH",
                body: reason ? JSON.stringify({ reason }) : undefined,
                headers: reason ? { "Content-Type": "application/json" } : undefined,
            });
            return {
                success: true,
                message: "Đã từ chối yêu cầu nâng cấp.",
                data: envelope.data
            };
        } catch (error) {
            console.error("Lỗi khi từ chối yêu cầu nâng cấp:", error);
            if (error.status === 409) {
                return { success: false, message: "Hồ sơ đã được xử lý trước đó.", error_code: 409 };
            }
            return {
                success: false,
                message: error.message || "Lỗi khi từ chối yêu cầu nâng cấp.",
                error_code: error.status || 500
            };
        }
    }
}
