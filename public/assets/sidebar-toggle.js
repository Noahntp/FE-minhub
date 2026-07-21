/**
 * Module JS dùng chung: Quản lý đóng/mở Sidebar (Desktop 248px <-> 72px & Mobile Drawer)
 * Lưu trữ trạng thái bền vững với localStorage key "mindhub-sidebar-collapsed"
 */
(function () {
    const STORAGE_KEY = "mindhub-sidebar-collapsed";

    function getSidebar() {
        return document.getElementById("admin-sidebar") || document.querySelector("[data-sidebar]");
    }

    function getToggleBtn() {
        return document.getElementById("sidebar-collapse-toggle");
    }

    function getToggleIcon() {
        return document.getElementById("sidebar-toggle-icon");
    }

    function setCollapsedState(sidebar, btn, icon, isCollapsed) {
        if (!sidebar) return;

        if (isCollapsed) {
            sidebar.classList.add("sidebar-collapsed");
            if (btn) btn.setAttribute("aria-expanded", "false");
            if (icon) icon.classList.add("rotate-180");
        } else {
            sidebar.classList.remove("sidebar-collapsed");
            if (btn) btn.setAttribute("aria-expanded", "true");
            if (icon) icon.classList.remove("rotate-180");
        }
    }

    function createOrGetMobileOverlay() {
        let overlay = document.getElementById("sidebar-mobile-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "sidebar-mobile-overlay";
            overlay.className = "fixed inset-0 z-40 bg-black/40 hidden transition-opacity duration-300 lg:hidden";
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    function toggleMobileSidebar(open) {
        const sidebar = getSidebar();
        const overlay = createOrGetMobileOverlay();
        if (!sidebar) return;

        if (open) {
            sidebar.classList.remove("-translate-x-full");
            overlay.classList.remove("hidden");
        } else {
            sidebar.classList.add("-translate-x-full");
            overlay.classList.add("hidden");
        }
    }

    function initSidebarToggle() {
        if (window.__mindhubSidebarInited) return;
        window.__mindhubSidebarInited = true;

        const sidebar = getSidebar();
        const btn = getToggleBtn();
        const icon = getToggleIcon();

        if (!sidebar) return;

        // 1. Khôi phục trạng thái thu gọn trên Desktop từ localStorage
        const savedState = localStorage.getItem(STORAGE_KEY);
        const isCollapsed = savedState === "true";
        setCollapsedState(sidebar, btn, icon, isCollapsed);

        // 2. Lắng nghe click nút Toggle Desktop giữa cạnh phải
        if (btn) {
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                const currentlyCollapsed = sidebar.classList.contains("sidebar-collapsed");
                const nextState = !currentlyCollapsed;

                setCollapsedState(sidebar, btn, icon, nextState);
                localStorage.setItem(STORAGE_KEY, nextState ? "true" : "false");
            });
        }

        // 3. Xử lý Nút Mở/Đóng Mobile Drawer
        const openBtns = document.querySelectorAll("[data-sidebar-open]");
        openBtns.forEach(b => {
            b.addEventListener("click", function (e) {
                e.stopPropagation();
                toggleMobileSidebar(true);
            });
        });

        const closeBtns = document.querySelectorAll("[data-sidebar-close]");
        closeBtns.forEach(b => {
            b.addEventListener("click", function (e) {
                e.stopPropagation();
                toggleMobileSidebar(false);
            });
        });

        const overlay = createOrGetMobileOverlay();
        overlay.addEventListener("click", function () {
            toggleMobileSidebar(false);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSidebarToggle);
    } else {
        initSidebarToggle();
    }
})();
