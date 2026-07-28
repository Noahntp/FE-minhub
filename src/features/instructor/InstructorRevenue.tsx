import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ApiService } from '@/services/api';
import { 
  Search, Activity, DollarSign, ChevronLeft, ChevronRight, X, 
  TrendingUp, Calendar, BookOpen, Clock, AlertCircle, Sparkles, Loader2, ArrowRight,
  TrendingDown, Percent, Award, Info, BarChart2, Download, RefreshCw, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';

interface InstructorRevenueProps {
  instructorId?: string;
  courses?: any[];
}

interface RevenueFilters {
  preset: 'day' | 'month' | 'year' | 'custom';
  dateFrom: string;
  dateTo: string;
  courseId: string | number | null;
  status: string | null;
  page: number;
  perPage: number;
  metric: 'gross_revenue' | 'instructor_revenue';
}

const DONUT_COLORS = ['#3b82f6', '#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];

// Custom lightweight SearchParams hook
function useCustomSearchParams() {
  const [search, setSearch] = useState(() => window.location.search);

  useEffect(() => {
    const handlePopState = () => setSearch(window.location.search);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  const setSearchParams = useCallback((params: URLSearchParams) => {
    const newSearch = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.pushState(null, '', newSearch);
    setSearch(params.toString() ? `?${params.toString()}` : '');
  }, []);

  return [searchParams, setSearchParams] as const;
}

// Build unified query parameters helper
function buildRevenueQueryParams(filters: Partial<RevenueFilters>) {
  const params: Record<string, string | number> = {};
  if (filters.preset) params.preset = filters.preset;
  if (filters.dateFrom) params.date_from = filters.dateFrom;
  if (filters.dateTo) params.date_to = filters.dateTo;
  if (filters.courseId && filters.courseId !== 'all') params.course_id = filters.courseId;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.page) params.page = filters.page;
  if (filters.perPage) params.per_page = filters.perPage;
  if (filters.metric) params.metric = filters.metric;
  return params;
}

// Helper percentage comparison formatter
function formatComparisonPercent(
  value: number | null | undefined,
  current: number,
  previous: number
): { text: string; label: string; isPositive: boolean } {
  if (current === 0 && previous === 0) {
    return { text: 'Không đổi', label: 'so với kỳ trước', isPositive: true };
  }
  if (previous === 0 && current > 0) {
    return { text: 'Mới', label: 'so với kỳ trước', isPositive: true };
  }
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return { text: '—', label: 'so với kỳ trước', isPositive: true };
  }
  const sign = value > 0 ? '+' : '';
  return {
    text: `${sign}${Math.round(value * 10) / 10}%`,
    label: 'so với kỳ trước',
    isPositive: value >= 0
  };
}

// Helper percentage round
function round(val: number, decimals: number) {
  return Number(Math.round(Number(val + 'e' + decimals)) + 'e-' + decimals);
}

export const InstructorRevenue: React.FC<InstructorRevenueProps> = ({ instructorId, courses }) => {
  const [searchParams, setSearchParams] = useCustomSearchParams();

  // URL sync parameters
  const filters: RevenueFilters = useMemo(() => ({
    preset: (searchParams.get('preset') as any) || 'month',
    dateFrom: searchParams.get('date_from') || '',
    dateTo: searchParams.get('date_to') || '',
    courseId: searchParams.get('course_id') || null,
    status: searchParams.get('status') || null,
    page: parseInt(searchParams.get('page') || '1', 10),
    perPage: parseInt(searchParams.get('per_page') || '5', 10),
    metric: (searchParams.get('metric') as any) || 'instructor_revenue',
  }), [searchParams]);

  // Component States
  const [summaryData, setSummaryData] = useState<any>(null);
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [enrollmentChartData, setEnrollmentChartData] = useState<any[]>([]);
  const [topCoursesData, setTopCoursesData] = useState<any[]>([]);
  const [courseBreakdownData, setCourseBreakdownData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0, per_page: 5 });

  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);

  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [chartsError, setChartsError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Helper to update URL params
  const updateUrlParams = useCallback((newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  }, [setSearchParams]);

  // Unified API Data Fetching using Promise.allSettled
  const fetchAllData = useCallback(async () => {
    setLoadingSummary(true);
    setLoadingCharts(true);
    setLoadingTable(true);
    setSummaryError(null);
    setChartsError(null);
    setTableError(null);

    const queryApiParams = buildRevenueQueryParams(filters);

    const [summaryResult, chartResult, enrollmentResult, topResult, breakdownResult, detailsResult] = await Promise.allSettled([
      ApiService.getInstructorRevenueSummary(queryApiParams),
      ApiService.getInstructorRevenueChart(queryApiParams),
      ApiService.getInstructorEnrollmentChart(queryApiParams),
      ApiService.getInstructorTopCourses({ ...queryApiParams, limit: 5 }),
      ApiService.getInstructorRevenueCourseBreakdown(queryApiParams),
      ApiService.getInstructorRevenueDetails(queryApiParams),
    ]);

    // 1. Process Summary Result
    if (summaryResult.status === 'fulfilled') {
      const res: any = summaryResult.value;
      const dataObj = res?.data?.overview ? res.data : (res?.overview ? res : (res?.data || res));
      if (dataObj && typeof dataObj === 'object' && (dataObj.overview || dataObj.gross_revenue !== undefined)) {
        setSummaryData(dataObj);
      } else {
        setSummaryData(dataObj || null);
      }
    } else {
      console.error('Summary API Error:', summaryResult.reason);
      setSummaryError('Không thể tải chỉ số tổng quan.');
      setSummaryData(null);
    }
    setLoadingSummary(false);

    // 2. Process Charts Results
    if (chartResult.status === 'fulfilled') {
      const revPoints = (chartResult.value as any)?.data || chartResult.value || [];
      if (Array.isArray(revPoints)) {
        setRevenueChartData(revPoints.map((item: any) => ({
          date: item.period || item.date || item.label,
          gross: parseFloat(item.gross_amount || item.gross || 0),
          instructor: parseFloat(item.instructor_amount || item.instructor || 0),
        })));
      }
    }

    if (enrollmentResult.status === 'fulfilled') {
      const enrPoints = (enrollmentResult.value as any)?.data || enrollmentResult.value || [];
      if (Array.isArray(enrPoints)) {
        setEnrollmentChartData(enrPoints.map((item: any) => ({
          date: item.period || item.date || item.label,
          enrollments: parseInt(item.enrollment_count || item.enrollments || item.value || 0, 10),
        })));
      }
    }

    if (topResult.status === 'fulfilled') {
      const topItems = (topResult.value as any)?.data || topResult.value || [];
      if (Array.isArray(topItems)) {
        setTopCoursesData(topItems.map((item: any, idx: number) => ({
          rank: idx + 1,
          title: item.title || item.course_title || 'Khóa học',
          revenue: parseFloat(filters.metric === 'gross_revenue' ? (item.gross_amount || 0) : (item.instructor_amount || item.revenue || 0)),
          students: parseInt(item.total_orders || item.enrollment_count || item.students || 0, 10),
          color: DONUT_COLORS[idx % DONUT_COLORS.length],
        })));
      }
    }

    if (breakdownResult.status === 'fulfilled') {
      const breakdownItems = (breakdownResult.value as any)?.data || breakdownResult.value || [];
      if (Array.isArray(breakdownItems)) {
        setCourseBreakdownData(breakdownItems);
      } else {
        setCourseBreakdownData([]);
      }
    }

    if (chartResult.status === 'rejected' && enrollmentResult.status === 'rejected') {
      setChartsError('Không thể tải dữ liệu biểu đồ.');
    }
    setLoadingCharts(false);

    // 3. Process Details Table Result
    if (detailsResult.status === 'fulfilled') {
      const res: any = detailsResult.value;
      if (res?.data) {
        const items = res.data.items || [];
        setTableData(items);
        setPagination(res.data.pagination || { current_page: 1, last_page: 1, total: items.length, from: 1, to: items.length, per_page: filters.perPage });
      } else {
        setTableData([]);
        setPagination({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0, per_page: filters.perPage });
      }
    } else {
      console.error('Details API Error:', detailsResult.reason);
      setTableError('Không thể tải bảng chi tiết.');
      setTableData([]);
      setPagination({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0, per_page: filters.perPage });
    }
    setLoadingTable(false);
  }, [filters]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Compute Donut Data: Filter positive values only (> 0), limit to Top 5 + "Khác"
  const processedDonutData = useMemo(() => {
    const rawItems = Array.isArray(courseBreakdownData) ? courseBreakdownData : [];
    
    // 1. Filter out items with value <= 0 according to selected metric
    const positiveItems = rawItems
      .map((item: any) => {
        const val = filters.metric === 'gross_revenue' 
          ? parseFloat(item.gross_amount || 0)
          : parseFloat(item.instructor_amount || item.revenue || item.value || 0);
        return {
          name: item.title || item.name || item.course_title || 'Khóa học',
          value: val,
        };
      })
      .filter((item: any) => item.value > 0)
      .sort((a: any, b: any) => b.value - a.value);

    if (positiveItems.length === 0) {
      return { items: [], total: 0 };
    }

    const total = positiveItems.reduce((sum: number, i: any) => sum + i.value, 0);

    let finalItems: any[] = [];
    if (positiveItems.length <= 5) {
      finalItems = positiveItems;
    } else {
      const top5 = positiveItems.slice(0, 5);
      const others = positiveItems.slice(5);
      const otherVal = others.reduce((sum: number, i: any) => sum + i.value, 0);
      finalItems = [...top5, { name: 'Khác', value: otherVal }];
    }

    const itemsWithPercent = finalItems.map((item, idx) => ({
      name: item.name,
      value: item.value,
      percentage: total > 0 ? round((item.value / total) * 100, 1) : 0,
      color: DONUT_COLORS[idx % DONUT_COLORS.length],
    }));

    return { items: itemsWithPercent, total };
  }, [courseBreakdownData, filters.metric]);

  // Redirect to withdraw page
  const handleRedirectToWithdraw = () => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const withdrawBtn = buttons.find(el => el.textContent?.trim() === 'Rút tiền');
    if (withdrawBtn) {
      (withdrawBtn as HTMLElement).click();
    } else {
      showToast('Vui lòng click mục Rút tiền ở menu bên trái.');
    }
  };

  // Export CSV Handler
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const queryApiParams = buildRevenueQueryParams(filters);
      const res: any = await ApiService.exportInstructorRevenues(queryApiParams);

      if (res instanceof Blob || typeof res === 'string') {
        const blob = res instanceof Blob ? res : new Blob([res], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `doanh-thu-${filters.dateFrom || 'report'}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      showToast('Xuất báo cáo doanh thu CSV thành công.');
    } catch (err) {
      console.error('Failed to export CSV:', err);
      showToast('Xuất báo cáo thất bại.', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Reset all date/preset filters
  const handleResetFilters = () => {
    updateUrlParams({
      preset: 'month',
      date_from: undefined,
      date_to: undefined,
      page: 1,
    });
  };

  // Date range label
  const dateRangeLabel = useMemo(() => {
    if (filters.dateFrom && filters.dateTo) {
      return `${filters.dateFrom} - ${filters.dateTo}`;
    }
    if (filters.preset === 'day') return 'Hôm nay';
    if (filters.preset === 'month') return 'Tháng này';
    if (filters.preset === 'year') return 'Năm nay';
    return 'Khoảng thời gian';
  }, [filters.preset, filters.dateFrom, filters.dateTo]);

  // Prepared Card Comparison Displays
  const grossComp = useMemo(() => formatComparisonPercent(
    summaryData?.comparison?.gross_percent,
    summaryData?.gross_revenue || 0,
    summaryData?.comparison?.gross_previous || 0
  ), [summaryData]);

  const instComp = useMemo(() => formatComparisonPercent(
    summaryData?.comparison?.instructor_percent,
    summaryData?.instructor_revenue || 0,
    summaryData?.comparison?.instructor_previous || 0
  ), [summaryData]);

  const feeComp = useMemo(() => formatComparisonPercent(
    summaryData?.comparison?.platform_fee_percent,
    summaryData?.platform_fee || 0,
    0
  ), [summaryData]);

  const periodComp = useMemo(() => formatComparisonPercent(
    summaryData?.comparison?.period_revenue_percent,
    summaryData?.period_revenue || 0,
    summaryData?.comparison?.instructor_previous || 0
  ), [summaryData]);

  return (
    <main className="instructor-revenue-page flex-1 min-w-0 bg-slate-50/50">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#121b4b] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 border border-slate-100/10">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      <div className="w-full space-y-6 p-6 text-left">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#06091a] tracking-tight">Doanh thu</h1>
            <p className="text-[#595959] text-[11px] font-bold mt-1">Tổng quan doanh thu và hiệu quả kinh doanh</p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            {/* Date Range Selector Display */}
            <div className="relative">
              <div className="px-3.5 py-2 bg-white border border-[#dbdde4] text-[#121b4b] rounded-xl flex items-center gap-2 shadow-xs text-[11px] font-bold">
                <Calendar className="w-3.5 h-3.5 text-[#595959]" />
                {dateRangeLabel}
              </div>
            </div>

            {/* Toggle Ngày/Tháng/Năm */}
            <div className="flex bg-[#e7e8ed]/60 rounded-xl p-1 border border-[#e7e8ed]">
              {(['day', 'month', 'year'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => updateUrlParams({ preset: mode, page: 1 })}
                  className={`px-3.5 py-1.5 rounded-lg uppercase text-[10px] tracking-wider transition-all cursor-pointer font-bold ${
                    filters.preset === mode 
                      ? 'bg-[#121b4b] text-white shadow-xs' 
                      : 'text-[#737373] hover:text-[#121b4b]'
                  }`}
                >
                  {mode === 'day' ? 'Ngày' : mode === 'month' ? 'Tháng' : 'Năm'}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* 5 KPI Cards Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {/* Card 1: Doanh thu gộp */}
          <div className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-xs flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start text-[#737373]">
              <span className="text-[10px] font-black uppercase tracking-wider">Doanh thu gộp</span>
              <div className="p-1 bg-indigo-50 rounded-lg text-indigo-600">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              {loadingSummary ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400 my-1" />
              ) : summaryError ? (
                <span className="text-xs text-rose-500 font-bold">{summaryError}</span>
              ) : (
                <>
                  <span className="text-xl font-black text-[#06091a] block">{formatVND(summaryData?.gross_revenue || 0)}</span>
                  <span className={`text-[9px] font-bold flex items-center gap-0.5 mt-1 ${grossComp.isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {grossComp.isPositive ? '▲' : '▼'} {grossComp.text} <span className="text-[#8c8c8c] font-medium">{grossComp.label}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Card 2: Doanh thu giảng viên */}
          <div className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-xs flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start text-[#737373]">
              <span className="text-[10px] font-black uppercase tracking-wider">Doanh thu giảng viên</span>
              <div className="p-1 bg-blue-50 rounded-lg text-blue-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              {loadingSummary ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400 my-1" />
              ) : summaryError ? (
                <span className="text-xs text-rose-500 font-bold">{summaryError}</span>
              ) : (
                <>
                  <span className="text-xl font-black text-[#121b4b] block">{formatVND(summaryData?.instructor_revenue || 0)}</span>
                  <span className={`text-[9px] font-bold flex items-center gap-0.5 mt-1 ${instComp.isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {instComp.isPositive ? '▲' : '▼'} {instComp.text} <span className="text-[#8c8c8c] font-medium">{instComp.label}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Card 3: Phí nền tảng */}
          <div className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-xs flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start text-[#737373]">
              <span className="text-[10px] font-black uppercase tracking-wider">Phí nền tảng</span>
              <div className="p-1 bg-amber-50 rounded-lg text-amber-600">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              {loadingSummary ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400 my-1" />
              ) : summaryError ? (
                <span className="text-xs text-rose-500 font-bold">{summaryError}</span>
              ) : (
                <>
                  <span className="text-xl font-black text-[#06091a] block">{formatVND(summaryData?.platform_fee || 0)}</span>
                  <span className={`text-[9px] font-bold flex items-center gap-0.5 mt-1 ${feeComp.isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {feeComp.isPositive ? '▲' : '▼'} {feeComp.text} <span className="text-[#8c8c8c] font-medium">{feeComp.label}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Card 4: Doanh thu tháng này */}
          <div className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-xs flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start text-[#737373]">
              <span className="text-[10px] font-black uppercase tracking-wider">Doanh thu kỳ này</span>
              <div className="p-1 bg-emerald-50 rounded-lg text-emerald-600">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              {loadingSummary ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400 my-1" />
              ) : summaryError ? (
                <span className="text-xs text-rose-500 font-bold">{summaryError}</span>
              ) : (
                <>
                  <span className="text-xl font-black text-[#06091a] block">{formatVND(summaryData?.period_revenue || 0)}</span>
                  <span className={`text-[9px] font-bold flex items-center gap-0.5 mt-1 ${periodComp.isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {periodComp.isPositive ? '▲' : '▼'} {periodComp.text} <span className="text-[#8c8c8c] font-medium">{periodComp.label}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Card 5: Số dư có thể rút */}
          <div className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-xs flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-start text-[#737373]">
              <span className="text-[10px] font-black uppercase tracking-wider">Số dư có thể rút</span>
              <div className="p-1 bg-teal-50 rounded-lg text-teal-600">
                <WalletIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              {loadingSummary ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400 my-1" />
              ) : summaryError ? (
                <span className="text-xs text-rose-500 font-bold">{summaryError}</span>
              ) : (
                <>
                  <span className="text-xl font-black text-emerald-600 block">{formatVND(summaryData?.withdrawable_balance || 0)}</span>
                  <button 
                    onClick={handleRedirectToWithdraw}
                    className="text-[10.5px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 mt-1.5 transition-colors cursor-pointer"
                  >
                    Rút tiền ngay →
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Middle Charts Section */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Card 1: Doanh thu Line Chart */}
          <div className="xl:col-span-6 bg-white border border-[#e7e8ed] rounded-2xl p-5 shadow-xs h-[360px] flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-[#e7e8ed]">
              <h3 className="text-xs font-black uppercase text-[#06091a] tracking-wider flex items-center gap-1.5">
                Doanh thu <Info className="w-3.5 h-3.5 text-[#a3a3a3]" />
              </h3>
              <select className="border border-[#dbdde4] text-[10.5px] font-bold p-1 rounded-lg outline-none bg-white cursor-pointer text-[#595959]">
                <option>Biểu đồ đường</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-[10px] mt-2 font-bold">
              <span className="flex items-center gap-1.5 text-[#595959]">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block"></span> Doanh thu gộp (đ)
              </span>
              <span className="flex items-center gap-1.5 text-[#595959]">
                <span className="w-2.5 h-2.5 rounded bg-[#8b5cf6] inline-block"></span> Doanh thu giảng viên (đ)
              </span>
            </div>

            <div className="h-[260px] w-full mt-3 relative">
              {loadingCharts ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#007A64]" />
                </div>
              ) : chartsError ? (
                <div className="h-full flex items-center justify-center text-xs text-rose-500 font-bold">
                  {chartsError}
                </div>
              ) : revenueChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold">
                  Chưa có dữ liệu doanh thu trong khoảng thời gian này.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#737373', fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000000}M`} tick={{ fontSize: 9, fill: '#737373', fontWeight: 600 }} />
                    <Tooltip formatter={(value: number) => [formatVND(value), '']} />
                    <Line type="monotone" dataKey="gross" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="instructor" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Card 2: Xu hướng ghi danh Bar Chart */}
          <div className="xl:col-span-3 bg-white border border-[#e7e8ed] rounded-2xl p-5 shadow-xs h-[360px] flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-[#e7e8ed]">
              <h3 className="text-xs font-black uppercase text-[#06091a] tracking-wider flex items-center gap-1.5">
                Xu hướng ghi danh <Info className="w-3.5 h-3.5 text-[#a3a3a3]" />
              </h3>
              <select className="border border-[#dbdde4] text-[10.5px] font-bold p-1 rounded-lg outline-none bg-white cursor-pointer text-[#595959]">
                <option>Biểu đồ cột</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-[10px] mt-2 font-bold">
              <span className="flex items-center gap-1.5 text-[#595959]">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block"></span> Ghi danh
              </span>
            </div>

            <div className="h-[260px] w-full mt-3 relative">
              {loadingCharts ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#007A64]" />
                </div>
              ) : chartsError ? (
                <div className="h-full flex items-center justify-center text-xs text-rose-500 font-bold">
                  {chartsError}
                </div>
              ) : enrollmentChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold">
                  Chưa có dữ liệu ghi danh.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentChartData} margin={{ top: 10, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#737373', fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#737373', fontWeight: 600 }} />
                    <Tooltip formatter={(value: number) => [value, 'Ghi danh']} />
                    <Bar dataKey="enrollments" fill="#6366f1" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Card 3: Top khóa học theo doanh thu */}
          <div className="xl:col-span-3 bg-white border border-[#e7e8ed] rounded-2xl p-5 shadow-xs h-[360px] flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-[#e7e8ed] shrink-0">
              <h3 className="text-xs font-black uppercase text-[#06091a] tracking-wider flex items-center gap-1.5">
                Top khóa học theo doanh thu <Info className="w-3.5 h-3.5 text-[#a3a3a3]" />
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto mt-3 space-y-3.5 pr-1.5">
              {loadingCharts ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#007A64]" />
                </div>
              ) : chartsError ? (
                <div className="h-full flex items-center justify-center text-xs text-rose-500 font-bold">
                  {chartsError}
                </div>
              ) : topCoursesData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold">
                  Chưa có khóa học sinh doanh thu.
                </div>
              ) : (
                topCoursesData.map((course, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-black text-[#595959] shrink-0 text-[10px]">
                      {course.rank}
                    </span>
                    
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-slate-100" style={{ backgroundColor: `${course.color}20` }}>
                      <BookOpen className="w-4 h-4" style={{ color: course.color }} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#06091a] truncate leading-tight" title={course.title}>
                        {course.title}
                      </p>
                      <p className="text-[9.5px] text-[#737373] mt-0.5 font-medium">
                        {course.students.toLocaleString()} đơn hàng
                      </p>
                    </div>

                    <span className="font-black text-[#06091a] shrink-0 text-[11px] text-right">
                      {formatVND(course.revenue)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Bottom Section: Table + Donut chart side-by-side */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Card 1: Bảng doanh thu chi tiết */}
          <div className="xl:col-span-8 bg-white border border-[#e7e8ed] rounded-2xl overflow-hidden shadow-xs flex flex-col">
            <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
              <h4 className="font-black text-[#06091a] uppercase text-[10px] tracking-wider">Doanh thu chi tiết</h4>
              <button 
                disabled={exporting}
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 bg-white border border-[#dbdde4] hover:bg-slate-50 text-[#121b4b] font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer text-[10.5px] disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-[#595959]" />
                {exporting ? 'Đang xuất...' : 'Xuất báo cáo'}
              </button>
            </div>

            {loadingTable ? (
              <div className="py-16 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#007A64] mx-auto" />
              </div>
            ) : tableError ? (
              <div className="py-12 text-center text-xs text-rose-500 font-bold">
                {tableError}
              </div>
            ) : tableData.length === 0 ? (
              /* Empty State for Table */
              <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-8 text-center">
                <div className="p-3 bg-slate-100/80 rounded-2xl mb-3">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-xs font-bold text-[#06091a]">Không có dữ liệu doanh thu trong khoảng đã chọn.</p>
                <p className="text-[11px] text-[#737373] mt-1 font-medium">Thử thay đổi khoảng thời gian hoặc bộ lọc.</p>
                <button 
                  onClick={handleResetFilters}
                  className="mt-3.5 px-4 py-1.5 bg-white border border-[#dbdde4] hover:bg-slate-50 text-[#121b4b] text-[11px] font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              /* Table View when data exists */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px] text-[11px]">
                  <thead className="bg-[#e7e8ed]/20 border-b border-[#e7e8ed]">
                    <tr>
                      <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px]">Ngày</th>
                      <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] w-5/12">Khóa học</th>
                      <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] text-center">Đơn hàng</th>
                      <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] text-right">Doanh thu gộp</th>
                      <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] text-right">Giảng viên nhận</th>
                      <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7e8ed] font-semibold text-[#06091a]">
                    {tableData.map((rev) => (
                      <tr 
                        key={rev.id} 
                        onClick={() => setSelectedTransaction(rev)}
                        className="hover:bg-slate-50/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 whitespace-nowrap">{rev.date}</td>
                        <td className="py-3 px-4 font-bold text-[#06091a] truncate max-w-[240px]" title={rev.course?.title || rev.course}>
                          {rev.course?.title || rev.course}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#595959]">{rev.orders || 1}</td>
                        <td className="py-3 px-4 text-right font-bold text-[#737373] whitespace-nowrap">{formatVND(rev.gross)}</td>
                        <td className="py-3 px-4 text-right font-black text-emerald-600 whitespace-nowrap">{formatVND(rev.net)}</td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center border px-2 py-0.5 rounded text-[8.5px] uppercase font-black ${
                            rev.status === 'Hoàn thành' || rev.status === 'available'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                              : 'bg-amber-50 text-amber-700 border-amber-150'
                          }`}>
                            {rev.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination footer */}
            <div className="p-4 border-t border-[#e7e8ed] flex justify-between items-center bg-slate-50/15">
              <span className="text-[10px] text-[#737373] font-bold">
                {tableData.length > 0 && pagination.total > 0
                  ? `Hiển thị ${pagination.from}-${pagination.to} trong ${pagination.total} kết quả`
                  : 'Hiển thị 0 kết quả'}
              </span>
              {tableData.length > 0 && pagination.total > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#737373] font-bold">
                    <select 
                      value={filters.perPage}
                      onChange={(e) => updateUrlParams({ per_page: e.target.value, page: 1 })}
                      className="bg-transparent font-bold cursor-pointer outline-none"
                    >
                      <option value={5}>5 / trang</option>
                      <option value={10}>10 / trang</option>
                      <option value={20}>20 / trang</option>
                    </select>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      disabled={pagination.current_page <= 1}
                      onClick={() => updateUrlParams({ page: pagination.current_page - 1 })}
                      className="p-1 border border-[#dbdde4] rounded-lg bg-white disabled:opacity-40 hover:bg-[#e7e8ed] cursor-pointer text-[#121b4b]"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    
                    <span className="px-2.5 py-1 text-xs font-bold bg-[#121b4b] text-white rounded-lg">
                      {pagination.current_page} / {pagination.last_page}
                    </span>

                    <button 
                      disabled={pagination.current_page >= pagination.last_page}
                      onClick={() => updateUrlParams({ page: pagination.current_page + 1 })}
                      className="p-1 border border-[#dbdde4] rounded-lg bg-white disabled:opacity-40 hover:bg-[#e7e8ed] cursor-pointer text-[#121b4b]"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Doanh thu theo khóa học Donut Chart */}
          <div className="xl:col-span-4 bg-white border border-[#e7e8ed] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-[#e7e8ed] shrink-0">
              <h3 className="text-xs font-black uppercase text-[#06091a] tracking-wider">Doanh thu theo khóa học</h3>
              {/* Metric Dropdown */}
              <select 
                value={filters.metric}
                onChange={(e) => updateUrlParams({ metric: e.target.value })}
                className="border border-[#dbdde4] text-[10px] font-bold p-1 rounded-lg outline-none bg-white cursor-pointer text-[#595959]"
              >
                <option value="instructor_revenue">Giảng viên nhận</option>
                <option value="gross_revenue">Doanh thu gộp</option>
              </select>
            </div>

            {loadingCharts ? (
              <div className="py-16 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#007A64]" />
              </div>
            ) : chartsError ? (
              <div className="py-12 text-center text-xs text-rose-500 font-bold">
                {chartsError}
              </div>
            ) : processedDonutData.items.length === 0 ? (
              /* Donut Zero State */
              <div className="flex min-h-[240px] flex-col items-center justify-center py-6 px-4 text-center">
                <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-[11px] font-black text-[#8c8c8c] block">0 đ</span>
                    <span className="text-[8px] uppercase tracking-wider font-bold text-[#a3a3a3] mt-0.5 block">Tổng</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-[#06091a]">Chưa có doanh thu theo khóa học trong khoảng đã chọn.</p>
                <p className="text-[11px] text-[#737373] mt-1 font-medium">Doanh thu sẽ xuất hiện ở đây khi có phát sinh giao dịch.</p>
              </div>
            ) : (
              <>
                {/* Donut Area */}
                <div className="my-4 h-44 relative flex items-center justify-center shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={processedDonutData.items}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {processedDonutData.items.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatVND(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Centered Total */}
                  <div className="absolute text-center pointer-events-none">
                    <span className="text-[11px] font-black text-[#121b4b] block">
                      {formatVND(processedDonutData.total)}
                    </span>
                    <span className="text-[8px] uppercase tracking-wider font-bold text-[#8c8c8c] mt-0.5 block">Tổng doanh thu</span>
                  </div>
                </div>

                {/* Legends layout (Top 5 + Khác) */}
                <div className="flex-1 overflow-y-auto space-y-2 text-[11px] pr-1">
                  {processedDonutData.items.map((item: any, index: number) => (
                    <div key={index} className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-2 py-0.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="text-[#595959] font-medium truncate block max-w-[220px]" title={item.name}>
                        {item.name}
                      </span>
                      <span className="text-[#06091a] font-bold whitespace-nowrap shrink-0 tabular-nums text-right">
                        {formatVND(item.value)} ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Bottom link */}
            <div className="pt-3 mt-2 border-t border-[#e7e8ed] shrink-0 text-center">
              <button 
                onClick={handleExportCSV}
                className="text-blue-600 hover:text-blue-700 font-bold text-[10.5px] flex items-center justify-center gap-1 cursor-pointer mx-auto transition-colors"
              >
                Xuất báo cáo chi tiết <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* TRANSACTION DETAILED POPUP MODAL */}
      {selectedTransaction && (
        <>
          <div 
            onClick={() => setSelectedTransaction(null)}
            className="fixed inset-0 bg-[#06091a]/40 backdrop-blur-3xs z-[90] animate-in fade-in duration-300"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 pointer-events-none">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden pointer-events-auto border border-[#e7e8ed] animate-in zoom-in-95 duration-200 text-xs font-semibold text-[#121b4b] text-left">
              <div className="p-4 border-b border-[#e7e8ed] bg-slate-50/80 flex justify-between items-center">
                <h3 className="font-black text-sm text-[#06091a] uppercase tracking-wide flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Chi tiết giao dịch đối soát
                </h3>
                <button 
                  onClick={() => setSelectedTransaction(null)}
                  className="p-1 border border-[#dbdde4] rounded-full hover:bg-slate-50 text-[#737373]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="p-5 space-y-4 font-semibold text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[#737373] block mb-1">Mã giao dịch</span>
                    <span className="text-[#06091a] bg-[#e7e8ed]/45 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                      #REV-{selectedTransaction.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#737373] block mb-1">Ngày ghi nhận</span>
                    <span className="text-[#06091a]">{selectedTransaction.date}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[#737373] block mb-1">Khóa học</span>
                  <span className="text-[#06091a] font-bold text-sm leading-snug">{selectedTransaction.course?.title || selectedTransaction.course}</span>
                </div>

                <div className="border-t border-b border-[#e7e8ed] py-3 my-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#737373] font-medium">Doanh thu gộp (Gross)</span>
                    <span className="text-[#06091a] font-bold">{formatVND(selectedTransaction.gross)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-150">
                    <span className="text-emerald-850 font-black">Thu nhập giảng viên thực nhận</span>
                    <span className="text-emerald-700 font-black text-sm">{formatVND(selectedTransaction.net)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#737373] font-medium">Trạng thái đối soát</span>
                  <span className="inline-flex items-center whitespace-nowrap bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded text-[9.5px] uppercase font-black">
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>
              
              <div className="p-4 border-t border-[#e7e8ed] bg-slate-50/80 flex justify-end">
                <button 
                  onClick={() => setSelectedTransaction(null)} 
                  className="px-4 py-2 border border-[#dbdde4] rounded-xl text-[#121b4b] hover:bg-slate-50 font-bold bg-white"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

const WalletIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M12 4v16" />
    <path d="M2 10h20" />
  </svg>
);
