
import { initPage } from '@/assets/js/pages/dashboard';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const mockChartData = [
  { name: 'Tháng 1', DoanhThu: 4000, Phi: 2400 },
  { name: 'Tháng 2', DoanhThu: 3000, Phi: 1398 },
  { name: 'Tháng 3', DoanhThu: 2000, Phi: 9800 },
  { name: 'Tháng 4', DoanhThu: 2780, Phi: 3908 },
  { name: 'Tháng 5', DoanhThu: 1890, Phi: 4800 },
  { name: 'Tháng 6', DoanhThu: 2390, Phi: 3800 },
  { name: 'Tháng 7', DoanhThu: 3490, Phi: 4300 },
];

const mockCourseStatus = [
  { name: 'Đã xuất bản', value: 407 },
  { name: 'Bản nháp', value: 33 },
  { name: 'Chờ duyệt', value: 12 },
];
const COURSE_COLORS = ['#10B981', '#9CA3AF', '#F59E0B'];

const mockUserRoles = [
  { name: 'Học viên', value: 12119 },
  { name: 'Giảng viên', value: 2139 },
];
const USER_COLORS = ['#111827', '#6B7280'];

export default function DashboardOverview() {
  useEffect(() => {
    try {
      initPage();
    } catch (err) {
      console.error('Error initializing vanilla JS:', err);
    }
  }, []);
  const [activeFilter, setActiveFilter] = useState('7days');
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);

  const getBtnClass = (filter: string) => 
    activeFilter === filter 
      ? "px-3.5 py-1.5 text-xs font-medium rounded-full bg-ink text-white transition-colors shadow-sm cursor-pointer"
      : "px-3.5 py-1.5 text-xs font-medium rounded-full text-mid-gray hover:text-ink transition-colors bg-transparent cursor-pointer";

  return (
    <>
      {/*  Page Title & Filter Bar  */}
          <div
            className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between shrink-0"
          >
            <div>
              <h1
                className="text-[30px] lg:text-[32px] font-bold tracking-tight text-ink leading-tight"
              >
                Dashboard Tổng quan
              </h1>
              <p className="text-xs text-mid-gray mt-0.5">
                Báo cáo hiệu suất hoạt động và kinh doanh hệ thống MindHub.
              </p>
            </div>
            {/*  Time & Custom Date Filters  */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {/*  Presets  */}
              <div
                className="flex items-center gap-0.5 p-1 bg-paper border border-hairline rounded-full shadow-sm select-none"
              >
                <button
                  type="button"
                  data-filter="7days"
                  onClick={() => { setActiveFilter('7days'); setIsCustomDateOpen(false); }}
                  className={getBtnClass('7days')}
                >
                  7 ngày qua
                </button>
                <button
                  type="button"
                  data-filter="30days"
                  onClick={() => { setActiveFilter('30days'); setIsCustomDateOpen(false); }}
                  className={getBtnClass('30days')}
                >
                  30 ngày qua
                </button>
                <button
                  type="button"
                  data-filter="thisMonth"
                  onClick={() => { setActiveFilter('thisMonth'); setIsCustomDateOpen(false); }}
                  className={getBtnClass('thisMonth')}
                >
                  Tháng này
                </button>
                <button
                  type="button"
                  data-filter="thisYear"
                  onClick={() => { setActiveFilter('thisYear'); setIsCustomDateOpen(false); }}
                  className={getBtnClass('thisYear')}
                >
                  Năm nay
                </button>
                <button
                  type="button"
                  data-filter="custom"
                  onClick={() => { setActiveFilter('custom'); setIsCustomDateOpen(true); }}
                  className={getBtnClass('custom')}
                >
                  Tùy chọn
                </button>
              </div>
              {/*  Custom date range  */}
              <div
                id="custom-date-container"
                className={`${isCustomDateOpen ? 'flex' : 'hidden'} items-center justify-center gap-6 p-1 px-4 bg-paper border border-hairline rounded-full shadow-sm text-xs text-mid-gray w-[430px] shrink-0`}
              >
                <input
                  type="date"
                  id="custom-date-from"
                  className="bg-transparent border-none text-ink focus:outline-none text-xs w-[100px]"
                  aria-label="Từ ngày"
                />
                <span>đến</span>
                <input
                  type="date"
                  id="custom-date-to"
                  className="bg-transparent border-none text-ink focus:outline-none text-xs w-[100px]"
                  aria-label="Đến ngày"
                />
                <button
                  type="button"
                  id="apply-custom-date"
                  className="px-3.5 py-1 bg-ink text-white rounded-full text-[10px] font-medium hover:opacity-90 transition-opacity"
                >
                  Lọc
                </button>
                <button
                  type="button"
                  id="close-custom-date"
                  onClick={() => setIsCustomDateOpen(false)}
                  className="p-1 hover:bg-canvas rounded-full transition-colors cursor-pointer"
                  aria-label="Đóng bộ lọc"
                >
                  <svg
                    className="w-3 h-3 text-mid-gray hover:text-ink"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
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
            </div>
          </div>

          {/*  ==================== WRAPPER 1: LOADED CONTENT ====================  */}
          <div id="dashboard-content-wrapper" className="space-y-4">
            {/*  1. KPI chính (Row 1 - 4 Cards, bo góc 6px, padding p-4, gap-3)  */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/*  KPI: Tổng người dùng  */}
              <a
                href="#"
                className="block rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle hover:border-mid-gray/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold text-mid-gray uppercase tracking-wider"
                    >Tổng người dùng</span
                  >
                  <div className="text-ink shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span
                    id="kpi-total-users"
                    className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-none font-sans"
                    >14,258</span
                  >
                </div>
                {/*  Progress Bar học viên / giảng viên  */}
                <div className="w-full bg-canvas h-1 rounded-full mt-2.5 overflow-hidden flex">
                  <div id="kpi-users-bar-learner" className="bg-ink h-full rounded-l-full" style={{width: '85%'}}></div>
                  <div id="kpi-users-bar-instructor" className="bg-mid-gray h-full rounded-r-full" style={{width: '15%'}}></div>
                </div>
                <p id="kpi-users-sub" className="mt-2 text-xs text-mid-gray">
                  12,119 học viên • 2,139 giảng viên
                </p>
              </a>

              {/*  KPI: Tổng khóa học  */}
              <a
                href="#"
                className="block rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle hover:border-mid-gray/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold text-mid-gray uppercase tracking-wider"
                    >Tổng khóa học</span
                  >
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      id="kpi-courses-pending"
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-warning-soft text-warning border border-warning/10"
                      >12 chờ duyệt</span
                    >
                    <div className="text-ink">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span
                    id="kpi-total-courses"
                    className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-none font-sans"
                    >452</span
                  >
                </div>
                {/*  Progress Bar đã xuất bản / tổng số  */}
                <div className="w-full bg-canvas h-1 rounded-full mt-2.5 overflow-hidden">
                  <div id="kpi-courses-bar-published" className="bg-success h-full rounded-full" style={{width: '90%'}}></div>
                </div>
                <p id="kpi-courses-sub" className="mt-2 text-xs text-mid-gray">
                  407 đã xuất bản
                </p>
              </a>

              {/*  KPI: Tổng lượt ghi danh  */}
              <div
                className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold text-mid-gray uppercase tracking-wider"
                    >Tổng lượt ghi danh</span
                  >
                  <div className="text-ink shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span
                    id="kpi-total-enrollments"
                    className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-none font-sans"
                    >18,590</span
                  >
                </div>
                {/*  Progress Bar tỷ lệ hoàn thành  */}
                <div className="w-full bg-canvas h-1 rounded-full mt-2.5 overflow-hidden">
                  <div id="kpi-enrollments-bar-completed" className="bg-success h-full rounded-full" style={{width: '64%'}}></div>
                </div>
                <p id="kpi-enrollments-sub" className="mt-2 text-xs text-mid-gray">
                  11,897 hoàn thành • Tỉ lệ 64%
                </p>
              </div>

              {/*  KPI: Tổng đơn hàng  */}
              <a
                href="orders.html"
                className="block rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle hover:border-mid-gray/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold text-mid-gray uppercase tracking-wider"
                    >Tổng đơn hàng</span
                  >
                  <div className="text-ink shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span
                    id="kpi-total-orders"
                    className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-none font-sans"
                    >9,420</span
                  >
                </div>
                {/*  Progress Bar tỷ lệ đơn hàng đã thanh toán  */}
                <div className="w-full bg-canvas h-1 rounded-full mt-2.5 overflow-hidden">
                  <div id="kpi-orders-bar-paid" className="bg-success h-full rounded-full" style={{width: '95%'}}></div>
                </div>
                <p id="kpi-orders-sub" className="mt-2 text-xs text-mid-gray">
                  8,949 đã thanh toán
                </p>
              </a>
            </div>

            {/*  2. KPI tài chính phụ (6 Cards, thiết kế compact, bo góc 6px, padding px-4 py-3)  */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/*  Doanh thu gộp  */}
              <div
                className="rounded-[6px] border border-hairline bg-paper p-3.5 shadow-subtle flex flex-col justify-between min-h-[96px]"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold text-mid-gray uppercase tracking-wider"
                    >Doanh thu gộp</span
                  >
                  <div className="text-success shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306 8.9-8.91M22.5 9.75V2.25h-7.5" />
                    </svg>
                  </div>
                </div>
                <p
                  id="kpi-gross-revenue"
                  className="text-base md:text-[17px] font-bold text-ink mt-2.5 font-sans"
                >
                  2.4B đ
                </p>
              </div>

              {/*  Thu nhập giảng viên  */}
              <div
                className="rounded-[6px] border border-hairline bg-paper p-3.5 shadow-subtle flex flex-col justify-between min-h-[96px]"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold text-mid-gray uppercase tracking-wider"
                    >Thu nhập giảng viên</span
                  >
                  <div className="text-mid-gray shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                </div>
                <p
                  id="kpi-instructor-earnings"
                  className="text-base md:text-[17px] font-bold text-ink mt-2.5 font-sans"
                >
                  1.9B đ
                </p>
              </div>

              {/*  Phí nền tảng  */}
              <div
                className="rounded-[6px] border border-hairline bg-paper p-3.5 shadow-subtle flex flex-col justify-between min-h-[96px]"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold text-mid-gray uppercase tracking-wider"
                    >Phí nền tảng</span
                  >
                  <div className="text-mid-gray shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3 3m12 12V19.5M15 15h4.5m-4.5 0 6 6" />
                    </svg>
                  </div>
                </div>
                <p
                  id="kpi-platform-fee"
                  className="text-base md:text-[17px] font-bold text-ink mt-2.5 font-sans"
                >
                  500M đ
                </p>
              </div>

              {/*  Rút tiền chờ duyệt  */}
              <a
                href="withdrawals.html"
                className="block rounded-[6px] border border-hairline bg-paper p-3.5 shadow-subtle hover:border-mid-gray/40 transition-all group flex flex-col justify-between min-h-[96px]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">
                    Chờ duyệt rút
                    <span id="kpi-withdrawal-pending-count" className="text-warning font-bold font-sans ml-0.5"></span>
                  </h3>
                  <div className="text-warning shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 flex flex-col">
                  <p
                    id="kpi-withdrawal-pending-amount"
                    className="text-base md:text-[17px] font-bold text-ink font-sans leading-tight"
                  >
                    45M đ
                  </p>
                  <span id="kpi-withdrawal-pending-sub" className="text-[9px] text-warning mt-1 leading-tight font-medium">
                    12 yêu cầu đang chờ duyệt
                  </span>
                </div>
              </a>

              {/*  Đã duyệt chờ chi  */}
              <a
                href="withdrawals.html"
                className="block rounded-[6px] border border-hairline bg-paper p-3.5 shadow-subtle hover:border-mid-gray/40 transition-all group flex flex-col justify-between min-h-[96px]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">
                    Chờ thanh toán
                    <span id="kpi-withdrawal-approved-count" className="text-danger-brick font-bold font-sans ml-0.5"></span>
                  </h3>
                  <div className="text-danger-brick shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 flex flex-col">
                  <p
                    id="kpi-withdrawal-approved-amount"
                    className="text-base md:text-[17px] font-bold text-ink font-sans leading-tight"
                  >
                    12M đ
                  </p>
                  <span id="kpi-withdrawal-approved-sub" className="text-[9px] text-danger-brick mt-1 leading-tight font-medium">
                    4 yêu cầu đã duyệt, chờ chi
                  </span>
                </div>
              </a>

              {/*  Đã thanh toán cho GV  */}
              <a
                href="withdrawals.html"
                className="block rounded-[6px] border border-hairline bg-paper p-3.5 shadow-subtle hover:border-mid-gray/40 transition-all group flex flex-col justify-between min-h-[96px]"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold text-mid-gray uppercase tracking-wider"
                    >Đã chi trả giảng viên</span
                  >
                  <div className="text-success shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                </div>
                <p
                  id="kpi-withdrawal-paid-amount"
                  className="text-base md:text-[17px] font-bold text-ink mt-2.5 font-sans"
                >
                  1.84B đ
                </p>
              </a>
            </div>

            {/*  3. Panel Trạng thái khóa học & Trạng thái người dùng  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/*  Phân bổ trạng thái khóa học  */}
              <div
                id="course-status-panel"
                className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col gap-3 min-h-[340px]"
              >
                <div className="border-l-3 border-ink pl-2.5 mb-2.5">
                  <h2 className="text-sm font-semibold text-ink leading-snug">Cơ cấu khóa học</h2>
                </div>
                <div className="flex-1 min-h-[250px] w-full">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={mockCourseStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {mockCourseStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COURSE_COLORS[index % COURSE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/*  Trạng thái người dùng  */}
              <div
                id="user-status-panel"
                className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col gap-3 min-h-[340px]"
              >
                <div className="border-l-3 border-ink pl-2.5 mb-2.5">
                  <h2 className="text-sm font-semibold text-ink leading-snug">Cơ cấu người dùng</h2>
                </div>
                <div className="flex-1 min-h-[250px] w-full">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={mockUserRoles}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {mockUserRoles.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={USER_COLORS[index % USER_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/*  4. Khu vực biểu đồ & Công việc (Row 3 - Grid 2/3 và 1/3, bo góc 6px, padding p-4, gap-3.5)  */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/*  Khung biểu đồ  */}
              <div
                className="rounded-[6px] border border-border-strong bg-paper p-4 shadow-sm lg:col-span-2 flex flex-col justify-between relative"
              >
                <div className="border-l-3 border-success pl-2.5 mb-2.5">
                  <h2 className="text-sm font-semibold text-ink leading-snug">
                    Biểu đồ Doanh thu & Phí nền tảng
                  </h2>
                  <p className="text-[11px] text-mid-gray mt-0.5 leading-normal">
                    Xu hướng biến động tài chính theo bộ lọc thời gian
                  </p>
                </div>

                {/*  Vùng vẽ biểu đồ  */}
                <div className="mt-3.5 h-60 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dx={-10} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }} />
                      <Line type="monotone" dataKey="DoanhThu" stroke="#101828" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="Phi" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/*  Khung công việc cần xử lý  */}
              <div
                className="rounded-[6px] border border-border-strong bg-paper p-4 shadow-sm flex flex-col"
              >
                <div className="border-l-3 border-warning pl-2.5 mb-2.5">
                  <h2 className="text-sm font-semibold text-ink leading-snug">Công việc cần xử lý</h2>
                  <p className="text-[11px] text-mid-gray mt-0.5 leading-normal">
                    Các nhiệm vụ đang chờ quản trị viên phản hồi
                  </p>
                </div>

                {/*  Actions container  */}
                <div
                  id="actions-container"
                  className="mt-3.5 space-y-2 flex-1 overflow-y-auto max-h-60 custom-scrollbar pr-1"
                >
                  <div className="p-3 bg-red-50/50 border border-ember/20 rounded-[6px]">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-semibold text-ember">Yêu cầu rút tiền mới</h4>
                      <span className="text-[10px] text-mid-gray">10 phút trước</span>
                    </div>
                    <p className="text-[11px] text-red-700/80 mt-1">Giảng viên <strong>Nguyen Van A</strong> yêu cầu rút 12,000,000đ.</p>
                  </div>
                  <div className="p-3 bg-warning-soft/50 border border-warning/20 rounded-[6px]">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-semibold text-warning-dark">Khóa học chờ duyệt</h4>
                      <span className="text-[10px] text-mid-gray">2 giờ trước</span>
                    </div>
                    <p className="text-[11px] text-warning-dark/80 mt-1">Khóa học "Lập trình React Native" cần được kiểm duyệt.</p>
                  </div>
                </div>
              </div>
            </div>

            {/*  5. Rankings & Timeline (Row 4 - Grid 3 Cột, bo góc 6px, padding p-4, gap-3.5)  */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/*  Cột 1: Xếp hạng khóa học  */}
              <div
                className="rounded-[6px] border border-border-strong bg-paper p-4 shadow-sm flex flex-col"
              >
                <div className="border-l-3 border-success pl-2.5 mb-2.5">
                  <h2 className="text-sm font-semibold text-ink leading-snug">
                    Top khóa học tiêu biểu
                  </h2>
                  <p className="text-[11px] text-mid-gray mt-0.5 leading-normal">
                    Xếp hạng theo tổng doanh thu bán khóa học
                  </p>
                </div>
                <div
                  className="mt-2.5 overflow-x-auto flex-1 max-h-80 custom-scrollbar pr-1"
                >
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr
                        className="border-b border-hairline text-mid-gray font-medium"
                      >
                        <th className="pb-1.5 w-6">#</th>
                        <th className="pb-1.5">Khóa học</th>
                        <th className="pb-1.5 text-right">Lượt bán</th>
                        <th className="pb-1.5 text-right">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody
                      id="top-selling-courses-container"
                      className="divide-y divide-hairline"
                    >
                      <tr className="hover:bg-canvas transition-colors">
                        <td className="py-2.5 font-semibold text-ink">1</td>
                        <td className="py-2.5">
                          <p className="font-semibold text-ink truncate w-[160px]">Khóa học Lập trình Frontend</p>
                          <p className="text-[10px] text-mid-gray">Giảng viên: Trần Bình</p>
                        </td>
                        <td className="py-2.5 text-right font-medium text-ink">1,204</td>
                        <td className="py-2.5 text-right font-semibold text-success">1.4B đ</td>
                      </tr>
                      <tr className="hover:bg-canvas transition-colors">
                        <td className="py-2.5 font-semibold text-ink">2</td>
                        <td className="py-2.5">
                          <p className="font-semibold text-ink truncate w-[160px]">Làm chủ Photoshop CC 2024</p>
                          <p className="text-[10px] text-mid-gray">Giảng viên: Lê Mai</p>
                        </td>
                        <td className="py-2.5 text-right font-medium text-ink">854</td>
                        <td className="py-2.5 text-right font-semibold text-success">850M đ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/*  Cột 2: Giảng viên doanh thu cao  */}
              <div
                className="rounded-[6px] border border-border-strong bg-paper p-4 shadow-sm flex flex-col"
              >
                <div className="border-l-3 border-ink pl-2.5 mb-2.5">
                  <h2 className="text-sm font-semibold text-ink leading-snug">Giảng viên nổi bật</h2>
                  <p className="text-[11px] text-mid-gray mt-0.5 leading-normal">
                    Xếp hạng theo doanh thu gộp nhận được
                  </p>
                </div>
                <div
                  className="mt-2.5 overflow-x-auto flex-1 max-h-80 custom-scrollbar pr-1"
                >
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr
                        className="border-b border-hairline text-mid-gray font-medium"
                      >
                        <th className="pb-1.5">Giảng viên</th>
                        <th className="pb-1.5 text-right">Khóa học</th>
                        <th className="pb-1.5 text-right">Thu nhập giảng viên</th>
                      </tr>
                    </thead>
                    <tbody
                      id="top-instructors-container"
                      className="divide-y divide-hairline"
                    >
                      <tr className="hover:bg-canvas transition-colors">
                        <td className="py-2.5 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">TB</div>
                          <span className="font-semibold text-ink">Trần Bình</span>
                        </td>
                        <td className="py-2.5 text-right text-ink">4</td>
                        <td className="py-2.5 text-right font-semibold text-success">2.1B đ</td>
                      </tr>
                      <tr className="hover:bg-canvas transition-colors">
                        <td className="py-2.5 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-700">LM</div>
                          <span className="font-semibold text-ink">Lê Mai</span>
                        </td>
                        <td className="py-2.5 text-right text-ink">2</td>
                        <td className="py-2.5 text-right font-semibold text-success">1.5B đ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/*  Cột 3: Hoạt động gần đây (Tách 2 Tabs)  */}
              <div
                className="rounded-[6px] border border-border-strong bg-paper p-4 shadow-sm flex flex-col h-full"
              >
                <div
                  className="flex items-center justify-between border-b border-hairline pb-2 mb-3"
                >
                  <div className="border-l-3 border-mid-gray pl-2.5">
                    <h2 className="text-sm font-semibold text-ink leading-snug">Dữ liệu gần đây</h2>
                    <p className="text-[10px] text-mid-gray mt-0.5 leading-tight">Đơn hàng và khóa học mới</p>
                  </div>
                  <div
                    className="flex gap-1 p-0.5 bg-canvas rounded-full text-[10px] font-semibold border border-hairline select-none"
                  >
                    <button
                      type="button"
                      id="tab-btn-orders"
                      className="px-2.5 py-1 rounded-full bg-paper text-ink shadow-sm transition-all"
                    >
                      Đơn hàng
                    </button>
                    <button
                      type="button"
                      id="tab-btn-courses"
                      className="px-2.5 py-1 rounded-full text-mid-gray hover:text-ink bg-transparent transition-all"
                    >
                      Khóa học
                    </button>
                  </div>
                </div>

                {/*  Timeline container cho Đơn hàng gần đây  */}
                <div
                  id="recent-orders-container"
                  className="space-y-3 flex-1 overflow-y-auto max-h-64 custom-scrollbar pr-1 hidden"
                >
                </div>
                <div
                    id="recent-activities-container"
                    className="mt-3 overflow-y-auto flex-1 max-h-80 custom-scrollbar pr-1 space-y-2.5"
                  >
                    <div className="flex items-start gap-2.5 pb-2.5 border-b border-hairline/50">
                      <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <div>
                        <p className="text-[11px] text-ink leading-snug">Đơn hàng <strong>#ORD-0921</strong> đã thanh toán thành công (1.200.000đ).</p>
                        <p className="text-[10px] text-mid-gray mt-0.5">5 phút trước</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 pb-2.5 border-b border-hairline/50">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <div>
                        <p className="text-[11px] text-ink leading-snug">Người dùng mới <strong>Phạm Tuấn</strong> vừa đăng ký.</p>
                        <p className="text-[10px] text-mid-gray mt-0.5">12 phút trước</p>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            {/*  6. Widget Kiểm tra hệ thống Toast (radius 6px, p-4)  */}
            <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-ink">Hệ thống thông báo Toast (Tester)</h2>
                  <p className="text-[11px] text-mid-gray mt-0.5">
                    Click vào các nút dưới đây để mô phỏng và kiểm tra hiển thị của Toast thông báo.
                  </p>
                </div>
                {/*  4 nút test  */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    id="btn-test-toast-success"
                    className="px-3 py-1.5 text-xs font-semibold rounded-full bg-success-soft text-success hover:bg-success hover:text-white border border-success/10 transition-all cursor-pointer"
                  >
                    Thử Success
                  </button>
                  <button
                    type="button"
                    id="btn-test-toast-error"
                    className="px-3 py-1.5 text-xs font-semibold rounded-full bg-danger-brick-soft text-danger-brick hover:bg-danger-brick hover:text-white border border-danger-brick/10 transition-all cursor-pointer"
                  >
                    Thử Error
                  </button>
                  <button
                    type="button"
                    id="btn-test-toast-warning"
                    className="px-3 py-1.5 text-xs font-semibold rounded-full bg-warning-soft text-warning hover:bg-warning hover:text-white border border-warning/10 transition-all cursor-pointer"
                  >
                    Thử Warning
                  </button>
                  <button
                    type="button"
                    id="btn-test-toast-info"
                    className="px-3 py-1.5 text-xs font-semibold rounded-full bg-canvas text-ink hover:bg-ink hover:text-white border border-hairline transition-all cursor-pointer"
                  >
                    Thử Info
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/*  ==================== WRAPPER 2: LOADING SKELETON (bo góc 6px, padding p-4, gap-3.5) ====================  */}
          <div id="dashboard-loading-wrapper" className="hidden space-y-4">
            {/*  KPI Row 1 Loading  */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div
                className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3"
              >
                <div className="h-3.5 w-28 bg-canvas rounded-full skeleton"></div>
                <div className="h-8 w-20 bg-canvas rounded-full skeleton"></div>
                <div className="h-3 w-36 bg-canvas rounded-full skeleton"></div>
              </div>
              <div
                className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3"
              >
                <div className="h-3.5 w-24 bg-canvas rounded-full skeleton"></div>
                <div className="h-8 w-16 bg-canvas rounded-full skeleton"></div>
                <div className="h-3 w-32 bg-canvas rounded-full skeleton"></div>
              </div>
              <div
                className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3"
              >
                <div className="h-3.5 w-28 bg-canvas rounded-full skeleton"></div>
                <div className="h-8 w-24 bg-canvas rounded-full skeleton"></div>
                <div className="h-3 w-36 bg-canvas rounded-full skeleton"></div>
              </div>
              <div
                className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3"
              >
                <div className="h-3.5 w-26 bg-canvas rounded-full skeleton"></div>
                <div className="h-8 w-32 bg-canvas rounded-full skeleton"></div>
                <div className="h-3 w-24 bg-canvas rounded-full skeleton"></div>
              </div>
            </div>
            {/*  Financial KPIs Loading  */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div
                className="rounded-[6px] border border-hairline bg-paper p-3 space-y-2 skeleton"
              >
                <div className="h-2 w-16 bg-canvas rounded-full"></div>
                <div className="h-4 w-20 bg-canvas rounded-full"></div>
              </div>
              <div
                className="rounded-[6px] border border-hairline bg-paper p-3 space-y-2 skeleton"
              >
                <div className="h-2 w-16 bg-canvas rounded-full"></div>
                <div className="h-4 w-20 bg-canvas rounded-full"></div>
              </div>
              <div
                className="rounded-[6px] border border-hairline bg-paper p-3 space-y-2 skeleton"
              >
                <div className="h-2 w-16 bg-canvas rounded-full"></div>
                <div className="h-4 w-20 bg-canvas rounded-full"></div>
              </div>
              <div
                className="rounded-[6px] border border-hairline bg-paper p-3 space-y-2 skeleton"
              >
                <div className="h-2 w-16 bg-canvas rounded-full"></div>
                <div className="h-4 w-20 bg-canvas rounded-full"></div>
              </div>
              <div
                className="rounded-[6px] border border-hairline bg-paper p-3 space-y-2 skeleton"
              >
                <div className="h-2 w-16 bg-canvas rounded-full"></div>
                <div className="h-4 w-20 bg-canvas rounded-full"></div>
              </div>
              <div
                className="rounded-[6px] border border-hairline bg-paper p-3 space-y-2 skeleton"
              >
                <div className="h-2 w-16 bg-canvas rounded-full"></div>
                <div className="h-4 w-20 bg-canvas rounded-full"></div>
              </div>
            </div>
          </div>

          {/*  ==================== WRAPPER 3: EMPTY STATE (bo góc 6px, padding p-8) ====================  */}
          <div
            id="dashboard-empty-wrapper"
            className="hidden rounded-[6px] border border-hairline bg-paper p-8 text-center shadow-subtle"
          >
            <div
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-mid-gray"
            >
              <svg
                className="w-5 h-5"
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
            </div>
            <h3 className="mt-3.5 text-sm font-semibold text-ink">
              Không có dữ liệu
            </h3>
            <p className="mt-1.5 text-xs text-mid-gray max-w-sm mx-auto">
              Không tìm thấy thông tin hoặc hoạt động nào trong khoảng thời gian
              này. Vui lòng chọn một khoảng thời gian khác hoặc kiểm tra lại
              sau.
            </p>
          </div>

          {/*  ==================== WRAPPER 4: ERROR STATE (bo góc 6px, padding p-6) ====================  */}
          <div
            id="dashboard-error-wrapper"
            className="hidden rounded-[6px] border border-ember/25 bg-red-50/50 p-6 text-center shadow-subtle border-dashed"
          >
            <div
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-ember"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="mt-3.5 text-sm font-semibold text-ember">
              Lỗi kết nối dữ liệu
            </h3>
            <p className="mt-1.5 text-xs text-red-700 max-w-sm mx-auto">
              Đã xảy ra sự cố khi tải dữ liệu từ API giả lập. Vui lòng kiểm tra
              lại kết nối máy chủ.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 inline-flex h-8 items-center rounded-full bg-ink px-4 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Thử lại
            </button>
          </div>

          {/*  ==================== WRAPPER 5: FORBIDDEN STATE (bo góc 6px, padding p-6) ====================  */}
          <div
            id="dashboard-forbidden-wrapper"
            className="hidden rounded-[6px] border border-ember/25 bg-red-50/50 p-6 text-center shadow-subtle border-dashed"
          >
            <div
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-ember"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="mt-3.5 text-sm font-semibold text-ember">
              Truy cập bị từ chối (403 Forbidden)
            </h3>
            <p className="mt-1.5 text-xs text-red-700 max-w-sm mx-auto">
              Tài khoản quản trị của bạn không có đủ quyền hạn để truy cập thông
              tin bảng điều khiển tổng quan này.
            </p>
            <a
              href="../index.html"
              className="mt-3 inline-flex h-8 items-center rounded-full bg-ink px-4 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
              >Quay về trang chủ</a
            >
          </div>
    </>
  );
}
