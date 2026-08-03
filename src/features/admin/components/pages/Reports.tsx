import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  TrendingUp,
  RotateCw,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  DollarSign,
  Briefcase,
  Users,
  Award,
  BookOpen,
  UserCheck,
  Percent,
  ChevronDown,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import { Chart } from 'chart.js/auto';
import { getCourses } from '@/assets/js/api/courses-api';
import { getUsers } from '@/assets/js/api/users-api';
import {
  fetchDashboardRevenue,
  fetchTopCourses,
  fetchTopInstructors
} from '@/assets/js/api/dashboard-api';
import AdminPagination from '../shared/AdminPagination';

interface CourseOption {
  id: number;
  title: string;
}

interface InstructorOption {
  id: number;
  full_name: string;
  email: string;
}

export default function Reports() {
  // Tabs state
  const [activeTab, setActiveTab] = useState<'revenue' | 'courses' | 'instructors'>('revenue');

  // Common filters state
  const [timePreset, setTimePreset] = useState('30_days');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('2026');
  const [courseId, setCourseId] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [groupBy, setGroupBy] = useState('day');

  // Dropdown options
  const [coursesOptions, setCoursesOptions] = useState<CourseOption[]>([]);
  const [instructorsOptions, setInstructorsOptions] = useState<InstructorOption[]>([]);

  // Tab 1: Revenue data
  const [revenueItems, setRevenueItems] = useState<any[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<any>({
    total_gross_amount: 0,
    total_instructor_amount: 0,
    total_platform_fee_amount: 0,
    order_count: 0,
    course_count: 0,
    instructor_count: 0,
  });
  const [allPeriods, setAllPeriods] = useState<any[]>([]);
  const [revenueMeta, setRevenueMeta] = useState<any>({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
  const [revenuePage, setRevenuePage] = useState(1);
  const [revenuePerPage, setRevenuePerPage] = useState(20);
  const [revenueSort, setRevenueSort] = useState({ sort_by: 'period', sort_direction: 'asc' });

  // Tab 2: Top Courses data
  const [coursesItems, setCoursesItems] = useState<any[]>([]);
  const [coursesSummary, setCoursesSummary] = useState<any>({
    total_courses: 0,
    total_sold: 0,
    total_revenue: 0,
    total_completed: 0,
  });
  const [coursesMeta, setCoursesMeta] = useState<any>({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
  const [coursesPage, setCoursesPage] = useState(1);
  const [coursesPerPage, setCoursesPerPage] = useState(20);
  const [coursesSort, setCoursesSort] = useState({ sort_by: 'total_revenue', sort_direction: 'desc' });

  // Tab 3: Top Instructors data
  const [instructorsItems, setInstructorsItems] = useState<any[]>([]);
  const [instructorsSummary, setInstructorsSummary] = useState<any>({
    total_instructors: 0,
    total_courses: 0,
    total_sold: 0,
    total_revenue: 0,
  });
  const [instructorsMeta, setInstructorsMeta] = useState<any>({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
  const [instructorsPage, setInstructorsPage] = useState(1);
  const [instructorsPerPage, setInstructorsPerPage] = useState(20);
  const [instructorsSort, setInstructorsSort] = useState({ sort_by: 'total_revenue', sort_direction: 'desc' });

  // Global UI states
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState('');

  // Chart ref and instance ref
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);

  // Load Dropdowns Options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [cRes, uRes] = await Promise.all([
          getCourses({ per_page: 100 }),
          getUsers({ role: 'instructor', per_page: 100 })
        ]);
        if (cRes.success) setCoursesOptions(cRes.data.items);
        if (uRes.success) setInstructorsOptions(uRes.data.items);
      } catch (err) {
        console.error('Lỗi nạp dropdown options:', err);
      }
    };
    fetchOptions();
  }, []);

  // Compute preset dates from timePreset
  const getPresetDates = (preset: string) => {
    let from = '';
    let to = '';
    // Use fixed date to simulate mock date range matching local DB
    const now = new Date('2026-08-01');
    
    if (preset === '7_days') {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      from = start.toISOString().split('T')[0];
      to = now.toISOString().split('T')[0];
    } else if (preset === '30_days') {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      from = start.toISOString().split('T')[0];
      to = now.toISOString().split('T')[0];
    } else if (preset === '3_months') {
      const start = new Date(now);
      start.setMonth(now.getMonth() - 3);
      from = start.toISOString().split('T')[0];
      to = now.toISOString().split('T')[0];
    } else if (preset === 'this_year') {
      from = `${now.getFullYear()}-01-01`;
      to = `${now.getFullYear()}-12-31`;
    }
    return { from, to };
  };

  // Synchronize preset dates when timePreset changes
  useEffect(() => {
    if (timePreset !== 'custom') {
      const { from, to } = getPresetDates(timePreset);
      setDateFrom(from);
      setDateTo(to);
    }
  }, [timePreset]);

  // Clean params helper
  const buildFetchParams = (tab: string) => {
    const params: any = {
      month: month || undefined,
      year: year || undefined,
      course_id: courseId || undefined,
    };

    if (timePreset === 'custom') {
      params.date_from = dateFrom || undefined;
      params.date_to = dateTo || undefined;
      // Do not send month/year if date range is custom to avoid validation conflicts
      params.month = undefined;
      params.year = undefined;
    } else {
      params.date_from = dateFrom || undefined;
      params.date_to = dateTo || undefined;
    }

    if (tab === 'revenue') {
      params.page = revenuePage;
      params.per_page = revenuePerPage;
      params.instructor_id = instructorId || undefined;
      params.group_by = groupBy;
      params.sort_by = revenueSort.sort_by === 'period' ? 'date' : revenueSort.sort_by;
      params.sort_direction = revenueSort.sort_direction;
    } else if (tab === 'courses') {
      params.page = coursesPage;
      params.per_page = coursesPerPage;
      params.sort_by = coursesSort.sort_by;
      params.sort_direction = coursesSort.sort_direction;
    } else if (tab === 'instructors') {
      params.page = instructorsPage;
      params.per_page = instructorsPerPage;
      params.sort_by = instructorsSort.sort_by;
      params.sort_direction = instructorsSort.sort_direction;
    }

    return params;
  };

  // Main Load Data Function
  const loadReportData = async () => {
    if (timePreset === 'custom' && dateFrom && dateTo && new Date(dateTo) < new Date(dateFrom)) {
      toast.error("'Đến ngày' phải lớn hơn hoặc bằng 'Từ ngày'. Vui lòng chọn lại.");
      return;
    }

    setIsLoading(true);
    try {
      const params = buildFetchParams(activeTab);
      
      if (activeTab === 'revenue') {
        const res = await getRevenueReport(params);
        if (res.success) {
          setRevenueItems(res.data.items);
          setRevenueSummary(res.data.summary);
          setAllPeriods(res.data.all_periods || res.data.items);
          setRevenueMeta(res.meta);
        } else {
          toast.error(res.message || 'Lỗi tải báo cáo doanh thu.');
        }
      } else if (activeTab === 'courses') {
        const res = await getTopCoursesReport(params);
        if (res.success) {
          setCoursesItems(res.data.items);
          setCoursesSummary(res.data.summary);
          setCoursesMeta(res.meta);
        } else {
          toast.error(res.message || 'Lỗi tải báo cáo khóa học.');
        }
      } else if (activeTab === 'instructors') {
        const res = await getTopInstructorsReport(params);
        if (res.success) {
          setInstructorsItems(res.data.items);
          if (res.data.summary) {
            setInstructorsSummary(res.data.summary);
          } else {
            const totalInstructors = res.meta?.total || res.data.items?.length || 0;
            const totalCourses = res.data.items?.reduce((sum: number, item: any) => sum + (item.total_courses || 0), 0) || 0;
            const totalSold = res.data.items?.reduce((sum: number, item: any) => sum + (item.total_sold || 0), 0) || 0;
            const totalRevenue = res.data.items?.reduce((sum: number, item: any) => sum + Number(item.total_revenue || 0), 0) || 0;
            setInstructorsSummary({
              total_instructors: totalInstructors,
              total_courses: totalCourses,
              total_sold: totalSold,
              total_revenue: totalRevenue
            });
          }
          setInstructorsMeta(res.meta);
        } else {
          toast.error(res.message || 'Lỗi tải báo cáo giảng viên.');
        }
      }

      setLastUpdateTime(
        new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi kết nối lấy dữ liệu báo cáo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load when active tab or filters or sorting or pages update
  useEffect(() => {
    loadReportData();
  }, [
    activeTab,
    timePreset,
    dateFrom,
    dateTo,
    month,
    year,
    courseId,
    instructorId,
    groupBy,
    revenuePage,
    revenuePerPage,
    revenueSort,
    coursesPage,
    coursesPerPage,
    coursesSort,
    instructorsPage,
    instructorsPerPage,
    instructorsSort,
  ]);

  // Chart Rendering Logic
  useEffect(() => {
    if (activeTab !== 'revenue' || !chartCanvasRef.current || allPeriods.length === 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      return;
    }

    const ctx = chartCanvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const labels = allPeriods.map((d: any) => d.period);
    const grossValues = allPeriods.map((d: any) => Number(d.gross_amount));
    const instructorValues = allPeriods.map((d: any) => Number(d.instructor_amount));
    const platformValues = allPeriods.map((d: any) => Number(d.platform_fee_amount));

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Tổng doanh thu',
            data: grossValues,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            borderWidth: 2.5,
            tension: 0.35,
            fill: true,
            pointRadius: labels.length > 50 ? 0 : 3,
            pointHoverRadius: 6,
          },
          {
            label: 'Thu nhập giảng viên',
            data: instructorValues,
            borderColor: '#3b82f6',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [4, 4],
            tension: 0.35,
            fill: false,
            pointRadius: labels.length > 50 ? 0 : 3,
            pointHoverRadius: 6,
          },
          {
            label: 'Phí nền tảng',
            data: platformValues,
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [2, 2],
            tension: 0.35,
            fill: false,
            pointRadius: labels.length > 50 ? 0 : 3,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#111827',
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function (context: any) {
                const label = context.dataset.label || '';
                const val = context.parsed.y;
                return `${label}: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 }, color: '#6b7280' },
          },
          y: {
            grid: { color: '#f3f4f6' },
            ticks: {
              font: { size: 10 },
              color: '#6b7280',
              callback: function (value: any) {
                if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                return value;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [allPeriods, activeTab]);

  // Formatter Helpers
  const formatMoney = (value: number | string) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Reset Filters
  const hasActiveFilters = Boolean(
    dateFrom ||
    dateTo ||
    month ||
    courseId ||
    (instructorId && activeTab === 'revenue') ||
    timePreset === 'custom'
  );

  const handleResetFilters = () => {
    setTimePreset('30_days');
    setMonth('');
    setYear('2026');
    setCourseId('');
    setInstructorId('');
    setGroupBy('day');
    setRevenuePage(1);
    setCoursesPage(1);
    setInstructorsPage(1);
  };

  // Sort Table Columns Handler
  const handleSort = (tab: 'revenue' | 'courses' | 'instructors', column: string) => {
    if (tab === 'revenue') {
      const isAsc = revenueSort.sort_by === column && revenueSort.sort_direction === 'asc';
      setRevenueSort({
        sort_by: column,
        sort_direction: isAsc ? 'desc' : 'asc',
      });
      setRevenuePage(1);
    } else if (tab === 'courses') {
      const isAsc = coursesSort.sort_by === column && coursesSort.sort_direction === 'asc';
      setCoursesSort({
        sort_by: column,
        sort_direction: isAsc ? 'desc' : 'asc',
      });
      setCoursesPage(1);
    } else if (tab === 'instructors') {
      const isAsc = instructorsSort.sort_by === column && instructorsSort.sort_direction === 'asc';
      setInstructorsSort({
        sort_by: column,
        sort_direction: isAsc ? 'desc' : 'asc',
      });
      setInstructorsPage(1);
    }
  };

  // KPI Calculations Rates
  const getRate = (num: number, denom: number) => {
    if (denom <= 0) return '0.0';
    return ((num / denom) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen text-ink pb-12">
      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-mid-gray">
              <span>Admin</span>
              <span>&gt;</span>
              <span className="text-ink">Báo cáo và thống kê</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-ink">Báo cáo và thống kê</h1>
            <p className="text-xs text-mid-gray mt-1">
              Theo dõi doanh thu, hiệu quả khóa học và hoạt động của giảng viên.
            </p>
          </div>
          <button
            onClick={() => loadReportData()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-hairline bg-paper shadow-sm hover:bg-canvas-alt active:scale-[0.98] transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới báo cáo
          </button>
        </div>

        {lastUpdateTime && (
          <span className="text-[10px] text-mid-gray italic">
            Cập nhật lần cuối lúc: {lastUpdateTime}
          </span>
        )}
      </div>

      {/* TABS CONTAINER CONTROLS */}
      <div className="flex items-center justify-between border-b border-hairline mt-6 pb-px overflow-x-auto gap-8 select-none">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`report-tab-btn pb-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'revenue'
                ? 'border-ink text-ink font-bold'
                : 'border-transparent text-mid-gray hover:text-ink'
            }`}
          >
            Doanh thu &amp; Chia sẻ
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`report-tab-btn pb-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'courses'
                ? 'border-ink text-ink font-bold'
                : 'border-transparent text-mid-gray hover:text-ink'
            }`}
          >
            Khóa học nổi bật
          </button>
          <button
            onClick={() => setActiveTab('instructors')}
            className={`report-tab-btn pb-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'instructors'
                ? 'border-ink text-ink font-bold'
                : 'border-transparent text-mid-gray hover:text-ink'
            }`}
          >
            Giảng viên nổi bật
          </button>
        </div>
      </div>

      {/* FILTER BAR PANEL */}
      <section className="rounded-2xl border border-hairline bg-paper shadow-sm p-5 mt-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xs font-bold text-mid-gray tracking-wider uppercase">BỘ LỌC DÙNG CHUNG</h3>
          <button
            id="btn-reset-filters"
            disabled={!hasActiveFilters}
            onClick={handleResetFilters}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all active:scale-[0.98] ${
              hasActiveFilters
                ? 'text-rose-600 border-rose-200 bg-rose-50/20 hover:bg-rose-50/40 cursor-pointer'
                : 'text-mid-gray border-hairline bg-paper opacity-50 cursor-not-allowed'
            }`}
          >
            Xóa bộ lọc
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
          {/* Time Preset */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">KHOẢNG THỜI GIAN</span>
            <select
              value={timePreset}
              onChange={(e) => setTimePreset(e.target.value)}
              className="px-3 py-2 rounded-xl border border-hairline bg-paper focus:outline-none focus:ring-1 focus:ring-ink"
            >
              <option value="30_days">30 ngày qua</option>
              <option value="7_days">7 ngày qua</option>
              <option value="3_months">3 tháng qua</option>
              <option value="this_year">Năm nay</option>
              <option value="custom">Tùy chọn ngày</option>
            </select>
          </div>

          {/* Date From (Custom only) */}
          {timePreset === 'custom' && (
            <div className="flex flex-col gap-1.5" id="wrapper-date-from">
              <span className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">TỪ NGÀY</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 rounded-xl border border-hairline bg-paper focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>
          )}

          {/* Date To (Custom only) */}
          {timePreset === 'custom' && (
            <div className="flex flex-col gap-1.5" id="wrapper-date-to">
              <span className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">ĐẾN NGÀY</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 rounded-xl border border-hairline bg-paper focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>
          )}

          {/* Month Filter */}
          {timePreset !== 'custom' && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">THÁNG</span>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="px-3 py-2 rounded-xl border border-hairline bg-paper focus:outline-none focus:ring-1 focus:ring-ink"
              >
                <option value="">Tất cả tháng</option>
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Year Filter */}
          {timePreset !== 'custom' && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">NĂM</span>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="px-3 py-2 rounded-xl border border-hairline bg-paper focus:outline-none focus:ring-1 focus:ring-ink"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          )}

          {/* Course filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">KHÓA HỌC</span>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-hairline bg-paper focus:outline-none focus:ring-1 focus:ring-ink"
            >
              <option value="">Tất cả khóa học</option>
              {coursesOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Instructor filter (Revenue tab only) */}
          {activeTab === 'revenue' && (
            <div className="flex flex-col gap-1.5" id="wrapper-filter-instructor">
              <span className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">GIẢNG VIÊN</span>
              <select
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-hairline bg-paper focus:outline-none focus:ring-1 focus:ring-ink"
              >
                <option value="">Tất cả giảng viên</option>
                {instructorsOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Group By Filter (Revenue tab only) */}
          {activeTab === 'revenue' && (
            <div className="flex flex-col gap-1.5" id="wrapper-filter-group-by">
              <span className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">NHÓM THEO</span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="px-3 py-2 rounded-xl border border-hairline bg-paper focus:outline-none focus:ring-1 focus:ring-ink"
              >
                <option value="day">Theo ngày</option>
                <option value="month">Theo tháng</option>
              </select>
            </div>
          )}
        </div>
      </section>

      {/* MAIN REPORT TABS PANELS CONTENT */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-ink" />
          <span className="text-xs font-semibold text-mid-gray">Đang tải dữ liệu báo cáo...</span>
        </div>
      )}

      {!isLoading && (
        <div className="mt-8">
          {/* TAB 1: REVENUE REPORT PANEL */}
          {activeTab === 'revenue' && (
            <div id="tab-panel-revenue" className="report-tab-panel space-y-8">
              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-mid-gray tracking-wider uppercase">TỔNG DOANH THU</p>
                  <span className="text-2xl font-black text-emerald-600 block mt-1.5">
                    {formatMoney(revenueSummary.total_gross_amount)}
                  </span>
                  <p className="text-[10px] text-mid-gray mt-2">Tổng thu từ các đơn hàng thành công</p>
                </div>

                <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-mid-gray tracking-wider uppercase">THU NHẬP GIẢNG VIÊN</p>
                  <span className="text-2xl font-black text-blue-600 block mt-1.5">
                    {formatMoney(revenueSummary.total_instructor_amount)}
                  </span>
                  <p className="text-[10px] text-mid-gray mt-2">
                    Tỷ lệ thực nhận: {getRate(Number(revenueSummary.total_instructor_amount), Number(revenueSummary.total_gross_amount))}%
                  </p>
                </div>

                <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-mid-gray tracking-wider uppercase">PHÍ NỀN TẢNG</p>
                  <span className="text-2xl font-black text-amber-600 block mt-1.5">
                    {formatMoney(revenueSummary.total_platform_fee_amount)}
                  </span>
                  <p className="text-[10px] text-mid-gray mt-2">
                    Phí giữ lại: {getRate(Number(revenueSummary.total_platform_fee_amount), Number(revenueSummary.total_gross_amount))}%
                  </p>
                </div>

                <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-mid-gray tracking-wider uppercase">TỔNG ĐƠN HÀNG</p>
                  <span className="text-2xl font-black text-ink block mt-1.5">
                    {revenueSummary.order_count} đơn
                  </span>
                  <p className="text-[10px] text-mid-gray mt-2">
                    {revenueSummary.course_count} khóa học • {revenueSummary.instructor_count} giảng viên
                  </p>
                </div>
              </div>

              {/* Chart section */}
              <div className="rounded-3xl border border-hairline bg-paper p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4 select-none">
                  <div>
                    <h3 className="text-sm font-bold text-ink">Biểu đồ xu hướng doanh thu</h3>
                    <p className="text-xs text-mid-gray mt-0.5">So sánh Tổng doanh thu, Thu nhập giảng viên và Phí nền tảng theo thời gian</p>
                  </div>
                  {/* Legend indicator */}
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                      Tổng doanh thu
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                      Thu nhập GV
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                      Phí nền tảng
                    </span>
                  </div>
                </div>

                {allPeriods.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-mid-gray font-medium text-xs">
                    Chưa có đủ số liệu biểu diễn trong khoảng này.
                  </div>
                ) : (
                  <div className="relative w-full h-[280px]">
                    <canvas ref={chartCanvasRef} id="revenue-chart-canvas"></canvas>
                  </div>
                )}
              </div>

              {/* Table section */}
              <div className="rounded-3xl border border-hairline bg-paper shadow-sm overflow-hidden">
                <div className="p-6 border-b border-hairline flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-ink">Chi tiết báo cáo theo kỳ</h3>
                    <p className="text-xs text-mid-gray mt-0.5">Danh sách phân bổ doanh thu theo từng mốc thời gian</p>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-mid-gray">Hiển thị:</span>
                      <select
                        value={revenuePerPage}
                        onChange={(e) => {
                          setRevenuePerPage(Number(e.target.value));
                          setRevenuePage(1);
                        }}
                        className="px-2 py-1 rounded-lg border border-hairline bg-paper"
                      >
                        <option value="10">10 / trang</option>
                        <option value="20">20 / trang</option>
                        <option value="50">50 / trang</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-canvas text-mid-gray border-b border-hairline uppercase font-bold tracking-wider select-none">
                        <th
                          onClick={() => handleSort('revenue', 'period')}
                          className="py-3 px-6 cursor-pointer hover:bg-canvas-alt/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            Giai đoạn
                            <ArrowUpDown className="w-3.5 h-3.5 text-mid-gray" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('revenue', 'gross_amount')}
                          className="py-3 px-4 text-right cursor-pointer hover:bg-canvas-alt/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 justify-end">
                            Tổng doanh thu
                            <ArrowUpDown className="w-3.5 h-3.5 text-mid-gray" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('revenue', 'instructor_amount')}
                          className="py-3 px-4 text-right cursor-pointer hover:bg-canvas-alt/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 justify-end">
                            Thu nhập GV
                            <ArrowUpDown className="w-3.5 h-3.5 text-mid-gray" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('revenue', 'platform_fee_amount')}
                          className="py-3 px-4 text-right cursor-pointer hover:bg-canvas-alt/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 justify-end">
                            Phí nền tảng
                            <ArrowUpDown className="w-3.5 h-3.5 text-mid-gray" />
                          </div>
                        </th>
                        <th className="py-3 px-4 text-center">Tỷ lệ phân bổ</th>
                        <th className="py-3 px-4 text-right">Số đơn hàng</th>
                        <th className="py-3 px-4 text-right">Khóa học</th>
                        <th className="py-3 px-6 text-right">Giảng viên</th>
                      </tr>
                    </thead>
                    <tbody id="revenue-table-body">
                      {revenueItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-10 text-center text-mid-gray font-medium">
                            Không có dữ liệu doanh thu trong khoảng thời gian đã chọn
                          </td>
                        </tr>
                      ) : (
                        revenueItems.map((row: any, idx: number) => {
                          const gross = Number(row.gross_amount);
                          const instr = Number(row.instructor_amount);
                          const plat = Number(row.platform_fee_amount);
                          const iRate = gross > 0 ? Math.round((instr / gross) * 100) : 0;
                          const pRate = gross > 0 ? Math.round((plat / gross) * 100) : 0;

                          return (
                            <tr key={idx} className="border-b border-hairline/80 hover:bg-canvas-alt/30 transition-colors">
                              <td className="py-3 px-6 font-semibold text-ink">{row.period}</td>
                              <td className="py-3 px-4 text-right font-medium text-emerald-600">{formatMoney(gross)}</td>
                              <td className="py-3 px-4 text-right font-medium text-blue-600">{formatMoney(instr)}</td>
                              <td className="py-3 px-4 text-right font-medium text-amber-600">{formatMoney(plat)}</td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5 select-none">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                                    {iRate}% GV
                                  </span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                                    {pRate}% NT
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right font-medium tabular-nums">{row.order_count}</td>
                              <td className="py-3 px-4 text-right text-mid-gray tabular-nums">{row.course_count}</td>
                              <td className="py-3 px-6 text-right text-mid-gray tabular-nums">{row.instructor_count}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <AdminPagination
                  currentPage={revenuePage}
                  perPage={revenuePerPage}
                  total={revenueMeta.total}
                  onPageChange={setRevenuePage}
                  onPerPageChange={(pp) => {
                    setRevenuePerPage(pp);
                    setRevenuePage(1);
                  }}
                  itemLabel="bản ghi"
                />
              </div>
            </div>
          )}

          {/* TAB 2: TOP COURSES PANEL */}
          {activeTab === 'courses' && (
            <div id="tab-panel-courses" className="report-tab-panel space-y-8">
              {/* Cards block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-mid-gray tracking-wider uppercase">TỔNG KHÓA HỌC CÓ DỮ LIỆU</p>
                  <span className="text-2xl font-black text-ink block mt-1.5" id="kpi-courses-count">
                    {coursesSummary.total_courses} khóa
                  </span>
                </div>

                <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-mid-gray tracking-wider uppercase">TỔNG ĐÃ BÁN</p>
                  <span className="text-2xl font-black text-blue-600 block mt-1.5" id="kpi-courses-sold">
                    {coursesSummary.total_sold} lượt
                  </span>
                </div>

                <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-mid-gray tracking-wider uppercase">DOANH THU KHÓA HỌC</p>
                  <span className="text-2xl font-black text-emerald-600 block mt-1.5" id="kpi-courses-revenue">
                    {formatMoney(coursesSummary.total_revenue)}
                  </span>
                </div>

                <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-mid-gray tracking-wider uppercase">HOÀN THÀNH KHÓA HỌC</p>
                  <span className="text-2xl font-black text-amber-600 block mt-1.5" id="kpi-courses-completed">
                    {coursesSummary.total_completed} học viên
                  </span>
                </div>
              </div>

              {/* Table top courses */}
              <div className="rounded-3xl border border-hairline bg-paper shadow-sm overflow-hidden">
                <div className="p-6 border-b border-hairline flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-ink">Bảng xếp hạng khóa học nổi bật</h3>
                    <p className="text-xs text-mid-gray mt-0.5">Top khóa học có doanh thu và tỷ lệ hoàn thành cao nhất</p>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-mid-gray">Hiển thị:</span>
                      <select
                        value={coursesPerPage}
                        onChange={(e) => {
                          setCoursesPerPage(Number(e.target.value));
                          setCoursesPage(1);
                        }}
                        className="px-2 py-1 rounded-lg border border-hairline bg-paper"
                      >
                        <option value="10">10 / trang</option>
                        <option value="20">20 / trang</option>
                        <option value="50">50 / trang</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-canvas text-mid-gray border-b border-hairline uppercase font-bold tracking-wider select-none">
                        <th className="py-3 px-4 text-center w-16">Hạng</th>
                        <th className="py-3 px-4 min-w-[200px]">Khóa học</th>
                        <th className="py-3 px-4">Giảng viên</th>
                        <th
                          onClick={() => handleSort('courses', 'sold_count')}
                          className="py-3 px-4 text-right cursor-pointer hover:bg-canvas-alt/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 justify-end">
                            Đã bán
                            <ArrowUpDown className="w-3.5 h-3.5 text-mid-gray" />
                          </div>
                        </th>
                        <th className="py-3 px-4 text-right">Ghi danh</th>
                        <th className="py-3 px-4 text-right">Hoàn thành</th>
                        <th
                          onClick={() => handleSort('courses', 'completion_rate')}
                          className="py-3 px-4 text-center cursor-pointer hover:bg-canvas-alt/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 justify-center">
                            Tỷ lệ hoàn thành
                            <ArrowUpDown className="w-3.5 h-3.5 text-mid-gray" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('courses', 'total_revenue')}
                          className="py-3 px-4 text-right cursor-pointer hover:bg-canvas-alt/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 justify-end">
                            Tổng doanh thu
                            <ArrowUpDown className="w-3.5 h-3.5 text-mid-gray" />
                          </div>
                        </th>
                        <th className="py-3 px-6 text-right">Mới nhất</th>
                      </tr>
                    </thead>
                    <tbody id="courses-table-body">
                      {coursesItems.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-10 text-center text-mid-gray font-medium">
                            Không tìm thấy khóa học nào phù hợp với bộ lọc
                          </td>
                        </tr>
                      ) : (
                        coursesItems.map((item: any, idx: number) => {
                          const rank = (coursesPage - 1) * coursesPerPage + idx + 1;
                          let rankBadge = (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold bg-canvas text-mid-gray">
                              #{rank}
                            </span>
                          );
                          if (rank === 1) {
                            rankBadge = (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                #1
                              </span>
                            );
                          } else if (rank === 2) {
                            rankBadge = (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
                                #2
                              </span>
                            );
                          } else if (rank === 3) {
                            rankBadge = (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                #3
                              </span>
                            );
                          }

                          return (
                            <tr
                              key={item.course_id}
                              className="border-b border-hairline/80 hover:bg-canvas-alt/30 transition-colors"
                            >
                              <td className="py-3.5 px-4 text-center">{rankBadge}</td>
                              <td className="py-3.5 px-4">
                                <div className="flex flex-col">
                                  <a
                                    href={`/admin/courses?open_course_id=${item.course_id}`}
                                    className="font-semibold text-ink hover:text-blue-600 transition-colors"
                                  >
                                    {item.title}
                                  </a>
                                  <span className="text-[10px] text-mid-gray mt-0.5 font-mono">ID: #{item.course_id}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                {item.instructor ? (
                                  <a
                                    href={`/admin/users?open_user_id=${item.instructor.id}`}
                                    className="font-medium text-ink hover:text-blue-600 transition-colors"
                                  >
                                    {item.instructor.full_name}
                                  </a>
                                ) : (
                                  <span className="text-mid-gray">---</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-right font-medium tabular-nums">{item.sold_count}</td>
                              <td className="py-3.5 px-4 text-right text-mid-gray tabular-nums">{item.enrollment_count}</td>
                              <td className="py-3.5 px-4 text-right text-mid-gray tabular-nums">{item.completed_count}</td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center gap-2 justify-center select-none">
                                  <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.completion_rate}%` }}></div>
                                  </div>
                                  <span className="text-[11px] font-bold text-ink">{item.completion_rate}%</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right font-semibold text-emerald-600 tabular-nums">
                                {formatMoney(item.total_revenue)}
                              </td>
                              <td className="py-3.5 px-6 text-right text-mid-gray">
                                {item.last_paid_at ? new Date(item.last_paid_at).toLocaleDateString('vi-VN') : '---'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <AdminPagination
                  currentPage={coursesPage}
                  perPage={coursesPerPage}
                  total={coursesMeta.total}
                  onPageChange={setCoursesPage}
                  onPerPageChange={(pp) => {
                    setCoursesPerPage(pp);
                    setCoursesPage(1);
                  }}
                  itemLabel="khóa học"
                />
              </div>
            </div>
          )}

          {/* TAB 3: TOP INSTRUCTORS PANEL */}
          {activeTab === 'instructors' && (
            <div id="tab-panel-instructors" className="report-tab-panel space-y-8">
              {/* Cards block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-mid-gray tracking-wider uppercase">TỔNG GIẢNG VIÊN</p>
                  <span className="text-2xl font-black text-ink block mt-1.5" id="kpi-instructors-count">
                    {instructorsSummary.total_instructors} giảng viên
                  </span>
                </div>

                <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-mid-gray tracking-wider uppercase">TỔNG KHÓA HỌC ĐÃ MỞ</p>
                  <span className="text-2xl font-black text-blue-600 block mt-1.5" id="kpi-instructors-courses">
                    {instructorsSummary.total_courses} khóa
                  </span>
                </div>

                <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-mid-gray tracking-wider uppercase">TỔNG ĐƠN HÀNG TẠO RA</p>
                  <span className="text-2xl font-black text-amber-600 block mt-1.5" id="kpi-instructors-sold">
                    {instructorsSummary.total_sold} đơn
                  </span>
                </div>

                <div className="rounded-2xl border border-hairline bg-paper p-5 shadow-sm">
                  <p className="text-[10px] font-bold text-mid-gray tracking-wider uppercase">TỔNG DOANH THU TẠO RA</p>
                  <span className="text-2xl font-black text-emerald-600 block mt-1.5" id="kpi-instructors-revenue">
                    {formatMoney(instructorsSummary.total_revenue)}
                  </span>
                </div>
              </div>

              {/* Table top instructors */}
              <div className="rounded-3xl border border-hairline bg-paper shadow-sm overflow-hidden">
                <div className="p-6 border-b border-hairline flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-ink">Bảng xếp hạng giảng viên nổi bật</h3>
                    <p className="text-xs text-mid-gray mt-0.5">Top giảng viên có số lượng học viên và doanh thu dẫn đầu</p>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-mid-gray">Hiển thị:</span>
                      <select
                        value={instructorsPerPage}
                        onChange={(e) => {
                          setInstructorsPerPage(Number(e.target.value));
                          setInstructorsPage(1);
                        }}
                        className="px-2 py-1 rounded-lg border border-hairline bg-paper"
                      >
                        <option value="10">10 / trang</option>
                        <option value="20">20 / trang</option>
                        <option value="50">50 / trang</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-canvas text-mid-gray border-b border-hairline uppercase font-bold tracking-wider select-none">
                        <th className="py-3 px-4 text-center w-16">Hạng</th>
                        <th className="py-3 px-4 min-w-[200px]">Giảng viên</th>
                        <th className="py-3 px-4 text-right">Khóa học</th>
                        <th
                          onClick={() => handleSort('instructors', 'total_sold')}
                          className="py-3 px-4 text-right cursor-pointer hover:bg-canvas-alt/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 justify-end">
                            Đã bán
                            <ArrowUpDown className="w-3.5 h-3.5 text-mid-gray" />
                          </div>
                        </th>
                        <th className="py-3 px-4 text-right">Ghi danh</th>
                        <th className="py-3 px-4 text-right">Hoàn thành</th>
                        <th
                          onClick={() => handleSort('instructors', 'completion_rate')}
                          className="py-3 px-4 text-center cursor-pointer hover:bg-canvas-alt/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 justify-center">
                            Tỷ lệ hoàn thành
                            <ArrowUpDown className="w-3.5 h-3.5 text-mid-gray" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('instructors', 'total_revenue')}
                          className="py-3 px-4 text-right cursor-pointer hover:bg-canvas-alt/50 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 justify-end">
                            Tổng doanh thu
                            <ArrowUpDown className="w-3.5 h-3.5 text-mid-gray" />
                          </div>
                        </th>
                        <th className="py-3 px-4 text-right">Thu nhập GV</th>
                        <th className="py-3 px-6 text-right">Hoạt động mới nhất</th>
                      </tr>
                    </thead>
                    <tbody id="instructors-table-body">
                      {instructorsItems.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-10 text-center text-mid-gray font-medium">
                            Không tìm thấy giảng viên nào phù hợp
                          </td>
                        </tr>
                      ) : (
                        instructorsItems.map((item: any, idx: number) => {
                          const rank = (instructorsPage - 1) * instructorsPerPage + idx + 1;
                          let rankBadge = (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold bg-canvas text-mid-gray">
                              #{rank}
                            </span>
                          );
                          if (rank === 1) {
                            rankBadge = (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                #1
                              </span>
                            );
                          } else if (rank === 2) {
                            rankBadge = (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
                                #2
                              </span>
                            );
                          } else if (rank === 3) {
                            rankBadge = (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                #3
                              </span>
                            );
                          }

                          return (
                            <tr
                              key={item.instructor_id}
                              className="border-b border-hairline/80 hover:bg-canvas-alt/30 transition-colors"
                            >
                              <td className="py-3.5 px-4 text-center">{rankBadge}</td>
                              <td className="py-3.5 px-4">
                                <div className="flex flex-col">
                                  <a
                                    href={`/admin/users?open_user_id=${item.instructor_id}`}
                                    className="font-semibold text-ink hover:text-blue-600 transition-colors"
                                  >
                                    {item.full_name}
                                  </a>
                                  <span className="text-[10px] text-mid-gray mt-0.5 font-mono">ID: #{item.instructor_id} • {item.email}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right font-medium tabular-nums">{item.total_courses}</td>
                              <td className="py-3.5 px-4 text-right font-medium tabular-nums">{item.total_sold}</td>
                              <td className="py-3.5 px-4 text-right text-mid-gray tabular-nums">{item.total_enrollments}</td>
                              <td className="py-3.5 px-4 text-right text-mid-gray tabular-nums">{item.total_completed}</td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center gap-2 justify-center select-none">
                                  <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.completion_rate}%` }}></div>
                                  </div>
                                  <span className="text-[11px] font-bold text-ink">{item.completion_rate}%</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right font-semibold text-emerald-600 tabular-nums">
                                {formatMoney(item.total_revenue)}
                              </td>
                              <td className="py-3.5 px-4 text-right font-semibold text-blue-600 tabular-nums">
                                {formatMoney(item.instructor_amount)}
                              </td>
                              <td className="py-3.5 px-6 text-right text-mid-gray">
                                {item.last_activity_at ? new Date(item.last_activity_at).toLocaleDateString('vi-VN') : '---'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <AdminPagination
                  currentPage={instructorsPage}
                  perPage={instructorsPerPage}
                  total={instructorsMeta.total}
                  onPageChange={setInstructorsPage}
                  onPerPageChange={(pp) => {
                    setInstructorsPerPage(pp);
                    setInstructorsPage(1);
                  }}
                  itemLabel="giảng viên"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
