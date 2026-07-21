/**
 * Sidebar Scroll Position Keeper for MindHub Admin
 * Lưu và khôi phục scrollTop của sidebar menu khi chuyển giữa các trang quản trị.
 */
document.addEventListener("DOMContentLoaded", () => {
    const sidebarNav = document.querySelector("aside .overflow-y-auto, aside [data-sidebar-scroll]");
    if (!sidebarNav) return;

    const scrollKey = "mindhub-admin-sidebar-scroll";

    // 1. Khôi phục vị trí cuộn khi trang vừa load xong
    const savedScrollTop = Number(sessionStorage.getItem(scrollKey) || 0);
    if (savedScrollTop > 0) {
        requestAnimationFrame(() => {
            sidebarNav.scrollTop = savedScrollTop;
            // Sau khi khôi phục vị trí cuộn, kiểm tra xem menu active có bị khuất không
            adjustActiveMenuItemVisibility(sidebarNav);
        });
    } else {
        requestAnimationFrame(() => {
            adjustActiveMenuItemVisibility(sidebarNav);
        });
    }

    // 2. Lắng nghe sự kiện click trên các liên kết sidebar để lưu scrollTop
    sidebarNav.addEventListener("click", (e) => {
        const link = e.target.closest("a[href]");
        if (link) {
            sessionStorage.setItem(scrollKey, String(sidebarNav.scrollTop));
        }
    });

    /**
     * Tự động điều chỉnh cuộn tối thiểu nếu menu active bị nằm ngoài vùng nhìn thấy
     */
    function adjustActiveMenuItemVisibility(container) {
        const activeItem = container.querySelector(".sidebar-item.active");
        if (!activeItem) return;

        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;

        const itemTop = activeItem.offsetTop;
        const itemBottom = itemTop + activeItem.clientHeight;

        // Nếu menu active nằm khuất bên trên vùng hiển thị của sidebar
        if (itemTop < containerTop) {
            container.scrollTop = itemTop - 12; // offset 12px
        }
        // Nếu menu active nằm khuất bên dưới vùng hiển thị của sidebar
        else if (itemBottom > containerBottom) {
            container.scrollTop = itemBottom - container.clientHeight + 12;
        }
    }
});
