
import { initPage } from '../../../assets/js/pages/course-reviews.js';
import React, { useState, useEffect } from 'react';

export default function CourseReviews() {
  useEffect(() => {
    try {
      initPage();
    } catch (err) {
      console.error('Error initializing vanilla JS:', err);
    }
  }, []);
  return (
    <>
      {/*  Page Title & Actions  */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
                    <div>
                        {/*  Breadcrumbs  */}
                        <div className="flex items-center gap-1.5 text-[10px] text-mid-gray uppercase tracking-wider mb-1 font-semibold">
                            <span>Dashboard</span>
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                            </svg>
                            <span>Khóa học</span>
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                            </svg>
                            <span className="text-ink">Kiểm duyệt khóa học</span>
                        </div>
                        <h1 className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-tight">
                            Kiểm duyệt khóa học
                        </h1>
                        <p className="text-xs text-mid-gray mt-0.5" id="page-description">
                            Xem xét nội dung và xử lý các khóa học đang chờ phê duyệt. Có <span id="title-pending-count" className="font-bold text-ink">0</span> khóa học đang chờ Admin kiểm duyệt.
                        </p>
                        <p className="text-[10px] text-mid-gray/80 mt-1">
                            Cập nhật lần cuối: <span id="last-update-time" className="font-medium text-mid-gray">---</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        {/*  Nút làm mới dữ liệu  */}
                        <button type="button" id="btn-refresh-data" className="h-9 w-9 flex items-center justify-center rounded-full border border-hairline hover:bg-canvas text-ink shrink-0 transition-colors shadow-sm cursor-pointer" aria-label="Làm mới dữ liệu">
                            <svg className="w-4 h-4 transition-transform duration-500" id="refresh-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {/*  1. Summary Cards (Đúng 3 card theo API Contract: pending_count, approved_today, rejected_today)  */}
                {/*  State: Loaded Summary  */}
                <div id="summary-content-wrapper" className="grid grid-cols-1 md:grid-cols-3 gap-3" data-source="mock">
                    {/*  Card 1 – Đang chờ duyệt  */}
                    <div className="rounded-[6px] border border-hairline border-t-2 border-t-warning bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[104px] hover:border-mid-gray/40 transition-colors">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-warning">Đang chờ duyệt</span>
                            <svg className="w-4.5 h-4.5 text-warning/90" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 6v6l4 2"/>
                            </svg>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <div>
                                <span id="summary-pending-count" className="text-2xl lg:text-3xl font-bold text-warning leading-none">0</span>
                                <p className="text-[10px] text-mid-gray mt-1">Khóa học cần Admin kiểm tra</p>
                            </div>
                            <button type="button" id="btn-scroll-to-list" className="text-[11px] font-semibold text-ink hover:underline cursor-pointer flex items-center gap-0.5">
                                Xem danh sách
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
                            </button>
                        </div>
                    </div>

                    {/*  Card 2 – Đã duyệt hôm nay  */}
                    <div className="rounded-[6px] border border-hairline border-t-2 border-t-success bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[104px] hover:border-mid-gray/40 transition-colors">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-success">Đã duyệt hôm nay</span>
                            <svg className="w-4.5 h-4.5 text-success/90" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <span id="summary-approved-today" className="text-2xl lg:text-3xl font-bold text-success leading-none">0</span>
                            <p className="text-[10px] text-mid-gray mt-1">Khóa học được chấp thuận hôm nay</p>
                        </div>
                    </div>

                    {/*  Card 3 – Đã từ chối hôm nay  */}
                    <div className="rounded-[6px] border border-hairline border-t-2 border-t-danger-brick bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[104px] hover:border-mid-gray/40 transition-colors">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-danger-brick">Đã từ chối hôm nay</span>
                            <svg className="w-4.5 h-4.5 text-danger-brick/90" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <span id="summary-rejected-today" className="text-2xl lg:text-3xl font-bold text-danger-brick leading-none">0</span>
                            <p className="text-[10px] text-mid-gray mt-1">Khóa học cần giảng viên chỉnh sửa</p>
                        </div>
                    </div>
                </div>

                {/*  State: Loading Summary Skeleton  */}
                <div id="summary-loading-wrapper" className="hidden grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[104px]">
                        <div className="h-3 w-24 bg-canvas rounded-full skeleton"></div>
                        <div className="h-7 w-12 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[104px]">
                        <div className="h-3 w-24 bg-canvas rounded-full skeleton"></div>
                        <div className="h-7 w-12 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[104px]">
                        <div className="h-3 w-24 bg-canvas rounded-full skeleton"></div>
                        <div className="h-7 w-12 bg-canvas rounded-full skeleton"></div>
                    </div>
                </div>

                {/*  2. Thanh thông tin nhanh (Quick Insight Bar - 5 thông số)  */}
                {/*  State: Loaded Insights  */}
                <div id="insight-content-wrapper" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 rounded-[6px] border border-hairline bg-surface-alt p-3.5" data-source="mock">
                    <div className="flex flex-col gap-0.5 border-b sm:border-b-0 sm:border-r border-hairline/60 pb-2 sm:pb-0 pr-3">
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider flex items-center gap-1">
                            <svg className="w-3 h-3 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>
                            Khóa mới (7 ngày)
                        </span>
                        <span id="insight-recent-7-days" className="text-base font-bold text-ink leading-tight font-sans">0</span>
                    </div>
                    <div className="flex flex-col gap-0.5 border-b sm:border-b-0 sm:border-r border-hairline/60 pb-2 sm:pb-0 pr-3">
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider flex items-center gap-1">
                            <svg className="w-3 h-3 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/></svg>
                            Khóa chờ lâu nhất
                        </span>
                        <span id="insight-longest-waiting" className="text-base font-bold text-warning leading-tight font-sans">0 ngày</span>
                    </div>
                    <div className="flex flex-col gap-0.5 border-b md:border-b-0 md:border-r border-hairline/60 pb-2 md:pb-0 pr-3">
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider flex items-center gap-1">
                            <svg className="w-3 h-3 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            Giá bán trung bình
                        </span>
                        <span id="insight-avg-price" className="text-base font-bold text-ink leading-tight font-sans">0đ</span>
                    </div>
                    <div className="flex flex-col gap-0.5 border-b sm:border-b-0 sm:border-r border-hairline/60 pb-2 sm:pb-0 pr-3">
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider flex items-center gap-1">
                            <svg className="w-3 h-3 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>
                            Tổng thời lượng chờ
                        </span>
                        <span id="insight-total-duration" className="text-base font-bold text-ink leading-tight font-sans">0 giờ</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider flex items-center gap-1">
                            <svg className="w-3 h-3 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            Giảng viên chờ duyệt
                        </span>
                        <span id="insight-unique-instructors" className="text-base font-bold text-ink leading-tight font-sans">0 giảng viên</span>
                    </div>
                </div>

                {/*  State: Loading Insights Skeleton  */}
                <div id="insight-loading-wrapper" className="hidden grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 rounded-[6px] border border-hairline bg-surface-alt p-3.5">
                    <div className="space-y-1.5" v-htmlFor="i in 5">
                        <div className="h-2.5 w-20 bg-canvas rounded-full skeleton"></div>
                        <div className="h-4 w-12 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="space-y-1.5"><div className="h-2.5 w-20 bg-canvas rounded-full skeleton"></div><div className="h-4 w-12 bg-canvas rounded-full skeleton"></div></div>
                    <div className="space-y-1.5"><div className="h-2.5 w-20 bg-canvas rounded-full skeleton"></div><div className="h-4 w-12 bg-canvas rounded-full skeleton"></div></div>
                    <div className="space-y-1.5"><div className="h-2.5 w-20 bg-canvas rounded-full skeleton"></div><div className="h-4 w-12 bg-canvas rounded-full skeleton"></div></div>
                    <div className="space-y-1.5"><div className="h-2.5 w-20 bg-canvas rounded-full skeleton"></div><div className="h-4 w-12 bg-canvas rounded-full skeleton"></div></div>
                </div>

                {/*  3. Bộ lọc (Filter bar đúng contract)  */}
                <section className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
                    <form id="filter-form" className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            {/*  1. Search (Search theo title, slug, instructor)  */}
                            <div className="md:col-span-4">
                                <label htmlFor="filter-search" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Tìm kiếm</label>
                                <div className="relative">
                                    <input type="text" id="filter-search" name="search" placeholder="Tìm theo tên khóa học, slug hoặc giảng viên..." className="w-full h-10 pl-8 pr-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink placeholder-mid-gray/70 transition-all" />
                                    <svg className="w-3.5 h-3.5 text-mid-gray/80 absolute left-3 top-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                                    </svg>
                                </div>
                            </div>

                            {/*  2. Khoảng thời gian gửi (Custom select - UI mock filter)  */}
                            <div className="md:col-span-3" data-source="mock">
                                <label htmlFor="filter-date-preset" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                    <span>Khoảng thời gian gửi</span>
                                    <span className="text-[9px] text-mid-gray/70 font-normal lowercase">(chế độ mock)</span>
                                </label>
                                <select id="filter-date-preset" name="date_preset" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="all" selected>Tất cả thời gian</option>
                                    <option value="custom">Tùy chọn khoảng thời gian</option>
                                    <option value="last_7_days">7 ngày gần nhất</option>
                                    <option value="last_30_days">30 ngày gần nhất</option>
                                    <option value="last_1_year">1 năm gần nhất</option>
                                </select>
                            </div>

                            {/*  3. Sắp xếp (Sort)  */}
                            <div className="md:col-span-3">
                                <label htmlFor="filter-sort" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Sắp xếp theo</label>
                                <select id="filter-sort" name="sort" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="submitted_desc" selected>Gửi gần nhất</option>
                                    <option value="submitted_asc">Chờ lâu nhất</option>
                                    <option value="title_asc">Tên A–Z</option>
                                    <option value="title_desc">Tên Z–A</option>
                                    <option value="price_desc">Giá cao nhất</option>
                                    <option value="price_asc">Giá thấp nhất</option>
                                    <option value="duration_desc">Thời lượng dài nhất</option>
                                </select>
                            </div>

                            {/*  4. Action Buttons  */}
                            <div className="md:col-span-2 flex items-center gap-2 shrink-0 justify-end">
                                <button type="button" id="btn-reset-filters" className="px-3.5 py-2 h-10 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer shrink-0">
                                    Đặt lại
                                </button>
                                <button type="submit" className="px-4 py-2 h-10 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer shrink-0">
                                    Áp dụng
                                </button>
                            </div>
                        </div>

                        {/*  Hàng bổ sung cho Tùy chọn khoảng thời gian (Custom Date Range)  */}
                        <div id="custom-date-container" className="hidden grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-hairline/60" data-source="mock">
                            <div>
                                <label htmlFor="filter-date-from" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1">Từ ngày</label>
                                <input type="date" id="filter-date-from" name="date_from" className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] outline-none text-ink transition-all" />
                                <p id="date-from-error" className="hidden text-[10px] text-danger-brick mt-1 font-medium"></p>
                            </div>
                            <div>
                                <label htmlFor="filter-date-to" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1">Đến ngày</label>
                                <input type="date" id="filter-date-to" name="date_to" className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] outline-none text-ink transition-all" />
                                <p id="date-to-error" className="hidden text-[10px] text-danger-brick mt-1 font-medium"></p>
                            </div>
                        </div>

                        {/*  Vùng Filter Chips đang dùng  */}
                        <div id="active-filter-chips" className="hidden flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-hairline/60">
                            <span className="text-[10px] font-semibold text-mid-gray uppercase tracking-wider mr-1">Bộ lọc đang dùng:</span>
                            <div id="chips-container" className="flex flex-wrap items-center gap-1.5"></div>
                            <button type="button" id="btn-clear-all-chips" className="btn-clear-chips-red text-[10px] font-semibold ml-2 transition-all cursor-pointer">Xóa tất cả</button>
                        </div>
                    </form>
                </section>

                {/*  4. Target auto-scroll & Bảng dữ liệu (bo góc 6px)  */}
                <section id="course-review-list-section" className="rounded-[6px] border border-hairline bg-paper shadow-subtle overflow-hidden flex flex-col min-h-[400px]">
                    
                    {/*  Filter Chips Section (Ẩn mặc định, chèn động từ JS)  */}
                    <div id="filter-chips-container" className="hidden flex flex-wrap items-center gap-2 p-3 bg-canvas/35 border-b border-hairline text-xs select-none">
                        <span className="text-mid-gray text-[10px] font-semibold uppercase tracking-wider mr-1">Bộ lọc đang dùng:</span>
                        <div id="filter-chips-list" className="flex flex-wrap gap-1.5">
                            {/*  Chips chèn ở đây  */}
                        </div>
                        <button type="button" id="btn-clear-all-chips" className="btn-clear-chips-red text-[10px] font-semibold ml-2 transition-all cursor-pointer">Xóa tất cả</button>
                    </div>

                    {/*  Table Scroll Container (Cuộn ngang riêng biệt)  */}
                    <div className="flex-grow overflow-y-auto overflow-x-auto custom-scrollbar relative max-h-[600px] table-scroll">
                        <table className="w-full text-left border-collapse table-auto min-w-[1350px]">
                            <thead className="sticky top-0 bg-surface-alt border-b border-hairline z-10 select-none">
                                <tr className="text-[10px] font-bold text-mid-gray uppercase tracking-wider h-10">
                                    <th className="p-3 pl-4 w-[280px]">Khóa học</th>
                                    <th className="p-3 w-[190px]">Giảng viên</th>
                                    <th className="p-3 w-[220px]">Mô tả ngắn</th>
                                    <th className="p-3 w-[115px]">Trình độ</th>
                                    <th className="p-3 w-[135px]">Giá bán</th>
                                    <th className="p-3 w-[125px]">Thời lượng</th>
                                    <th className="p-3 w-[135px]">Ngày gửi</th>
                                    <th className="p-3 w-[120px]">Trạng thái</th>
                                    <th className="p-3 pr-4 w-[75px] text-right">Thao tác</th>
                                </tr>
                            </thead>
                            {/*  Table Body Loaded  */}
                            <tbody id="course-reviews-table-body" className="divide-y divide-hairline text-xs">
                                {/*  Dynamic Rows  */}
                            </tbody>
                        </table>

                        {/*  Empty State (No Filter / Pending Empty)  */}
                        <div id="course-reviews-empty-state" className="hidden flex flex-col items-center justify-center p-8 text-center space-y-3 my-12">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-mid-gray">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 id="empty-title" className="text-sm font-semibold text-ink">Không có khóa học chờ duyệt</h3>
                                <p id="empty-desc" className="text-xs text-mid-gray mt-1">Tất cả yêu cầu kiểm duyệt hiện đã được xử lý xong.</p>
                            </div>
                            <button type="button" id="btn-empty-reset" className="px-4 py-2 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer">
                                Đặt lại tìm kiếm
                            </button>
                        </div>

                        {/*  Loading State Row Skeletons  */}
                        <div id="course-reviews-loading-state" className="hidden divide-y divide-hairline">
                            <div className="flex items-center p-4 space-x-6 w-full" v-htmlFor="i in 6">
                                <div className="h-10 w-16 bg-canvas rounded skeleton shrink-0"></div>
                                <div className="space-y-2 flex-1 max-w-[220px]">
                                    <div className="h-3 w-3/4 bg-canvas rounded-full skeleton"></div>
                                    <div className="h-2 w-1/2 bg-canvas rounded-full skeleton"></div>
                                </div>
                                <div className="space-y-1.5 w-[160px]">
                                    <div className="h-3 w-2/3 bg-canvas rounded-full skeleton"></div>
                                    <div className="h-2.5 w-1/3 bg-canvas rounded-full skeleton"></div>
                                </div>
                                <div className="h-4 w-[140px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[90px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[100px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[90px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[110px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4.5 w-8 bg-canvas rounded-full skeleton"></div>
                            </div>
                            {/*  Row 2  */}
                            <div className="flex items-center p-4 space-x-6 w-full">
                                <div className="h-10 w-16 bg-canvas rounded skeleton shrink-0"></div>
                                <div className="space-y-2 flex-1 max-w-[220px]">
                                    <div className="h-3 w-3/4 bg-canvas rounded-full skeleton"></div>
                                    <div className="h-2 w-1/2 bg-canvas rounded-full skeleton"></div>
                                </div>
                                <div className="space-y-1.5 w-[160px]">
                                    <div className="h-3 w-2/3 bg-canvas rounded-full skeleton"></div>
                                    <div className="h-2.5 w-1/3 bg-canvas rounded-full skeleton"></div>
                                </div>
                                <div className="h-4 w-[140px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[90px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[100px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[90px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[110px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4.5 w-8 bg-canvas rounded-full skeleton"></div>
                            </div>
                        </div>

                        {/*  Error State  */}
                        <div id="course-reviews-error-state" className="hidden flex flex-col items-center justify-center p-8 text-center space-y-3 my-12">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-brick-soft text-danger-brick">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-ink" id="error-title">Không thể tải danh sách kiểm duyệt</h3>
                                <p className="text-xs text-mid-gray mt-1" id="error-desc">Đã xảy ra lỗi kết nối. Vui lòng nhấn Thử lại.</p>
                            </div>
                            <button type="button" id="btn-error-retry" className="px-4 py-2 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer">
                                Thử lại
                            </button>
                        </div>
                    </div>

                    {/*  Footer: Pagination (Bo góc dưới)  */}
                    <div id="pagination-wrapper" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 bg-surface-alt border-t border-hairline text-xs text-mid-gray select-none">
                        {/*  Records Info & Page Size Select  */}
                        <div className="flex items-center gap-4">
                            <span>Đang hiển thị <span id="pag-showing-range" className="font-semibold text-ink">0-0</span> trong tổng số <span id="pag-total-records" className="font-semibold text-ink">0</span> khóa học chờ duyệt</span>
                            <div className="flex items-center gap-1.5">
                                <span>Mỗi trang:</span>
                                <select id="pag-per-page" data-custom-select className="bg-paper border border-hairline rounded-[6px] px-2 py-0.5 text-xs text-ink outline-none">
                                    <option value="10">10</option>
                                    <option value="20" selected>20</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                        </div>
                        {/*  Navigation Buttons  */}
                        <div className="flex items-center gap-1.5" id="pagination-buttons">
                            {/*  Dynamic Pagination Buttons  */}
                        </div>
                    </div>
                </section>
    </>
  );
}
