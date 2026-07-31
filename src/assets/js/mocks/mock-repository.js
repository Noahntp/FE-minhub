import { MOCK_DB } from "@/assets/js/mocks/mock-database.js";

const STORAGE_KEY = "mindhub_admin_mock_db";

// Khởi tạo database dùng chung trong localStorage nếu chưa có
function getDB() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DB));
    return MOCK_DB;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DB));
    return MOCK_DB;
  }
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// === USERS ===
export function getUsers() {
  const db = getDB();
  return db.users || [];
}

export function getUserById(id) {
  const parsedId = Number(id);
  const user = getUsers().find((u) => u.id === parsedId);
  return user || null;
}

export function saveUsers(users) {
  const db = getDB();
  db.users = users;
  saveDB(db);
}

export function updateUser(id, updates) {
  const users = getUsers();
  const parsedId = Number(id);
  const index = users.findIndex((u) => u.id === parsedId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates, updated_at: new Date().toISOString() };
    saveUsers(users);
    return users[index];
  }
  return null;
}

// === CATEGORIES ===
export function getCategories() {
  const db = getDB();
  return (db.categories || []).filter((c) => c.deleted_at === null);
}

export function getRawCategories() {
  const db = getDB();
  return db.categories || [];
}

export function getCategoryById(id) {
  const parsedId = Number(id);
  return getCategories().find((c) => c.id === parsedId) || null;
}

export function saveCategories(categories) {
  const db = getDB();
  db.categories = categories;
  saveDB(db);
}

export function createCategory(payload) {
  const db = getDB();
  const categories = db.categories || [];
  const maxId = categories.reduce((max, c) => c.id > max ? c.id : max, 2000);
  const newId = maxId + 1;
  const nowStr = new Date().toISOString();
  
  const newCat = {
    id: newId,
    parent_id: payload.parent_id ? Number(payload.parent_id) : null,
    name: payload.name.trim(),
    slug: payload.slug.trim(),
    description: payload.description ? payload.description.trim() : "",
    sort_order: payload.sort_order !== undefined ? Number(payload.sort_order) : 0,
    status: payload.status || "active",
    created_at: nowStr,
    updated_at: nowStr,
    deleted_at: null
  };
  
  categories.push(newCat);
  db.categories = categories;
  saveDB(db);
  return newCat;
}

export function updateCategory(id, updates) {
  const db = getDB();
  const categories = db.categories || [];
  const parsedId = Number(id);
  const index = categories.findIndex((c) => c.id === parsedId);
  if (index !== -1) {
    const original = categories[index];
    const updated = {
      ...original,
      ...updates,
      parent_id: updates.parent_id !== undefined ? (updates.parent_id ? Number(updates.parent_id) : null) : original.parent_id,
      sort_order: updates.sort_order !== undefined ? Number(updates.sort_order) : original.sort_order,
      updated_at: new Date().toISOString()
    };
    categories[index] = updated;
    db.categories = categories;
    saveDB(db);
    return updated;
  }
  return null;
}

export function deleteCategory(id) {
  const db = getDB();
  const categories = db.categories || [];
  const parsedId = Number(id);
  const index = categories.findIndex((c) => c.id === parsedId);
  if (index !== -1) {
    categories[index].deleted_at = new Date().toISOString();
    db.categories = categories;
    saveDB(db);
    return true;
  }
  return false;
}

export function restoreCategory(id) {
  const db = getDB();
  const categories = db.categories || [];
  const parsedId = Number(id);
  const index = categories.findIndex((c) => c.id === parsedId);
  if (index !== -1) {
    categories[index].deleted_at = null;
    categories[index].updated_at = new Date().toISOString();
    db.categories = categories;
    saveDB(db);
    return true;
  }
  return false;
}

// === COURSES ===
export function getCourses() {
  const db = getDB();
  return db.courses || [];
}

export function getCourseById(id) {
  const parsedId = Number(id);
  return getCourses().find((c) => c.id === parsedId) || null;
}

export function saveCourses(courses) {
  const db = getDB();
  db.courses = courses;
  saveDB(db);
}

export function updateCourse(id, updates) {
  const courses = getCourses();
  const parsedId = Number(id);
  const index = courses.findIndex((c) => c.id === parsedId);
  if (index !== -1) {
    courses[index] = { ...courses[index], ...updates, updated_at: new Date().toISOString() };
    saveCourses(courses);
    return courses[index];
  }
  return null;
}

// Helper to populate a course object with instructor and categories
export function populateCourse(course) {
  if (!course) return null;
  const instructorUser = getUserById(course.instructor_id);
  const categoriesList = getCategories();
  const matchedCategories = (course.category_ids || [])
    .map((catId) => categoriesList.find((cat) => cat.id === catId))
    .filter(Boolean);

  return {
    ...course,
    instructor: instructorUser
      ? {
          id: instructorUser.id,
          full_name: instructorUser.full_name,
          email: instructorUser.email,
          status: instructorUser.status,
        }
      : null,
    categories: matchedCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
  };
}

// === COURSE REVIEWS ===
export function getCourseReviews() {
  const db = getDB();
  return db.courseReviews || [];
}

export function getCourseReviewByCourseId(courseId) {
  const parsedId = Number(courseId);
  return getCourseReviews().find((r) => r.course_id === parsedId) || null;
}

export function saveCourseReviews(reviews) {
  const db = getDB();
  db.courseReviews = reviews;
  saveDB(db);
}

export function getPopulatedCourseReview(courseId) {
  const parsedId = Number(courseId);
  const review = getCourseReviewByCourseId(parsedId);
  if (!review) return null;

  const rawCourse = getCourseById(parsedId);
  if (!rawCourse) return null;

  const course = populateCourse(rawCourse);

  return {
    course,
    sections: review.sections || [],
    lessons: review.lessons || [],
    checklist: review.checklist || { passed: true, summary: "Đạt checklist" },
  };
}

// === INSTRUCTOR UPGRADES ===
export function getInstructorUpgrades() {
  const db = getDB();
  return db.instructorUpgrades || [];
}

export function saveInstructorUpgrades(upgrades) {
  const db = getDB();
  db.instructorUpgrades = upgrades;
  saveDB(db);
}

// === ORDERS ===
export function getOrders() {
  const db = getDB();
  return db.orders || [];
}

export function getOrderById(id) {
  const parsedId = Number(id);
  return getOrders().find((o) => o.id === parsedId) || null;
}

export function saveOrders(orders) {
  const db = getDB();
  db.orders = orders;
  saveDB(db);
}

// === ENROLLMENTS ===
export function getEnrollments() {
  const db = getDB();
  return db.enrollments || [];
}

export function saveEnrollments(enrollments) {
  const db = getDB();
  db.enrollments = enrollments;
  saveDB(db);
}

// === REVENUES ===
export function getRevenues() {
  const db = getDB();
  return db.revenues || [];
}

export function saveRevenues(revenues) {
  const db = getDB();
  db.revenues = revenues;
  saveDB(db);
}

// === PAYOUT ACCOUNTS ===
export function getPayoutAccounts() {
  const db = getDB();
  return db.payoutAccounts || [];
}

export function savePayoutAccounts(accounts) {
  const db = getDB();
  db.payoutAccounts = accounts;
  saveDB(db);
}

// === WITHDRAWALS ===
export function getWithdrawals() {
  const db = getDB();
  return db.withdrawals || [];
}

export function saveWithdrawals(withdrawals) {
  const db = getDB();
  db.withdrawals = withdrawals;
  saveDB(db);
}

// === BANNERS, FAQS, NOTIFICATIONS ===
export function getBanners() {
  const db = getDB();
  return db.banners || [];
}

export function getFaqs() {
  const db = getDB();
  return db.faqs || [];
}

export function getNotifications() {
  const db = getDB();
  return db.notifications || [];
}

export function getComments() {
  const db = getDB();
  return db.comments || [];
}

export function getReviews() {
  const db = getDB();
  return db.reviews || [];
}

// === ORDER HELPERS ===
export function getCouponById(id) {
  const db = getDB();
  const parsedId = Number(id);
  return (db.coupons || []).find(c => c.id === parsedId) || null;
}

export function getEnrollmentByOrderId(orderId) {
  const db = getDB();
  const parsedId = Number(orderId);
  return (db.enrollments || []).find(e => e.order_id === parsedId) || null;
}

export function getRevenueByOrderId(orderId) {
  const db = getDB();
  const parsedId = Number(orderId);
  return (db.revenues || []).find(r => r.order_id === parsedId) || null;
}

export function isValidOrderPaymentPair(orderStatus, paymentStatus) {
  const allowedPairs = {
    pending: ["unpaid", "processing"],
    paid: ["paid"],
    failed: ["failed"],
    cancelled: ["unpaid", "failed"],
    expired: ["unpaid"],
  };
  return Boolean(allowedPairs[orderStatus]?.includes(paymentStatus));
}

export function populateOrder(order) {
  if (!order) return null;
  const user = getUserById(order.user_id);
  const rawCourse = getCourseById(order.course_id);
  const course = populateCourse(rawCourse);
  const coupon = getCouponById(order.coupon_id);
  const enrollment = getEnrollmentByOrderId(order.id);
  const revenue = getRevenueByOrderId(order.id);

  const isCanonicalPaid =
    order.status === "paid" && order.payment_status === "paid";
  const isValidPair = isValidOrderPaymentPair(
    order.status,
    order.payment_status,
  );
  const paidHasEnrollment = isCanonicalPaid ? !!enrollment : true;
  const paidHasRevenue = isCanonicalPaid ? !!revenue : true;
  const amountsMatch =
    isCanonicalPaid && revenue
      ? Number(revenue.gross_amount) === Number(order.amount)
      : true;

  const timeline = [
    {
      timestamp: order.created_at,
      title: "Đơn hàng được tạo",
      description: `Đơn hàng ${order.order_code} khởi tạo bởi ${user ? user.full_name : "Người dùng"}.`,
      status: "info",
    },
  ];

  if (order.status === "pending" || order.payment_status === "processing") {
    timeline.push({
      timestamp: order.created_at,
      title: "Chờ thanh toán",
      description:
        "Chuyển hướng đến cổng thanh toán, đang chờ xác nhận từ phía nhà cung cấp.",
      status: "warning",
    });
  } else if (isCanonicalPaid) {
    timeline.push({
      timestamp: order.paid_at || order.created_at,
      title: "Thanh toán thành công",
      description: `Xác nhận thanh toán thành công qua ${order.payment_method === "vnpay" ? "VNPay" : order.payment_method === "momo" ? "MoMo" : order.payment_method === "bank_transfer" ? "Chuyển khoản" : "Hệ thống"}.${order.provider_transaction_id ? " Mã GD: " + order.provider_transaction_id : ""}`,
      status: "success",
    });
    if (enrollment) {
      timeline.push({
        timestamp: enrollment.created_at || order.paid_at || order.created_at,
        title: "Ghi danh khóa học",
        description: `Tạo ghi danh khóa học thành công cho ${user ? user.full_name : "Học viên"}. Tiến độ: ${enrollment.progress_percent}%.`,
        status: "success",
      });
    }
    if (revenue) {
      timeline.push({
        timestamp: revenue.earned_at || order.paid_at || order.created_at,
        title: "Doanh thu được ghi nhận",
        description: `Ghi nhận ${Number(revenue.gross_amount).toLocaleString("vi-VN")}đ (Giảng viên: ${Number(revenue.instructor_amount).toLocaleString("vi-VN")}đ, Nền tảng: ${Number(revenue.platform_fee_amount).toLocaleString("vi-VN")}đ).`,
        status: "success",
      });
    }
  } else if (order.status === "failed" || order.payment_status === "failed") {
    timeline.push({
      timestamp: order.updated_at || order.created_at,
      title: "Thanh toán thất bại",
      description: "Giao dịch không thành công hoặc bị nhà cung cấp hủy bỏ.",
      status: "error",
    });
  } else if (
    order.status === "cancelled" ||
    order.payment_status === "cancelled"
  ) {
    timeline.push({
      timestamp: order.updated_at || order.created_at,
      title: "Đơn hàng đã hủy",
      description: "Đơn hàng đã bị hủy bởi học viên hoặc quản trị viên.",
      status: "error",
    });
  } else if (order.status === "expired" || order.payment_status === "expired") {
    timeline.push({
      timestamp: order.updated_at || order.created_at,
      title: "Đơn hàng hết hạn",
      description: "Hết thời hạn thanh toán (quá 24 giờ).",
      status: "error",
    });
  }

  return {
    ...order,
    price_snapshot:
      order.price_snapshot !== undefined
        ? String(order.price_snapshot)
        : String(order.amount),
    discount_amount:
      order.discount_amount !== undefined ? String(order.discount_amount) : "0",
    amount: String(order.amount),
    user: user
      ? {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          status: user.status,
        }
      : null,
    course: course
      ? {
          id: course.id,
          title: course.title,
          slug: course.slug,
          status: course.status,
          price: course.price,
          sale_price: course.sale_price,
        }
      : null,
    coupon: coupon
      ? {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          status: coupon.status,
        }
      : null,
    enrollment: enrollment
      ? {
          id: enrollment.id,
          status: enrollment.status,
          progress_percent: enrollment.progress_percent,
          enrolled_at: enrollment.created_at,
          completed_at: enrollment.completed_at,
        }
      : null,
    revenue: revenue
      ? {
          id: revenue.id,
          gross_amount: String(revenue.gross_amount),
          instructor_amount: String(revenue.instructor_amount),
          platform_fee_amount: String(revenue.platform_fee_amount),
          status: revenue.status,
          earned_at: revenue.earned_at,
        }
      : null,
    consistency: {
      paid_has_enrollment: paidHasEnrollment,
      paid_has_revenue: paidHasRevenue,
      amounts_match: amountsMatch,
    },
    timeline,
  };
}
