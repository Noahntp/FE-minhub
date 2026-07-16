import { initializeInteractions } from "./sidebar.js";

/**
 * Xác định tiền tố đường dẫn tương đối dựa trên độ sâu của trang hiện tại.
 */
function getRootPrefix() {
    const path = window.location.pathname;
    return path.includes("/pages/") ? "../" : "./";
}

/**
 * Nạp động Topbar vào trang HTML hiện tại và cập nhật Breadcrumb.
 */
export async function initializeLayout() {
    const rootPrefix = getRootPrefix();

    // 2. Nạp Topbar
    const topbarPlaceholder = document.querySelector("header") || document.getElementById("topbar-placeholder");
    if (topbarPlaceholder) {
        try {
            const response = await fetch(`${rootPrefix}components/topbar.html`);
            if (response.ok) {
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const loadedTopbar = doc.querySelector("header");

                if (loadedTopbar) {
                    // Thay thế placeholder
                    topbarPlaceholder.replaceWith(loadedTopbar);
                    
                    // Cập nhật lại nhãn Breadcrumb sau khi topbar đã hiển thị
                    const activeItem = document.querySelector(".sidebar-item.active");
                    if (activeItem) {
                        const breadcrumbLabel = document.getElementById("breadcrumb-current-label");
                        const textSpan = activeItem.querySelector(".sidebar-text");
                        if (breadcrumbLabel && textSpan) {
                            breadcrumbLabel.textContent = textSpan.textContent.trim();
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Lỗi khi tải topbar component:", error);
        }
    }

    // 3. Khởi tạo tương tác sự kiện cho các thành phần layout
    initializeInteractions();
}
