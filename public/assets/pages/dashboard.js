import { getDashboardMockData } from "../../../data/dashboard.js";
import { showToast } from "../toast.js";

let myChart = null;

document.addEventListener("DOMContentLoaded", () => {
    console.log("Đã tải trang: Dashboard");

    // Khởi tạo các sự kiện tương tác
    initFilters();
    initCustomDateFilter();
    initTabs();
    initToastTester();

    // Tải và hiển thị dữ liệu dựa trên query params hiện có trên URL
    fetchAndRender();
});

/**
 * Định dạng tiền tệ VND (ví dụ: "185.400.000 đ")
 */
function formatVND(value) {
    if (value === undefined || value === null) return "0 đ";
    const num = parseFloat(value);
    return new Intl.NumberFormat("vi-VN").format(num) + " đ";
}

/**
 * Định dạng số (ví dụ: 1250 -> "1.250")
 */
function formatNumber(value) {
    if (value === undefined || value === null) return "0";
    return new Intl.NumberFormat("vi-VN").format(value);
}

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
 * Định dạng tỷ lệ phần trăm (ví dụ: 30 -> "30%")
 */
function formatPercent(value) {
    if (value === undefined || value === null) return "0%";
    return `${value}%`;
}

/**
 * Đọc query params từ URL hiện tại
 */
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        date_from: params.get("date_from"),
        date_to: params.get("date_to"),
        month: params.get("month") ? parseInt(params.get("month")) : null,
        year: params.get("year") ? parseInt(params.get("year")) : null,
        state: params.get("state") || "loaded"
    };
}

/**
 * Cập nhật query string trên URL và tải lại dữ liệu
 */
function updateUrlParams(newParams) {
    const url = new URL(window.location);
    
    // Giữ lại state hiện tại nếu có
    const currentState = url.searchParams.get("state");
    
    // Xóa sạch các query lọc thời gian cũ
    url.searchParams.delete("date_from");
    url.searchParams.delete("date_to");
    url.searchParams.delete("month");
    url.searchParams.delete("year");
    
    // Thiết lập các query mới
    Object.keys(newParams).forEach(key => {
        if (newParams[key] !== undefined && newParams[key] !== null) {
            url.searchParams.set(key, newParams[key]);
        }
    });

    if (currentState) {
        url.searchParams.set("state", currentState);
    }
    
    window.history.pushState({}, "", url);
    fetchAndRender();
}

/**
 * Khởi tạo bộ lọc thời gian preset
 */
function initFilters() {
    const filterButtons = document.querySelectorAll("[data-filter]");
    const customDateContainer = document.getElementById("custom-date-container");
    const params = getQueryParams();

    // Đồng bộ nút active và container hiển thị dựa trên URL lúc khởi tạo
    let hasActivePreset = false;

    filterButtons.forEach(btn => {
        const filterType = btn.getAttribute("data-filter");
        let isActive = false;

        if (filterType === "7days" && params.date_from === "2026-07-06" && params.date_to === "2026-07-12") {
            isActive = true;
            hasActivePreset = true;
        } else if (filterType === "30days" && params.date_from === "2026-06-13" && params.date_to === "2026-07-12") {
            isActive = true;
            hasActivePreset = true;
        } else if (filterType === "thisMonth" && params.month === 7 && params.year === 2026) {
            isActive = true;
            hasActivePreset = true;
        } else if (filterType === "thisYear" && params.year === 2026 && !params.month) {
            isActive = true;
            hasActivePreset = true;
        } else if (filterType === "custom" && params.date_from && params.date_to) {
            // Kiểm tra nếu là khoảng ngày tự do (không trùng preset 7 hay 30 ngày)
            const isPreset7 = (params.date_from === "2026-07-06" && params.date_to === "2026-07-12");
            const isPreset30 = (params.date_from === "2026-06-13" && params.date_to === "2026-07-12");
            if (!isPreset7 && !isPreset30) {
                isActive = true;
                hasActivePreset = true;
                if (customDateContainer) {
                    customDateContainer.classList.remove("hidden");
                }
            }
        }

        // Mặc định ban đầu nếu không có param nào khớp thì active 7 ngày qua
        if (!hasActivePreset && filterType === "7days" && !params.date_from && !params.month && !params.year) {
            isActive = true;
        }

        if (isActive) {
            btn.className = "px-3.5 py-1.5 text-xs font-medium rounded-full bg-ink text-white transition-colors shadow-sm";
        } else {
            btn.className = "px-3.5 py-1.5 text-xs font-medium rounded-full text-mid-gray hover:text-ink transition-colors bg-transparent";
        }

        btn.addEventListener("click", () => {
            filterButtons.forEach(b => {
                b.className = "px-3.5 py-1.5 text-xs font-medium rounded-full text-mid-gray hover:text-ink transition-colors bg-transparent";
            });
            btn.className = "px-3.5 py-1.5 text-xs font-medium rounded-full bg-ink text-white transition-colors shadow-sm";

            // Xử lý ẩn hiện thanh lọc ngày tùy chọn
            if (filterType === "custom") {
                if (customDateContainer) {
                    customDateContainer.classList.remove("hidden");
                }
            } else {
                if (customDateContainer) {
                    customDateContainer.classList.add("hidden");
                }
                // Reset input date
                const fromInput = document.getElementById("custom-date-from");
                const toInput = document.getElementById("custom-date-to");
                if (fromInput) fromInput.value = "";
                if (toInput) toInput.value = "";

                // Cập nhật params và tải dữ liệu cho các preset
                if (filterType === "7days") {
                    updateUrlParams({ date_from: "2026-07-06", date_to: "2026-07-12" });
                } else if (filterType === "30days") {
                    updateUrlParams({ date_from: "2026-06-13", date_to: "2026-07-12" });
                } else if (filterType === "thisMonth") {
                    updateUrlParams({ month: 7, year: 2026 });
                } else if (filterType === "thisYear") {
                    updateUrlParams({ year: 2026 });
                }
            }
        });
    });
}

/**
 * Khởi tạo bộ lọc ngày tùy chỉnh
 */
function initCustomDateFilter() {
    const fromInput = document.getElementById("custom-date-from");
    const toInput = document.getElementById("custom-date-to");
    const applyBtn = document.getElementById("apply-custom-date");
    const params = getQueryParams();

    // Đồng bộ giá trị input lúc khởi tạo nếu URL có khoảng ngày
    if (params.date_from && params.date_to) {
        const isPreset7 = (params.date_from === "2026-07-06" && params.date_to === "2026-07-12");
        const isPreset30 = (params.date_from === "2026-06-13" && params.date_to === "2026-07-12");
        if (!isPreset7 && !isPreset30) {
            if (fromInput) fromInput.value = params.date_from;
            if (toInput) toInput.value = params.date_to;
        }
    }

    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            const dateFrom = fromInput ? fromInput.value : "";
            const dateTo = toInput ? toInput.value : "";

            if (!dateFrom || !dateTo) {
                showToast({
                    type: "warning",
                    title: "Thiếu thông tin",
                    message: "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc."
                });
                return;
            }

            if (new Date(dateFrom) > new Date(dateTo)) {
                showToast({
                    type: "error",
                    title: "Lỗi chọn ngày",
                    message: "Ngày bắt đầu không được lớn hơn ngày kết thúc."
                });
                return;
            }

            // Đồng bộ trạng thái nút lọc "Tùy chọn" được active
            const filterButtons = document.querySelectorAll("[data-filter]");
            filterButtons.forEach(b => {
                const type = b.getAttribute("data-filter");
                if (type === "custom") {
                    b.className = "px-3.5 py-1.5 text-xs font-medium rounded-full bg-ink text-white transition-colors shadow-sm";
                } else {
                    b.className = "px-3.5 py-1.5 text-xs font-medium rounded-full text-mid-gray hover:text-ink transition-colors bg-transparent";
                }
            });

            // Cập nhật URL và lấy dữ liệu
            updateUrlParams({ date_from: dateFrom, date_to: dateTo });
        });
    }

    const closeBtn = document.getElementById("close-custom-date");
    const customDateContainer = document.getElementById("custom-date-container");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            if (customDateContainer) {
                customDateContainer.classList.add("hidden");
            }
            // Giả lập click nút 7 ngày qua để khôi phục mặc định
            const btn7Days = document.querySelector('[data-filter="7days"]');
            if (btn7Days) {
                btn7Days.click();
            }
        });
    }
}

/**
 * Khởi tạo chuyển đổi tab dữ liệu gần đây
 */
function initTabs() {
    const tabBtnOrders = document.getElementById("tab-btn-orders");
    const tabBtnCourses = document.getElementById("tab-btn-courses");
    const ordersContainer = document.getElementById("recent-orders-container");
    const coursesContainer = document.getElementById("recent-courses-container");

    if (tabBtnOrders && tabBtnCourses && ordersContainer && coursesContainer) {
        tabBtnOrders.addEventListener("click", () => {
            tabBtnOrders.className = "px-2.5 py-1 rounded-full bg-paper text-ink shadow-sm transition-all";
            tabBtnCourses.className = "px-2.5 py-1 rounded-full text-mid-gray hover:text-ink bg-transparent transition-all";
            ordersContainer.classList.remove("hidden");
            coursesContainer.classList.add("hidden");
        });

        tabBtnCourses.addEventListener("click", () => {
            tabBtnCourses.className = "px-2.5 py-1 rounded-full bg-paper text-ink shadow-sm transition-all";
            tabBtnOrders.className = "px-2.5 py-1 rounded-full text-mid-gray hover:text-ink bg-transparent transition-all";
            coursesContainer.classList.remove("hidden");
            ordersContainer.classList.add("hidden");
        });
    }
}

/**
 * Khởi tạo trình kiểm tra Toast (Toast Tester)
 */
function initToastTester() {
    const btnSuccess = document.getElementById("btn-test-toast-success");
    const btnError = document.getElementById("btn-test-toast-error");
    const btnWarning = document.getElementById("btn-test-toast-warning");
    const btnInfo = document.getElementById("btn-test-toast-info");

    if (btnSuccess) {
        btnSuccess.addEventListener("click", () => {
            showToast({
                type: "success",
                title: "Thao tác thành công",
                message: "Các KPI và chỉ số tài chính đã được cập nhật thành công theo thời gian thực."
            });
        });
    }

    if (btnError) {
        btnError.addEventListener("click", () => {
            showToast({
                type: "error",
                title: "Lỗi kết nối",
                message: "Không thể làm mới dữ liệu từ API máy chủ. Vui lòng thử lại sau."
            });
        });
    }

    if (btnWarning) {
        btnWarning.addEventListener("click", () => {
            showToast({
                type: "warning",
                title: "Yêu cầu chờ xử lý",
                message: "Có 3 yêu cầu rút tiền mới của giảng viên đang ở trạng thái chờ duyệt."
            });
        });
    }

    if (btnInfo) {
        btnInfo.addEventListener("click", () => {
            showToast({
                type: "info",
                title: "Thông tin hệ thống",
                message: "Tỷ lệ phân bổ mặc định cho giảng viên là 70% và phí nền tảng là 30%."
            });
        });
    }
}

/**
 * Quản lý hiển thị các trạng thái UI chính
 */
function switchDashboardState(state) {
    const loadedWrapper = document.getElementById("dashboard-content-wrapper");
    const loadingWrapper = document.getElementById("dashboard-loading-wrapper");
    const emptyWrapper = document.getElementById("dashboard-empty-wrapper");
    const errorWrapper = document.getElementById("dashboard-error-wrapper");
    const forbiddenWrapper = document.getElementById("dashboard-forbidden-wrapper");

    // Ẩn tất cả các wrapper
    if (loadedWrapper) loadedWrapper.classList.add("hidden");
    if (loadingWrapper) loadingWrapper.classList.add("hidden");
    if (emptyWrapper) emptyWrapper.classList.add("hidden");
    if (errorWrapper) errorWrapper.classList.add("hidden");
    if (forbiddenWrapper) forbiddenWrapper.classList.add("hidden");

    // Hiển thị wrapper tương ứng
    if (state === "loaded") {
        if (loadedWrapper) loadedWrapper.classList.remove("hidden");
    } else if (state === "loading") {
        if (loadingWrapper) loadingWrapper.classList.remove("hidden");
    } else if (state === "empty") {
        if (emptyWrapper) emptyWrapper.classList.remove("hidden");
    } else if (state === "error") {
        if (errorWrapper) errorWrapper.classList.remove("hidden");
    } else if (state === "forbidden") {
        if (forbiddenWrapper) forbiddenWrapper.classList.remove("hidden");
    }
}

/**
 * Tải dữ liệu giả lập và kết xuất lên giao diện HTML
 */
function fetchAndRender() {
    const params = getQueryParams();

    // 1. Kiểm tra trạng thái UI được chỉ định trên URL trước
    if (params.state && params.state !== "loaded") {
        switchDashboardState(params.state);
        if (params.state === "error") {
            showToast({
                type: "error",
                title: "Lỗi kết nối",
                message: "Đã xảy ra sự cố khi tải dữ liệu từ API giả lập. Vui lòng kiểm tra kết nối."
            });
        } else if (params.state === "forbidden") {
            showToast({
                type: "warning",
                title: "Từ chối truy cập",
                message: "Tài khoản của bạn không có đủ quyền hạn để xem trang này (403 Forbidden)."
            });
        } else if (params.state === "empty") {
            showToast({
                type: "info",
                title: "Không có dữ liệu",
                message: "Không tìm thấy hoạt động nào của hệ thống trong khoảng thời gian được chọn."
            });
        }
        return;
    }

    // 2. Chuyển sang trạng thái Loading (hiển thị xương/skeleton) để giả lập trễ mạng
    switchDashboardState("loading");

    setTimeout(() => {
        try {
            // Lấy mock data khớp contract
            const data = getDashboardMockData({
                date_from: params.date_from,
                date_to: params.date_to,
                month: params.month,
                year: params.year
            });

            if (!data || !data.dashboard || !data.dashboard.data) {
                switchDashboardState("empty");
                showToast({
                    type: "info",
                    title: "Không có dữ liệu",
                    message: "Không tìm thấy hoạt động nào của hệ thống trong khoảng thời gian được chọn."
                });
                return;
            }

            // Chuyển sang trạng thái Loaded và render UI
            switchDashboardState("loaded");
            renderUI(data);

        } catch (error) {
            console.error("Lỗi khi kết xuất dữ liệu Dashboard:", error);
            switchDashboardState("error");
            showToast({
                type: "error",
                title: "Lỗi hiển thị",
                message: "Đã xảy ra sự cố khi xử lý dữ liệu để kết xuất giao diện."
            });
        }
    }, 300); // Giả lập trễ 300ms
}

/**
 * Kết xuất dữ liệu lên các thành phần giao diện
 */
function renderUI(data) {
    const dashboardData = data.dashboard.data;
    const summary = dashboardData.summary;
    const revenue = dashboardData.revenue;
    const courseStatus = dashboardData.course_status;
    const userStatus = dashboardData.user_status;
    const withdrawalSummary = dashboardData.withdrawal_summary;
    const actionRequired = dashboardData.action_required;
    const recent = dashboardData.recent;

    // 1. Render KPI chính
    const kpiTotalUsers = document.getElementById("kpi-total-users");
    const kpiUsersSub = document.getElementById("kpi-users-sub");
    if (kpiTotalUsers) kpiTotalUsers.textContent = formatNumber(summary.total_users);
    
    const totalUsers = summary.total_users || 0;
    const learners = summary.total_learners || 0;
    const instructors = summary.total_instructors || 0;
    const learnerPct = totalUsers > 0 ? (learners / totalUsers * 100) : 0;
    const instructorPct = totalUsers > 0 ? (instructors / totalUsers * 100) : 0;
    
    const barLearner = document.getElementById("kpi-users-bar-learner");
    const barInstructor = document.getElementById("kpi-users-bar-instructor");
    if (barLearner) barLearner.style.width = `${learnerPct}%`;
    if (barInstructor) barInstructor.style.width = `${instructorPct}%`;
    if (kpiUsersSub) {
        kpiUsersSub.textContent = `${formatNumber(learners)} học viên (${learnerPct.toFixed(0)}%) • ${formatNumber(instructors)} giảng viên (${instructorPct.toFixed(0)}%)`;
    }

    const kpiTotalCourses = document.getElementById("kpi-total-courses");
    const kpiCoursesSub = document.getElementById("kpi-courses-sub");
    const kpiCoursesPending = document.getElementById("kpi-courses-pending");
    if (kpiTotalCourses) kpiTotalCourses.textContent = formatNumber(summary.total_courses);
    
    const totalCourses = summary.total_courses || 0;
    const publishedCourses = summary.total_published_courses || 0;
    const publishedPct = totalCourses > 0 ? (publishedCourses / totalCourses * 100) : 0;
    
    const barPublished = document.getElementById("kpi-courses-bar-published");
    if (barPublished) barPublished.style.width = `${publishedPct}%`;
    if (kpiCoursesSub) {
        kpiCoursesSub.textContent = `${formatNumber(publishedCourses)} đã xuất bản (${publishedPct.toFixed(0)}%)`;
    }
    if (kpiCoursesPending) {
        kpiCoursesPending.textContent = `${courseStatus.pending_review} chờ duyệt`;
    }

    const kpiTotalEnrollments = document.getElementById("kpi-total-enrollments");
    const kpiEnrollmentsSub = document.getElementById("kpi-enrollments-sub");
    if (kpiTotalEnrollments) kpiTotalEnrollments.textContent = formatNumber(summary.total_enrollments);
    
    const totalEnrollments = summary.total_enrollments || 0;
    const completedEnrollments = summary.completed_enrollments || 0;
    const completionRate = summary.completion_rate !== undefined ? summary.completion_rate : (totalEnrollments > 0 ? (completedEnrollments / totalEnrollments * 100) : 0);
    
    const barCompleted = document.getElementById("kpi-enrollments-bar-completed");
    if (barCompleted) barCompleted.style.width = `${completionRate}%`;
    if (kpiEnrollmentsSub) {
        kpiEnrollmentsSub.textContent = `${formatNumber(completedEnrollments)} hoàn thành • Tỉ lệ ${formatPercent(completionRate)}`;
    }

    const kpiTotalOrders = document.getElementById("kpi-total-orders");
    const kpiOrdersSub = document.getElementById("kpi-orders-sub");
    if (kpiTotalOrders) kpiTotalOrders.textContent = formatNumber(summary.total_orders);
    
    const totalOrders = summary.total_orders || 0;
    const paidOrders = summary.paid_orders || 0;
    const paidPct = totalOrders > 0 ? (paidOrders / totalOrders * 100) : 0;
    
    const barPaid = document.getElementById("kpi-orders-bar-paid");
    if (barPaid) barPaid.style.width = `${paidPct}%`;
    if (kpiOrdersSub) {
        kpiOrdersSub.textContent = `${formatNumber(paidOrders)} đã thanh toán (${paidPct.toFixed(0)}%)`;
    }

    // 2. Render KPI tài chính phụ
    const kpiGrossRevenue = document.getElementById("kpi-gross-revenue");
    const kpiInstructorEarnings = document.getElementById("kpi-instructor-earnings");
    const kpiPlatformFee = document.getElementById("kpi-platform-fee");
    const kpiWithdrawalPendingAmount = document.getElementById("kpi-withdrawal-pending-amount");
    const kpiWithdrawalPendingCount = document.getElementById("kpi-withdrawal-pending-count");
    const kpiWithdrawalApprovedAmount = document.getElementById("kpi-withdrawal-approved-amount");
    const kpiWithdrawalApprovedCount = document.getElementById("kpi-withdrawal-approved-count");
    const kpiWithdrawalPaidAmount = document.getElementById("kpi-withdrawal-paid-amount");

    if (kpiGrossRevenue) kpiGrossRevenue.textContent = formatVND(revenue.gross_amount);
    if (kpiInstructorEarnings) kpiInstructorEarnings.textContent = formatVND(revenue.instructor_amount);
    if (kpiPlatformFee) kpiPlatformFee.textContent = formatVND(revenue.platform_fee_amount);
    if (kpiWithdrawalPendingAmount) kpiWithdrawalPendingAmount.textContent = formatVND(withdrawalSummary.pending_amount);
    if (kpiWithdrawalPendingCount) {
        kpiWithdrawalPendingCount.textContent = ` (${withdrawalSummary.pending_count})`;
    }
    const kpiWithdrawalPendingSub = document.getElementById("kpi-withdrawal-pending-sub");
    if (kpiWithdrawalPendingSub) {
        kpiWithdrawalPendingSub.textContent = `${withdrawalSummary.pending_count} yêu cầu đang chờ duyệt`;
    }

    if (kpiWithdrawalApprovedAmount) kpiWithdrawalApprovedAmount.textContent = formatVND(withdrawalSummary.approved_amount);
    if (kpiWithdrawalApprovedCount) {
        kpiWithdrawalApprovedCount.textContent = ` (${withdrawalSummary.approved_count})`;
    }
    const kpiWithdrawalApprovedSub = document.getElementById("kpi-withdrawal-approved-sub");
    if (kpiWithdrawalApprovedSub) {
        kpiWithdrawalApprovedSub.textContent = `${withdrawalSummary.approved_count} yêu cầu đã duyệt, chờ chi`;
    }

    if (kpiWithdrawalPaidAmount) kpiWithdrawalPaidAmount.textContent = formatVND(withdrawalSummary.paid_amount);

    // 3. Phân bổ trạng thái khóa học (Render động)
    const params = getQueryParams();
    const filterLabel = getFilterLabel(params);
    renderCourseStatusPanel(courseStatus, summary, filterLabel);

    // 4. Phân bổ trạng thái người dùng (Render động)
    renderUserStatusPanel(userStatus, summary, filterLabel);

    // 5. Công việc cần xử lý (action_required)
    renderActions(actionRequired);

    // 6. Xếp hạng Top khóa học
    renderTopCourses(data.top_courses.data.items);

    // 7. Xếp hạng Top giảng viên
    renderTopInstructors(data.top_instructors.data.items);

    // 8. Dữ liệu gần đây (Đơn hàng & Khóa học)
    renderRecentOrders(recent.latest_orders);
    renderRecentCourses(recent.latest_courses);

    // 9. Biểu đồ doanh thu
    renderChartData(data.revenue_report.data);
}

/**
 * Render công việc cần xử lý
 */
function renderActions(actions) {
    const container = document.getElementById("actions-container");
    if (!container) return;

    container.innerHTML = "";

    const actionItems = [
        {
            count: actions.pending_course_reviews,
            title: "Khóa học chờ duyệt",
            desc: `${actions.pending_course_reviews} khóa học mới cần kiểm duyệt`,
            btnText: "Duyệt ngay",
            link: "course-reviews.html",
            borderClass: "border-l-3 border-warning",
            badgeClass: "bg-warning-soft text-warning border border-warning/10",
            btnClass: "bg-success text-white hover:opacity-90"
        },
        {
            count: actions.pending_instructor_upgrades,
            title: "Yêu cầu nâng giảng viên",
            desc: `${actions.pending_instructor_upgrades} hồ sơ đăng ký cần xác minh`,
            btnText: "Xử lý",
            link: "instructor-upgrades.html",
            borderClass: "border-l-3 border-warning",
            badgeClass: "bg-warning-soft text-warning border border-warning/10",
            btnClass: "bg-warning text-white hover:opacity-90"
        },
        {
            count: actions.pending_withdrawals,
            title: "Yêu cầu rút tiền",
            desc: `${actions.pending_withdrawals} lệnh rút tiền đang chờ xử lý`,
            btnText: "Chi tiền",
            link: "withdrawals.html",
            borderClass: "border-l-3 border-danger-brick",
            badgeClass: "bg-danger-brick-soft text-danger-brick border border-danger-brick/10",
            btnClass: "bg-danger-brick text-white hover:opacity-90"
        },
        {
            count: actions.pending_payout_accounts,
            title: "Tài khoản nhận tiền",
            desc: `${actions.pending_payout_accounts} tài khoản ngân hàng chờ xác minh`,
            btnText: "Xác minh",
            link: "payout-accounts.html",
            borderClass: "border-l-3 border-success",
            badgeClass: "bg-success-soft text-success border border-success/10",
            btnClass: "bg-success text-white hover:opacity-90"
        }
    ];

    actionItems.forEach(item => {
        // Chỉ hiển thị các mục cần xử lý (count > 0)
        if (item.count > 0) {
            const div = document.createElement("div");
            div.className = `flex items-center justify-between p-3 rounded-[6px] bg-canvas border border-hairline/40 hover:bg-hairline/30 transition-colors ${item.borderClass}`;
            div.innerHTML = `
                <div class="min-w-0 pr-2">
                    <div class="flex items-center gap-1.5">
                        <span class="text-xs font-semibold text-ink">${item.title}</span>
                        <span class="${item.badgeClass} text-[9.5px] font-bold px-1.5 py-0.5 rounded-full">${item.count}</span>
                    </div>
                    <p class="text-[10px] text-mid-gray mt-1 leading-normal">${item.desc}</p>
                </div>
                <a href="${item.link}" class="inline-flex h-7 items-center rounded-full px-3 text-[10px] font-semibold shrink-0 transition-opacity ${item.btnClass}">
                    ${item.btnText}
                </a>
            `;
            container.appendChild(div);
        }
    });

    if (container.children.length === 0) {
        container.innerHTML = `
            <div class="h-28 flex flex-col items-center justify-center text-center">
                <svg class="w-6 h-6 text-mid-gray/40 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m4.5 12.75 6 6 9-13.5"/>
                </svg>
                <p class="text-[11px] text-mid-gray">Đã hoàn thành mọi công việc cần xử lý!</p>
            </div>
        `;
    }
}

/**
 * Render xếp hạng Top khóa học
 */
function renderTopCourses(items) {
    const container = document.getElementById("top-selling-courses-container");
    if (!container) return;

    container.innerHTML = "";

    if (!items || items.length === 0) {
        container.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-mid-gray">Không có khóa học nào.</td></tr>`;
        return;
    }

    items.forEach((course, index) => {
        const tr = document.createElement("tr");
        const isFirst = index === 0;
        tr.className = `hover:bg-canvas/50 transition-colors ${isFirst ? 'bg-success-soft/30 border-l-2 border-success' : ''}`;
        tr.innerHTML = `
            <td class="py-2.5 pl-2 font-semibold text-mid-gray">#${index + 1}</td>
            <td class="py-2.5 font-medium text-ink">
                <a href="courses.html?id=${course.course_id}" class="hover:underline block truncate max-w-[130px] font-medium" title="${course.title}">${course.title}</a>
                <span class="block text-[9px] text-mid-gray font-normal truncate">Giảng viên: ${course.instructor_name}</span>
            </td>
            <td class="py-2.5 text-right text-mid-gray font-sans">${formatNumber(course.sales_count)}</td>
            <td class="py-2.5 text-right font-semibold text-success font-sans">${formatVND(course.gross_revenue)}</td>
        `;
        container.appendChild(tr);
    });
}

/**
 * Render xếp hạng Top giảng viên
 */
function renderTopInstructors(items) {
    const container = document.getElementById("top-instructors-container");
    if (!container) return;

    container.innerHTML = "";

    if (!items || items.length === 0) {
        container.innerHTML = `<tr><td colspan="3" class="py-4 text-center text-mid-gray">Không có giảng viên nào.</td></tr>`;
        return;
    }

    items.forEach((inst, index) => {
        // Lấy ký tự đầu tên để làm avatar
        const initials = inst.full_name.split(" ").pop().substring(0, 2).toUpperCase();
        const total = inst.total_courses || 0;
        const published = inst.published_courses || 0;

        const tr = document.createElement("tr");
        const isFirst = index === 0;
        tr.className = `hover:bg-canvas/50 transition-colors ${isFirst ? 'bg-canvas/30 border-l-2 border-ink' : ''}`;
        tr.innerHTML = `
            <td class="py-2.5 font-medium text-ink flex items-center gap-2 pl-2">
                <span class="h-6.5 w-6.5 rounded-full bg-ink text-white font-semibold flex items-center justify-center text-[9px] shrink-0 select-none">${initials}</span>
                <div>
                    <span class="font-medium text-ink block truncate max-w-[90px]">${inst.full_name}</span>
                    <span class="text-[9px] text-mid-gray block truncate max-w-[90px]">${inst.email || ""}</span>
                </div>
            </td>
            <td class="py-2.5 text-right font-sans">
                <span class="text-ink font-medium block">${formatNumber(total)} khóa</span>
                <span class="text-[9px] text-success block mt-0.5">${formatNumber(published)} công khai</span>
            </td>
            <td class="py-2.5 text-right font-semibold text-success font-sans">${formatVND(inst.instructor_amount)}</td>
        `;
        container.appendChild(tr);
    });
}

/**
 * Render timeline Đơn hàng gần đây
 */
function renderRecentOrders(orders) {
    const container = document.getElementById("recent-orders-container");
    if (!container) return;

    container.innerHTML = "";

    if (!orders || orders.length === 0) {
        container.innerHTML = `<p class="text-[11px] text-mid-gray text-center py-6">Chưa có đơn hàng nào.</p>`;
        return;
    }

    orders.forEach(order => {
        const orderId = order.id;
        const amountFormatted = formatVND(order.amount);
        const courseTitle = order.course ? order.course.title : "Không rõ khóa học";
        const courseId = order.course ? order.course.id : "";
        const learnerName = order.user ? order.user.full_name : (order.learner_name || "Học viên");
        const paidDateFormatted = formatDateTime(order.paid_at);

        // Xác định trạng thái để render badge và viền trái
        const status = order.status || "paid";
        let statusLabel = "Đã thanh toán";
        let statusClass = "bg-success-soft text-success border border-success/15";
        let borderClass = "border-l-3 border-success";
        let amountColor = "text-success";

        if (status === "pending") {
            statusLabel = "Chờ xử lý";
            statusClass = "bg-warning-soft text-warning border border-warning/15";
            borderClass = "border-l-3 border-warning";
            amountColor = "text-ink";
        } else if (status === "failed") {
            statusLabel = "Thất bại";
            statusClass = "bg-danger-brick-soft text-danger-brick border border-danger-brick/15";
            borderClass = "border-l-3 border-danger-brick";
            amountColor = "text-ink";
        } else if (status === "cancelled") {
            statusLabel = "Đã hủy";
            statusClass = "bg-canvas text-mid-gray border border-hairline";
            borderClass = "border-l-3 border-mid-gray";
            amountColor = "text-mid-gray";
        }

        const item = document.createElement("div");
        item.className = `relative pl-3.5 pr-2 py-2 border border-hairline/40 rounded-[6px] hover:bg-canvas/40 transition-colors ${borderClass}`;
        item.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="text-xs">
                    <a href="orders.html?id=${orderId}" class="font-bold text-ink hover:underline">Đơn hàng #${orderId}</a>
                    <span class="text-mid-gray font-sans mx-1">·</span>
                    <span class="font-bold ${amountColor} font-sans">${amountFormatted}</span>
                </div>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statusClass}">${statusLabel}</span>
            </div>
            <div class="mt-1.5 text-[11px] text-ink leading-snug">
                Khóa học: ${courseId ? `<a href="courses.html?id=${courseId}" class="font-semibold text-ink hover:underline inline-block truncate max-w-[170px]" title="${courseTitle}">${courseTitle}</a>` : `<span class="font-semibold text-ink truncate max-w-[170px] inline-block" title="${courseTitle}">${courseTitle}</span>`}
            </div>
            <div class="flex items-center justify-between mt-1 text-[10px] text-mid-gray">
                <span>Học viên: ${learnerName}</span>
                <span class="font-sans text-[9px]">${paidDateFormatted}</span>
            </div>
        `;
        container.appendChild(item);
    });
}

/**
 * Render timeline Khóa học gần đây
 */
function renderRecentCourses(courses) {
    const container = document.getElementById("recent-courses-container");
    if (!container) return;

    container.innerHTML = "";

    if (!courses || courses.length === 0) {
        container.innerHTML = `<p class="text-[11px] text-mid-gray text-center py-6">Chưa có khóa học nào.</p>`;
        return;
    }

    courses.forEach(course => {
        let statusLabel = "Nháp";
        let statusClass = "bg-canvas text-mid-gray border border-hairline";
        let borderClass = "border-l-3 border-mid-gray";

        if (course.status === "published") {
            statusLabel = "Đã xuất bản";
            statusClass = "bg-success-soft text-success border border-success/15";
            borderClass = "border-l-3 border-success";
        } else if (course.status === "pending_review") {
            statusLabel = "Chờ duyệt";
            statusClass = "bg-warning-soft text-warning border border-warning/15";
            borderClass = "border-l-3 border-warning";
        } else if (course.status === "approved") {
            statusLabel = "Đã duyệt";
            statusClass = "bg-blue-50 text-blue-700 border border-blue-200";
            borderClass = "border-l-3 border-blue-600";
        } else if (course.status === "rejected") {
            statusLabel = "Từ chối";
            statusClass = "bg-danger-brick-soft text-danger-brick border border-danger-brick/15";
            borderClass = "border-l-3 border-danger-brick";
        }

        const dateToShow = course.published_at || course.approved_at || course.created_at;
        const dateFormatted = formatDateTime(dateToShow);

        const item = document.createElement("div");
        item.className = `relative pl-3.5 pr-2 py-2 border border-hairline/40 rounded-[6px] hover:bg-canvas/40 transition-colors ${borderClass}`;
        item.innerHTML = `
            <div class="flex items-center justify-between">
                <a href="courses.html?id=${course.id}" class="font-bold text-ink text-xs hover:underline truncate max-w-[170px]" title="${course.title}">${course.title}</a>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statusClass}">${statusLabel}</span>
            </div>
            <div class="flex items-center justify-between mt-2 text-[10px] text-mid-gray">
                <span>Giảng viên: ${course.instructor_name}</span>
                <span class="font-sans text-[9px]">${dateFormatted}</span>
            </div>
        `;
        container.appendChild(item);
    });
}

/**
 * Vẽ biểu đồ tài chính bằng Chart.js
 */
function renderChartData(reportData) {
    const canvas = document.getElementById("revenue-chart-canvas");
    const emptyState = document.getElementById("chart-empty-state");
    if (!canvas) return;

    if (myChart) {
        myChart.destroy();
    }

    const items = reportData.items || [];
    if (items.length === 0) {
        if (emptyState) emptyState.classList.remove("hidden");
        return;
    }

    if (emptyState) emptyState.classList.add("hidden");

    const labels = items.map(item => item.date);
    const grossData = items.map(item => parseFloat(item.gross_amount));
    const instructorData = items.map(item => parseFloat(item.instructor_amount));
    const platformData = items.map(item => parseFloat(item.platform_fee_amount));

    const ctx = canvas.getContext("2d");
    myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Doanh thu gộp",
                    data: grossData,
                    borderColor: "#15803d",
                    backgroundColor: "transparent",
                    borderWidth: 2.5,
                    pointBackgroundColor: "#ffffff",
                    pointBorderColor: "#15803d",
                    pointHoverRadius: 6,
                    pointRadius: 4,
                    tension: 0.15
                },
                {
                    label: "Thu nhập giảng viên",
                    data: instructorData,
                    borderColor: "#404040",
                    backgroundColor: "transparent",
                    borderWidth: 1.8,
                    pointBackgroundColor: "#ffffff",
                    pointBorderColor: "#404040",
                    pointHoverRadius: 5,
                    pointRadius: 3,
                    tension: 0.15
                },
                {
                    label: "Phí nền tảng",
                    data: platformData,
                    borderColor: "#b7791f",
                    backgroundColor: "transparent",
                    borderWidth: 1.8,
                    pointBackgroundColor: "#ffffff",
                    pointBorderColor: "#b7791f",
                    pointHoverRadius: 5,
                    pointRadius: 3,
                    tension: 0.15
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    align: "end",
                    labels: {
                        boxWidth: 8,
                        boxHeight: 8,
                        usePointStyle: true,
                        font: {
                            family: "Geist, Inter, sans-serif",
                            size: 11
                        },
                        color: "#0a0a0a"
                    }
                },
                tooltip: {
                    backgroundColor: "#1f2937",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    padding: 8,
                    cornerRadius: 6,
                    titleFont: {
                        family: "Geist, Inter, sans-serif",
                        size: 11,
                        weight: "600"
                    },
                    bodyFont: {
                        family: "Geist, Inter, sans-serif",
                        size: 11
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || "";
                            if (label) {
                                label += ": ";
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: "#737373",
                        font: {
                            family: "Geist, Inter, sans-serif",
                            size: 10
                        }
                    }
                },
                y: {
                    grid: {
                        color: "#f5f5f5"
                    },
                    ticks: {
                        color: "#737373",
                        font: {
                            family: "Geist, Inter, sans-serif",
                            size: 10
                        },
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000) + "M đ";
                            }
                            return value + " đ";
                        }
                    }
                }
            }
        }
    });
}

/**
 * Đọc nhãn thời gian hiện tại dựa trên query params
 */
function getFilterLabel(params) {
    if (params.date_from === "2026-07-06" && params.date_to === "2026-07-12") {
        return "7 ngày qua";
    }
    if (params.date_from === "2026-06-13" && params.date_to === "2026-07-12") {
        return "30 ngày qua";
    }
    if (params.month === 7 && params.year === 2026) {
        return "Tháng này";
    }
    if (params.year === 2026 && !params.month) {
        return "Năm nay";
    }
    if (params.date_from && params.date_to) {
        const formatDate = (str) => {
            const parts = str.split("-");
            if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
            return str;
        };
        return `${formatDate(params.date_from)} - ${formatDate(params.date_to)}`;
    }
    return "7 ngày qua"; // Mặc định
}

/**
 * Render động panel Phân bổ trạng thái khóa học
 */
function renderCourseStatusPanel(courseStatus, summary, filterLabel) {
    const container = document.getElementById("course-status-panel");
    if (!container) return;

    const totalCourses = summary.total_courses || 0;

    const statuses = [
        {
            key: "draft",
            label: "Nháp",
            code: "draft",
            count: courseStatus.draft || 0,
            colorClass: "bg-mid-gray",
            textClass: "text-mid-gray",
            bgSoftClass: "bg-canvas",
            icon: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
            link: "courses.html?status=draft"
        },
        {
            key: "pending_review",
            label: "Chờ duyệt",
            code: "pending_review",
            count: courseStatus.pending_review || 0,
            colorClass: "bg-warning",
            textClass: "text-warning",
            bgSoftClass: "bg-warning-soft/60",
            icon: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            link: "course-reviews.html"
        },
        {
            key: "approved",
            label: "Đã duyệt",
            code: "approved",
            count: courseStatus.approved || 0,
            colorClass: "bg-success",
            textClass: "text-success",
            bgSoftClass: "bg-success-soft/40",
            icon: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            link: "courses.html?status=approved"
        },
        {
            key: "rejected",
            label: "Bị từ chối",
            code: "rejected",
            count: courseStatus.rejected || 0,
            colorClass: "bg-danger-brick",
            textClass: "text-danger-brick",
            bgSoftClass: "bg-danger-brick-soft/40",
            icon: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            link: "courses.html?status=rejected"
        },
        {
            key: "published",
            label: "Đã xuất bản",
            code: "published",
            count: courseStatus.published || 0,
            colorClass: "bg-success",
            textClass: "text-success",
            bgSoftClass: "bg-success-soft/60",
            icon: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`,
            link: "courses.html?status=published"
        },
        {
            key: "hidden",
            label: "Đã ẩn",
            code: "hidden",
            count: courseStatus.hidden || 0,
            colorClass: "bg-mid-gray",
            textClass: "text-ink-soft",
            bgSoftClass: "bg-canvas",
            icon: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>`,
            link: "courses.html?status=hidden"
        }
    ];

    let html = `
        <div class="shrink-0">
            <h3 class="text-xs font-bold text-mid-gray uppercase tracking-wider">Phân bổ trạng thái khóa học</h3>
            <p class="text-[11px] text-mid-gray mt-0.5">
                <span class="font-bold text-ink font-sans">${formatNumber(totalCourses)}</span> khóa học · ${filterLabel}
            </p>
        </div>
    `;

    // Stacked Distribution Bar
    html += `
        <div class="flex h-2 w-full bg-canvas rounded-full overflow-hidden shrink-0 mt-0.5 shadow-inner">
    `;
    statuses.forEach(status => {
        const percent = totalCourses > 0 ? (status.count / totalCourses * 100) : 0;
        if (percent > 0) {
            html += `
                <div class="${status.colorClass} h-full" style="width: ${percent}%" title="${status.label}: ${formatNumber(status.count)} (${percent.toFixed(0)}%)"></div>
            `;
        }
    });
    if (totalCourses === 0) {
        html += `<div class="bg-hairline w-full h-full"></div>`;
    }
    html += `</div>`;

    // Items list (Grid 2 cột)
    html += `
        <div class="grid grid-cols-2 gap-2 flex-1 overflow-y-auto pr-0.5 mt-1.5 custom-scrollbar">
    `;
    statuses.forEach(status => {
        const percent = totalCourses > 0 ? (status.count / totalCourses * 100) : 0;
        html += `
            <a href="${status.link}" class="flex flex-col justify-between p-2 bg-paper hover:bg-canvas/30 border border-hairline rounded-[6px] transition-all hover:border-mid-gray/30 group">
                <div class="flex items-start justify-between gap-1">
                    <div class="flex items-start gap-1.5 min-w-0">
                        <div class="flex h-5 w-5 items-center justify-center rounded-full shrink-0 ${status.textClass} ${status.bgSoftClass} border border-current/10">
                            ${status.icon}
                        </div>
                        <div class="min-w-0">
                            <span class="text-[11px] font-bold text-ink block leading-tight truncate group-hover:underline">${status.label}</span>
                            <span class="text-[9px] text-mid-gray font-mono block leading-none mt-0.5 truncate">${status.code}</span>
                        </div>
                    </div>
                    <div class="text-right shrink-0">
                        <span class="text-xs font-bold text-ink font-sans block leading-tight">${formatNumber(status.count)}</span>
                        <span class="text-[9px] text-mid-gray block leading-none mt-0.5">${percent.toFixed(0)}%</span>
                    </div>
                </div>
                <div class="w-full bg-canvas h-1 rounded-full mt-2 overflow-hidden shrink-0">
                    <div class="${status.colorClass} h-full rounded-full" style="width: ${percent}%"></div>
                </div>
            </a>
        `;
    });
    html += `</div>`;

    container.innerHTML = html;
}

/**
 * Render động panel Trạng thái tài khoản người dùng
 */
function renderUserStatusPanel(userStatus, summary, filterLabel) {
    const container = document.getElementById("user-status-panel");
    if (!container) return;

    const totalUsers = summary.total_users || 0;

    const statuses = [
        {
            key: "active",
            label: "Đang hoạt động",
            code: "active",
            count: userStatus.active || 0,
            colorClass: "bg-success",
            textClass: "text-success",
            bgSoftClass: "bg-success-soft/40",
            icon: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            link: "users.html?status=active"
        },
        {
            key: "inactive",
            label: "Chưa kích hoạt",
            code: "inactive",
            count: userStatus.inactive || 0,
            colorClass: "bg-mid-gray",
            textClass: "text-mid-gray",
            bgSoftClass: "bg-canvas",
            icon: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
            link: "users.html?status=inactive"
        },
        {
            key: "locked",
            label: "Đang bị khóa",
            code: "locked",
            count: userStatus.locked || 0,
            colorClass: "bg-danger-brick",
            textClass: "text-danger-brick",
            bgSoftClass: "bg-danger-brick-soft/40",
            icon: `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
            link: "users.html?status=locked"
        }
    ];

    let html = `
        <div class="shrink-0">
            <h3 class="text-xs font-bold text-mid-gray uppercase tracking-wider">Trạng thái tài khoản người dùng</h3>
            <p class="text-[11px] text-mid-gray mt-0.5">
                <span class="font-bold text-ink font-sans">${formatNumber(totalUsers)}</span> người dùng · ${filterLabel}
            </p>
        </div>
    `;

    // Stacked Distribution Bar
    html += `
        <div class="flex h-2 w-full bg-canvas rounded-full overflow-hidden shrink-0 mt-0.5 shadow-inner">
    `;
    statuses.forEach(status => {
        const percent = totalUsers > 0 ? (status.count / totalUsers * 100) : 0;
        if (percent > 0) {
            html += `
                <div class="${status.colorClass} h-full" style="width: ${percent}%" title="${status.label}: ${formatNumber(status.count)} (${percent.toFixed(0)}%)"></div>
            `;
        }
    });
    if (totalUsers === 0) {
        html += `<div class="bg-hairline w-full h-full"></div>`;
    }
    html += `</div>`;

    // Items list (Flex Column để phân bổ đều)
    html += `
        <div class="flex flex-col gap-2 flex-1 justify-center mt-1.5">
    `;
    statuses.forEach(status => {
        const percent = totalUsers > 0 ? (status.count / totalUsers * 100) : 0;
        html += `
            <a href="${status.link}" class="flex flex-col justify-between p-2.5 bg-paper hover:bg-canvas/30 border border-hairline rounded-[6px] transition-all hover:border-mid-gray/30 group">
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                        <div class="flex h-6 w-6 items-center justify-center rounded-full shrink-0 ${status.textClass} ${status.bgSoftClass} border border-current/10">
                            ${status.icon}
                        </div>
                        <div class="min-w-0">
                            <span class="text-xs font-bold text-ink block leading-tight group-hover:underline truncate">${status.label}</span>
                            <span class="text-[10px] text-mid-gray font-mono block leading-none mt-0.5 truncate">${status.code}</span>
                        </div>
                    </div>
                    <div class="text-right shrink-0">
                        <span class="text-sm font-bold text-ink font-sans block leading-tight">${formatNumber(status.count)}</span>
                        <span class="text-[10px] text-mid-gray block leading-none mt-0.5">${percent.toFixed(0)}%</span>
                    </div>
                </div>
                <div class="w-full bg-canvas h-1.5 rounded-full mt-2 overflow-hidden shrink-0">
                    <div class="${status.colorClass} h-full rounded-full" style="width: ${percent}%"></div>
                </div>
            </a>
        `;
    });
    html += `</div>`;

    container.innerHTML = html;
}
