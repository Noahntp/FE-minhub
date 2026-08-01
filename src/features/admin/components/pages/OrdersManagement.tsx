
import { initPage } from '@/assets/js/pages/orders';
import React, { useState, useEffect } from 'react';

export default function OrdersManagement() {
  useEffect(() => {
    try {
      initPage();
    } catch (err) {
      console.error('Error initializing vanilla JS:', err);
    }
  }, []);
  return (
    <>
      {/*  Page Title & Filter Bar  */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between shrink-0">
            <div>
              <h1 className="text-[30px] lg:text-[32px] font-bold tracking-tight text-ink leading-tight">
                Quản lý Đơn hàng
              </h1>
              <p className="text-xs text-mid-gray mt-0.5">
                Theo dõi, quản lý trạng thái thanh toán và thông tin các đơn hàng khóa học.
              </p>
            </div>
          </div>

          {/*  KPI Cards  */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Tổng đơn hàng</span>
              </div>
              <div className="mt-2.5">
                <span id="kpi-total-orders" className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink font-sans">0</span>
              </div>
            </div>
            
            <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Chờ thanh toán</span>
              </div>
              <div className="mt-2.5">
                <span id="kpi-pending-orders" className="text-[28px] lg:text-[30px] font-bold tracking-tight text-warning font-sans">0</span>
              </div>
            </div>

            <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Đã thanh toán</span>
              </div>
              <div className="mt-2.5">
                <span id="kpi-paid-orders" className="text-[28px] lg:text-[30px] font-bold tracking-tight text-success font-sans">0</span>
              </div>
            </div>

            <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Thất bại / Hủy</span>
              </div>
              <div className="mt-2.5">
                <span id="kpi-failed-orders" className="text-[28px] lg:text-[30px] font-bold tracking-tight text-danger-brick font-sans">0</span>
              </div>
            </div>
          </div>

          {/*  Filters & Data Table  */}
          <div className="rounded-[6px] border border-hairline bg-paper shadow-sm overflow-hidden flex flex-col">
            {/*  Filter Bar  */}
            <div className="p-4 border-b border-hairline flex flex-col sm:flex-row gap-3 justify-between items-center bg-surface-alt/50">
              <div className="relative w-full sm:w-72">
                <input 
                  type="text" 
                  id="search-order" 
                  placeholder="Tìm theo Mã đơn, Email..." 
                  className="w-full pl-9 pr-3 py-1.5 text-sm bg-paper border border-hairline rounded-[4px] focus:outline-none focus:border-ink transition-colors"
                />
                <svg className="w-4 h-4 text-mid-gray absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select id="filter-status" className="w-full sm:w-auto px-3 py-1.5 text-sm bg-paper border border-hairline rounded-[4px] focus:outline-none focus:border-ink">
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="failed">Thất bại</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>

            {/*  Table  */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-hairline bg-surface-alt text-mid-gray font-medium">
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-4 py-3">Học viên</th>
                    <th className="px-4 py-3">Khóa học</th>
                    <th className="px-4 py-3 text-right">Số tiền</th>
                    <th className="px-4 py-3">Phương thức</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody id="orders-tbody" className="divide-y divide-hairline">
                  {/*  JS sẽ nạp dữ liệu vào đây  */}
                </tbody>
              </table>
            </div>
            
            {/*  Empty State  */}
            <div id="orders-empty" className="hidden p-8 text-center">
              <p className="text-sm text-mid-gray">Không tìm thấy đơn hàng nào phù hợp.</p>
            </div>
          </div>

          {/* Drawer chi tiết đơn hàng */}
          <div
            id="order-detail-drawer"
            className="fixed inset-0 z-50 overflow-hidden hidden"
            aria-labelledby="drawer-title"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0 bg-ink/40 backdrop-blur-xs transition-opacity duration-300 opacity-0"
              id="drawer-backdrop"
              data-drawer-close
            ></div>

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div
                className="w-screen max-w-[760px] bg-paper shadow-2xl flex flex-col h-full transform transition-transform duration-300 translate-x-full"
                id="drawer-panel"
              >
                {/* Sticky Header */}
                <div
                  className="px-5 py-4 border-b border-hairline flex items-center justify-between shrink-0 bg-paper sticky top-0 z-10"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 id="drawer-title" className="text-base font-bold text-ink">
                        Chi tiết đơn hàng
                      </h2>
                      <span
                        id="drawer-order-code"
                        className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-canvas border border-hairline text-ink"
                      >
                        ---
                      </span>
                    </div>
                    <p className="text-[11px] text-mid-gray mt-0.5" id="drawer-subtitle">
                      ---
                    </p>
                  </div>
                  <button
                    type="button"
                    data-drawer-close
                    className="rounded-full border border-hairline p-1.5 hover:bg-canvas transition-colors text-ink cursor-pointer flex items-center justify-center"
                    aria-label="Đóng chi tiết"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Drawer Navigation Tabs */}
                <div className="border-b border-hairline bg-surface-alt px-5 shrink-0">
                  <nav
                    id="drawer-tabs"
                    className="flex gap-6 text-xs font-medium text-mid-gray"
                  >
                    <button
                      type="button"
                      data-drawer-tab="overview"
                      className="py-2.5 border-b-2 border-ink text-ink font-semibold transition-all cursor-pointer bg-transparent border-none"
                    >
                      1. Tổng quan
                    </button>
                    <button
                      type="button"
                      data-drawer-tab="payment"
                      className="py-2.5 border-b-2 border-transparent hover:text-ink transition-all cursor-pointer bg-transparent border-none"
                    >
                      2. Thanh toán
                    </button>
                    <button
                      type="button"
                      data-drawer-tab="consistency"
                      className="py-2.5 border-b-2 border-transparent hover:text-ink transition-all cursor-pointer bg-transparent border-none"
                    >
                      3. Đối chiếu dữ liệu
                    </button>
                    <button
                      type="button"
                      data-drawer-tab="timeline"
                      className="py-2.5 border-b-2 border-transparent hover:text-ink transition-all cursor-pointer bg-transparent border-none"
                    >
                      4. Timeline
                    </button>
                  </nav>
                </div>

                {/* Drawer Scrollable Content Body */}
                <div
                  className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar"
                  id="drawer-content-body"
                >
                  {/* Content dynamic JS */}
                </div>

                {/* Drawer Footer */}
                <div
                  className="px-5 py-3 border-t border-hairline bg-surface-alt flex items-center justify-between shrink-0 text-xs"
                >
                  <span className="text-[11px] text-mid-gray"
                    >Trạng thái quan sát - Không thực hiện sửa đổi dữ liệu.</span
                  >
                  <button
                    type="button"
                    data-drawer-close
                    className="h-8 px-4 font-medium rounded-[6px] border border-hairline bg-paper text-ink hover:bg-canvas transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
    </>
  );
}
