
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
    </>
  );
}
