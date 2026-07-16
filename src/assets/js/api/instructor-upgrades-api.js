import { USE_MOCK_DATA } from "../core/config.js";
import {
    getInstructorUpgrades,
    saveInstructorUpgrades,
    getUserById,
    updateUser as updateRepoUser
} from "../mocks/mock-repository.js";

const API_BASE_URL = "/api/admin/instructor-upgrade-requests";

/**
 * Lấy toàn bộ danh sách từ localStorage (chỉ dùng nội bộ cho Mock)
 */
function getRawMockRequests() {
    const raw = getInstructorUpgrades();
    return raw.map(app => {
        const user = getUserById(app.user_id);
        return {
            application_status: app.application_status,
            submitted_at: app.submitted_at,
            reviewed_at: app.reviewed_at,
            review_note: app.review_note,
            user: user ? {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                email_verified_at: user.email_verified_at
            } : null,
            instructor_profile: {
                bio: app.bio,
                expertise: app.expertise,
                experience_years: app.experience_years,
                level: app.level
            },
            payout_account: app.payout_account ? {
                id: 6000 + app.user_id,
                provider: app.payout_account.provider,
                account_name: app.payout_account.account_name,
                account_number: app.payout_account.account_number,
                account_number_masked: app.payout_account.account_number.slice(0, 3) + "******" + app.payout_account.account_number.slice(-2),
                status: app.payout_account.status,
                connected_at: app.submitted_at
            } : null
        };
    });
}

/**
 * Lưu danh sách vào localStorage (chỉ dùng nội bộ cho Mock)
 */
function saveRawMockRequests(requests) {
    const raw = requests.map(app => {
        return {
            user_id: app.user.id,
            application_status: app.application_status,
            submitted_at: app.submitted_at,
            reviewed_at: app.reviewed_at,
            review_note: app.review_note,
            bio: app.instructor_profile.bio,
            expertise: app.instructor_profile.expertise,
            experience_years: app.instructor_profile.experience_years,
            level: app.instructor_profile.level,
            payout_account: app.payout_account ? {
                provider: app.payout_account.provider,
                account_name: app.payout_account.account_name,
                account_number: app.payout_account.account_number,
                status: app.payout_account.status
            } : null
        };
    });
    saveInstructorUpgrades(raw);
}

/**
 * Lấy danh sách yêu cầu nâng cấp (hỗ trợ phân trang, lọc, sắp xếp)
 */
export async function getUpgradeRequests(params = {}) {
    if (!USE_MOCK_DATA) {
        // Gọi API thật khi sẵn sàng
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}?${query}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    // --- Xử lý MOCK DATA ---
    // Giả lập độ trễ mạng 350ms
    await new Promise(resolve => setTimeout(resolve, 350));

    try {
        const rawRequests = getRawMockRequests();

        // 1. Tính toán các chỉ số thống kê (Summary) trên toàn bộ danh sách
        const summary = {
            total: rawRequests.length,
            pending: rawRequests.filter(r => r.application_status === "pending").length,
            approved: rawRequests.filter(r => r.application_status === "approved").length,
            rejected: rawRequests.filter(r => r.application_status === "rejected").length
        };

        // 2. Lọc dữ liệu
        let filtered = [...rawRequests];

        // Lọc theo search (Tên, email, số điện thoại)
        if (params.search) {
            const searchKeyword = params.search.toLowerCase().trim();
            filtered = filtered.filter(r => 
                (r.user.full_name && r.user.full_name.toLowerCase().includes(searchKeyword)) ||
                (r.user.email && r.user.email.toLowerCase().includes(searchKeyword)) ||
                (r.user.phone && r.user.phone.includes(searchKeyword))
            );
        }

        // Lọc theo trạng thái (status)
        if (params.status && params.status !== "") {
            filtered = filtered.filter(r => r.application_status === params.status);
        }

        // Lọc theo ngày gửi (date_from, date_to)
        if (params.date_from) {
            const fromDate = new Date(params.date_from);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(r => new Date(r.submitted_at) >= fromDate);
        }
        if (params.date_to) {
            const toDate = new Date(params.date_to);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(r => new Date(r.submitted_at) <= toDate);
        }

        // 3. Sắp xếp (Sort)
        const sortBy = params.sort_by || "newest";
        filtered.sort((a, b) => {
            if (sortBy === "newest") {
                return new Date(b.submitted_at) - new Date(a.submitted_at);
            } else if (sortBy === "oldest") {
                return new Date(a.submitted_at) - new Date(b.submitted_at);
            } else if (sortBy === "reviewed_newest") {
                const dateA = a.reviewed_at ? new Date(a.reviewed_at) : new Date(0);
                const dateB = b.reviewed_at ? new Date(b.reviewed_at) : new Date(0);
                return dateB - dateA;
            } else if (sortBy === "name_asc") {
                return a.user.full_name.localeCompare(b.user.full_name, "vi");
            } else if (sortBy === "name_desc") {
                return b.user.full_name.localeCompare(a.user.full_name, "vi");
            }
            return 0;
        });

        // 4. Phân trang
        const total = filtered.length;
        const perPage = parseInt(params.per_page) || 20;
        const currentPage = parseInt(params.page) || 1;
        const lastPage = Math.max(1, Math.ceil(total / perPage));
        
        const startIndex = (currentPage - 1) * perPage;
        const paginatedItems = filtered.slice(startIndex, startIndex + perPage);

        // Bảo mật: Ẩn số tài khoản đầy đủ khỏi danh sách chung
        const itemsForList = paginatedItems.map(item => {
            const copy = JSON.parse(JSON.stringify(item));
            if (copy.payout_account) {
                delete copy.payout_account.account_number; // Chỉ trả account_number_masked ở list
            }
            return copy;
        });

        return {
            success: true,
            message: "Lấy dữ liệu thành công.",
            data: {
                summary: summary,
                items: itemsForList
            },
            meta: {
                current_page: currentPage,
                last_page: lastPage,
                per_page: perPage,
                total: total
            }
        };
    } catch (error) {
        console.error("Lỗi Mock API getUpgradeRequests:", error);
        return {
            success: false,
            message: "Lỗi hệ thống khi tải danh sách yêu cầu.",
            error_code: 500
        };
    }
}

/**
 * Lấy chi tiết yêu cầu nâng cấp (Chứa số tài khoản đầy đủ)
 */
export async function getUpgradeRequest(userId) {
    const uId = parseInt(userId);
    if (!USE_MOCK_DATA) {
        const response = await fetch(`${API_BASE_URL}/${uId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    await new Promise(resolve => setTimeout(resolve, 200));
    const rawRequests = getRawMockRequests();
    const request = rawRequests.find(r => r.user.id === uId);

    if (!request) {
        return {
            success: false,
            message: "Không tìm thấy hồ sơ yêu cầu nâng cấp.",
            error_code: 404
        };
    }

    return {
        success: true,
        message: "Lấy chi tiết thành công.",
        data: request
    };
}

/**
 * Duyệt yêu cầu nâng cấp (Nâng cấp role thành instructor)
 */
export async function approveUpgradeRequest(userId) {
    const uId = parseInt(userId);
    if (!USE_MOCK_DATA) {
        const response = await fetch(`${API_BASE_URL}/${uId}/approve`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
            if (response.status === 409) {
                return { success: false, message: "Hồ sơ đã được xử lý trước đó.", error_code: 409 };
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    const rawRequests = getRawMockRequests();
    const index = rawRequests.findIndex(r => r.user.id === uId);

    if (index === -1) {
        return {
            success: false,
            message: "Không tìm thấy hồ sơ yêu cầu nâng cấp.",
            error_code: 404
        };
    }

    const request = rawRequests[index];
    if (request.application_status !== "pending") {
        return {
            success: false,
            message: "Hồ sơ đã được xử lý trước đó hoặc trạng thái không còn hợp lệ.",
            error_code: 409
        };
    }

    // Cập nhật trạng thái
    request.application_status = "approved";
    request.reviewed_at = new Date().toISOString();
    request.review_note = "Đã phê duyệt nâng cấp thành giảng viên.";
    request.user.role = "instructor";

    // Đồng bộ lại database mock
    saveRawMockRequests(rawRequests);

    // Đồng bộ ngược lại bảng users qua repository (để role đồng bộ)
    updateRepoUser(uId, { role: "instructor" });

    return {
        success: true,
        message: "Phê duyệt yêu cầu nâng cấp thành công."
    };
}

/**
 * Từ chối yêu cầu nâng cấp (Giữ nguyên role learner)
 */
export async function rejectUpgradeRequest(userId) {
    const uId = parseInt(userId);
    if (!USE_MOCK_DATA) {
        const response = await fetch(`${API_BASE_URL}/${uId}/reject`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
            if (response.status === 409) {
                return { success: false, message: "Hồ sơ đã được xử lý trước đó.", error_code: 409 };
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    const rawRequests = getRawMockRequests();
    const index = rawRequests.findIndex(r => r.user.id === uId);

    if (index === -1) {
        return {
            success: false,
            message: "Không tìm thấy hồ sơ yêu cầu nâng cấp.",
            error_code: 404
        };
    }

    const request = rawRequests[index];
    if (request.application_status !== "pending") {
        return {
            success: false,
            message: "Hồ sơ đã được xử lý trước đó hoặc trạng thái không còn hợp lệ.",
            error_code: 409
        };
    }

    // Cập nhật trạng thái từ chối
    request.application_status = "rejected";
    request.reviewed_at = new Date().toISOString();
    request.review_note = "Yêu cầu nâng cấp bị từ chối.";
    // role giữ nguyên là learner

    saveRawMockRequests(rawRequests);

    return {
        success: true,
        message: "Đã từ chối yêu cầu nâng cấp."
    };
}
