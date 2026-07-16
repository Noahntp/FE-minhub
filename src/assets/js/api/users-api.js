import { getUsers as getRepoUsers, saveUsers as saveRepoUsers } from "../mocks/mock-repository.js";

// Cấu hình nguồn dữ liệu: true để dùng mock (localStorage), false để gọi API thật
const USE_MOCK = true;
const API_BASE_URL = "/api/admin/users";

/**
 * Lấy toàn bộ danh sách từ localStorage (chỉ dùng nội bộ cho Mock)
 */
function getRawMockUsers() {
    return getRepoUsers();
}

/**
 * Lưu danh sách vào localStorage (chỉ dùng nội bộ cho Mock)
 */
function saveRawMockUsers(users) {
    saveRepoUsers(users);
}

/**
 * Lấy danh sách người dùng (hỗ trợ phân trang, lọc, sắp xếp)
 */
export async function getUsers(params = {}) {
    if (!USE_MOCK) {
        // Gọi API thật khi sẵn sàng
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}?${query}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    // --- Xử lý MOCK DATA ---
    // Giả lập độ trễ mạng 300ms
    await new Promise(resolve => setTimeout(resolve, 350));

    try {
        const rawUsers = getRawMockUsers();
        // Chỉ lấy những tài khoản chưa bị xóa mềm
        const activeUsersList = rawUsers.filter(u => u.deleted_at === null);

        // 1. Tính toán các chỉ số thống kê (Summary) trên toàn bộ danh sách chưa bị xóa (trước khi lọc)
        const summary = {
            total_users: activeUsersList.length,
            total_learners: activeUsersList.filter(u => u.role === "learner").length,
            total_instructors: activeUsersList.filter(u => u.role === "instructor").length,
            active_users: activeUsersList.filter(u => u.status === "active" && !u.locked).length,
            inactive_users: activeUsersList.filter(u => u.status === "inactive" && !u.locked).length,
            locked_users: activeUsersList.filter(u => u.locked || u.status === "locked").length,
            unverified_users: activeUsersList.filter(u => u.email_verified_at === null).length,
            no_login_users: activeUsersList.filter(u => u.last_login_at === null).length,
            new_users_in_period: 4 // Số đăng ký mới trong giai đoạn (giả lập)
        };

        // 2. Lọc dữ liệu theo tham số tìm kiếm
        let filtered = [...activeUsersList];

        // Lọc theo search (Họ tên, email, sđt)
        if (params.search) {
            const searchKeyword = params.search.toLowerCase().trim();
            filtered = filtered.filter(u => 
                (u.full_name && u.full_name.toLowerCase().includes(searchKeyword)) ||
                (u.email && u.email.toLowerCase().includes(searchKeyword)) ||
                (u.phone && u.phone.includes(searchKeyword))
            );
        }

        // Lọc theo vai trò (role)
        if (params.role && params.role !== "") {
            filtered = filtered.filter(u => u.role === params.role);
        }

        // Lọc theo trạng thái hiệu lực (status)
        if (params.status && params.status !== "") {
            filtered = filtered.filter(u => {
                const isLocked = u.locked || u.status === "locked";
                if (params.status === "locked") {
                    return isLocked;
                } else if (params.status === "active") {
                    return u.status === "active" && !isLocked;
                } else if (params.status === "inactive") {
                    return u.status === "inactive" && !isLocked;
                }
                return true;
            });
        }

        // Lọc theo xác minh email (email_verified)
        if (params.email_verified && params.email_verified !== "") {
            if (params.email_verified === "verified") {
                filtered = filtered.filter(u => u.email_verified_at !== null);
            } else if (params.email_verified === "unverified") {
                filtered = filtered.filter(u => u.email_verified_at === null);
            }
        }

        // Lọc theo chưa đăng nhập lần nào (no_login)
        if (params.no_login === "true" || params.no_login === true) {
            filtered = filtered.filter(u => u.last_login_at === null);
        }

        // Lọc theo khoảng ngày tạo (date_from, date_to)
        if (params.date_from) {
            const fromDate = new Date(params.date_from);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(u => new Date(u.created_at) >= fromDate);
        }
        if (params.date_to) {
            const toDate = new Date(params.date_to);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(u => new Date(u.created_at) <= toDate);
        }

        // 3. Sắp xếp dữ liệu (Sort)
        const sortBy = params.sort_by || "newest";
        filtered.sort((a, b) => {
            if (sortBy === "newest") {
                return new Date(b.created_at) - new Date(a.created_at);
            } else if (sortBy === "oldest") {
                return new Date(a.created_at) - new Date(b.created_at);
            } else if (sortBy === "name_asc") {
                return a.full_name.localeCompare(b.full_name, "vi");
            } else if (sortBy === "name_desc") {
                return b.full_name.localeCompare(a.full_name, "vi");
            } else if (sortBy === "last_login") {
                const dateA = a.last_login_at ? new Date(a.last_login_at) : new Date(0);
                const dateB = b.last_login_at ? new Date(b.last_login_at) : new Date(0);
                return dateB - dateA;
            }
            return 0;
        });

        // 4. Phân trang (Pagination)
        const total = filtered.length;
        const perPage = parseInt(params.per_page) || 20;
        const currentPage = parseInt(params.page) || 1;
        const lastPage = Math.max(1, Math.ceil(total / perPage));
        
        const startIndex = (currentPage - 1) * perPage;
        const paginatedItems = filtered.slice(startIndex, startIndex + perPage);

        return {
            success: true,
            message: "Lấy dữ liệu thành công.",
            data: {
                summary: summary,
                items: paginatedItems
            },
            meta: {
                current_page: currentPage,
                last_page: lastPage,
                per_page: perPage,
                total: total
            }
        };
    } catch (error) {
        console.error("Lỗi Mock API getUsers:", error);
        return {
            success: false,
            message: "Lỗi hệ thống khi tải danh sách người dùng.",
            error_code: 500
        };
    }
}

/**
 * Lấy chi tiết một người dùng
 */
export async function getUser(id) {
    const userId = parseInt(id);
    if (!USE_MOCK) {
        const response = await fetch(`${API_BASE_URL}/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    const rawUsers = getRawMockUsers();
    const user = rawUsers.find(u => u.id === userId && u.deleted_at === null);

    if (!user) {
        return {
            success: false,
            message: "Không tìm thấy người dùng.",
            error_code: 404
        };
    }

    return {
        success: true,
        message: "Lấy chi tiết thành công.",
        data: user
    };
}

/**
 * Thêm mới một người dùng
 */
export async function createUser(payload) {
    if (!USE_MOCK) {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            if (response.status === 422) {
                const errData = await response.json();
                return { success: false, errors: errData.errors, error_code: 422 };
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Validate cơ bản
    const errors = {};
    if (!payload.full_name || payload.full_name.trim() === "") {
        errors.full_name = ["Họ và tên là bắt buộc."];
    }
    if (!payload.email || payload.email.trim() === "") {
        errors.email = ["Email là bắt buộc."];
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email)) {
            errors.email = ["Email không đúng định dạng."];
        }
    }
    if (!payload.password || payload.password.trim() === "") {
        errors.password = ["Mật khẩu là bắt buộc khi tạo mới."];
    }
    if (!payload.role) {
        errors.role = ["Vai trò là bắt buộc."];
    }
    if (payload.status === "locked" && (!payload.locked_reason || payload.locked_reason.trim() === "")) {
        errors.locked_reason = ["Lý do khóa là bắt buộc khi trạng thái là Đã khóa."];
    }

    // Kiểm tra trùng email
    const rawUsers = getRawMockUsers();
    if (payload.email && rawUsers.some(u => u.email.toLowerCase() === payload.email.toLowerCase() && u.deleted_at === null)) {
        errors.email = ["Email này đã tồn tại trong hệ thống."];
    }

    if (Object.keys(errors).length > 0) {
        return {
            success: false,
            message: "Dữ liệu không hợp lệ.",
            errors: errors,
            error_code: 422
        };
    }

    // Tạo mới record
    const newId = rawUsers.length > 0 ? Math.max(...rawUsers.map(u => u.id)) + 1 : 1;
    const nowStr = new Date().toISOString();
    const isLockedState = payload.status === "locked";

    const newUser = {
        id: newId,
        full_name: payload.full_name.trim(),
        email: payload.email.trim(),
        phone: payload.phone ? payload.phone.trim() : null,
        role: payload.role,
        status: payload.status || "active",
        effective_status: isLockedState ? "locked" : (payload.status || "active"),
        oauth_account_login: false,
        email_verified_at: payload.email_verified_at || null,
        last_login_at: null,
        locked: isLockedState,
        locked_reason: isLockedState ? payload.locked_reason.trim() : null,
        created_at: nowStr,
        updated_at: nowStr,
        deleted_at: null
    };

    rawUsers.push(newUser);
    saveRawMockUsers(rawUsers);

    return {
        success: true,
        message: "Tạo người dùng thành công.",
        data: newUser
    };
}

/**
 * Cập nhật thông tin người dùng
 */
export async function updateUser(id, payload) {
    const userId = parseInt(id);
    if (!USE_MOCK) {
        const response = await fetch(`${API_BASE_URL}/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            if (response.status === 422) {
                const errData = await response.json();
                return { success: false, errors: errData.errors, error_code: 422 };
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    const rawUsers = getRawMockUsers();
    const userIndex = rawUsers.findIndex(u => u.id === userId && u.deleted_at === null);

    if (userIndex === -1) {
        return {
            success: false,
            message: "Không tìm thấy người dùng để cập nhật.",
            error_code: 404
        };
    }

    const currentRecord = rawUsers[userIndex];

    // Validate
    const errors = {};
    if (payload.full_name !== undefined && (!payload.full_name || payload.full_name.trim() === "")) {
        errors.full_name = ["Họ và tên là bắt buộc."];
    }
    if (payload.email !== undefined) {
        if (!payload.email || payload.email.trim() === "") {
            errors.email = ["Email là bắt buộc."];
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(payload.email)) {
                errors.email = ["Email không đúng định dạng."];
            }
            // Check trùng email ngoại trừ chính mình
            if (rawUsers.some(u => u.id !== userId && u.email.toLowerCase() === payload.email.toLowerCase() && u.deleted_at === null)) {
                errors.email = ["Email này đã tồn tại trong hệ thống."];
            }
        }
    }
    
    // Ràng buộc lý do khóa
    const newStatus = payload.status !== undefined ? payload.status : currentRecord.status;
    const isLockedState = newStatus === "locked" || payload.locked === true;
    if (isLockedState && payload.locked_reason !== undefined && (!payload.locked_reason || payload.locked_reason.trim() === "")) {
        errors.locked_reason = ["Lý do khóa là bắt buộc khi trạng thái là Đã khóa."];
    }

    // Ràng buộc bảo mật: Không được tự tước quyền Admin của chính mình (nếu đây là Admin đang login)
    // Giả định Admin đang login có email = admin@mindhub.edu.vn (id = 1)
    if (userId === 1) {
        if (payload.role !== undefined && payload.role !== "admin") {
            errors.role = ["Bạn không thể tự thay đổi vai trò Admin của chính mình."];
        }
        if (payload.status !== undefined && payload.status !== "active") {
            errors.status = ["Bạn không thể tự vô hiệu hóa hoặc khóa tài khoản của chính mình."];
        }
        if (payload.locked === true) {
            errors.locked = ["Bạn không thể tự khóa tài khoản của chính mình."];
        }
    }

    // Ràng buộc bảo mật: Không được xóa/khóa Admin duy nhất
    if (currentRecord.role === "admin" && (payload.role === "learner" || payload.role === "instructor" || isLockedState || payload.status === "inactive")) {
        const otherActiveAdmins = rawUsers.filter(u => u.id !== userId && u.role === "admin" && u.status === "active" && !u.locked && u.deleted_at === null);
        if (otherActiveAdmins.length === 0) {
            errors.role = ["Hệ thống phải có ít nhất một tài khoản Quản trị viên hoạt động."];
        }
    }

    if (Object.keys(errors).length > 0) {
        return {
            success: false,
            message: "Dữ liệu không hợp lệ.",
            errors: errors,
            error_code: 422
        };
    }

    // Thực hiện cập nhật
    const nowStr = new Date().toISOString();
    
    // Cập nhật các trường
    if (payload.full_name !== undefined) currentRecord.full_name = payload.full_name.trim();
    if (payload.email !== undefined) currentRecord.email = payload.email.trim();
    if (payload.phone !== undefined) currentRecord.phone = payload.phone ? payload.phone.trim() : null;
    if (payload.role !== undefined) currentRecord.role = payload.role;
    
    if (payload.status !== undefined) {
        currentRecord.status = payload.status;
    }
    if (payload.locked !== undefined) {
        currentRecord.locked = payload.locked;
    }
    if (payload.locked_reason !== undefined) {
        currentRecord.locked_reason = payload.locked_reason;
    }

    // Xử lý logic trạng thái hiệu lực
    const isNowLocked = currentRecord.locked || currentRecord.status === "locked";
    if (isNowLocked) {
        currentRecord.effective_status = "locked";
        currentRecord.locked = true;
        if (currentRecord.status !== "locked") {
            currentRecord.status = "locked";
        }
    } else {
        currentRecord.effective_status = currentRecord.status;
        currentRecord.locked = false;
        currentRecord.locked_reason = null;
    }

    currentRecord.updated_at = nowStr;
    
    // Lưu lại
    rawUsers[userIndex] = currentRecord;
    saveRawMockUsers(rawUsers);

    return {
        success: true,
        message: "Cập nhật người dùng thành công.",
        data: currentRecord
    };
}

/**
 * Xóa mềm người dùng
 */
export async function deleteUser(id) {
    const userId = parseInt(id);
    if (!USE_MOCK) {
        const response = await fetch(`${API_BASE_URL}/${userId}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    await new Promise(resolve => setTimeout(resolve, 250));
    const rawUsers = getRawMockUsers();
    const userIndex = rawUsers.findIndex(u => u.id === userId && u.deleted_at === null);

    if (userIndex === -1) {
        return {
            success: false,
            message: "Không tìm thấy người dùng cần xóa hoặc đã bị xóa.",
            error_code: 404
        };
    }

    // Ràng buộc: Không tự xóa chính mình
    if (userId === 1) {
        return {
            success: false,
            message: "Bạn không thể tự xóa tài khoản của chính mình.",
            error_code: 409
        };
    }

    // Ràng buộc: Không được xóa Admin duy nhất của hệ thống
    const currentRecord = rawUsers[userIndex];
    if (currentRecord.role === "admin") {
        const otherActiveAdmins = rawUsers.filter(u => u.id !== userId && u.role === "admin" && u.status === "active" && !u.locked && u.deleted_at === null);
        if (otherActiveAdmins.length === 0) {
            return {
                success: false,
                message: "Không thể xóa Quản trị viên duy nhất hoạt động của hệ thống.",
                error_code: 409
            };
        }
    }

    const nowStr = new Date().toISOString();
    rawUsers[userIndex].deleted_at = nowStr;
    rawUsers[userIndex].updated_at = nowStr;

    saveRawMockUsers(rawUsers);

    return {
        success: true,
        message: "Xóa người dùng thành công."
    };
}
