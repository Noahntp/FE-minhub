/**
 * Xử lý tương tác giao diện Admin Shell (Sidebar, Topbar, Dropdowns, Mobile Drawer).
 */
export function initializeInteractions() {
    const sidebar = document.querySelector("[data-sidebar]");
    const toggleMobileBtn = document.querySelector("[data-sidebar-toggle-mobile]");
    const closeMobileBtn = document.querySelector("[data-sidebar-close]");
    
    // 1. Quản lý Mobile Sidebar Overlay
    let overlay = document.getElementById("sidebar-overlay");
    if (!overlay && sidebar) {
        overlay = document.createElement("div");
        overlay.id = "sidebar-overlay";
        overlay.className = "fixed inset-0 z-40 bg-black/40 opacity-0 pointer-events-none transition-opacity duration-300 lg:hidden";
        document.body.appendChild(overlay);
    }
    
    function openMobileSidebar() {
        if (sidebar) {
            sidebar.classList.remove("-translate-x-full");
            sidebar.classList.add("translate-x-0");
        }
        if (overlay) {
            overlay.classList.remove("opacity-0", "pointer-events-none");
            overlay.classList.add("opacity-100");
        }
        // Khóa cuộn màn hình phía sau
        document.body.classList.add("overflow-hidden");
    }
    
    function closeMobileSidebar() {
        if (sidebar) {
            sidebar.classList.remove("translate-x-0");
            sidebar.classList.add("-translate-x-full");
        }
        if (overlay) {
            overlay.classList.remove("opacity-100");
            overlay.classList.add("opacity-0", "pointer-events-none");
        }
        // Mở khóa cuộn màn hình phía sau
        document.body.classList.remove("overflow-hidden");
    }
    
    if (toggleMobileBtn) {
        toggleMobileBtn.addEventListener("click", openMobileSidebar);
    }
    if (closeMobileBtn) {
        closeMobileBtn.addEventListener("click", closeMobileSidebar);
    }
    if (overlay) {
        overlay.addEventListener("click", closeMobileSidebar);
    }
    
    // 2. Quản lý Thu gọn Sidebar trên Desktop đã được gỡ bỏ theo yêu cầu 11.
    
    // 3. Quản lý Dropdown tài khoản Admin
    const profileTrigger = document.getElementById("admin-profile-trigger");
    const profileDropdown = document.getElementById("admin-profile-dropdown");
    const profileChevron = document.getElementById("profile-chevron");
    
    function openProfileDropdown() {
        if (!profileDropdown) return;
        profileDropdown.classList.remove("hidden");
        // Kích hoạt animation
        setTimeout(() => {
            profileDropdown.classList.remove("opacity-0", "scale-95");
            profileDropdown.classList.add("opacity-100", "scale-100");
        }, 10);
        if (profileChevron) {
            profileChevron.classList.add("rotate-180");
        }
        if (profileTrigger) {
            profileTrigger.setAttribute("aria-expanded", "true");
        }
    }
    
    function closeProfileDropdown() {
        if (!profileDropdown || profileDropdown.classList.contains("hidden")) return;
        profileDropdown.classList.remove("opacity-100", "scale-100");
        profileDropdown.classList.add("opacity-0", "scale-95");
        if (profileChevron) {
            profileChevron.classList.remove("rotate-180");
        }
        if (profileTrigger) {
            profileTrigger.setAttribute("aria-expanded", "false");
        }
        // Chờ hiệu ứng mờ kết thúc rồi ẩn hẳn
        setTimeout(() => {
            if (profileDropdown.classList.contains("opacity-0")) {
                profileDropdown.classList.add("hidden");
            }
        }, 150);
    }
    
    if (profileTrigger && profileDropdown) {
        profileTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            const isHidden = profileDropdown.classList.contains("hidden");
            if (isHidden) {
                openProfileDropdown();
            } else {
                closeProfileDropdown();
            }
        });
    }
    
    // 4. Click ngoài vùng chọn để đóng dropdown
    document.addEventListener("click", (e) => {
        if (profileDropdown && !profileDropdown.classList.contains("hidden")) {
            if (!profileDropdown.contains(e.target) && !profileTrigger.contains(e.target)) {
                closeProfileDropdown();
            }
        }
    });
    
    // 5. Đóng bằng phím Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeMobileSidebar();
            closeProfileDropdown();
        }
    });
}
