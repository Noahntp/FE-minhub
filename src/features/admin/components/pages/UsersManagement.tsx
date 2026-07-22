
import { initPage } from '@/assets/js/pages/users';
import React, { useState, useEffect } from 'react';

export default function UsersManagement() {
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
                        <h1 className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-tight flex items-center gap-2">
                            Quản lý người dùng
                        </h1>
                        <p className="text-xs text-mid-gray mt-0.5" id="page-description">
                            Quản lý tài khoản học viên, giảng viên và quản trị viên trong hệ thống. Tổng số: <span id="title-total-users" className="font-bold text-ink">0</span> tài khoản.
                        </p>
                        <p className="text-[10px] text-mid-gray/80 mt-1">
                            Cập nhật lần cuối: <span id="last-update-time" className="font-medium text-mid-gray">---</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {/*  Nút làm mới dữ liệu  */}
                        <button type="button" id="btn-refresh-data" className="h-9 w-9 flex items-center justify-center rounded-full border border-hairline hover:bg-canvas text-ink shrink-0 transition-colors shadow-sm cursor-pointer" aria-label="Làm mới dữ liệu">
                            <svg className="w-4 h-4 transition-transform duration-500" id="refresh-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                            </svg>
                        </button>
                        {/*  Nút thêm người dùng  */}
                        <button type="button" id="btn-open-create-modal" className="px-4 py-2 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                            </svg>
                            Thêm người dùng
                        </button>
                    </div>
                </div>

                {/*  1. KPI Thống kê (6 cards, bo góc 6px, padding p-4, gap-3)  */}
                {/*  State: Loaded KPI  */}
                <div id="kpi-content-wrapper" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/*  KPI: Tổng người dùng (Nổi bật viền)  */}
                    <div className="rounded-[6px] border border-mid-gray/45 bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px]">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Tổng người dùng</span>
                            <svg className="w-4 h-4 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-total-users" className="text-xl lg:text-2xl font-bold text-ink leading-none font-sans">0</span>
                            <p className="text-[9px] text-mid-gray mt-1 flex items-center gap-1">
                                Hệ thống (<span id="kpi-new-users" className="text-success font-semibold">+0 mới</span>)
                            </p>
                        </div>
                    </div>

                    {/*  KPI: Học viên  */}
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px]">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Học viên</span>
                            <svg className="w-4 h-4 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14v7M4.67 10v6c0 1 3 3 7.33 3s7.33-2 7.33-3v-6"/>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-total-learners" className="text-xl lg:text-2xl font-bold text-ink leading-none font-sans">0</span>
                            <p className="text-[9px] text-mid-gray mt-1">Đang hoạt động học tập</p>
                        </div>
                    </div>

                    {/*  KPI: Giảng viên  */}
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px]">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Giảng viên</span>
                            <svg className="w-4 h-4 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 9h-6M19 6v6"/>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-total-instructors" className="text-xl lg:text-2xl font-bold text-ink leading-none font-sans">0</span>
                            <p className="text-[9px] text-mid-gray mt-1">Giảng dạy chuyên môn</p>
                        </div>
                    </div>

                    {/*  KPI: Đang hoạt động (Viền trên xanh success)  */}
                    <div className="rounded-[6px] border border-hairline border-t-2 border-t-success bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px]">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Đang hoạt động</span>
                            <span className="flex h-1.5 w-1.5 rounded-full bg-success"></span>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-active-users" className="text-xl lg:text-2xl font-bold text-success leading-none font-sans">0</span>
                            <p className="text-[9px] text-mid-gray mt-1">Khả dụng đăng nhập</p>
                        </div>
                    </div>

                    {/*  KPI: Đã khóa (Viền trên đỏ danger)  */}
                    <div className="rounded-[6px] border border-hairline border-t-2 border-t-danger-brick bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px]">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Đã khóa</span>
                            <svg className="w-4 h-4 text-danger-brick/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-locked-users" className="text-xl lg:text-2xl font-bold text-danger-brick leading-none font-sans">0</span>
                            <p className="text-[9px] text-mid-gray mt-1">Đình chỉ hoạt động</p>
                        </div>
                    </div>

                    {/*  KPI: Chưa xác minh (Viền trên cam warning)  */}
                    <div className="rounded-[6px] border border-hairline border-t-2 border-t-warning bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[92px]">
                        <div className="flex items-center justify-between text-mid-gray">
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Chưa xác minh</span>
                            <svg className="w-4 h-4 text-warning/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
                            </svg>
                        </div>
                        <div className="mt-2">
                            <span id="kpi-unverified-users" className="text-xl lg:text-2xl font-bold text-warning leading-none font-sans">0</span>
                            <p className="text-[9px] text-mid-gray mt-1">Chưa xác thực email</p>
                        </div>
                    </div>
                </div>

                {/*  State: Loading KPI Skeleton  */}
                <div id="kpi-loading-wrapper" className="hidden grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
                    <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[92px]">
                        <div className="h-3 w-18 bg-canvas rounded-full skeleton"></div>
                        <div className="h-6 w-8 bg-canvas rounded-full skeleton"></div>
                    </div>
                </div>

                {/*  2. Khu vực "Tài khoản cần chú ý" (Gọn, flexbox)  */}
                <div className="rounded-[6px] border border-hairline bg-surface-alt p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-mid-gray">
                        <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                        </svg>
                        <span className="font-bold text-ink uppercase tracking-wider text-[10px]">Tài khoản cần chú ý:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 flex-grow md:justify-start md:pl-6 text-mid-gray">
                        <div className="flex items-center">
                            <span>• <span id="notice-locked-count" className="font-bold text-ink">0</span> tài khoản bị khóa</span>
                            <button type="button" data-attention="locked" className="text-[10px] text-mid-gray underline hover:text-ink font-medium ml-1.5 transition-colors cursor-pointer">Xem danh sách</button>
                        </div>
                        <div className="flex items-center">
                            <span>• <span id="notice-unverified-count" className="font-bold text-ink">0</span> chưa xác minh email</span>
                            <button type="button" data-attention="unverified" className="text-[10px] text-mid-gray underline hover:text-ink font-medium ml-1.5 transition-colors cursor-pointer">Xem danh sách</button>
                        </div>
                        <div className="flex items-center">
                            <span>• <span id="notice-no-login-count" className="font-bold text-ink">0</span> chưa đăng nhập lần nào</span>
                            <button type="button" data-attention="no_login" className="text-[10px] text-mid-gray underline hover:text-ink font-medium ml-1.5 transition-colors cursor-pointer">Xem danh sách</button>
                        </div>
                    </div>
                </div>

                {/*  3. Bộ lọc (Filter bar, bo góc 6px, padding p-4)  */}
                <section className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
                    <form id="filter-form" className="space-y-4">
                        {/*  Hàng 1: Search & Inputs  */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {/*  Search  */}
                            <div className="lg:col-span-2">
                                <label htmlFor="filter-search" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Tìm kiếm</label>
                                <div className="relative">
                                    <input type="text" id="filter-search" name="search" placeholder="Tìm theo tên, email hoặc số điện thoại..." className="w-full h-10 pl-8 pr-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink placeholder-mid-gray/70 transition-all" />
                                    <svg className="w-3.5 h-3.5 text-mid-gray/80 absolute left-3 top-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                                    </svg>
                                </div>
                            </div>
                            {/*  Vai trò  */}
                            <div>
                                <label htmlFor="filter-role" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Vai trò</label>
                                <select id="filter-role" name="role" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="">Tất cả vai trò</option>
                                    <option value="learner">Học viên</option>
                                    <option value="instructor">Giảng viên</option>
                                    <option value="admin">Quản trị viên</option>
                                </select>
                            </div>
                            {/*  Trạng thái  */}
                            <div>
                                <label htmlFor="filter-status" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Trạng thái</label>
                                <select id="filter-status" name="status" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="active">Đang hoạt động</option>
                                    <option value="inactive">Không hoạt động</option>
                                    <option value="locked">Đã khóa</option>
                                </select>
                            </div>
                            {/*  Xác minh email  */}
                            <div>
                                <label htmlFor="filter-verified" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Xác minh email</label>
                                <select id="filter-verified" name="email_verified" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="">Tất cả</option>
                                    <option value="verified">Đã xác minh</option>
                                    <option value="unverified">Chưa xác minh</option>
                                </select>
                            </div>
                            {/*  Sắp xếp  */}
                            <div>
                                <label htmlFor="filter-sort" className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5">Sắp xếp</label>
                                <select id="filter-sort" name="sort_by" data-custom-select className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all">
                                    <option value="newest">Mới nhất</option>
                                    <option value="oldest">Cũ nhất</option>
                                    <option value="name_asc">Tên A–Z</option>
                                    <option value="name_desc">Tên Z–A</option>
                                    <option value="last_login">Lần đăng nhập gần nhất</option>
                                </select>
                            </div>
                        </div>

                        {/*  Hàng 2: Date Picker & Buttons  */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-hairline/60 gap-3">
                            {/*  Date Range Inputs  */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-mid-gray font-medium">Từ:</span>
                                    <input type="date" id="filter-date-from" name="date_from" aria-label="Từ ngày" className="h-10 px-2.5 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink" />
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-mid-gray font-medium">Đến:</span>
                                    <input type="date" id="filter-date-to" name="date_to" aria-label="Đến ngày" className="h-10 px-2.5 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink" />
                                </div>
                            </div>
                            {/*  Action Buttons  */}
                            <div className="flex items-center gap-2 shrink-0">
                                <button type="button" id="btn-reset-filters" className="px-4 py-2 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer">
                                    Đặt lại
                                </button>
                                <button type="submit" className="px-5 py-2 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer">
                                    Áp dụng
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                {/*  4. Quick Tabs (Lọc nhanh) & Bảng Dữ liệu (bo góc 6px)  */}
                <section className="rounded-[6px] border border-hairline bg-paper shadow-subtle overflow-hidden flex flex-col min-h-[400px]">
                    {/*  Quick Tabs Header  */}
                    <div className="flex items-center justify-between border-b border-hairline/60 bg-paper shrink-0 overflow-x-auto scrollbar-none">
                        <div className="flex" id="quick-tabs-container">
                            <button type="button" data-tab="all" className="px-5 py-3 text-xs font-semibold border-b-2 border-ink text-ink select-none whitespace-nowrap cursor-pointer transition-all">
                                Tất cả (<span className="tab-count">0</span>)
                            </button>
                            <button type="button" data-tab="learner" className="px-5 py-3 text-xs font-medium border-b-2 border-transparent text-mid-gray hover:text-ink select-none whitespace-nowrap cursor-pointer transition-all">
                                Học viên (<span className="tab-count">0</span>)
                            </button>
                            <button type="button" data-tab="instructor" className="px-5 py-3 text-xs font-medium border-b-2 border-transparent text-mid-gray hover:text-ink select-none whitespace-nowrap cursor-pointer transition-all">
                                Giảng viên (<span className="tab-count">0</span>)
                            </button>
                            <button type="button" data-tab="locked" className="px-5 py-3 text-xs font-medium border-b-2 border-transparent text-mid-gray hover:text-ink select-none whitespace-nowrap cursor-pointer transition-all">
                                Đã khóa (<span className="tab-count">0</span>)
                            </button>
                            <button type="button" data-tab="unverified" className="px-5 py-3 text-xs font-medium border-b-2 border-transparent text-mid-gray hover:text-ink select-none whitespace-nowrap cursor-pointer transition-all">
                                Chưa xác minh (<span className="tab-count">0</span>)
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

                    {/*  Table Wrapper (Cuộn ngang trên màn hình nhỏ, sticky header)  */}
                    <div className="flex-grow overflow-y-auto overflow-x-auto custom-scrollbar relative max-h-[500px]">
                        <table className="w-full text-left border-collapse table-auto min-w-[800px]">
                            <thead className="sticky top-0 bg-surface-alt border-b border-hairline z-10">
                                <tr className="text-[10px] font-bold text-mid-gray uppercase tracking-wider select-none h-10">
                                    {/*  Cột check tất cả  */}
                                    <th className="p-3 pl-4 w-10 text-center">
                                        <input type="checkbox" id="check-all-users" className="h-3.5 w-3.5 rounded border-hairline text-ink focus:ring-ink focus:ring-offset-0 cursor-pointer accent-ink" />
                                    </th>
                                    <th className="p-3">Người dùng</th>
                                    <th className="p-3">Vai trò</th>
                                    <th className="p-3">Số điện thoại</th>
                                    <th className="p-3">Trạng thái</th>
                                    <th className="p-3">Xác minh email</th>
                                    <th className="p-3">Đăng nhập gần nhất</th>
                                    <th className="p-3">Ngày tạo</th>
                                    <th className="p-3 pr-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            {/*  Table Body Loaded  */}
                            <tbody id="users-table-body" className="divide-y divide-hairline text-xs">
                                {/*  Dòng dữ liệu được Javascript chèn tại đây  */}
                            </tbody>
                        </table>

                        {/*  Empty State  */}
                        <div id="users-empty-state" className="hidden flex flex-col items-center justify-center p-8 text-center space-y-3 my-8">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-mid-gray">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-ink">Không tìm thấy người dùng</h3>
                                <p className="text-xs text-mid-gray mt-1">Không tìm thấy người dùng phù hợp với bộ lọc hiện tại.</p>
                            </div>
                            <button type="button" id="btn-empty-reset" className="px-4 py-2 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer">
                                Đặt lại bộ lọc
                            </button>
                        </div>

                        {/*  Loading State Row Skeletons  */}
                        <div id="users-loading-state" className="hidden divide-y divide-hairline">
                            {/*  Loading row placeholders  */}
                            <div className="flex items-center p-4 space-x-4">
                                <div className="h-4 w-4 bg-canvas rounded skeleton shrink-0"></div>
                                <div className="h-8 w-8 rounded-full bg-canvas skeleton shrink-0"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-3 w-1/4 bg-canvas rounded-full skeleton"></div>
                                    <div className="h-2 w-1/3 bg-canvas rounded-full skeleton"></div>
                                </div>
                                <div className="h-4 w-16 bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-24 bg-canvas rounded-full skeleton"></div>
                                <div className="h-4.5 w-16 bg-canvas rounded-full skeleton"></div>
                            </div>
                            <div className="flex items-center p-4 space-x-4">
                                <div className="h-4 w-4 bg-canvas rounded skeleton shrink-0"></div>
                                <div className="h-8 w-8 rounded-full bg-canvas skeleton shrink-0"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-3 w-1/5 bg-canvas rounded-full skeleton"></div>
                                    <div className="h-2 w-1/4 bg-canvas rounded-full skeleton"></div>
                                </div>
                                <div className="h-4 w-16 bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-20 bg-canvas rounded-full skeleton"></div>
                                <div className="h-4.5 w-16 bg-canvas rounded-full skeleton"></div>
                            </div>
                            <div className="flex items-center p-4 space-x-4">
                                <div className="h-4 w-4 bg-canvas rounded skeleton shrink-0"></div>
                                <div className="h-8 w-8 rounded-full bg-canvas skeleton shrink-0"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-3 w-1/3 bg-canvas rounded-full skeleton"></div>
                                    <div className="h-2 w-1/2 bg-canvas rounded-full skeleton"></div>
                                </div>
                                <div className="h-4 w-16 bg-canvas rounded-full skeleton"></div>
                                <div className="h-4 w-24 bg-canvas rounded-full skeleton"></div>
                                <div className="h-4.5 w-16 bg-canvas rounded-full skeleton"></div>
                            </div>
                        </div>

                        {/*  Error State  */}
                        <div id="users-error-state" className="hidden flex flex-col items-center justify-center p-8 text-center space-y-3 my-8">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-brick-soft text-danger-brick">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-ink">Lỗi tải dữ liệu</h3>
                                <p className="text-xs text-mid-gray mt-1">Đã có lỗi xảy ra trong quá trình kết nối dữ liệu. Vui lòng thử lại.</p>
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
                            <span>Đang hiển thị <span id="pag-showing-range" className="font-semibold text-ink">0-0</span> trong tổng số <span id="pag-total-records" className="font-semibold text-ink">0</span> người dùng</span>
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
