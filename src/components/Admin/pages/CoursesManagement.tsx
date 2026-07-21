
import { initPage } from '../../../assets/js/pages/courses.js';
import React, { useState, useEffect } from 'react';

export default function CoursesManagement() {
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
                            <span className="text-ink">Quản lý khóa học</span>
                        </div>
                        <h1 className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-tight">
                            Quản lý khóa học
                        </h1>
                        <p className="text-xs text-mid-gray mt-0.5" id="page-description">
                            Theo dõi và quản lý toàn bộ khóa học đang có trên hệ thống. Tổng số: <span id="title-total-courses" className="font-bold text-ink">0</span> khóa học.
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

                {/*  1. KPI Thống kê (6 cards, bo góc 6px, padding p-4, gap-3)  */}
                {/*  State: Loaded KPI  */}
                <div id="kpi-content-wrapper" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" data-source="mock">
                    {/*  KPI: Tổng khóa học  */}
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/40 transition-colors">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Tổng khóa học</span>
                            <svg className="w-4 h-4 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                                <path d="M6 6h10M6 10h10"/>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-total-courses" className="text-xl lg:text-2xl font-bold text-ink leading-none">0</span>
                            <p className="text-[9px] text-mid-gray mt-1">Toàn bộ hệ thống</p>
                        </div>
                    </div>

                    {/*  KPI: Đã xuất bản  */}
                    <div className="rounded-[6px] border border-hairline border-t-2 border-t-success bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/40 transition-colors">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-success">Đã xuất bản</span>
                            <span className="flex h-1.5 w-1.5 rounded-full bg-success"></span>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-published-courses" className="text-xl lg:text-2xl font-bold text-success leading-none">0</span>
                            <p className="text-[9px] text-mid-gray mt-1">Công khai học tập</p>
                        </div>
                    </div>

                    {/*  KPI: Chờ duyệt  */}
                    <div className="rounded-[6px] border border-hairline border-t-2 border-t-warning bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/40 transition-colors cursor-pointer" id="kpi-card-pending">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-warning">Chờ duyệt</span>
                            <svg className="w-4 h-4 text-warning/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-pending-courses" className="text-xl lg:text-2xl font-bold text-warning leading-none">0</span>
                            <p className="text-[9px] text-mid-gray mt-1 flex items-center gap-1">
                                Cần kiểm duyệt <span className="underline text-[8px] hover:text-ink font-semibold">Xem</span>
                            </p>
                        </div>
                    </div>

                    {/*  KPI: Bản nháp  */}
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/40 transition-colors">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Bản nháp</span>
                            <svg className="w-4 h-4 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-draft-courses" className="text-xl lg:text-2xl font-bold text-ink leading-none">0</span>
                            <p className="text-[9px] text-mid-gray mt-1">Đang hoàn thiện</p>
                        </div>
                    </div>

                    {/*  KPI: Đã bị ẩn  */}
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/40 transition-colors">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Đã bị ẩn</span>
                            <svg className="w-4 h-4 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-hidden-courses" className="text-xl lg:text-2xl font-bold text-ink leading-none">0</span>
                            <p className="text-[9px] text-mid-gray mt-1">Không hiển thị công khai</p>
                        </div>
                    </div>

                    {/*  KPI: Bị từ chối  */}
                    <div className="rounded-[6px] border border-hairline border-t-2 border-t-danger-brick bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/40 transition-colors">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-danger-brick">Bị từ chối</span>
                            <svg className="w-4 h-4 text-danger-brick/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-rejected-courses" className="text-xl lg:text-2xl font-bold text-danger-brick leading-none">0</span>
                            <p className="text-[9px] text-mid-gray mt-1">Cần giảng viên sửa</p>
                        </div>
                    </div>
                </div>

                {/*  State: Loading KPI Skeleton  */}
                <div id="kpi-loading-wrapper" className="hidden grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[96px]" v-htmlFor="i in 6">
                        <div className="h-3 w-16 bg-canvas rounded-full skeleton"></div>
                        <div className="h-6 w-10 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[96px]">
                        <div className="h-3 w-16 bg-canvas rounded-full skeleton"></div>
                        <div className="h-6 w-10 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[96px]">
                        <div className="h-3 w-16 bg-canvas rounded-full skeleton"></div>
                        <div className="h-6 w-10 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[96px]">
                        <div className="h-3 w-16 bg-canvas rounded-full skeleton"></div>
                        <div className="h-6 w-10 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[96px]">
                        <div className="h-3 w-16 bg-canvas rounded-full skeleton"></div>
                        <div className="h-6 w-10 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[96px]">
                        <div className="h-3 w-16 bg-canvas rounded-full skeleton"></div>
                        <div className="h-6 w-10 bg-canvas rounded-full skeleton"></div>
                    </div>
                </div>

                {/*  2. Thanh thông tin nhanh (Quick Insight Bar)  */}
                {/*  State: Loaded Insights  */}
                <div id="insight-content-wrapper" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 rounded-[6px] border border-hairline bg-surface-alt p-3.5" data-source="mock">
                    <div className="flex flex-col gap-0.5 border-r border-hairline/60 last:border-none pr-3">
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider">Khóa mới (30 ngày)</span>
                        <span id="insight-new-courses" className="text-base font-bold text-ink leading-tight font-sans">0</span>
                    </div>
                    <div className="flex flex-col gap-0.5 border-r border-hairline/60 last:border-none pr-3">
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider">Tổng lượt ghi danh</span>
                        <span id="insight-total-enrollments" className="text-base font-bold text-ink leading-tight font-sans">0</span>
                    </div>
                    <div className="flex flex-col gap-0.5 border-r border-hairline/60 last:border-none pr-3">
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider">Đơn đã thanh toán</span>
                        <span id="insight-paid-orders" className="text-base font-bold text-ink leading-tight font-sans">0</span>
                    </div>
                    <div className="flex flex-col gap-0.5 border-r border-hairline/60 last:border-none pr-3">
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider">Doanh thu gộp</span>
                        <span id="insight-gross-revenue" className="text-base font-bold text-ink leading-tight font-sans">0đ</span>
                    </div>
                    <div className="flex flex-col gap-0.5 last:border-none">
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider">Đánh giá trung bình</span>
                        <span id="insight-avg-rating" className="text-base font-bold text-warning leading-tight flex items-center gap-1 font-sans">
                            0.0 <svg className="w-3.5 h-3.5 fill-current text-warning inline" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        </span>
                    </div>
                </div>

                {/*  State: Loading Insights Skeleton  */}
                <div id="insight-loading-wrapper" className="hidden grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 rounded-[6px] border border-hairline bg-surface-alt p-3.5">
                    <div className="space-y-1.5" v-htmlFor="i in 5">
                        <div className="h-2 w-14 bg-canvas rounded-full skeleton"></div>
                        <div className="h-4 w-12 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-2 w-14 bg-canvas rounded-full skeleton"></div>
                        <div className="h-4 w-12 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-2 w-14 bg-canvas rounded-full skeleton"></div>
                        <div className="h-4 w-12 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-2 w-14 bg-canvas rounded-full skeleton"></div>
                        <div className="h-4 w-12 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-2 w-14 bg-canvas rounded-full skeleton"></div>
                        <div className="h-4 w-12 bg-canvas rounded-full skeleton"></div>
                    </div>
                </div>

                {/*  3. Bộ lọc (Filter bar, bo góc 6px, padding p-4)  */}
                <section className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
                    <form id="filter-form" className="space-y-4">
                        {/*  Hàng 1: Search & Common Inputs  */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {/*  Search  */}
                            <div className="sm:col-span-2">
                                <label htmlFor="filter-search" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Tìm kiếm</label>
                                <div className="relative">
                                    <input type="text" id="filter-search" name="search" placeholder="Tìm theo tên khóa học, slug hoặc giảng viên..." className="w-full h-10 pl-8 pr-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink placeholder-mid-gray/70 transition-all" />
                                    <svg className="w-3.5 h-3.5 text-mid-gray/80 absolute left-3 top-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                                    </svg>
                                </div>
                            </div>
                            {/*  Trạng thái  */}
                            <div>
                                <label htmlFor="filter-status" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Trạng thái</label>
                                <select id="filter-status" name="status" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="draft">Bản nháp</option>
                                    <option value="pending_review">Chờ duyệt</option>
                                    <option value="approved">Đã duyệt</option>
                                    <option value="published">Đã xuất bản</option>
                                    <option value="rejected">Bị từ chối</option>
                                    <option value="hidden">Đã ẩn</option>
                                </select>
                            </div>
                            {/*  Giảng viên  */}
                            <div>
                                <label htmlFor="filter-instructor" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Giảng viên</label>
                                <select id="filter-instructor" name="instructor_id" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="">Tất cả giảng viên</option>
                                    {/*  Options chèn động từ mock  */}
                                </select>
                            </div>
                        </div>

                        {/*  Hàng 2: Additional Filters  */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {/*  Danh mục  */}
                            <div>
                                <label htmlFor="filter-category" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Danh mục</label>
                                <select id="filter-category" name="category_id" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="">Tất cả danh mục</option>
                                    {/*  Options chèn động từ mock  */}
                                </select>
                            </div>
                            {/*  Trình độ  */}
                            <div>
                                <label htmlFor="filter-level" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Trình độ</label>
                                <select id="filter-level" name="level" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="">Tất cả trình độ</option>
                                    <option value="beginner">Cơ bản</option>
                                    <option value="intermediate">Trung cấp</option>
                                    <option value="advanced">Nâng cao</option>
                                    <option value="all_levels">Mọi trình độ</option>
                                </select>
                            </div>
                            {/*  Nổi bật  */}
                            <div>
                                <label htmlFor="filter-featured" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Nổi bật</label>
                                <select id="filter-featured" name="is_featured" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="">Tất cả</option>
                                    <option value="true">Đang nổi bật</option>
                                    <option value="false">Không nổi bật</option>
                                </select>
                            </div>
                            {/*  Khoảng thời gian Preset  */}
                            <div>
                                <label htmlFor="filter-period" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Thời gian cập nhật</label>
                                <select id="filter-period" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="all" selected>Tất cả thời gian</option>
                                    <option value="7">7 ngày gần nhất</option>
                                    <option value="30">30 ngày gần nhất</option>
                                    <option value="90">90 ngày gần nhất</option>
                                    <option value="365">1 năm gần nhất</option>
                                    <option value="custom">Tùy chọn khoảng thời gian</option>
                                </select>
                            </div>
                        </div>

                        {/*  Hàng 3: Date Picker (Hiện khi chọn Tùy chọn) & Sắp xếp / Nút  */}
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between pt-3 border-t border-hairline/60 gap-3">
                            {/*  Custom Date Inputs (Ẩn mặc định)  */}
                            <div id="custom-date-container" className="hidden flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-mid-gray font-medium">Từ:</span>
                                    <input type="date" id="filter-date-from" name="date_from" aria-label="Từ ngày" className="h-10 px-2.5 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-mid-gray font-medium">Đến:</span>
                                    <input type="date" id="filter-date-to" name="date_to" aria-label="Đến ngày" className="h-10 px-2.5 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink" />
                                </div>
                            </div>
                            
                            {/*  Sắp xếp (Sort options)  */}
                            <div className="flex-1 md:max-w-xs md:ml-auto md:mr-3">
                                <label htmlFor="filter-sort" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Sắp xếp theo</label>
                                <select id="filter-sort" name="sort_by" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="updated_at">Cập nhật gần nhất</option>
                                    <option value="created_at">Cũ nhất</option>
                                    <option value="title">Tên A–Z</option>
                                    <option value="enrollment_count">Nhiều học viên nhất</option>
                                    <option value="gross_revenue">Doanh thu cao nhất</option>
                                    <option value="average_rating">Đánh giá cao nhất</option>
                                    <option value="price">Giá cao nhất</option>
                                </select>
                            </div>

                            {/*  Action Buttons  */}
                            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                                <button type="button" id="btn-reset-filters" className="px-4 py-2 h-10 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer">
                                    Đặt lại
                                </button>
                                <button type="submit" className="px-5 py-2 h-10 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer">
                                    Áp dụng bộ lọc
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                {/*  4. Quick Tabs (Lọc nhanh) & Bảng Dữ liệu (bo góc 6px)  */}
                <section id="course-list-section" className="rounded-[6px] border border-hairline bg-paper shadow-subtle overflow-hidden flex flex-col min-h-[400px]">
                    {/*  Quick Tabs Header  */}
                    <div className="flex items-center justify-between border-b border-hairline/60 bg-paper shrink-0 overflow-x-auto scrollbar-none">
                        <div className="flex" id="quick-tabs-container">
                            <button type="button" data-tab="all" className="px-5 py-3 text-xs font-semibold border-b-2 border-ink text-ink select-none whitespace-nowrap cursor-pointer transition-all">
                                Tất cả (<span className="tab-count">0</span>)
                            </button>
                            <button type="button" data-tab="published" className="px-5 py-3 text-xs font-medium border-b-2 border-transparent text-mid-gray hover:text-ink select-none whitespace-nowrap cursor-pointer transition-all">
                                Đã xuất bản (<span className="tab-count">0</span>)
                            </button>
                            <button type="button" data-tab="pending_review" className="px-5 py-3 text-xs font-medium border-b-2 border-transparent text-mid-gray hover:text-ink select-none whitespace-nowrap cursor-pointer transition-all">
                                Chờ duyệt (<span className="tab-count">0</span>)
                            </button>
                            <button type="button" data-tab="draft" className="px-5 py-3 text-xs font-medium border-b-2 border-transparent text-mid-gray hover:text-ink select-none whitespace-nowrap cursor-pointer transition-all">
                                Bản nháp (<span className="tab-count">0</span>)
                            </button>
                            <button type="button" data-tab="hidden" className="px-5 py-3 text-xs font-medium border-b-2 border-transparent text-mid-gray hover:text-ink select-none whitespace-nowrap cursor-pointer transition-all">
                                Đã bị ẩn (<span className="tab-count">0</span>)
                            </button>
                            <button type="button" data-tab="rejected" className="px-5 py-3 text-xs font-medium border-b-2 border-transparent text-mid-gray hover:text-ink select-none whitespace-nowrap cursor-pointer transition-all">
                                Bị từ chối (<span className="tab-count">0</span>)
                            </button>
                        </div>
                    </div>

                    {/*  5. Filter Chips Section (Ẩn theo mặc định, chèn động từ JS)  */}
                    <div id="filter-chips-container" className="hidden flex flex-wrap items-center gap-2 p-3 bg-canvas/35 border-b border-hairline text-xs select-none">
                        <span className="text-mid-gray text-[10px] font-semibold uppercase tracking-wider mr-1">Bộ lọc đang dùng:</span>
                        <div id="filter-chips-list" className="flex flex-wrap gap-1.5">
                            {/*  Chèn filter chip tại đây  */}
                        </div>
                        <button type="button" id="btn-clear-all-chips" className="btn-clear-chips-red text-[10px] font-semibold ml-2 transition-all cursor-pointer">Xóa tất cả</button>
                    </div>

                    {/*  Table Wrapper (Cuộn ngang, sticky header)  */}
                    <div className="flex-grow overflow-y-auto overflow-x-auto custom-scrollbar relative max-h-[560px]">
                        <table className="w-full text-left border-collapse table-auto min-w-[1720px]">
                            <thead className="sticky top-0 bg-surface-alt border-b border-hairline z-10 select-none">
                                <tr className="text-[10px] font-bold text-mid-gray uppercase tracking-wider h-10">
                                    <th className="p-3 pl-4 w-[310px]">Khóa học</th>
                                    <th className="p-3 w-[200px]">Giảng viên</th>
                                    <th className="p-3 w-[180px]">Danh mục</th>
                                    <th className="p-3 w-[120px]">Trình độ</th>
                                    <th className="p-3 w-[140px]">Giá bán</th>
                                    <th className="p-3 w-[100px]">Học viên</th>
                                    <th className="p-3 w-[125px]">Đơn hàng</th>
                                    <th className="p-3 w-[150px]">Doanh thu</th>
                                    <th className="p-3 w-[130px]">Đánh giá</th>
                                    <th className="p-3 w-[125px]">Trạng thái</th>
                                    <th className="p-3 w-[95px] text-center">Nổi bật</th>
                                    <th className="p-3 w-[130px]">Cập nhật</th>
                                    <th className="p-3 pr-4 w-[65px] text-right">Thao tác</th>
                                </tr>
                            </thead>
                            {/*  Table Body Loaded  */}
                            <tbody id="courses-table-body" className="divide-y divide-hairline text-xs">
                                {/*  Dòng dữ liệu được Javascript chèn tại đây  */}
                            </tbody>
                        </table>

                        {/*  Empty State (No Filter / Has Filter)  */}
                        <div id="courses-empty-state" className="hidden flex flex-col items-center justify-center p-8 text-center space-y-3 my-12">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-mid-gray">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 id="empty-title" className="text-sm font-semibold text-ink">Chưa có khóa học nào</h3>
                                <p id="empty-desc" className="text-xs text-mid-gray mt-1">Các khóa học mới của giảng viên sẽ xuất hiện tại đây.</p>
                            </div>
                            <button type="button" id="btn-empty-reset" className="px-4 py-2 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer">
                                Đặt lại bộ lọc
                            </button>
                        </div>

                        {/*  Loading State Row Skeletons  */}
                        <div id="courses-loading-state" className="hidden divide-y divide-hairline">
                            <div className="flex items-center p-4 space-x-6 w-full" v-htmlFor="i in 6">
                                <div className="h-10 w-16 bg-canvas rounded skeleton shrink-0"></div>
                                <div className="space-y-2 flex-1 max-w-[240px]">
                                    <div className="h-3 w-3/4 bg-canvas rounded-full skeleton"></div>
                                    <div className="h-2 w-1/2 bg-canvas rounded-full skeleton"></div>
                                </div>
                                <div className="space-y-1.5 w-[160px]">
                                    <div className="h-3 w-2/3 bg-canvas rounded-full skeleton"></div>
                                    <div className="h-2.5 w-1/3 bg-canvas rounded-full skeleton"></div>
                                </div>
                                <div className="h-4 w-[120px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[80px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[110px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[80px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[120px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4.5 w-10 bg-canvas rounded-full skeleton"></div>
                            </div>
                            {/*  Row 2  */}
                            <div className="flex items-center p-4 space-x-6 w-full">
                                <div className="h-10 w-16 bg-canvas rounded skeleton shrink-0"></div>
                                <div className="space-y-2 flex-1 max-w-[240px]">
                                    <div className="h-3 w-3/4 bg-canvas rounded-full skeleton"></div>
                                    <div className="h-2 w-1/2 bg-canvas rounded-full skeleton"></div>
                                </div>
                                <div className="space-y-1.5 w-[160px]">
                                    <div className="h-3 w-2/3 bg-canvas rounded-full skeleton"></div>
                                    <div className="h-2.5 w-1/3 bg-canvas rounded-full skeleton"></div>
                                </div>
                                <div className="h-4 w-[120px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[80px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[110px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[80px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[120px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4.5 w-10 bg-canvas rounded-full skeleton"></div>
                            </div>
                            {/*  Row 3  */}
                            <div className="flex items-center p-4 space-x-6 w-full">
                                <div className="h-10 w-16 bg-canvas rounded skeleton shrink-0"></div>
                                <div className="space-y-2 flex-1 max-w-[240px]">
                                    <div className="h-3 w-3/4 bg-canvas rounded-full skeleton"></div>
                                    <div className="h-2 w-1/2 bg-canvas rounded-full skeleton"></div>
                                </div>
                                <div className="space-y-1.5 w-[160px]">
                                    <div className="h-3 w-2/3 bg-canvas rounded-full skeleton"></div>
                                    <div className="h-2.5 w-1/3 bg-canvas rounded-full skeleton"></div>
                                </div>
                                <div className="h-4 w-[120px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[80px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[110px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[80px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-[120px] bg-canvas rounded-full skeleton"></div>
                                <div className="h-4.5 w-10 bg-canvas rounded-full skeleton"></div>
                            </div>
                        </div>

                        {/*  Error State  */}
                        <div id="courses-error-state" className="hidden flex flex-col items-center justify-center p-8 text-center space-y-3 my-12">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-brick-soft text-danger-brick">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-ink" id="error-title">Lỗi tải dữ liệu</h3>
                                <p className="text-xs text-mid-gray mt-1" id="error-desc">Đã có lỗi xảy ra trong quá trình kết nối dữ liệu. Vui lòng thử lại.</p>
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
                            <span>Đang hiển thị <span id="pag-showing-range" className="font-semibold text-ink">0-0</span> trong tổng số <span id="pag-total-records" className="font-semibold text-ink">0</span> khóa học</span>
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
                            {/*  Nạp động bằng Javascript  */}
                        </div>
                    </div>
                </section>
    </>
  );
}
