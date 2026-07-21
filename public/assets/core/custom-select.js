/**
 * MindHub Admin Custom Select Dropdown Component
 * Đồng bộ hai chiều với thẻ <select> gốc qua Portal, hỗ trợ Search, Status dots và Keyboard Accessibility.
 */

// Map lưu trữ liên kết giữa select gốc và các phần tử giao diện custom
const selectMap = new Map();

// Dropdown đang mở hiện tại
let activeDropdown = null;
let activeTrigger = null;
let activeSelect = null;
let highlightedOptionIndex = -1;

/**
 * Khởi tạo tự động khi trang được tải
 */
document.addEventListener("DOMContentLoaded", () => {
    initAllCustomSelects();
    initGlobalEvents();
});

/**
 * Tìm và khởi tạo tất cả các select có data-custom-select
 */
export function initAllCustomSelects() {
    const selects = document.querySelectorAll("select[data-custom-select]");
    selects.forEach(select => {
        if (!selectMap.has(select)) {
            initCustomSelect(select);
        }
    });
}

// Đăng ký vào window để gọi từ các trang khác
window.initAllCustomSelects = initAllCustomSelects;

/**
 * Khởi tạo một select cụ thể
 */
function initCustomSelect(select) {
    if (selectMap.has(select)) return;

    // 1. Ẩn select gốc một cách an toàn
    select.classList.add("sr-only");
    select.setAttribute("tabindex", "-1");

    // 2. Tạo Wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "custom-select-wrapper";
    
    // Tự động kiểm tra xem có phải select kích thước nhỏ sm hay không
    const isSm = select.classList.contains("h-7") || select.classList.contains("h-8") || select.classList.contains("h-9") || select.hasAttribute("data-size-sm");
    if (isSm) {
        wrapper.classList.add("custom-select-wrapper-sm");
    }
    
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    // 3. Tạo Trigger Button
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "custom-select-trigger";
    trigger.id = `${select.id || Math.random().toString(36).substr(2, 9)}-trigger`;
    trigger.setAttribute("role", "combobox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-haspopup", "listbox");
    
    // Label hiển thị
    const labelSpan = document.createElement("span");
    labelSpan.className = "custom-select-label truncate";
    
    // Icon chevron nét mảnh
    const chevronSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    chevronSvg.setAttribute("class", "w-4 h-4 text-mid-gray/80 transition-transform duration-200 shrink-0");
    chevronSvg.setAttribute("fill", "none");
    chevronSvg.setAttribute("stroke", "currentColor");
    chevronSvg.setAttribute("stroke-width", "2");
    chevronSvg.setAttribute("viewBox", "0 0 24 24");
    chevronSvg.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>`;

    trigger.appendChild(labelSpan);
    trigger.appendChild(chevronSvg);
    wrapper.appendChild(trigger);

    // Lưu trữ thông tin
    selectMap.set(select, {
        wrapper: wrapper,
        trigger: trigger,
        labelSpan: labelSpan,
        chevronSvg: chevronSvg,
        panel: null // panel sẽ được tạo lazy khi mở để tối ưu hiệu năng
    });

    // Cập nhật nhãn ban đầu
    updateTriggerLabel(select);

    // Lắng nghe sự kiện click mở
    trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        if (select.disabled) return;
        
        if (activeDropdown && activeSelect === select) {
            closeActiveDropdown();
        } else {
            closeActiveDropdown();
            openDropdown(select);
        }
    });

    // Lắng nghe sự kiện change từ select gốc (để cập nhật nhãn khi code ngoài thay đổi giá trị select gốc)
    select.addEventListener("change", () => {
        updateTriggerLabel(select);
    });
}

/**
 * Cập nhật nhãn hiển thị của trigger dựa trên option đang được chọn
 */
function updateTriggerLabel(select) {
    const data = selectMap.get(select);
    if (!data) return;

    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption) {
        // Kiểm tra xem option có chứa chấm trạng thái không để render chấm màu trên trigger
        const statusType = getStatusType(selectedOption);
        if (statusType) {
            data.labelSpan.innerHTML = `<span class="status-dot status-dot-${statusType}"></span><span>${selectedOption.textContent}</span>`;
        } else {
            data.labelSpan.textContent = selectedOption.textContent;
        }
        
        // Nếu option được chọn là placeholder/rỗng và có select placeholder riêng
        if (selectedOption.value === "" && select.hasAttribute("placeholder")) {
            data.labelSpan.textContent = select.getAttribute("placeholder");
            data.labelSpan.classList.add("text-mid-gray/70");
        } else {
            data.labelSpan.classList.remove("text-mid-gray/70");
        }
    } else {
        data.labelSpan.textContent = select.getAttribute("placeholder") || "Chọn một mục...";
        data.labelSpan.classList.add("text-mid-gray/70");
    }
}

/**
 * Trả về class hậu tố trạng thái dựa trên value hoặc attributes
 */
function getStatusType(option) {
    if (option.hasAttribute("data-status-color")) {
        return option.getAttribute("data-status-color");
    }

    const val = option.value.toLowerCase();
    
    // Map các giá trị trạng thái thông dụng sang màu sắc
    if (val === "pending" || val === "pending_review") return "pending"; // cam
    if (val === "approved" || val === "published" || val === "active" || val === "verified" || val === "true") return "success"; // xanh lá
    if (val === "rejected" || val === "locked" || val === "unverified" || val === "false") return "danger"; // đỏ
    if (val === "draft" || val === "inactive") return "gray"; // xám nhạt
    if (val === "hidden") return "dark-gray"; // xám đậm

    return null;
}

/**
 * Tạo và mở Dropdown Panel (Portal)
 */
function openDropdown(select) {
    const data = selectMap.get(select);
    if (!data) return;

    const trigger = data.trigger;
    
    // 1. Tạo Dropdown Panel nếu chưa có
    let panel = data.panel;
    if (!panel) {
        panel = createDropdownPanel(select);
        data.panel = panel;
    }

    // Đưa panel vào document.body (Portal)
    document.body.appendChild(panel);

    // 2. Định vị trí cho panel
    positionDropdownPanel(trigger, panel);

    // 3. Hiển thị panel
    panel.classList.remove("hidden");
    trigger.classList.add("is-active");
    trigger.setAttribute("aria-expanded", "true");
    
    const chevronSvg = data.chevronSvg;
    chevronSvg.style.transform = "rotate(180deg)";

    activeDropdown = panel;
    activeTrigger = trigger;
    activeSelect = select;
    highlightedOptionIndex = -1;

    // Reset bộ lọc tìm kiếm nếu có
    const searchInput = panel.querySelector(".custom-select-search-input");
    if (searchInput) {
        searchInput.value = "";
        filterOptions(panel, "");
        // Focus vào input search sau khi dropdown hiển thị
        setTimeout(() => searchInput.focus(), 50);
    } else {
        // Focus vào item đang chọn
        const selectedItem = panel.querySelector(".custom-option.is-selected");
        if (selectedItem) {
            selectedItem.scrollIntoView({ block: "nearest" });
        }
    }
}

/**
 * Đóng dropdown đang hoạt động
 */
export function closeActiveDropdown() {
    if (!activeDropdown) return;

    activeDropdown.remove(); // Xóa khỏi DOM body
    activeTrigger.classList.remove("is-active");
    activeTrigger.setAttribute("aria-expanded", "false");
    
    const chevron = activeTrigger.querySelector("svg");
    if (chevron) {
        chevron.style.transform = "none";
    }

    activeDropdown = null;
    activeTrigger = null;
    activeSelect = null;
    highlightedOptionIndex = -1;
}

window.closeActiveDropdown = closeActiveDropdown;

/**
 * Tạo HTML Dropdown Panel
 */
function createDropdownPanel(select) {
    const panel = document.createElement("div");
    panel.className = "custom-select-dropdown hidden";
    panel.id = `${select.id || Math.random().toString(36).substr(2, 9)}-dropdown`;

    // 1. Tự động hiển thị khung tìm kiếm nếu option > 8
    const options = Array.from(select.options);
    if (options.length > 8 || select.hasAttribute("data-search")) {
        const searchContainer = document.createElement("div");
        searchContainer.className = "custom-select-search-container";

        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.className = "custom-select-search-input";
        searchInput.placeholder = select.getAttribute("data-search-placeholder") || "Tìm kiếm...";
        
        // Icon search SVG
        const searchIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        searchIcon.setAttribute("class", "w-3.5 h-3.5 text-mid-gray/80 absolute left-5 top-5 pointer-events-none");
        searchIcon.setAttribute("fill", "none");
        searchIcon.setAttribute("stroke", "currentColor");
        searchIcon.setAttribute("stroke-width", "2.5");
        searchIcon.setAttribute("viewBox", "0 0 24 24");
        searchIcon.innerHTML = `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`;

        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchInput);
        panel.appendChild(searchContainer);

        // Lắng nghe sự kiện gõ tìm kiếm
        searchInput.addEventListener("input", (e) => {
            filterOptions(panel, e.target.value);
        });
        
        searchInput.addEventListener("keydown", (e) => {
            handleKeyboardNav(e);
        });
    }

    // 2. Tạo vùng cuộn chứa options
    const listWrapper = document.createElement("div");
    listWrapper.className = "custom-select-options-list custom-scrollbar";
    panel.appendChild(listWrapper);

    // Xây dựng danh sách option
    buildOptionsList(select, listWrapper);

    return panel;
}

/**
 * Xây dựng danh sách Custom Options từ select gốc
 */
function buildOptionsList(select, listWrapper) {
    listWrapper.innerHTML = "";
    const options = Array.from(select.options);

    options.forEach((opt, idx) => {
        const item = document.createElement("div");
        item.className = "custom-option";
        item.setAttribute("role", "option");
        item.setAttribute("data-value", opt.value);
        item.setAttribute("data-index", idx);

        if (opt.selected) {
            item.classList.add("is-selected");
            item.setAttribute("aria-selected", "true");
        }

        if (opt.disabled) {
            item.classList.add("is-disabled");
        }

        // Tạo label option (kèm chấm trạng thái nếu có)
        const textWrapper = document.createElement("div");
        textWrapper.className = "flex items-center min-w-0";
        
        const statusType = getStatusType(opt);
        if (statusType) {
            const dot = document.createElement("span");
            dot.className = `status-dot status-dot-${statusType}`;
            textWrapper.appendChild(dot);
        }

        const labelSpan = document.createElement("span");
        labelSpan.className = "truncate text-xs";
        labelSpan.textContent = opt.textContent;
        textWrapper.appendChild(labelSpan);

        item.appendChild(textWrapper);

        // Vẽ icon check nhỏ bên phải nếu được chọn
        if (opt.selected) {
            const checkIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            checkIcon.setAttribute("class", "w-3.5 h-3.5 text-ink shrink-0 ml-2");
            checkIcon.setAttribute("fill", "none");
            checkIcon.setAttribute("stroke", "currentColor");
            checkIcon.setAttribute("stroke-width", "3");
            checkIcon.setAttribute("viewBox", "0 0 24 24");
            checkIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/>`;
            item.appendChild(checkIcon);
        }

        // Click chọn option
        if (!opt.disabled) {
            item.addEventListener("click", (e) => {
                e.stopPropagation();
                selectOption(select, opt.value);
            });
        }

        listWrapper.appendChild(item);
    });
}

/**
 * Thực hiện chọn một option
 */
function selectOption(select, value) {
    select.value = value;
    
    // Cập nhật lại nhãn trên trigger
    updateTriggerLabel(select);
    
    // Dispatch event change để kích hoạt logic lọc hiện có
    const event = new Event("change", { bubbles: true });
    select.dispatchEvent(event);

    // Đóng dropdown panel
    closeActiveDropdown();
}

/**
 * Filter danh sách option theo keyword search
 */
function filterOptions(panel, keyword) {
    const listWrapper = panel.querySelector(".custom-select-options-list");
    const items = listWrapper.querySelectorAll(".custom-option");
    const cleanWord = keyword.toLowerCase().trim();

    let hasVisibleOption = false;

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(cleanWord)) {
            item.classList.remove("hidden");
            hasVisibleOption = true;
        } else {
            item.classList.add("hidden");
        }
    });

    // Thêm Empty state tìm kiếm nếu không có kết quả
    let emptyEl = listWrapper.querySelector(".custom-select-search-empty");
    if (!hasVisibleOption) {
        if (!emptyEl) {
            emptyEl = document.createElement("div");
            emptyEl.className = "custom-select-search-empty p-3 text-center text-xs text-mid-gray italic";
            emptyEl.textContent = "Không tìm thấy kết quả phù hợp.";
            listWrapper.appendChild(emptyEl);
        }
    } else if (emptyEl) {
        emptyEl.remove();
    }
    
    highlightedOptionIndex = -1;
    clearHighlight(panel);
}

/**
 * Định vị dropdown panel theo trigger button
 */
function positionDropdownPanel(trigger, panel) {
    const rect = trigger.getBoundingClientRect();
    
    // Đặt chiều rộng bằng trigger
    panel.style.width = `${rect.width}px`;
    panel.style.left = `${rect.left + window.scrollX}px`;

    // Tính toán chiều cao và vị trí mở lên/xuống
    const dropdownHeight = 240; // dự kiến max-height + search
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    
    // Nếu phía dưới không đủ chỗ và phía trên rộng hơn
    if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        // Mở lên trên
        panel.style.top = `${rect.top + window.scrollY - panel.offsetHeight - 4}px`;
        // Cần tính toán lại sau khi panel render xong chiều cao thật
        setTimeout(() => {
            panel.style.top = `${rect.top + window.scrollY - panel.offsetHeight - 4}px`;
        }, 0);
    } else {
        // Mở xuống dưới
        panel.style.top = `${rect.bottom + window.scrollY + 4}px`;
    }
}

/**
 * Refresh danh sách option (Dùng khi nạp động xong hoặc data option thay đổi)
 * @param {HTMLSelectElement} select
 */
export function refreshCustomSelect(select) {
    const data = selectMap.get(select);
    if (!data) return;

    // 1. Dựng lại nhãn trigger
    updateTriggerLabel(select);

    // 2. Nếu đã có panel được render, dựng lại danh sách option của nó
    if (data.panel) {
        const listWrapper = data.panel.querySelector(".custom-select-options-list");
        if (listWrapper) {
            buildOptionsList(select, listWrapper);
        }
    }
}

// Đăng ký toàn cục
window.refreshCustomSelect = refreshCustomSelect;

/**
 * Gắn các sự kiện click out, keydown toàn cục
 */
function initGlobalEvents() {
    // Click outside đóng dropdown
    document.addEventListener("click", (e) => {
        if (activeDropdown && !activeDropdown.contains(e.target) && !activeTrigger.contains(e.target)) {
            closeActiveDropdown();
        }
    });

    // Phím Escape đóng dropdown
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeActiveDropdown();
        } else if (activeDropdown) {
            handleKeyboardNav(e);
        }
    });

    // Khi cuộn trang (scroll), đóng dropdown để tránh bị đứng lệch vị trí trigger
    document.addEventListener("scroll", (e) => {
        if (activeDropdown && e.target !== activeDropdown && !activeDropdown.contains(e.target)) {
            closeActiveDropdown();
        }
    }, true);

    // Khi resize window
    window.addEventListener("resize", () => {
        if (activeDropdown && activeTrigger) {
            positionDropdownPanel(activeTrigger, activeDropdown);
        }
    });
}

/**
 * Xử lý điều hướng bàn phím trong dropdown panel
 */
function handleKeyboardNav(e) {
    if (!activeDropdown || !activeSelect) return;

    const listWrapper = activeDropdown.querySelector(".custom-select-options-list");
    const visibleOptions = Array.from(listWrapper.querySelectorAll(".custom-option:not(.hidden):not(.is-disabled)"));

    if (visibleOptions.length === 0) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        highlightedOptionIndex = (highlightedOptionIndex + 1) % visibleOptions.length;
        highlightOption(visibleOptions[highlightedOptionIndex]);
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        highlightedOptionIndex = (highlightedOptionIndex - 1 + visibleOptions.length) % visibleOptions.length;
        highlightOption(visibleOptions[highlightedOptionIndex]);
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedOptionIndex >= 0 && highlightedOptionIndex < visibleOptions.length) {
            const target = visibleOptions[highlightedOptionIndex];
            const val = target.getAttribute("data-value");
            selectOption(activeSelect, val);
        }
    }
}

/**
 * Tô màu nổi bật option đang được highlight bởi bàn phím
 */
function highlightOption(optionElement) {
    if (!optionElement) return;

    clearHighlight(activeDropdown);
    optionElement.classList.add("bg-canvas");
    optionElement.scrollIntoView({ block: "nearest" });
}

function clearHighlight(panel) {
    const listWrapper = panel.querySelector(".custom-select-options-list");
    listWrapper.querySelectorAll(".custom-option").forEach(el => {
        el.classList.remove("bg-canvas");
    });
}

/**
 * ==========================================================================
 * OVERRIDE SETTER VALUE CỦA HTMLSELECTELEMENT
 * ==========================================================================
 * Giúp tự động dispatch change event khi code ngoài gán select.value = '...'
 */
const originalValueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");

if (originalValueDescriptor && originalValueDescriptor.set) {
    Object.defineProperty(HTMLSelectElement.prototype, "value", {
        get: function() {
            return originalValueDescriptor.get.call(this);
        },
        set: function(newValue) {
            const oldValue = originalValueDescriptor.get.call(this);
            originalValueDescriptor.set.call(this, newValue);
            
            // Nếu giá trị thực sự thay đổi và select này có custom select
            if (oldValue !== newValue && selectMap.has(this)) {
                // Tự động trigger hàm cập nhật nhãn trigger
                updateTriggerLabel(this);
                // Cập nhật lại class is-selected trong panel
                const data = selectMap.get(this);
                if (data && data.panel) {
                    const listWrapper = data.panel.querySelector(".custom-select-options-list");
                    if (listWrapper) {
                        buildOptionsList(this, listWrapper);
                    }
                }
            }
        }
    });
}
