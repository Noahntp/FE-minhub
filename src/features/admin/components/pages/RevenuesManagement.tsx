
import { initPage } from '@/assets/js/pages/revenues';
import React, { useState, useEffect } from 'react';

export default function RevenuesManagement() {
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
                Thống kê Doanh thu
              </h1>
              <p className="text-xs text-mid-gray mt-0.5">
                Xem tổng quan tài chính, doanh thu bán khóa học và phí nền tảng thu được.
              </p>
            </div>
            {/*  Date Filters  */}
            <div className="flex items-center gap-0.5 p-1 bg-paper border border-hairline rounded-full shadow-sm select-none">
                <button type="button" className="px-3.5 py-1.5 text-xs font-medium rounded-full bg-ink text-white transition-colors shadow-sm">
                  30 ngày qua
                </button>
                <button type="button" className="px-3.5 py-1.5 text-xs font-medium rounded-full text-mid-gray hover:text-ink transition-colors bg-transparent">
                  Năm nay
                </button>
            </div>
          </div>

          {/*  KPI Cards  */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-[6px] border border-hairline bg-paper p-5 shadow-subtle relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-5">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </div>
              <div className="relative z-10">
                <span className="text-xs font-bold text-mid-gray uppercase tracking-wider">Doanh thu gộp (Gross)</span>
                <div className="mt-3">
                  <span id="kpi-gross" className="text-[32px] font-bold tracking-tight text-ink font-sans">0đ</span>
                </div>
                <p className="text-xs text-mid-gray mt-2">Tổng số tiền khách hàng đã thanh toán</p>
              </div>
            </div>
            
            <div className="rounded-[6px] border border-hairline bg-paper p-5 shadow-subtle">
              <span className="text-xs font-bold text-mid-gray uppercase tracking-wider">Thu nhập giảng viên</span>
              <div className="mt-3">
                <span id="kpi-instructor" className="text-[32px] font-bold tracking-tight text-success font-sans">0đ</span>
              </div>
              <p className="text-xs text-mid-gray mt-2">Phần chia sẻ doanh thu cho giảng viên</p>
            </div>

            <div className="rounded-[6px] border border-hairline bg-paper p-5 shadow-subtle">
              <span className="text-xs font-bold text-mid-gray uppercase tracking-wider">Phí nền tảng (MindHub)</span>
              <div className="mt-3">
                <span id="kpi-platform" className="text-[32px] font-bold tracking-tight text-ink font-sans">0đ</span>
              </div>
              <p className="text-xs text-mid-gray mt-2">Lợi nhuận gộp của MindHub (Net Revenue)</p>
            </div>
          </div>

          {/*  Chart Area  */}
          <div className="rounded-[6px] border border-border-strong bg-paper p-5 shadow-sm">
            <div className="border-l-3 border-ink pl-2.5 mb-4">
              <h2 className="text-sm font-semibold text-ink leading-snug">Biểu đồ Tăng trưởng Doanh thu</h2>
              <p className="text-[11px] text-mid-gray mt-0.5">So sánh Doanh thu gộp và Phí nền tảng qua các ngày</p>
            </div>
            <div className="h-72 w-full relative">
              <canvas id="revenue-chart-canvas"></canvas>
            </div>
          </div>

          {/*  Data Table  */}
          <div className="rounded-[6px] border border-hairline bg-paper shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-hairline bg-surface-alt/50">
              <h2 className="text-sm font-semibold text-ink">Chi tiết doanh thu theo khóa học</h2>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-hairline bg-surface-alt text-mid-gray font-medium">
                    <th className="px-4 py-3">Khóa học</th>
                    <th className="px-4 py-3">Giảng viên</th>
                    <th className="px-4 py-3 text-right">Đã bán</th>
                    <th className="px-4 py-3 text-right">Doanh thu gộp</th>
                    <th className="px-4 py-3 text-right">Thu nhập GV</th>
                    <th className="px-4 py-3 text-right">Phí nền tảng</th>
                  </tr>
                </thead>
                <tbody id="revenues-tbody" className="divide-y divide-hairline">
                  {/*  JS sẽ nạp dữ liệu vào đây  */}
                </tbody>
              </table>
            </div>
          </div>
    </>
  );
}
