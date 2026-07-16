/**
 * MindHub Admin Table Row Click Helper
 * Tự động quản lý mở Drawer chi tiết khi bấm vào bất kỳ vùng hợp lệ nào của dòng dữ liệu trong bảng.
 */

/**
 * Kiểm tra xem target có phải phần tử tương tác cần loại trừ hay không
 */
export function isInteractiveElement(target) {
    if (!target) return false;
    return Boolean(target.closest(
        'button, a, input, textarea, select, label, ' +
        '[role="button"], [role="menuitem"], ' +
        '[data-no-row-click], [data-custom-select], .custom-select-trigger, .custom-select-dropdown, .switch, .dropdown-menu'
    ));
}

/**
 * Gắn sự kiện delegated click & keyboard truy cập dòng cho Table Body
 * @param {Object} options
 * @param {HTMLElement|string} [options.container] - Thẻ container/tbody hoặc selector
 * @param {HTMLElement|string} [options.tbody] - Thẻ tbody hoặc selector
 * @param {string} options.rowSelector - Selector dòng (ví dụ: '[data-course-row]')
 * @param {string} [options.idAttribute] - Attribute chứa ID (mặc định: 'data-course-id')
 * @param {Function} [options.getRowId] - Callback tùy chỉnh lấy ID từ row element
 * @param {Function} [options.onOpen] - Callback mở drawer (id)
 * @param {Function} [options.onRowClick] - Callback mở drawer (id, row, event)
 */
export function enableTableRowClick(options) {
    const targetElement = options.container || options.tbody;
    const container = typeof targetElement === "string" ? document.querySelector(targetElement) : targetElement;
    if (!container || container.dataset.rowClickBound === "true") return;

    // Đánh dấu để tránh lặp event listener khi re-render
    container.dataset.rowClickBound = "true";

    const rowSelector = options.rowSelector || "[data-course-row], [data-row-id]";
    const idAttribute = options.idAttribute || "data-course-id";

    const extractRowId = (row) => {
        if (typeof options.getRowId === "function") {
            return options.getRowId(row);
        }
        const val = row.getAttribute(idAttribute) || row.dataset.courseId || row.dataset.rowId || row.dataset.id;
        return Number(val);
    };

    const triggerCallback = (id, row, e) => {
        if (typeof options.onOpen === "function") {
            options.onOpen(id, row, e);
        } else if (typeof options.onRowClick === "function") {
            options.onRowClick(id, row, e);
        }
    };

    let startX = 0;
    let startY = 0;
    let isDragging = false;

    container.addEventListener("pointerdown", (e) => {
        startX = e.clientX;
        startY = e.clientY;
        isDragging = false;
    });

    container.addEventListener("pointermove", (e) => {
        if (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8) {
            isDragging = true;
        }
    });

    // Xử lý Click dòng
    container.addEventListener("click", (e) => {
        const row = e.target.closest(rowSelector);
        if (!row || !container.contains(row)) return;

        // 1. Kiểm tra phần tử tương tác
        if (isInteractiveElement(e.target)) return;

        // 2. Kiểm tra có đang chọn text bôi đen không
        const selectedText = window.getSelection()?.toString().trim();
        if (selectedText) return;

        // 3. Kiểm tra có đang vuốt kéo cuộn ngang bảng không
        if (isDragging) return;

        // 4. Lấy ID
        const id = extractRowId(row);
        if (Number.isInteger(id) && id > 0) {
            triggerCallback(id, row, e);
        }
    });

    // Xử lý Bàn phím (Accessibility: Enter / Space)
    container.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;

        const row = e.target.closest(rowSelector);
        if (!row || !container.contains(row)) return;

        if (isInteractiveElement(e.target)) return;

        e.preventDefault();
        const id = extractRowId(row);
        if (Number.isInteger(id) && id > 0) {
            triggerCallback(id, row, e);
        }
    });
}
