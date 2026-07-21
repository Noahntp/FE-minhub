/**
 * MindHub Admin Toast Notification System
 * ES Module dùng chung toàn hệ thống để hiển thị thông báo.
 * Tải trực tiếp dưới document.body ở góc dưới bên phải (bottom-5 right-5).
 */

let toastContainer = null;

/**
 * Tạo container chứa Toast nếu chưa tồn tại
 */
function createToastContainer() {
    toastContainer = document.createElement("div");
    toastContainer.id = "admin-toast-container";
    // Đặt ở góc dưới bên phải, z-index 2000 (cao nhất), flex-col-reverse để toast mới nằm dưới cùng
    toastContainer.className = "fixed bottom-5 right-5 z-[2000] flex flex-col-reverse gap-2.5 w-full max-w-[380px] pointer-events-none px-3 md:px-0";
    document.body.appendChild(toastContainer);
}

/**
 * Hiển thị một Toast thông báo dùng chung cho toàn dự án.
 * Hỗ trợ linh hoạt cả dạng Object { type, title, message, duration }
 * lẫn dạng truyền Positional: showToast(message, type, title, duration)
 */
export function showToast(options, typeParam, titleParam, durationParam) {
    let type = "info";
    let title = "";
    let message = "";
    let duration = 4000;

    // Phân tích tham số linh hoạt (Adapter toàn diện)
    if (typeof options === "object" && options !== null) {
        type = options.type || "info";
        title = options.title || "";
        message = options.message || "";
        duration = options.duration || 4000;
    } else if (typeof options === "string") {
        message = options;
        type = typeParam || "info";
        title = titleParam || "";
        duration = durationParam || 4000;
    }

    // Trim khoảng trắng
    title = (title || "").trim();
    message = (message || "").trim();

    // Fallbacks mặc định dựa trên loại Toast để KHÔNG BAO GIỜ bị rỗng text
    if (!title && !message) {
        switch (type) {
            case "success":
                title = "Thao tác thành công";
                message = "Dữ liệu đã được cập nhật thành công.";
                break;
            case "error":
                title = "Không thể thực hiện";
                message = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại.";
                break;
            case "warning":
                title = "Cần kiểm tra";
                message = "Có thông tin cần bạn chú ý xem xét.";
                break;
            case "info":
            default:
                title = "Thông báo hệ thống";
                message = "Có cập nhật thông tin mới.";
                break;
        }
    } else if (!title) {
        switch (type) {
            case "success": title = "Thành công"; break;
            case "error": title = "Đã xảy ra lỗi"; break;
            case "warning": title = "Cảnh báo"; break;
            case "info": default: title = "Thông báo"; break;
        }
    } else if (!message) {
        message = title;
    }

    if (!toastContainer || !document.body.contains(toastContainer)) {
        createToastContainer();
    }

    // Giới hạn tối đa 4 Toast cùng lúc. Nếu vượt quá, xóa Toast cũ nhất ở phía trên
    const activeToasts = toastContainer.querySelectorAll(".admin-toast-item");
    if (activeToasts.length >= 4) {
        const oldestToast = activeToasts[0];
        oldestToast.classList.add("translate-y-4", "opacity-0");
        setTimeout(() => oldestToast.remove(), 200);
    }

    const toast = document.createElement("div");
    // Class style: background trắng, border hairline, stroke-only icon, pointer-events auto
    toast.className = "admin-toast-item pointer-events-auto flex items-start gap-3 p-3.5 bg-paper border border-hairline rounded-[6px] shadow-lg transition-all duration-300 transform translate-y-4 opacity-0 select-none border-l-4";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");

    // Khởi tạo các màu sắc và icon SVG nét mảnh (Stroke-only, không có nền tròn)
    let borderAccentClass = "";
    let iconSvg = "";

    if (type === "success") {
        borderAccentClass = "border-l-success";
        iconSvg = `
            <svg class="w-4.5 h-4.5 text-success shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
        `;
    } else if (type === "error") {
        borderAccentClass = "border-l-danger-brick";
        iconSvg = `
            <svg class="w-4.5 h-4.5 text-danger-brick shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
        `;
    } else if (type === "warning") {
        borderAccentClass = "border-l-warning";
        iconSvg = `
            <svg class="w-4.5 h-4.5 text-warning shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
        `;
    } else { // info
        borderAccentClass = "border-l-mid-gray";
        iconSvg = `
            <svg class="w-4.5 h-4.5 text-mid-gray shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12v-.008z"/>
            </svg>
        `;
    }

    toast.classList.add(borderAccentClass);

    const allowHtml = typeof options === "object" && options !== null && options.allowHtml;
    const messageContent = allowHtml ? message : escapeHtml(message);

    toast.innerHTML = `
        ${iconSvg}
        <div class="flex-1 min-w-0 pr-1">
            <h4 class="text-xs font-semibold text-ink leading-tight">${escapeHtml(title)}</h4>
            <p class="text-[11px] text-mid-gray mt-0.5 leading-snug break-words">${messageContent}</p>
        </div>
        <button type="button" class="close-toast text-mid-gray hover:text-ink shrink-0 p-0.5 hover:bg-canvas rounded transition-colors cursor-pointer" aria-label="Đóng thông báo">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    `;

    toastContainer.appendChild(toast);

    if (typeof options === "object" && options !== null && typeof options.onAction === "function") {
        const actionBtn = toast.querySelector(".btn-toast-action");
        if (actionBtn) {
            actionBtn.addEventListener("click", (e) => {
                options.onAction(closeToast, e);
            });
        }
    }

    // Kích hoạt hiệu ứng xuất hiện từ dưới lên (Slide up fade in)
    setTimeout(() => {
        toast.classList.remove("translate-y-4", "opacity-0");
        toast.classList.add("translate-y-0", "opacity-100");
    }, 10);

    let dismissTimeout = null;
    let startTime = null;
    let remainingTime = duration;

    const startTimer = () => {
        startTime = Date.now();
        dismissTimeout = setTimeout(() => {
            closeToast();
        }, remainingTime);
    };

    const stopTimer = () => {
        clearTimeout(dismissTimeout);
        remainingTime -= Date.now() - startTime;
        if (remainingTime < 0) remainingTime = 0;
    };

    const closeToast = () => {
        toast.classList.remove("translate-y-0", "opacity-100");
        toast.classList.add("translate-y-4", "opacity-0");
        toast.addEventListener("transitionend", function handler() {
            toast.removeEventListener("transitionend", handler);
            toast.remove();
        });
    };

    const closeBtn = toast.querySelector(".close-toast");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeToast);
    }

    toast.addEventListener("mouseenter", stopTimer);
    toast.addEventListener("mouseleave", startTimer);

    startTimer();

    return {
        close: closeToast,
        toastElement: toast
    };
}

/**
 * Gắn showToast vào window để hỗ trợ cả non-ES module scripts
 */
if (typeof window !== "undefined") {
    window.showToast = showToast;
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
