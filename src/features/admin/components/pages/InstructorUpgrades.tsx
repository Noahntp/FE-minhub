
import { initPage } from '@/assets/js/pages/instructor-upgrades';
import React, { useState, useEffect } from 'react';

export default function InstructorUpgrades() {
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
          <div
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0"
          >
            <div>
              <h1
                className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-tight flex items-center gap-2"
              >
                Yêu cầu lên giảng viên
              </h1>
              <p className="text-xs text-mid-gray mt-0.5" id="page-description">
                Xem xét và xử lý hồ sơ đăng ký trở thành giảng viên trên hệ
                thống. Tổng số:
                <span id="title-total-requests" className="font-bold text-ink"
                  >0</span
                >
                yêu cầu.
              </p>
              <p className="text-[10px] text-mid-gray/80 mt-1">
                Cập nhật lần cuối:
                <span id="last-update-time" className="font-medium text-mid-gray"
                  >---</span
                >
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/*  Nút làm mới dữ liệu  */}
              <button
                type="button"
                id="btn-refresh-data"
                className="h-9 w-9 flex items-center justify-center rounded-full border border-hairline hover:bg-canvas text-ink shrink-0 transition-colors shadow-sm cursor-pointer"
                aria-label="Làm mới dữ liệu"
              >
                <svg
                  className="w-4 h-4 transition-transform duration-500"
                  id="refresh-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/*  1. KPI Thống kê (4 cards, bo góc 6px, padding p-4, gap-3)  */}
          {/*  State: Loaded KPI  */}
          <div
            id="kpi-content-wrapper"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            {/*  KPI: Tổng yêu cầu  */}
            <button
              type="button"
              id="kpi-card-total"
              className="text-left w-full rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[110px] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-mid-gray/40 select-none"
            >
              <div
                className="flex items-center justify-between text-mid-gray w-full"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider"
                  >Tổng yêu cầu</span
                >
                <svg
                  className="w-4 h-4 text-mid-gray/80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"
                  />
                </svg>
              </div>
              <div className="mt-1">
                <span
                  id="kpi-total"
                  className="text-2xl font-bold text-ink leading-none font-sans"
                  >0</span
                >
                <p className="text-[9px] text-mid-gray mt-0.5">
                  Tất cả hồ sơ đã gửi
                </p>
              </div>
              {/*  Phân bổ nhỏ & Thanh tỷ lệ phân đoạn  */}
              <div className="mt-2 space-y-1.5 w-full">
                <div
                  className="flex items-center justify-between text-[9px] text-mid-gray select-none"
                >
                  <span className="flex items-center gap-1"
                    ><span className="h-1.5 w-1.5 rounded-full bg-warning"></span
                    >Chờ:
                    <strong id="kpi-total-pending-sub" className="text-ink"
                      >0</strong
                    ></span
                  >
                  <span className="flex items-center gap-1"
                    ><span className="h-1.5 w-1.5 rounded-full bg-success"></span
                    >Duyệt:
                    <strong id="kpi-total-approved-sub" className="text-ink"
                      >0</strong
                    ></span
                  >
                  <span className="flex items-center gap-1"
                    ><span
                      className="h-1.5 w-1.5 rounded-full bg-danger-brick"
                    ></span
                    >Từ chối:
                    <strong id="kpi-total-rejected-sub" className="text-ink"
                      >0</strong
                    ></span
                  >
                </div>
                {/*  Progress bar phân đoạn  */}
                <div
                  className="h-1 w-full bg-canvas rounded-full flex overflow-hidden"
                >
                  <div
                    id="kpi-total-pending-bar"
                    className="bg-warning transition-all duration-500"
                    style={{width: '0%'}}
                  ></div>
                  <div
                    id="kpi-total-approved-bar"
                    className="bg-success transition-all duration-500"
                    style={{width: '0%'}}
                  ></div>
                  <div
                    id="kpi-total-rejected-bar"
                    className="bg-danger-brick transition-all duration-500"
                    style={{width: '0%'}}
                  ></div>
                </div>
              </div>
            </button>

            {/*  KPI: Chờ xử lý (Viền trên màu cam warning)  */}
            <button
              type="button"
              id="kpi-card-pending"
              className="text-left w-full rounded-[6px] border border-hairline border-t-2 border-t-warning bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[110px] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-warning/40 select-none"
            >
              <div
                className="flex items-center justify-between text-mid-gray w-full"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider"
                  >Chờ xử lý</span
                >
                <span
                  id="kpi-pending-link"
                  className="text-[9px] font-semibold text-warning hover:underline cursor-pointer select-none"
                  >Xem hồ sơ</span
                >
              </div>
              <div className="mt-1">
                <span
                  id="kpi-pending"
                  className="text-2xl font-bold text-warning leading-none font-sans"
                  >0</span
                >
                <p className="text-[9px] text-mid-gray mt-0.5">
                  Hồ sơ cần Admin xử lý
                </p>
              </div>
              <div className="mt-2 space-y-1 w-full">
                <div
                  className="text-[9px] text-mid-gray flex justify-between select-none"
                >
                  <span id="kpi-pending-percent">0% tổng hồ sơ</span>
                </div>
                <div
                  className="h-1 w-full bg-warning-soft rounded-full overflow-hidden"
                >
                  <div
                    id="kpi-pending-bar"
                    className="h-full bg-warning transition-all duration-500"
                    style={{width: '0%'}}
                  ></div>
                </div>
              </div>
            </button>

            {/*  KPI: Đã duyệt (Viền trên màu xanh success)  */}
            <button
              type="button"
              id="kpi-card-approved"
              className="text-left w-full rounded-[6px] border border-hairline border-t-2 border-t-success bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[110px] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-success/40 select-none"
            >
              <div
                className="flex items-center justify-between text-mid-gray w-full"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider"
                  >Đã duyệt</span
                >
                <svg
                  className="w-4 h-4 text-success/80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 12 2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="mt-1">
                <span
                  id="kpi-approved"
                  className="text-2xl font-bold text-success leading-none font-sans"
                  >0</span
                >
                <p className="text-[9px] text-mid-gray mt-0.5">
                  Hồ sơ đã được chấp thuận
                </p>
              </div>
              <div className="mt-2 space-y-1 w-full">
                <div
                  className="text-[9px] text-mid-gray flex justify-between select-none"
                >
                  <span id="kpi-approved-percent">Tỷ lệ duyệt: 0%</span>
                </div>
                <div
                  className="h-1 w-full bg-success-soft rounded-full overflow-hidden"
                >
                  <div
                    id="kpi-approved-bar"
                    className="h-full bg-success transition-all duration-500"
                    style={{width: '0%'}}
                  ></div>
                </div>
              </div>
            </button>

            {/*  KPI: Đã từ chối (Viền trên màu đỏ danger-brick)  */}
            <button
              type="button"
              id="kpi-card-rejected"
              className="text-left w-full rounded-[6px] border border-hairline border-t-2 border-t-danger-brick bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[110px] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-danger-brick/40 select-none"
            >
              <div
                className="flex items-center justify-between text-mid-gray w-full"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider"
                  >Đã từ chối</span
                >
                <svg
                  className="w-4 h-4 text-danger-brick/80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                  />
                </svg>
              </div>
              <div className="mt-1">
                <span
                  id="kpi-rejected"
                  className="text-2xl font-bold text-danger-brick leading-none font-sans"
                  >0</span
                >
                <p className="text-[9px] text-mid-gray mt-0.5">
                  Hồ sơ không đạt yêu cầu
                </p>
              </div>
              <div className="mt-2 space-y-1 w-full">
                <div
                  className="text-[9px] text-mid-gray flex justify-between select-none"
                >
                  <span id="kpi-rejected-percent">Tỷ lệ từ chối: 0%</span>
                </div>
                <div
                  className="h-1 w-full bg-danger-brick-soft rounded-full overflow-hidden"
                >
                  <div
                    id="kpi-rejected-bar"
                    className="h-full bg-danger-brick transition-all duration-500"
                    style={{width: '0%'}}
                  ></div>
                </div>
              </div>
            </button>
          </div>

          {/*  State: Loading KPI Skeleton  */}
          <div
            id="kpi-loading-wrapper"
            className="hidden grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <div
              className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[92px]"
            >
              <div className="h-3 w-16 bg-canvas rounded-full skeleton"></div>
              <div className="h-6 w-10 bg-canvas rounded-full skeleton"></div>
            </div>
            <div
              className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[92px]"
            >
              <div className="h-3 w-12 bg-canvas rounded-full skeleton"></div>
              <div className="h-6 w-12 bg-canvas rounded-full skeleton"></div>
            </div>
            <div
              className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[92px]"
            >
              <div className="h-3 w-16 bg-canvas rounded-full skeleton"></div>
              <div className="h-6 w-8 bg-canvas rounded-full skeleton"></div>
            </div>
            <div
              className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[92px]"
            >
              <div className="h-3 w-20 bg-canvas rounded-full skeleton"></div>
              <div className="h-6 w-10 bg-canvas rounded-full skeleton"></div>
            </div>
          </div>

          {/*  2. Tình trạng xử lý hồ sơ (Quick Insight Bar, data-source="mock")  */}
          <div
            className="rounded-[6px] border border-hairline bg-surface-alt p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:h-[96px]"
            data-source="mock"
            id="attention-panel"
          >
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-4 gap-x-5 lg:gap-x-8 flex-grow"
            >
              {/*  1. Đang chờ xử lý  */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-mid-gray">
                  <svg
                    className="w-4 h-4 text-warning shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider text-mid-gray select-none"
                    >Đang chờ xử lý</span
                  >
                </div>
                <div
                  className="text-lg font-bold text-ink mt-1 font-sans"
                  id="notice-pending-count"
                >
                  0 hồ sơ
                </div>
                <div
                  className="text-[11px] text-mid-gray mt-0.5 select-none leading-none"
                >
                  Cần Admin xem xét
                </div>
              </div>

              {/*  2. Hồ sơ mới 7 ngày  */}
              <div
                className="flex flex-col border-l-0 sm:border-l border-hairline/40 pl-0 sm:pl-5 md:pl-8 lg:pl-6"
              >
                <div className="flex items-center gap-1.5 text-mid-gray">
                  <svg
                    className="w-4 h-4 text-success shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008z"
                    />
                  </svg>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider text-mid-gray select-none"
                    >Mới 7 ngày</span
                  >
                </div>
                <div
                  className="text-lg font-bold text-ink mt-1 font-sans"
                  id="notice-new-7days-count"
                >
                  0 hồ sơ
                </div>
                <div
                  className="text-[11px] text-mid-gray mt-0.5 select-none leading-none"
                >
                  Được gửi gần đây
                </div>
              </div>

              {/*  3. Chờ lâu nhất  */}
              <div
                className="flex flex-col border-l border-hairline/40 pl-5 md:pl-8 lg:pl-6"
              >
                <div className="flex items-center gap-1.5 text-mid-gray">
                  <svg
                    className="w-4 h-4 text-warning shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                    />
                  </svg>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider text-mid-gray select-none"
                    >Chờ lâu nhất</span
                  >
                </div>
                <div
                  className="text-lg font-bold text-ink mt-1 font-sans"
                  id="notice-oldest-date"
                >
                  ---
                </div>
                <div
                  className="text-[11px] text-mid-gray mt-0.5 leading-none truncate"
                  id="notice-oldest-date-sub"
                >
                  Chưa có hồ sơ tồn đọng
                </div>
              </div>

              {/*  4. Thời gian xử lý trung bình  */}
              <div
                className="flex flex-col border-l-0 md:border-l border-hairline/40 pl-0 md:pl-8 lg:pl-6"
              >
                <div className="flex items-center gap-1.5 text-mid-gray">
                  <svg
                    className="w-4 h-4 text-success shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                    />
                  </svg>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider text-mid-gray select-none"
                    >Xử lý trung bình</span
                  >
                </div>
                <div
                  className="text-lg font-bold text-ink mt-1 font-sans"
                  id="notice-avg-process-time"
                >
                  ---
                </div>
                <div
                  className="text-[11px] text-mid-gray mt-0.5 select-none leading-none"
                >
                  Dựa trên hồ sơ đã xử lý
                </div>
              </div>

              {/*  5. Thiếu tài khoản nhận tiền  */}
              <div
                className="flex flex-col border-l border-hairline/40 pl-5 md:pl-8 lg:pl-6"
              >
                <div className="flex items-center gap-1.5 text-mid-gray">
                  <svg
                    className="w-4 h-4 text-danger-brick shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider text-mid-gray select-none font-bold"
                    >Thiếu tài khoản</span
                  >
                </div>
                <div
                  className="text-lg font-bold text-danger-brick mt-1 font-sans"
                  id="notice-no-payout-count"
                >
                  0 hồ sơ
                </div>
                <div
                  className="text-[11px] text-mid-gray mt-0.5 select-none leading-none"
                >
                  Cần bổ sung thông tin
                </div>
              </div>
            </div>

            {/*  Nút xem danh sách  */}
            <button
              type="button"
              id="btn-show-pending-only"
              className="h-9 px-4 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-1 shadow-sm shrink-0 cursor-pointer self-stretch lg:self-auto select-none"
            >
              Xem hồ sơ chờ
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>

          {/*  3. Bộ lọc & Bảng dữ liệu chung trong một Card trắng lớn  */}
          <div
            id="upgrade-list-section"
            style={{scrollMarginTop: '16px'}}
            className="rounded-[6px] border border-hairline bg-paper shadow-subtle flex flex-col overflow-hidden"
          >
            {/*  3.1. Tab Lọc Nhanh (Quick Tabs)  */}
            <div
              className="border-b border-hairline bg-surface-alt/40 flex items-center overflow-x-auto scrollbar-none"
              id="quick-tabs-container"
            >
              <button
                type="button"
                data-tab="all"
                className="px-5 py-3 text-xs font-semibold border-b-2 border-ink text-ink select-none whitespace-nowrap cursor-pointer transition-all"
              >
                Tất cả (<span className="tab-count">0</span>)
              </button>
              <button
                type="button"
                data-tab="pending"
                className="px-5 py-3 text-xs font-medium border-b-2 border-transparent text-mid-gray hover:text-ink select-none whitespace-nowrap cursor-pointer transition-all"
              >
                Chờ xử lý (<span className="tab-count">0</span>)
              </button>
              <button
                type="button"
                data-tab="approved"
                className="px-5 py-3 text-xs font-medium border-b-2 border-transparent text-mid-gray hover:text-ink select-none whitespace-nowrap cursor-pointer transition-all"
              >
                Đã duyệt (<span className="tab-count">0</span>)
              </button>
              <button
                type="button"
                data-tab="rejected"
                className="px-5 py-3 text-xs font-medium border-b-2 border-transparent text-mid-gray hover:text-ink select-none whitespace-nowrap cursor-pointer transition-all"
              >
                Đã từ chối (<span className="tab-count">0</span>)
              </button>
            </div>

            {/*  3.2. Form lọc chính (Filter Bar)  */}
            <form
              id="filter-form"
              className="p-4 border-b border-hairline bg-paper flex flex-col gap-3"
            >
              <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5"
              >
                {/*  Tìm kiếm  */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="filter-search"
                    className="text-[10px] font-bold uppercase tracking-wider text-mid-gray"
                    >Tìm kiếm</label
                  >
                  <div className="relative">
                    <input
                      type="text"
                      id="filter-search"
                      name="search"
                      placeholder="Tên, email, số điện thoại..."
                      className="w-full h-10 pl-8 pr-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink"
                    />
                    <svg
                      className="w-3.5 h-3.5 text-mid-gray/60 absolute left-3 top-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>
                </div>

                {/*  Trạng thái  */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="filter-status"
                    className="text-[10px] font-bold uppercase tracking-wider text-mid-gray"
                    >Trạng thái hồ sơ</label
                  >
                  <select
                    id="filter-status"
                    name="status"
                    data-custom-select
                    className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Đã từ chối</option>
                  </select>
                </div>

                {/*  Ngày gửi từ  */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="filter-date-from"
                    className="text-[10px] font-bold uppercase tracking-wider text-mid-gray"
                    >Từ ngày gửi</label
                  >
                  <input
                    type="date"
                    id="filter-date-from"
                    name="date_from"
                    className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-mid-gray"
                  />
                </div>

                {/*  Ngày gửi đến  */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="filter-date-to"
                    className="text-[10px] font-bold uppercase tracking-wider text-mid-gray"
                    >Đến ngày gửi</label
                  >
                  <input
                    type="date"
                    id="filter-date-to"
                    name="date_to"
                    className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-mid-gray"
                  />
                </div>

                {/*  Sắp xếp  */}
                <div className="flex flex-col gap-1.5 sm:col-span-2 md:col-span-1">
                  <label
                    htmlFor="filter-sort"
                    className="text-[10px] font-bold uppercase tracking-wider text-mid-gray"
                    >Sắp xếp theo</label
                  >
                  <select
                    id="filter-sort"
                    name="sort_by"
                    data-custom-select
                    className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink"
                  >
                    <option value="newest">Mới gửi gần đây</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="reviewed_newest">Được xử lý gần đây</option>
                    <option value="name_asc">Tên người gửi (A-Z)</option>
                    <option value="name_desc">Tên người gửi (Z-A)</option>
                  </select>
                </div>
              </div>

              {/*  Hàng button điều khiển lọc  */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  id="btn-reset-filters"
                  className="px-4 py-2 text-xs font-semibold rounded-[6px] bg-canvas text-ink hover:bg-hairline transition-all border border-hairline cursor-pointer h-10"
                >
                  Đặt lại
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer h-10"
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </form>

            {/*  3.3. Dải Filter Chips hiển thị bộ lọc đang hoạt động  */}
            <div
              id="filter-chips-container"
              className="hidden px-4 py-2 border-b border-hairline bg-surface-alt/30 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider text-mid-gray shrink-0"
                  >Đang lọc:</span
                >
                <div id="filter-chips-list" className="flex flex-wrap gap-1.5">
                  {/*  Chip elements nạp động ở đây  */}
                </div>
              </div>
              <button
                type="button"
                id="btn-clear-all-chips"
                className="btn-clear-chips-red text-[10px] font-semibold shrink-0 cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>

            {/*  3.4. Bảng danh sách dữ liệu chính  */}
            <div className="overflow-x-auto relative flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead
                  className="bg-surface-alt text-mid-gray border-b border-hairline uppercase tracking-wider font-semibold sticky top-0 z-10 text-[10px] select-none h-10"
                >
                  <tr>
                    <th className="p-3.5 pl-5 font-bold">Người đăng ký</th>
                    <th className="p-3.5 font-bold">Thông tin liên hệ</th>
                    <th className="p-3.5 font-bold">Chuyên môn</th>
                    <th className="p-3.5 font-bold">Kinh nghiệm</th>
                    <th className="p-3.5 font-bold">Tài khoản nhận tiền</th>
                    <th className="p-3.5 font-bold">Ngày gửi</th>
                    <th className="p-3.5 font-bold">Trạng thái</th>
                    <th className="p-3.5 pr-5 text-right font-bold w-20">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody
                  id="upgrades-table-body"
                  className="divide-y divide-hairline"
                >
                  {/*  Render dữ liệu dòng nạp động ở đây  */}
                </tbody>
              </table>

              {/*  3.4.1. UI State: Loading Skeleton  */}
              <div id="upgrades-loading-state" className="hidden p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full bg-canvas skeleton shrink-0"
                  ></div>
                  <div className="space-y-2 flex-grow">
                    <div className="h-3 w-1/4 bg-canvas rounded skeleton"></div>
                    <div className="h-2 w-1/3 bg-canvas rounded skeleton"></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full bg-canvas skeleton shrink-0"
                  ></div>
                  <div className="space-y-2 flex-grow">
                    <div className="h-3 w-1/5 bg-canvas rounded skeleton"></div>
                    <div className="h-2 w-1/4 bg-canvas rounded skeleton"></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full bg-canvas skeleton shrink-0"
                  ></div>
                  <div className="space-y-2 flex-grow">
                    <div className="h-3 w-1/6 bg-canvas rounded skeleton"></div>
                    <div className="h-2 w-1/5 bg-canvas rounded skeleton"></div>
                  </div>
                </div>
              </div>

              {/*  3.4.2. UI State: Empty (Không có hồ sơ nào trong hệ thống)  */}
              <div
                id="upgrades-empty-state"
                className="hidden flex-col items-center justify-center p-12 text-center space-y-3 select-none"
              >
                <svg
                  className="w-10 h-10 text-mid-gray/50 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-bold text-ink">
                    Chưa có yêu cầu lên giảng viên
                  </h4>
                  <p className="text-xs text-mid-gray mt-1">
                    Các hồ sơ đăng ký mới sẽ xuất hiện tại đây.
                  </p>
                </div>
              </div>

              {/*  3.4.3. UI State: Filter Empty (Không tìm thấy kết quả do bộ lọc)  */}
              <div
                id="upgrades-filter-empty-state"
                className="hidden flex-col items-center justify-center p-12 text-center space-y-3 select-none"
              >
                <svg
                  className="w-10 h-10 text-mid-gray/50 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-bold text-ink">
                    Không tìm thấy yêu cầu phù hợp
                  </h4>
                  <p className="text-xs text-mid-gray mt-1">
                    Không tìm thấy hồ sơ phù hợp với bộ lọc.
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-empty-reset"
                  className="h-8 px-4 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              </div>

              {/*  3.4.4. UI State: Lỗi kết nối (Error State)  */}
              <div
                id="upgrades-error-state"
                className="hidden flex-col items-center justify-center p-12 text-center space-y-3 select-none"
              >
                <svg
                  className="w-10 h-10 text-danger-brick/80 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-bold text-danger-brick">
                    Không thể tải dữ liệu
                  </h4>
                  <p className="text-xs text-mid-gray mt-1">
                    Đã có lỗi xảy ra trong quá trình kết nối dữ liệu. Vui lòng
                    thử lại.
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-error-retry"
                  className="h-8 px-4 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Thử lại
                </button>
              </div>
            </div>

            {/*  3.5. Thanh Phân trang (Pagination)  */}
            <div
              id="pagination-wrapper"
              className="px-4 py-3 bg-surface-alt/30 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 select-none"
            >
              <div className="text-xs text-mid-gray">
                Đang hiển thị
                <span id="pag-showing-range" className="font-semibold text-ink"
                  >0-0</span
                >
                trong tổng số
                <span id="pag-total-records" className="font-semibold text-ink"
                  >0</span
                >
                yêu cầu
              </div>
              <div className="flex items-center gap-4">
                {/*  Chọn số hàng hiển thị  */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-mid-gray">Hiển thị</span>
                  <select
                    id="pag-per-page"
                    data-custom-select
                    className="h-7 px-2 bg-canvas border border-hairline rounded focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink"
                  >
                    <option value="10">10</option>
                    <option value="20" selected>20</option>
                    <option value="50">50</option>
                  </select>
                  <span className="text-mid-gray">dòng</span>
                </div>
                {/*  Khung chứa các nút số trang  */}
                <div id="pagination-buttons" className="flex items-center gap-1">
                  {/*  Nạp động các nút số trang ở đây  */}
                </div>
              </div>
            </div>
          </div>
    </>
  );
}
