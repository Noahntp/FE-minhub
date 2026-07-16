
import { initPage } from '../../../assets/js/pages/withdrawals.js';
import React, { useState, useEffect } from 'react';

export default function WithdrawalsManagement() {
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
                Yêu cầu rút tiền
              </h1>
              <p className="text-xs text-mid-gray mt-0.5">
                Quản lý và xét duyệt các yêu cầu rút tiền của giảng viên.
              </p>
            </div>
          </div>

          {/*  KPI Cards  */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Chờ duyệt</span>
              </div>
              <div className="mt-2.5">
                <span id="kpi-pending-wd" className="text-[28px] lg:text-[30px] font-bold tracking-tight text-warning font-sans">0</span>
              </div>
            </div>
            
            <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Đã duyệt (Chờ chi)</span>
              </div>
              <div className="mt-2.5">
                <span id="kpi-approved-wd" className="text-[28px] lg:text-[30px] font-bold tracking-tight text-success font-sans">0</span>
              </div>
            </div>

            <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Từ chối / Hủy</span>
              </div>
              <div className="mt-2.5">
                <span id="kpi-rejected-wd" className="text-[28px] lg:text-[30px] font-bold tracking-tight text-danger-brick font-sans">0</span>
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
                  id="search-wd" 
                  placeholder="Tìm theo Giảng viên, Email..." 
                  className="w-full pl-9 pr-3 py-1.5 text-sm bg-paper border border-hairline rounded-[4px] focus:outline-none focus:border-ink transition-colors"
                />
                <svg className="w-4 h-4 text-mid-gray absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select id="filter-status-wd" className="w-full sm:w-auto px-3 py-1.5 text-sm bg-paper border border-hairline rounded-[4px] focus:outline-none focus:border-ink">
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="approved">Đã duyệt (Chờ chi)</option>
                  <option value="completed">Đã chi trả (Hoàn tất)</option>
                  <option value="rejected">Bị từ chối</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>

            {/*  Table  */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-hairline bg-surface-alt text-mid-gray font-medium">
                    <th className="px-4 py-3">Mã YC</th>
                    <th className="px-4 py-3">Giảng viên</th>
                    <th className="px-4 py-3 text-right">Số tiền rút</th>
                    <th className="px-4 py-3">Tài khoản nhận</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody id="withdrawals-tbody" className="divide-y divide-hairline">
                  {/*  JS sẽ nạp dữ liệu vào đây  */}
                </tbody>
              </table>
            </div>
            
            {/*  Empty State  */}
            <div id="withdrawals-empty" className="hidden p-8 text-center">
              <p className="text-sm text-mid-gray">Không tìm thấy yêu cầu rút tiền nào phù hợp.</p>
            </div>
          </div>
    </>
  );
}
