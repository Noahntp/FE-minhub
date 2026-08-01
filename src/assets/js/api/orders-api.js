import { getOrders as getRepoOrders, getOrderById as getRepoOrderById, populateOrder, isValidOrderPaymentPair } from "@/assets/js/mocks/mock-repository.js";
import { apiFetchEnvelope } from "@/shared/lib/api-client";

const USE_MOCK = false;
const API_BASE_URL = "/admin/orders"; // prefix api is handled by apiFetchEnvelope!

/**
 * Helper chuẩn hóa chuỗi tìm kiếm không phân biệt hoa/thường
 */
function normalizeSearchText(val) {
  return String(val ?? "").trim().toLocaleLowerCase("vi-VN");
}

/**
 * Helper parse số tiền an toàn từ string hoặc number decimal
 */
function parseMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

/**
 * Helper format decimal source dạng chuỗi "0.00"
 */
function formatDecimalSource(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : "0.00";
}

/**
 * Tính toán summary trên TOÀN BỘ dataset gốc đơn hàng trước pagination/filtering
 */
export function calculateOrdersSummary(orders) {
  const totalOrders = orders.length;

  const paidOrders = orders.filter(
    (order) => order.status === "paid" && order.payment_status === "paid"
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  );

  const failedOrders = orders.filter(
    (order) => order.status === "failed"
  );

  const cancelledOrders = orders.filter(
    (order) => order.status === "cancelled"
  );

  const expiredOrders = orders.filter(
    (order) => order.status === "expired"
  );

  const paidAmount = paidOrders.reduce(
    (sum, order) => sum + parseMoney(order.amount),
    0
  );

  const averageOrderValue =
    paidOrders.length > 0 ? paidAmount / paidOrders.length : 0;

  const paymentSuccessRate =
    totalOrders > 0 ? (paidOrders.length / totalOrders) * 100 : 0;

  const incompleteOrders =
    failedOrders.length + cancelledOrders.length + expiredOrders.length;

  const anomalyCount = orders.filter(
    (order) => !isValidOrderPaymentPair(order.status, order.payment_status)
  ).length;

  return {
    total_orders: totalOrders,
    paid_orders: paidOrders.length,
    pending_orders: pendingOrders.length,
    failed_orders: failedOrders.length,
    cancelled_orders: cancelledOrders.length,
    expired_orders: expiredOrders.length,
    paid_amount: formatDecimalSource(paidAmount),
    average_order_value: formatDecimalSource(averageOrderValue),
    payment_success_rate: Number(paymentSuccessRate.toFixed(1)),
    incomplete_orders: incompleteOrders,
    anomaly_count: anomalyCount
  };
}

/**
 * Lấy danh sách đơn hàng (hỗ trợ phân trang, lọc, summary)
 */
export async function getOrders(params = {}) {
  if (!USE_MOCK) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.per_page) query.set("per_page", params.per_page);
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.search) query.set("order_code", params.search); // Search field maps to order_code in validation query!

    const res = await apiFetchEnvelope(`${API_BASE_URL}?${query.toString()}`);
    if (res && res.data) {
      return {
        success: true,
        message: "Lấy dữ liệu thành công.",
        data: res.data,
        meta: res.meta
      };
    }
    return { success: false, message: "Lỗi kết nối", data: { summary: {}, items: [] } };
  }

  // Giả lập độ trễ mạng 350ms
  await new Promise((resolve) => setTimeout(resolve, 350));

  try {
    const rawOrders = getRepoOrders();
    const allPopulatedOrders = rawOrders.map(populateOrder).filter(Boolean);

    // 1. Tính toán summary trên TOÀN BỘ dataset gốc bằng helper chuẩn
    const summary = calculateOrdersSummary(allPopulatedOrders);

    // 2. Lọc danh sách từ mảng clone mới
    let filtered = [...allPopulatedOrders];

    // Lọc theo tìm kiếm tổng hợp (Unified Search) hoặc order_code
    const searchKeyword = normalizeSearchText(params.search || params.order_code);
    if (searchKeyword) {
      filtered = filtered.filter((o) => {
        const searchableFields = [
          o.order_code,
          o.provider_transaction_id,
          o.user?.full_name,
          o.user?.email,
          o.course?.title,
          o.course?.slug
        ].map(normalizeSearchText).join(" ");
        
        return searchableFields.includes(searchKeyword);
      });
    }

    // Lọc theo status (raw order status)
    if (params.status && params.status !== "" && params.status !== "all") {
      filtered = filtered.filter((o) => o.status === params.status);
    }

    // Lọc theo payment_status (raw payment status)
    if (params.payment_status && params.payment_status !== "" && params.payment_status !== "all") {
      filtered = filtered.filter((o) => o.payment_status === params.payment_status);
    }

    // Lọc theo user_id
    if (params.user_id && params.user_id !== "" && params.user_id !== "all") {
      const targetUserId = Number(params.user_id);
      filtered = filtered.filter((o) => Number(o.user_id) === targetUserId);
    }

    // Lọc theo course_id
    if (params.course_id && params.course_id !== "" && params.course_id !== "all") {
      const targetCourseId = Number(params.course_id);
      filtered = filtered.filter((o) => Number(o.course_id) === targetCourseId);
    }

    // Lọc theo khoảng thời gian (date_from, date_to)
    if (params.date_from && params.date_from !== "") {
      const fromDate = new Date(params.date_from);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((o) => new Date(o.created_at) >= fromDate);
    }

    if (params.date_to && params.date_to !== "") {
      const toDate = new Date(params.date_to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((o) => new Date(o.created_at) <= toDate);
    }

    // Sắp xếp động đơn hàng
    const sortBy = params.sort_by || "created_at";
    const sortOrder = params.sort_order || params.sort_direction || "desc";

    function getNumericFromCode(codeStr) {
      if (!codeStr) return 0;
      const match = codeStr.match(/\d+/);
      return match ? Number(match[0]) : 0;
    }

    if (sortOrder !== "none") {
      filtered.sort((a, b) => {
        // 1. Sắp xếp trạng thái nghiệp vụ
        if (sortBy === "order_status") {
          const isPendingA = a.status === "pending";
          const isPendingB = b.status === "pending";
          if (sortOrder === "desc") {
            // Đơn cần xử lý trước (pending lên đầu)
            if (isPendingA && !isPendingB) return -1;
            if (!isPendingA && isPendingB) return 1;
          } else {
            // Đơn hoàn tất trước (pending về sau)
            if (isPendingA && !isPendingB) return 1;
            if (!isPendingA && isPendingB) return -1;
          }
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }

        if (sortBy === "payment_status") {
          const isPendingA = a.payment_status === "unpaid" || a.payment_status === "processing";
          const isPendingB = b.payment_status === "unpaid" || b.payment_status === "processing";
          if (sortOrder === "desc") {
            // Thanh toán chưa hoàn tất trước
            if (isPendingA && !isPendingB) return -1;
            if (!isPendingA && isPendingB) return 1;
          } else {
            // Thanh toán đã hoàn tất trước
            if (isPendingA && !isPendingB) return 1;
            if (!isPendingA && isPendingB) return -1;
          }
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }

        // 2. Các trường thông thường
        let valA, valB;
        if (sortBy === "order_code") {
          valA = getNumericFromCode(a.order_code);
          valB = getNumericFromCode(b.order_code);
        } else if (sortBy === "buyer_name") {
          valA = a.user?.full_name || "";
          valB = b.user?.full_name || "";
        } else if (sortBy === "course_name") {
          valA = a.course?.title || "";
          valB = b.course?.title || "";
        } else if (sortBy === "amount") {
          valA = Number(a.amount || 0);
          valB = Number(b.amount || 0);
        } else if (sortBy === "payment_method") {
          valA = a.payment_method || "";
          valB = b.payment_method || "";
        } else if (sortBy === "paid_at") {
          valA = new Date(a.paid_at || a.created_at || 0).getTime();
          valB = new Date(b.paid_at || b.created_at || 0).getTime();
        } else {
          valA = new Date(a.created_at || 0).getTime();
          valB = new Date(b.created_at || 0).getTime();
        }

        if (typeof valA === "string") {
          return sortOrder === "asc"
            ? valA.localeCompare(valB, "vi", { sensitivity: "base" })
            : valB.localeCompare(valA, "vi", { sensitivity: "base" });
        } else {
          return sortOrder === "asc" ? valA - valB : valB - valA;
        }
      });
    } else {
      filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    // 3. Phân trang an toàn
    const total = filtered.length;
    const perPage = Number(params.per_page) || 20;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    let page = Number(params.page) || 1;
    if (page > lastPage) {
      page = 1;
    }

    const startIndex = (page - 1) * perPage;
    const items = filtered.slice(startIndex, startIndex + perPage);

    return {
      success: true,
      message: "Lấy dữ liệu thành công.",
      data: {
        summary,
        items
      },
      meta: {
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
        total
      }
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng mock:", error);
    throw error;
  }
}

/**
 * Lấy chi tiết đơn hàng theo ID
 */
export async function getOrder(id) {
  if (!USE_MOCK) {
    const res = await apiFetchEnvelope(`${API_BASE_URL}/${id}`);
    if (res && res.data) {
      return {
        success: true,
        message: "Lấy chi tiết đơn hàng thành công.",
        data: res.data
      };
    }
    return { success: false, message: "Lỗi kết nối", data: null };
  }

  await new Promise((resolve) => setTimeout(resolve, 200));

  const rawOrder = getRepoOrderById(id);
  if (!rawOrder) {
    const error = new Error("Đơn hàng không tồn tại hoặc đã bị xóa.");
    error.status = 404;
    throw error;
  }

  const populatedOrder = populateOrder(rawOrder);

  return {
    success: true,
    message: "Lấy chi tiết đơn hàng thành công.",
    data: populatedOrder
  };
}

export function getOrderStatusMeta(status) {
  const map = {
    pending: { label: "Chờ thanh toán", tone: "warning" },
    paid: { label: "Đã thanh toán", tone: "success" },
    failed: { label: "Thất bại", tone: "danger" },
    cancelled: { label: "Đã hủy", tone: "neutral-dark" },
    expired: { label: "Đã hết hạn", tone: "neutral" },
  };
  return map[status] ?? { label: "Không xác định", tone: "neutral" };
}

export function getPaymentStatusMeta(status) {
  const map = {
    unpaid: { label: "Chưa thanh toán", tone: "neutral" },
    processing: { label: "Đang xử lý", tone: "warning" },
    paid: { label: "Thành công", tone: "success" },
    failed: { label: "Thất bại", tone: "danger" },
    refunded: { label: "Hoàn tiền", tone: "info" },
  };
  return map[status] ?? { label: "Không xác định", tone: "neutral" };
}

export { isValidOrderPaymentPair };
