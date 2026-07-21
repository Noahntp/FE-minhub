import * as coursesApi from "../api/courses-api.js";
import { showToast } from "../toast.js";
import { enableTableRowClick } from "../core/table-row-click.js";
import { openModal, closeModal } from "../modal.js";

// Biến lưu trữ trạng thái hiện tại của trang
let pageState = {
  search: "",
  status: "",
  instructor_id: "",
  category_id: "",
  level: "",
  is_featured: "",
  date_from: "",
  date_to: "",
  sort_by: "updated_at",
  sort_direction: "desc",
  page: 1,
  per_page: 20,
};

// Biến theo dõi góc xoay của nút làm mới
let refreshRotation = 0;
// Biến lưu trữ khóa học đang thao tác (cho modals hoặc drawer)
let activeTargetCourse = null;
// Biến timeout cho debounce tìm kiếm
let searchDebounceTimeout = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Đã tải trang: Quản lý khóa học");

  // Đọc trạng thái ban đầu từ URL query string
  readStateFromUrl();

  // Khởi tạo các sự kiện giao diện
  initFilterEvents();
  initQuickTabsEvents();
  initRefreshEvent();
  initModalEvents();
  initDrawerEvents();
  initDropdownCloseEvents();

  // Tải dữ liệu ban đầu
  fetchAndRender(false); // Vừa mở trang: không cuộn
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
 * Định dạng tiền tệ VND
 */
function formatVND(amount) {
  if (amount === undefined || amount === null) return "0đ";
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

/**
 * Định dạng thời lượng (Giờ, Phút) từ giây
 */
function formatDuration(seconds) {
  if (!seconds) return "0 phút";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  }
  return `${minutes} phút`;
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
  pageState.status = params.get("status") || "";
  pageState.instructor_id = params.get("instructor_id") || "";
  pageState.category_id = params.get("category_id") || "";
  pageState.level = params.get("level") || "";
  pageState.is_featured = params.get("is_featured") || "";
  pageState.date_from = params.get("date_from") || "";
  pageState.date_to = params.get("date_to") || "";
  pageState.sort_by = params.get("sort_by") || "updated_at";
  pageState.sort_direction = params.get("sort_direction") || "desc";
  pageState.page = parseInt(params.get("page")) || 1;
  pageState.per_page = parseInt(params.get("per_page")) || 20;

  // Cập nhật giá trị hiển thị trên các input lọc
  document.getElementById("filter-search").value = pageState.search;
  document.getElementById("filter-status").value = pageState.status;
  document.getElementById("filter-instructor").value = pageState.instructor_id;
  document.getElementById("filter-category").value = pageState.category_id;
  document.getElementById("filter-level").value = pageState.level;
  document.getElementById("filter-featured").value = pageState.is_featured;
  document.getElementById("filter-date-from").value = pageState.date_from;
  document.getElementById("filter-date-to").value = pageState.date_to;
  document.getElementById("filter-sort").value = pageState.sort_by;
  document.getElementById("pag-per-page").value = pageState.per_page;

  // Đồng bộ hiển thị bộ lọc thời gian preset
  const periodSelect = document.getElementById("filter-period");
  if (pageState.date_from || pageState.date_to) {
    periodSelect.value = "custom";
    document.getElementById("custom-date-container").classList.remove("hidden");
  } else {
    periodSelect.value = "all"; // Mặc định tất cả thời gian
    setPresetDates("all");
  }
}

/**
 * Cập nhật query string trên URL dựa trên state hiện tại
 */
function writeStateToUrl() {
  const url = new URL(window.location);
  url.search = "";

  Object.keys(pageState).forEach((key) => {
    const val = pageState[key];
    if (val !== undefined && val !== null && val !== "") {
      // Không lưu các giá trị mặc định lên URL để giữ URL sạch
      if (key === "page" && val === 1) return;
      if (key === "per_page" && val === 20) return;
      if (key === "sort_by" && val === "updated_at") return;
      if (key === "sort_direction" && val === "desc") return;
      url.searchParams.set(key, val);
    }
  });

  window.history.pushState({}, "", url);
}

/**
 * Hiển thị/Ẩn loading skeletons cho KPI, Insights và Table
 */
function toggleLoading(isLoading) {
  const kpiLoaded = document.getElementById("kpi-content-wrapper");
  const kpiLoading = document.getElementById("kpi-loading-wrapper");
  const insightLoaded = document.getElementById("insight-content-wrapper");
  const insightLoading = document.getElementById("insight-loading-wrapper");
  const tableBody = document.getElementById("courses-table-body");
  const tableLoading = document.getElementById("courses-loading-state");
  const tableEmpty = document.getElementById("courses-empty-state");
  const tableError = document.getElementById("courses-error-state");
  const pagination = document.getElementById("pagination-wrapper");
  const quickTabs = document.getElementById("quick-tabs-container");

  const filterInputs = document.querySelectorAll(
    "#filter-form input, #filter-form select, #filter-form button",
  );
  filterInputs.forEach((input) => {
    input.disabled = isLoading;
  });

  if (quickTabs) {
    quickTabs
      .querySelectorAll("button")
      .forEach((btn) => (btn.disabled = isLoading));
  }

  if (isLoading) {
    kpiLoaded.classList.add("hidden");
    kpiLoading.classList.remove("hidden");
    insightLoaded.classList.add("hidden");
    insightLoading.classList.remove("hidden");

    tableBody.innerHTML = "";
    tableLoading.classList.remove("hidden");
    tableEmpty.classList.add("hidden");
    tableError.classList.add("hidden");
    pagination.classList.add("pointer-events-none", "opacity-50");
  } else {
    kpiLoaded.classList.remove("hidden");
    kpiLoading.classList.add("hidden");
    insightLoaded.classList.remove("hidden");
    insightLoading.classList.add("hidden");

    tableLoading.classList.add("hidden");
    pagination.classList.remove("pointer-events-none", "opacity-50");
  }
}

/**
 * Cuộn mượt mà đến vùng danh sách khóa học
 */
function scrollToCourseList() {
  const section = document.getElementById("course-list-section");
  if (section) {
    // Hỗ trợ cấu hình prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const behavior = mediaQuery.matches ? "auto" : "smooth";
    section.scrollIntoView({ behavior: behavior, block: "start" });
  }
}

/**
 * Gọi API lấy danh sách và hiển thị
 * @param {boolean} shouldScroll - Có tự động cuộn đến danh sách sau khi render xong hay không
 */
async function fetchAndRender(shouldScroll = true) {
  toggleLoading(true);

  try {
    const response = await coursesApi.getCourses(pageState);

    if (!response || !response.success) {
      showErrorState(
        response ? response.message : "Đã xảy ra lỗi không xác định.",
      );
      return;
    }

    // Khởi tạo các options động trong bộ lọc dựa trên mock dataset gốc (chỉ chạy 1 lần đầu)
    initDynamicFilterOptions();

    renderSummary(response.data.summary);
    renderQuickInsights(response.data.summary);
    renderTable(response.data.items);
    renderPagination(response.meta);
    renderFilterChips();
    updateQuickTabsSelection();
    updateLastUpdateTime();

    toggleLoading(false);

    if (shouldScroll) {
      // Đợi UI cập nhật nhẹ rồi cuộn
      setTimeout(scrollToCourseList, 50);
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
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
  document.getElementById("insight-content-wrapper").classList.remove("hidden");
  document.getElementById("insight-loading-wrapper").classList.add("hidden");

  document.getElementById("courses-table-body").innerHTML = "";
  document.getElementById("courses-loading-state").classList.add("hidden");
  document.getElementById("courses-empty-state").classList.add("hidden");

  const errorState = document.getElementById("courses-error-state");
  errorState.classList.remove("hidden");

  const errorDesc = errorState.querySelector("#error-desc");
  if (errorDesc) {
    errorDesc.textContent =
      message ||
      "Đã có lỗi xảy ra trong quá trình kết nối dữ liệu. Vui lòng thử lại.";
  }
}

/**
 * Trích xuất và nạp các tùy chọn giảng viên và danh mục động vào select
 */
let hasInitializedOptions = false;
async function initDynamicFilterOptions() {
  if (hasInitializedOptions) return;

  try {
    // Lấy tất cả bản ghi để trích xuất option
    const response = await coursesApi.getCourses({ page: 1, per_page: 100 });
    if (!response || !response.success) return;

    const items = response.data.items;

    // 1. Trích xuất giảng viên
    const instructorsMap = new Map();
    // 2. Trích xuất danh mục
    const categoriesMap = new Map();

    items.forEach((c) => {
      if (c.instructor) {
        instructorsMap.set(c.instructor.id, c.instructor);
      }
      if (c.categories) {
        c.categories.forEach((cat) => {
          categoriesMap.set(cat.id, cat);
        });
      }
    });

    // Nạp vào select Giảng viên
    const instructorSelect = document.getElementById("filter-instructor");
    if (instructorSelect) {
      instructorsMap.forEach((ins) => {
        const opt = document.createElement("option");
        opt.value = ins.id;
        opt.textContent = `${ins.full_name} (${ins.email})`;
        // Giữ lại lựa chọn cũ nếu có
        if (pageState.instructor_id == ins.id) {
          opt.selected = true;
        }
        instructorSelect.appendChild(opt);
      });
    }

    // Nạp vào select Danh mục
    const categorySelect = document.getElementById("filter-category");
    if (categorySelect) {
      categoriesMap.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat.id;
        opt.textContent = cat.name;
        // Giữ lại lựa chọn cũ nếu có
        if (pageState.category_id == cat.id) {
          opt.selected = true;
        }
        categorySelect.appendChild(opt);
      });
    }

    hasInitializedOptions = true;

    // Refresh custom selects sau khi nạp động options thành công
    if (typeof window.refreshCustomSelect === "function") {
      window.refreshCustomSelect(instructorSelect);
      window.refreshCustomSelect(categorySelect);
    }
  } catch (e) {
    console.error("Lỗi khi khởi tạo options lọc động:", e);
  }
}

/**
 * Render KPI Cards lên giao diện
 */
function renderSummary(summary) {
  if (!summary) return;

  const updateText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = new Intl.NumberFormat("vi-VN").format(val || 0);
  };

  updateText("kpi-total-courses", summary.total_courses);
  updateText("kpi-published-courses", summary.published_courses);
  updateText("kpi-pending-courses", summary.pending_review_courses);
  updateText("kpi-draft-courses", summary.draft_courses);
  updateText("kpi-hidden-courses", summary.hidden_courses);
  updateText("kpi-rejected-courses", summary.rejected_courses);

  // Cập nhật số lượng hiển thị trên tiêu đề mô tả
  updateText("title-total-courses", summary.total_courses);

  // Cập nhật số lượng trên các Quick Tabs
  updateQuickTabsCounts(summary);
}

/**
 * Render Quick Insights lên giao diện
 */
function renderQuickInsights(summary) {
  if (!summary) return;

  const updateText = (id, val, isPrice = false) => {
    const el = document.getElementById(id);
    if (el)
      el.textContent = isPrice
        ? formatVND(val)
        : new Intl.NumberFormat("vi-VN").format(val || 0);
  };

  updateText("insight-new-courses", summary.new_courses_30_days);
  updateText("insight-total-enrollments", summary.total_enrollments);
  updateText("insight-paid-orders", summary.total_paid_orders);
  updateText("insight-gross-revenue", summary.total_gross_revenue, true);

  const avgEl = document.getElementById("insight-avg-rating");
  if (avgEl) {
    avgEl.innerHTML = `${summary.average_rating || "0.0"} <svg class="w-3.5 h-3.5 fill-current text-warning inline" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
  }
}

/**
 * Cập nhật số lượng hiển thị trên các Quick Tabs
 */
function updateQuickTabsCounts(summary) {
  const counts = {
    all: summary.total_courses,
    published: summary.published_courses,
    pending_review: summary.pending_review_courses,
    draft: summary.draft_courses,
    hidden: summary.hidden_courses,
    rejected: summary.rejected_courses,
  };

  Object.keys(counts).forEach((tab) => {
    const tabBtn = document.querySelector(`[data-tab="${tab}"]`);
    if (tabBtn) {
      const countSpan = tabBtn.querySelector(".tab-count");
      if (countSpan) {
        countSpan.textContent = counts[tab] || 0;
      }
    }
  });
}

/**
 * Đồng bộ trạng thái active trực quan của Quick Tabs dựa trên state
 */
function updateQuickTabsSelection() {
  const tabs = document.querySelectorAll("[data-tab]");
  const activeTab = pageState.status || "all";

  tabs.forEach((btn) => {
    const tabVal = btn.getAttribute("data-tab");
    if (tabVal === activeTab) {
      btn.className =
        "px-5 py-3 text-xs font-semibold border-b-2 border-ink text-ink select-none whitespace-nowrap cursor-pointer transition-all";
    } else {
      btn.className =
        "px-5 py-3 text-xs font-medium border-b-2 border-transparent text-mid-gray hover:text-ink select-none whitespace-nowrap cursor-pointer transition-all";
    }
  });
}

/**
 * Hiển thị dữ liệu lên bảng khóa học
 */
function renderTable(courses) {
  const tableBody = document.getElementById("courses-table-body");
  const emptyState = document.getElementById("courses-empty-state");

  if (!courses || courses.length === 0) {
    tableBody.innerHTML = "";
    emptyState.classList.remove("hidden");

    // Thay đổi mô tả empty state tùy vào việc có đang dùng filter hay không
    const isFiltering = Object.keys(pageState).some((key) => {
      if (
        key === "page" ||
        key === "per_page" ||
        key === "sort_by" ||
        key === "sort_direction"
      )
        return false;
      return pageState[key] !== "";
    });

    const titleEl = emptyState.querySelector("#empty-title");
    const descEl = emptyState.querySelector("#empty-desc");
    const resetBtn = emptyState.querySelector("#btn-empty-reset");

    if (isFiltering) {
      titleEl.textContent = "Không tìm thấy khóa học phù hợp";
      descEl.textContent =
        "Vui lòng điều chỉnh hoặc đặt lại các bộ lọc hiện tại.";
      resetBtn.classList.remove("hidden");
    } else {
      titleEl.textContent = "Chưa có khóa học nào";
      descEl.textContent =
        "Các khóa học mới của giảng viên sẽ xuất hiện tại đây.";
      resetBtn.classList.add("hidden");
    }
    return;
  }

  emptyState.classList.add("hidden");
  tableBody.innerHTML = "";

  courses.forEach((c) => {
    const tr = document.createElement("tr");
    tr.className =
      "hover:bg-surface-alt/55 transition-colors align-middle h-[70px]";
    tr.setAttribute("data-course-row", "true");
    tr.setAttribute("data-course-id", c.id);
    tr.setAttribute("data-row-id", c.id);
    tr.setAttribute("tabindex", "0");
    tr.setAttribute("aria-label", `Xem chi tiết khóa học ${c.title}`);

    // 1. Cột Khóa học
    const tdCourse = document.createElement("td");
    tdCourse.className = "p-3 pl-4 min-w-[310px]";

    // Thumbnail & Title Container
    const courseContainer = document.createElement("div");
    courseContainer.className = "flex items-center gap-3 cursor-pointer group";
    courseContainer.addEventListener("click", () => showDetailDrawer(c.id));

    const thumbImg = document.createElement("img");
    thumbImg.className =
      "h-10 w-16 rounded-[4px] object-cover bg-canvas border border-hairline group-hover:opacity-90 transition-opacity shrink-0";
    thumbImg.src = c.thumbnail_url || "";
    thumbImg.alt = c.title;
    thumbImg.loading = "lazy";
    thumbImg.onerror = () => {
      thumbImg.src =
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80";
    };

    const infoDiv = document.createElement("div");
    infoDiv.className = "min-w-0";

    const titleSpan = document.createElement("span");
    titleSpan.className =
      "font-bold text-ink leading-snug block truncate group-hover:text-ink-soft transition-colors text-xs";
    titleSpan.textContent = c.title;

    const slugSpan = document.createElement("span");
    slugSpan.className =
      "text-[9px] text-mid-gray font-mono block truncate mt-0.5";
    slugSpan.textContent = c.slug;

    // Nếu có ngôn ngữ khác tiếng Việt thì hiển thị label nhỏ
    if (c.language && c.language !== "Tiếng Việt") {
      const langBadge = document.createElement("span");
      langBadge.className =
        "inline-block text-[8px] font-semibold text-mid-gray bg-canvas px-1 rounded mt-0.5 border border-hairline";
      langBadge.textContent = c.language;
      infoDiv.appendChild(titleSpan);
      infoDiv.appendChild(slugSpan);
      infoDiv.appendChild(langBadge);
    } else {
      infoDiv.appendChild(titleSpan);
      infoDiv.appendChild(slugSpan);
    }

    courseContainer.appendChild(thumbImg);
    courseContainer.appendChild(infoDiv);
    tdCourse.appendChild(courseContainer);
    tr.appendChild(tdCourse);

    // 2. Cột Giảng viên
    const tdInstructor = document.createElement("td");
    tdInstructor.className = "p-3 min-w-[200px]";
    tdInstructor.innerHTML = `
            <div class="font-bold text-ink truncate">${c.instructor ? c.instructor.full_name : "---"}</div>
            <div class="text-[10px] text-mid-gray mt-0.5 truncate">${c.instructor ? c.instructor.email : "---"}</div>
        `;
    tr.appendChild(tdInstructor);

    // 3. Cột Danh mục
    const tdCategory = document.createElement("td");
    tdCategory.className = "p-3 min-w-[180px] text-mid-gray text-[11px]";
    if (c.categories && c.categories.length > 0) {
      const names = c.categories.map((cat) => cat.name);
      if (names.length > 2) {
        tdCategory.innerHTML = `<span class="font-medium text-ink">${names.slice(0, 2).join(", ")}</span> <span class="text-[9px] text-mid-gray font-bold">(+${names.length - 2})</span>`;
      } else {
        tdCategory.innerHTML = `<span class="font-medium text-ink">${names.join(", ")}</span>`;
      }
    } else {
      tdCategory.textContent = "---";
    }
    tr.appendChild(tdCategory);

    // 4. Cột Trình độ
    const tdLevel = document.createElement("td");
    tdLevel.className = "p-3 min-w-[120px] font-medium text-ink";
    const levelMapping = {
      beginner: "Cơ bản",
      intermediate: "Trung cấp",
      advanced: "Nâng cao",
      all_levels: "Mọi trình độ",
    };
    tdLevel.textContent = levelMapping[c.level] || c.level || "---";
    tr.appendChild(tdLevel);

    // 5. Cột Giá bán
    const tdPrice = document.createElement("td");
    tdPrice.className = "p-3 min-w-[140px]";
    if (
      c.sale_price !== null &&
      c.sale_price !== undefined &&
      c.sale_price < c.price
    ) {
      tdPrice.innerHTML = `
                <div class="font-bold text-ink">${formatVND(c.sale_price)}</div>
                <div class="text-[10px] text-mid-gray/80 line-through mt-0.5">${formatVND(c.price)}</div>
            `;
    } else {
      tdPrice.innerHTML = `<div class="font-bold text-ink">${formatVND(c.price)}</div>`;
    }
    tr.appendChild(tdPrice);

    // 6. Cột Học viên
    const tdEnrollments = document.createElement("td");
    tdEnrollments.className =
      "p-3 min-w-[100px] font-semibold text-ink font-sans";
    tdEnrollments.textContent = new Intl.NumberFormat("vi-VN").format(
      c.enrollment_count || 0,
    );
    tr.appendChild(tdEnrollments);

    // 7. Cột Đơn hàng đã thanh toán
    const tdOrders = document.createElement("td");
    tdOrders.className = "p-3 min-w-[125px] font-medium text-ink font-sans";
    tdOrders.textContent = new Intl.NumberFormat("vi-VN").format(
      c.paid_order_count || 0,
    );
    tr.appendChild(tdOrders);

    // 8. Cột Doanh thu
    const tdRevenue = document.createElement("td");
    tdRevenue.className = "p-3 min-w-[150px] font-bold text-ink font-sans";
    tdRevenue.textContent = formatVND(c.gross_revenue);
    tr.appendChild(tdRevenue);

    // 9. Cột Đánh giá
    const tdRating = document.createElement("td");
    tdRating.className = "p-3 min-w-[130px]";
    if (
      c.average_rating !== null &&
      c.average_rating !== undefined &&
      c.review_count > 0
    ) {
      tdRating.innerHTML = `
                <div class="flex items-center gap-1 font-bold text-ink">
                    <span>${c.average_rating}</span>
                    <svg class="w-3.5 h-3.5 fill-current text-warning" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                </div>
                <div class="text-[9px] text-mid-gray mt-0.5">${c.review_count} đánh giá</div>
            `;
    } else {
      tdRating.innerHTML = `<span class="text-mid-gray text-[10px]">Chưa có đánh giá</span>`;
    }
    tr.appendChild(tdRating);

    // 10. Cột Trạng thái
    const tdStatus = document.createElement("td");
    tdStatus.className = "p-3 min-w-[125px]";

    let statusDotClass = "";
    let statusText = "";

    switch (c.status) {
      case "published":
        statusDotClass = "bg-success";
        statusText = "Đã xuất bản";
        break;
      case "pending_review":
        statusDotClass = "bg-warning";
        statusText = "Chờ duyệt";
        break;
      case "approved":
        statusDotClass = "bg-success/50";
        statusText = "Đã duyệt";
        break;
      case "rejected":
        statusDotClass = "bg-danger-brick";
        statusText = "Bị từ chối";
        break;
      case "hidden":
        statusDotClass = "bg-mid-gray";
        statusText = "Đã ẩn";
        break;
      case "draft":
      default:
        statusDotClass = "bg-mid-gray/40";
        statusText = "Bản nháp";
        break;
    }

    const statusSpan = document.createElement("span");
    statusSpan.className = "course-status";
    statusSpan.innerHTML = `<span class="h-1.5 w-1.5 rounded-full ${statusDotClass}"></span><span class="text-xs font-semibold text-ink">${statusText}</span>`;
    tdStatus.appendChild(statusSpan);
    tr.appendChild(tdStatus);

    // 11. Cột Nổi bật
    const tdFeatured = document.createElement("td");
    tdFeatured.className = "p-3 min-w-[95px] text-center";

    const featuredBtn = document.createElement("button");
    featuredBtn.type = "button";
    featuredBtn.className =
      "p-1.5 hover:bg-canvas rounded-[4px] text-mid-gray hover:text-warning transition-all cursor-pointer";
    featuredBtn.setAttribute(
      "aria-label",
      c.is_featured ? "Bỏ nổi bật" : "Đánh dấu nổi bật",
    );

    if (c.is_featured) {
      featuredBtn.classList.remove("text-mid-gray");
      featuredBtn.classList.add("text-warning");
      featuredBtn.innerHTML = `
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
            `;
    } else {
      featuredBtn.innerHTML = `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499c-.107-.218-.284-.39-.504-.5a.557.557 0 0 0-.256-.062c-.087 0-.174.02-.256.062a.608.608 0 0 0-.504.5L7.962 7.625l-4.56.662a.606.606 0 0 0-.441.52.553.553 0 0 0 .114.475L6.378 12.5l-.78 4.542a.557.557 0 0 0 .214.538.599.599 0 0 0 .546.044L10.4 15.48l4.042 2.126a.597.597 0 0 0 .546-.044.557.557 0 0 0 .214-.538l-.78-4.542 3.303-3.218a.553.553 0 0 0 .114-.475.606.606 0 0 0-.441-.52l-4.56-.662-2.008-4.126z"/>
                </svg>
            `;
    }

    featuredBtn.setAttribute("data-no-row-click", "true");
    featuredBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openConfirmFeaturedModal(c.id, !c.is_featured);
    });

    tdFeatured.appendChild(featuredBtn);
    tr.appendChild(tdFeatured);

    // 12. Cột Cập nhật
    const tdUpdate = document.createElement("td");
    tdUpdate.className =
      "p-3 min-w-[130px] text-mid-gray/90 font-medium text-[11px] font-sans";
    tdUpdate.textContent = formatDateTime(c.updated_at).split(" ")[0]; // Chỉ hiện ngày trên table
    tdUpdate.title = `Cập nhật đầy đủ: ${formatDateTime(c.updated_at)}`;
    tr.appendChild(tdUpdate);

    // 13. Cột Thao tác
    const tdActions = document.createElement("td");
    tdActions.className = "p-3 pr-4 min-w-[65px] text-right relative";

    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    actionBtn.className =
      "h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-canvas text-mid-gray hover:text-ink transition-colors cursor-pointer";
    actionBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"/>
            </svg>
        `;

    // Thả nổi Dropdown Action Menu
    const actionMenu = document.createElement("div");
    actionMenu.className =
      "absolute right-4 top-10 w-44 rounded-[6px] border border-hairline bg-paper py-1 shadow-lg hidden z-30 text-left select-none text-[11px]";

    // Thêm các mục hành động
    const addMenuItem = (
      label,
      iconSvg,
      onClick,
      isDanger = false,
      isDisabled = false,
    ) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `w-full px-3 py-1.5 flex items-center gap-2 hover:bg-canvas text-left font-medium transition-colors ${isDanger ? "text-danger-brick hover:bg-danger-brick-soft/10" : "text-ink"}`;
      if (isDisabled) {
        btn.className =
          "w-full px-3 py-1.5 flex items-center gap-2 text-mid-gray/40 bg-transparent text-left font-medium cursor-not-allowed";
        btn.disabled = true;
      }
      btn.innerHTML = `${iconSvg} <span>${label}</span>`;
      if (!isDisabled) {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          actionMenu.classList.add("hidden");
          onClick();
        });
      }
      actionMenu.appendChild(btn);
    };

    // Xem chi tiết
    addMenuItem(
      "Xem chi tiết",
      `
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        `,
      () => showDetailDrawer(c.id),
    );

    // Nổi bật / Bỏ nổi bật
    if (c.is_featured) {
      addMenuItem(
        "Bỏ nổi bật",
        `
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M18.4 12.4L12.4 6.4"/>
                </svg>
            `,
        () => openConfirmFeaturedModal(c.id, false),
      );
    } else {
      addMenuItem(
        "Đánh dấu nổi bật",
        `
                <svg class="w-3.5 h-3.5 text-warning" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499c-.107-.218-.284-.39-.504-.5a.557.557 0 0 0-.256-.062c-.087 0-.174.02-.256.062a.608.608 0 0 0-.504.5L7.962 7.625l-4.56.662a.606.606 0 0 0-.441.52.553.553 0 0 0 .114.475L6.378 12.5l-.78 4.542a.557.557 0 0 0 .214.538.599.599 0 0 0 .546.044L10.4 15.48l4.042 2.126a.597.597 0 0 0 .546-.044.557.557 0 0 0 .214-.538l-.78-4.542 3.303-3.218a.553.553 0 0 0 .114-.475.606.606 0 0 0-.441-.52l-4.56-.662-2.008-4.126z"/>
                </svg>
            `,
        () => openConfirmFeaturedModal(c.id, true),
      );
    }

    // Ẩn / Hiển thị lại (chỉ khả dụng với status tương ứng)
    if (c.status === "published") {
      addMenuItem(
        "Ẩn khóa học",
        `
                <svg class="w-3.5 h-3.5 text-danger-brick" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L17.772 17.772m0 0a3 3 0 11-4.243-4.243m4.242 4.242L22 22M2 2l4.228 4.228"/>
                </svg>
            `,
        () => openConfirmHideModal(c.id),
        true,
      );
    } else if (c.status === "hidden") {
      addMenuItem(
        "Hiển thị lại khóa học",
        `
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            `,
        () => openConfirmShowModal(c.id),
      );
    }

    // Nút "Đi tới kiểm duyệt"
    if (c.status === "pending_review") {
      addMenuItem(
        "Đi tới kiểm duyệt",
        `
              <svg class="w-3.5 h-3.5 text-warning" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
              </svg>
          `,
        (e) => goToCourseReview(c.id, e)
      );
    }

    addMenuItem(
      "Xem đơn hàng",
      `
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect width="18" height="12" x="3" y="6" rx="2" ry="2"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M8 14h.01M12 14h.01M16 14h.01"/>
            </svg>
        `,
      () => {
        window.location.href = `orders.html?course_id=${c.id}`;
      },
    );

    addMenuItem(
      "Xem doanh thu",
      `
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.879m6-6.879a3 3 0 11-4.243-4.242 3 3 0 014.243 4.242z"/>
            </svg>
        `,
      () => {
        window.location.href = `revenues.html?course_id=${c.id}`;
      },
    );

    actionBtn.setAttribute("data-no-row-click", "true");
    actionBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Đóng tất cả dropdown khác
      document.querySelectorAll("[data-row-id] div.absolute").forEach((el) => {
        if (el !== actionMenu) el.classList.add("hidden");
      });
      actionMenu.classList.toggle("hidden");
    });

    tdActions.appendChild(actionBtn);
    tdActions.appendChild(actionMenu);
    tr.appendChild(tdActions);

    tableBody.appendChild(tr);
  });

  // Đăng ký sự kiện Delegated Row Click
  enableTableRowClick({
    container: document.getElementById("courses-table-body"),
    rowSelector: "[data-course-row], [data-row-id]",
    getRowId: (row) => Number(row.dataset.courseId || row.dataset.rowId),
    onOpen: (id) => {
      highlightSelectedRow(id);
      showDetailDrawer(id);
    },
  });
}

let isNavigatingToReview = false;

function goToCourseReview(courseId, event) {
  if (isNavigatingToReview) return;
  const id = Number(courseId);
  if (!Number.isInteger(id) || id <= 0) {
    showToast({
      type: "error",
      title: "Không thể mở kiểm duyệt",
      message: "ID khóa học không hợp lệ."
    });
    return;
  }

  isNavigatingToReview = true;
  if (event && event.currentTarget) {
    event.currentTarget.disabled = true;
  }

  const url = new URL("course-reviews.html", window.location.href);
  url.searchParams.set("open_course_id", String(id));
  window.location.assign(url.toString());
}

/**
 * Đánh dấu dòng đang được xem chi tiết
 */
function highlightSelectedRow(courseId) {
  document
    .querySelectorAll("#courses-table-body tr.is-selected")
    .forEach((r) => r.classList.remove("is-selected"));
  if (courseId) {
    const activeRow = document.querySelector(
      `#courses-table-body tr[data-course-id="${courseId}"]`,
    );
    if (activeRow) activeRow.classList.add("is-selected");
  }
}

/**
 * Đóng action dropdown khi click ra ngoài
 */
function initDropdownCloseEvents() {
  document.addEventListener("click", () => {
    document.querySelectorAll("[data-row-id] div.absolute").forEach((el) => {
      el.classList.add("hidden");
    });
  });
}

/**
 * Render pagination controls lên giao diện
 */
function renderPagination(meta) {
  const rangeEl = document.getElementById("pag-showing-range");
  const totalEl = document.getElementById("pag-total-records");
  const buttonsWrapper = document.getElementById("pagination-buttons");

  if (!meta || meta.total === 0) {
    rangeEl.textContent = "0-0";
    totalEl.textContent = "0";
    buttonsWrapper.innerHTML = "";
    return;
  }

  const start = (meta.current_page - 1) * meta.per_page + 1;
  const end = Math.min(start + meta.per_page - 1, meta.total);
  rangeEl.textContent = `${start}-${end}`;
  totalEl.textContent = meta.total;

  buttonsWrapper.innerHTML = "";

  // Nút Trước
  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = `p-1.5 rounded-full border border-hairline hover:bg-canvas text-ink transition-colors cursor-pointer ${meta.current_page === 1 ? "pointer-events-none opacity-40" : ""}`;
  prevBtn.innerHTML = `
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
        </svg>
    `;
  prevBtn.addEventListener("click", () => {
    if (pageState.page > 1) {
      pageState.page--;
      writeStateToUrl();
      fetchAndRender(true);
    }
  });
  buttonsWrapper.appendChild(prevBtn);

  // Vẽ các trang số (Compact mode)
  const lastPage = meta.last_page;
  const currentPage = meta.current_page;

  // Thuật toán vẽ trang thông minh
  let pageNumbers = [];
  if (lastPage <= 5) {
    for (let i = 1; i <= lastPage; i++) pageNumbers.push(i);
  } else {
    if (currentPage <= 3) {
      pageNumbers = [1, 2, 3, 4, "...", lastPage];
    } else if (currentPage >= lastPage - 2) {
      pageNumbers = [
        1,
        "...",
        lastPage - 3,
        lastPage - 2,
        lastPage - 1,
        lastPage,
      ];
    } else {
      pageNumbers = [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        lastPage,
      ];
    }
  }

  pageNumbers.forEach((p) => {
    if (p === "...") {
      const span = document.createElement("span");
      span.className = "px-2 py-1 text-mid-gray";
      span.textContent = "...";
      buttonsWrapper.appendChild(span);
    } else {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `h-7 min-w-7 flex items-center justify-center text-xs font-semibold rounded-full border transition-all cursor-pointer ${p === currentPage ? "bg-ink text-white border-ink shadow-sm" : "border-hairline hover:bg-canvas text-ink"}`;
      btn.textContent = p;
      btn.addEventListener("click", () => {
        if (pageState.page !== p) {
          pageState.page = p;
          writeStateToUrl();
          fetchAndRender(true);
        }
      });
      buttonsWrapper.appendChild(btn);
    }
  });

  // Nút Sau
  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = `p-1.5 rounded-full border border-hairline hover:bg-canvas text-ink transition-colors cursor-pointer ${currentPage === lastPage ? "pointer-events-none opacity-40" : ""}`;
  nextBtn.innerHTML = `
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
        </svg>
    `;
  nextBtn.addEventListener("click", () => {
    if (pageState.page < lastPage) {
      pageState.page++;
      writeStateToUrl();
      fetchAndRender(true);
    }
  });
  buttonsWrapper.appendChild(nextBtn);
}

/**
 * Hiển thị các Filter Chips đang được lọc
 */
function renderFilterChips() {
  const container = document.getElementById("filter-chips-container");
  const list = document.getElementById("filter-chips-list");

  list.innerHTML = "";

  const chips = [];

  // 1. Search keyword
  if (pageState.search) {
    chips.push({ key: "search", label: `Tìm kiếm: "${pageState.search}"` });
  }

  // 2. Status
  if (pageState.status) {
    const statuses = {
      draft: "Bản nháp",
      pending_review: "Chờ duyệt",
      approved: "Đã duyệt",
      published: "Đã xuất bản",
      rejected: "Bị từ chối",
      hidden: "Đã ẩn",
    };
    chips.push({
      key: "status",
      label: `Trạng thái: ${statuses[pageState.status] || pageState.status}`,
    });
  }

  // 3. Instructor
  if (pageState.instructor_id) {
    const sel = document.getElementById("filter-instructor");
    const activeOpt = sel.querySelector(
      `option[value="${pageState.instructor_id}"]`,
    );
    const name = activeOpt
      ? activeOpt.textContent.split(" (")[0]
      : `ID ${pageState.instructor_id}`;
    chips.push({ key: "instructor_id", label: `Giảng viên: ${name}` });
  }

  // 4. Category
  if (pageState.category_id) {
    const sel = document.getElementById("filter-category");
    const activeOpt = sel.querySelector(
      `option[value="${pageState.category_id}"]`,
    );
    const name = activeOpt
      ? activeOpt.textContent
      : `ID ${pageState.category_id}`;
    chips.push({ key: "category_id", label: `Danh mục: ${name}` });
  }

  // 5. Level
  if (pageState.level) {
    const levels = {
      beginner: "Cơ bản",
      intermediate: "Trung cấp",
      advanced: "Nâng cao",
      all_levels: "Mọi trình độ",
    };
    chips.push({
      key: "level",
      label: `Trình độ: ${levels[pageState.level] || pageState.level}`,
    });
  }

  // 6. Featured
  if (pageState.is_featured) {
    chips.push({
      key: "is_featured",
      label:
        pageState.is_featured === "true" ? "Nổi bật: Có" : "Nổi bật: Không",
    });
  }

  // 7. Date range (Preset hoặc Custom)
  const periodSelect = document.getElementById("filter-period");
  if (
    periodSelect.value === "custom" &&
    (pageState.date_from || pageState.date_to)
  ) {
    let label = "Thời gian: ";
    if (pageState.date_from && pageState.date_to) {
      label += `${pageState.date_from} → ${pageState.date_to}`;
    } else if (pageState.date_from) {
      label += `Từ ${pageState.date_from}`;
    } else {
      label += `Đến ${pageState.date_to}`;
    }
    chips.push({ key: "date_range", label: label });
  } else if (
    periodSelect.value &&
    periodSelect.value !== "all" &&
    periodSelect.value !== "custom"
  ) {
    const labels = {
      7: "7 ngày gần nhất",
      30: "30 ngày gần nhất",
      90: "90 ngày gần nhất",
      365: "1 năm gần nhất",
    };
    chips.push({
      key: "date_range",
      label: `Thời gian: ${labels[periodSelect.value] || periodSelect.value}`,
    });
  }

  if (chips.length === 0) {
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");

  chips.forEach((chip) => {
    const div = document.createElement("div");
    div.className =
      "flex items-center gap-1 bg-paper border border-hairline px-2.5 py-0.5 rounded-[4px] font-medium text-ink";
    div.innerHTML = `
            <span>${chip.label}</span>
            <button type="button" class="text-mid-gray hover:text-danger-brick p-0.5 rounded transition-colors cursor-pointer" aria-label="Xóa bộ lọc ${chip.label}">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;

    // Sự kiện xóa đơn lẻ
    div.querySelector("button").addEventListener("click", () => {
      if (chip.key === "date_range") {
        periodSelect.value = "all";
        document
          .getElementById("custom-date-container")
          .classList.add("hidden");
        pageState.date_from = "";
        pageState.date_to = "";
        document.getElementById("filter-date-from").value = "";
        document.getElementById("filter-date-to").value = "";
      } else if (chip.key === "search") {
        pageState.search = "";
        document.getElementById("filter-search").value = "";
      } else {
        pageState[chip.key] = "";
        const input = document.getElementById(
          `filter-${chip.key.replace("_id", "")}`,
        );
        if (input) input.value = "";
      }

      pageState.page = 1;
      writeStateToUrl();
      fetchAndRender(true);
    });

    list.appendChild(div);
  });
}

/**
 * Gắn các sự kiện cho bộ lọc form
 */
function initFilterEvents() {
  const form = document.getElementById("filter-form");
  const periodSelect = document.getElementById("filter-period");
  const dateFromInput = document.getElementById("filter-date-from");
  const dateToInput = document.getElementById("filter-date-to");
  const searchInput = document.getElementById("filter-search");

  // Xử lý ẩn hiện custom date picker khi thay đổi preset
  periodSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    const container = document.getElementById("custom-date-container");
    if (val === "custom") {
      container.classList.remove("hidden");
    } else {
      container.classList.add("hidden");
      setPresetDates(val);
    }
  });

  // Debounce tìm kiếm (300-500ms)
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => {
      pageState.search = e.target.value;
      pageState.page = 1;
      writeStateToUrl();
      fetchAndRender(true); // Tự cuộn đến danh sách khi debounce xong
    }, 400);
  });

  // Form submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    pageState.search = searchInput.value;
    pageState.status = document.getElementById("filter-status").value;
    pageState.instructor_id =
      document.getElementById("filter-instructor").value;
    pageState.category_id = document.getElementById("filter-category").value;
    pageState.level = document.getElementById("filter-level").value;
    pageState.is_featured = document.getElementById("filter-featured").value;
    pageState.sort_by = document.getElementById("filter-sort").value;

    const period = periodSelect.value;
    if (period === "custom") {
      pageState.date_from = dateFromInput.value;
      pageState.date_to = dateToInput.value;
    } else {
      setPresetDates(period);
    }

    pageState.page = 1;
    writeStateToUrl();
    fetchAndRender(true);
  });

  // Nút đặt lại bộ lọc
  document.getElementById("btn-reset-filters").addEventListener("click", () => {
    resetAllFilters();
  });

  // Nút xóa tất cả chips lọc
  const clearAllChipsBtn = document.getElementById("btn-clear-all-chips");
  if (clearAllChipsBtn) {
    clearAllChipsBtn.addEventListener("click", () => {
      resetAllFilters();
    });
  }

  // Nút đặt lại tại empty state
  document.getElementById("btn-empty-reset").addEventListener("click", () => {
    resetAllFilters();
  });

  // Chọn per_page thay đổi
  document.getElementById("pag-per-page").addEventListener("change", (e) => {
    pageState.per_page = parseInt(e.target.value);
    pageState.page = 1;
    writeStateToUrl();
    fetchAndRender(true);
  });
}

/**
 * Đặt preset ngày theo lựa chọn
 */
function setPresetDates(preset) {
  const dateFromInput = document.getElementById("filter-date-from");
  const dateToInput = document.getElementById("filter-date-to");

  if (preset === "all" || preset === "custom") {
    pageState.date_from = "";
    pageState.date_to = "";
    if (dateFromInput) dateFromInput.value = "";
    if (dateToInput) dateToInput.value = "";
    return;
  }

  const days = parseInt(preset);
  if (isNaN(days)) return;

  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - days);

  // Định dạng local timezone YYYY-MM-DD
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  pageState.date_from = formatDateLocal(fromDate);
  pageState.date_to = formatDateLocal(toDate);

  dateFromInput.value = pageState.date_from;
  dateToInput.value = pageState.date_to;
}

/**
 * Đặt lại toàn bộ bộ lọc về trạng thái mặc định
 */
function resetAllFilters() {
  pageState = {
    search: "",
    status: "",
    instructor_id: "",
    category_id: "",
    level: "",
    is_featured: "",
    date_from: "",
    date_to: "",
    sort_by: "updated_at",
    sort_direction: "desc",
    page: 1,
    per_page: 20,
  };

  document.getElementById("filter-search").value = "";
  document.getElementById("filter-status").value = "";
  document.getElementById("filter-instructor").value = "";
  document.getElementById("filter-category").value = "";
  document.getElementById("filter-level").value = "";
  document.getElementById("filter-featured").value = "";
  document.getElementById("filter-sort").value = "updated_at";

  const periodSelect = document.getElementById("filter-period");
  if (periodSelect) {
    periodSelect.value = "all";
    setPresetDates("all");
  }

  document.getElementById("custom-date-container").classList.add("hidden");
  document.getElementById("pag-per-page").value = 20;

  writeStateToUrl();
  fetchAndRender(true);
}

/**
 * Lắng nghe sự kiện cho Quick Tabs
 */
function initQuickTabsEvents() {
  const tabs = document.querySelectorAll("[data-tab]");
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabVal = btn.getAttribute("data-tab");

      // Cập nhật tab active
      pageState.status = tabVal === "all" ? "" : tabVal;
      // Đồng bộ dropdown lọc status
      document.getElementById("filter-status").value = pageState.status;

      // Reset page về 1
      pageState.page = 1;

      writeStateToUrl();
      fetchAndRender(true); // Cuộn đến danh sách khi đổi tab
    });
  });

  // Sự kiện click card Chờ duyệt trên KPI
  const kpiPendingCard = document.getElementById("kpi-card-pending");
  if (kpiPendingCard) {
    kpiPendingCard.addEventListener("click", () => {
      pageState.status = "pending_review";
      document.getElementById("filter-status").value = "pending_review";
      pageState.page = 1;
      writeStateToUrl();
      fetchAndRender(true);
    });
  }
}

/**
 * Sự kiện Làm mới dữ liệu
 */
function initRefreshEvent() {
  const btn = document.getElementById("btn-refresh-data");
  const icon = document.getElementById("refresh-icon");

  btn.addEventListener("click", () => {
    refreshRotation += 360;
    icon.style.transform = `rotate(${refreshRotation}deg)`;

    // Tải lại dữ liệu trang hiện tại, KHÔNG cuộn trang
    fetchAndRender(false);
    showToast({
      type: "success",
      title: "Làm mới dữ liệu",
      message: "Danh sách khóa học đã được cập nhật thành công.",
    });
  });
}

/**
 * Quản lý các Confirm Modals
 */
function initModalEvents() {
  // Tự động đóng modal khi nhấn nút có thuộc tính data-close-modal
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-close-modal");
      closeModal(modalId);
    });
  });

  // 1. Submit xác nhận Nổi bật
  document
    .getElementById("btn-submit-featured")
    .addEventListener("click", async (e) => {
      if (!activeTargetCourse) return;
      const btn = e.target;

      btn.disabled = true;
      btn.textContent = "Đang xử lý...";

      try {
        const response = await coursesApi.updateCourse(activeTargetCourse.id, {
          is_featured: activeTargetCourse.isFeaturedTarget,
        });

        if (response && response.success) {
          closeModal("confirm-featured-modal");
          showToast({
            type: "success",
            title: activeTargetCourse.isFeaturedTarget
              ? "Đã đánh dấu nổi bật"
              : "Đã bỏ nổi bật",
            message: activeTargetCourse.isFeaturedTarget
              ? `Khóa học "${response.data.title}" đã được thêm vào danh sách nổi bật.`
              : `Khóa học "${response.data.title}" đã được bỏ khỏi danh sách nổi bật.`,
          });

          // Cập nhật lại UI row trong table
          updateTableRowUI(response.data);
          // Cập nhật lại drawer nếu đang mở đúng khóa học này
          if (isDrawerOpenForCourse(response.data.id)) {
            renderDrawerDetails(response.data);
          }

          // Tải lại summary / quick insights từ mock database
          refreshAggregations();
        } else {
          showToast({
            type: "error",
            title: "Thao tác thất bại",
            message: response
              ? response.message
              : "Đã xảy ra lỗi khi cập nhật.",
          });
        }
      } catch (err) {
        console.error(err);
        showToast({
          type: "error",
          title: "Lỗi hệ thống",
          message: "Không thể gửi yêu cầu cập nhật.",
        });
      } finally {
        btn.disabled = false;
        btn.textContent = "Xác nhận";
      }
    });

  // 2. Submit xác nhận Ẩn khóa học
  document
    .getElementById("btn-submit-hide")
    .addEventListener("click", async (e) => {
      if (!activeTargetCourse) return;
      const btn = e.target;

      btn.disabled = true;
      btn.textContent = "Đang ẩn...";

      try {
        const response = await coursesApi.updateCourse(activeTargetCourse.id, {
          status: "hidden",
        });

        if (response && response.success) {
          closeModal("confirm-hide-modal");
          showToast({
            type: "success",
            title: "Ẩn khóa học",
            message: `Đã ẩn thành công khóa học: "${response.data.title}".`,
          });

          updateTableRowUI(response.data);
          if (isDrawerOpenForCourse(response.data.id)) {
            renderDrawerDetails(response.data);
          }

          refreshAggregations();
        } else {
          showToast({
            type: "error",
            title: "Ẩn khóa học thất bại",
            message: response
              ? response.message
              : "Đã xảy ra lỗi khi ẩn khóa học.",
          });
        }
      } catch (err) {
        console.error(err);
        showToast({
          type: "error",
          title: "Lỗi hệ thống",
          message: "Không thể kết nối đến server.",
        });
      } finally {
        btn.disabled = false;
        btn.textContent = "Xác nhận ẩn";
      }
    });

  // 3. Submit xác nhận Hiển thị lại khóa học
  document
    .getElementById("btn-submit-show")
    .addEventListener("click", async (e) => {
      if (!activeTargetCourse) return;
      const btn = e.target;

      btn.disabled = true;
      btn.textContent = "Đang hiển thị...";

      try {
        const response = await coursesApi.updateCourse(activeTargetCourse.id, {
          status: "published",
        });

        if (response && response.success) {
          closeModal("confirm-show-modal");
          showToast({
            type: "success",
            title: "Hiển thị lại khóa học",
            message: `Đã chuyển khóa học về trạng thái công khai: "${response.data.title}".`,
          });

          updateTableRowUI(response.data);
          if (isDrawerOpenForCourse(response.data.id)) {
            renderDrawerDetails(response.data);
          }

          refreshAggregations();
        } else {
          showToast({
            type: "error",
            title: "Thao tác thất bại",
            message: response
              ? response.message
              : "Không thể hiển thị lại khóa học.",
          });
        }
      } catch (err) {
        console.error(err);
        showToast({
          type: "error",
          title: "Lỗi hệ thống",
          message: "Đã xảy ra lỗi trong quá trình xử lý.",
        });
      } finally {
        btn.disabled = false;
        btn.textContent = "Xác nhận hiển thị";
      }
    });
}

/**
 * Tải lại KPI summary và Quick Insights mà không load lại toàn bộ bảng
 */
async function refreshAggregations() {
  try {
    const response = await coursesApi.getCourses(pageState);
    if (response && response.success) {
      renderSummary(response.data.summary);
      renderQuickInsights(response.data.summary);
    }
  } catch (e) {
    console.error("Lỗi khi cập nhật summary nhanh:", e);
  }
}

/**
 * Mở modal xác nhận thay đổi is_featured
 */
function openConfirmFeaturedModal(courseId, nextFeaturedState) {
  coursesApi.getCourse(courseId).then((res) => {
    if (res && res.success) {
      const course = res.data;
      activeTargetCourse = {
        id: courseId,
        isFeaturedTarget: nextFeaturedState,
      };

      document.getElementById("featured-modal-title").textContent =
        nextFeaturedState
          ? "Đánh dấu khóa học nổi bật?"
          : "Bỏ khóa học khỏi danh sách nổi bật?";
      document.getElementById("featured-modal-course-title").textContent =
        course.title;
      document.getElementById("featured-modal-instructor").textContent =
        course.instructor ? course.instructor.full_name : "---";

      const img = document.getElementById("featured-modal-img");
      img.src = course.thumbnail_url || "";
      img.onerror = () => {
        img.src =
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80";
      };

      openModal("confirm-featured-modal");
    }
  });
}

/**
 * Mở modal xác nhận Ẩn khóa học
 */
function openConfirmHideModal(courseId) {
  coursesApi.getCourse(courseId).then((res) => {
    if (res && res.success) {
      const course = res.data;
      activeTargetCourse = { id: courseId };

      document.getElementById("hide-modal-title").textContent = course.title;
      document.getElementById("hide-modal-instructor").textContent =
        course.instructor ? course.instructor.full_name : "---";
      document.getElementById("hide-modal-enrollments").textContent =
        `${new Intl.NumberFormat("vi-VN").format(course.enrollment_count || 0)} học viên`;
      document.getElementById("hide-modal-revenue").textContent = formatVND(
        course.gross_revenue,
      );

      openModal("confirm-hide-modal");
    }
  });
}

/**
 * Mở modal xác nhận Hiển thị lại khóa học
 */
function openConfirmShowModal(courseId) {
  coursesApi.getCourse(courseId).then((res) => {
    if (res && res.success) {
      const course = res.data;
      activeTargetCourse = { id: courseId };

      document.getElementById("show-modal-title").textContent = course.title;
      document.getElementById("show-modal-instructor").textContent =
        course.instructor ? course.instructor.full_name : "---";

      openModal("confirm-show-modal");
    }
  });
}

/**
 * Cập nhật trực tiếp UI một row trong table khi data thay đổi mà không fetch lại toàn bộ danh sách
 */
function updateTableRowUI(course) {
  const row = document.querySelector(`[data-row-id="${course.id}"]`);
  if (!row) return;

  // 1. Cập nhật cột trạng thái
  const statusCol = row.children[9];
  if (statusCol) {
    let statusDotClass = "";
    let statusText = "";
    switch (course.status) {
      case "published":
        statusDotClass = "bg-success";
        statusText = "Đã xuất bản";
        break;
      case "pending_review":
        statusDotClass = "bg-warning";
        statusText = "Chờ duyệt";
        break;
      case "approved":
        statusDotClass = "bg-success/50";
        statusText = "Đã duyệt";
        break;
      case "rejected":
        statusDotClass = "bg-danger-brick";
        statusText = "Bị từ chối";
        break;
      case "hidden":
        statusDotClass = "bg-mid-gray";
        statusText = "Đã ẩn";
        break;
      case "draft":
      default:
        statusDotClass = "bg-mid-gray/40";
        statusText = "Bản nháp";
        break;
    }
    statusCol.innerHTML = `
            <span class="course-status">
                <span class="h-1.5 w-1.5 rounded-full ${statusDotClass}"></span>
                <span class="text-xs font-semibold text-ink">${statusText}</span>
            </span>
        `;
  }

  // 2. Cập nhật cột nổi bật (is_featured)
  const featuredCol = row.children[10];
  if (featuredCol) {
    const btn = featuredCol.querySelector("button");
    if (btn) {
      btn.setAttribute(
        "aria-label",
        course.is_featured ? "Bỏ nổi bật" : "Đánh dấu nổi bật",
      );
      if (course.is_featured) {
        btn.className =
          "p-1.5 hover:bg-canvas rounded-[4px] text-warning transition-all cursor-pointer";
        btn.innerHTML = `
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                `;
      } else {
        btn.className =
          "p-1.5 hover:bg-canvas rounded-[4px] text-mid-gray hover:text-warning transition-all cursor-pointer";
        btn.innerHTML = `
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499c-.107-.218-.284-.39-.504-.5a.557.557 0 0 0-.256-.062c-.087 0-.174.02-.256.062a.608.608 0 0 0-.504.5L7.962 7.625l-4.56.662a.606.606 0 0 0-.441.52.553.553 0 0 0 .114.475L6.378 12.5l-.78 4.542a.557.557 0 0 0 .214.538.599.599 0 0 0 .546.044L10.4 15.48l4.042 2.126a.597.597 0 0 0 .546-.044.557.557 0 0 0 .214-.538l-.78-4.542 3.303-3.218a.553.553 0 0 0 .114-.475.606.606 0 0 0-.441-.52l-4.56-.662-2.008-4.126z"/>
                    </svg>
                `;
      }
    }
  }

  // 3. Cập nhật lại dropdown action menu
  const actionsCol = row.children[12];
  if (actionsCol) {
    const actionMenu = actionsCol.querySelector("div.absolute");
    if (actionMenu) {
      // Xóa hết content cũ và dựng lại item mới khớp status
      actionMenu.innerHTML = "";

      const addMenuItem = (
        label,
        iconSvg,
        onClick,
        isDanger = false,
        isDisabled = false,
      ) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `w-full px-3 py-1.5 flex items-center gap-2 hover:bg-canvas text-left font-medium transition-colors ${isDanger ? "text-danger-brick hover:bg-danger-brick-soft/10" : "text-ink"}`;
        if (isDisabled) {
          btn.className =
            "w-full px-3 py-1.5 flex items-center gap-2 text-mid-gray/40 bg-transparent text-left font-medium cursor-not-allowed";
          btn.disabled = true;
        }
        btn.innerHTML = `${iconSvg} <span>${label}</span>`;
        if (!isDisabled) {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            actionMenu.classList.add("hidden");
            onClick();
          });
        }
        actionMenu.appendChild(btn);
      };

      addMenuItem(
        "Xem chi tiết",
        `
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            `,
        () => showDetailDrawer(course.id),
      );

      if (course.is_featured) {
        addMenuItem(
          "Bỏ nổi bật",
          `
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M18.4 12.4L12.4 6.4"/>
                    </svg>
                `,
          () => openConfirmFeaturedModal(course.id, false),
        );
      } else {
        addMenuItem(
          "Đánh dấu nổi bật",
          `
                    <svg class="w-3.5 h-3.5 text-warning" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499c-.107-.218-.284-.39-.504-.5a.557.557 0 0 0-.256-.062c-.087 0-.174.02-.256.062a.608.608 0 0 0-.504.5L7.962 7.625l-4.56.662a.606.606 0 0 0-.441.52.553.553 0 0 0 .114.475L6.378 12.5l-.78 4.542a.557.557 0 0 0 .214.538.599.599 0 0 0 .546.044L10.4 15.48l4.042 2.126a.597.597 0 0 0 .546-.044.557.557 0 0 0 .214-.538l-.78-4.542 3.303-3.218a.553.553 0 0 0 .114-.475.606.606 0 0 0-.441-.52l-4.56-.662-2.008-4.126z"/>
                    </svg>
                `,
          () => openConfirmFeaturedModal(course.id, true),
        );
      }

      if (course.status === "published") {
        addMenuItem(
          "Ẩn khóa học",
          `
                    <svg class="w-3.5 h-3.5 text-danger-brick" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228A12.4 12.4 0 0117.772 17.772m0 0a3 3 0 11-4.243-4.243m4.242 4.242L22 22M2 2l4.228 4.228"/>
                    </svg>
                `,
          () => openConfirmHideModal(course.id),
          true,
        );
      } else if (course.status === "hidden") {
        addMenuItem(
          "Hiển thị lại khóa học",
          `
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                `,
          () => openConfirmShowModal(course.id),
        );
      }

      if (course.status === "pending_review") {
        addMenuItem(
          "Đi tới kiểm duyệt",
          `
                  <svg class="w-3.5 h-3.5 text-warning" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
                  </svg>
              `,
          (e) => {
            goToCourseReview(course.id, e);
          }
        );
      }

      addMenuItem(
        "Xem đơn hàng",
        `
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <rect width="18" height="12" x="3" y="6" rx="2" ry="2"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M8 14h.01M12 14h.01M16 14h.01"/>
                </svg>
            `,
        () => {
          window.location.href = `orders.html?course_id=${course.id}`;
        },
      );

      addMenuItem(
        "Xem doanh thu",
        `
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.879m6-6.879a3 3 0 11-4.243-4.242 3 3 0 014.243 4.242z"/>
                </svg>
            `,
        () => {
          window.location.href = `revenues.html?course_id=${course.id}`;
        },
      );
    }
  }
}

/**
 * Kiểm tra xem Drawer chi tiết có đang hiển thị thông tin của khóa học có ID này hay không
 */
function isDrawerOpenForCourse(courseId) {
  const drawer = document.getElementById("course-detail-drawer");
  const activeIdEl = document.getElementById("detail-course-id");
  return (
    !drawer.classList.contains("hidden") &&
    activeIdEl &&
    activeIdEl.textContent == courseId
  );
}

/**
 * Quản lý Drawer chi tiết khóa học
 */
function initDrawerEvents() {
  const drawer = document.getElementById("course-detail-drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  const closeBtn = document.getElementById("btn-close-drawer");
  const panel = document.getElementById("drawer-panel");

  closeBtn.addEventListener("click", () => closeCourseDetailDrawer());
  backdrop.addEventListener("click", () => closeCourseDetailDrawer());

  // Phím ESC đóng drawer
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !drawer.classList.contains("hidden")) {
      closeCourseDetailDrawer();
    }
  });
}

/**
 * Đóng Drawer chi tiết khóa học và trả về Promise đợi animation hoàn tất
 */
function closeCourseDetailDrawer() {
  const drawer = document.getElementById("course-detail-drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  const panel = document.getElementById("drawer-panel");

  if (!drawer || drawer.classList.contains("hidden")) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    if (panel) panel.classList.add("translate-x-full");
    if (backdrop) backdrop.classList.add("opacity-0");

    const finishClose = () => {
      drawer.classList.add("hidden");
      highlightSelectedRow(null);
      const activeModal = document.querySelector(
        ".modal-dialog:not(.hidden), div[role='dialog']:not(.hidden)",
      );
      if (!activeModal) {
        document.body.classList.remove("overflow-hidden");
      }
      resolve();
    };

    let handled = false;
    const handler = () => {
      if (handled) return;
      handled = true;
      if (panel) panel.removeEventListener("transitionend", handler);
      finishClose();
    };

    if (panel) panel.addEventListener("transitionend", handler);
    setTimeout(handler, 250);
  });
}

/**
 * Gọi API lấy chi tiết khóa học và hiển thị Drawer
 */
async function showDetailDrawer(courseId) {
  const drawer = document.getElementById("course-detail-drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  const panel = document.getElementById("drawer-panel");
  const loading = document.getElementById("drawer-loading");
  const loadedContent = document.getElementById("drawer-loaded");

  // Reset view
  drawer.classList.remove("hidden");
  loading.classList.remove("hidden");
  loadedContent.classList.add("hidden");
  document.body.classList.add("overflow-hidden");

  // Animation vào
  setTimeout(() => {
    backdrop.classList.remove("opacity-0");
    backdrop.classList.add("opacity-100");
    panel.classList.remove("translate-x-full");
    panel.classList.add("translate-x-0");
  }, 10);

  try {
    const response = await coursesApi.getCourse(courseId);
    if (response && response.success) {
      renderDrawerDetails(response.data);
      loading.classList.add("hidden");
      loadedContent.classList.remove("hidden");
    } else {
      showToast({
        type: "error",
        title: "Lỗi tải chi tiết",
        message: response ? response.message : "Không tìm thấy khóa học này.",
      });
      closeDrawer();
    }
  } catch (e) {
    console.error("Lỗi khi load chi tiết:", e);
    showToast({
      type: "error",
      title: "Lỗi kết nối",
      message: "Không thể kết nối tải thông tin chi tiết.",
    });
    closeDrawer();
  }
}

/**
 * Trình bày chi tiết dữ liệu khóa học vào Panel Drawer
 */
function renderDrawerDetails(course) {
  document.getElementById("detail-course-id").textContent = course.id;
  document.getElementById("detail-title").textContent = course.title;
  document.getElementById("detail-slug").textContent = course.slug;
  document.getElementById("detail-short-desc").textContent =
    course.short_description || "Không có mô tả ngắn.";

  const thumb = document.getElementById("detail-thumbnail");
  thumb.src = course.thumbnail_url || "";
  thumb.onerror = () => {
    thumb.src =
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80";
  };

  // Featured badge
  const featuredBadge = document.getElementById("detail-featured-badge");
  if (course.is_featured) {
    featuredBadge.classList.remove("hidden");
  } else {
    featuredBadge.classList.add("hidden");
  }

  // Status dot
  const statusDot = document.getElementById("detail-status-dot");
  let statusDotClass = "";
  let statusText = "";
  switch (course.status) {
    case "published":
      statusDotClass = "bg-success";
      statusText = "Đã xuất bản";
      break;
    case "pending_review":
      statusDotClass = "bg-warning";
      statusText = "Chờ duyệt";
      break;
    case "approved":
      statusDotClass = "bg-success/50";
      statusText = "Đã duyệt";
      break;
    case "rejected":
      statusDotClass = "bg-danger-brick";
      statusText = "Bị từ chối";
      break;
    case "hidden":
      statusDotClass = "bg-mid-gray";
      statusText = "Đã ẩn";
      break;
    case "draft":
    default:
      statusDotClass = "bg-mid-gray/40";
      statusText = "Bản nháp";
      break;
  }
  statusDot.innerHTML = `<span class="h-1.5 w-1.5 rounded-full ${statusDotClass}"></span><span>Trạng thái: ${statusText}</span>`;

  // Phần 8 – Lý do từ chối (Chỉ hiện khi rejected)
  const rejectReasonSection = document.getElementById(
    "detail-reject-reason-section",
  );
  if (course.status === "rejected" && course.admin_reject_reason) {
    rejectReasonSection.classList.remove("hidden");
    document.getElementById("detail-reject-reason").textContent =
      course.admin_reject_reason;
  } else {
    rejectReasonSection.classList.add("hidden");
  }

  // Phần 2 – Giảng viên
  document.getElementById("detail-instructor-name").textContent =
    course.instructor ? course.instructor.full_name : "---";
  document.getElementById("detail-instructor-email").textContent =
    course.instructor ? course.instructor.email : "---";

  const insStatus = document.getElementById("detail-instructor-status");
  if (course.instructor) {
    insStatus.textContent =
      course.instructor.status === "active"
        ? "Đang hoạt động"
        : "Không hoạt động";
    insStatus.className =
      course.instructor.status === "active"
        ? "text-[10px] font-semibold text-success bg-success-soft px-1.5 py-0.5 rounded border border-success/15"
        : "text-[10px] font-semibold text-mid-gray bg-canvas px-1.5 py-0.5 rounded border border-hairline";
  } else {
    insStatus.textContent = "---";
  }

  // Phần 5 – Danh mục
  const catList = document.getElementById("detail-categories-list");
  catList.innerHTML = "";
  if (course.categories && course.categories.length > 0) {
    course.categories.forEach((cat) => {
      const span = document.createElement("span");
      span.className =
        "text-[10px] font-semibold text-ink bg-canvas px-2.5 py-1 rounded-[4px] border border-hairline";
      span.textContent = cat.name;
      catList.appendChild(span);
    });
  } else {
    catList.innerHTML = `<span class="text-xs text-mid-gray">Không có danh mục.</span>`;
  }

  // Phần 3 – Thông tin chung
  const levelsMapping = {
    beginner: "Cơ bản",
    intermediate: "Trung cấp",
    advanced: "Nâng cao",
    all_levels: "Mọi trình độ",
  };
  document.getElementById("detail-level").textContent =
    levelsMapping[course.level] || course.level || "---";
  document.getElementById("detail-language").textContent =
    course.language || "Tiếng Việt";
  document.getElementById("detail-original-price").textContent = formatVND(
    course.price,
  );
  document.getElementById("detail-sale-price").textContent =
    course.sale_price !== null && course.sale_price !== undefined
      ? formatVND(course.sale_price)
      : "Không khuyến mãi";
  document.getElementById("detail-duration").textContent = formatDuration(
    course.total_duration_seconds,
  );

  const videoUrlEl = document.getElementById("detail-video-url");
  if (course.intro_video_url) {
    videoUrlEl.innerHTML = `<a href="${course.intro_video_url}" target="_blank" class="text-ink hover:underline font-bold flex items-center gap-1"><span>Xem video</span> <svg class="w-3 h-3 inline" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg></a>`;
  } else {
    videoUrlEl.textContent = "Không có video";
  }

  // Phần 4 – Mô tả & Yêu cầu & Kết quả
  document.getElementById("detail-desc").textContent =
    course.description || "Không có nội dung mô tả chi tiết.";

  // Yêu cầu
  const reqList = document.getElementById("detail-requirements");
  reqList.innerHTML = "";
  if (course.requirements && course.requirements.length > 0) {
    course.requirements.forEach((req) => {
      const li = document.createElement("li");
      li.textContent = req;
      reqList.appendChild(li);
    });
  } else {
    reqList.innerHTML = `<li class="list-none text-mid-gray">Không yêu cầu kiến thức trước.</li>`;
  }

  // Kết quả
  const outList = document.getElementById("detail-outcomes");
  outList.innerHTML = "";
  if (course.outcomes && course.outcomes.length > 0) {
    course.outcomes.forEach((out) => {
      const li = document.createElement("li");
      li.textContent = out;
      outList.appendChild(li);
    });
  } else {
    outList.innerHTML = `<li class="list-none text-mid-gray">Không có thông tin kết quả.</li>`;
  }

  // Phần 6 & 7 – Thống kê chỉ số
  const detailSum = course.summary || {};
  document.getElementById("detail-stat-sections").textContent =
    detailSum.section_count || 0;
  document.getElementById("detail-stat-lessons").textContent =
    detailSum.lesson_count || 0;
  document.getElementById("detail-stat-assets").textContent =
    detailSum.asset_count || 0;
  document.getElementById("detail-stat-enrollments").textContent =
    new Intl.NumberFormat("vi-VN").format(course.enrollment_count || 0);
  document.getElementById("detail-stat-paid-orders").textContent =
    new Intl.NumberFormat("vi-VN").format(course.paid_order_count || 0);
  document.getElementById("detail-stat-revenue").textContent = formatVND(
    course.gross_revenue,
  );
  document.getElementById("detail-stat-rating").textContent =
    course.average_rating !== null && course.average_rating !== undefined
      ? course.average_rating.toFixed(1)
      : "0.0";

  // Phần 9 – Hành động Drawer Footer
  const footer = document.getElementById("drawer-actions-footer");
  footer.innerHTML = "";

  // Thêm các nút hành động tương tự dropdown thao tác
  const addFooterBtn = (label, btnClass, onClick) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `px-4 py-1.5 text-xs font-semibold rounded-[6px] transition-colors cursor-pointer ${btnClass}`;
    btn.textContent = label;
    btn.addEventListener("click", onClick);
    footer.appendChild(btn);
  };

  // Lọc trạng thái & gán sự kiện mở Modal từ Drawer (phải đóng Drawer hoàn toàn trước)
  const executeDrawerActionAndOpenModal = async (actionFn) => {
    await closeCourseDetailDrawer();
    actionFn();
  };

  if (course.is_featured) {
    addFooterBtn(
      "Bỏ nổi bật",
      "bg-canvas text-ink hover:bg-hairline border border-hairline",
      () => {
        executeDrawerActionAndOpenModal(() =>
          openConfirmFeaturedModal(course.id, false),
        );
      },
    );
  } else {
    addFooterBtn(
      "Đánh dấu nổi bật",
      "bg-canvas text-warning hover:bg-warning-soft/20 border border-warning/20",
      () => {
        executeDrawerActionAndOpenModal(() =>
          openConfirmFeaturedModal(course.id, true),
        );
      },
    );
  }

  if (course.status === "published") {
    addFooterBtn(
      "Ẩn khóa học",
      "bg-danger-brick text-white hover:opacity-90",
      () => {
        executeDrawerActionAndOpenModal(() => openConfirmHideModal(course.id));
      },
    );
  } else if (course.status === "hidden") {
    addFooterBtn("Hiển thị lại", "bg-ink text-white hover:opacity-90", () => {
      executeDrawerActionAndOpenModal(() => openConfirmShowModal(course.id));
    });
  } else if (course.status === "pending_review") {
    addFooterBtn(
      "Đi tới kiểm duyệt",
      "bg-warning text-ink hover:bg-warning/80",
      (e) => {
        goToCourseReview(course.id, e);
      },
    );
  }
}
