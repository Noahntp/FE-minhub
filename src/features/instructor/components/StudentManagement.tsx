import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, Search, BookOpen, Clock, CheckCircle2, Award, 
  Sparkles, Filter, FileText, ChevronLeft, ChevronRight, RefreshCw, 
  Eye, Calendar, AlertCircle, X, Check
} from 'lucide-react';
import StudentDetailDrawer from './StudentDetailDrawer';
import { instructorApi } from '@/features/instructor/api';

interface StudentManagementProps {
  instructorCourses?: any[];
}

interface LearnerItem {
  enrollment_id: number;
  learner: {
    id: number;
    full_name: string;
    email: string;
  };
  course: {
    id: number;
    title: string;
  };
  status: string;
  progress_percent: number;
  enrolled_at: string;
  completed_at: string | null;
  last_accessed_at: string | null;
}

interface ChartPoint {
  date: string;
  enrollments: number;
  active: number;
  completed: number;
}

export default function StudentManagement({ instructorCourses = [] }: StudentManagementProps) {
  // Parse URL search params & Path params
  const getInitialParams = () => {
    if (typeof window === 'undefined') return { 
      course: 'all', 
      status: 'all', 
      search: '', 
      preset: '30d',
      date_from: '',
      date_to: '',
      page: 1, 
      studentId: null 
    };
    const params = new URLSearchParams(window.location.search);
    const pathMatch = window.location.pathname.match(/\/instructor\/students\/(\d+)/);
    const studentId = pathMatch ? parseInt(pathMatch[1], 10) : null;

    return {
      course: params.get('course') || 'all',
      status: params.get('status') || 'all',
      search: params.get('search') || '',
      preset: params.get('preset') || '30d',
      date_from: params.get('date_from') || '',
      date_to: params.get('date_to') || '',
      page: parseInt(params.get('page') || '1', 10) || 1,
      studentId: studentId
    };
  };

  const initialParams = getInitialParams();

  // Stats & State
  const [summary, setSummary] = useState<{
    total_enrollments: number;
    learning_count: number;
    completed_count: number;
    certificates_count: number;
    comparison: {
      total_enrollments_percent: number | null;
      active_students_percent: number | null;
      completed_students_percent: number | null;
      label?: string;
      current_total?: number;
      previous_total?: number;
      current_active?: number;
      previous_active?: number;
      current_completed?: number;
      previous_completed?: number;
    };
    period?: {
      preset?: string;
      from?: string;
      to?: string;
      previous_from?: string;
      previous_to?: string;
      label?: string;
    };
  }>({
    total_enrollments: 0,
    learning_count: 0,
    completed_count: 0,
    certificates_count: 0,
    comparison: {
      total_enrollments_percent: 0,
      active_students_percent: 0,
      completed_students_percent: 0,
      label: 'So với 30 ngày liền trước'
    }
  });

  const [chartPoints, setChartPoints] = useState<ChartPoint[]>([]);
  const [studentsList, setStudentsList] = useState<LearnerItem[]>([]);
  const [courseOptions, setCourseOptions] = useState<any[]>(instructorCourses);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters
  const [courseFilter, setCourseFilter] = useState(initialParams.course);
  const [statusFilter, setStatusFilter] = useState(initialParams.status);
  const [searchQuery, setSearchQuery] = useState(initialParams.search);
  const [presetFilter, setPresetFilter] = useState(initialParams.preset);
  const [dateFrom, setDateFrom] = useState(initialParams.date_from);
  const [dateTo, setDateTo] = useState(initialParams.date_to);
  const [page, setPage] = useState(initialParams.page);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Date range picker popover state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState(dateFrom);
  const [tempDateTo, setTempDateTo] = useState(dateTo);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Drawer state & Deep Link
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(initialParams.studentId);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; value: number; metric: string } | null>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(initialParams.search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync URL Query & Path Parameters
  const updateUrlParams = useCallback((
    course: string, 
    status: string, 
    search: string, 
    preset: string,
    dFrom: string,
    dTo: string,
    p: number, 
    detailId: number | null
  ) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    
    if (detailId) {
      url.pathname = `/instructor/students/${detailId}`;
    } else {
      url.pathname = `/instructor/students`;
    }

    if (course && course !== 'all') url.searchParams.set('course', course);
    else url.searchParams.delete('course');

    if (status && status !== 'all') url.searchParams.set('status', status);
    else url.searchParams.delete('status');

    if (search) url.searchParams.set('search', search);
    else url.searchParams.delete('search');

    if (preset && preset !== '30d') url.searchParams.set('preset', preset);
    else url.searchParams.delete('preset');

    if (preset === 'custom' && dFrom) url.searchParams.set('date_from', dFrom);
    else url.searchParams.delete('date_from');

    if (preset === 'custom' && dTo) url.searchParams.set('date_to', dTo);
    else url.searchParams.delete('date_to');

    if (p > 1) url.searchParams.set('page', String(p));
    else url.searchParams.delete('page');

    window.history.replaceState({}, '', url.pathname + url.search);
  }, []);

  // Listen to browser Back/Forward popstate
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const pathname = window.location.pathname;
      const pathMatch = pathname.match(/\/instructor\/students\/(\d+)/);
      if (pathMatch) {
        setSelectedEnrollmentId(parseInt(pathMatch[1], 10));
      } else {
        setSelectedEnrollmentId(null);
      }

      const params = new URLSearchParams(window.location.search);
      setCourseFilter(params.get('course') || 'all');
      setStatusFilter(params.get('status') || 'all');
      setSearchQuery(params.get('search') || '');
      setPresetFilter(params.get('preset') || '30d');
      setDateFrom(params.get('date_from') || '');
      setDateTo(params.get('date_to') || '');
      setPage(parseInt(params.get('page') || '1', 10) || 1);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Close Date Picker popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openStudentDetails = (id: number) => {
    setSelectedEnrollmentId(id);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.pathname = `/instructor/students/${id}`;
      window.history.pushState({}, '', url.pathname + url.search);
    }
  };

  const closeStudentDetails = () => {
    setSelectedEnrollmentId(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.pathname = `/instructor/students`;
      window.history.pushState({}, '', url.pathname + url.search);
    }
  };

  // Fetch Course Options
  useEffect(() => {
    instructorApi.getInstructorQuestionCourseOptions().then((res: any) => {
      const list = res?.data || res || [];
      if (Array.isArray(list) && list.length > 0) {
        setCourseOptions(list);
      }
    }).catch(() => {
      // Keep instructorCourses fallback
    });
  }, []);

  // Fetch Summary & Chart Data
  const loadSummaryAndChart = useCallback(async () => {
    try {
      const summaryRes = await instructorApi.getInstructorLearnersSummary({ 
        course_id: courseFilter,
        status: statusFilter,
        preset: presetFilter,
        date_from: dateFrom,
        date_to: dateTo
      });
      const summaryData = summaryRes?.data || summaryRes;
      if (summaryData && typeof summaryData.total_enrollments === 'number') {
        setSummary(summaryData);
      }

      const chartRes = await instructorApi.getInstructorLearnersChart({ 
        course_id: courseFilter, 
        status: statusFilter,
        preset: presetFilter,
        date_from: dateFrom,
        date_to: dateTo,
        days: 30 
      });
      const chartData = chartRes?.data || chartRes;
      if (chartData?.points && Array.isArray(chartData.points)) {
        setChartPoints(chartData.points);
      }
    } catch (err: any) {
      console.warn("Failed to load learners summary/chart:", err);
    }
  }, [courseFilter, statusFilter, presetFilter, dateFrom, dateTo]);

  // Fetch Learners Paginated List
  const fetchLearners = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    updateUrlParams(courseFilter, statusFilter, debouncedSearch, presetFilter, dateFrom, dateTo, page, selectedEnrollmentId);
    try {
      const res = await instructorApi.getInstructorLearners({
        course_id: courseFilter,
        status: statusFilter,
        search: debouncedSearch,
        preset: presetFilter,
        date_from: dateFrom,
        date_to: dateTo,
        page: page,
        per_page: 10
      });

      const list = Array.isArray(res) ? res : (res?.data || res?.items || []);
      const pagination = res?.pagination || res?.meta || {};
      setStudentsList(Array.isArray(list) ? list : []);
      
      setTotalPages(pagination.last_page || 1);
      setTotalRecords(pagination.total || (Array.isArray(list) ? list.length : 0));
    } catch (err: any) {
      console.error('Failed to fetch learners data:', err);
      setApiError(err?.message || 'Không thể kết nối đến máy chủ Backend.');
    } finally {
      setLoading(false);
    }
  }, [courseFilter, statusFilter, debouncedSearch, presetFilter, dateFrom, dateTo, page, selectedEnrollmentId, updateUrlParams]);

  useEffect(() => {
    loadSummaryAndChart();
  }, [loadSummaryAndChart]);

  useEffect(() => {
    fetchLearners();
  }, [fetchLearners]);

  const handlePresetChange = (newPreset: string) => {
    if (newPreset === 'custom') {
      setShowDatePicker(true);
      setPresetFilter('custom');
    } else {
      setShowDatePicker(false);
      setPresetFilter(newPreset);
      setDateFrom('');
      setDateTo('');
      setPage(1);
    }
  };

  const handleApplyCustomDates = () => {
    if (!tempDateFrom || !tempDateTo) {
      showToast('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.', 'error');
      return;
    }

    if (new Date(tempDateFrom) > new Date(tempDateTo)) {
      showToast('Ngày bắt đầu không được lớn hơn ngày kết thúc.', 'error');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    if (tempDateTo > todayStr) {
      showToast('Ngày kết thúc không được lớn hơn ngày hiện tại.', 'error');
      return;
    }

    setDateFrom(tempDateFrom);
    setDateTo(tempDateTo);
    setPresetFilter('custom');
    setShowDatePicker(false);
    setPage(1);
    showToast('Đã áp dụng khoảng thời gian tùy chỉnh!');
  };

  const handleResetFilters = () => {
    setCourseFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
    setPresetFilter('30d');
    setDateFrom('');
    setDateTo('');
    setTempDateFrom('');
    setTempDateTo('');
    setShowDatePicker(false);
    setPage(1);
    showToast('Đã đặt lại bộ lọc học viên!');
  };

  const handleExportReport = async () => {
    setExporting(true);
    try {
      const queryParams = new URLSearchParams();
      if (courseFilter && courseFilter !== 'all') queryParams.set('course_id', String(courseFilter));
      if (statusFilter && statusFilter !== 'all') queryParams.set('status', String(statusFilter));
      if (debouncedSearch) queryParams.set('search', String(debouncedSearch));
      if (presetFilter && presetFilter !== '30d') queryParams.set('preset', String(presetFilter));
      if (presetFilter === 'custom' && dateFrom) queryParams.set('date_from', String(dateFrom));
      if (presetFilter === 'custom' && dateTo) queryParams.set('date_to', String(dateTo));

      const downloadUrl = `http://127.0.0.1:8000/api/instructor/learners/export?${queryParams.toString()}`;

      const dateStr = dateFrom && dateTo ? `${dateFrom}-den-${dateTo}` : new Date().toISOString().slice(0, 10);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `hoc-vien-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Xuất báo cáo danh sách lượt ghi danh thành công!');
    } catch (err) {
      showToast('Xuất báo cáo thất bại.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const renderPercentBadge = (
    percentVal: number | null | undefined, 
    currentVal?: number, 
    previousVal?: number
  ) => {
    if (previousVal === 0 && (currentVal || 0) > 0) {
      return (
        <span 
          title={`Kỳ trước: 0, kỳ này: ${currentVal}`}
          className="text-[9px] px-2 py-0.5 rounded font-black bg-emerald-50 text-emerald-700 cursor-help"
        >
          Mới (+{currentVal})
        </span>
      );
    }

    if ((previousVal === 0 || previousVal === undefined) && (currentVal === 0 || currentVal === undefined)) {
      return (
        <span 
          title="Kỳ trước: 0, kỳ này: 0"
          className="text-[9px] px-2 py-0.5 rounded font-black bg-slate-100 text-slate-600"
        >
          Không đổi
        </span>
      );
    }

    if (percentVal === null || percentVal === undefined || isNaN(percentVal)) {
      return (
        <span className="text-[9px] px-2 py-0.5 rounded font-black bg-slate-100 text-slate-600">
          Không đổi
        </span>
      );
    }

    if (percentVal === 0) {
      return (
        <span className="text-[9px] px-2 py-0.5 rounded font-black bg-slate-100 text-slate-600">
          0%
        </span>
      );
    }

    const isPositive = percentVal > 0;
    const formattedVal = Math.abs(percentVal) >= 100 
      ? `${isPositive ? '+' : ''}${Math.round(percentVal)}%` 
      : `${isPositive ? '+' : ''}${percentVal.toFixed(1)}%`;

    return (
      <span 
        title={`Kỳ trước: ${previousVal ?? 'N/A'}, kỳ này: ${currentVal ?? 'N/A'}`}
        className={`text-[9px] px-2 py-0.5 rounded font-black ${
          isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
        }`}
      >
        {formattedVal}
      </span>
    );
  };

  const formatTimeAgo = (timeStr: string | null) => {
    if (!timeStr) return 'Chưa học';
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins > 0 ? diffMins : 1} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  // Sparkline Chart Renderer
  const renderSparkline = (
    pointsKey: 'enrollments' | 'active' | 'completed',
    strokeColor: string,
    gradientId: string,
    metricTitle: string
  ) => {
    if (!chartPoints || chartPoints.length === 0) {
      return (
        <div className="h-10 mt-3 w-full flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <span className="text-[10px] text-slate-400 font-semibold">Chưa có dữ liệu trong khoảng đã chọn</span>
        </div>
      );
    }

    const values = chartPoints.map(p => p[pointsKey] || 0);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal || 1;

    const width = 280;
    const height = 40;
    const padding = 3;

    const coords = chartPoints.map((p, i) => {
      const x = (i / (chartPoints.length - 1 || 1)) * (width - padding * 2) + padding;
      const y = height - padding - (((p[pointsKey] || 0) - minVal) / range) * (height - padding * 2);
      return { x, y, date: p.date, value: p[pointsKey] || 0 };
    });

    const pathD = coords.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const areaD = `${pathD} L ${width - padding} ${height} L ${padding} ${height} Z`;

    return (
      <div className="h-10 mt-3 w-full relative group">
        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gradientId})`} />
          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Hover interaction overlay */}
        <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          {coords.map((pt, idx) => (
            <div 
              key={idx}
              className="h-full flex-1 cursor-pointer relative"
              onMouseEnter={() => setHoveredPoint({ date: pt.date, value: pt.value, metric: metricTitle })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </div>
      </div>
    );
  };

  const comparisonLabelText = summary.comparison?.label || summary.period?.label || (
    presetFilter === '7d' ? 'So với 7 ngày liền trước' :
    presetFilter === '90d' ? 'So với 90 ngày liền trước' :
    presetFilter === 'this_month' ? 'So với tháng trước' :
    presetFilter === 'last_month' ? 'So với tháng trước nữa' :
    presetFilter === 'this_year' ? 'So với cùng kỳ năm trước' :
    presetFilter === 'custom' && dateFrom && dateTo ? `Khoảng ${formatDateDisplay(dateFrom)} – ${formatDateDisplay(dateTo)}` :
    'So với 30 ngày liền trước'
  );

  return (
    <div className="w-full text-left relative pb-12 instructor-students-page">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#121b4b] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 border border-slate-100/10">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Hover Tooltip display */}
      {hoveredPoint && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-3.5 py-2 rounded-xl shadow-lg text-[11px] font-bold flex items-center gap-2 animate-in fade-in">
          <span>📅 {hoveredPoint.date}</span>
          <span className="text-emerald-400">• {hoveredPoint.metric}: {hoveredPoint.value}</span>
        </div>
      )}

      {/* Drawer Details side-panel */}
      {selectedEnrollmentId && (
        <StudentDetailDrawer 
          enrollmentId={selectedEnrollmentId} 
          onClose={closeStudentDetails} 
        />
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#06091a] tracking-tight">Học viên & Lượt ghi danh</h1>
          <p className="text-[#595959] text-[11px] font-bold mt-1">Quản lý và theo dõi tình hình học tập theo khoảng thời gian ghi danh</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            disabled={exporting}
            onClick={handleExportReport}
            className="px-4 py-2.5 bg-white border border-[#dbdde4] hover:bg-slate-50 text-blue-600 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            {exporting ? 'Đang xuất...' : 'Xuất báo cáo (CSV)'}
          </button>
          <button 
            type="button"
            onClick={() => showToast('Bộ lọc nâng cao đã sẵn sàng.')}
            className="px-4 py-2.5 bg-[#007A64] hover:bg-[#006653] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            Bộ lọc nâng cao
          </button>
        </div>
      </div>

      {/* 3 Stats Cards with real sparklines & dynamic comparison label */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Tổng lượt ghi danh */}
        <div 
          onClick={() => { setStatusFilter('all'); setPage(1); }}
          className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-3xs relative flex flex-col justify-between cursor-pointer hover:border-blue-300 transition-all group"
        >
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase text-[#595959] tracking-wider block">Tổng lượt ghi danh</span>
              {renderPercentBadge(
                summary.comparison.total_enrollments_percent, 
                summary.comparison.current_total, 
                summary.comparison.previous_total
              )}
            </div>
            <span className="text-2xl font-black text-[#121b4b] block mt-2">
              {summary.total_enrollments.toLocaleString()}
            </span>
          </div>
          
          {renderSparkline('enrollments', '#2563eb', 'sparkGradTotal', 'Lượt ghi danh')}

          <span className="text-[9.5px] text-[#8c8c8c] font-bold block mt-1.5 truncate" title={comparisonLabelText}>
            {comparisonLabelText}
          </span>
        </div>

        {/* Card 2: Đang học */}
        <div 
          onClick={() => { setStatusFilter('learning'); setPage(1); }}
          className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-3xs relative flex flex-col justify-between cursor-pointer hover:border-amber-300 transition-all group"
        >
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase text-[#595959] tracking-wider block">Đang học</span>
              {renderPercentBadge(
                summary.comparison.active_students_percent, 
                summary.comparison.current_active, 
                summary.comparison.previous_active
              )}
            </div>
            <span className="text-2xl font-black text-amber-600 block mt-2">
              {summary.learning_count.toLocaleString()}
            </span>
          </div>

          {renderSparkline('active', '#d97706', 'sparkGradActive', 'Đang học')}

          <span className="text-[9.5px] text-[#8c8c8c] font-bold block mt-1.5 truncate" title={comparisonLabelText}>
            {comparisonLabelText}
          </span>
        </div>

        {/* Card 3: Đã hoàn thành */}
        <div 
          onClick={() => { setStatusFilter('completed'); setPage(1); }}
          className="bg-white border border-[#e7e8ed] p-5 rounded-2xl shadow-3xs relative flex flex-col justify-between cursor-pointer hover:border-emerald-300 transition-all group"
        >
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase text-[#595959] tracking-wider block">Đã hoàn thành</span>
              {renderPercentBadge(
                summary.comparison.completed_students_percent, 
                summary.comparison.current_completed, 
                summary.comparison.previous_completed
              )}
            </div>
            <span className="text-2xl font-black text-emerald-600 block mt-2">
              {summary.completed_count.toLocaleString()}
            </span>
          </div>

          {renderSparkline('completed', '#10b981', 'sparkGradCompleted', 'Hoàn thành')}

          <span className="text-[9.5px] text-[#8c8c8c] font-bold block mt-1.5 truncate" title={comparisonLabelText}>
            {comparisonLabelText}
          </span>
        </div>
      </div>

      {/* Toolbar filters row */}
      <div className="bg-white border border-[#e7e8ed] rounded-2xl p-4 shadow-sm flex flex-wrap lg:flex-nowrap gap-4 items-end mb-6 text-xs font-semibold text-[#121b4b] relative z-20">
        {/* Course Filter */}
        <div className="w-full sm:w-[180px] shrink-0">
          <label className="block text-[9.5px] uppercase font-bold text-[#737373] mb-1">Khóa học</label>
          <select
            value={courseFilter}
            onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
            className="w-full text-xs font-bold p-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white cursor-pointer text-[#06091a]"
          >
            <option value="all">Tất cả khóa học</option>
            {courseOptions.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* Study status filter */}
        <div className="w-full sm:w-[150px] shrink-0">
          <label className="block text-[9.5px] uppercase font-bold text-[#737373] mb-1">Trạng thái học</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full text-xs font-bold p-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white cursor-pointer text-[#06091a]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="learning">Đang học</option>
            <option value="completed">Đã hoàn thành</option>
          </select>
        </div>

        {/* Date Period Preset Filter */}
        <div className="w-full sm:w-[210px] shrink-0 relative" ref={datePickerRef}>
          <label className="block text-[9.5px] uppercase font-bold text-[#737373] mb-1">Thời gian ghi danh</label>
          <div className="relative">
            <select
              value={presetFilter}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full text-xs font-bold p-2.5 pr-8 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white cursor-pointer text-[#06091a] appearance-none"
            >
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua (Mặc định)</option>
              <option value="90d">90 ngày qua</option>
              <option value="this_month">Tháng này</option>
              <option value="last_month">Tháng trước</option>
              <option value="this_year">Năm nay</option>
              <option value="custom">
                {presetFilter === 'custom' && dateFrom && dateTo 
                  ? `${formatDateDisplay(dateFrom)} – ${formatDateDisplay(dateTo)}`
                  : 'Tùy chỉnh khoảng ngày...'}
              </option>
            </select>
            <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* Popover Custom Date Picker Overlay */}
          {showDatePicker && (
            <div className="absolute top-full left-0 mt-2 w-[310px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-[#121b4b]">Chọn khoảng thời gian tùy chỉnh</span>
                <button 
                  onClick={() => setShowDatePicker(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Từ ngày (Từ 00:00)</label>
                  <input 
                    type="date"
                    value={tempDateFrom}
                    onChange={(e) => setTempDateFrom(e.target.value)}
                    className="w-full text-xs font-medium p-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#007A64]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Đến ngày (Đến 23:59)</label>
                  <input 
                    type="date"
                    value={tempDateTo}
                    onChange={(e) => setTempDateTo(e.target.value)}
                    className="w-full text-xs font-medium p-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-[#007A64]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={handleApplyCustomDates}
                    className="flex-1 py-2 bg-[#007A64] hover:bg-[#006653] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Áp dụng
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setPresetFilter('30d');
                      setDateFrom('');
                      setDateTo('');
                      setShowDatePicker(false);
                    }}
                    className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Keyword Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[9.5px] uppercase font-bold text-[#737373] mb-1">Từ khóa</label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#999999] absolute left-3.5 top-3" />
            <input 
              type="text" 
              placeholder="Tìm theo tên học viên, email hoặc khóa học..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3.5 py-2.5 border border-[#dbdde4] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#007A64] bg-white font-medium text-[#06091a]"
            />
          </div>
        </div>
        
        {/* Reset Filter Button */}
        <div className="self-end shrink-0">
          <button 
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2.5 border border-[#dbdde4] hover:bg-slate-50 text-[#737373] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors bg-white text-xs h-[38px] whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Đặt lại
          </button>
        </div>
      </div>

      {/* Main Student table card */}
      <div className="bg-white border border-[#e7e8ed] rounded-2xl overflow-hidden shadow-sm text-[11px] font-semibold text-[#121b4b] relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-[#e7e8ed]/25 border-b border-[#e7e8ed]">
              <tr>
                <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] w-[20%] min-w-[150px]">Học viên</th>
                <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] w-[20%] min-w-[150px]">Email</th>
                <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] w-[30%] min-w-[220px]">Khóa học</th>
                <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] w-[15%] min-w-[110px]">Tiến độ</th>
                <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] w-[15%] min-w-[120px]">Lần học gần nhất</th>
                <th className="py-3 px-4 font-bold text-[#595959] uppercase text-[9.5px] text-right w-[10%] min-w-[100px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e8ed] font-semibold text-[#06091a]">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-3.5 px-4"><div className="w-32 h-6 bg-slate-100 animate-pulse rounded-lg"></div></td>
                    <td className="py-3.5 px-4"><div className="w-36 h-4 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="py-3.5 px-4"><div className="w-full h-4 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="py-3.5 px-4"><div className="w-20 h-4 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="py-3.5 px-4"><div className="w-24 h-4 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="py-3.5 px-4"></td>
                  </tr>
                ))
              ) : apiError ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-red-600">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                      <span className="font-bold">{apiError}</span>
                      <button 
                        onClick={() => { fetchLearners(); loadSummaryAndChart(); }}
                        className="mt-2 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 cursor-pointer"
                      >
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              ) : studentsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#737373]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-[#999999]" />
                      <span className="font-bold">Không tìm thấy lượt ghi danh trong khoảng thời gian này.</span>
                      <button 
                        onClick={handleResetFilters}
                        className="mt-2 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Xóa bộ lọc thời gian
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                studentsList.map((enrollment) => {
                  const progress = Math.min(Math.max(enrollment.progress_percent || 0, 0), 100);
                  const isCompleted = enrollment.status === 'completed' || progress >= 100;
                  
                  return (
                    <tr key={enrollment.enrollment_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.learner.full_name || 'Student')}&background=007A64&color=fff&bold=true`} 
                            alt={enrollment.learner.full_name} 
                            className="w-8 h-8 rounded-full object-cover border border-[#dbdde4]" 
                          />
                          <span className="font-bold text-[#06091a]">{enrollment.learner.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#595959] font-medium">{enrollment.learner.email}</td>
                      <td className="py-3 px-4 text-[#06091a] font-bold max-w-[280px] truncate" title={enrollment.course.title}>
                        {enrollment.course.title}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 text-right font-black text-[#121b4b]">{progress}%</span>
                          <div className="w-20 h-1.5 bg-[#e7e8ed] rounded-full overflow-hidden shrink-0">
                            <div 
                              style={{ width: `${progress}%` }} 
                              className={`h-full rounded-full transition-all ${isCompleted ? 'bg-emerald-600' : 'bg-blue-600'}`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#595959] font-medium" title={enrollment.last_accessed_at || enrollment.enrolled_at}>
                        {formatTimeAgo(enrollment.last_accessed_at || enrollment.enrolled_at)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button 
                          onClick={() => openStudentDetails(enrollment.enrollment_id)}
                          className="text-blue-600 hover:underline font-bold text-[10.5px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Pagination Footer */}
        {!loading && totalRecords > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-[#e7e8ed] bg-slate-50/40 gap-3">
            <span className="text-[10px] text-[#737373] font-bold">
              Hiển thị {((page - 1) * 10) + 1} đến {Math.min(page * 10, totalRecords)} trên {totalRecords} lượt ghi danh
            </span>
            <div className="flex items-center gap-1.5">
              <button 
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-[#dbdde4] rounded-lg bg-white disabled:opacity-40 hover:bg-[#e7e8ed] cursor-pointer text-[#121b4b]"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-3 py-1 font-bold bg-[#121b4b] text-white text-xs rounded-lg">
                Trang {page} / {totalPages}
              </span>

              <button 
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 border border-[#dbdde4] rounded-lg bg-white disabled:opacity-40 hover:bg-[#e7e8ed] cursor-pointer text-[#121b4b]"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
