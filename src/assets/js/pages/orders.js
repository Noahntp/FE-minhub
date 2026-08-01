import { getOrders, getOrder, getOrderStatusMeta, getPaymentStatusMeta, isValidOrderPaymentPair } from "@/assets/js/api/orders-api.js";
import { showToast } from "@/assets/js/toast.js";

// Global State
const state = {
  page: 1,
  per_page: 20,
  status: "all",
  search_text: "",
  open_order_id: null,
};

/**
 * Format tiền tệ VND
 */
function formatVND(amountStr) {
  const num = Number(amountStr) || 0;
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(num)
    .replace("₫", "đ");
}

/**
 * Format ngày giờ dd/mm/yyyy HH:mm
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

export async function initPage() {
  console.log("Đã tải trang: Đơn hàng và thanh toán (React integrated)");

  // 1. Đọc query params
  const params = new URLSearchParams(window.location.search);
  state.status = params.get("status") || "all";
  state.search_text = params.get("search") || "";
  state.open_order_id = params.get("open_order_id") || null;

  // Sync UI filters
  const searchInput = document.getElementById("search-order");
  const statusSelect = document.getElementById("filter-status");

  if (searchInput) searchInput.value = state.search_text;
  if (statusSelect) statusSelect.value = state.status;

  // 2. Gắn sự kiện bộ lọc
  searchInput?.addEventListener("input", (e) => {
    state.search_text = e.target.value;
    state.page = 1;
    fetchAndRenderOrders();
  });

  statusSelect?.addEventListener("change", (e) => {
    state.status = e.target.value;
    state.page = 1;
    fetchAndRenderOrders();
  });

  // 3. Khởi tạo Drawer events
  initDrawer();

  // 4. Fetch & Render
  await fetchAndRenderOrders();

  // 5. Kiểm tra tự động mở drawer từ deep link
  if (state.open_order_id) {
    openOrderDrawer(state.open_order_id);
  }
}

async function fetchAndRenderOrders() {
  const tbody = document.getElementById("orders-tbody");
  const emptyState = document.getElementById("orders-empty");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-mid-gray animate-pulse">Đang tải dữ liệu...</td></tr>`;

  try {
    const res = await getOrders({
      page: state.page,
      per_page: state.per_page,
      status: state.status,
      search: state.search_text,
    });

    if (res && res.success) {
      const { items, summary } = res.data;
      
      // Update KPIs
      const kpiTotal = document.getElementById("kpi-total-orders");
      const kpiPending = document.getElementById("kpi-pending-orders");
      const kpiPaid = document.getElementById("kpi-paid-orders");
      const kpiFailed = document.getElementById("kpi-failed-orders");

      if (kpiTotal) kpiTotal.textContent = summary.total_orders;
      if (kpiPending) kpiPending.textContent = summary.pending_orders;
      if (kpiPaid) kpiPaid.textContent = summary.paid_orders;
      if (kpiFailed) kpiFailed.textContent = Number(summary.failed_orders) + Number(summary.cancelled_orders) + Number(summary.expired_orders);

      tbody.innerHTML = "";

      if (items.length === 0) {
        emptyState?.classList.remove("hidden");
        return;
      }
      emptyState?.classList.add("hidden");

      items.forEach((order) => {
        const tr = document.createElement("tr");
        tr.className = "border-b border-hairline hover:bg-canvas/50 transition-colors cursor-pointer";
        tr.setAttribute("data-order-id", order.id);

        const statusMeta = getOrderStatusMeta(order.status);
        let statusBadgeClass = "bg-canvas text-mid-gray border border-hairline";
        if (order.status === "paid") statusBadgeClass = "bg-success-soft text-success border border-success/15";
        else if (order.status === "pending") statusBadgeClass = "bg-warning-soft text-warning border border-warning/15";
        else if (order.status === "failed" || order.status === "cancelled") statusBadgeClass = "bg-danger-brick-soft text-danger-brick border border-danger-brick/15";

        tr.innerHTML = `
          <td class="px-4 py-3 font-mono font-bold text-ink">#${order.order_code}</td>
          <td class="px-4 py-3">
            <span class="font-semibold text-ink block">${order.user?.full_name || "Khách"}</span>
            <span class="text-[11px] text-mid-gray block">${order.user?.email || ""}</span>
          </td>
          <td class="px-4 py-3 truncate max-w-[200px]" title="${order.course?.title || ""}">
            ${order.course?.title || "---"}
          </td>
          <td class="px-4 py-3 text-right font-semibold text-ink font-sans">${formatVND(order.amount)}</td>
          <td class="px-4 py-3 capitalize text-xs text-mid-gray">${order.payment_method === "vnpay" ? "VNPay" : order.payment_method === "momo" ? "MoMo" : order.payment_method === "bank_transfer" ? "Chuyển khoản" : "Miễn phí"}</td>
          <td class="px-4 py-3">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeClass}">${statusMeta.label}</span>
          </td>
          <td class="px-4 py-3 text-xs text-mid-gray font-sans">${formatDateTime(order.created_at).split(" ")[0]}</td>
          <td class="px-4 py-3 text-center">
            <button class="text-ink hover:underline font-semibold text-xs transition-opacity cursor-pointer">Xem</button>
          </td>
        `;

        tr.addEventListener("click", () => {
          openOrderDrawer(order.id);
        });

        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error("Lỗi fetch đơn hàng:", err);
    tbody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-danger-brick">Lỗi tải dữ liệu. Vui lòng thử lại.</td></tr>`;
  }
}

function initDrawer() {
  const drawer = document.getElementById("order-detail-drawer");
  const panel = document.getElementById("drawer-panel");
  const backdrop = document.getElementById("drawer-backdrop");

  if (!drawer || !panel || !backdrop) return;

  function closeDrawer() {
    panel.classList.add("translate-x-full");
    backdrop.classList.add("opacity-0");

    setTimeout(() => {
      drawer.classList.add("hidden");
      state.open_order_id = null;
      // Sync URL
      const url = new URL(window.location.href);
      url.searchParams.delete("open_order_id");
      window.history.replaceState({}, "", url.toString());
    }, 300);
  }

  drawer.querySelectorAll("[data-drawer-close]").forEach((btn) => {
    btn.addEventListener("click", closeDrawer);
  });

  // Switch tabs inside drawer
  const drawerTabs = drawer.querySelectorAll("[data-drawer-tab]");
  drawerTabs.forEach((tabBtn) => {
    tabBtn.addEventListener("click", () => {
      const targetTab = tabBtn.getAttribute("data-drawer-tab");

      drawerTabs.forEach((btn) => {
        if (btn === tabBtn) {
          btn.className = "py-2.5 border-b-2 border-ink text-ink font-semibold transition-all cursor-pointer";
        } else {
          btn.className = "py-2.5 border-b-2 border-transparent text-mid-gray hover:text-ink transition-all cursor-pointer";
        }
      });

      drawer.querySelectorAll("[data-drawer-tab-content]").forEach((contentEl) => {
        if (contentEl.getAttribute("data-drawer-tab-content") === targetTab) {
          contentEl.classList.remove("hidden");
        } else {
          contentEl.classList.add("hidden");
        }
      });
    });
  });
}

async function openOrderDrawer(orderId) {
  const drawer = document.getElementById("order-detail-drawer");
  const panel = document.getElementById("drawer-panel");
  const backdrop = document.getElementById("drawer-backdrop");
  const body = document.getElementById("drawer-content-body");

  if (!drawer || !panel || !backdrop || !body) return;

  state.open_order_id = String(orderId);
  const url = new URL(window.location.href);
  url.searchParams.set("open_order_id", String(orderId));
  window.history.replaceState({}, "", url.toString());

  drawer.classList.remove("hidden");
  setTimeout(() => {
    backdrop.classList.remove("opacity-0");
    panel.classList.remove("translate-x-full");
  }, 10);

  body.innerHTML = `
    <div class="p-8 text-center space-y-3 animate-pulse">
      <div class="h-4 bg-hairline/60 rounded w-1/3 mx-auto"></div>
      <div class="h-3 bg-hairline/40 rounded w-1/2 mx-auto"></div>
      <div class="h-20 bg-hairline/30 rounded w-full mt-4"></div>
    </div>
  `;

  try {
    const res = await getOrder(orderId);
    if (res && res.success) {
      renderDrawerContent(res.data);
    }
  } catch (err) {
    console.error("Lỗi tải chi tiết đơn hàng:", err);
    showToast({
      type: "error",
      title: "Lỗi tải chi tiết",
      message: "Không tìm thấy thông tin đơn hàng này."
    });
    closeDrawer();
  }
}

function renderDrawerContent(order) {
  document.getElementById("drawer-order-code").textContent = order.order_code;
  document.getElementById("drawer-subtitle").textContent = `ID: ${order.id} • Khởi tạo lúc ${formatDateTime(order.created_at)}`;

  const body = document.getElementById("drawer-content-body");
  const statusMeta = getOrderStatusMeta(order.status);
  const paymentMeta = getPaymentStatusMeta(order.payment_status);
  const isCanonicalPaidOrder = order.status === "paid" && order.payment_status === "paid";
  const isValidPair = isValidOrderPaymentPair(order.status, order.payment_status);

  // Tab 1: Tổng quan
  const overviewHtml = `
    <div data-drawer-tab-content="overview" class="space-y-4">
      <div class="rounded-[6px] border border-hairline bg-surface-alt p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span class="text-[10px] uppercase font-bold text-mid-gray block mb-1">Mã đơn hàng</span>
          <span class="font-mono font-bold text-ink text-sm">${order.order_code}</span>
        </div>
        <div>
          <span class="text-[10px] uppercase font-bold text-mid-gray block mb-1">Trạng thái đơn</span>
          <span class="font-semibold text-ink">● ${statusMeta.label}</span>
        </div>
        <div>
          <span class="text-[10px] uppercase font-bold text-mid-gray block mb-1">Thanh toán</span>
          <span class="font-semibold text-ink">● ${paymentMeta.label}</span>
        </div>
        <div>
          <span class="text-[10px] uppercase font-bold text-mid-gray block mb-1">Ngày tạo</span>
          <span class="text-ink">${formatDateTime(order.created_at)}</span>
        </div>
        <div>
          <span class="text-[10px] uppercase font-bold text-mid-gray block mb-1">Thời gian thanh toán</span>
          <span class="text-ink">${formatDateTime(order.paid_at)}</span>
        </div>
        <div>
          <span class="text-[10px] uppercase font-bold text-mid-gray block mb-1">Cập nhật cuối</span>
          <span class="text-ink">${formatDateTime(order.updated_at)}</span>
        </div>
      </div>

      <div class="rounded-[6px] border border-hairline bg-paper p-4 space-y-2">
        <div class="flex items-center justify-between border-b border-hairline pb-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-mid-gray flex items-center gap-1.5">
            Thông tin người mua
          </h3>
        </div>
        ${order.user ? `
          <div class="grid grid-cols-2 gap-3 text-xs pt-1">
            <div><span class="text-mid-gray">Họ và tên:</span> <span class="font-semibold text-ink">${order.user.full_name}</span></div>
            <div><span class="text-mid-gray">Email:</span> <span class="font-mono text-ink">${order.user.email}</span></div>
            <div><span class="text-mid-gray">Vai trò:</span> <span class="capitalize text-ink">${order.user.role}</span></div>
            <div><span class="text-mid-gray">Trạng thái tài khoản:</span> <span class="capitalize font-semibold text-emerald-600">● ${order.user.status}</span></div>
          </div>
        ` : '<p class="text-xs text-mid-gray">Không có dữ liệu người mua</p>'}
      </div>

      <div class="rounded-[6px] border border-hairline bg-paper p-4 space-y-2">
        <div class="flex items-center justify-between border-b border-hairline pb-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-mid-gray flex items-center gap-1.5">
            Khóa học mua
          </h3>
        </div>
        ${order.course ? `
          <div class="space-y-1.5 text-xs pt-1">
            <div class="font-bold text-ink text-sm">${order.course.title}</div>
            <div class="text-mid-gray font-mono text-[11px]">${order.course.slug}</div>
            <div class="flex items-center gap-4 text-xs pt-1">
              <span>Giá niêm yết: <strong class="text-ink">${formatVND(order.course.price)}</strong></span>
              <span>Trạng thái: <strong class="capitalize text-emerald-600">● ${order.course.status}</strong></span>
            </div>
          </div>
        ` : '<p class="text-xs text-mid-gray">Không có dữ liệu khóa học</p>'}
      </div>
    </div>
  `;

  // Tab 2: Thanh toán
  const paymentHtml = `
    <div data-drawer-tab-content="payment" class="space-y-4 hidden">
      <div class="rounded-[6px] border border-hairline bg-paper p-4 space-y-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-mid-gray border-b border-hairline pb-2">Hóa đơn & Dòng tiền</h3>
        <div class="space-y-2 text-xs">
          <div class="flex items-center justify-between py-1 border-b border-hairline/60">
            <span class="text-mid-gray">Giá snapshot khóa học:</span>
            <span class="font-semibold text-ink">${formatVND(order.price_snapshot)}</span>
          </div>
          <div class="flex items-center justify-between py-1 border-b border-hairline/60">
            <span class="text-mid-gray">Số tiền giảm giá:</span>
            <span class="font-semibold text-rose-600">-${formatVND(order.discount_amount)}</span>
          </div>
          <div class="flex items-center justify-between py-1.5 text-sm">
            <span class="font-bold text-ink">Thực trả (Amount):</span>
            <span class="font-bold text-ink text-base">${formatVND(order.amount)}</span>
          </div>
        </div>
      </div>

      <div class="rounded-[6px] border border-hairline bg-paper p-4 space-y-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-mid-gray border-b border-hairline pb-2">Thông tin cổng thanh toán</h3>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span class="text-mid-gray block">Phương thức thanh toán:</span>
            <span class="font-semibold text-ink capitalize">${order.payment_method === "vnpay" ? "VNPay" : order.payment_method === "momo" ? "MoMo" : order.payment_method === "bank_transfer" ? "Chuyển khoản" : "Miễn phí"}</span>
          </div>
          <div>
            <span class="text-mid-gray block">Mã giao dịch Provider:</span>
            <span class="font-mono font-semibold text-ink">${order.provider_transaction_id || "Chưa phát sinh"}</span>
          </div>
          <div>
            <span class="text-mid-gray block">Thời gian xác nhận:</span>
            <span class="text-ink">${formatDateTime(order.paid_at)}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Tab 3: Đối chiếu dữ liệu (Consistency)
  const consistencyHtml = `
    <div data-drawer-tab-content="consistency" class="space-y-4 hidden">
      ${!isCanonicalPaidOrder ? `
        <div class="p-4 rounded-[6px] border ${!isValidPair ? "border-rose-300 bg-rose-50 text-rose-800" : "border-amber-200 bg-amber-50 text-amber-800"} text-xs font-medium space-y-1">
          <div>● Đơn chưa hoàn tất thanh toán chuẩn (Status = ${order.status}, Payment Status = ${order.payment_status}).</div>
        </div>
      ` : ""}

      <div class="rounded-[6px] border border-hairline bg-paper p-4 space-y-2 text-xs">
        <div class="flex items-center justify-between border-b border-hairline pb-2">
          <h4 class="font-bold text-ink uppercase tracking-wider text-[11px]">1. Kiểm tra Ghi danh học tập (Enrollment)</h4>
          <span class="font-semibold ${order.consistency?.paid_has_enrollment ? "text-emerald-600" : "text-rose-600"}">
            ● ${order.consistency?.paid_has_enrollment ? "Có enrollment tương ứng" : "Thiếu enrollment"}
          </span>
        </div>
        ${order.enrollment ? `
          <div class="grid grid-cols-2 gap-2 pt-1">
            <div><span class="text-mid-gray">Enrollment ID:</span> <span class="font-mono text-ink">#${order.enrollment.id}</span></div>
            <div><span class="text-mid-gray">Tiến độ học tập:</span> <span class="font-bold text-ink">${order.enrollment.progress_percent}%</span></div>
          </div>
        ` : `<p class="text-mid-gray pt-1">${isCanonicalPaidOrder ? "Cảnh báo: Đơn đã thanh toán nhưng chưa tìm thấy dữ liệu Enrollment!" : "Đơn chưa phát sinh ghi danh."}</p>`}
      </div>

      <div class="rounded-[6px] border border-hairline bg-paper p-4 space-y-2 text-xs">
        <div class="flex items-center justify-between border-b border-hairline pb-2">
          <h4 class="font-bold text-ink uppercase tracking-wider text-[11px]">2. Kiểm tra Phân bổ doanh thu (Revenue Split)</h4>
          <span class="font-semibold ${order.consistency?.paid_has_revenue ? "text-emerald-600" : "text-rose-600"}">
            ● ${order.consistency?.paid_has_revenue ? "Có revenue tương ứng" : "Thiếu revenue"}
          </span>
        </div>
        ${order.revenue ? `
          <div class="grid grid-cols-2 gap-2 pt-1">
            <div><span class="text-mid-gray">Revenue ID:</span> <span class="font-mono text-ink">#${order.revenue.id}</span></div>
            <div><span class="text-mid-gray">Gross Amount:</span> <span class="font-bold text-ink">${formatVND(order.revenue.gross_amount)}</span></div>
            <div><span class="text-mid-gray">Instructor Share:</span> <span class="font-medium text-ink">${formatVND(order.revenue.instructor_amount)}</span></div>
            <div><span class="text-mid-gray">Platform Fee:</span> <span class="font-medium text-ink">${formatVND(order.revenue.platform_amount)}</span></div>
          </div>
        ` : `<p class="text-mid-gray pt-1">${isCanonicalPaidOrder ? "Cảnh báo: Đơn đã thanh toán nhưng chưa phân bổ doanh thu!" : "Đơn chưa phát sinh phân bổ."}</p>`}
      </div>
    </div>
  `;

  // Tab 4: Timeline
  const timelineHtml = `
    <div data-drawer-tab-content="timeline" class="space-y-4 hidden">
      <div class="rounded-[6px] border border-hairline bg-paper p-4 text-xs space-y-4">
        <div class="relative pl-6 border-l border-hairline space-y-4">
          <div class="relative">
            <span class="absolute -left-[29px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">✓</span>
            <div class="font-bold text-ink">Khởi tạo đơn hàng</div>
            <div class="text-[10px] text-mid-gray mt-0.5">${formatDateTime(order.created_at)}</div>
          </div>
          ${order.paid_at ? `
            <div class="relative">
              <span class="absolute -left-[29px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">✓</span>
              <div class="font-bold text-ink">Xác nhận thanh toán (Success)</div>
              <div class="text-[10px] text-mid-gray mt-0.5">${formatDateTime(order.paid_at)}</div>
            </div>
          ` : ""}
        </div>
      </div>
    </div>
  `;

  body.innerHTML = overviewHtml + paymentHtml + consistencyHtml + timelineHtml;
}

function closeDrawer() {
  const drawer = document.getElementById("order-detail-drawer");
  const panel = document.getElementById("drawer-panel");
  const backdrop = document.getElementById("drawer-backdrop");

  if (!drawer || !panel || !backdrop) return;

  panel.classList.add("translate-x-full");
  backdrop.classList.add("opacity-0");

  setTimeout(() => {
    drawer.classList.add("hidden");
    state.open_order_id = null;
    const url = new URL(window.location.href);
    url.searchParams.delete("open_order_id");
    window.history.replaceState({}, "", url.toString());
  }, 300);
}
