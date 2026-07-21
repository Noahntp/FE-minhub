import { initializeLayout } from "./layout.js";
import "./core/custom-select.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("MindHub Admin đã khởi động.");
    // Tải và khởi tạo giao diện Shell (Sidebar, Topbar)
    initializeLayout();
});

