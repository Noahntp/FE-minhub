import * as usersApi from "../api/users-api.js";
import { showToast } from "../toast.js";

// ID của Admin giả lập đang đăng nhập
const CURRENT_ADMIN_ID = 1;

// Biến lưu trữ trạng thái hiện tại của trang
let pageState = {
    search: "",
    role: "",
    status: "",
    email_verified: "",
    date_from: "",
    date_to: "",
    sort_by: "newest",
    no_login: "", // "true" hoặc ""
    page: 1,
    per_page: 20
};

// Tập hợp lưu ID người dùng đang được chọn bằng checkbox
const selectedUserIds = new Set();

// Biến lưu trữ dữ liệu người dùng đang thao tác
let activeTargetUser = null;
// Biến lưu trữ hành động xác nhận chung (activate, deactivate, unlock)
let generalActionCallback = null;

// Biến theo dõi góc xoay của nút làm mới
let refreshRotation = 0;

document.addEventListener("DOMContentLoaded", () => {
    console.log("Đã tải trang: Quản lý người dùng (Cải tiến)");

    // Đọc trạng thái từ URL query string
    readStateFromUrl();

    // Khởi tạo các sự kiện tương tác
    initFilterEvents();
    initModalEvents();
    initActionEvents();
    initDropdownAutoClose();
    initRefreshEvent();
    initAttentionEvents();
    initQuickTabsEvents();
    initBulkActionEvents();

    // Tải dữ liệu ban đầu
    fetchAndRender();
});

/**
 * Định dạng ngày giờ Việt Nam (DD/MM/YYYY HH:MM)
 */
function formatDateTime(isoString) {
    if (!isoString) return "---";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "---";
    
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Cập nhật mốc "Cập nhật lần cuối"
 */
function updateLastUpdateTime() {
    const el = document.getElementById("last-update-time");
    if (!el) return;
    
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    el.textContent = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Đọc query params từ URL hiện tại để gán vào state
 */
function readStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    
    pageState.search = params.get("search") || "";
    pageState.role = params.get("role") || "";
    pageState.status = params.get("status") || "";
    pageState.email_verified = params.get("email_verified") || "";
    pageState.date_from = params.get("date_from") || "";
    pageState.date_to = params.get("date_to") || "";
    pageState.sort_by = params.get("sort_by") || "newest";
    pageState.no_login = params.get("no_login") || "";
    pageState.page = parseInt(params.get("page")) || 1;
    pageState.per_page = parseInt(params.get("per_page")) || 20;

    // Cập nhật giá trị hiển thị trên các input lọc
    document.getElementById("filter-search").value = pageState.search;
    document.getElementById("filter-role").value = pageState.role;
    document.getElementById("filter-status").value = pageState.status;
    document.getElementById("filter-verified").value = pageState.email_verified;
    document.getElementById("filter-sort").value = pageState.sort_by;
    document.getElementById("filter-date-from").value = pageState.date_from;
    document.getElementById("filter-date-to").value = pageState.date_to;
    document.getElementById("pag-per-page").value = pageState.per_page;
}

/**
 * Cập nhật query string trên URL dựa trên state hiện tại
 */
function writeStateToUrl() {
    const url = new URL(window.location);
    url.search = "";

    Object.keys(pageState).forEach(key => {
        const val = pageState[key];
        if (val !== undefined && val !== null && val !== "") {
            if (key === "page" && val === 1) return;
            if (key === "per_page" && val === 20) return;
            if (key === "sort_by" && val === "newest") return;
            url.searchParams.set(key, val);
        }
    });

    window.history.pushState({}, "", url);
}

/**
 * Hiển thị/Ẩn loading skeletons cho KPI và Table
 */
function toggleLoading(isLoading) {
    const kpiLoaded = document.getElementById("kpi-content-wrapper");
    const kpiLoading = document.getElementById("kpi-loading-wrapper");
    const tableBody = document.getElementById("users-table-body");
    const tableLoading = document.getElementById("users-loading-state");
    const tableEmpty = document.getElementById("users-empty-state");
    const tableError = document.getElementById("users-error-state");
    const pagination = document.getElementById("pagination-wrapper");
    const quickTabs = document.getElementById("quick-tabs-container");

    const filterInputs = document.querySelectorAll("#filter-form input, #filter-form select, #filter-form button");
    filterInputs.forEach(input => {
        input.disabled = isLoading;
    });

    if (quickTabs) {
        quickTabs.querySelectorAll("button").forEach(btn => btn.disabled = isLoading);
    }

    if (isLoading) {
        kpiLoaded.classList.add("hidden");
        kpiLoading.classList.remove("hidden");
        
        tableBody.innerHTML = "";
        tableLoading.classList.remove("hidden");
        tableEmpty.classList.add("hidden");
        tableError.classList.add("hidden");
        pagination.classList.add("pointer-events-none", "opacity-50");
    } else {
        kpiLoaded.classList.remove("hidden");
        kpiLoading.classList.add("hidden");
        
        tableLoading.classList.add("hidden");
        pagination.classList.remove("pointer-events-none", "opacity-50");
    }
}

/**
 * Gọi API lấy danh sách và hiển thị
 */
async function fetchAndRender() {
    toggleLoading(true);

    // Bỏ chọn tất cả checkbox khi fetch dữ liệu mới
    clearSelection();

    try {
        const response = await usersApi.getUsers(pageState);
        
        if (!response || !response.success) {
            showErrorState(response ? response.message : "Đã xảy ra lỗi không xác định.");
            return;
        }

        renderSummary(response.data.summary);
        renderTable(response.data.items);
        renderPagination(response.meta);
        renderFilterChips();
        updateQuickTabsSelection();
        updateLastUpdateTime();
        
        toggleLoading(false);
    } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
        showErrorState("Không thể kết nối đến máy chủ.");
    }
}

/**
 * Hiển thị giao diện lỗi
 */
function showErrorState(message) {
    toggleLoading(false);
    document.getElementById("kpi-content-wrapper").classList.remove("hidden");
    document.getElementById("kpi-loading-wrapper").classList.add("hidden");
    
    document.getElementById("users-table-body").innerHTML = "";
    document.getElementById("users-loading-state").classList.add("hidden");
    document.getElementById("users-empty-state").classList.add("hidden");
    
    const errorState = document.getElementById("users-error-state");
    errorState.classList.remove("hidden");
    const errorDesc = errorState.querySelector("p");
    if (errorDesc) {
        errorDesc.textContent = message || "Đã có lỗi xảy ra trong quá trình kết nối dữ liệu. Vui lòng thử lại.";
    }
}

/**
 * Render dữ liệu summary lên 6 thẻ thống kê, tiêu đề và tài khoản cần chú ý
 */
function renderSummary(summary) {
    if (!summary) return;
    
    const updateText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = new Intl.NumberFormat("vi-VN").format(val || 0);
    };

    // 1. Cập nhật Summary KPI Cards
    updateText("kpi-total-users", summary.total_users);
    updateText("kpi-total-learners", summary.total_learners);
    updateText("kpi-total-instructors", summary.total_instructors);
    updateText("kpi-active-users", summary.active_users);
    updateText("kpi-locked-users", summary.locked_users);
    updateText("kpi-unverified-users", summary.unverified_users);

    // 2. Số lượng đăng ký mới ở Card Tổng người dùng
    const newUsersEl = document.getElementById("kpi-new-users");
    if (newUsersEl) {
        newUsersEl.textContent = `+${summary.new_users_in_period || 0} mới`;
    }

    // 3. Tiêu đề mô tả: Tổng số tài khoản
    updateText("title-total-users", summary.total_users);

    // 4. Khu vực Tài khoản cần chú ý
    updateText("notice-locked-count", summary.locked_users);
    updateText("notice-unverified-count", summary.unverified_users);
    updateText("notice-no-login-count", summary.no_login_users);

    // 5. Cập nhật số lượng trên Quick Tabs
    updateQuickTabsCounts(summary);
}

/**
 * Cập nhật số lượng hiển thị trên Quick Tabs
 */
function updateQuickTabsCounts(summary) {
    const counts = {
        all: summary.total_users,
        learner: summary.total_learners,
        instructor: summary.total_instructors,
        locked: summary.locked_users,
        unverified: summary.unverified_users
    };

    Object.keys(counts).forEach(tab => {
        const tabBtn = document.querySelector(`[data-tab="${tab}"]`);
        if (tabBtn) {
            const countSpan = tabBtn.querySelector(".tab-count");
            if (countSpan) {
                countSpan.textContent = new Intl.NumberFormat("vi-VN").format(counts[tab] || 0);
            }
        }
    });
}

/**
 * Cập nhật trạng thái Active trực quan cho Quick Tabs dựa trên filter hiện tại
 */
function updateQuickTabsSelection() {
    const tabs = document.querySelectorAll("[data-tab]");
    let activeTab = "all";

    if (pageState.role === "learner" && pageState.status === "" && pageState.email_verified === "" && pageState.no_login === "") {
        activeTab = "learner";
    } else if (pageState.role === "instructor" && pageState.status === "" && pageState.email_verified === "" && pageState.no_login === "") {
        activeTab = "instructor";
    } else if (pageState.status === "locked" && pageState.role === "" && pageState.email_verified === "" && pageState.no_login === "") {
        activeTab = "locked";
    } else if (pageState.email_verified === "unverified" && pageState.role === "" && pageState.status === "" && pageState.no_login === "") {
        activeTab = "unverified";
    } else if (pageState.role !== "" || pageState.status !== "" || pageState.email_verified !== "" || pageState.no_login !== "") {
        // Nếu có bộ lọc phức tạp không khớp tab cụ thể nào, gỡ active toàn bộ
        activeTab = null;
    }

    tabs.forEach(tab => {
        const tabType = tab.getAttribute("data-tab");
        if (tabType === activeTab) {
            tab.className = "px-5 py-3 text-xs font-semibold border-b-2 border-ink text-ink select-none whitespace-nowrap cursor-pointer transition-all";
        } else {
            tab.className = "px-5 py-3 text-xs font-medium border-b-2 border-transparent text-mid-gray hover:text-ink select-none whitespace-nowrap cursor-pointer transition-all";
        }
    });
}

/**
 * Render danh sách người dùng vào table body
 */
function renderTable(users) {
    const tbody = document.getElementById("users-table-body");
    const emptyState = document.getElementById("users-empty-state");
    const checkAll = document.getElementById("check-all-users");
    
    tbody.innerHTML = "";

    if (!users || users.length === 0) {
        emptyState.classList.remove("hidden");
        if (checkAll) {
            checkAll.checked = false;
            checkAll.disabled = true;
        }
        return;
    }
    
    emptyState.classList.add("hidden");
    if (checkAll) checkAll.disabled = false;

    users.forEach(user => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-canvas/50 transition-colors group cursor-pointer border-b border-hairline/60";
        tr.setAttribute("data-user-id", user.id);

        const firstLetter = user.full_name ? user.full_name.charAt(0).toUpperCase() : "U";
        const isSelf = user.id === CURRENT_ADMIN_ID;
        const nameBadge = isSelf ? ` <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-canvas text-mid-gray border border-hairline ml-1 select-none">Bạn</span>` : "";

        // Checkbox cho từng dòng (Vô hiệu hóa dòng của chính mình)
        let checkboxTd = "";
        if (isSelf) {
            checkboxTd = `<td class="p-3.5 pl-4 w-10 text-center" data-checkbox-td>
                <input type="checkbox" disabled class="h-3.5 w-3.5 rounded border-hairline text-ink opacity-30 cursor-not-allowed select-none">
            </td>`;
        } else {
            const isChecked = selectedUserIds.has(user.id);
            checkboxTd = `<td class="p-3.5 pl-4 w-10 text-center" data-checkbox-td>
                <input type="checkbox" data-user-checkbox="${user.id}" ${isChecked ? "checked" : ""} class="h-3.5 w-3.5 rounded border-hairline text-ink focus:ring-ink focus:ring-offset-0 cursor-pointer accent-ink">
            </td>`;
        }

        // Badge Vai trò
        let roleBadge = "";
        if (user.role === "admin") {
            roleBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-ink text-white shadow-sm select-none">Quản trị viên</span>`;
        } else if (user.role === "instructor") {
            roleBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-success/10 text-success border border-success/20 select-none">Giảng viên</span>`;
        } else {
            roleBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas text-mid-gray border border-hairline select-none">Học viên</span>`;
        }

        // Badge Trạng thái
        let statusBadge = "";
        const isLocked = user.locked || user.status === "locked" || user.effective_status === "locked";
        if (isLocked) {
            statusBadge = `<span class="inline-flex items-center gap-1 text-[10px] font-medium text-danger-brick bg-danger-brick-soft border border-danger-brick/10 px-2 py-0.5 rounded-full select-none">
                <span class="h-1.5 w-1.5 rounded-full bg-danger-brick"></span>Đã khóa
            </span>`;
        } else if (user.status === "inactive") {
            statusBadge = `<span class="inline-flex items-center gap-1 text-[10px] font-medium text-mid-gray bg-canvas border border-hairline px-2 py-0.5 rounded-full select-none">
                <span class="h-1.5 w-1.5 rounded-full bg-mid-gray"></span>Không hoạt động
            </span>`;
        } else {
            statusBadge = `<span class="inline-flex items-center gap-1 text-[10px] font-medium text-success bg-success-soft border border-success/10 px-2 py-0.5 rounded-full select-none">
                <span class="h-1.5 w-1.5 rounded-full bg-success"></span>Đang hoạt động
            </span>`;
        }

        // Xác minh email
        const verifiedText = user.email_verified_at 
            ? `<span class="text-success font-medium flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>Đã xác minh</span>` 
            : `<span class="text-mid-gray font-normal">Chưa xác minh</span>`;

        // Thao tác nhanh dropdown items
        let actionItems = `
            <button type="button" data-action="view" class="w-full text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-full transition-colors font-medium cursor-pointer">Xem chi tiết</button>
            <button type="button" data-action="edit" class="w-full text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-full transition-colors font-medium cursor-pointer">Chỉnh sửa</button>
        `;

        if (!isSelf) {
            if (isLocked) {
                actionItems += `<button type="button" data-action="unlock" class="w-full text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-full transition-colors font-medium text-success cursor-pointer">Mở khóa tài khoản</button>`;
            } else {
                actionItems += `<button type="button" data-action="lock" class="w-full text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-full transition-colors font-medium text-danger-brick cursor-pointer">Khóa tài khoản</button>`;
            }

            if (!isLocked) {
                if (user.status === "active") {
                    actionItems += `<button type="button" data-action="deactivate" class="w-full text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-full transition-colors font-medium text-mid-gray cursor-pointer">Vô hiệu hóa</button>`;
                } else {
                    actionItems += `<button type="button" data-action="activate" class="w-full text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-full transition-colors font-medium text-success cursor-pointer">Kích hoạt</button>`;
                }
            }

            actionItems += `
                <div class="h-[1px] bg-hairline my-1 mx-1.5"></div>
                <button type="button" data-action="delete" class="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 hover:text-danger-brick rounded-full transition-colors font-semibold text-danger-brick cursor-pointer">Xóa người dùng</button>
            `;
        }

        tr.innerHTML = `
            ${checkboxTd}
            <td class="p-3.5">
                <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-mid-gray font-bold text-xs select-none">
                        ${firstLetter}
                    </div>
                    <div class="min-w-0">
                        <div class="font-bold text-ink text-sm sm:text-xs leading-tight flex items-center">${user.full_name}${nameBadge}</div>
                        <div class="text-[10px] text-mid-gray mt-0.5 truncate">${user.email}</div>
                    </div>
                </div>
            </td>
            <td class="p-3.5">${roleBadge}</td>
            <td class="p-3.5 text-mid-gray font-mono text-[11px]">${user.phone || "---"}</td>
            <td class="p-3.5">${statusBadge}</td>
            <td class="p-3.5 text-[11px]">${verifiedText}</td>
            <td class="p-3.5 text-mid-gray text-[11px]">${user.last_login_at ? formatDateTime(user.last_login_at) : '<span class="text-mid-gray/60 italic">Chưa đăng nhập</span>'}</td>
            <td class="p-3.5 text-mid-gray text-[11px]">${formatDateTime(user.created_at)}</td>
            <td class="p-3.5 pr-4 text-right relative" data-action-td>
                <button type="button" class="btn-action-menu p-1.5 rounded-full hover:bg-canvas text-mid-gray hover:text-ink transition-colors inline-block select-none cursor-pointer" aria-label="Xem menu thao tác">
                    <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                    </svg>
                </button>
                <div class="action-dropdown absolute right-4 top-10 z-20 hidden w-44 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left">
                    ${actionItems}
                </div>
            </td>
        `;

        // Click dòng mở drawer chi tiết (ngoại trừ khi click checkbox hoặc menu thao tác)
        tr.addEventListener("click", (e) => {
            const isClickCheckbox = e.target.closest("[data-checkbox-td]");
            const isActionTd = e.target.closest("[data-action-td]") || e.target.closest(".action-dropdown");
            
            if (isClickCheckbox) {
                // Click checkbox thì để trình duyệt tự xử lý sự kiện change checkbox
                return;
            }
            if (!isActionTd) {
                openDetailDrawer(user.id);
            }
        });

        // Gắn sự kiện checkbox từng dòng
        const checkbox = tr.querySelector("input[data-user-checkbox]");
        if (checkbox) {
            checkbox.addEventListener("change", () => {
                const uId = user.id;
                if (checkbox.checked) {
                    selectedUserIds.add(uId);
                } else {
                    selectedUserIds.delete(uId);
                }
                updateBulkActionsBar();
            });
        }

        // Tương tác Dropdown cột Thao tác
        const btnMenu = tr.querySelector(".btn-action-menu");
        const dropdown = tr.querySelector(".action-dropdown");
        
        btnMenu.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelectorAll(".action-dropdown").forEach(d => {
                if (d !== dropdown) d.classList.add("hidden");
            });
            dropdown.classList.toggle("hidden");
        });

        dropdown.querySelectorAll("button[data-action]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                dropdown.classList.add("hidden");
                const action = btn.getAttribute("data-action");
                handleUserAction(action, user);
            });
        });

        tbody.appendChild(tr);
    });

    // Đồng bộ lại checkbox Header "Chọn tất cả" sau khi render
    updateCheckAllState();
}

/**
 * Render dải phân trang và nút
 */
function renderPagination(meta) {
    const infoRange = document.getElementById("pag-showing-range");
    const totalRecords = document.getElementById("pag-total-records");
    const container = document.getElementById("pagination-buttons");

    container.innerHTML = "";

    if (!meta || meta.total === 0) {
        infoRange.textContent = "0-0";
        totalRecords.textContent = "0";
        return;
    }

    const start = (meta.current_page - 1) * meta.per_page + 1;
    const end = Math.min(meta.current_page * meta.per_page, meta.total);
    infoRange.textContent = `${start}-${end}`;
    totalRecords.textContent = meta.total;

    // Nút "Trang trước"
    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = `p-1.5 rounded-full border border-hairline transition-colors flex items-center justify-center shrink-0 ${meta.current_page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-canvas cursor-pointer"}`;
    prevBtn.disabled = meta.current_page === 1;
    prevBtn.innerHTML = `<svg class="w-3.5 h-3.5 text-ink" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>`;
    prevBtn.addEventListener("click", () => {
        if (meta.current_page > 1) changePage(meta.current_page - 1);
    });
    container.appendChild(prevBtn);

    const maxButtons = 5;
    let startPage = Math.max(1, meta.current_page - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > meta.last_page) {
        endPage = meta.last_page;
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.type = "button";
        const isCurrent = i === meta.current_page;
        pageBtn.className = `h-7.5 w-7.5 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${isCurrent ? "bg-ink text-white shadow-sm" : "border border-transparent hover:bg-canvas hover:text-ink text-mid-gray"}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener("click", () => {
            if (!isCurrent) changePage(i);
        });
        container.appendChild(pageBtn);
    }

    // Nút "Trang sau"
    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = `p-1.5 rounded-full border border-hairline transition-colors flex items-center justify-center shrink-0 ${meta.current_page === meta.last_page ? "opacity-40 cursor-not-allowed" : "hover:bg-canvas cursor-pointer"}`;
    nextBtn.disabled = meta.current_page === meta.last_page;
    nextBtn.innerHTML = `<svg class="w-3.5 h-3.5 text-ink" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>`;
    nextBtn.addEventListener("click", () => {
        if (meta.current_page < meta.last_page) changePage(meta.current_page + 1);
    });
    container.appendChild(nextBtn);
}

/**
 * Render các Filter Chips bộ lọc đang áp dụng dưới dạng dải chip
 */
function renderFilterChips() {
    const container = document.getElementById("filter-chips-container");
    const list = document.getElementById("filter-chips-list");
    
    list.innerHTML = "";

    // Mảng lưu trữ các chip cần render
    const activeChips = [];

    // Chi tiết ánh xạ nhãn tiếng Việt
    const roleMapping = { learner: "Học viên", instructor: "Giảng viên", admin: "Quản trị viên" };
    const statusMapping = { active: "Đang hoạt động", inactive: "Không hoạt động", locked: "Đã khóa" };

    if (pageState.search) {
        activeChips.push({ key: "search", label: `Từ khóa: "${pageState.search}"` });
    }
    if (pageState.role) {
        activeChips.push({ key: "role", label: `Vai trò: ${roleMapping[pageState.role] || pageState.role}` });
    }
    if (pageState.status) {
        activeChips.push({ key: "status", label: `Trạng thái: ${statusMapping[pageState.status] || pageState.status}` });
    }
    if (pageState.email_verified) {
        const verifiedText = pageState.email_verified === "verified" ? "Đã xác minh" : "Chưa xác minh";
        activeChips.push({ key: "email_verified", label: `Email: ${verifiedText}` });
    }
    if (pageState.no_login) {
        activeChips.push({ key: "no_login", label: "Chưa đăng nhập lần nào" });
    }
    if (pageState.date_from) {
        activeChips.push({ key: "date_from", label: `Từ ngày: ${pageState.date_from}` });
    }
    if (pageState.date_to) {
        activeChips.push({ key: "date_to", label: `Đến ngày: ${pageState.date_to}` });
    }

    if (activeChips.length === 0) {
        container.classList.add("hidden");
        return;
    }

    // Hiển thị chip container
    container.classList.remove("hidden");

    // Tạo các phần tử chip
    activeChips.forEach(chip => {
        const chipDiv = document.createElement("div");
        chipDiv.className = "flex items-center gap-1 bg-canvas hover:bg-hairline text-ink rounded-full px-3 py-1 font-medium border border-hairline transition-colors text-[10px]";
        
        chipDiv.innerHTML = `
            <span>${chip.label}</span>
            <button type="button" class="text-mid-gray hover:text-ink ml-1 p-0.5 rounded-full transition-colors cursor-pointer" aria-label="Xóa bộ lọc ${chip.label}">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;

        // Click nút X trên chip để xóa bộ lọc đó
        chipDiv.querySelector("button").addEventListener("click", () => {
            removeFilterField(chip.key);
        });

        list.appendChild(chipDiv);
    });
}

/**
 * Xóa một trường bộ lọc cụ thể và reload dữ liệu
 */
function removeFilterField(key) {
    pageState[key] = "";
    
    // Đồng bộ lại form input
    if (key === "search") {
        document.getElementById("filter-search").value = "";
    } else if (key === "role") {
        document.getElementById("filter-role").value = "";
    } else if (key === "status") {
        document.getElementById("filter-status").value = "";
    } else if (key === "email_verified") {
        document.getElementById("filter-verified").value = "";
    } else if (key === "date_from") {
        document.getElementById("filter-date-from").value = "";
    } else if (key === "date_to") {
        document.getElementById("filter-date-to").value = "";
    }

    pageState.page = 1; // Về trang 1
    writeStateToUrl();
    fetchAndRender();
}

/**
 * Chuyển trang phân trang
 */
function changePage(pageNumber) {
    pageState.page = pageNumber;
    writeStateToUrl();
    fetchAndRender();
}

/**
 * Khởi tạo sự kiện submit & reset filter form
 */
function initFilterEvents() {
    const form = document.getElementById("filter-form");
    const searchInput = document.getElementById("filter-search");
    const perPageSelect = document.getElementById("pag-per-page");
    const emptyResetBtn = document.getElementById("btn-empty-reset");
    const errorRetryBtn = document.getElementById("btn-error-retry");
    const clearAllChipsBtn = document.getElementById("btn-clear-all-chips");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        pageState.search = formData.get("search");
        pageState.role = formData.get("role");
        pageState.status = formData.get("status");
        pageState.email_verified = formData.get("email_verified");
        pageState.sort_by = formData.get("sort_by");
        pageState.date_from = formData.get("date_from");
        pageState.date_to = formData.get("date_to");
        pageState.no_login = ""; // Reset trạng thái no_login khi submit form lọc chung
        pageState.page = 1;

        writeStateToUrl();
        fetchAndRender();
    });

    document.getElementById("btn-reset-filters").addEventListener("click", () => {
        form.reset();
        // Đồng bộ lại Custom Select sau khi form reset
        form.querySelectorAll("select[data-custom-select]").forEach(sel => {
            sel.value = sel.value;
        });
        pageState = {
            search: "",
            role: "",
            status: "",
            email_verified: "",
            date_from: "",
            date_to: "",
            sort_by: "newest",
            no_login: "",
            page: 1,
            per_page: pageState.per_page
        };
        writeStateToUrl();
        fetchAndRender();
    });

    // Xóa tất cả chips
    clearAllChipsBtn.addEventListener("click", () => {
        document.getElementById("btn-reset-filters").click();
    });

    // Debounce ô tìm kiếm
    let debounceTimer;
    searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            pageState.search = searchInput.value;
            pageState.no_login = "";
            pageState.page = 1;
            writeStateToUrl();
            fetchAndRender();
        }, 400);
    });

    perPageSelect.addEventListener("change", () => {
        pageState.per_page = parseInt(perPageSelect.value) || 20;
        pageState.page = 1;
        writeStateToUrl();
        fetchAndRender();
    });

    emptyResetBtn.addEventListener("click", () => {
        document.getElementById("btn-reset-filters").click();
    });

    errorRetryBtn.addEventListener("click", () => {
        fetchAndRender();
    });
}

/**
 * Đăng ký sự kiện click nút làm mới
 */
function initRefreshEvent() {
    const btnRefresh = document.getElementById("btn-refresh-data");
    const refreshIcon = document.getElementById("refresh-icon");

    btnRefresh.addEventListener("click", async () => {
        if (btnRefresh.disabled) return;

        // Xoay icon bằng CSS
        refreshRotation += 360;
        refreshIcon.style.transform = `rotate(${refreshRotation}deg)`;

        btnRefresh.disabled = true;
        btnRefresh.classList.add("opacity-50");

        try {
            await fetchAndRender();
            showToast({ type: "success", title: "Cập nhật thành công", message: "Đã làm mới dữ liệu hệ thống." });
        } catch (error) {
            showToast({ type: "error", title: "Lỗi", message: "Không thể làm mới dữ liệu." });
        } finally {
            btnRefresh.disabled = false;
            btnRefresh.classList.remove("opacity-50");
        }
    });
}

/**
 * Đăng ký click nút Xem danh sách ở Khu vực chú ý
 */
function initAttentionEvents() {
    const attentionButtons = document.querySelectorAll("[data-attention]");
    attentionButtons.forEach(btn => {
        btn.addEventListener("click", async () => {
            const type = btn.getAttribute("data-attention");
            
            // Xóa sạch các bộ lọc vai trò, ngày tạo
            pageState.role = "";
            pageState.date_from = "";
            pageState.date_to = "";
            document.getElementById("filter-role").value = "";
            document.getElementById("filter-date-from").value = "";
            document.getElementById("filter-date-to").value = "";

            if (type === "locked") {
                pageState.status = "locked";
                pageState.email_verified = "";
                pageState.no_login = "";
                
                document.getElementById("filter-status").value = "locked";
                document.getElementById("filter-verified").value = "";
            } else if (type === "unverified") {
                pageState.status = "";
                pageState.email_verified = "unverified";
                pageState.no_login = "";
                
                document.getElementById("filter-status").value = "";
                document.getElementById("filter-verified").value = "unverified";
            } else if (type === "no_login") {
                pageState.status = "";
                pageState.email_verified = "";
                pageState.no_login = "true";
                
                document.getElementById("filter-status").value = "";
                document.getElementById("filter-verified").value = "";
            }

            pageState.page = 1;
            writeStateToUrl();
            await fetchAndRender();

            // Cuộn mượt đến bảng danh sách người dùng sau khi dữ liệu render xong
            document.getElementById("users-list-section")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
}

/**
 * Đăng ký click Quick Tabs (Lọc nhanh)
 */
function initQuickTabsEvents() {
    const tabs = document.querySelectorAll("[data-tab]");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const tabType = tab.getAttribute("data-tab");
            
            // Reset các trường lọc no_login
            pageState.no_login = "";

            if (tabType === "all") {
                pageState.role = "";
                pageState.status = "";
                pageState.email_verified = "";
            } else if (tabType === "learner") {
                pageState.role = "learner";
                pageState.status = "";
                pageState.email_verified = "";
            } else if (tabType === "instructor") {
                pageState.role = "instructor";
                pageState.status = "";
                pageState.email_verified = "";
            } else if (tabType === "locked") {
                pageState.role = "";
                pageState.status = "locked";
                pageState.email_verified = "";
            } else if (tabType === "unverified") {
                pageState.role = "";
                pageState.status = "";
                pageState.email_verified = "unverified";
            }

            // Đồng bộ ngược lại các select input của bộ lọc
            document.getElementById("filter-role").value = pageState.role;
            document.getElementById("filter-status").value = pageState.status;
            document.getElementById("filter-verified").value = pageState.email_verified;

            pageState.page = 1;
            writeStateToUrl();
            fetchAndRender();
        });
    });
}

/**
 * Đóng dropdown khi click ngoài
 */
function initDropdownAutoClose() {
    document.addEventListener("click", () => {
        document.querySelectorAll(".action-dropdown").forEach(d => d.classList.add("hidden"));
    });
}

/**
 * Xử lý checkbox chọn dòng và Bulk Actions
 */
function initBulkActionEvents() {
    const checkAll = document.getElementById("check-all-users");
    const btnDeselect = document.getElementById("btn-bulk-deselect");

    // Chọn tất cả dòng hiển thị trên trang hiện tại
    if (checkAll) {
        checkAll.addEventListener("change", () => {
            // Chỉ lấy các checkbox không bị disabled (không phải Admin login)
            const rowCheckboxes = document.querySelectorAll("#users-table-body input[data-user-checkbox]");
            
            rowCheckboxes.forEach(cb => {
                if (cb.disabled) return;
                cb.checked = checkAll.checked;
                const userId = parseInt(cb.getAttribute("data-user-checkbox"));
                
                if (checkAll.checked) {
                    selectedUserIds.add(userId);
                } else {
                    selectedUserIds.delete(userId);
                }
            });

            updateBulkActionsBar();
        });
    }

    // Nút Bỏ chọn hàng loạt
    if (btnDeselect) {
        btnDeselect.addEventListener("click", () => {
            clearSelection();
        });
    }
}

/**
 * Xóa sạch lựa chọn checkbox hiện tại
 */
function clearSelection() {
    selectedUserIds.clear();
    const checkAll = document.getElementById("check-all-users");
    if (checkAll) checkAll.checked = false;

    const rowCheckboxes = document.querySelectorAll("#users-table-body input[data-user-checkbox]");
    rowCheckboxes.forEach(cb => cb.checked = false);

    updateBulkActionsBar();
}

/**
 * Cập nhật hiển thị thanh Bulk Actions bar và đồng bộ checkbox header
 */
function updateBulkActionsBar() {
    const bar = document.getElementById("bulk-actions-bar");
    const countEl = document.getElementById("bulk-selected-count");

    const selectedCount = selectedUserIds.size;

    if (selectedCount > 0) {
        bar.classList.remove("hidden");
        bar.classList.add("flex");
        if (countEl) countEl.textContent = selectedCount;
    } else {
        bar.classList.add("hidden");
        bar.classList.remove("flex");
    }

    updateCheckAllState();
}

/**
 * Kiểm tra và cập nhật trạng thái tích chọn của checkbox "Chọn tất cả" ở header
 */
function updateCheckAllState() {
    const checkAll = document.getElementById("check-all-users");
    if (!checkAll) return;

    const rowCheckboxes = document.querySelectorAll("#users-table-body input[data-user-checkbox]:not(:disabled)");
    
    if (rowCheckboxes.length === 0) {
        checkAll.checked = false;
        checkAll.disabled = true;
        return;
    }

    checkAll.disabled = false;
    // Tích nếu tất cả các checkbox dòng khả dụng đều đang tích
    const allChecked = Array.from(rowCheckboxes).every(cb => cb.checked);
    checkAll.checked = allChecked;
}

/**
 * Điều hướng hành động từ bảng / dropdown thao tác
 */
function handleUserAction(action, user) {
    activeTargetUser = user;
    
    if (action === "view") {
        openDetailDrawer(user.id);
    } else if (action === "edit") {
        openEditModal(user.id);
    } else if (action === "lock") {
        openLockModal(user);
    } else if (action === "unlock") {
        openGeneralActionModal(
            "Mở khóa tài khoản", 
            `Bạn có chắc chắn muốn mở khóa cho tài khoản <strong>${user.full_name}</strong> (${user.email})? Người dùng này sẽ đăng nhập bình thường.`,
            async () => {
                const response = await usersApi.updateUser(user.id, { locked: false });
                return response;
            }
        );
    } else if (action === "deactivate") {
        openGeneralActionModal(
            "Vô hiệu hóa tài khoản", 
            `Bạn có chắc muốn chuyển trạng thái tài khoản <strong>${user.full_name}</strong> thành <strong>Không hoạt động</strong>?`,
            async () => {
                const response = await usersApi.updateUser(user.id, { status: "inactive" });
                return response;
            }
        );
    } else if (action === "activate") {
        openGeneralActionModal(
            "Kích hoạt tài khoản", 
            `Bạn có chắc muốn kích hoạt tài khoản <strong>${user.full_name}</strong> hoạt động trở lại?`,
            async () => {
                const response = await usersApi.updateUser(user.id, { status: "active" });
                return response;
            }
        );
    } else if (action === "delete") {
        openDeleteModal(user);
    }
}

/**
 * Khởi tạo các sự kiện mở/đóng Modal & submit forms
 */
function initModalEvents() {
    const openCreateBtn = document.getElementById("btn-open-create-modal");
    
    openCreateBtn.addEventListener("click", () => {
        clearFormErrors("create-user-form");
        document.getElementById("create-user-form").reset();
        document.getElementById("create-lock-reason-wrapper").classList.add("hidden");
        openModalEl("create-user-modal");
    });

    const createStatusSelect = document.getElementById("create-status");
    const createLockWrapper = document.getElementById("create-lock-reason-wrapper");
    createStatusSelect.addEventListener("change", () => {
        if (createStatusSelect.value === "locked") {
            createLockWrapper.classList.remove("hidden");
        } else {
            createLockWrapper.classList.add("hidden");
        }
    });

    const editStatusSelect = document.getElementById("edit-status");
    const editLockWrapper = document.getElementById("edit-lock-reason-wrapper");
    editStatusSelect.addEventListener("change", () => {
        if (editStatusSelect.value === "locked") {
            editLockWrapper.classList.remove("hidden");
        } else {
            editLockWrapper.classList.add("hidden");
        }
    });

    const closeButtons = document.querySelectorAll("[data-close-modal]");
    closeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const modalId = btn.getAttribute("data-close-modal");
            closeModalEl(modalId);
        });
    });

    // Submit Thêm người dùng
    const btnSubmitCreate = document.getElementById("btn-submit-create");
    btnSubmitCreate.addEventListener("click", async () => {
        if (btnSubmitCreate.disabled) return;
        setButtonLoading(btnSubmitCreate, true, "Đang xử lý...");

        clearFormErrors("create-user-form");
        const form = document.getElementById("create-user-form");
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        try {
            const response = await usersApi.createUser(payload);
            setButtonLoading(btnSubmitCreate, false, "Thêm mới");
            
            if (response.success) {
                closeModalEl("create-user-modal");
                showToast({ type: "success", title: "Thành công", message: "Đã thêm người dùng mới thành công." });
                fetchAndRender();
            } else {
                if (response.error_code === 422) {
                    showFormErrors("create-user-form", response.errors);
                } else {
                    showToast({ type: "error", title: "Thất bại", message: response.message });
                }
            }
        } catch (error) {
            setButtonLoading(btnSubmitCreate, false, "Thêm mới");
            showToast({ type: "error", title: "Lỗi hệ thống", message: "Đã có lỗi hệ thống xảy ra." });
        }
    });

    // Submit Chỉnh sửa người dùng
    const btnSubmitEdit = document.getElementById("btn-submit-edit");
    btnSubmitEdit.addEventListener("click", async () => {
        if (btnSubmitEdit.disabled) return;
        setButtonLoading(btnSubmitEdit, true, "Đang lưu...");

        clearFormErrors("edit-user-form");
        const form = document.getElementById("edit-user-form");
        const userId = document.getElementById("edit-user-id").value;
        const formData = new FormData(form);
        
        const payload = {};
        formData.forEach((value, key) => {
            if (key === "password" && value.trim() === "") return;
            payload[key] = value;
        });

        try {
            const response = await usersApi.updateUser(userId, payload);
            setButtonLoading(btnSubmitEdit, false, "Lưu thay đổi");

            if (response.success) {
                closeModalEl("edit-user-modal");
                showToast({ type: "success", title: "Thành công", message: "Cập nhật thông tin người dùng thành công." });
                
                const drawer = document.getElementById("user-detail-drawer");
                if (!drawer.classList.contains("translate-x-full") && activeTargetUser && activeTargetUser.id === parseInt(userId)) {
                    openDetailDrawer(userId);
                }

                fetchAndRender();
            } else {
                if (response.error_code === 422) {
                    showFormErrors("edit-user-form", response.errors);
                } else {
                    showToast({ type: "error", title: "Thất bại", message: response.message });
                }
            }
        } catch (error) {
            setButtonLoading(btnSubmitEdit, false, "Lưu thay đổi");
            showToast({ type: "error", title: "Lỗi hệ thống", message: "Đã có lỗi hệ thống xảy ra." });
        }
    });
}

/**
 * Cài đặt các sự kiện xác nhận hành động (Xóa, Khóa, Action chung)
 */
function initActionEvents() {
    const btnSubmitLock = document.getElementById("btn-submit-lock");
    const lockReasonInput = document.getElementById("lock-reason-input");
    const errorLockInput = document.getElementById("error-lock-reason-input");

    // Xác nhận Khóa tài khoản
    btnSubmitLock.addEventListener("click", async () => {
        const reason = lockReasonInput.value.trim();
        if (reason === "") {
            lockReasonInput.classList.add("border-danger-brick");
            errorLockInput.textContent = "Vui lòng nhập lý do khóa tài khoản.";
            errorLockInput.classList.remove("hidden");
            return;
        }

        if (btnSubmitLock.disabled) return;
        setButtonLoading(btnSubmitLock, true, "Đang khóa...");

        try {
            const response = await usersApi.updateUser(activeTargetUser.id, {
                status: "locked",
                locked: true,
                locked_reason: reason
            });

            setButtonLoading(btnSubmitLock, false, "Xác nhận khóa");
            closeModalEl("confirm-lock-modal");

            if (response.success) {
                showToast({ type: "success", title: "Thành công", message: `Đã khóa tài khoản ${activeTargetUser.full_name}.` });
                
                const drawer = document.getElementById("user-detail-drawer");
                if (!drawer.classList.contains("translate-x-full")) {
                    openDetailDrawer(activeTargetUser.id);
                }
                
                fetchAndRender();
            } else {
                showToast({ type: "error", title: "Thất bại", message: response.message });
            }
        } catch (error) {
            setButtonLoading(btnSubmitLock, false, "Xác nhận khóa");
            showToast({ type: "error", title: "Lỗi hệ thống", message: "Lỗi khi cập nhật trạng thái khóa." });
        }
    });

    // Xác nhận Action chung
    const btnSubmitGeneral = document.getElementById("btn-submit-general");
    btnSubmitGeneral.addEventListener("click", async () => {
        if (!generalActionCallback) return;
        if (btnSubmitGeneral.disabled) return;

        setButtonLoading(btnSubmitGeneral, true, "Đang xử lý...");

        try {
            const response = await generalActionCallback();
            setButtonLoading(btnSubmitGeneral, false, "Xác nhận");
            closeModalEl("confirm-general-modal");

            if (response.success) {
                showToast({ type: "success", title: "Thành công", message: response.message || "Đã cập nhật trạng thái thành công." });
                
                const drawer = document.getElementById("user-detail-drawer");
                if (!drawer.classList.contains("translate-x-full")) {
                    openDetailDrawer(activeTargetUser.id);
                }
                
                fetchAndRender();
            } else {
                showToast({ type: "error", title: "Thất bại", message: response.message });
            }
        } catch (error) {
            setButtonLoading(btnSubmitGeneral, false, "Xác nhận");
            showToast({ type: "error", title: "Lỗi", message: "Đã có lỗi hệ thống khi thay đổi trạng thái." });
        }
    });

    // Xác nhận Xóa người dùng (Xóa mềm)
    const btnSubmitDelete = document.getElementById("btn-submit-delete");
    btnSubmitDelete.addEventListener("click", async () => {
        if (btnSubmitDelete.disabled) return;
        setButtonLoading(btnSubmitDelete, true, "Đang xóa...");

        try {
            const response = await usersApi.deleteUser(activeTargetUser.id);
            setButtonLoading(btnSubmitDelete, false, "Xác nhận xóa");
            closeModalEl("confirm-delete-modal");

            if (response.success) {
                showToast({ type: "success", title: "Thành công", message: `Đã xóa tài khoản ${activeTargetUser.full_name} khỏi hệ thống.` });
                
                const drawer = document.getElementById("user-detail-drawer");
                if (!drawer.classList.contains("translate-x-full")) {
                    closeDetailDrawer();
                }

                fetchAndRender();
            } else {
                showToast({ type: "error", title: "Thất bại", message: response.message });
            }
        } catch (error) {
            setButtonLoading(btnSubmitDelete, false, "Xác nhận xóa");
            showToast({ type: "error", title: "Lỗi", message: "Đã xảy ra lỗi khi thực hiện xóa người dùng." });
        }
    });
}

/**
 * Hiển thị lỗi validation lên các input fields tương ứng của form
 */
function showFormErrors(formId, fieldErrors) {
    const form = document.getElementById(formId);
    if (!form || !fieldErrors) return;

    Object.keys(fieldErrors).forEach(field => {
        const errorMsg = fieldErrors[field][0];
        const input = form.querySelector(`[name="${field}"]`);
        const errorEl = form.querySelector(`[data-error="${field}"]`);
        
        if (input) {
            input.classList.add("border-danger-brick");
        }
        if (errorEl) {
            errorEl.textContent = errorMsg;
            errorEl.classList.remove("hidden");
        }
    });
}

/**
 * Xóa sạch tất cả chỉ báo lỗi trên form
 */
function clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.querySelectorAll("input, select, textarea").forEach(el => {
        el.classList.remove("border-danger-brick");
    });
    form.querySelectorAll("[data-error]").forEach(el => {
        el.classList.add("hidden");
        el.textContent = "";
    });
}

/**
 * Thiết lập loading state cho button (chống click đúp)
 */
function setButtonLoading(button, isLoading, originalText = "") {
    button.disabled = isLoading;
    if (isLoading) {
        button.innerHTML = `
            <svg class="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>${originalText}</span>
        `;
        button.classList.add("opacity-85", "pointer-events-none");
    } else {
        button.innerHTML = originalText;
        button.classList.remove("opacity-85", "pointer-events-none");
    }
}

/**
 * Mở modal chung
 */
function openModalEl(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }
}

/**
 * Đóng modal chung
 */
function closeModalEl(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
}

/**
 * Mở Modal Khóa tài khoản
 */
function openLockModal(user) {
    document.getElementById("confirm-lock-name").textContent = user.full_name;
    document.getElementById("confirm-lock-email").textContent = user.email;
    
    const input = document.getElementById("lock-reason-input");
    const errorEl = document.getElementById("error-lock-reason-input");
    input.value = "";
    input.classList.remove("border-danger-brick");
    errorEl.classList.add("hidden");
    
    openModalEl("confirm-lock-modal");
}

/**
 * Mở Modal Xóa tài khoản
 */
function openDeleteModal(user) {
    document.getElementById("confirm-delete-name").textContent = `${user.full_name} (${user.email})`;
    openModalEl("confirm-delete-modal");
}

/**
 * Mở Modal xác nhận chung
 */
function openGeneralActionModal(title, message, callback) {
    document.getElementById("confirm-general-title").textContent = title;
    document.getElementById("confirm-general-message").innerHTML = message;
    generalActionCallback = callback;
    openModalEl("confirm-general-modal");
}

/**
 * Mở Modal Chỉnh sửa người dùng
 */
async function openEditModal(userId) {
    clearFormErrors("edit-user-form");
    
    try {
        const response = await usersApi.getUser(userId);
        if (!response.success) {
            showToast({ type: "error", title: "Không tìm thấy", message: response.message });
            return;
        }

        const user = response.data;
        activeTargetUser = user;

        document.getElementById("edit-user-id").value = user.id;
        document.getElementById("edit-name").value = user.full_name;
        document.getElementById("edit-email").value = user.email;
        document.getElementById("edit-password").value = "";
        document.getElementById("edit-phone").value = user.phone || "";
        document.getElementById("edit-role").value = user.role;
        document.getElementById("edit-status").value = user.status;

        const isSelf = user.id === CURRENT_ADMIN_ID;
        document.getElementById("edit-role").disabled = isSelf;
        document.getElementById("edit-status").disabled = isSelf;

        const isLocked = user.locked || user.status === "locked";
        const editLockWrapper = document.getElementById("edit-lock-reason-wrapper");
        const editLockReason = document.getElementById("edit-lock-reason");

        if (isLocked) {
            editLockWrapper.classList.remove("hidden");
            editLockReason.value = user.locked_reason || "";
        } else {
            editLockWrapper.classList.add("hidden");
            editLockReason.value = "";
        }

        openModalEl("edit-user-modal");
    } catch (error) {
        showToast({ type: "error", title: "Lỗi", message: "Lỗi tải thông tin chi tiết người dùng." });
    }
}

/**
 * Mở Drawer Xem chi tiết từ bên phải
 */
async function openDetailDrawer(userId) {
    try {
        const response = await usersApi.getUser(userId);
        if (!response.success) {
            showToast({ type: "error", title: "Lỗi", message: response.message });
            return;
        }

        const user = response.data;
        activeTargetUser = user;

        document.getElementById("drawer-name").textContent = user.full_name;
        document.getElementById("drawer-email").textContent = user.email;
        
        const avatarEl = document.getElementById("drawer-avatar");
        avatarEl.textContent = user.full_name ? user.full_name.charAt(0).toUpperCase() : "U";

        const badgesContainer = document.getElementById("drawer-badges");
        badgesContainer.innerHTML = "";

        if (user.role === "admin") {
            badgesContainer.innerHTML += `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-ink text-white">Quản trị viên</span>`;
        } else if (user.role === "instructor") {
            badgesContainer.innerHTML += `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-success/10 text-success border border-success/20">Giảng viên</span>`;
        } else {
            badgesContainer.innerHTML += `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas text-mid-gray border border-hairline">Học viên</span>`;
        }

        const isLocked = user.locked || user.status === "locked" || user.effective_status === "locked";
        if (isLocked) {
            badgesContainer.innerHTML += `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-medium text-danger-brick bg-danger-brick-soft border border-danger-brick/10">Bị khóa</span>`;
        } else if (user.status === "inactive") {
            badgesContainer.innerHTML += `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-medium text-mid-gray bg-canvas border border-hairline">Không hoạt động</span>`;
        } else {
            badgesContainer.innerHTML += `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-medium text-success bg-success-soft border border-success/10">Đang hoạt động</span>`;
        }

        document.getElementById("drawer-info-name").textContent = user.full_name;
        document.getElementById("drawer-info-email").textContent = user.email;
        document.getElementById("drawer-info-phone").textContent = user.phone || "---";
        
        const roleMapping = { admin: "Quản trị viên", instructor: "Giảng viên", learner: "Học viên" };
        const statusMapping = { active: "Đang hoạt động", inactive: "Không hoạt động", locked: "Đã khóa" };
        
        document.getElementById("drawer-info-role").textContent = roleMapping[user.role] || user.role;
        document.getElementById("drawer-info-status").textContent = statusMapping[user.status] || user.status;
        document.getElementById("drawer-info-eff-status").textContent = isLocked ? "Bị khóa" : (statusMapping[user.status] || user.status);

        document.getElementById("drawer-info-oauth").textContent = user.oauth_account_login ? "Có (Google/Apple)" : "Không (Mật khẩu)";
        document.getElementById("drawer-info-verified").textContent = user.email_verified_at ? formatDateTime(user.email_verified_at) : "Chưa xác minh";
        document.getElementById("drawer-info-last-login").textContent = user.last_login_at ? formatDateTime(user.last_login_at) : "Chưa đăng nhập";
        document.getElementById("drawer-info-created").textContent = formatDateTime(user.created_at);
        document.getElementById("drawer-info-updated").textContent = formatDateTime(user.updated_at);

        const lockSection = document.getElementById("drawer-lock-section");
        if (isLocked) {
            lockSection.classList.remove("hidden");
            document.getElementById("drawer-info-lock-reason").textContent = user.locked_reason || "Không có lý do được ghi nhận.";
        } else {
            lockSection.classList.add("hidden");
        }

        renderDrawerActions(user);

        const overlay = document.getElementById("drawer-overlay");
        const drawer = document.getElementById("user-detail-drawer");
        
        overlay.classList.remove("hidden");
        drawer.classList.remove("hidden");
        
        setTimeout(() => {
            overlay.classList.remove("opacity-0", "pointer-events-none");
            overlay.classList.add("opacity-100");
            
            drawer.classList.remove("translate-x-full");
            drawer.classList.add("translate-x-0");
        }, 10);

    } catch (error) {
        showToast({ type: "error", title: "Lỗi", message: "Đã xảy ra lỗi khi mở drawer chi tiết." });
    }
}

/**
 * Render chân nút Drawer
 */
function renderDrawerActions(user) {
    const container = document.getElementById("drawer-actions");
    container.innerHTML = "";

    const isSelf = user.id === CURRENT_ADMIN_ID;
    const isLocked = user.locked || user.status === "locked";

    const executeActionFromDrawer = async (actionFn) => {
        await closeDetailDrawer();
        actionFn();
    };

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "px-4 py-1.5 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer";
    editBtn.textContent = "Chỉnh sửa";
    editBtn.addEventListener("click", () => executeActionFromDrawer(() => openEditModal(user.id)));
    container.appendChild(editBtn);

    if (!isSelf) {
        const lockBtn = document.createElement("button");
        lockBtn.type = "button";
        if (isLocked) {
            lockBtn.className = "px-4 py-1.5 text-xs font-semibold rounded-full bg-success/15 text-success border border-success/20 hover:bg-success/20 transition-colors cursor-pointer";
            lockBtn.textContent = "Mở khóa";
            lockBtn.addEventListener("click", () => executeActionFromDrawer(() => handleUserAction("unlock", user)));
        } else {
            lockBtn.className = "px-4 py-1.5 text-xs font-semibold rounded-full bg-danger-brick-soft text-danger-brick border border-danger-brick/10 hover:bg-danger-brick/20 transition-colors cursor-pointer";
            lockBtn.textContent = "Khóa tài khoản";
            lockBtn.addEventListener("click", () => executeActionFromDrawer(() => handleUserAction("lock", user)));
        }
        container.appendChild(lockBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "px-4 py-1.5 text-xs font-semibold rounded-full bg-red-50 text-danger-brick border border-danger-brick/10 hover:bg-danger-brick/10 transition-colors cursor-pointer";
        deleteBtn.textContent = "Xóa";
        deleteBtn.addEventListener("click", () => handleUserAction("delete", user));
        container.appendChild(deleteBtn);
    }
}

/**
 * Đóng Drawer xem chi tiết
 */
function closeDetailDrawer() {
    const overlay = document.getElementById("drawer-overlay");
    const drawer = document.getElementById("user-detail-drawer");
    
    if (drawer.classList.contains("translate-x-full")) return;

    overlay.classList.remove("opacity-100");
    overlay.classList.add("opacity-0", "pointer-events-none");
    
    drawer.classList.remove("translate-x-0");
    drawer.classList.add("translate-x-full");

    setTimeout(() => {
        overlay.classList.add("hidden");
        drawer.classList.add("hidden");
    }, 300);
}

/**
 * Gắn sự kiện đóng Drawer
 */
function initActionEventsForDrawer() {
    const overlay = document.getElementById("drawer-overlay");
    const closeBtn = document.getElementById("btn-close-drawer");

    overlay.addEventListener("click", closeDetailDrawer);
    closeBtn.addEventListener("click", closeDetailDrawer);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeDetailDrawer();
            closeModalEl("create-user-modal");
            closeModalEl("edit-user-modal");
            closeModalEl("confirm-lock-modal");
            closeModalEl("confirm-general-modal");
            closeModalEl("confirm-delete-modal");
        }
    });
}

initActionEventsForDrawer();
