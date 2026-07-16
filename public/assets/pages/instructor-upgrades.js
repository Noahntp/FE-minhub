import * as upgradesApi from "../api/instructor-upgrades-api.js";
import { showToast } from "../toast.js";

// Biến lưu trữ trạng thái hiện tại của trang
let pageState = {
  search: "",
  status: "",
  date_from: "",
  date_to: "",
  sort_by: "newest",
  page: 1,
  per_page: 20,
};

// Biến lưu trữ dữ liệu hồ sơ đang thao tác
let activeTargetRequest = null;
let payoutNumberVisible = false;

// Biến theo dõi góc xoay của nút làm mới
let refreshRotation = 0;

// Cờ theo dõi tự động cuộn đến danh sách sau khi dữ liệu render xong
let shouldScrollToListAfterRender = false;

/**
 * Cuộn mượt đến khu vực danh sách hồ sơ
 */
function scrollToUpgradeList() {
  const target = document.getElementById("upgrade-list-section");
  if (!target) return;

  // Blur ô tìm kiếm để ẩn bàn phím ảo trên mobile
  const searchInput = document.getElementById("filter-search");
  if (searchInput) {
    searchInput.blur();
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  target.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
}

document.addEventListener("DOMContentLoaded", initInstructorUpgradesPage);

async function initInstructorUpgradesPage() {
  console.log("Khởi tạo trang Yêu cầu nâng cấp giảng viên.");
  bindEvents();
  restoreQueryState();
  await loadUpgradeRequests();
}

function bindEvents() {
  initFilterEvents();
  initQuickTabsEvents();
  initRefreshEvent();
  initModalEvents();
  initDropdownAutoClose();

  // Đăng ký click cho 4 KPI Cards dạng button
  const kpiTotalCard = document.getElementById("kpi-card-total");
  if (kpiTotalCard) {
    kpiTotalCard.addEventListener("click", () => {
      const tabBtn = document.querySelector('button[data-tab="all"]');
      if (tabBtn) tabBtn.click();
    });
  }

  const kpiPendingCard = document.getElementById("kpi-card-pending");
  if (kpiPendingCard) {
    kpiPendingCard.addEventListener("click", () => {
      const tabBtn = document.querySelector('button[data-tab="pending"]');
      if (tabBtn) tabBtn.click();
    });
  }

  const kpiApprovedCard = document.getElementById("kpi-card-approved");
  if (kpiApprovedCard) {
    kpiApprovedCard.addEventListener("click", () => {
      const tabBtn = document.querySelector('button[data-tab="approved"]');
      if (tabBtn) tabBtn.click();
    });
  }

  const kpiRejectedCard = document.getElementById("kpi-card-rejected");
  if (kpiRejectedCard) {
    kpiRejectedCard.addEventListener("click", () => {
      const tabBtn = document.querySelector('button[data-tab="rejected"]');
      if (tabBtn) tabBtn.click();
    });
  }

  // Sự kiện click nút "Xem hồ sơ" ở card pending và nút "Xem hồ sơ đang chờ" ở attention panel
  const kpiPendingLink = document.getElementById("kpi-pending-link");
  if (kpiPendingLink) {
    kpiPendingLink.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // Tránh kích hoạt click của kpi-card-pending lần 2
      const tabBtn = document.querySelector('button[data-tab="pending"]');
      if (tabBtn) tabBtn.click();
    });
  }

  const btnShowPendingOnly = document.getElementById("btn-show-pending-only");
  if (btnShowPendingOnly) {
    btnShowPendingOnly.addEventListener("click", (e) => {
      e.preventDefault();
      const tabBtn = document.querySelector('button[data-tab="pending"]');
      if (tabBtn) tabBtn.click();
    });
  }
}

function restoreQueryState() {
  readStateFromUrl();
}

async function loadUpgradeRequests() {
  await fetchAndRender();
}

/**
 * Định dạng ngày giờ Việt Nam (DD/MM/YYYY HH:MM)
 */
function formatDateTime(isoString) {
  if (!isoString) return "Chưa xác định";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Chưa xác định";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Định dạng chỉ ngày Việt Nam (DD/MM/YYYY)
 */
function formatDateOnly(isoString) {
  if (!isoString) return "---";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "---";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
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
  pageState.date_from = params.get("date_from") || "";
  pageState.date_to = params.get("date_to") || "";
  pageState.sort_by = params.get("sort_by") || "newest";
  pageState.page = parseInt(params.get("page")) || 1;
  pageState.per_page = parseInt(params.get("per_page")) || 20;

  // Cập nhật giá trị hiển thị trên các input lọc
  document.getElementById("filter-search").value = pageState.search;
  document.getElementById("filter-status").value = pageState.status;
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

  Object.keys(pageState).forEach((key) => {
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
  const tableBody = document.getElementById("upgrades-table-body");
  const tableLoading = document.getElementById("upgrades-loading-state");
  const tableEmpty = document.getElementById("upgrades-empty-state");
  const tableFilterEmpty = document.getElementById(
    "upgrades-filter-empty-state",
  );
  const tableError = document.getElementById("upgrades-error-state");
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
 * Gọi API lấy danh sách và hiển thị
 */
async function fetchAndRender() {
  toggleLoading(true);

  try {
    const response = await upgradesApi.getUpgradeRequests(pageState);

    if (
      !response ||
      !response.success ||
      !response.data ||
      !response.data.summary ||
      !response.data.items ||
      !response.meta
    ) {
      showErrorState("Dữ liệu Yêu cầu lên giảng viên không đúng API contract.");
      shouldScrollToListAfterRender = false;
      return;
    }

    renderSummary(response.data.summary);
    renderTable(response.data.items);
    renderPagination(response.meta);
    renderFilterChips();
    updateQuickTabsSelection();
    updateLastUpdateTime();

    // Cập nhật thống kê phụ ở khối "Hồ sơ cần xử lý"
    await updateAttentionBox();

    toggleLoading(false);

    // Thực hiện tự động cuộn nếu có yêu cầu trực tiếp từ thao tác người dùng
    if (shouldScrollToListAfterRender) {
      scrollToUpgradeList();
      shouldScrollToListAfterRender = false;
    }
  } catch (error) {
    console.error("Lỗi khi fetch dữ liệu:", error);
    shouldScrollToListAfterRender = false;
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

  document.getElementById("upgrades-table-body").innerHTML = "";
  document.getElementById("upgrades-loading-state").classList.add("hidden");
  document.getElementById("upgrades-empty-state").classList.add("hidden");
  document
    .getElementById("upgrades-filter-empty-state")
    .classList.add("hidden");

  const errorState = document.getElementById("upgrades-error-state");
  errorState.classList.remove("hidden");
  const errorDesc = errorState.querySelector("p");
  if (errorDesc) {
    errorDesc.textContent =
      message ||
      "Đã có lỗi xảy ra trong quá trình kết nối dữ liệu. Vui lòng thử lại.";
  }
}

/**
 * Render dữ liệu summary lên các KPI cards và Quick Tabs
 */
/**
 * Helper tính tỷ lệ phần trăm an toàn
 */
function calculatePercentage(value, total) {
  if (!total || total <= 0) return 0;
  return Math.round((value / total) * 1000) / 10;
}

/**
 * Render dữ liệu summary lên các KPI cards và Quick Tabs
 */
function renderSummary(summary) {
  if (!summary) return;

  const updateText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = new Intl.NumberFormat("vi-VN").format(val || 0);
  };

  // 1. Cập nhật Summary KPI Cards
  updateText("kpi-total", summary.total);
  updateText("kpi-pending", summary.pending);
  updateText("kpi-approved", summary.approved);
  updateText("kpi-rejected", summary.rejected);

  // Cập nhật phân bổ phụ của Card 1
  updateText("kpi-total-pending-sub", summary.pending);
  updateText("kpi-total-approved-sub", summary.approved);
  updateText("kpi-total-rejected-sub", summary.rejected);

  const pendingPercentOfTotal = calculatePercentage(
    summary.pending,
    summary.total,
  );
  const approvedPercentOfTotal = calculatePercentage(
    summary.approved,
    summary.total,
  );
  const rejectedPercentOfTotal = calculatePercentage(
    summary.rejected,
    summary.total,
  );

  const pendingBar = document.getElementById("kpi-total-pending-bar");
  const approvedBar = document.getElementById("kpi-total-approved-bar");
  const rejectedBar = document.getElementById("kpi-total-rejected-bar");

  if (pendingBar) pendingBar.style.width = `${pendingPercentOfTotal}%`;
  if (approvedBar) approvedBar.style.width = `${approvedPercentOfTotal}%`;
  if (rejectedBar) rejectedBar.style.width = `${rejectedPercentOfTotal}%`;

  // Cập nhật tỷ lệ % và Progress Bar của Card 2 (Chờ xử lý)
  const kpiPendingPercentEl = document.getElementById("kpi-pending-percent");
  if (kpiPendingPercentEl) {
    kpiPendingPercentEl.textContent = `${pendingPercentOfTotal.toLocaleString("vi-VN")}% tổng hồ sơ`;
  }
  const kpiPendingBarEl = document.getElementById("kpi-pending-bar");
  if (kpiPendingBarEl) {
    kpiPendingBarEl.style.width = `${pendingPercentOfTotal}%`;
  }

  // Cập nhật tỷ lệ % và Progress Bar của Card 3 (Đã duyệt)
  const processedTotal = summary.approved + summary.rejected;
  const kpiApprovedPercentEl = document.getElementById("kpi-approved-percent");
  const kpiApprovedBarEl = document.getElementById("kpi-approved-bar");

  if (processedTotal > 0) {
    const approvedRate = calculatePercentage(summary.approved, processedTotal);
    if (kpiApprovedPercentEl)
      kpiApprovedPercentEl.textContent = `Tỷ lệ duyệt: ${approvedRate.toLocaleString("vi-VN")}%`;
    if (kpiApprovedBarEl) kpiApprovedBarEl.style.width = `${approvedRate}%`;
  } else {
    if (kpiApprovedPercentEl)
      kpiApprovedPercentEl.textContent = "Chưa có hồ sơ đã xử lý";
    if (kpiApprovedBarEl) kpiApprovedBarEl.style.width = "0%";
  }

  // Cập nhật tỷ lệ % và Progress Bar của Card 4 (Đã từ chối)
  const kpiRejectedPercentEl = document.getElementById("kpi-rejected-percent");
  const kpiRejectedBarEl = document.getElementById("kpi-rejected-bar");

  if (processedTotal > 0) {
    const rejectedRate = calculatePercentage(summary.rejected, processedTotal);
    if (kpiRejectedPercentEl)
      kpiRejectedPercentEl.textContent = `Tỷ lệ từ chối: ${rejectedRate.toLocaleString("vi-VN")}%`;
    if (kpiRejectedBarEl) kpiRejectedBarEl.style.width = `${rejectedRate}%`;
  } else {
    if (kpiRejectedPercentEl)
      kpiRejectedPercentEl.textContent = "Chưa có hồ sơ đã xử lý";
    if (kpiRejectedBarEl) kpiRejectedBarEl.style.width = "0%";
  }

  // 2. Số lượng ở tiêu đề
  updateText("title-total-requests", summary.total);

  // 3. Cập nhật số lượng trên Quick Tabs
  updateQuickTabsCounts(summary);
}

/**
 * Cập nhật số lượng hiển thị trên Quick Tabs
 */
function updateQuickTabsCounts(summary) {
  const counts = {
    all: summary.total,
    pending: summary.pending,
    approved: summary.approved,
    rejected: summary.rejected,
  };

  Object.keys(counts).forEach((tab) => {
    const tabBtn = document.querySelector(`[data-tab="${tab}"]`);
    if (tabBtn) {
      const countSpan = tabBtn.querySelector(".tab-count");
      if (countSpan) {
        countSpan.textContent = new Intl.NumberFormat("vi-VN").format(
          counts[tab] || 0,
        );
      }
    }
  });
}

/**
 * Cập nhật trạng thái Active trực quan cho Quick Tabs dựa trên filter hiện tại
 */
function updateQuickTabsSelection() {
  const tabs = document.querySelectorAll("[data-tab]");
  const activeTab = pageState.status || "all";

  tabs.forEach((tab) => {
    const tabType = tab.getAttribute("data-tab");
    if (tabType === activeTab) {
      tab.className =
        "px-5 py-3 text-xs font-semibold border-b-2 border-ink text-ink select-none whitespace-nowrap cursor-pointer transition-all";
    } else {
      tab.className =
        "px-5 py-3 text-xs font-medium border-b-2 border-transparent text-mid-gray hover:text-ink select-none whitespace-nowrap cursor-pointer transition-all";
    }
  });
}

/**
 * Cập nhật khối thông tin "Tình trạng xử lý hồ sơ" (Quick Insight Bar) dựa trên dữ liệu
 */
async function updateAttentionBox() {
  try {
    const STORAGE_KEY = "mindhub_admin_mock_instructor_upgrades";
    const rawJson = localStorage.getItem(STORAGE_KEY);
    if (!rawJson) return;

    const rawRequests = JSON.parse(rawJson);
    const pendingRequests = rawRequests.filter(
      (r) => r.application_status === "pending",
    );

    // 1. Số hồ sơ chờ xử lý
    document.getElementById("notice-pending-count").textContent =
      `${pendingRequests.length} hồ sơ`;

    // 2. Hồ sơ mới trong vòng 7 ngày gần nhất
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const new7daysRequests = rawRequests.filter(
      (r) => new Date(r.submitted_at) >= sevenDaysAgo,
    );
    document.getElementById("notice-new-7days-count").textContent =
      `${new7daysRequests.length} hồ sơ`;

    // 3. Hồ sơ chờ lâu nhất (submitted_at cũ nhất)
    const oldestDateSubEl = document.getElementById("notice-oldest-date-sub");
    if (pendingRequests.length > 0) {
      const sortedPending = [...pendingRequests].sort(
        (a, b) => new Date(a.submitted_at) - new Date(b.submitted_at),
      );
      const oldestRequest = sortedPending[0];

      const diffTime = Math.abs(now - new Date(oldestRequest.submitted_at));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      document.getElementById("notice-oldest-date").textContent =
        `${diffDays} ngày`;
      if (oldestDateSubEl) {
        oldestDateSubEl.textContent = `Gửi ngày ${formatDateOnly(oldestRequest.submitted_at)}`;
        oldestDateSubEl.classList.remove("text-mid-gray/60", "italic");
      }
    } else {
      document.getElementById("notice-oldest-date").textContent = "0 ngày";
      if (oldestDateSubEl) {
        oldestDateSubEl.textContent = "Không có hồ sơ tồn đọng";
        oldestDateSubEl.classList.add("text-mid-gray/60", "italic");
      }
    }

    // 4. Thời gian xử lý trung bình (reviewed_at - submitted_at)
    const processedRequests = rawRequests.filter(
      (r) =>
        r.application_status !== "pending" && r.reviewed_at && r.submitted_at,
    );
    if (processedRequests.length > 0) {
      const totalDuration = processedRequests.reduce((sum, r) => {
        const duration = new Date(r.reviewed_at) - new Date(r.submitted_at);
        return sum + duration;
      }, 0);
      const avgDurationMs = totalDuration / processedRequests.length;
      const avgDays =
        Math.round((avgDurationMs / (1000 * 60 * 60 * 24)) * 10) / 10;
      document.getElementById("notice-avg-process-time").textContent =
        `${avgDays.toLocaleString("vi-VN")} ngày`;
    } else {
      document.getElementById("notice-avg-process-time").textContent =
        "Chưa có dữ liệu";
    }

    // 5. Thiếu tài khoản nhận tiền hợp lệ
    const noPayoutRequests = pendingRequests.filter(
      (r) =>
        !r.payout_account ||
        r.payout_account.status !== "active" ||
        !r.payout_account.account_name ||
        !r.payout_account.account_number_masked,
    );
    document.getElementById("notice-no-payout-count").textContent =
      `${noPayoutRequests.length} hồ sơ`;
  } catch (e) {
    console.error("Lỗi khi cập nhật Attention Box:", e);
  }
}

/**
 * Render danh sách yêu cầu vào table body
 */
function renderTable(items) {
  const tbody = document.getElementById("upgrades-table-body");
  const emptyState = document.getElementById("upgrades-empty-state");
  const filterEmptyState = document.getElementById(
    "upgrades-filter-empty-state",
  );

  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    // Nếu không có dữ liệu do lọc hay hệ thống rỗng
    if (
      pageState.search ||
      pageState.status ||
      pageState.date_from ||
      pageState.date_to
    ) {
      filterEmptyState.classList.remove("hidden");
    } else {
      emptyState.classList.remove("hidden");
    }
    return;
  }

  emptyState.classList.add("hidden");
  filterEmptyState.classList.add("hidden");

  items.forEach((item) => {
    const tr = document.createElement("tr");
    tr.className =
      "hover:bg-canvas/50 transition-colors group cursor-pointer border-b border-hairline/60";
    tr.setAttribute("data-user-id", item.user.id);

    const firstLetter = item.user.full_name
      ? item.user.full_name.charAt(0).toUpperCase()
      : "U";

    // Trạng thái email verified
    const emailVerifiedBadge = item.user.email_verified_at
      ? `<span class="text-success font-medium flex items-center gap-0.5"><svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>Đã xác minh</span>`
      : `<span class="text-mid-gray font-normal">Chưa xác minh</span>`;

    // Vai trò hiện tại badge (tối giản, góc bo 4px)
    let currentRoleBadge = "";
    if (item.user.role === "admin") {
      currentRoleBadge = `<span class="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-ink text-white ml-1.5 rounded select-none">Admin</span>`;
    } else if (item.user.role === "instructor") {
      currentRoleBadge = `<span class="inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium text-success border border-success/20 bg-success-soft/20 ml-1.5 rounded select-none">Giảng viên</span>`;
    } else {
      currentRoleBadge = `<span class="inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium text-mid-gray border border-hairline bg-canvas ml-1.5 rounded select-none">Học viên</span>`;
    }

    // Chuyên môn (Expertise) giới hạn ký tự
    const rawExpertise = item.instructor_profile.expertise || "Chưa cập nhật";
    const displayExpertise =
      rawExpertise.length > 32
        ? `${rawExpertise.substring(0, 30)}...`
        : rawExpertise;

    // Kinh nghiệm
    const experienceText = `${item.instructor_profile.experience_years} năm`;
    const levelText = item.instructor_profile.level || "Chưa phân cấp";

    // Tài khoản nhận tiền
    let payoutInfoText = "";
    if (item.payout_account) {
      let payoutStatusBadge = "";
      if (item.payout_account.status === "active") {
        payoutStatusBadge = `
                    <span class="inline-flex items-center gap-1.5 text-[10px] font-medium text-success mt-1 select-none">
                        <span class="h-1.5 w-1.5 rounded-full bg-success"></span>Đã kích hoạt
                    </span>
                `;
      } else if (item.payout_account.status === "pending_verification") {
        payoutStatusBadge = `
                    <span class="inline-flex items-center gap-1.5 text-[10px] font-medium text-warning mt-1 select-none">
                        <span class="h-1.5 w-1.5 rounded-full bg-warning animate-pulse"></span>Chờ xác minh
                    </span>
                `;
      } else {
        payoutStatusBadge = `
                    <span class="inline-flex items-center gap-1.5 text-[10px] font-medium text-mid-gray mt-1 select-none">
                        <span class="h-1.5 w-1.5 rounded-full bg-mid-gray"></span>Vô hiệu hóa
                    </span>
                `;
      }

      payoutInfoText = `
                <div class="font-medium text-ink">${item.payout_account.provider}</div>
                <div class="text-[10px] text-mid-gray mt-0.5">${item.payout_account.account_name}</div>
                <div class="text-[10px] font-mono text-mid-gray mt-0.5 font-medium tracking-wide">${item.payout_account.account_number_masked}</div>
                <div class="mt-0.5">${payoutStatusBadge}</div>
            `;
    } else {
      payoutInfoText = `<span class="text-mid-gray/50 italic select-none">Chưa liên kết</span>`;
    }

    // Trạng thái hồ sơ badge (dot + text tối giản)
    let statusBadge = "";
    if (item.application_status === "pending") {
      statusBadge = `
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-warning select-none">
                    <span class="h-1.5 w-1.5 rounded-full bg-warning animate-pulse"></span>Chờ xử lý
                </span>
            `;
    } else if (item.application_status === "approved") {
      statusBadge = `
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-success select-none">
                    <span class="h-1.5 w-1.5 rounded-full bg-success"></span>Đã duyệt
                </span>
            `;
    } else {
      // rejected
      statusBadge = `
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-danger-brick select-none">
                    <span class="h-1.5 w-1.5 rounded-full bg-danger-brick"></span>Đã từ chối
                </span>
            `;
    }

    // Action dropdown buttons
    let actionItems = `
            <button type="button" data-action="view" class="w-full text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-full transition-colors font-medium cursor-pointer">Xem chi tiết</button>
        `;
    if (item.application_status === "pending") {
      actionItems += `
                <div class="h-[1px] bg-hairline my-1 mx-1.5"></div>
                <button type="button" data-action="approve" class="w-full text-left px-3 py-1.5 text-xs hover:bg-canvas rounded-full transition-colors font-semibold text-success cursor-pointer">Duyệt yêu cầu</button>
                <button type="button" data-action="reject" class="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 hover:text-danger-brick rounded-full transition-colors font-semibold text-danger-brick cursor-pointer">Từ chối yêu cầu</button>
            `;
    }

    tr.innerHTML = `
            <td class="p-3.5 pl-5">
                <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-mid-gray font-bold text-xs select-none">
                        ${firstLetter}
                    </div>
                    <div class="min-w-0">
                        <div class="font-bold text-ink text-sm sm:text-xs leading-tight flex items-center">${item.user.full_name}${currentRoleBadge}</div>
                        <div class="text-[10px] text-mid-gray mt-0.5 truncate">${item.user.email}</div>
                    </div>
                </div>
            </td>
            <td class="p-3.5">
                <div class="font-mono text-[11px] text-ink">${item.user.phone || "---"}</div>
                <div class="text-[10px] mt-0.5">${emailVerifiedBadge}</div>
            </td>
            <td class="p-3.5">
                <div class="font-medium text-ink max-w-[200px] truncate" title="${rawExpertise}">${displayExpertise}</div>
            </td>
            <td class="p-3.5">
                <div class="font-medium text-ink">${experienceText}</div>
                <div class="text-[10px] text-mid-gray mt-0.5 font-medium">${levelText}</div>
            </td>
            <td class="p-3.5">${payoutInfoText}</td>
            <td class="p-3.5 text-mid-gray text-[11px]">${formatDateTime(item.submitted_at)}</td>
            <td class="p-3.5">${statusBadge}</td>
            <td class="p-3.5 pr-5 text-right relative" data-action-td>
                <button type="button" class="btn-action-menu p-1.5 rounded-full hover:bg-canvas text-mid-gray hover:text-ink transition-colors inline-block select-none cursor-pointer" aria-label="Xem menu thao tác">
                    <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                    </svg>
                </button>
                <div class="action-dropdown absolute right-5 top-10 z-20 hidden w-40 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left">
                    ${actionItems}
                </div>
            </td>
        `;

    // Click dòng mở drawer chi tiết (ngoại trừ khi click nút hành động)
    tr.addEventListener("click", (e) => {
      const isActionTd =
        e.target.closest("[data-action-td]") ||
        e.target.closest(".action-dropdown");
      if (!isActionTd) {
        openDetailDrawer(item.user.id);
      }
    });

    // Tương tác Dropdown cột Thao tác
    const btnMenu = tr.querySelector(".btn-action-menu");
    const dropdown = tr.querySelector(".action-dropdown");

    btnMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".action-dropdown").forEach((d) => {
        if (d !== dropdown) d.classList.add("hidden");
      });
      dropdown.classList.toggle("hidden");
    });

    dropdown.querySelectorAll("button[data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.add("hidden");
        const action = btn.getAttribute("data-action");
        handleRequestAction(action, item);
      });
    });

    tbody.appendChild(tr);
  });
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
  const activeChips = [];

  const statusMapping = {
    pending: "Chờ xử lý",
    approved: "Đã duyệt",
    rejected: "Đã từ chối",
  };

  if (pageState.search) {
    activeChips.push({
      key: "search",
      label: `Từ khóa: "${pageState.search}"`,
    });
  }
  if (pageState.status) {
    activeChips.push({
      key: "status",
      label: `Trạng thái: ${statusMapping[pageState.status] || pageState.status}`,
    });
  }
  if (pageState.date_from) {
    activeChips.push({
      key: "date_from",
      label: `Từ ngày: ${pageState.date_from}`,
    });
  }
  if (pageState.date_to) {
    activeChips.push({
      key: "date_to",
      label: `Đến ngày: ${pageState.date_to}`,
    });
  }

  if (activeChips.length === 0) {
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");

  activeChips.forEach((chip) => {
    const chipDiv = document.createElement("div");
    chipDiv.className =
      "flex items-center gap-1 bg-canvas hover:bg-hairline text-ink rounded-full px-3 py-1 font-medium border border-hairline transition-colors text-[10px]";

    chipDiv.innerHTML = `
            <span>${chip.label}</span>
            <button type="button" class="text-mid-gray hover:text-ink ml-1 p-0.5 rounded-full transition-colors cursor-pointer" aria-label="Xóa bộ lọc ${chip.label}">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;

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
  } else if (key === "status") {
    document.getElementById("filter-status").value = "";
  } else if (key === "date_from") {
    document.getElementById("filter-date-from").value = "";
  } else if (key === "date_to") {
    document.getElementById("filter-date-to").value = "";
  }

  pageState.page = 1;
  shouldScrollToListAfterRender = true;
  writeStateToUrl();
  fetchAndRender();
}

/**
 * Chuyển trang phân trang
 */
function changePage(pageNumber) {
  pageState.page = pageNumber;
  shouldScrollToListAfterRender = true;
  writeStateToUrl();
  fetchAndRender();
}

/**
 * Khởi tạo các sự kiện lọc dữ liệu
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
    pageState.status = formData.get("status");
    pageState.sort_by = formData.get("sort_by");
    pageState.date_from = formData.get("date_from");
    pageState.date_to = formData.get("date_to");
    pageState.page = 1;

    shouldScrollToListAfterRender = true;
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
      status: "",
      date_from: "",
      date_to: "",
      sort_by: "newest",
      page: 1,
      per_page: pageState.per_page,
    };
    shouldScrollToListAfterRender = true;
    writeStateToUrl();
    fetchAndRender();
  });

  clearAllChipsBtn.addEventListener("click", () => {
    document.getElementById("btn-reset-filters").click();
  });

  // Debounce tìm kiếm
  let debounceTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      pageState.search = searchInput.value;
      pageState.page = 1;
      shouldScrollToListAfterRender = true;
      writeStateToUrl();
      fetchAndRender();
    }, 400);
  });

  perPageSelect.addEventListener("change", () => {
    pageState.per_page = parseInt(perPageSelect.value) || 20;
    pageState.page = 1;
    shouldScrollToListAfterRender = true;
    writeStateToUrl();
    fetchAndRender();
  });

  emptyResetBtn.addEventListener("click", () => {
    document.getElementById("btn-reset-filters").click();
  });

  errorRetryBtn.addEventListener("click", () => {
    shouldScrollToListAfterRender = true;
    fetchAndRender();
  });
}

/**
 * Đăng ký click Quick Tabs (Lọc nhanh) và nút "Xem hồ sơ đang chờ"
 */
function initQuickTabsEvents() {
  const tabs = document.querySelectorAll("[data-tab]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabType = tab.getAttribute("data-tab");
      pageState.status = tabType === "all" ? "" : tabType;

      // Đồng bộ ngược lại dropdown
      document.getElementById("filter-status").value = pageState.status;

      pageState.page = 1;
      shouldScrollToListAfterRender = true;
      writeStateToUrl();
      fetchAndRender();
    });
  });

  // Sự kiện nút "Xem hồ sơ đang chờ"
  const btnShowPending = document.getElementById("btn-show-pending-only");
  if (btnShowPending) {
    btnShowPending.addEventListener("click", () => {
      pageState.status = "pending";
      document.getElementById("filter-status").value = "pending";
      pageState.page = 1;
      shouldScrollToListAfterRender = true;
      writeStateToUrl();
      fetchAndRender();
    });
  }
}

/**
 * Đăng ký sự kiện nút làm mới dữ liệu
 */
function initRefreshEvent() {
  const btnRefresh = document.getElementById("btn-refresh-data");
  const refreshIcon = document.getElementById("refresh-icon");

  btnRefresh.addEventListener("click", async () => {
    if (btnRefresh.disabled) return;

    refreshRotation += 360;
    refreshIcon.style.transform = `rotate(${refreshRotation}deg)`;

    btnRefresh.disabled = true;
    btnRefresh.classList.add("opacity-50");

    try {
      await fetchAndRender();
      showToast({
        type: "success",
        title: "Cập nhật thành công",
        message: "Đã làm mới dữ liệu hệ thống.",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Lỗi",
        message: "Không thể làm mới dữ liệu.",
      });
    } finally {
      btnRefresh.disabled = false;
      btnRefresh.classList.remove("opacity-50");
    }
  });
}

/**
 * Đóng dropdown khi click ngoài
 */
function initDropdownAutoClose() {
  document.addEventListener("click", () => {
    document
      .querySelectorAll(".action-dropdown")
      .forEach((d) => d.classList.add("hidden"));
  });
}

/**
 * Điều phối hành động Thao tác
 */
function handleRequestAction(action, request) {
  activeTargetRequest = request;

  if (action === "view") {
    openDetailDrawer(request.user.id);
  } else if (action === "approve") {
    openApproveModal(request);
  } else if (action === "reject") {
    openRejectModal(request);
  }
}

/**
 * Khởi tạo sự kiện mở/đóng Modal & các nút xác nhận
 */
function initModalEvents() {
  // Sự kiện đóng modal bằng button
  const closeButtons = document.querySelectorAll("[data-close-modal]");
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-close-modal");
      closeModalEl(modalId);
    });
  });

  // 1. Phê duyệt Duyệt yêu cầu
  const btnSubmitApprove = document.getElementById("btn-submit-approve");
  btnSubmitApprove.addEventListener("click", async () => {
    if (!activeTargetRequest) return;
    if (btnSubmitApprove.disabled) return;

    setButtonLoading(btnSubmitApprove, true, "Đang phê duyệt...");

    try {
      const response = await upgradesApi.approveUpgradeRequest(
        activeTargetRequest.user.id,
      );
      setButtonLoading(btnSubmitApprove, false, "Xác nhận duyệt");
      closeModalEl("confirm-approve-modal");

      if (response.success) {
        showToast({
          type: "success",
          title: "Thành công",
          message: `Đã nâng cấp quyền Giảng viên cho tài khoản ${activeTargetRequest.user.full_name}.`,
        });

        // Cập nhật lại Drawer chi tiết nếu đang mở chính hồ sơ đó
        const drawer = document.getElementById("upgrade-detail-drawer");
        if (
          !drawer.classList.contains("translate-x-full") &&
          activeTargetRequest.user.id === activeTargetRequest.user.id
        ) {
          openDetailDrawer(activeTargetRequest.user.id);
        }

        shouldScrollToListAfterRender = true;
        fetchAndRender();
      } else {
        if (response.error_code === 409) {
          showToast({
            type: "warning",
            title: "Xử lý xung đột",
            message: response.message,
          });
          shouldScrollToListAfterRender = true;
          fetchAndRender();
        } else {
          showToast({
            type: "error",
            title: "Thất bại",
            message: response.message,
          });
        }
      }
    } catch (error) {
      setButtonLoading(btnSubmitApprove, false, "Xác nhận duyệt");
      showToast({
        type: "error",
        title: "Lỗi hệ thống",
        message: "Lỗi xử lý duyệt yêu cầu.",
      });
    }
  });

  // 2. Phê duyệt Từ chối yêu cầu
  const btnSubmitReject = document.getElementById("btn-submit-reject");
  btnSubmitReject.addEventListener("click", async () => {
    if (!activeTargetRequest) return;
    if (btnSubmitReject.disabled) return;

    setButtonLoading(btnSubmitReject, true, "Đang xử lý từ chối...");

    try {
      const response = await upgradesApi.rejectUpgradeRequest(
        activeTargetRequest.user.id,
      );
      setButtonLoading(btnSubmitReject, false, "Xác nhận từ chối");
      closeModalEl("confirm-reject-modal");

      if (response.success) {
        showToast({
          type: "success",
          title: "Thành công",
          message: `Đã từ chối yêu cầu nâng cấp của ${activeTargetRequest.user.full_name}.`,
        });

        // Cập nhật lại Drawer chi tiết nếu đang mở chính hồ sơ đó
        const drawer = document.getElementById("upgrade-detail-drawer");
        if (
          !drawer.classList.contains("translate-x-full") &&
          activeTargetRequest.user.id === activeTargetRequest.user.id
        ) {
          openDetailDrawer(activeTargetRequest.user.id);
        }

        shouldScrollToListAfterRender = true;
        fetchAndRender();
      } else {
        if (response.error_code === 409) {
          showToast({
            type: "warning",
            title: "Xử lý xung đột",
            message: response.message,
          });
          shouldScrollToListAfterRender = true;
          fetchAndRender();
        } else {
          showToast({
            type: "error",
            title: "Thất bại",
            message: response.message,
          });
        }
      }
    } catch (error) {
      setButtonLoading(btnSubmitReject, false, "Xác nhận từ chối");
      showToast({
        type: "error",
        title: "Lỗi hệ thống",
        message: "Lỗi xử lý từ chối yêu cầu.",
      });
    }
  });
}

/**
 * Mở Drawer chi tiết hồ sơ
 */
async function openDetailDrawer(userId) {
  try {
    const response = await upgradesApi.getUpgradeRequest(userId);
    if (!response.success) {
      showToast({ type: "error", title: "Lỗi", message: response.message });
      return;
    }

    const request = response.data;
    activeTargetRequest = request;
    payoutNumberVisible = false; // Mặc định ẩn số tài khoản

    // 1. Tải thông tin Avatar & Header Drawer
    document.getElementById("drawer-name").textContent = request.user.full_name;
    document.getElementById("drawer-email").textContent = request.user.email;
    document.getElementById("drawer-avatar").textContent = request.user
      .full_name
      ? request.user.full_name.charAt(0).toUpperCase()
      : "U";

    const badgesContainer = document.getElementById("drawer-badges");
    badgesContainer.innerHTML = "";

    // Badge Vai trò hiện tại (tối giản, bo góc 4px)
    if (request.user.role === "admin") {
      badgesContainer.innerHTML += `<span class="px-2 py-0.5 text-[10px] font-bold bg-ink text-white rounded">Quản trị viên</span>`;
    } else if (request.user.role === "instructor") {
      badgesContainer.innerHTML += `<span class="px-2 py-0.5 text-[10px] font-medium text-success border border-success/20 bg-success-soft/20 rounded">Giảng viên</span>`;
    } else {
      badgesContainer.innerHTML += `<span class="px-2 py-0.5 text-[10px] font-medium text-mid-gray border border-hairline bg-canvas rounded">Học viên</span>`;
    }

    // Badge Trạng thái hồ sơ (tối giản, bo góc 4px)
    if (request.application_status === "pending") {
      badgesContainer.innerHTML += `<span class="px-2 py-0.5 text-[10px] font-semibold text-warning border border-warning/20 bg-warning-soft/20 rounded">Hồ sơ chờ xử lý</span>`;
    } else if (request.application_status === "approved") {
      badgesContainer.innerHTML += `<span class="px-2 py-0.5 text-[10px] font-semibold text-success border border-success/20 bg-success-soft/20 rounded">Đã phê duyệt</span>`;
    } else {
      badgesContainer.innerHTML += `<span class="px-2 py-0.5 text-[10px] font-semibold text-danger-brick border border-danger-brick/20 bg-danger-brick-soft/20 rounded">Bị từ chối</span>`;
    }

    // SECTION 1: Người dùng
    document.getElementById("drawer-info-name").textContent =
      request.user.full_name;
    document.getElementById("drawer-info-email").textContent =
      request.user.email;
    document.getElementById("drawer-info-phone").textContent =
      request.user.phone || "---";

    const roleMapping = {
      admin: "Quản trị viên",
      instructor: "Giảng viên",
      learner: "Học viên",
    };
    const userStatusMapping = {
      active: "Đang hoạt động",
      inactive: "Không hoạt động",
      locked: "Đã khóa",
    };
    document.getElementById("drawer-info-role").textContent =
      roleMapping[request.user.role] || request.user.role;
    document.getElementById("drawer-info-status").textContent =
      userStatusMapping[request.user.status] || request.user.status;
    document.getElementById("drawer-info-verified").textContent = request.user
      .email_verified_at
      ? formatDateTime(request.user.email_verified_at)
      : "Chưa xác minh";

    // SECTION 2: Hồ sơ
    document.getElementById("drawer-info-bio").textContent =
      request.instructor_profile.bio || "Không có giới thiệu bản thân.";
    document.getElementById("drawer-info-expertise").textContent =
      request.instructor_profile.expertise || "---";
    document.getElementById("drawer-info-experience").textContent =
      `${request.instructor_profile.experience_years} năm`;
    document.getElementById("drawer-info-level").textContent =
      request.instructor_profile.level || "Chưa phân cấp";

    // SECTION 3: Tài khoản nhận tiền
    const payoutInfo = document.getElementById("drawer-payout-info");
    const payoutEmpty = document.getElementById("drawer-payout-empty");
    if (request.payout_account) {
      payoutInfo.classList.remove("hidden");
      payoutEmpty.classList.add("hidden");

      document.getElementById("drawer-info-payout-provider").textContent =
        request.payout_account.provider;
      document.getElementById("drawer-info-payout-name").textContent =
        request.payout_account.account_name;

      // Render số tài khoản dạng che trước
      document.getElementById("drawer-info-payout-number").textContent =
        request.payout_account.account_number_masked;

      const payoutStatusMapping = {
        active: "Đang hoạt động",
        inactive: "Vô hiệu hóa",
      };
      document.getElementById("drawer-info-payout-status").textContent =
        payoutStatusMapping[request.payout_account.status] ||
        request.payout_account.status;
      document.getElementById("drawer-info-payout-connected").textContent =
        formatDateTime(request.payout_account.connected_at);

      // Xử lý nút mắt ẩn/hiện số tài khoản
      const eyeOpenIcon = document.querySelector(
        "#drawer-payout-toggle-visibility .eye-open",
      );
      const eyeClosedIcon = document.querySelector(
        "#drawer-payout-toggle-visibility .eye-closed",
      );
      eyeOpenIcon.classList.remove("hidden");
      eyeClosedIcon.classList.add("hidden");

      const toggleBtn = document.getElementById(
        "drawer-payout-toggle-visibility",
      );
      toggleBtn.onclick = () => {
        payoutNumberVisible = !payoutNumberVisible;
        if (payoutNumberVisible) {
          // Show full account number (Lấy từ detail)
          document.getElementById("drawer-info-payout-number").textContent =
            request.payout_account.account_number;
          eyeOpenIcon.classList.add("hidden");
          eyeClosedIcon.classList.remove("hidden");
        } else {
          // Show masked account number
          document.getElementById("drawer-info-payout-number").textContent =
            request.payout_account.account_number_masked;
          eyeOpenIcon.classList.remove("hidden");
          eyeClosedIcon.classList.add("hidden");
        }
      };
    } else {
      payoutInfo.classList.add("hidden");
      payoutEmpty.classList.remove("hidden");
    }

    // SECTION 4: Thông tin xử lý
    const appStatusMapping = {
      pending: "Chờ xử lý",
      approved: "Đã duyệt",
      rejected: "Đã từ chối",
    };
    document.getElementById("drawer-info-app-status").textContent =
      appStatusMapping[request.application_status];
    document.getElementById("drawer-info-submitted").textContent =
      formatDateTime(request.submitted_at);

    const reviewedWrapper = document.getElementById(
      "drawer-info-reviewed-wrapper",
    );
    const noteWrapper = document.getElementById("drawer-info-note-wrapper");

    if (request.application_status !== "pending") {
      reviewedWrapper.classList.remove("hidden");
      document.getElementById("drawer-info-reviewed").textContent =
        formatDateTime(request.reviewed_at);

      if (request.review_note) {
        noteWrapper.classList.remove("hidden");
        document.getElementById("drawer-info-note").textContent =
          request.review_note;
      } else {
        noteWrapper.classList.add("hidden");
      }
    } else {
      reviewedWrapper.classList.add("hidden");
      noteWrapper.classList.add("hidden");
    }

    // SECTION 5: Chân nút Drawer (Actions)
    renderDrawerActions(request);

    // Mở drawer với animation trượt mượt mà
    const overlay = document.getElementById("drawer-overlay");
    const drawer = document.getElementById("upgrade-detail-drawer");

    overlay.classList.remove("hidden");
    drawer.classList.remove("hidden");

    setTimeout(() => {
      overlay.classList.remove("opacity-0", "pointer-events-none");
      overlay.classList.add("opacity-100");

      drawer.classList.remove("translate-x-full");
      drawer.classList.add("translate-x-0");
    }, 10);
  } catch (error) {
    console.error(error);
    showToast({
      type: "error",
      title: "Lỗi",
      message: "Đã xảy ra lỗi khi mở drawer chi tiết.",
    });
  }
}

/**
 * Render chân nút Drawer
 */
function renderDrawerActions(request) {
  const container = document.getElementById("drawer-actions");
  container.innerHTML = "";

  const executeActionFromDrawer = async (actionFn) => {
    await closeDetailDrawer();
    actionFn();
  };

  if (request.application_status === "pending") {
    // Nút Duyệt
    const approveBtn = document.createElement("button");
    approveBtn.type = "button";
    approveBtn.className =
      "px-5 py-1.5 text-xs font-semibold rounded-[6px] bg-success text-white hover:opacity-90 transition-opacity cursor-pointer";
    approveBtn.textContent = "Duyệt yêu cầu";
    approveBtn.addEventListener("click", () => executeActionFromDrawer(() => openApproveModal(request)));
    container.appendChild(approveBtn);

    // Nút Từ chối
    const rejectBtn = document.createElement("button");
    rejectBtn.type = "button";
    rejectBtn.className =
      "px-5 py-1.5 text-xs font-semibold rounded-[6px] bg-danger-brick text-white hover:opacity-90 transition-opacity cursor-pointer";
    rejectBtn.textContent = "Từ chối yêu cầu";
    rejectBtn.addEventListener("click", () => executeActionFromDrawer(() => openRejectModal(request)));
    container.appendChild(rejectBtn);
  } else {
    // Nhãn hiển thị kết quả
    const label = document.createElement("div");
    if (request.application_status === "approved") {
      label.className =
        "px-4 py-1.5 text-xs font-semibold rounded-[6px] bg-success-soft text-success border border-success/20 select-none";
      label.textContent = "Yêu cầu đã được phê duyệt thành công";
    } else {
      label.className =
        "px-4 py-1.5 text-xs font-semibold rounded-[6px] bg-danger-brick-soft text-danger-brick border border-danger-brick/10 select-none";
      label.textContent = "Yêu cầu đã bị từ chối";
    }
    container.appendChild(label);
  }
}

/**
 * Đóng Drawer xem chi tiết và trả về Promise chờ animation kết thúc
 */
function closeDetailDrawer() {
  const overlay = document.getElementById("drawer-overlay");
  const drawer = document.getElementById("upgrade-detail-drawer");

  if (!drawer || drawer.classList.contains("hidden") || drawer.classList.contains("translate-x-full")) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    if (overlay) {
      overlay.classList.remove("opacity-100");
      overlay.classList.add("opacity-0", "pointer-events-none");
    }
    if (drawer) {
      drawer.classList.remove("translate-x-0");
      drawer.classList.add("translate-x-full");
    }

    const finishClose = () => {
      if (overlay) overlay.classList.add("hidden");
      if (drawer) drawer.classList.add("hidden");
      resolve();
    };

    let handled = false;
    const handler = () => {
      if (handled) return;
      handled = true;
      if (drawer) drawer.removeEventListener("transitionend", handler);
      finishClose();
    };

    if (drawer) drawer.addEventListener("transitionend", handler);
    setTimeout(handler, 250);
  });
}

/**
 * Mở Modal Phê duyệt
 */
function openApproveModal(request) {
  activeTargetRequest = request;

  document.getElementById("approve-name").textContent = request.user.full_name;
  document.getElementById("approve-email").textContent = request.user.email;
  document.getElementById("approve-expertise").textContent =
    request.instructor_profile.expertise || "---";
  document.getElementById("approve-experience").textContent =
    `${request.instructor_profile.experience_years} năm (${request.instructor_profile.level || "Chưa phân cấp"})`;

  const payoutStatusEl = document.getElementById("approve-payout-status");
  if (request.payout_account) {
    if (request.payout_account.status === "active") {
      payoutStatusEl.className = "font-semibold text-success";
      payoutStatusEl.textContent = `Đã kết nối (${request.payout_account.provider})`;
    } else {
      payoutStatusEl.className = "font-semibold text-warning";
      payoutStatusEl.textContent = `Vô hiệu hóa (${request.payout_account.provider})`;
    }
  } else {
    payoutStatusEl.className = "font-semibold text-danger-brick";
    payoutStatusEl.textContent = "Chưa kết nối";
  }

  openModalEl("confirm-approve-modal");
}

/**
 * Mở Modal Từ chối (Không textarea lý do theo yêu cầu Backend GD1)
 */
function openRejectModal(request) {
  activeTargetRequest = request;

  document.getElementById("reject-name").textContent = request.user.full_name;
  document.getElementById("reject-email").textContent = request.user.email;
  document.getElementById("reject-expertise").textContent =
    request.instructor_profile.expertise || "---";
  document.getElementById("reject-date").textContent = formatDateTime(
    request.submitted_at,
  );

  openModalEl("confirm-reject-modal");
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
 * Thiết lập loading state cho button (chống double click)
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
 * Gắn sự kiện đóng Drawer và thoát modal bằng nút ESC
 */
function initActionEventsForDrawer() {
  const overlay = document.getElementById("drawer-overlay");
  const closeBtn = document.getElementById("btn-close-drawer");

  overlay.addEventListener("click", closeDetailDrawer);
  closeBtn.addEventListener("click", closeDetailDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDetailDrawer();
      closeModalEl("confirm-approve-modal");
      closeModalEl("confirm-reject-modal");
    }
  });
}

initActionEventsForDrawer();
