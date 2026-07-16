
import { initPage } from '../../../assets/js/pages/categories.js';
import React, { useState, useEffect } from 'react';

export default function CategoriesManagement() {
  useEffect(() => {
    try {
      initPage();
    } catch (err) {
      console.error('Error initializing vanilla JS:', err);
    }
  }, []);
  return (
    <>
      <main className="p-5 md:p-8 space-y-6">
                {/*  Page Title Area  */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Cấu hình hệ thống</p>
                        <h1 className="mt-1 text-2xl lg:text-3xl font-semibold tracking-tight text-ink">
                            Quản lý danh mục (<span id="title-total-categories">0</span>)
                        </h1>
                        <p className="text-xs text-mid-gray mt-1">Quản lý danh mục cha, danh mục con và phân loại khóa học trên hệ thống.</p>
                    </div>
                    <button type="button" id="btn-add-category" className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                        </svg>
                        Thêm danh mục
                    </button>
                </div>

                {/*  1. KPI Summary Area  */}
                <div id="kpi-content-wrapper" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {/*  KPI: Tổng danh mục  */}
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px]">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Tổng danh mục</span>
                            <svg className="w-4 h-4 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-total-categories" className="text-xl lg:text-2xl font-bold text-ink leading-none font-sans">0</span>
                            <p className="text-[9px] text-mid-gray mt-1">Danh mục trên hệ thống</p>
                        </div>
                    </div>

                    {/*  KPI: Đang hoạt động  */}
                    <div className="rounded-[6px] border border-hairline border-t-2 border-t-success bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px]">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Đang hoạt động</span>
                            <span className="flex h-1.5 w-1.5 rounded-full bg-success"></span>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-active-categories" className="text-xl lg:text-2xl font-bold text-success leading-none font-sans">0</span>
                            <p className="text-[9px] text-mid-gray mt-1">Khả dụng hiển thị</p>
                        </div>
                    </div>

                    {/*  KPI: Ngừng hoạt động  */}
                    <div className="rounded-[6px] border border-hairline border-t-2 border-t-danger-brick bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px]">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Ngừng hoạt động</span>
                            <span className="flex h-1.5 w-1.5 rounded-full bg-danger-brick"></span>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-inactive-categories" className="text-xl lg:text-2xl font-bold text-danger-brick leading-none font-sans">0</span>
                            <p className="text-[9px] text-mid-gray mt-1">Đang tạm ẩn</p>
                        </div>
                    </div>

                    {/*  KPI: Danh mục gốc  */}
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px]">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Danh mục gốc</span>
                            <svg className="w-4 h-4 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18 5.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM6 5.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-root-categories" className="text-xl lg:text-2xl font-bold text-ink leading-none font-sans">0</span>
                            <p className="text-[9px] text-mid-gray mt-1">Danh mục cấp cao nhất</p>
                        </div>
                    </div>

                    {/*  KPI: Chưa có khóa học  */}
                    <div className="rounded-[6px] border border-hairline border-t-2 border-t-warning bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px]">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Chưa có khóa học</span>
                            <svg className="w-4 h-4 text-warning/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-empty-categories" className="text-xl lg:text-2xl font-bold text-warning leading-none font-sans">0</span>
                            <p className="text-[9px] text-mid-gray mt-1">Chưa có nội dung</p>
                        </div>
                    </div>
                </div>

                {/*  KPI Loading Skeleton  */}
                <div id="kpi-loading-wrapper" className="hidden grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[92px]">
                        <div className="h-3 w-16 bg-canvas rounded-full skeleton"></div>
                        <div className="h-6 w-10 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[92px]">
                        <div className="h-3 w-12 bg-canvas rounded-full skeleton"></div>
                        <div className="h-6 w-12 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[92px]">
                        <div className="h-3 w-16 bg-canvas rounded-full skeleton"></div>
                        <div className="h-6 w-8 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[92px]">
                        <div className="h-3 w-20 bg-canvas rounded-full skeleton"></div>
                        <div className="h-6 w-10 bg-canvas rounded-full skeleton"></div>
                    </div>
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[92px]">
                        <div className="h-3 w-12 bg-canvas rounded-full skeleton"></div>
                        <div className="h-6 w-6 bg-canvas rounded-full skeleton"></div>
                    </div>
                </div>

                {/*  2. Search & Filter Bar  */}
                <section className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
                    <form id="filter-form" className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {/*  Search  */}
                            <div className="sm:col-span-2 lg:col-span-1">
                                <label htmlFor="filter-search" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Tìm kiếm</label>
                                <div className="relative">
                                    <input type="text" id="filter-search" name="search" placeholder="Tên hoặc slug danh mục..." className="w-full h-10 pl-8 pr-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink placeholder-mid-gray/70 transition-all" />
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
                                    <option value="active">Đang hoạt động</option>
                                    <option value="inactive">Ngừng hoạt động</option>
                                    <option value="deleted">Đã xóa</option>
                                </select>
                            </div>
                            {/*  Loại danh mục  */}
                            <div>
                                <label htmlFor="filter-type" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Loại danh mục</label>
                                <select id="filter-type" name="type" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="">Tất cả loại</option>
                                    <option value="root">Danh mục gốc</option>
                                    <option value="child">Danh mục con</option>
                                </select>
                            </div>
                            {/*  Danh mục cha  */}
                            <div>
                                <label htmlFor="filter-parent" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Danh mục cha</label>
                                <select id="filter-parent" name="parent_id" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="">Tất cả cha</option>
                                    {/*  Dynamic options  */}
                                </select>
                            </div>
                            {/*  Sắp xếp  */}
                            <div>
                                <label htmlFor="filter-sort" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Sắp xếp</label>
                                <select id="filter-sort" name="sort_by" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="newest">Mới nhất</option>
                                    <option value="oldest">Cũ nhất</option>
                                    <option value="name_asc">Tên A-Z</option>
                                    <option value="name_desc">Tên Z-A</option>
                                    <option value="sort_order_asc">Thứ tự tăng dần</option>
                                    <option value="sort_order_desc">Thứ tự giảm dần</option>
                                    <option value="courses_desc">Nhiều khóa học nhất</option>
                                </select>
                            </div>
                        </div>

                        {/*  Reset & Apply Row  */}
                        <div className="flex items-center justify-between pt-3 border-t border-hairline/60 gap-3">
                            <span className="text-[10px] text-mid-gray italic">* Giao diện tự động lọc, hoặc bấm Đặt lại để mặc định</span>
                            <div className="flex items-center gap-2 shrink-0">
                                <button type="button" id="btn-reset-filters" className="px-4 py-2 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer">
                                    Đặt lại bộ lọc
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                {/*  3. Active Chips (Lọc nhanh đang chọn)  */}
                <div id="filter-chips-container" className="flex flex-wrap gap-1.5 items-center hidden">
                    <span className="text-[10px] font-semibold text-mid-gray uppercase tracking-wider mr-1">Đang lọc theo:</span>
                    {/*  Dynamic chips  */}
                </div>

                {/*  4. Categories Table Section  */}
                <section className="rounded-[6px] border border-hairline bg-paper shadow-subtle overflow-hidden">
                    {/*  Table Toolbar  */}
                    <div className="flex h-12 items-center justify-between px-4 border-b border-hairline bg-surface-alt/40 text-xs text-mid-gray">
                        <div>
                            <span>Hiển thị kết quả thứ <span id="table-range-start" className="font-semibold text-ink">0</span> đến <span id="table-range-end" className="font-semibold text-ink">0</span> trong tổng số <span id="table-total-count" className="font-semibold text-ink">0</span> danh mục</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button type="button" id="btn-refresh-list" className="p-1 hover:bg-canvas rounded-full text-mid-gray hover:text-ink transition-all cursor-pointer flex items-center justify-center" title="Làm mới dữ liệu">
                                <svg id="refresh-icon" className="w-4 h-4 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/*  Main Table  */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-surface-alt border-b border-hairline text-[10px] font-bold text-mid-gray uppercase tracking-wider h-10 select-none">
                                    <th className="pl-4 py-2 w-1/3">Danh mục</th>
                                    <th className="px-3 py-2 w-[15%]">Danh mục cha</th>
                                    <th className="px-3 py-2 w-[15%]">Slug</th>
                                    <th className="px-3 py-2 w-[10%] text-center">Số khóa học</th>
                                    <th className="px-3 py-2 w-[10%] text-center">Thứ tự</th>
                                    <th className="px-3 py-2 w-[10%] text-center">Trạng thái</th>
                                    <th className="px-3 py-2 w-[12%]">Ngày cập nhật</th>
                                    <th className="pr-4 py-2 w-[8%] text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="categories-table-body" className="divide-y divide-hairline">
                                {/*  Dynamic rows  */}
                            </tbody>
                        </table>
                    </div>

                    {/*  State: Loading Skeleton  */}
                    <div id="categories-loading-state" className="hidden py-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-ink rounded-full animate-bounce" style={{animationDelay: '-0.3s'}}></div>
                                <div className="w-2.5 h-2.5 bg-ink rounded-full animate-bounce" style={{animationDelay: '-0.15s'}}></div>
                                <div className="w-2.5 h-2.5 bg-ink rounded-full animate-bounce"></div>
                            </div>
                            <span className="text-xs text-mid-gray">Đang tải danh sách danh mục...</span>
                        </div>
                    </div>

                    {/*  State: Empty State  */}
                    <div id="categories-empty-state" className="hidden py-16 px-4 text-center">
                        <div className="max-w-xs mx-auto space-y-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-mid-gray mx-auto">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                                </svg>
                            </div>
                            <h3 className="text-sm font-bold text-ink">Chưa có danh mục nào</h3>
                            <p className="text-xs text-mid-gray leading-normal">Hãy tạo danh mục đầu tiên để bắt đầu phân loại khóa học.</p>
                            <button type="button" id="btn-empty-create" className="px-4 py-2 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer">
                                Tạo danh mục
                            </button>
                        </div>
                    </div>

                    {/*  State: Filter Empty State  */}
                    <div id="categories-filter-empty-state" className="hidden py-16 px-4 text-center">
                        <div className="max-w-xs mx-auto space-y-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-mid-gray mx-auto">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
                                </svg>
                            </div>
                            <h3 className="text-sm font-bold text-ink">Không tìm thấy danh mục</h3>
                            <p className="text-xs text-mid-gray leading-normal">Không tìm thấy danh mục phù hợp với bộ lọc hiện tại.</p>
                            <button type="button" id="btn-filter-reset" className="px-4 py-2 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer">
                                Đặt lại bộ lọc
                            </button>
                        </div>
                    </div>

                    {/*  State: Error State  */}
                    <div id="categories-error-state" className="hidden py-16 px-4 text-center">
                        <div className="max-w-xs mx-auto space-y-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-brick-soft text-danger-brick mx-auto">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                                </svg>
                            </div>
                            <h3 className="text-sm font-bold text-danger-brick">Lỗi tải dữ liệu</h3>
                            <p className="text-xs text-mid-gray leading-normal">Đã xảy ra lỗi khi kết nối với máy chủ dữ liệu.</p>
                            <button type="button" id="btn-retry-load" className="px-4 py-2 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer">
                                Thử lại
                            </button>
                        </div>
                    </div>
                </section>

                {/*  5. Pagination Area  */}
                <div id="pagination-wrapper" className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                    {/*  Per Page Select  */}
                    <div className="flex items-center gap-2 text-xs text-mid-gray">
                        <span>Hiển thị</span>
                        <select id="pag-per-page" aria-label="Số bản ghi mỗi trang" className="h-8 px-2 bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                            <option value="10">10</option>
                            <option value="20" selected>20</option>
                            <option value="50">50</option>
                        </select>
                        <span>danh mục trên trang</span>
                    </div>

                    {/*  Navigation Buttons  */}
                    <div className="flex items-center gap-1.5">
                        <button type="button" id="btn-pag-prev" className="h-8 w-8 rounded-[6px] border border-hairline bg-paper text-ink hover:bg-canvas disabled:opacity-40 disabled:hover:bg-paper transition-all flex items-center justify-center cursor-pointer" aria-label="Trang trước">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
                            </svg>
                        </button>
                        <div id="pagination-pages" className="flex items-center gap-1">
                            {/*  Page numbers  */}
                        </div>
                        <button type="button" id="btn-pag-next" className="h-8 w-8 rounded-[6px] border border-hairline bg-paper text-ink hover:bg-canvas disabled:opacity-40 disabled:hover:bg-paper transition-all flex items-center justify-center cursor-pointer" aria-label="Trang sau">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </main>
    {/*  ==================== MODAL: THÊM MỚI DANH MỤC ====================  */}
    <div id="create-category-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 hidden">
        <div className="bg-paper border border-hairline rounded-[6px] w-full max-w-md shadow-subtle flex flex-col max-h-[90vh]">
            {/*  Header  */}
            <div className="flex h-14 shrink-0 items-center justify-between px-5 border-b border-hairline">
                <h3 className="text-sm font-bold text-ink">Thêm danh mục mới</h3>
                <button type="button" data-close-modal="create-category-modal" className="p-1 hover:bg-canvas rounded-full text-mid-gray hover:text-ink transition-colors cursor-pointer">
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            {/*  Body  */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4">
                <form id="create-category-form" className="space-y-4">
                    {/*  Tên danh mục  */}
                    <div>
                        <label htmlFor="create-name" className="block text-xs font-semibold text-ink mb-1.5">Tên danh mục *</label>
                        <input type="text" id="create-name" name="name" placeholder="Ví dụ: Lập trình di động" className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink" />
                        <p className="text-[10px] text-danger-brick mt-1 hidden" data-error="name"></p>
                    </div>
                    {/*  Slug  */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="create-slug" className="block text-xs font-semibold text-ink">Slug danh mục *</label>
                            <button type="button" id="btn-generate-slug-create" className="text-[10px] text-mid-gray hover:text-ink underline font-medium cursor-pointer">Tự động sinh slug</button>
                        </div>
                        <input type="text" id="create-slug" name="slug" placeholder="Ví dụ: lap-trinh-di-dong" className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink font-mono" />
                        <p className="text-[10px] text-danger-brick mt-1 hidden" data-error="slug"></p>
                    </div>
                    {/*  Danh mục cha  */}
                    <div>
                        <label htmlFor="create-parent" className="block text-xs font-semibold text-ink mb-1.5">Danh mục cha</label>
                        <select id="create-parent" name="parent_id" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink">
                            <option value="">Không có - Danh mục gốc</option>
                            {/*  Dynamic parents options  */}
                        </select>
                        <p className="text-[10px] text-danger-brick mt-1 hidden" data-error="parent_id"></p>
                    </div>
                    {/*  Mô tả  */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="create-description" className="block text-xs font-semibold text-ink">Mô tả</label>
                            <span className="text-[9px] text-mid-gray"><span id="create-desc-count">0</span>/200 ký tự</span>
                        </div>
                        <textarea id="create-description" name="description" maxlength="200" placeholder="Mô tả ngắn gọn về danh mục..." className="w-full h-20 p-2.5 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink resize-none leading-relaxed"></textarea>
                        <p className="text-[10px] text-danger-brick mt-1 hidden" data-error="description"></p>
                    </div>
                    {/*  Thứ tự hiển thị  */}
                    <div>
                        <label htmlFor="create-sort-order" className="block text-xs font-semibold text-ink mb-1.5">Thứ tự hiển thị (Số nguyên dương)</label>
                        <input type="number" id="create-sort-order" name="sort_order" min="0" value="0" className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink" />
                        <p className="text-[10px] text-danger-brick mt-1 hidden" data-error="sort_order"></p>
                    </div>
                    {/*  Trạng thái  */}
                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1.5">Trạng thái</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer">
                                <input type="radio" name="status" value="active" checked className="w-4 h-4 text-ink border-hairline focus:ring-0 focus:ring-offset-0" />
                                <span>Đang hoạt động</span>
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer">
                                <input type="radio" name="status" value="inactive" className="w-4 h-4 text-ink border-hairline focus:ring-0 focus:ring-offset-0" />
                                <span>Ngừng hoạt động</span>
                            </label>
                        </div>
                        <p className="text-[10px] text-danger-brick mt-1 hidden" data-error="status"></p>
                    </div>
                </form>
            </div>
            {/*  Footer  */}
            <div className="p-4 border-t border-hairline bg-surface-alt flex justify-end gap-2 shrink-0">
                <button type="button" data-close-modal="create-category-modal" className="px-4 py-1.5 text-xs font-semibold rounded-full bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer">
                    Hủy
                </button>
                <button type="button" id="btn-submit-create" className="px-5 py-1.5 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer">
                    Tạo danh mục
                </button>
            </div>
        </div>
    </div>

    {/*  ==================== MODAL: CHỈNH SỬA DANH MỤC ====================  */}
    <div id="edit-category-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 hidden">
        <div className="bg-paper border border-hairline rounded-[6px] w-full max-w-md shadow-subtle flex flex-col max-h-[90vh]">
            {/*  Header  */}
            <div className="flex h-14 shrink-0 items-center justify-between px-5 border-b border-hairline">
                <h3 className="text-sm font-bold text-ink">Chỉnh sửa danh mục</h3>
                <button type="button" data-close-modal="edit-category-modal" className="p-1 hover:bg-canvas rounded-full text-mid-gray hover:text-ink transition-colors cursor-pointer">
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            {/*  Body  */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4">
                {/*  Inner Loading state  */}
                <div id="edit-modal-loader" className="hidden py-8 flex flex-col items-center justify-center space-y-2">
                    <div className="w-6 h-6 border-2 border-mid-gray/30 border-t-ink rounded-full animate-spin"></div>
                    <span className="text-xs text-mid-gray">Đang tải thông tin danh mục...</span>
                </div>
                
                <form id="edit-category-form" className="space-y-4">
                    <input type="hidden" id="edit-category-id" />
                    {/*  Tên danh mục  */}
                    <div>
                        <label htmlFor="edit-name" className="block text-xs font-semibold text-ink mb-1.5">Tên danh mục *</label>
                        <input type="text" id="edit-name" name="name" placeholder="Ví dụ: Lập trình di động" className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink" />
                        <p className="text-[10px] text-danger-brick mt-1 hidden" data-error="name"></p>
                    </div>
                    {/*  Slug  */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="edit-slug" className="block text-xs font-semibold text-ink">Slug danh mục *</label>
                            <button type="button" id="btn-generate-slug-edit" className="text-[10px] text-mid-gray hover:text-ink underline font-medium cursor-pointer">Tự động sinh slug</button>
                        </div>
                        <input type="text" id="edit-slug" name="slug" placeholder="Ví dụ: lap-trinh-di-dong" className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink font-mono" />
                        <p className="text-[10px] text-danger-brick mt-1 hidden" data-error="slug"></p>
                    </div>
                    {/*  Danh mục cha  */}
                    <div>
                        <label htmlFor="edit-parent" className="block text-xs font-semibold text-ink mb-1.5">Danh mục cha</label>
                        <select id="edit-parent" name="parent_id" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink">
                            <option value="">Không có - Danh mục gốc</option>
                            {/*  Dynamic parents options  */}
                        </select>
                        <p className="text-[10px] text-danger-brick mt-1 hidden" data-error="parent_id"></p>
                    </div>
                    {/*  Mô tả  */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="edit-description" className="block text-xs font-semibold text-ink">Mô tả</label>
                            <span className="text-[9px] text-mid-gray"><span id="edit-desc-count">0</span>/200 ký tự</span>
                        </div>
                        <textarea id="edit-description" name="description" maxlength="200" placeholder="Mô tả ngắn gọn về danh mục..." className="w-full h-20 p-2.5 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink resize-none leading-relaxed"></textarea>
                        <p className="text-[10px] text-danger-brick mt-1 hidden" data-error="description"></p>
                    </div>
                    {/*  Thứ tự hiển thị  */}
                    <div>
                        <label htmlFor="edit-sort-order" className="block text-xs font-semibold text-ink mb-1.5">Thứ tự hiển thị (Số nguyên dương)</label>
                        <input type="number" id="edit-sort-order" name="sort_order" min="0" className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink" />
                        <p className="text-[10px] text-danger-brick mt-1 hidden" data-error="sort_order"></p>
                    </div>
                    {/*  Trạng thái  */}
                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1.5">Trạng thái</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer">
                                <input type="radio" id="edit-status-active" name="status" value="active" className="w-4 h-4 text-ink border-hairline focus:ring-0 focus:ring-offset-0" />
                                <span>Đang hoạt động</span>
                            </label>
                            <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer">
                                <input type="radio" id="edit-status-inactive" name="status" value="inactive" className="w-4 h-4 text-ink border-hairline focus:ring-0 focus:ring-offset-0" />
                                <span>Ngừng hoạt động</span>
                            </label>
                        </div>
                        <p className="text-[10px] text-danger-brick mt-1 hidden" data-error="status"></p>
                    </div>
                </form>
            </div>
            {/*  Footer  */}
            <div className="p-4 border-t border-hairline bg-surface-alt flex justify-end gap-2 shrink-0">
                <button type="button" data-close-modal="edit-category-modal" className="px-4 py-1.5 text-xs font-semibold rounded-full bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer">
                    Hủy
                </button>
                <button type="button" id="btn-submit-edit" className="px-5 py-1.5 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer">
                    Lưu thay đổi
                </button>
            </div>
        </div>
    </div>

    {/*  ==================== DRAWER: XEM CHI TIẾT DANH MỤC ====================  */}
    <div id="detail-category-drawer" className="fixed inset-0 z-50 flex justify-end bg-black/40 hidden">
        <div className="bg-paper border-l border-hairline w-full max-w-md shadow-subtle flex flex-col h-full animate-slide-in">
            {/*  Header  */}
            <div className="flex h-14 shrink-0 items-center justify-between px-5 border-b border-hairline">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-mid-gray font-mono">[ID: <span id="detail-id">---</span>]</span>
                    <h3 className="text-sm font-bold text-ink">Chi tiết danh mục</h3>
                </div>
                <button type="button" data-close-modal="detail-category-drawer" className="p-1 hover:bg-canvas rounded-full text-mid-gray hover:text-ink transition-colors cursor-pointer">
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            {/*  Body  */}
            <div className="flex-grow overflow-y-auto p-5 space-y-6">
                {/*  Info Section  */}
                <div className="space-y-4">
                    <div>
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">Tên danh mục</span>
                        <p id="detail-name" className="text-sm font-semibold text-ink">---</p>
                    </div>
                    <div>
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">Slug</span>
                        <p id="detail-slug" className="text-xs font-mono text-ink bg-canvas px-2 py-1 rounded border border-hairline inline-block">---</p>
                    </div>
                    <div>
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">Mô tả</span>
                        <p id="detail-description" className="text-xs text-ink bg-surface-alt p-3 rounded border border-hairline leading-relaxed italic">Chưa có mô tả nào.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">Danh mục cha</span>
                            <span id="detail-parent" className="text-xs">---</span>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">Trạng thái</span>
                            <span id="detail-status" className="inline-block">---</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">Thứ tự hiển thị</span>
                            <p id="detail-sort-order" className="text-xs font-semibold text-ink">---</p>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">Số khóa học trực thuộc</span>
                            <p id="detail-course-count" className="text-xs font-semibold text-ink font-sans">---</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-hairline">
                        <div>
                            <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">Ngày tạo</span>
                            <p id="detail-created-at" className="text-[11px] text-mid-gray">---</p>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">Ngày cập nhật</span>
                            <p id="detail-updated-at" className="text-[11px] text-mid-gray">---</p>
                        </div>
                    </div>
                </div>

                {/*  Children Section  */}
                <div className="space-y-3 pt-4 border-t border-hairline">
                    <h4 className="text-xs font-bold text-ink">Danh mục con trực thuộc</h4>
                    <div id="detail-children-container" className="space-y-1.5">
                        {/*  Dynamic list of child categories  */}
                    </div>
                </div>
            </div>
            {/*  Footer  */}
            <div className="p-4 border-t border-hairline bg-surface-alt flex justify-end shrink-0">
                <button type="button" data-close-modal="detail-category-drawer" className="px-5 py-1.5 text-xs font-semibold rounded-full bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer">
                    Đóng chi tiết
                </button>
            </div>
        </div>
    </div>

    {/*  ==================== MODAL XÁC NHẬN HÀNH ĐỘNG ====================  */}

    {/*  Modal 1: Xác nhận đổi trạng thái (Kích hoạt / Ngừng hoạt động)  */}
    <div id="confirm-status-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 hidden">
        <div className="bg-paper border border-hairline rounded-[6px] w-full max-w-sm shadow-subtle p-5 space-y-4">
            <div>
                <h3 className="text-sm font-bold text-ink" id="confirm-status-title">Xác nhận đổi trạng thái</h3>
                <div className="text-xs text-mid-gray mt-1 leading-normal" id="confirm-status-message">
                    Bạn có chắc muốn đổi trạng thái của danh mục không?
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
                <button type="button" data-close-modal="confirm-status-modal" className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer">
                    Hủy
                </button>
                <button type="button" id="btn-submit-status" className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer">
                    Xác nhận
                </button>
            </div>
        </div>
    </div>

    {/*  Modal 2: Xác nhận xóa danh mục (Cảnh báo xóa mềm)  */}
    <div id="confirm-delete-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 hidden">
        <div className="bg-paper border border-hairline rounded-[6px] w-full max-w-sm shadow-subtle p-5 space-y-4">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-danger-brick-soft text-danger-brick shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-danger-brick">Xác nhận xóa danh mục</h3>
                    <p className="text-xs text-mid-gray mt-1 leading-normal" id="confirm-delete-message">
                        Bạn có chắc chắn muốn xóa danh mục “<span id="confirm-delete-name" className="font-semibold text-ink">---</span>”?
                    </p>
                    <p className="text-[10px] text-mid-gray mt-2 leading-relaxed bg-surface-alt p-2 rounded border border-hairline">
                        Hành động này sẽ xóa mềm danh mục. Danh mục sẽ ẩn khỏi hệ thống và người dùng nhưng thông tin khóa học cũ vẫn được bảo toàn.
                    </p>
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
                <button type="button" data-close-modal="confirm-delete-modal" className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer">
                    Hủy bỏ
                </button>
                <button type="button" id="btn-submit-delete" className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] bg-danger-brick text-white hover:opacity-90 transition-opacity cursor-pointer">
                    Xóa danh mục
                </button>
            </div>
        </div>
    </div>

    {/*  Core & Page Scripts  */}
    </>
  );
}
