import * as categoriesApi from "../api/categories-api.js";
import { showToast } from "../toast.js";

// Trạng thái hiện tại của trang
let pageState = {
    search: "",
    status: "",
    type: "",
    parent_id: "",
    sort_by: "newest",
    page: 1,
    per_page: 20
};

// Lưu toàn bộ danh sách để phục vụ kiểm tra con cháu và nạp dropdown
let cachedAllCategories = [];

// Đối tượng danh mục đang thao tác
let activeCategory = null;

// Biến debounce cho ô tìm kiếm
let searchTimeout = null;

document.addEventListener("DOMContentLoaded", () => {
    console.log("Đã tải trang: Quản lý danh mục (Script logic)");

    // Đọc bộ lọc từ URL
    readStateFromUrl();

    // Khởi tạo các sự kiện giao diện
    initFilterEvents();
    initModalEvents();
    initActionEvents();
    initSortOrderInputEvents();

    // Tải dữ liệu ban đầu
    fetchAndRender();
});

/**
 * Đọc query params từ URL để thiết lập bộ lọc
 */
function readStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    
    pageState.search = params.get("search") || "";
    pageState.status = params.get("status") || "";
    pageState.type = params.get("type") || "";
    pageState.parent_id = params.get("parent_id") || "";
    pageState.sort_by = params.get("sort_by") || "newest";
    pageState.page = parseInt(params.get("page")) || 1;
    pageState.per_page = parseInt(params.get("per_page")) || 20;

    // Cập nhật giá trị hiển thị trên các input lọc
    document.getElementById("filter-search").value = pageState.search;
    document.getElementById("filter-status").value = pageState.status;
    document.getElementById("filter-type").value = pageState.type;
    document.getElementById("filter-parent").value = pageState.parent_id;
    document.getElementById("filter-sort").value = pageState.sort_by;
    document.getElementById("pag-per-page").value = pageState.per_page;
}

/**
 * Cập nhật query string trên URL dựa trên pageState
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
 * Hiện thị / Ẩn skeletons khi load dữ liệu
 */
function toggleLoading(isLoading) {
    const kpiLoaded = document.getElementById("kpi-content-wrapper");
    const kpiLoading = document.getElementById("kpi-loading-wrapper");
    const tableBody = document.getElementById("categories-table-body");
    const tableLoading = document.getElementById("categories-loading-state");
    const tableEmpty = document.getElementById("categories-empty-state");
    const tableFilterEmpty = document.getElementById("categories-filter-empty-state");
    const tableError = document.getElementById("categories-error-state");
    const pagination = document.getElementById("pagination-wrapper");

    // Khóa các ô lọc khi đang tải dữ liệu
    const filterInputs = document.querySelectorAll("#filter-form input, #filter-form select, #filter-form button");
    filterInputs.forEach(input => {
        input.disabled = isLoading;
    });

    if (isLoading) {
        kpiLoaded.classList.add("hidden");
        kpiLoading.classList.remove("hidden");
        
        tableBody.innerHTML = "";
        tableLoading.classList.remove("hidden");
        tableEmpty.classList.add("hidden");
        tableFilterEmpty.classList.add("hidden");
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
 * Tải toàn bộ danh mục (không phân trang) để làm cache
 */
async function fetchAllCategoriesForCache() {
    try {
        const response = await categoriesApi.getCategories({ page: 1, per_page: 99999, status: "all_with_deleted" });
        if (response && response.success) {
            cachedAllCategories = response.data.items || [];
            // Nạp dropdown lọc danh mục cha dựa trên các danh mục gốc chưa bị xóa
            populateParentFilterOptions(cachedAllCategories);
        }
    } catch (error) {
        console.error("Lỗi tải cache danh mục:", error);
    }
}

/**
 * Fetch danh sách danh mục từ API và kết xuất lên giao diện
 */
async function fetchAndRender() {
    toggleLoading(true);

    try {
        // Tải toàn bộ danh mục làm cache trước để kiểm tra quan hệ cha con chính xác
        await fetchAllCategoriesForCache();

        const response = await categoriesApi.getCategories(pageState);
        
        if (!response || !response.success) {
            showErrorState(response ? response.message : "Đã xảy ra lỗi không xác định.");
            return;
        }

        // Cập nhật thống kê, danh sách lọc và bảng dữ liệu
        renderSummary(response.data.summary);
        
        // Render bảng danh mục
        renderTable(response.data.items);
        
        // Render phân trang
        renderPagination(response.meta);
        
        // Render chips bộ lọc hoạt động
        renderFilterChips();

        toggleLoading(false);
    } catch (error) {
        console.error("Lỗi fetch categories:", error);
        showErrorState("Không thể kết nối đến máy chủ dữ liệu.");
    }
}

/**
 * Hiển thị giao diện lỗi
 */
function showErrorState(message) {
    toggleLoading(false);
    document.getElementById("kpi-content-wrapper").classList.remove("hidden");
    document.getElementById("kpi-loading-wrapper").classList.add("hidden");
    
    document.getElementById("categories-table-body").innerHTML = "";
    document.getElementById("categories-loading-state").classList.add("hidden");
    document.getElementById("categories-empty-state").classList.add("hidden");
    document.getElementById("categories-filter-empty-state").classList.add("hidden");
    
    const errorState = document.getElementById("categories-error-state");
    errorState.classList.remove("hidden");
    
    const desc = errorState.querySelector("p");
    if (desc) desc.textContent = message || "Đã xảy ra lỗi khi kết nối dữ liệu. Vui lòng thử lại.";
}

/**
 * Render chỉ số thống kê
 */
function renderSummary(summary) {
    if (!summary) return;

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = new Intl.NumberFormat("vi-VN").format(val || 0);
    };

    setVal("kpi-total-categories", summary.total_categories);
    setVal("kpi-active-categories", summary.active_categories);
    setVal("kpi-inactive-categories", summary.inactive_categories);
    setVal("kpi-root-categories", summary.root_categories);
    setVal("kpi-empty-categories", summary.empty_categories);

    setVal("title-total-categories", summary.total_categories);
}

/**
 * Nạp danh mục cha vào các phần tử chọn
 */
function populateParentFilterOptions(categories) {
    const parentSelect = document.getElementById("filter-parent");
    if (!parentSelect) return;

    const currentVal = parentSelect.value;
    
    // Chỉ lấy các danh mục gốc chưa bị xóa làm cha để hiển thị đơn giản
    const rootCats = categories.filter(c => c.parent_id === null && c.deleted_at === null);

    let html = '<option value="">Tất cả cha</option>';
    rootCats.forEach(c => {
        html += `<option value="${c.id}" ${currentVal === String(c.id) ? "selected" : ""}>${c.name}</option>`;
    });

    parentSelect.innerHTML = html;

    // Tự động khởi tạo lại Custom Select nếu thư viện có hỗ trợ
    if (typeof window.initAllCustomSelects === "function") {
        window.initAllCustomSelects();
    }
}

/**
 * Render bảng danh sách
 */
function renderTable(items) {
    window.currentRenderedItems = items || [];
    const tableBody = document.getElementById("categories-table-body");
    const emptyState = document.getElementById("categories-empty-state");
    const filterEmptyState = document.getElementById("categories-filter-empty-state");

    if (items.length === 0) {
        if (pageState.search || pageState.status || pageState.type || pageState.parent_id) {
            filterEmptyState.classList.remove("hidden");
        } else {
            emptyState.classList.remove("hidden");
        }
        tableBody.innerHTML = "";
        return;
    }

    emptyState.classList.add("hidden");
    filterEmptyState.classList.add("hidden");

    let html = "";
    items.forEach(c => {
        const isChild = c.parent_id !== null;
        const indentClass = isChild ? "pl-8" : "pl-4";
        const indentIcon = isChild ? '<span class="text-mid-gray/40 font-mono mr-1.5 select-none">└──</span>' : '';
        
        // Parent Badge
        let parentBadge = `<span class="px-2 py-0.5 rounded-[6px] bg-canvas text-mid-gray border border-hairline font-semibold text-[10px] font-sans">Danh mục gốc</span>`;
        if (c.parent) {
            parentBadge = `<span class="font-medium text-ink">${escapeHTML(c.parent.name)}</span>`;
        }

        // Status Badge
        const isDeleted = c.deleted_at !== null;
        let statusBadge = "";
        if (isDeleted) {
            statusBadge = `
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium text-danger-brick bg-danger-brick/10 border border-danger-brick/20 select-none">
                    <span class="h-1.5 w-1.5 rounded-full bg-danger-brick"></span>Đã xóa
                </span>
            `;
        } else if (c.status === "active") {
            statusBadge = `
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium text-success bg-success-soft border border-success/15 select-none">
                    <span class="h-1.5 w-1.5 rounded-full bg-success"></span>Đang hoạt động
                </span>
            `;
        } else {
            statusBadge = `
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium text-mid-gray bg-canvas border border-hairline select-none">
                    <span class="h-1.5 w-1.5 rounded-full bg-mid-gray"></span>Ngừng hoạt động
                </span>
            `;
        }

        // Định dạng ngày cập nhật
        const dateObj = new Date(c.updated_at || c.created_at);
        const dateStr = isNaN(dateObj.getTime()) ? "---" : `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

        // Cột Khóa học
        const coursesCol = `
            <a href="courses.html?category_id=${c.id}" class="hover:text-ink font-bold text-mid-gray hover:underline">
                ${c.course_count || 0}
            </a>
        `;

        html += `
        <tr class="hover:bg-canvas/50 transition-colors border-b border-hairline/60 ${isDeleted ? 'opacity-75 bg-canvas/30' : ''}" data-id="${c.id}">
            <td class="${indentClass} py-2.5 font-bold text-ink select-text">
                <div class="flex items-center">
                    ${indentIcon}
                    <span class="truncate max-w-[180px]">${escapeHTML(c.name)}</span>
                </div>
            </td>
            <td class="px-3 py-2.5 whitespace-nowrap text-mid-gray select-text">
                ${parentBadge}
            </td>
            <td class="px-3 py-2.5 whitespace-nowrap font-mono text-[11px] text-ink select-text">
                <div class="flex items-center gap-1.5">
                    <span class="truncate max-w-[120px] bg-canvas/60 px-1.5 py-0.5 rounded border border-hairline">${escapeHTML(c.slug)}</span>
                    <button type="button" class="btn-copy-slug text-mid-gray hover:text-ink p-0.5 hover:bg-canvas rounded transition-colors cursor-pointer" data-slug="${escapeHTML(c.slug)}" title="Sao chép slug">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664"/>
                        </svg>
                    </button>
                </div>
            </td>
            <td class="px-3 py-2.5 text-center select-text">
                ${coursesCol}
            </td>
            <td class="px-3 py-2.5 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1.5">
                    <div title="Giá trị 0 nghĩa là chưa thiết lập ưu tiên và sẽ được xếp sau các danh mục đã có thứ tự." class="flex items-center h-8 border border-hairline rounded-[6px] bg-canvas overflow-hidden w-28 focus-within:border-ink transition-colors">
                        <button type="button" class="btn-sort-dec flex items-center justify-center w-7 h-full hover:bg-hairline text-mid-gray hover:text-ink transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed" data-id="${c.id}" ${isDeleted ? 'disabled' : ''}>
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
                            </svg>
                        </button>
                        <input type="text" value="${c.sort_order === 0 ? 'Chưa xếp' : c.sort_order}" data-id="${c.id}" data-old-value="${c.sort_order}" class="sort-order-input w-14 h-full text-center bg-transparent border-0 outline-none text-ink text-xs font-semibold focus:ring-0 focus:outline-none disabled:opacity-50 select-all" ${isDeleted ? 'disabled' : ''}>
                        <button type="button" class="btn-sort-inc flex items-center justify-center w-7 h-full hover:bg-hairline text-mid-gray hover:text-ink transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed" data-id="${c.id}" ${isDeleted ? 'disabled' : ''}>
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>
                    <div class="flex items-center gap-1 hidden sort-order-actions" data-id="${c.id}">
                        <button type="button" class="btn-sort-save p-1 rounded bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed" data-id="${c.id}" title="Lưu thay đổi">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </button>
                        <button type="button" class="btn-sort-cancel p-1 rounded border border-hairline hover:bg-canvas text-mid-gray hover:text-ink transition-colors cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed" data-id="${c.id}" title="Hủy bỏ">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </td>
            <td class="px-3 py-2.5 text-center">
                ${statusBadge}
            </td>
            <td class="px-3 py-2.5 whitespace-nowrap text-mid-gray text-xs">
                ${dateStr}
            </td>
            <td class="pr-4 py-2.5 text-right relative">
                <button type="button" class="btn-action-menu p-1 hover:bg-canvas rounded-full text-mid-gray hover:text-ink transition-colors cursor-pointer inline-block" data-id="${c.id}" aria-label="Xem menu thao tác">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"/>
                    </svg>
                </button>
            </td>
        </tr>`;
    });

    tableBody.innerHTML = html;
}

/**
 * Khởi tạo ẩn/hiện menu thao tác dropdown
 */
function initDropdownToggler() {
    const togglers = document.querySelectorAll(".btn-toggle-dropdown");
    
    togglers.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const parent = btn.closest(".dropdown-wrapper");
            const menu = parent.querySelector(".dropdown-menu");

            // Đóng các dropdown khác đang mở
            document.querySelectorAll(".dropdown-menu").forEach(m => {
                if (m !== menu) m.classList.add("hidden");
            });

            menu.classList.toggle("hidden");
        });
    });
}

/**
 * Click ra ngoài tự đóng các dropdown
 */
document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-menu").forEach(m => m.classList.add("hidden"));
});

/**
 * Render phân trang
 */
function renderPagination(meta) {
    if (!meta) return;

    const startEl = document.getElementById("table-range-start");
    const endEl = document.getElementById("table-range-end");
    const totalEl = document.getElementById("table-total-count");
    
    const total = meta.total || 0;
    const startRange = total > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0;
    const endRange = Math.min(total, meta.current_page * meta.per_page);

    startEl.textContent = startRange;
    endEl.textContent = endRange;
    totalEl.textContent = total;

    // Render nút trang trước và trang sau
    const prevBtn = document.getElementById("btn-pag-prev");
    const nextBtn = document.getElementById("btn-pag-next");

    prevBtn.disabled = meta.current_page === 1;
    nextBtn.disabled = meta.current_page === meta.last_page;

    // Render danh sách số trang
    const pagesContainer = document.getElementById("pagination-pages");
    let html = "";
    
    const startPage = Math.max(1, meta.current_page - 2);
    const endPage = Math.min(meta.last_page, meta.current_page + 2);

    if (startPage > 1) {
        html += `<button type="button" class="btn-page h-8 w-8 text-xs font-semibold rounded-[6px] border border-hairline hover:bg-canvas transition-colors cursor-pointer" data-page="1">1</button>`;
        if (startPage > 2) {
            html += `<span class="text-xs text-mid-gray px-1">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === meta.current_page;
        const activeClass = isActive 
            ? "bg-ink text-white font-bold border-ink" 
            : "bg-paper text-ink hover:bg-canvas border-hairline";
        html += `<button type="button" class="btn-page h-8 w-8 text-xs font-semibold rounded-[6px] border ${activeClass} transition-colors cursor-pointer" data-page="${i}">${i}</button>`;
    }

    if (endPage < meta.last_page) {
        if (endPage < meta.last_page - 1) {
            html += `<span class="text-xs text-mid-gray px-1">...</span>`;
        }
        html += `<button type="button" class="btn-page h-8 w-8 text-xs font-semibold rounded-[6px] border border-hairline hover:bg-canvas transition-colors cursor-pointer" data-page="${meta.last_page}">${meta.last_page}</button>`;
    }

    pagesContainer.innerHTML = html;

    // Sự kiện chuyển trang
    pagesContainer.querySelectorAll(".btn-page").forEach(btn => {
        btn.addEventListener("click", () => {
            pageState.page = parseInt(btn.getAttribute("data-page"));
            writeStateToUrl();
            fetchAndRender();
        });
    });
}

/**
 * Render chips lọc hiển thị
 */
function renderFilterChips() {
    const container = document.getElementById("filter-chips-container");
    if (!container) return;

    let chips = [];
    if (pageState.search) {
        chips.push({ key: "search", label: `Từ khóa: "${pageState.search}"` });
    }
    if (pageState.status) {
        let label = "Ngừng hoạt động";
        if (pageState.status === "active") label = "Đang hoạt động";
        else if (pageState.status === "deleted") label = "Đã xóa";
        chips.push({ key: "status", label: `Trạng thái: ${label}` });
    }
    if (pageState.type) {
        const label = pageState.type === "root" ? "Danh mục gốc" : "Danh mục con";
        chips.push({ key: "type", label: `Loại: ${label}` });
    }
    if (pageState.parent_id) {
        const parent = cachedAllCategories.find(c => c.id === Number(pageState.parent_id));
        const name = parent ? parent.name : pageState.parent_id;
        chips.push({ key: "parent_id", label: `Cha: ${name}` });
    }

    if (chips.length === 0) {
        container.classList.add("hidden");
        container.innerHTML = "";
        return;
    }

    container.classList.remove("hidden");
    let html = `<span class="text-[10px] font-semibold text-mid-gray uppercase tracking-wider mr-1">Đang lọc theo:</span>`;
    chips.forEach(chip => {
        html += `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-canvas border border-hairline text-ink">
            ${escapeHTML(chip.label)}
            <button type="button" class="btn-remove-chip hover:text-danger-brick cursor-pointer p-0.5" data-key="${chip.key}">
                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </span>`;
    });

    container.innerHTML = html;

    // Lắng nghe sự kiện click xóa chip
    container.querySelectorAll(".btn-remove-chip").forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.getAttribute("data-key");
            
            // Xóa state
            pageState[key] = "";
            pageState.page = 1;

            // Reset input tương ứng
            if (key === "search") document.getElementById("filter-search").value = "";
            if (key === "status") document.getElementById("filter-status").value = "";
            if (key === "type") document.getElementById("filter-type").value = "";
            if (key === "parent_id") document.getElementById("filter-parent").value = "";

            writeStateToUrl();
            fetchAndRender();
        });
    });
}

/**
 * Khởi tạo sự kiện của bộ lọc
 */
function initFilterEvents() {
    const searchInput = document.getElementById("filter-search");
    const statusSelect = document.getElementById("filter-status");
    const typeSelect = document.getElementById("filter-type");
    const parentSelect = document.getElementById("filter-parent");
    const sortSelect = document.getElementById("filter-sort");
    const resetBtn = document.getElementById("btn-reset-filters");
    const filterResetBtn = document.getElementById("btn-filter-reset");
    const retryBtn = document.getElementById("btn-retry-load");

    // Sự kiện tìm kiếm có Debounce
    searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            pageState.search = e.target.value.trim();
            pageState.page = 1;
            writeStateToUrl();
            fetchAndRender();
        }, 400);
    });

    // Các select thay đổi tự động lọc
    const handleSelectChange = (key, selectEl) => {
        selectEl.addEventListener("change", () => {
            pageState[key] = selectEl.value;
            pageState.page = 1;
            writeStateToUrl();
            fetchAndRender();
        });
    };

    handleSelectChange("status", statusSelect);
    handleSelectChange("type", typeSelect);
    handleSelectChange("parent_id", parentSelect);
    handleSelectChange("sort_by", sortSelect);

    // Thay đổi số dòng trên trang
    document.getElementById("pag-per-page").addEventListener("change", (e) => {
        pageState.per_page = parseInt(e.target.value);
        pageState.page = 1;
        writeStateToUrl();
        fetchAndRender();
    });

    // Trang trước/sau
    document.getElementById("btn-pag-prev").addEventListener("click", () => {
        if (pageState.page > 1) {
            pageState.page--;
            writeStateToUrl();
            fetchAndRender();
        }
    });
    document.getElementById("btn-pag-next").addEventListener("click", () => {
        pageState.page++;
        writeStateToUrl();
        fetchAndRender();
    });

    // Nút Đặt lại bộ lọc
    const resetAllFilters = () => {
        pageState = {
            search: "",
            status: "",
            type: "",
            parent_id: "",
            sort_by: "newest",
            page: 1,
            per_page: 20
        };

        searchInput.value = "";
        statusSelect.value = "";
        typeSelect.value = "";
        parentSelect.value = "";
        sortSelect.value = "newest";
        document.getElementById("pag-per-page").value = 20;

        writeStateToUrl();
        fetchAndRender();
    };

    resetBtn.addEventListener("click", resetAllFilters);
    if (filterResetBtn) filterResetBtn.addEventListener("click", resetAllFilters);
    if (retryBtn) retryBtn.addEventListener("click", fetchAndRender);

    // Refresh dữ liệu
    document.getElementById("btn-refresh-list").addEventListener("click", () => {
        const icon = document.getElementById("refresh-icon");
        icon.classList.add("rotate-180");
        setTimeout(() => icon.classList.remove("rotate-180"), 500);
        fetchAndRender();
    });
}

/**
 * Đóng menu thao tác nổi toàn cục
 */
function closeActionMenu() {
    const existing = document.getElementById("global-action-menu");
    if (existing) {
        existing.remove();
    }
}

/**
 * Mở menu thao tác nổi fixed theo vị trí nút ba chấm
 */
function openActionMenu(buttonEl, c) {
    closeActionMenu();

    const menu = document.createElement("div");
    menu.id = "global-action-menu";
    menu.className = "fixed z-50 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left transition-opacity duration-150 select-none";

    const isDeleted = c.deleted_at !== null;
    const hasChildren = cachedAllCategories.some(cat => cat.parent_id === c.id && cat.deleted_at === null);
    const canDelete = c.course_count === 0 && !hasChildren;

    let deleteTooltip = "";
    if (!canDelete) {
        if (c.course_count > 0 && hasChildren) {
            deleteTooltip = "Không thể xóa vì danh mục đang có danh mục con và khóa học.";
        } else if (c.course_count > 0) {
            deleteTooltip = "Không thể xóa vì danh mục đang có khóa học.";
        } else {
            deleteTooltip = "Không thể xóa vì danh mục đang có danh mục con.";
        }
    }

    if (isDeleted) {
        // Danh mục đã xóa: Xem chi tiết & Khôi phục
        menu.innerHTML = `
            <button type="button" class="btn-view-cat text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-[4px] transition-colors font-medium cursor-pointer flex items-center gap-1.5" data-id="${c.id}">
                <svg class="w-3.5 h-3.5 text-mid-gray" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
                Xem chi tiết
            </button>
            <button type="button" class="btn-restore-cat text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-[4px] transition-colors font-medium text-success cursor-pointer flex items-center gap-1.5" data-id="${c.id}">
                <svg class="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                </svg>
                Khôi phục
            </button>
        `;
    } else {
        let statusBtnHtml = "";
        let deleteBtnHtml = "";

        if (c.status === "active") {
            // Active: Ngừng hoạt động (Không hiển thị nút Xóa)
            statusBtnHtml = `
                <button type="button" class="btn-status-cat text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-[4px] transition-colors font-medium text-mid-gray cursor-pointer flex items-center gap-1.5" data-id="${c.id}" data-action="inactive">
                    <svg class="w-3.5 h-3.5 text-mid-gray" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Ngừng hoạt động
                </button>
            `;
        } else {
            // Inactive: Kích hoạt lại & Xóa danh mục
            statusBtnHtml = `
                <button type="button" class="btn-status-cat text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-[4px] transition-colors font-medium text-success cursor-pointer flex items-center gap-1.5" data-id="${c.id}" data-action="active">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    Kích hoạt lại
                </button>
            `;
            deleteBtnHtml = `
                <div class="h-[1px] bg-hairline my-1 mx-1"></div>
                <button type="button" class="btn-delete-cat text-left px-3 py-1.5 text-xs hover:bg-red-50 hover:text-danger-brick rounded-[4px] transition-colors font-semibold text-danger-brick flex items-center gap-1.5 disabled:opacity-40 disabled:bg-transparent disabled:text-mid-gray disabled:cursor-not-allowed cursor-pointer" data-id="${c.id}" ${!canDelete ? 'disabled' : ''} title="${deleteTooltip}">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    Xóa danh mục
                </button>
            `;
        }

        menu.innerHTML = `
            <button type="button" class="btn-view-cat text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-[4px] transition-colors font-medium cursor-pointer flex items-center gap-1.5" data-id="${c.id}">
                <svg class="w-3.5 h-3.5 text-mid-gray" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
                Xem chi tiết
            </button>
            <button type="button" class="btn-edit-cat text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-[4px] transition-colors font-medium cursor-pointer flex items-center gap-1.5" data-id="${c.id}">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
                Chỉnh sửa
            </button>
            ${statusBtnHtml}
            ${deleteBtnHtml}
        `;
    }

    document.body.appendChild(menu);

    const rect = buttonEl.getBoundingClientRect();
    const menuWidth = 160;
    
    menu.style.position = 'fixed';
    menu.style.width = `${menuWidth}px`;
    menu.style.visibility = 'hidden';
    menu.style.display = 'flex';
    
    const menuHeight = menu.offsetHeight;
    
    let top = rect.bottom + 4;
    let left = rect.right - menuWidth;
    
    if (rect.bottom + 4 + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 4;
    }
    
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.visibility = 'visible';

    // Xử lý click các button
    menu.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            closeActionMenu();
            const id = btn.getAttribute("data-id");
            if (btn.classList.contains("btn-view-cat")) {
                openDetailDrawer(id);
            } else if (btn.classList.contains("btn-edit-cat")) {
                openEditModal(id);
            } else if (btn.classList.contains("btn-status-cat")) {
                const action = btn.getAttribute("data-action");
                openConfirmStatusModal(id, action);
            } else if (btn.classList.contains("btn-delete-cat")) {
                openConfirmDeleteModal(id);
            } else if (btn.classList.contains("btn-restore-cat")) {
                const catId = Number(id);
                try {
                    const res = await categoriesApi.restoreCategory(catId);
                    if (res && res.success) {
                        await fetchAndRender();
                        showToast({
                            type: "success",
                            title: "Khôi phục thành công",
                            message: `Đã khôi phục danh mục “${escapeHTML(c.name)}”.`
                        });
                    } else {
                        showToast({
                            type: "error",
                            title: "Không thể khôi phục",
                            message: res ? res.message : "Đã xảy ra lỗi khi khôi phục danh mục."
                        });
                    }
                } catch (err) {
                    console.error("Lỗi khi khôi phục danh mục:", err);
                    showToast({ type: "error", title: "Lỗi kết nối", message: "Đã xảy ra lỗi khi kết nối dữ liệu." });
                }
            }
        });
    });
}

// Khởi tạo sự kiện đóng menu nổi toàn cục
document.addEventListener("click", (e) => {
    const menu = document.getElementById("global-action-menu");
    if (menu && !menu.contains(e.target) && !e.target.closest(".btn-action-menu")) {
        closeActionMenu();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeActionMenu();
    }
});

window.addEventListener("scroll", closeActionMenu, { passive: true });
document.addEventListener("scroll", closeActionMenu, { capture: true, passive: true });
window.addEventListener("resize", closeActionMenu);

function initActionEvents() {
    const tableBody = document.getElementById("categories-table-body");

    tableBody.addEventListener("click", async (e) => {
        // 1. Sao chép slug
        const btnCopy = e.target.closest(".btn-copy-slug");
        if (btnCopy) {
            e.stopPropagation();
            const slug = btnCopy.getAttribute("data-slug");
            try {
                await navigator.clipboard.writeText(slug);
                showToast({ type: "success", title: "Sao chép thành công", message: `Đã sao chép: ${slug}` });
            } catch (err) {
                console.error("Lỗi copy:", err);
                showToast({ type: "error", title: "Không thể sao chép", message: "Trình duyệt không hỗ trợ truy cập clipboard." });
            }
            return;
        }

        // 2. Mở menu thao tác nổi fixed
        const btnAction = e.target.closest(".btn-action-menu");
        if (btnAction) {
            e.stopPropagation();
            const id = Number(btnAction.getAttribute("data-id"));
            let category = cachedAllCategories.find(cat => Number(cat.id) === id);
            if (!category) {
                // Fallback nếu cache chưa có bản ghi
                category = (window.currentRenderedItems || []).find(cat => Number(cat.id) === id);
            }
            if (category) {
                openActionMenu(btnAction, category);
            }
            return;
        }
    });

    const btnEmptyCreate = document.getElementById("btn-empty-create");
    if (btnEmptyCreate) {
        btnEmptyCreate.addEventListener("click", () => {
            openCreateModal();
        });
    }
}

/**
 * Khởi tạo sự kiện của Sort Order Input
 */
function initSortOrderInputEvents() {
    const tableBody = document.getElementById("categories-table-body");

    function checkChanged(input, actions) {
        const oldVal = parseInt(input.getAttribute("data-old-value") || "0");
        const valStr = input.value.trim();
        const newVal = (valStr === "" || valStr.toLowerCase() === "chưa xếp") ? 0 : (parseInt(valStr) || 0);
        
        if (newVal !== oldVal) {
            actions.classList.remove("hidden");
        } else {
            actions.classList.add("hidden");
        }
    }

    function rollbackValue(input, actions) {
        const oldVal = parseInt(input.getAttribute("data-old-value") || "0");
        input.value = oldVal === 0 ? "Chưa xếp" : oldVal;
        if (actions) actions.classList.add("hidden");
    }

    tableBody.addEventListener("click", async (e) => {
        const decBtn = e.target.closest(".btn-sort-dec");
        const incBtn = e.target.closest(".btn-sort-inc");
        const saveBtn = e.target.closest(".btn-sort-save");
        const cancelBtn = e.target.closest(".btn-sort-cancel");

        if (decBtn) {
            e.stopPropagation();
            if (decBtn.disabled) return;
            const id = decBtn.getAttribute("data-id");
            const row = decBtn.closest("tr");
            const input = row.querySelector(`.sort-order-input[data-id="${id}"]`);
            const actions = row.querySelector(`.sort-order-actions[data-id="${id}"]`);

            const valStr = input.value.trim();
            let val = (valStr === "" || valStr.toLowerCase() === "chưa xếp") ? 0 : (parseInt(valStr) || 0);
            
            if (val > 1) {
                val--;
                input.value = val;
            } else if (val === 1) {
                val = 0;
                input.value = "Chưa xếp";
            }
            checkChanged(input, actions);
            return;
        }

        if (incBtn) {
            e.stopPropagation();
            if (incBtn.disabled) return;
            const id = incBtn.getAttribute("data-id");
            const row = incBtn.closest("tr");
            const input = row.querySelector(`.sort-order-input[data-id="${id}"]`);
            const actions = row.querySelector(`.sort-order-actions[data-id="${id}"]`);

            const valStr = input.value.trim();
            let val = (valStr === "" || valStr.toLowerCase() === "chưa xếp") ? 0 : (parseInt(valStr) || 0);
            
            val++;
            input.value = val;
            checkChanged(input, actions);
            return;
        }

        if (cancelBtn) {
            e.stopPropagation();
            if (cancelBtn.disabled) return;
            const id = cancelBtn.getAttribute("data-id");
            const row = cancelBtn.closest("tr");
            const input = row.querySelector(`.sort-order-input[data-id="${id}"]`);
            const actions = row.querySelector(`.sort-order-actions[data-id="${id}"]`);

            rollbackValue(input, actions);
            return;
        }

        if (saveBtn) {
            e.stopPropagation();
            if (saveBtn.disabled) return;
            const id = saveBtn.getAttribute("data-id");
            const row = saveBtn.closest("tr");
            const input = row.querySelector(`.sort-order-input[data-id="${id}"]`);
            const actions = row.querySelector(`.sort-order-actions[data-id="${id}"]`);
            const dec = row.querySelector(`.btn-sort-dec[data-id="${id}"]`);
            const inc = row.querySelector(`.btn-sort-inc[data-id="${id}"]`);
            const cancel = row.querySelector(`.btn-sort-cancel[data-id="${id}"]`);

            const valStr = input.value.trim();
            
            let val = 0;
            if (valStr !== "" && valStr.toLowerCase() !== "chưa xếp") {
                val = parseFloat(valStr);
                if (isNaN(val) || val < 0 || !Number.isInteger(val)) {
                    showToast({ type: "warning", title: "Giá trị không hợp lệ", message: "Thứ tự phải là số nguyên không âm hoặc 'Chưa xếp'." });
                    rollbackValue(input, actions);
                    return;
                }
            }

            // Đóng băng toàn bộ control
            input.disabled = true;
            dec.disabled = true;
            inc.disabled = true;
            saveBtn.disabled = true;
            cancel.disabled = true;

            try {
                const response = await categoriesApi.updateCategory(id, { sort_order: val });
                if (response && response.success) {
                    showToast({ type: "success", title: "Cập nhật thành công", message: `Đã đổi thứ tự hiển thị thành ${val === 0 ? "Chưa xếp" : val}.` });
                    // Cập nhật giá trị gốc
                    input.setAttribute("data-old-value", val);
                    // Đồng bộ dữ liệu local cache
                    const catIdNum = Number(id);
                    const localCat = cachedAllCategories.find(c => c.id === catIdNum);
                    if (localCat) {
                        localCat.sort_order = val;
                    }
                    // Ẩn cụm nút Lưu/Hủy
                    actions.classList.add("hidden");
                } else {
                    showToast({ type: "error", title: "Thất bại", message: response.message || "Không thể cập nhật thứ tự." });
                    rollbackValue(input, actions);
                }
            } catch (err) {
                console.error("Lỗi cập nhật sort order:", err);
                showToast({ type: "error", title: "Lỗi kết nối", message: "Đã xảy ra sự cố khi lưu thứ tự hiển thị." });
                rollbackValue(input, actions);
            } finally {
                input.disabled = false;
                dec.disabled = false;
                inc.disabled = false;
                saveBtn.disabled = false;
                cancel.disabled = false;
            }
            return;
        }
    });

    tableBody.addEventListener("input", (e) => {
        const input = e.target.closest(".sort-order-input");
        if (!input) return;

        const id = input.getAttribute("data-id");
        const row = input.closest("tr");
        const actions = row.querySelector(`.sort-order-actions[data-id="${id}"]`);

        checkChanged(input, actions);
    });

    tableBody.addEventListener("change", (e) => {
        const input = e.target.closest(".sort-order-input");
        if (!input) return;

        const id = input.getAttribute("data-id");
        const row = input.closest("tr");
        const actions = row.querySelector(`.sort-order-actions[data-id="${id}"]`);

        const valStr = input.value.trim();
        if (valStr !== "" && valStr.toLowerCase() !== "chưa xếp") {
            const val = parseFloat(valStr);
            if (isNaN(val) || val < 0 || !Number.isInteger(val)) {
                showToast({ type: "warning", title: "Giá trị không hợp lệ", message: "Thứ tự phải là số nguyên không âm hoặc 'Chưa xếp'." });
                rollbackValue(input, actions);
                return;
            }
        }

        checkChanged(input, actions);
    });
}

/**
 * Sự kiện mở / đóng modal và sinh slug tự động
 */
function initModalEvents() {
    const btnAdd = document.getElementById("btn-add-category");
    
    // Nút mở modal tạo
    btnAdd.addEventListener("click", () => {
        openCreateModal();
    });

    // Sự kiện đóng modal tự động thông qua data-close-modal
    document.querySelectorAll("[data-close-modal]").forEach(btn => {
        btn.addEventListener("click", () => {
            const modalId = btn.getAttribute("data-close-modal");
            closeModal(modalId);
        });
    });

    // Sinh slug tự động cho Create Form
    const createNameInput = document.getElementById("create-name");
    const createSlugInput = document.getElementById("create-slug");
    const btnGenerateSlugCreate = document.getElementById("btn-generate-slug-create");

    let createSlugManuallyEdited = false;
    createSlugInput.addEventListener("input", () => {
        createSlugManuallyEdited = true;
    });

    createNameInput.addEventListener("input", () => {
        if (!createSlugManuallyEdited) {
            createSlugInput.value = generateSlug(createNameInput.value);
        }
    });

    btnGenerateSlugCreate.addEventListener("click", () => {
        createSlugInput.value = generateSlug(createNameInput.value);
        createSlugManuallyEdited = false;
    });

    // Sinh slug tự động cho Edit Form
    const editNameInput = document.getElementById("edit-name");
    const editSlugInput = document.getElementById("edit-slug");
    const btnGenerateSlugEdit = document.getElementById("btn-generate-slug-edit");

    let editSlugManuallyEdited = false;
    editSlugInput.addEventListener("input", () => {
        editSlugManuallyEdited = true;
    });

    editNameInput.addEventListener("input", () => {
        if (!editSlugManuallyEdited) {
            editSlugInput.value = generateSlug(editNameInput.value);
        }
    });

    btnGenerateSlugEdit.addEventListener("click", () => {
        editSlugInput.value = generateSlug(editNameInput.value);
        editSlugManuallyEdited = false;
    });

    // Đếm số ký tự mô tả
    const setupCharCounter = (textareaId, counterId) => {
        const textarea = document.getElementById(textareaId);
        const counter = document.getElementById(counterId);
        textarea.addEventListener("input", () => {
            counter.textContent = textarea.value.length;
        });
    };
    setupCharCounter("create-description", "create-desc-count");
    setupCharCounter("edit-description", "edit-desc-count");

    // Xử lý click Submit thêm mới
    document.getElementById("btn-submit-create").addEventListener("click", submitCreateForm);

    // Xử lý click Submit chỉnh sửa
    document.getElementById("btn-submit-edit").addEventListener("click", submitEditForm);

    // Đổi trạng thái modal
    document.getElementById("btn-submit-status").addEventListener("click", submitStatusChange);

    // Xóa mềm modal
    document.getElementById("btn-submit-delete").addEventListener("click", submitDeleteCategory);
}

/**
 * Mở modal
 */
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove("hidden");
        // Reset validation errors
        modal.querySelectorAll("[data-error]").forEach(p => {
            p.classList.add("hidden");
            p.textContent = "";
        });
    }
}

/**
 * Đóng modal
 */
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add("hidden");
    }
}

/**
 * Sinh slug chuẩn SEO từ Tiếng Việt có dấu
 */
function generateSlug(text) {
    let slug = text.toString().toLowerCase().trim();
    
    // Thay ký tự tiếng Việt
    const sets = [
        { src: /a|à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, replace: 'a' },
        { src: /e|è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, replace: 'e' },
        { src: /i|ì|í|ị|ỉ|ĩ/g, replace: 'i' },
        { src: /o|ò|á|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, replace: 'o' },
        { src: /u|ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, replace: 'u' },
        { src: /y|ỳ|ý|ỵ|ỷ|ỹ/g, replace: 'y' },
        { src: /d|đ/g, replace: 'd' }
    ];

    sets.forEach(set => {
        slug = slug.replace(set.src, set.replace);
    });

    slug = slug
        .replace(/[^a-z0-9 -]/g, '') // loại bỏ ký tự đặc biệt
        .replace(/\s+/g, '-')        // thay khoảng trắng bằng gạch ngang
        .replace(/-+/g, '-')         // thu gọn nhiều gạch ngang liền nhau
        .replace(/^-+|-+$/g, '');    // cắt bỏ gạch ngang ở đầu/cuối

    return slug;
}

/**
 * Mở modal Thêm mới danh mục
 */
async function openCreateModal() {
    // Reset form
    document.getElementById("create-category-form").reset();
    document.getElementById("create-desc-count").textContent = "0";
    
    // Nạp danh sách danh mục cha hợp lệ (chỉ lấy các root category)
    const parentSelect = document.getElementById("create-parent");
    let html = '<option value="">Không có - Danh mục gốc</option>';
    
    // Chỉ lấy danh mục gốc làm cha
    const rootCats = cachedAllCategories.filter(c => c.parent_id === null);
    rootCats.forEach(c => {
        html += `<option value="${c.id}">${c.name}</option>`;
    });
    parentSelect.innerHTML = html;

    // Refresh custom select
    if (typeof window.initAllCustomSelects === "function") {
        window.initAllCustomSelects();
    }

    openModal("create-category-modal");
}

/**
 * Submit Form tạo danh mục
 */
async function submitCreateForm() {
    const btn = document.getElementById("btn-submit-create");
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "Đang xử lý...";

    // Thu thập dữ liệu
    const form = document.getElementById("create-category-form");
    const formData = new FormData(form);
    const payload = {
        name: formData.get("name"),
        slug: formData.get("slug"),
        parent_id: formData.get("parent_id") || null,
        description: formData.get("description"),
        sort_order: formData.get("sort_order") || 0,
        status: formData.get("status")
    };

    try {
        const response = await categoriesApi.createCategory(payload);
        
        if (response.success) {
            showToast({ type: "success", title: "Thành công", message: "Đã tạo danh mục mới thành công." });
            closeModal("create-category-modal");
            fetchAndRender(); // Tải lại bảng & summary
        } else {
            // Hiển thị lỗi validation cụ thể từng field
            if (response.error_code === 422 || response.error_code === 409) {
                showFieldErrors("create-category-modal", response.errors || {});
                showToast({ type: "error", title: "Không thể lưu", message: response.message || "Vui lòng kiểm tra lại thông tin nhập." });
            } else {
                showToast({ type: "error", title: "Thất bại", message: response.message || "Đã xảy ra lỗi không xác định." });
            }
        }
    } catch (err) {
        console.error("Lỗi khi thêm mới danh mục:", err);
        showToast({ type: "error", title: "Lỗi kết nối", message: "Không thể kết nối đến máy chủ." });
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

/**
 * Mở modal Chỉnh sửa danh mục
 */
async function openEditModal(id) {
    const modal = document.getElementById("edit-category-modal");
    const form = document.getElementById("edit-category-form");
    const loader = document.getElementById("edit-modal-loader");

    // Ẩn form, hiện loader
    form.classList.add("hidden");
    loader.classList.remove("hidden");
    
    openModal("edit-category-modal");

    try {
        const response = await categoriesApi.getCategory(id);
        
        if (!response || !response.success) {
            showToast({ type: "error", title: "Không tìm thấy", message: response ? response.message : "Không thể lấy thông tin danh mục." });
            closeModal("edit-category-modal");
            return;
        }

        const cat = response.data;
        activeCategory = cat;

        // Điền dữ liệu
        document.getElementById("edit-category-id").value = cat.id;
        document.getElementById("edit-name").value = cat.name;
        document.getElementById("edit-slug").value = cat.slug;
        document.getElementById("edit-description").value = cat.description || "";
        document.getElementById("edit-desc-count").textContent = (cat.description || "").length;
        document.getElementById("edit-sort-order").value = cat.sort_order;
        
        // Radio status
        if (cat.status === "active") {
            document.getElementById("edit-status-active").checked = true;
        } else {
            document.getElementById("edit-status-inactive").checked = true;
        }

        // Nạp dropdown danh mục cha (Loại bỏ chính nó và con cháu để chặn vòng lặp)
        const parentSelect = document.getElementById("edit-parent");
        let html = '<option value="">Không có - Danh mục gốc</option>';
        
        // Chỉ lấy danh mục gốc làm cha
        const rootCats = cachedAllCategories.filter(c => {
            // Chặn chính nó
            if (c.id === cat.id) return false;
            // Chặn con cháu trực thuộc
            if (isDescendant(cat.id, c.id, cachedAllCategories)) return false;
            // Chỉ lấy danh mục gốc
            return c.parent_id === null;
        });

        rootCats.forEach(c => {
            html += `<option value="${c.id}" ${cat.parent_id === c.id ? "selected" : ""}>${c.name}</option>`;
        });
        parentSelect.innerHTML = html;

        // Refresh custom select
        if (typeof window.initAllCustomSelects === "function") {
            window.initAllCustomSelects();
        }

        // Hiện form, ẩn loader
        loader.classList.add("hidden");
        form.classList.remove("hidden");

    } catch (err) {
        console.error("Lỗi nạp dữ liệu edit modal:", err);
        showToast({ type: "error", title: "Lỗi kết nối", message: "Đã xảy ra sự cố khi tải dữ liệu." });
        closeModal("edit-category-modal");
    }
}

/**
 * Kiểm tra xem targetParentId có phải là con cháu của catId hay không (Logic tương tự Backend)
 */
function isDescendant(catId, targetParentId, allCats) {
    const children = allCats.filter(c => c.parent_id === catId);
    if (children.some(child => child.id === targetParentId)) {
        return true;
    }
    return children.some(child => isDescendant(child.id, targetParentId, allCats));
}

/**
 * Submit form Chỉnh sửa danh mục
 */
async function submitEditForm() {
    const id = document.getElementById("edit-category-id").value;
    const btn = document.getElementById("btn-submit-edit");
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "Đang xử lý...";

    const form = document.getElementById("edit-category-form");
    const formData = new FormData(form);
    
    // Gửi PATCH - Chỉ gửi các trường thay đổi hoặc đầy đủ payload
    const payload = {
        name: formData.get("name"),
        slug: formData.get("slug"),
        parent_id: formData.get("parent_id") || null,
        description: formData.get("description"),
        sort_order: formData.get("sort_order") || 0,
        status: formData.get("status")
    };

    try {
        const response = await categoriesApi.updateCategory(id, payload);
        
        if (response.success) {
            showToast({ type: "success", title: "Cập nhật thành công", message: `Đã lưu thay đổi cho danh mục "${payload.name}".` });
            closeModal("edit-category-modal");
            fetchAndRender(); // Tải lại summary và bảng
        } else {
            if (response.error_code === 422 || response.error_code === 409) {
                showFieldErrors("edit-category-modal", response.errors || {});
                showToast({ type: "error", title: "Không thể lưu", message: response.message || "Thông tin nhập không hợp lệ." });
            } else {
                showToast({ type: "error", title: "Thất bại", message: response.message || "Lỗi hệ thống không xác định." });
            }
        }
    } catch (err) {
        console.error("Lỗi khi update danh mục:", err);
        showToast({ type: "error", title: "Lỗi kết nối", message: "Đã xảy ra sự cố kết nối." });
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

/**
 * Mở Drawer xem chi tiết danh mục
 */
async function openDetailDrawer(id) {
    try {
        const response = await categoriesApi.getCategory(id);
        
        if (!response || !response.success) {
            showToast({ type: "error", title: "Không tìm thấy", message: response ? response.message : "Không thể lấy thông tin chi tiết danh mục." });
            return;
        }

        const cat = response.data;

        // Điền dữ liệu
        document.getElementById("detail-id").textContent = cat.id;
        document.getElementById("detail-name").textContent = cat.name;
        document.getElementById("detail-slug").textContent = cat.slug;
        document.getElementById("detail-description").textContent = cat.description || "Chưa có mô tả.";
        
        // Thứ tự & Số khóa học
        document.getElementById("detail-sort-order").textContent = cat.sort_order;
        document.getElementById("detail-course-count").innerHTML = cat.course_count > 0
            ? `<a href="courses.html?category_id=${cat.id}" class="underline text-success hover:font-bold font-semibold transition-all font-sans">${cat.course_count} khóa học</a>`
            : "Chưa có khóa học";

        // Parent
        const parentSpan = document.getElementById("detail-parent");
        if (cat.parent) {
            parentSpan.innerHTML = `<span class="font-semibold text-ink">${escapeHTML(cat.parent.name)}</span>`;
        } else {
            parentSpan.innerHTML = `<span class="px-2 py-0.5 rounded-[6px] bg-canvas text-mid-gray border border-hairline text-[10px] font-sans font-semibold">Danh mục gốc</span>`;
        }

        // Status
        const statusSpan = document.getElementById("detail-status");
        statusSpan.innerHTML = cat.status === "active"
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-soft text-success border border-success/10">Đang hoạt động</span>`
            : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-canvas text-mid-gray border border-hairline">Ngừng hoạt động</span>`;

        // Dates
        document.getElementById("detail-created-at").textContent = formatDateTime(cat.created_at);
        document.getElementById("detail-updated-at").textContent = formatDateTime(cat.updated_at || cat.created_at);

        // Danh sách danh mục con
        const childrenContainer = document.getElementById("detail-children-container");
        if (cat.children && cat.children.length > 0) {
            let html = "";
            cat.children.forEach(ch => {
                const statusBadge = ch.status === "active"
                    ? `<span class="text-[9px] px-1.5 py-0.2 rounded-full bg-success-soft text-success font-semibold border border-success/10">Active</span>`
                    : `<span class="text-[9px] px-1.5 py-0.2 rounded-full bg-canvas text-mid-gray border border-hairline">Inactive</span>`;
                
                html += `
                <div class="flex items-center justify-between p-2 rounded bg-canvas/60 border border-hairline">
                    <div class="truncate mr-2">
                        <span class="font-semibold text-xs text-ink">${escapeHTML(ch.name)}</span>
                        <p class="text-[9px] text-mid-gray font-mono">${escapeHTML(ch.slug)}</p>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <span class="text-[9px] text-mid-gray font-medium">Sắp xếp: ${ch.sort_order}</span>
                        ${statusBadge}
                    </div>
                </div>`;
            });
            childrenContainer.innerHTML = html;
        } else {
            childrenContainer.innerHTML = `<p class="text-xs text-mid-gray italic pl-1">Không có danh mục con trực thuộc.</p>`;
        }

        openModal("detail-category-drawer");

    } catch (err) {
        console.error("Lỗi khi tải chi tiết danh mục:", err);
        showToast({ type: "error", title: "Lỗi kết nối", message: "Đã xảy ra sự cố khi tải chi tiết." });
    }
}

/**
 * Mở modal xác nhận đổi trạng thái
 */
function openConfirmStatusModal(id, newStatus) {
    const cat = cachedAllCategories.find(c => Number(c.id) === Number(id)) || (window.currentRenderedItems || []).find(c => Number(c.id) === Number(id));
    if (!cat) return;

    activeCategory = cat;
    activeCategory.target_status = newStatus;

    const titleEl = document.getElementById("confirm-status-title");
    const messageEl = document.getElementById("confirm-status-message");
    
    if (titleEl) {
        titleEl.textContent = newStatus === "inactive" ? "Xác nhận ngừng hoạt động" : "Xác nhận kích hoạt lại";
    }

    if (messageEl) {
        if (newStatus === "inactive") {
            messageEl.innerHTML = `Bạn có chắc muốn **ngừng hoạt động** danh mục “<span class="font-semibold text-ink">${escapeHTML(cat.name)}</span>” không?<br><br><span class="text-[10px] text-mid-gray mt-2 block leading-relaxed bg-surface-alt p-2 rounded border border-hairline">Các khóa học hiện có vẫn được giữ nguyên, nhưng danh mục sẽ không còn được ưu tiên hiển thị cho người dùng.</span>`;
        } else {
            messageEl.innerHTML = `Bạn có chắc muốn **kích hoạt lại** danh mục “<span class="font-semibold text-ink">${escapeHTML(cat.name)}</span>” không?<br><br><span class="text-[10px] text-mid-gray mt-2 block leading-relaxed bg-surface-alt p-2 rounded border border-hairline">Danh mục sẽ được hiển thị công khai trên trang chủ và bộ lọc của người dùng.</span>`;
        }
    }

    openModal("confirm-status-modal");
}

/**
 * Submit đổi trạng thái danh mục
 */
async function submitStatusChange() {
    if (!activeCategory) return;
    
    const id = activeCategory.id;
    const targetStatus = activeCategory.target_status;

    const btn = document.getElementById("btn-submit-status");
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "Đang xử lý...";

    try {
        const response = await categoriesApi.updateCategory(id, { status: targetStatus });
        
        if (response && response.success) {
            const statusLabel = targetStatus === "active" ? "Kích hoạt" : "Vô hiệu hóa";
            showToast({ type: "success", title: "Thao tác thành công", message: `Đã ${statusLabel.toLowerCase()} danh mục "${activeCategory.name}" thành công.` });
            closeModal("confirm-status-modal");
            fetchAndRender(); // Tải lại summary và bảng
        } else {
            showToast({ type: "error", title: "Lỗi thực hiện", message: response.message || "Không thể thay đổi trạng thái danh mục." });
        }
    } catch (err) {
        console.error("Lỗi khi thay đổi trạng thái:", err);
        showToast({ type: "error", title: "Lỗi kết nối", message: "Đã xảy ra sự cố kết nối máy chủ." });
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

/**
 * Mở modal xác nhận xóa mềm danh mục
 */
function openConfirmDeleteModal(id) {
    const cat = cachedAllCategories.find(c => c.id === Number(id));
    if (!cat) return;

    activeCategory = cat;

    const nameSpan = document.getElementById("confirm-delete-name");
    nameSpan.textContent = cat.name;

    openModal("confirm-delete-modal");
}

/**
 * Submit xóa mềm danh mục
 */
async function submitDeleteCategory() {
    if (!activeCategory) return;

    const id = activeCategory.id;
    const catName = activeCategory.name;
    const btn = document.getElementById("btn-submit-delete");
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "Đang xóa...";

    try {
        const response = await categoriesApi.softDeleteCategory(id);
        
        if (response && response.success) {
            closeModal("confirm-delete-modal");
            await fetchAndRender();

            showToast({
                type: "success",
                title: "Thao tác thành công",
                message: `Đã xóa danh mục “${escapeHTML(catName)}”. <button type="button" class="btn-toast-action ml-2 px-2 py-0.5 rounded bg-ink text-white font-semibold hover:opacity-90 transition-opacity text-[10px] cursor-pointer inline-flex items-center gap-1">Khôi phục</button>`,
                duration: 8000,
                allowHtml: true,
                onAction: async (closeToast, e) => {
                    const actionBtn = e.currentTarget;
                    if (actionBtn.disabled) return;
                    actionBtn.disabled = true;
                    actionBtn.textContent = "Đang khôi phục...";

                    try {
                        const res = await categoriesApi.restoreCategory(id);
                        if (res && res.success) {
                            closeToast();
                            await fetchAndRender();
                            showToast({
                                type: "success",
                                title: "Khôi phục thành công",
                                message: `Đã khôi phục danh mục “${escapeHTML(catName)}”.`
                            });
                        } else {
                            actionBtn.disabled = false;
                            actionBtn.textContent = "Khôi phục";
                            showToast({
                                type: "error",
                                title: "Lỗi khôi phục",
                                message: res ? res.message : "Không thể khôi phục danh mục."
                            });
                        }
                    } catch (err) {
                        actionBtn.disabled = false;
                        actionBtn.textContent = "Khôi phục";
                        console.error("Lỗi khi khôi phục từ toast:", err);
                    }
                }
            });
        } else {
            showToast({ type: "error", title: "Xóa thất bại", message: response.message || "Không thể thực hiện xóa danh mục." });
        }
    } catch (err) {
        console.error("Lỗi khi xóa danh mục:", err);
        showToast({ type: "error", title: "Lỗi kết nối", message: "Đã xảy ra sự cố kết nối." });
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

/**
 * Kết xuất validation errors chi tiết cho form
 */
function showFieldErrors(modalId, errors) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Ẩn tất cả các lỗi cũ
    modal.querySelectorAll("[data-error]").forEach(p => {
        p.classList.add("hidden");
        p.textContent = "";
    });

    // Điền lỗi mới
    Object.keys(errors).forEach(field => {
        const p = modal.querySelector(`[data-error="${field}"]`);
        if (p) {
            p.textContent = errors[field][0] || "Thông tin không hợp lệ.";
            p.classList.remove("hidden");
        }
    });
}

/**
 * Định dạng ngày giờ dạng DD/MM/YYYY HH:MM
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
 * Chống XSS độc hại
 */
function escapeHTML(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
