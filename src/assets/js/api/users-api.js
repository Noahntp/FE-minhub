import { apiFetchEnvelope } from "@/shared/lib/api-client";

// Cấu hình nguồn dữ liệu: true để dùng mock (localStorage), false để gọi API thật
const USE_MOCK = false;
const API_BASE_URL = "/admin/users";

/**
 * Lấy danh sách người dùng (hỗ trợ phân trang, lọc, sắp xếp)
 */
export async function getUsers(params = {}) {
    if (!USE_MOCK) {
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
            console.error("Lỗi khi tải danh sách người dùng:", error);
            return {
                success: false,
                message: error.message || "Lỗi hệ thống khi tải danh sách người dùng.",
                error_code: error.status || 500
            };
        }
    }
}

/**
 * Lấy chi tiết một người dùng
 */
export async function getUser(id) {
    const userId = parseInt(id);
    if (!USE_MOCK) {
        try {
            const envelope = await apiFetchEnvelope(`${API_BASE_URL}/${userId}`);
            return {
                success: true,
                message: "Lấy chi tiết thành công.",
                data: envelope.data
            };
        } catch (error) {
            console.error("Lỗi khi tải chi tiết người dùng:", error);
            return {
                success: false,
                message: error.message || "Lỗi khi tải chi tiết người dùng.",
                error_code: error.status || 500
            };
        }
    }
}

/**
 * Thêm mới một người dùng
 */
export async function createUser(payload) {
    if (!USE_MOCK) {
        try {
            const cleanedPayload = { ...payload };
            if (cleanedPayload.phone === "") {
                cleanedPayload.phone = null;
            }
            if (cleanedPayload.locked_reason === "") {
                cleanedPayload.locked_reason = null;
            }
            const envelope = await apiFetchEnvelope(API_BASE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanedPayload)
            });
            return {
                success: true,
                message: "Tạo người dùng thành công.",
                data: envelope.data
            };
        } catch (error) {
            console.error("Lỗi khi tạo người dùng:", error);
            if (error.status === 422 && error.errors) {
                return {
                    success: false,
                    message: error.message || "Dữ liệu không hợp lệ.",
                    errors: error.errors,
                    error_code: 422
                };
            }
            return {
                success: false,
                message: error.message || "Lỗi khi tạo người dùng.",
                error_code: error.status || 500
            };
        }
    }
}

/**
 * Cập nhật thông tin người dùng
 */
export async function updateUser(id, payload) {
    const userId = parseInt(id);
    if (!USE_MOCK) {
        try {
            const cleanedPayload = { ...payload };
            if (cleanedPayload.password === "") {
                delete cleanedPayload.password;
            }
            if (cleanedPayload.phone === "") {
                cleanedPayload.phone = null;
            }
            if (cleanedPayload.locked_reason === "") {
                cleanedPayload.locked_reason = null;
            }
            const envelope = await apiFetchEnvelope(`${API_BASE_URL}/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanedPayload)
            });
            return {
                success: true,
                message: "Cập nhật người dùng thành công.",
                data: envelope.data
            };
        } catch (error) {
            console.error("Lỗi khi cập nhật người dùng:", error);
            if (error.status === 422 && error.errors) {
                return {
                    success: false,
                    message: error.message || "Dữ liệu không hợp lệ.",
                    errors: error.errors,
                    error_code: 422
                };
            }
            return {
                success: false,
                message: error.message || "Lỗi khi cập nhật người dùng.",
                error_code: error.status || 500
            };
        }
    }
}

/**
 * Xóa mềm người dùng
 */
export async function deleteUser(id) {
    const userId = parseInt(id);
    if (!USE_MOCK) {
        try {
            await apiFetchEnvelope(`${API_BASE_URL}/${userId}`, {
                method: "DELETE"
            });
            return {
                success: true,
                message: "Xóa người dùng thành công."
            };
        } catch (error) {
            console.error("Lỗi khi xóa người dùng:", error);
            return {
                success: false,
                message: error.message || "Lỗi khi xóa người dùng.",
                error_code: error.status || 500
            };
        }
    }
}

/**
 * Xử lý hàng loạt tài khoản người dùng (Khóa / Mở khóa / Kích hoạt)
 */
export async function bulkUserAction(payload) {
    if (!USE_MOCK) {
        try {
            const envelope = await apiFetchEnvelope(`${API_BASE_URL}/bulk-action`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            return {
                success: true,
                message: envelope.message || "Thao tác hàng loạt thành công.",
                data: envelope.data
            };
        } catch (error) {
            console.error("Lỗi khi xử lý hàng loạt người dùng:", error);
            if (error.status === 422 && error.errors) {
                return {
                    success: false,
                    message: error.message || "Dữ liệu không hợp lệ.",
                    errors: error.errors,
                    error_code: 422
                };
            }
            return {
                success: false,
                message: error.message || "Lỗi khi xử lý hàng loạt người dùng.",
                error_code: error.status || 500
            };
        }
    }
}

