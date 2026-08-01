import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import * as coursesApi from '@/assets/js/api/courses-api.js';
import { getComments, getUsers } from '@/assets/js/mocks/mock-repository.js';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import FilterSelect, { SelectOption } from './FilterSelect';
import { config } from '@/shared/lib/api-client';

// Format Helpers
const formatDateTime = (isoString: string) => {
  if (!isoString) return '---';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '---';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const formatLastUpdate = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const formatVND = (amount: number | null | undefined) => {
  if (amount === undefined || amount === null) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

const formatDuration = (seconds: number | null | undefined) => {
  if (!seconds) return '0 phút';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  }
  return `${minutes} phút`;
};

// Generate Stars HTML replacement for React
function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating || 0);
  return (
    <div className="inline-flex items-center gap-0.5 select-none">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "text-sm leading-none",
            i <= rounded ? "text-warning" : "text-mid-gray/30"
          )}
        >
          {i <= rounded ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}

// Level Badge Component (Neutral design matching new getLevelBadgeHtml)
function LevelBadge({ level }: { level: string }) {
  const levels: Record<string, string> = {
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
    all_levels: 'Mọi trình độ',
  };
  const text = levels[level] || level || 'Chưa rõ';

  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border text-ink/80 bg-canvas border-hairline whitespace-nowrap select-none">
      <span className="h-1 w-1 rounded-full bg-ink/60 shrink-0"></span>
      <span>{text}</span>
    </span>
  );
}

// Status Dot Component (matching statusColorClass and statusDotClass)
function CourseStatusMarker({ status }: { status: string }) {
  let statusDotClass = '';
  let statusColorClass = '';
  let statusText = '';

  switch (status) {
    case 'published':
      statusDotClass = 'bg-success';
      statusColorClass = 'text-success';
      statusText = 'Đã xuất bản';
      break;
    case 'pending_review':
      statusDotClass = 'bg-warning';
      statusColorClass = 'text-warning';
      statusText = 'Chờ duyệt';
      break;
    case 'approved':
      statusDotClass = 'bg-emerald-700';
      statusColorClass = 'text-emerald-700';
      statusText = 'Đã duyệt';
      break;
    case 'rejected':
      statusDotClass = 'bg-danger-brick';
      statusColorClass = 'text-danger-brick';
      statusText = 'Bị từ chối';
      break;
    case 'hidden':
      statusDotClass = 'bg-mid-gray';
      statusColorClass = 'text-mid-gray';
      statusText = 'Đã bị ẩn';
      break;
    case 'draft':
    default:
      statusDotClass = 'bg-mid-gray/50';
      statusColorClass = 'text-mid-gray/70';
      statusText = 'Bản nháp';
      break;
  }

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap select-none">
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', statusDotClass)}></span>
      <span className={cn('text-xs font-semibold', statusColorClass)}>{statusText}</span>
    </span>
  );
}

export default function CoursesManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const goToCourseReview = (courseId: number, event: React.MouseEvent) => {
    navigate(`/admin/course-reviews?open_course_id=${courseId}`);
  };

  // URL Parameters mapping
  const searchParam = searchParams.get('search') || '';
  const statusParam = searchParams.get('status') || '';
  const categoryIdParam = searchParams.get('category_id') || '';
  const levelParam = searchParams.get('level') || '';
  const isFeaturedParam = searchParams.get('is_featured') || '';
  const timePresetParam = searchParams.get('time_preset') || 'all';
  const dateFromParam = searchParams.get('date_from') || '';
  const dateToParam = searchParams.get('date_to') || '';
  const sortByParam = searchParams.get('sort_by') || 'updated_at';
  const sortDirParam = searchParams.get('sort_direction') || 'desc';
  const pageParam = Number(searchParams.get('page')) || 1;
  const perPageParam = Number(searchParams.get('per_page')) || 20;

  // Local Form state
  const [formSearch, setFormSearch] = useState(searchParam);
  const [formStatus, setFormStatus] = useState(statusParam);
  const [formCategory, setFormCategory] = useState(categoryIdParam);
  const [formLevel, setFormLevel] = useState(levelParam);
  const [formFeatured, setFormFeatured] = useState(isFeaturedParam);
  const [formTimePreset, setFormTimePreset] = useState(timePresetParam);
  const [formDateFrom, setFormDateFrom] = useState(dateFromParam);
  const [formDateTo, setFormDateTo] = useState(dateToParam);
  const [formSortBy, setFormSortBy] = useState(sortByParam);
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);

  // Sync Local states when query param changes
  useEffect(() => {
    setFormSearch(searchParam);
    setFormStatus(statusParam);
    setFormCategory(categoryIdParam);
    setFormLevel(levelParam);
    setFormFeatured(isFeaturedParam);
    setFormTimePreset(timePresetParam);
    setFormDateFrom(dateFromParam);
    setFormDateTo(dateToParam);
    setFormSortBy(sortByParam);
  }, [searchParam, statusParam, categoryIdParam, levelParam, isFeaturedParam, timePresetParam, dateFromParam, dateToParam, sortByParam]);

  // Data States
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    total_courses: 0,
    published_courses: 0,
    pending_review_courses: 0,
    draft_courses: 0,
    hidden_courses: 0,
    rejected_courses: 0,
    new_courses_30_days: 0,
    total_enrollments: 0,
    total_paid_orders: 0,
    total_gross_revenue: 0,
    average_rating: 0
  });
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState('---');

  // UI Interactive States
  const [activeDetailCourse, setActiveDetailCourse] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [refreshRotation, setRefreshRotation] = useState(0);

  // Drawer local comments & users mock data
  const [drawerComments, setDrawerComments] = useState<any[]>([]);
  const [mockUsers, setMockUsers] = useState<any[]>([]);
  const [apiMode, setApiMode] = useState<'api' | 'mock'>('mock');

  useEffect(() => {
    setApiMode(config.mode);
    const handleModeChange = (e: any) => {
      setApiMode(e.detail);
    };
    window.addEventListener('mindhub-api-mode-changed', handleModeChange);
    return () => window.removeEventListener('mindhub-api-mode-changed', handleModeChange);
  }, []);

  // Modals States
  const [featuredModal, setFeaturedModal] = useState<{ open: boolean; course: any; targetFeatured: boolean }>({
    open: false,
    course: null,
    targetFeatured: false,
  });
  const [hideModal, setHideModal] = useState<{ open: boolean; course: any }>({
    open: false,
    course: null,
  });
  const [showModal, setShowModal] = useState<{ open: boolean; course: any }>({
    open: false,
    course: null,
  });

  // Load categories directly from Category API for filter dropdown
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await import('@/assets/js/api/categories-api.js').then(m => m.getCategories({ per_page: 200 }));
        if (res && Array.isArray(res.data)) {
          setCategories(res.data.map((c: any) => ({ id: c.id, name: c.name })));
        } else if (res && res.data && Array.isArray(res.data.items)) {
          setCategories(res.data.items.map((c: any) => ({ id: c.id, name: c.name })));
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Click outside and Esc handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setFeaturedModal({ open: false, course: null, targetFeatured: false });
        setHideModal({ open: false, course: null });
        setShowModal({ open: false, course: null });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update query parameters helper
  const updateFilters = (newFilters: Record<string, any>) => {
    const nextParams = new URLSearchParams(searchParams);
    let resetPage = true;
    if (newFilters.page !== undefined) {
      resetPage = false;
    }

    Object.keys(newFilters).forEach(key => {
      const val = newFilters[key];
      if (val === undefined || val === null || val === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(val));
      }
    });

    if (resetPage) {
      nextParams.delete('page');
    }

    setSearchParams(nextParams);
  };

  // Preset dates calculation (systems base date is 2026-07-24)
  const getPresetDates = (preset: string) => {
    if (preset === 'all' || preset === 'custom') {
      return { date_from: '', date_to: '' };
    }
    const baseDate = new Date('2026-07-24');
    const toDate = new Date(baseDate);
    const fromDate = new Date(baseDate);

    if (preset === '1_day') {
      fromDate.setDate(baseDate.getDate() - 1);
    } else if (preset === '3_days') {
      fromDate.setDate(baseDate.getDate() - 3);
    } else if (preset === '7_days') {
      fromDate.setDate(baseDate.getDate() - 7);
    }

    const formatDateLocal = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      date_from: formatDateLocal(fromDate),
      date_to: formatDateLocal(toDate)
    };
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    setActiveFilterDropdown(null);
  };

  const handleFieldChange = (key: string, value: string) => {
    const updates: Record<string, any> = { [key]: value, page: 1 };
    if (key === 'time_preset') {
      if (value !== 'custom') {
        const preset = getPresetDates(value);
        updates.date_from = preset.date_from;
        updates.date_to = preset.date_to;
      }
    }
    updateFilters(updates);
  };

  const handleCustomDateSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (formDateFrom && formDateTo && formDateTo < formDateFrom) {
      toast.error('Ngày kết thúc không được nhỏ hơn ngày bắt đầu.');
      return;
    }
    updateFilters({
      date_from: formDateFrom,
      date_to: formDateTo,
      page: 1
    });
  };

  // Load Data
  const loadData = async (showSuccessToast = false) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams: any = {
        search: searchParam,
        status: statusParam,
        category_id: categoryIdParam,
        level: levelParam,
        is_featured: isFeaturedParam,
        time_preset: timePresetParam,
        date_from: dateFromParam,
        date_to: dateToParam,
        sort_by: sortByParam,
        sort_direction: sortDirParam,
        page: pageParam,
        per_page: perPageParam
      };

      const tableRes = await coursesApi.getCourses(queryParams);

      if (tableRes.success) {
        setItems(tableRes.data.items);
        setMeta(tableRes.meta);
        setSummary(tableRes.data.summary);
        setLastUpdated(formatLastUpdate());

        if (showSuccessToast) {
          toast.success('Danh sách khóa học đã được cập nhật thành công.');
        }

        // Auto Page Adjustment
        if (tableRes.meta && pageParam > tableRes.meta.last_page) {
          updateFilters({ page: 1 });
        }
      } else {
        setError(tableRes.message || 'Lỗi tải danh sách khóa học.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    searchParam,
    statusParam,
    categoryIdParam,
    levelParam,
    isFeaturedParam,
    timePresetParam,
    dateFromParam,
    dateToParam,
    sortByParam,
    sortDirParam,
    pageParam,
    perPageParam
  ]);

  // Sync open drawer on mount if query open_course_id is present
  useEffect(() => {
    const cid = searchParams.get('open_course_id');
    if (cid) {
      const courseId = Number(cid);
      if (courseId) {
        openDetailDrawer(courseId);
      }
    }
  }, [searchParams]);

  // Fetch comments & users for drawer
  useEffect(() => {
    if (activeDetailCourse) {
      const allComments = getComments() || [];
      const courseComments = allComments.filter(
        (cmt: any) => Number(cmt.course_id) === Number(activeDetailCourse.id)
      );
      const sorted = [...courseComments].sort((a: any, b: any) => {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
      setDrawerComments(sorted.slice(0, 5));
      setMockUsers(getUsers() || []);
    }
  }, [activeDetailCourse]);

  const openDetailDrawer = async (courseId: number) => {
    setDetailLoading(true);
    setIsDrawerOpen(true);
    // write to url search params open_course_id
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('open_course_id', String(courseId));
    setSearchParams(nextParams);

    try {
      const res = await coursesApi.getCourse(courseId);
      if (res && res.success) {
        setActiveDetailCourse(res.data);
      } else {
        toast.error(res ? res.message : 'Không tìm thấy chi tiết khóa học.');
        closeDetailDrawer();
      }
    } catch (e) {
      toast.error('Lỗi kết nối tải thông tin chi tiết.');
      closeDetailDrawer();
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailDrawer = () => {
    setIsDrawerOpen(false);
    setActiveDetailCourse(null);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('open_course_id');
    setSearchParams(nextParams);
  };

  // Actions
  const handleToggleFeatured = async () => {
    const { course, targetFeatured } = featuredModal;
    if (!course) return;
    try {
      const res = await coursesApi.updateCourse(course.id, { is_featured: targetFeatured });
      if (res && res.success) {
        toast.success(targetFeatured ? 'Đã đánh dấu nổi bật thành công' : 'Đã bỏ nổi bật thành công');
        setFeaturedModal({ open: false, course: null, targetFeatured: false });
        loadData();
        if (activeDetailCourse && activeDetailCourse.id === course.id) {
          openDetailDrawer(course.id);
        }
      } else {
        toast.error(res ? res.message : 'Thao tác thất bại.');
      }
    } catch (e) {
      toast.error('Lỗi khi gửi yêu cầu cập nhật.');
    }
  };

  const handleHideCourse = async () => {
    const { course } = hideModal;
    if (!course) return;
    try {
      const res = await coursesApi.updateCourse(course.id, { status: 'hidden' });
      if (res && res.success) {
        toast.success(`Đã ẩn thành công khóa học: "${course.title}".`);
        setHideModal({ open: false, course: null });
        loadData();
        if (activeDetailCourse && activeDetailCourse.id === course.id) {
          openDetailDrawer(course.id);
        }
      } else {
        toast.error(res ? res.message : 'Thao tác ẩn thất bại.');
      }
    } catch (e) {
      toast.error('Lỗi khi ẩn khóa học.');
    }
  };

  const handleShowCourse = async () => {
    const { course } = showModal;
    if (!course) return;
    try {
      const res = await coursesApi.updateCourse(course.id, { status: 'published' });
      if (res && res.success) {
        toast.success(`Đã chuyển khóa học về trạng thái công khai: "${course.title}".`);
        setShowModal({ open: false, course: null });
        loadData();
        if (activeDetailCourse && activeDetailCourse.id === course.id) {
          openDetailDrawer(course.id);
        }
      } else {
        toast.error(res ? res.message : 'Thao tác hiển thị lại thất bại.');
      }
    } catch (e) {
      toast.error('Lỗi khi cập nhật trạng thái.');
    }
  };

  const handleRefreshClick = () => {
    setRefreshRotation(prev => prev + 360);
    loadData(true);
  };

  // Sắp xếp cột helper
  const handleSortHeader = (key: string) => {
    let nextOrder = 'asc';
    if (sortByParam === key) {
      nextOrder = sortDirParam === 'asc' ? 'desc' : 'asc';
    }
    updateFilters({
      sort_by: key,
      sort_direction: nextOrder,
      page: 1
    });
  };

  // Helper render count filter chips
  const activeChips = useMemo(() => {
    const list = [];
    if (searchParam) list.push({ key: 'search', label: `Tìm kiếm: "${searchParam}"` });
    if (statusParam) {
      const labels: Record<string, string> = {
        draft: 'Bản nháp',
        pending_review: 'Chờ duyệt',
        published: 'Đã xuất bản',
        hidden: 'Đã bị ẩn',
        rejected: 'Bị từ chối'
      };
      list.push({ key: 'status', label: `Trạng thái: ${labels[statusParam] || statusParam}` });
    }
    if (categoryIdParam) {
      const found = categories.find(c => String(c.id) === categoryIdParam);
      list.push({ key: 'category_id', label: `Danh mục: ${found ? found.name : categoryIdParam}` });
    }
    if (levelParam) {
      const labels: Record<string, string> = {
        beginner: 'Cơ bản',
        intermediate: 'Trung cấp',
        advanced: 'Nâng cao',
        all_levels: 'Mọi trình độ'
      };
      list.push({ key: 'level', label: `Trình độ: ${labels[levelParam] || levelParam}` });
    }
    if (isFeaturedParam) {
      list.push({ key: 'is_featured', label: isFeaturedParam === 'true' ? 'Nổi bật: Có' : 'Nổi bật: Không' });
    }
    if (timePresetParam !== 'all') {
      if (timePresetParam === 'custom' && (dateFromParam || dateToParam)) {
        list.push({ key: 'date_range', label: `Thời gian: ${dateFromParam || '...'} → ${dateToParam || '...'}` });
      } else {
        const labels: Record<string, string> = {
          '1_day': '1 ngày qua',
          '3_days': '3 ngày qua',
          '7_days': '7 ngày qua'
        };
        list.push({ key: 'date_range', label: `Thời gian: ${labels[timePresetParam] || timePresetParam}` });
      }
    }
    return list;
  }, [searchParam, statusParam, categoryIdParam, levelParam, isFeaturedParam, timePresetParam, dateFromParam, dateToParam, categories]);

  const removeSingleChip = (key: string) => {
    if (key === 'date_range') {
      updateFilters({ time_preset: 'all', date_from: '', date_to: '' });
    } else {
      updateFilters({ [key]: '' });
    }
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* II. PHẦN TIÊU ĐỀ TRANG */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[10px] text-mid-gray uppercase tracking-wider mb-1 font-semibold">
            <span>Dashboard</span>
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <span>Khóa học</span>
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-ink">Quản lý khóa học</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-tight">
              Quản lý khóa học
            </h1>
          </div>
          <p className="text-xs text-mid-gray mt-0.5">
            Theo dõi và quản lý toàn bộ khóa học đang có trên hệ thống. Tổng số:{' '}
            <span className="font-bold text-ink">{summary.total_courses}</span> khóa học.
          </p>
          <p className="text-[10px] text-mid-gray/80 mt-1">
            Cập nhật lần cuối: <span className="font-medium text-mid-gray">{lastUpdated}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* Refresh button */}
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={loading}
            className="h-9 w-9 flex items-center justify-center rounded-full border border-hairline bg-paper text-ink shrink-0 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            aria-label="Làm mới dữ liệu"
          >
            <svg
              style={{ transform: `rotate(${refreshRotation}deg)` }}
              className="w-4 h-4 transition-transform duration-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {/* III. KPI TRẠNG THÁI (6 cards, đúng màu sắc & cấu trúc HTML mới) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI: Tổng khóa học */}
        <button
          type="button"
          onClick={() => handleFieldChange('status', '')}
          className="text-left w-full rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/40 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Tổng khóa học</span>
            <svg className="w-4 h-4 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10M6 10h10" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-ink leading-none">{summary.total_courses}</span>
            <p className="text-[9px] text-mid-gray mt-1">Toàn bộ hệ thống</p>
          </div>
        </button>

        {/* KPI: Đã xuất bản */}
        <button
          type="button"
          onClick={() => handleFieldChange('status', 'published')}
          className="text-left w-full rounded-[6px] border border-hairline border-t-2 border-t-success bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/40 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-success">Đã xuất bản</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-success"></span>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-success leading-none">{summary.published_courses}</span>
            <p className="text-[9px] text-mid-gray mt-1">Công khai học tập</p>
          </div>
        </button>

        {/* KPI: Chờ duyệt */}
        <button
          type="button"
          onClick={() => handleFieldChange('status', 'pending_review')}
          className="text-left w-full rounded-[6px] border border-hairline border-t-2 border-t-warning bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/40 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-warning">Chờ duyệt</span>
            <svg className="w-4 h-4 text-warning/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-warning leading-none">{summary.pending_review_courses}</span>
            <p className="text-[9px] text-mid-gray mt-1 flex items-center gap-1">
              Cần kiểm duyệt <span className="underline text-[8px] hover:text-ink font-semibold">Xem</span>
            </p>
          </div>
        </button>

        {/* KPI: Bản nháp */}
        <button
          type="button"
          onClick={() => handleFieldChange('status', 'draft')}
          className="text-left w-full rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/40 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Bản nháp</span>
            <svg className="w-4 h-4 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-ink leading-none">{summary.draft_courses}</span>
            <p className="text-[9px] text-mid-gray mt-1">Đang hoàn thiện</p>
          </div>
        </button>

        {/* KPI: Đã bị ẩn */}
        <button
          type="button"
          onClick={() => handleFieldChange('status', 'hidden')}
          className="text-left w-full rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/40 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Đã bị ẩn</span>
            <svg className="w-4 h-4 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-ink leading-none">{summary.hidden_courses}</span>
            <p className="text-[9px] text-mid-gray mt-1">Không hiển thị công khai</p>
          </div>
        </button>

        {/* KPI: Bị từ chối */}
        <button
          type="button"
          onClick={() => handleFieldChange('status', 'rejected')}
          className="text-left w-full rounded-[6px] border border-hairline border-t-2 border-t-danger-brick bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/40 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-danger-brick">Bị từ chối</span>
            <svg className="w-4 h-4 text-danger-brick/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-danger-brick leading-none">{summary.rejected_courses}</span>
            <p className="text-[9px] text-mid-gray mt-1">Cần giảng viên sửa</p>
          </div>
        </button>
      </div>

      {/* IV. THANH THỐNG KÊ PHỤ (Một hàng, đúng 5 mục ngăn cách bằng đường kẻ dọc) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 rounded-[6px] border border-hairline bg-surface-alt p-3.5 select-none text-xs">
        <div className="flex flex-col gap-0.5 border-r border-hairline/60 last:border-none pr-3">
          <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider">Khóa mới (30 ngày)</span>
          <span className="text-base font-bold text-ink leading-tight font-sans">{summary.new_courses_30_days}</span>
        </div>
        <div className="flex flex-col gap-0.5 border-r border-hairline/60 last:border-none pr-3">
          <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider">Tổng lượt ghi danh</span>
          <span className="text-base font-bold text-ink leading-tight font-sans">
            {new Intl.NumberFormat('vi-VN').format(summary.total_enrollments)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 border-r border-hairline/60 last:border-none pr-3">
          <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider">Đơn đã thanh toán</span>
          <span className="text-base font-bold text-ink leading-tight font-sans">
            {new Intl.NumberFormat('vi-VN').format(summary.total_paid_orders)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 border-r border-hairline/60 last:border-none pr-3">
          <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider">Doanh thu gộp</span>
          <span className="text-base font-bold text-ink leading-tight font-sans">
            {formatVND(summary.total_gross_revenue)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 last:border-none">
          <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider">Đánh giá trung bình</span>
          <span className="text-base font-bold text-warning leading-tight flex items-center gap-1 font-sans">
            {summary.average_rating?.toFixed(1) || '0.0'}{' '}
            <svg className="w-3.5 h-3.5 fill-current text-warning inline" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </span>
        </div>
      </div>

      {/* V. THANH LỌC (Khớp chính xác giao diện HTML gốc, h-10) */}
      <section className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle w-full min-w-0">
        <form className="p-0 flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-wrap items-end gap-3.5 w-full">
            {/* TÌM KIẾM */}
            <div className="flex-grow min-w-[220px] flex flex-col gap-1.5">
              <label htmlFor="filter-search" className="text-[10px] font-bold uppercase tracking-wider text-mid-gray mb-1.5 select-none">
                TÌM KIẾM
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="filter-search"
                  value={formSearch}
                  onChange={(e) => {
                    setFormSearch(e.target.value);
                    updateFilters({ search: e.target.value, page: 1 });
                  }}
                  placeholder="Tìm theo tên, slug, giảng viên..."
                  className="w-full h-10 pl-8 pr-3 text-xs bg-canvas border border-hairline rounded-[6px] outline-none text-ink font-semibold"
                />
                <svg className="w-3.5 h-3.5 text-mid-gray/60 absolute left-3 top-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
            </div>

            {/* TRẠNG THÁI */}
            <FilterSelect
              label="Trạng thái"
              value={formStatus}
              options={[
                { value: '', label: 'Tất cả trạng thái', colorClass: 'text-neutral-700', hoverBgClass: 'hover:bg-neutral-50' },
                { value: 'draft', label: 'Bản nháp', colorClass: 'text-neutral-500', hoverBgClass: 'hover:bg-neutral-50' },
                { value: 'pending_review', label: 'Chờ duyệt', colorClass: 'text-warning', hoverBgClass: 'hover:bg-warning/10' },
                { value: 'published', label: 'Đã xuất bản', colorClass: 'text-success', hoverBgClass: 'hover:bg-success/10' },
                { value: 'hidden', label: 'Đã bị ẩn', colorClass: 'text-mid-gray', hoverBgClass: 'hover:bg-neutral-50' },
                { value: 'rejected', label: 'Bị từ chối', colorClass: 'text-danger-brick', hoverBgClass: 'hover:bg-danger-brick/10' }
              ]}
              onChange={(val) => handleFieldChange('status', val)}
              placeholder="Tất cả trạng thái"
              id="course-status"
              activeId={activeFilterDropdown}
              setActiveId={setActiveFilterDropdown}
              className="w-full sm:w-[140px]"
            />

            {/* DANH MỤC */}
            <FilterSelect
              label="Danh mục"
              value={formCategory}
              options={[
                { value: '', label: 'Tất cả danh mục', colorClass: 'text-neutral-700', hoverBgClass: 'hover:bg-neutral-50' },
                ...categories.map(cat => ({
                  value: String(cat.id),
                  label: cat.name,
                  colorClass: 'text-neutral-700',
                  hoverBgClass: 'hover:bg-neutral-50'
                }))
              ]}
              onChange={(val) => handleFieldChange('category_id', val)}
              placeholder="Tất cả danh mục"
              id="course-category"
              activeId={activeFilterDropdown}
              setActiveId={setActiveFilterDropdown}
              className="w-full sm:w-[150px]"
            />

            {/* TRÌNH ĐỘ */}
            <FilterSelect
              label="Trình độ"
              value={formLevel}
              options={[
                { value: '', label: 'Tất cả trình độ', colorClass: 'text-neutral-700', hoverBgClass: 'hover:bg-neutral-50' },
                { value: 'beginner', label: 'Cơ bản', colorClass: 'text-blue-600', hoverBgClass: 'hover:bg-blue-50' },
                { value: 'intermediate', label: 'Trung cấp', colorClass: 'text-amber-600', hoverBgClass: 'hover:bg-amber-50' },
                { value: 'advanced', label: 'Nâng cao', colorClass: 'text-rose-700', hoverBgClass: 'hover:bg-rose-50' },
                { value: 'all_levels', label: 'Mọi trình độ', colorClass: 'text-purple-600', hoverBgClass: 'hover:bg-purple-50' }
              ]}
              onChange={(val) => handleFieldChange('level', val)}
              placeholder="Tất cả trình độ"
              id="course-level"
              activeId={activeFilterDropdown}
              setActiveId={setActiveFilterDropdown}
              className="w-full sm:w-[130px]"
            />

            {/* NỔI BẬT */}
            <FilterSelect
              label="Nổi bật"
              value={formFeatured}
              options={[
                { value: '', label: 'Tất cả', colorClass: 'text-neutral-700', hoverBgClass: 'hover:bg-neutral-50' },
                { value: 'true', label: 'Đang nổi bật', colorClass: 'text-amber-600', hoverBgClass: 'hover:bg-amber-50' },
                { value: 'false', label: 'Không nổi bật', colorClass: 'text-neutral-500', hoverBgClass: 'hover:bg-neutral-50' }
              ]}
              onChange={(val) => handleFieldChange('is_featured', val)}
              placeholder="Tất cả nổi bật"
              id="course-featured"
              activeId={activeFilterDropdown}
              setActiveId={setActiveFilterDropdown}
              className="w-full sm:w-[120px]"
            />

            {/* THỜI GIAN */}
            <FilterSelect
              label="Thời gian"
              value={formTimePreset}
              options={[
                { value: 'all', label: 'Tất cả thời gian', colorClass: 'text-neutral-700', hoverBgClass: 'hover:bg-neutral-50' },
                { value: '1_day', label: '1 ngày qua', colorClass: 'text-emerald-600', hoverBgClass: 'hover:bg-emerald-50' },
                { value: '3_days', label: '3 ngày qua', colorClass: 'text-blue-600', hoverBgClass: 'hover:bg-blue-50' },
                { value: '7_days', label: '7 ngày qua', colorClass: 'text-purple-600', hoverBgClass: 'hover:bg-purple-50' },
                { value: 'custom', label: 'Tùy chọn ngày', colorClass: 'text-rose-700', hoverBgClass: 'hover:bg-rose-50' }
              ]}
              onChange={(val) => {
                const updates: Record<string, any> = { time_preset: val, page: 1 };
                if (val !== 'custom') {
                  const preset = getPresetDates(val);
                  updates.date_from = preset.date_from;
                  updates.date_to = preset.date_to;
                }
                updateFilters(updates);
              }}
              placeholder="Tất cả thời gian"
              id="course-time"
              activeId={activeFilterDropdown}
              setActiveId={setActiveFilterDropdown}
              className="w-full sm:w-[150px]"
            />

            {/* SẮP XẾP + NÚT X (w-full sm:w-[210px]) */}
            <div className="flex flex-col gap-1.5 w-full sm:w-[210px]">
              <span className="block text-[10px] font-bold text-mid-gray uppercase tracking-wider mb-1.5 select-none">
                SẮP XẾP
              </span>
              <div className="flex items-center gap-2 h-10 w-full">
                <FilterSelect
                  label=""
                  value={formSortBy}
                  options={[
                    { value: 'updated_at', label: 'Mới cập nhật', colorClass: 'text-neutral-700', hoverBgClass: 'hover:bg-neutral-50' },
                    { value: 'created_at', label: 'Mới tạo', colorClass: 'text-neutral-500', hoverBgClass: 'hover:bg-neutral-50' },
                    { value: 'title', label: 'Tên khóa học (A-Z)', colorClass: 'text-blue-600', hoverBgClass: 'hover:bg-blue-50' },
                    { value: 'enrollment_count', label: 'Lượt ghi danh', colorClass: 'text-emerald-600', hoverBgClass: 'hover:bg-emerald-50' },
                    { value: 'gross_revenue', label: 'Doanh thu', colorClass: 'text-teal-600', hoverBgClass: 'hover:bg-teal-50' },
                    { value: 'average_rating', label: 'Đánh giá cao nhất', colorClass: 'text-amber-600', hoverBgClass: 'hover:bg-amber-50' },
                    { value: 'price', label: 'Giá bán', colorClass: 'text-rose-700', hoverBgClass: 'hover:bg-rose-50' }
                  ]}
                  onChange={(val) => handleFieldChange('sort_by', val)}
                  placeholder="Mới cập nhật"
                  id="course-sort"
                  activeId={activeFilterDropdown}
                  setActiveId={setActiveFilterDropdown}
                  className="flex-grow min-w-0"
                />
                <button
                  type="button"
                  onClick={handleResetFilters}
                  title="Đặt lại bộ lọc"
                  className="h-10 w-8 shrink-0 flex items-center justify-center text-danger-brick hover:bg-red-50/50 border border-hairline rounded-[6px] transition-colors cursor-pointer bg-paper"
                  aria-label="Đặt lại bộ lọc"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Hàng Tùy chọn ngày (chỉ hiện khi chọn custom) */}
          {formTimePreset === 'custom' && (
            <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3 pt-3 border-t border-hairline/60">
              <div className="flex items-center gap-2">
                <span className="text-xs text-mid-gray whitespace-nowrap">Từ ngày:</span>
                <input
                  type="date"
                  value={formDateFrom}
                  onChange={(e) => setFormDateFrom(e.target.value)}
                  className="h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] outline-none text-ink w-full sm:w-[150px] font-semibold"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-mid-gray whitespace-nowrap">Đến ngày:</span>
                <input
                  type="date"
                  value={formDateTo}
                  onChange={(e) => setFormDateTo(e.target.value)}
                  className="h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] outline-none text-ink w-full sm:w-[150px] font-semibold"
                />
              </div>
              <button
                type="button"
                onClick={() => handleCustomDateSubmit()}
                className="h-10 px-4 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
              >
                Áp dụng
              </button>
            </div>
          )}
        </form>
      </section>

      {/* VI. TAB TRẠNG THÁI & BẢNG DỮ LIỆU */}
      <section id="courses-results-section" className="rounded-[6px] border border-hairline bg-paper shadow-subtle overflow-hidden flex flex-col min-h-[400px]">
        {/* Quick Tabs */}
        <div className="flex items-center justify-between border-b border-hairline/60 bg-paper shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex" id="quick-tabs-container">
            <button
              type="button"
              onClick={() => handleFieldChange('status', '')}
              className={cn(
                "px-5 py-3 text-xs select-none whitespace-nowrap cursor-pointer transition-all border-b-2 border-transparent text-mid-gray hover:text-ink bg-transparent",
                !statusParam ? "font-semibold border-ink text-ink" : "font-medium"
              )}
            >
              Tất cả (<span className="tab-count">{summary.total_courses}</span>)
            </button>
            <button
              type="button"
              onClick={() => handleFieldChange('status', 'published')}
              className={cn(
                "px-5 py-3 text-xs select-none whitespace-nowrap cursor-pointer transition-all border-b-2 border-transparent text-mid-gray hover:text-ink bg-transparent",
                statusParam === 'published' ? "font-semibold border-ink text-ink" : "font-medium"
              )}
            >
              Đã xuất bản (<span className="tab-count">{summary.published_courses}</span>)
            </button>
            <button
              type="button"
              onClick={() => handleFieldChange('status', 'pending_review')}
              className={cn(
                "px-5 py-3 text-xs select-none whitespace-nowrap cursor-pointer transition-all border-b-2 border-transparent text-mid-gray hover:text-ink bg-transparent",
                statusParam === 'pending_review' ? "font-semibold border-ink text-ink" : "font-medium"
              )}
            >
              Chờ duyệt (<span className="tab-count">{summary.pending_review_courses}</span>)
            </button>
            <button
              type="button"
              onClick={() => handleFieldChange('status', 'draft')}
              className={cn(
                "px-5 py-3 text-xs select-none whitespace-nowrap cursor-pointer transition-all border-b-2 border-transparent text-mid-gray hover:text-ink bg-transparent",
                statusParam === 'draft' ? "font-semibold border-ink text-ink" : "font-medium"
              )}
            >
              Bản nháp (<span className="tab-count">{summary.draft_courses}</span>)
            </button>
            <button
              type="button"
              onClick={() => handleFieldChange('status', 'hidden')}
              className={cn(
                "px-5 py-3 text-xs select-none whitespace-nowrap cursor-pointer transition-all border-b-2 border-transparent text-mid-gray hover:text-ink bg-transparent",
                statusParam === 'hidden' ? "font-semibold border-ink text-ink" : "font-medium"
              )}
            >
              Đã bị ẩn (<span className="tab-count">{summary.hidden_courses}</span>)
            </button>
            <button
              type="button"
              onClick={() => handleFieldChange('status', 'rejected')}
              className={cn(
                "px-5 py-3 text-xs select-none whitespace-nowrap cursor-pointer transition-all border-b-2 border-transparent text-mid-gray hover:text-ink bg-transparent",
                statusParam === 'rejected' ? "font-semibold border-ink text-ink" : "font-medium"
              )}
            >
              Bị từ chối (<span className="tab-count">{summary.rejected_courses}</span>)
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        {activeChips.length > 0 && (
          <div id="filter-chips-container" className="flex flex-wrap items-center gap-2 p-3 bg-canvas/35 border-b border-hairline text-xs select-none">
            <span className="text-mid-gray text-[10px] font-semibold uppercase tracking-wider mr-1">Bộ lọc đang dùng:</span>
            <div id="filter-chips-list" className="flex flex-wrap gap-1.5">
              {activeChips.map((chip) => (
                <div key={chip.key} className="flex items-center gap-1 bg-paper border border-hairline px-2.5 py-0.5 rounded-[4px] font-medium text-ink">
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={() => removeSingleChip(chip.key)}
                    className="text-mid-gray hover:text-danger-brick p-0.5 rounded transition-colors cursor-pointer bg-transparent border-none"
                    aria-label={`Xóa bộ lọc ${chip.label}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[10px] text-danger-brick font-semibold ml-2 transition-all cursor-pointer bg-transparent border-none font-sans"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        {/* VIII. CỘT BẢNG CHÍNH XÁC (8 cột) */}
        <div className="flex-grow overflow-y-auto overflow-x-auto custom-scrollbar relative max-h-[560px] w-full min-w-0">
          <table className="w-full text-left border-collapse table-fixed min-w-[1180px]">
            <thead className="sticky top-0 bg-surface-alt border-b border-hairline z-10 select-none">
              <tr className="text-[10px] font-bold text-mid-gray uppercase tracking-wider h-10">
                {/* 1. KHÓA HỌC */}
                <th
                  onClick={() => handleSortHeader('title')}
                  className={cn(
                    "p-3 pl-4 w-[340px] font-sans cursor-pointer hover:bg-canvas/50 transition-colors",
                    sortByParam === 'title' && 'text-blue-600'
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span>Khóa học</span>
                    {sortByParam === 'title' && (
                      <span className="text-[8px]">{sortDirParam === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                {/* 2. DANH MỤC */}
                <th
                  onClick={() => handleSortHeader('category_name')}
                  className={cn(
                    "p-3 w-[140px] font-sans cursor-pointer hover:bg-canvas/50 transition-colors",
                    sortByParam === 'category_name' && 'text-blue-600'
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span>Danh mục</span>
                    {sortByParam === 'category_name' && (
                      <span className="text-[8px]">{sortDirParam === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                {/* 3. GIÁ BÁN */}
                <th
                  onClick={() => handleSortHeader('price')}
                  className={cn(
                    "p-3 w-[110px] font-sans cursor-pointer hover:bg-canvas/50 transition-colors",
                    sortByParam === 'price' && 'text-blue-600'
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span>Giá bán</span>
                    {sortByParam === 'price' && (
                      <span className="text-[8px]">{sortDirParam === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                {/* 4. HỌC VIÊN */}
                <th
                  onClick={() => handleSortHeader('enrollment_count')}
                  className={cn(
                    "p-3 w-[90px] font-sans cursor-pointer hover:bg-canvas/50 transition-colors",
                    sortByParam === 'enrollment_count' && 'text-blue-600'
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span>Học viên</span>
                    {sortByParam === 'enrollment_count' && (
                      <span className="text-[8px]">{sortDirParam === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                {/* 5. DOANH THU */}
                <th
                  onClick={() => handleSortHeader('gross_revenue')}
                  className={cn(
                    "p-3 w-[120px] font-sans cursor-pointer hover:bg-canvas/50 transition-colors",
                    sortByParam === 'gross_revenue' && 'text-blue-600'
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span>Doanh thu</span>
                    {sortByParam === 'gross_revenue' && (
                      <span className="text-[8px]">{sortDirParam === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                {/* 6. ĐÁNH GIÁ */}
                <th
                  onClick={() => handleSortHeader('average_rating')}
                  className={cn(
                    "p-3 w-[140px] font-sans cursor-pointer hover:bg-canvas/50 transition-colors",
                    sortByParam === 'average_rating' && 'text-blue-600'
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span>Đánh giá</span>
                    {sortByParam === 'average_rating' && (
                      <span className="text-[8px]">{sortDirParam === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                {/* 7. TRẠNG THÁI */}
                <th
                  onClick={() => handleSortHeader('status')}
                  className={cn(
                    "p-3 w-[110px] font-sans cursor-pointer hover:bg-canvas/50 transition-colors",
                    sortByParam === 'status' && 'text-blue-600'
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span>Trạng thái</span>
                    {sortByParam === 'status' && (
                      <span className="text-[8px]">{sortDirParam === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
                {/* 8. CẬP NHẬT */}
                <th
                  onClick={() => handleSortHeader('updated_at')}
                  className={cn(
                    "p-3 w-[130px] font-sans cursor-pointer hover:bg-canvas/50 transition-colors",
                    sortByParam === 'updated_at' && 'text-blue-600'
                  )}
                >
                  <div className="flex items-center gap-1">
                    <span>Cập nhật</span>
                    {sortByParam === 'updated_at' && (
                      <span className="text-[8px]">{sortDirParam === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody id="courses-table-body" className="divide-y divide-hairline text-xs">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse h-[70px]">
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-[88px] h-[54px] bg-canvas rounded skeleton shrink-0"></div>
                        <div className="space-y-1.5 flex-grow min-w-0">
                          <div className="h-3 w-28 bg-canvas rounded skeleton"></div>
                          <div className="h-2.5 w-20 bg-canvas rounded skeleton"></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><div className="h-3 w-20 bg-canvas rounded skeleton"></div></td>
                    <td className="p-3"><div className="h-3 w-16 bg-canvas rounded skeleton"></div></td>
                    <td className="p-3"><div className="h-3 w-12 bg-canvas rounded skeleton"></div></td>
                    <td className="p-3"><div className="h-3 w-16 bg-canvas rounded skeleton"></div></td>
                    <td className="p-3"><div className="h-3.5 w-20 bg-canvas rounded skeleton"></div></td>
                    <td className="p-3"><div className="h-3.5 w-16 bg-canvas rounded skeleton"></div></td>
                    <td className="p-3"><div className="h-3 w-24 bg-canvas rounded skeleton"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-brick-soft text-danger-brick">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-ink">Lỗi tải dữ liệu</h3>
                        <p className="text-xs text-mid-gray mt-1">{error}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => loadData()}
                        className="px-4 py-2 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
                      >
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-mid-gray">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-ink" id="empty-title">
                          {activeChips.length > 0
                            ? 'Không tìm thấy khóa học phù hợp'
                            : 'Chưa có khóa học nào'}
                        </h3>
                        <p className="text-xs text-mid-gray mt-1" id="empty-desc">
                          {activeChips.length > 0
                            ? 'Vui lòng điều chỉnh hoặc đặt lại các bộ lọc hiện tại.'
                            : 'Các khóa học mới của giảng viên sẽ xuất hiện tại đây.'}
                        </p>
                      </div>
                      {activeChips.length > 0 && (
                        <button
                          type="button"
                          id="btn-empty-reset"
                          onClick={handleResetFilters}
                          className="px-4 py-2 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
                        >
                          Đặt lại bộ lọc
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((course: any) => {
                  const rawTitle = course.title || 'Khóa học không tên';
                  const displayTitle = rawTitle.length > 42 ? `${rawTitle.substring(0, 40)}...` : rawTitle;

                  // Get reviews count
                  const ratingVal = course.average_rating || 0;
                  const reviewCountVal = course.review_count || 0;

                  // Count course comments
                  const allComments = getComments() || [];
                  const courseCommentsCount = allComments.filter(
                    (cmt: any) => Number(cmt.course_id) === Number(course.id)
                  ).length;

                  // Categories list formatting
                  let categoriesContent = '---';
                  if (course.categories && course.categories.length > 0) {
                    const names = course.categories.map((cat: any) => cat.name);
                    if (names.length > 2) {
                      categoriesContent = `${names.slice(0, 2).join(', ')} (+${names.length - 2})`;
                    } else {
                      categoriesContent = names.join(', ');
                    }
                  }

                  return (
                    <tr
                      key={course.id}
                      onClick={() => openDetailDrawer(course.id)}
                      data-row-id={course.id}
                      data-course-id={course.id}
                      data-course-row="true"
                      tabIndex={0}
                      aria-label={`Xem chi tiết khóa học ${course.title}`}
                      className="hover:bg-surface-alt/55 transition-colors align-middle h-[70px] cursor-pointer"
                    >
                      {/* 1. KHÓA HỌC */}
                      <td className="p-3 pl-4">
                        <div className="flex items-center gap-3 group min-w-0">
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            loading="lazy"
                            className="h-10 w-16 rounded-[4px] object-cover bg-canvas border border-hairline group-hover:opacity-90 transition-opacity shrink-0"
                            onError={(e: any) => {
                              e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            {course.is_featured && (
                              <span className="inline-block text-[9px] font-bold text-warning uppercase bg-warning/10 px-1.5 py-0.5 rounded mb-1 select-none">
                                Nổi bật
                              </span>
                            )}
                            <span
                              className="font-bold text-ink leading-snug block truncate group-hover:text-ink-soft transition-colors text-xs"
                              title={rawTitle}
                            >
                              {displayTitle}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1 truncate">
                              <span className="font-medium text-ink/80 text-[10px] whitespace-nowrap">
                                {course.instructor?.full_name || 'Chưa có GV'}
                              </span>
                              <span className="text-hairline/60">•</span>
                              <LevelBadge level={course.level} />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. DANH MỤC */}
                      <td className="p-3 text-mid-gray text-[11px] truncate" title={course.categories?.map((c: any) => c.name).join(', ')}>
                        <span className="font-medium text-ink">{categoriesContent}</span>
                      </td>

                      {/* 3. GIÁ BÁN */}
                      <td className="p-3">
                        {course.sale_price !== null && course.sale_price !== undefined && course.sale_price < course.price ? (
                          <div>
                            <div className="font-bold text-ink">{formatVND(course.sale_price)}</div>
                            <div className="text-[10px] text-mid-gray/80 line-through mt-0.5">{formatVND(course.price)}</div>
                          </div>
                        ) : (
                          <div className="font-bold text-ink">{formatVND(course.price)}</div>
                        )}
                      </td>

                      {/* 4. HỌC VIÊN */}
                      <td className="p-3 font-semibold text-ink font-sans">
                        {new Intl.NumberFormat('vi-VN').format(course.enrollment_count || 0)}
                      </td>

                      {/* 5. DOANH THU */}
                      <td className="p-3 font-bold text-ink font-sans">
                        {formatVND(course.gross_revenue)}
                      </td>

                      {/* 6. ĐÁNH GIÁ (Bố cục HTML mới) */}
                      <td className="p-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <StarRating rating={ratingVal} />
                            <span className="font-bold text-ink text-xs leading-none">
                              {ratingVal > 0 ? ratingVal.toFixed(1) : '0.0'}
                            </span>
                          </div>
                          <div className="text-[9.5px] text-mid-gray font-medium mt-0.5 whitespace-nowrap">
                            {reviewCountVal} đánh giá <span className="text-hairline/60">•</span> {courseCommentsCount} bình luận
                          </div>
                        </div>
                      </td>

                      {/* 7. TRẠNG THÁI */}
                      <td className="p-3">
                        <CourseStatusMarker status={course.status} />
                      </td>

                      {/* 8. CẬP NHẬT */}
                      <td className="p-3 text-mid-gray/90 font-medium text-[11px] font-sans whitespace-nowrap" title={`Cập nhật đầy đủ: ${formatDateTime(course.updated_at)}`}>
                        {formatDateTime(course.updated_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 7. Pagination Footer (Vừa khít trong wrapper card) */}
        {meta && (
          <div id="pagination-wrapper" className="px-4 py-3 bg-surface-alt/30 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
            <div className="text-xs text-mid-gray">
              Đang hiển thị{' '}
              <span className="font-semibold text-ink" id="pag-showing-range">
                {`${(pageParam - 1) * perPageParam + 1}-${Math.min(pageParam * perPageParam, meta.total)}`}
              </span>
              {' trong tổng số '}
              <span className="font-semibold text-ink" id="pag-total-records">{meta.total}</span>
              {' khóa học'}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-mid-gray">Hiển thị</span>
                <select
                  id="courses-pagination-per-page"
                  value={perPageParam}
                  onChange={(e) => updateFilters({ per_page: e.target.value, page: 1 })}
                  className="h-7 px-2 bg-canvas border border-hairline rounded focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink cursor-pointer font-medium"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-mid-gray">dòng</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={pageParam === 1}
                  onClick={() => updateFilters({ page: pageParam - 1 })}
                  className="p-1.5 rounded-full border border-hairline transition-colors flex items-center justify-center shrink-0 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-ink" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                {(() => {
                  const pages = [];
                  const maxButtons = 5;
                  let startPage = Math.max(1, pageParam - Math.floor(maxButtons / 2));
                  let endPage = startPage + maxButtons - 1;

                  if (endPage > meta.last_page) {
                    endPage = meta.last_page;
                    startPage = Math.max(1, endPage - maxButtons + 1);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        type="button"
                        onClick={() => updateFilters({ page: i })}
                        className={cn(
                          "h-7.5 w-7.5 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer border-none",
                          i === pageParam
                            ? "bg-ink text-white shadow-sm"
                            : "bg-transparent border border-transparent hover:bg-canvas hover:text-ink text-mid-gray"
                        )}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pages;
                })()}
                <button
                  type="button"
                  disabled={pageParam === meta.last_page}
                  onClick={() => updateFilters({ page: pageParam + 1 })}
                  className="p-1.5 rounded-full border border-hairline transition-colors flex items-center justify-center shrink-0 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-ink" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* DRAWER: DETAILS VIEW (with comment section from HTML mới) */}
      {isDrawerOpen && (
        <>
          <div onClick={closeDetailDrawer} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in" />
          <div
            id="course-detail-drawer"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-paper border-l border-hairline shadow-subtle flex flex-col h-full animate-in slide-in-from-right duration-300"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-hairline flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-semibold text-ink">Chi tiết khóa học</h2>
                <p className="text-[10px] text-mid-gray mt-0.5">
                  ID: <span className="font-medium" id="detail-course-id">{activeDetailCourse?.id || '---'}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={closeDetailDrawer}
                className="rounded-[6px] border border-hairline p-1.5 hover:bg-canvas text-ink transition-colors cursor-pointer bg-transparent border-none"
                aria-label="Đóng Drawer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-grow overflow-y-auto p-5 space-y-6 custom-scrollbar text-xs">
              {detailLoading ? (
                <div className="space-y-4">
                  <div className="aspect-video w-full bg-canvas rounded-[6px] skeleton animate-pulse"></div>
                  <div className="h-5 w-3/4 bg-canvas rounded skeleton animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-canvas rounded skeleton animate-pulse"></div>
                </div>
              ) : activeDetailCourse ? (
                <div className="space-y-6">
                  {/* PHẦN 1 – TỔNG QUAN */}
                  <section className="space-y-3">
                    <div className="aspect-video w-full rounded-[6px] bg-canvas overflow-hidden border border-hairline relative">
                      <img
                        src={activeDetailCourse.thumbnail_url}
                        alt="Thumbnail"
                        id="detail-thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap text-[10px]">
                        <CourseStatusMarker status={activeDetailCourse.status} />
                        {activeDetailCourse.is_featured && (
                          <span className="font-semibold text-warning bg-warning-soft px-2 py-0.5 rounded-[4px] border border-warning/10" id="detail-featured-badge">Nổi bật</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-ink leading-tight" id="detail-title">{activeDetailCourse.title}</h3>
                      <p className="text-[10px] text-mid-gray font-mono break-all animate-none" id="detail-slug">{activeDetailCourse.slug}</p>
                    </div>
                    <p className="text-xs text-mid-gray leading-relaxed italic" id="detail-short-desc">{activeDetailCourse.short_description || 'Không có mô tả ngắn.'}</p>
                  </section>

                  {/* PHẦN LÝ DO TỪ CHỐI */}
                  {activeDetailCourse.status === 'rejected' && activeDetailCourse.admin_reject_reason && (
                    <section className="rounded-[6px] bg-danger-brick-soft/15 border border-danger-brick/10 p-3 space-y-1.5 text-danger-brick" id="detail-reject-reason-section">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                        <svg className="w-4 h-4 shrink-0 text-danger-brick" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        Lý do từ chối kiểm duyệt:
                      </div>
                      <p className="leading-normal font-medium" id="detail-reject-reason">{activeDetailCourse.admin_reject_reason}</p>
                    </section>
                  )}

                  {/* PHẦN 2 – GIẢNG VIÊN */}
                  <section className="border-t border-hairline/60 pt-4 space-y-2">
                    <h4 className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">Giảng viên sở hữu</h4>
                    <div className="rounded-[6px] bg-surface-alt p-3 flex justify-between items-center gap-3 border border-hairline/40">
                      <div>
                        <p className="font-bold text-ink" id="detail-instructor-name">{activeDetailCourse.instructor?.full_name || '---'}</p>
                        <p className="text-[10px] text-mid-gray mt-0.5" id="detail-instructor-email">{activeDetailCourse.instructor?.email || '---'}</p>
                      </div>
                      <span
                        id="detail-instructor-status"
                        className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded border",
                          activeDetailCourse.instructor?.status === 'active'
                            ? 'text-success bg-success-soft border-success/15'
                            : 'text-mid-gray bg-canvas border-hairline'
                        )}
                      >
                        {activeDetailCourse.instructor?.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>
                  </section>

                  {/* PHẦN 5 – DANH MỤC */}
                  <section className="border-t border-hairline/60 pt-4 space-y-2">
                    <h4 className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">Danh mục</h4>
                    <div className="flex flex-wrap gap-1.5" id="detail-categories-list">
                      {activeDetailCourse.categories && activeDetailCourse.categories.length > 0 ? (
                        activeDetailCourse.categories.map((cat: any) => (
                          <span key={cat.id} className="text-[10px] font-semibold text-ink bg-canvas px-2.5 py-1 rounded-[4px] border border-hairline">
                            {cat.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-mid-gray">Không có danh mục.</span>
                      )}
                    </div>
                  </section>

                  {/* PHẦN 3 – THÔNG TIN CHUNG */}
                  <section className="border-t border-hairline/60 pt-4 space-y-2.5">
                    <h4 className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">Thông tin chung</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="flex justify-between border-b border-hairline/40 pb-1.5">
                        <span className="text-mid-gray">Trình độ:</span>
                        <span id="detail-level" className="font-semibold text-ink">
                          <LevelBadge level={activeDetailCourse.level} />
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-hairline/40 pb-1.5">
                        <span className="text-mid-gray">Ngôn ngữ:</span>
                        <span className="font-medium text-ink" id="detail-language">{activeDetailCourse.language || 'Tiếng Việt'}</span>
                      </div>
                      <div className="flex justify-between border-b border-hairline/40 pb-1.5">
                        <span className="text-mid-gray">Giá bán gốc:</span>
                        <span className="font-semibold text-ink" id="detail-original-price">{formatVND(activeDetailCourse.price)}</span>
                      </div>
                      <div className="flex justify-between border-b border-hairline/40 pb-1.5">
                        <span className="text-mid-gray">Giá khuyến mãi:</span>
                        <span className="font-semibold text-ink" id="detail-sale-price">
                          {activeDetailCourse.sale_price !== null && activeDetailCourse.sale_price !== undefined ? formatVND(activeDetailCourse.sale_price) : 'Không khuyến mãi'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-hairline/40 pb-1.5">
                        <span className="text-mid-gray">Tổng thời lượng:</span>
                        <span className="font-medium text-ink" id="detail-duration">{formatDuration(activeDetailCourse.total_duration_seconds)}</span>
                      </div>
                      <div className="flex justify-between border-b border-hairline/40 pb-1.5">
                        <span className="text-mid-gray">Video giới thiệu:</span>
                        <span id="detail-video-url">
                          {activeDetailCourse.intro_video_url ? (
                            <a href={activeDetailCourse.intro_video_url} target="_blank" rel="noopener noreferrer" className="text-ink hover:underline font-bold flex items-center gap-1">
                              <span>Xem video</span>
                              <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                              </svg>
                            </a>
                          ) : (
                            'Không có video'
                          )}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* PHẦN 4 – MÔ TẢ & YÊU CẦU & KẾT QUẢ */}
                  <section className="border-t border-hairline/60 pt-4 space-y-3">
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">Mô tả đầy đủ</h4>
                      <p className="text-ink leading-relaxed text-justify whitespace-pre-line" id="detail-desc">{activeDetailCourse.description || 'Không có nội dung mô tả chi tiết.'}</p>
                    </div>
                    <div className="space-y-1.5 pt-2">
                      <h4 className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">Yêu cầu tham gia</h4>
                      <ul className="list-disc pl-4 space-y-1 text-mid-gray leading-relaxed" id="detail-requirements">
                        {activeDetailCourse.requirements && activeDetailCourse.requirements.length > 0 ? (
                          activeDetailCourse.requirements.map((req: string, i: number) => <li key={i}>{req}</li>)
                        ) : (
                          <li className="list-none text-mid-gray">Không yêu cầu kiến thức trước.</li>
                        )}
                      </ul>
                    </div>
                    <div className="space-y-1.5 pt-2">
                      <h4 className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">Kết quả đạt được</h4>
                      <ul className="list-disc pl-4 space-y-1 text-mid-gray leading-relaxed" id="detail-outcomes">
                        {activeDetailCourse.outcomes && activeDetailCourse.outcomes.length > 0 ? (
                          activeDetailCourse.outcomes.map((out: string, i: number) => <li key={i}>{out}</li>)
                        ) : (
                          <li className="list-none text-mid-gray">Không có thông tin kết quả.</li>
                        )}
                      </ul>
                    </div>
                  </section>

                  {/* PHẦN 6 & 7 – THỐNG KÊ CHỈ SỐ */}
                  <section className="border-t border-hairline/60 pt-4 space-y-3">
                    <h4 className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">Chỉ số thống kê</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <div className="rounded-[6px] border border-hairline bg-surface-alt p-3 text-center">
                        <p className="text-[9px] font-semibold text-mid-gray uppercase tracking-wider">Chương / Bài</p>
                        <p className="text-sm font-bold text-ink mt-1">
                          <span id="detail-stat-sections">{activeDetailCourse.summary?.section_count || 0}</span>
                          {' / '}
                          <span id="detail-stat-lessons">{activeDetailCourse.summary?.lesson_count || 0}</span>
                        </p>
                      </div>
                      <div className="rounded-[6px] border border-hairline bg-surface-alt p-3 text-center">
                        <p className="text-[9px] font-semibold text-mid-gray uppercase tracking-wider">Tài liệu học</p>
                        <p className="text-sm font-bold text-ink mt-1" id="detail-stat-assets">{activeDetailCourse.summary?.asset_count || 0}</p>
                      </div>
                      <div className="rounded-[6px] border border-hairline bg-surface-alt p-3 text-center">
                        <p className="text-[9px] font-semibold text-mid-gray uppercase tracking-wider">Tổng ghi danh</p>
                        <p className="text-sm font-bold text-ink mt-1" id="detail-stat-enrollments">
                          {new Intl.NumberFormat('vi-VN').format(activeDetailCourse.enrollment_count || 0)}
                        </p>
                      </div>
                      <div className="rounded-[6px] border border-hairline bg-surface-alt p-3 text-center">
                        <p className="text-[9px] font-semibold text-mid-gray uppercase tracking-wider">Đơn hàng paid</p>
                        <p className="text-sm font-bold text-ink mt-1" id="detail-stat-paid-orders">
                          {new Intl.NumberFormat('vi-VN').format(activeDetailCourse.paid_order_count || 0)}
                        </p>
                      </div>
                      <div className="rounded-[6px] border border-hairline bg-surface-alt p-3 text-center">
                        <p className="text-[9px] font-semibold text-mid-gray uppercase tracking-wider">Tổng bình luận</p>
                        <p className="text-sm font-bold text-ink mt-1" id="detail-stat-comments">
                          {new Intl.NumberFormat('vi-VN').format(activeDetailCourse.summary?.comment_count || 0)}
                        </p>
                      </div>
                      <div className="rounded-[6px] border border-hairline bg-surface-alt p-3 text-center">
                        <p className="text-[9px] font-semibold text-mid-gray uppercase tracking-wider">Doanh thu gộp</p>
                        <p className="text-sm font-bold text-ink mt-1" id="detail-stat-revenue">{formatVND(activeDetailCourse.gross_revenue)}</p>
                      </div>
                    </div>
                  </section>

                  {/* PHẦN ĐÁNH GIÁ TRUNG BÌNH */}
                  <section className="border-t border-hairline/60 pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">Đánh giá</span>
                      <span className="text-base font-bold text-ink font-sans" id="detail-stat-rating">
                        {activeDetailCourse.status === 'published' && activeDetailCourse.average_rating
                          ? activeDetailCourse.average_rating.toFixed(1)
                          : '—'}
                      </span>
                    </div>
                  </section>

                  {/* BÌNH LUẬN GẦN ĐÂY (HTML MỚI) */}
                  <section className="border-t border-hairline/60 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">Bình luận gần đây</h4>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/1/moderation?course_id=${activeDetailCourse.id}&type=comment&scroll_to=results`)}
                        className="text-[10px] font-semibold text-ink hover:underline cursor-pointer bg-transparent border-none"
                      >
                        Xem tất cả
                      </button>
                    </div>

                    <div id="detail-comments-list" className="space-y-3">
                      {drawerComments.length === 0 ? (
                        <div className="p-3 text-center text-xs text-mid-gray italic bg-canvas border border-hairline rounded-[6px]">
                          Khóa học này chưa có bình luận.
                        </div>
                      ) : (
                        drawerComments.map((cmt) => {
                          const sender = mockUsers.find((u) => Number(u.id) === Number(cmt.user_id)) || {};
                          const senderName = sender.full_name || 'Học viên ẩn danh';
                          const senderAvatar = sender.avatar_url || '';
                          const firstLetter = senderName.charAt(0).toUpperCase();

                          let statusDotClass = 'bg-success';
                          let statusText = 'Đang hiển thị';
                          if (cmt.status === 'hidden') {
                            statusDotClass = 'bg-warning';
                            statusText = 'Đã ẩn';
                          } else if (cmt.status === 'deleted') {
                            statusDotClass = 'bg-danger-brick';
                            statusText = 'Đã xóa';
                          } else if (['approved', 'visible', 'published'].includes(cmt.status)) {
                            statusDotClass = 'bg-success';
                            statusText = 'Đang hiển thị';
                          } else {
                            statusDotClass = 'bg-warning';
                            statusText = 'Chờ duyệt';
                          }

                          return (
                            <div key={cmt.id} className="p-3 bg-surface-alt/40 border border-hairline/45 rounded-[6px] flex items-start gap-2.5 hover:bg-surface-alt/75 transition-colors">
                              {senderAvatar ? (
                                <img
                                  src={senderAvatar}
                                  alt={senderName}
                                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-hairline"
                                  onError={(e: any) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
                                  }}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-canvas border border-hairline flex items-center justify-center shrink-0 text-ink font-bold text-xs select-none">
                                  {firstLetter}
                                </div>
                              )}
                              <div className="min-w-0 flex-grow">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-ink text-xs truncate max-w-[120px]">{senderName}</span>
                                  <span className="text-[9px] text-mid-gray whitespace-nowrap">{formatDateTime(cmt.created_at)}</span>
                                </div>
                                <p className="text-xs text-ink/90 leading-relaxed mt-1 line-clamp-3 select-all" title={cmt.content}>
                                  {cmt.content}
                                </p>
                                <div className="flex items-center mt-1.5 justify-between">
                                  <span className="inline-flex items-center gap-1 whitespace-nowrap select-none">
                                    <span className={cn('h-1.5 w-1.5 rounded-full', statusDotClass)}></span>
                                    <span className="text-[10px] font-semibold text-mid-gray">{statusText}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </section>
                </div>
              ) : (
                <div className="text-center text-mid-gray py-12">Không tìm thấy thông tin khóa học.</div>
              )}
            </div>

            {/* Footer actions inside drawer */}
            <div className="px-5 py-4 border-t border-hairline bg-surface-alt flex gap-2 justify-end shrink-0" id="drawer-actions-footer">
              {activeDetailCourse && (
                <>
                  {activeDetailCourse.is_featured ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await closeDetailDrawer();
                        setFeaturedModal({ open: true, course: activeDetailCourse, targetFeatured: false });
                      }}
                      className="px-4 py-1.5 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas hover:bg-hairline text-ink transition-colors cursor-pointer"
                    >
                      Bỏ nổi bật
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        await closeDetailDrawer();
                        setFeaturedModal({ open: true, course: activeDetailCourse, targetFeatured: true });
                      }}
                      className="px-4 py-1.5 text-xs font-semibold rounded-[6px] border border-warning/20 bg-canvas text-warning hover:bg-warning-soft/20 transition-colors cursor-pointer"
                    >
                      Đánh dấu nổi bật
                    </button>
                  )}

                  {activeDetailCourse.status === 'published' && (
                    <button
                      type="button"
                      onClick={async () => {
                        await closeDetailDrawer();
                        setHideModal({ open: true, course: activeDetailCourse });
                      }}
                      className="px-4 py-1.5 text-xs font-semibold rounded-[6px] bg-danger-brick text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
                    >
                      Ẩn khóa học
                    </button>
                  )}

                  {activeDetailCourse.status === 'hidden' && (
                    <button
                      type="button"
                      onClick={async () => {
                        await closeDetailDrawer();
                        setShowModal({ open: true, course: activeDetailCourse });
                      }}
                      className="px-4 py-1.5 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
                    >
                      Hiển thị lại
                    </button>
                  )}

                  {activeDetailCourse.status === 'pending_review' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        closeDetailDrawer();
                        goToCourseReview(activeDetailCourse.id, e);
                      }}
                      className="px-4 py-1.5 text-xs font-semibold rounded-[6px] bg-warning text-ink hover:bg-warning/80 transition-colors cursor-pointer border-none"
                    >
                      Đi tới kiểm duyệt
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* MODAL: FEATURED CONFIRMATION */}
      {featuredModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in">
          <div className="relative w-full max-w-[420px] bg-paper border border-hairline rounded-[6px] shadow-subtle p-5 mx-4 space-y-4">
            <h3 className="text-sm font-bold text-ink" id="featured-modal-title">
              {featuredModal.targetFeatured ? 'Đánh dấu khóa học nổi bật?' : 'Bỏ khóa học khỏi danh sách nổi bật?'}
            </h3>

            <div className="rounded-[6px] border border-hairline bg-surface-alt p-3 flex gap-3 items-center text-xs">
              <div className="h-[54px] w-[88px] rounded-[4px] bg-canvas overflow-hidden shrink-0 border border-hairline">
                <img
                  src={featuredModal.course?.thumbnail_url}
                  alt="Thumbnail"
                  id="featured-modal-img"
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-ink truncate" id="featured-modal-course-title">{featuredModal.course?.title}</h4>
                <p className="text-[10px] text-mid-gray mt-0.5 truncate">
                  Giảng viên: <span id="featured-modal-instructor">{featuredModal.course?.instructor?.full_name || '---'}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-mid-gray leading-normal">
              {featuredModal.targetFeatured
                ? 'Khóa học sẽ được ưu tiên hiển thị tại các khu vực nổi bật của hệ thống.'
                : 'Khóa học sẽ không còn xuất hiện trong danh sách đề xuất nổi bật.'}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setFeaturedModal({ open: false, course: null, targetFeatured: false })}
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                id="btn-submit-featured"
                onClick={handleToggleFeatured}
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HIDE CONFIRMATION */}
      {hideModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in">
          <div className="relative w-full max-w-[420px] bg-paper border border-hairline rounded-[6px] shadow-subtle p-5 mx-4 space-y-4">
            <h3 className="text-sm font-bold text-ink">Ẩn khóa học?</h3>

            <div className="rounded-[6px] border border-hairline bg-surface-alt p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-mid-gray">Khóa học:</span>
                <span className="font-bold text-ink truncate max-w-[200px]" id="hide-modal-title">{hideModal.course?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mid-gray">Giảng viên:</span>
                <span className="font-semibold text-ink" id="hide-modal-instructor">{hideModal.course?.instructor?.full_name || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mid-gray">Học viên:</span>
                <span className="font-medium text-ink" id="hide-modal-enrollments">
                  {new Intl.NumberFormat('vi-VN').format(hideModal.course?.enrollment_count || 0)} học viên
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mid-gray">Doanh thu:</span>
                <span className="font-medium text-ink" id="hide-modal-revenue">{formatVND(hideModal.course?.gross_revenue)}</span>
              </div>
            </div>

            <div className="rounded-[6px] bg-danger-brick-soft/10 border border-danger-brick/10 p-3 text-[10px] text-danger-brick flex gap-2">
              <svg className="w-4 h-4 text-danger-brick shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="leading-normal">
                <strong>Cảnh báo:</strong> Khóa học sẽ không còn hiển thị công khai nhưng dữ liệu khóa học và học viên không bị xóa.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setHideModal({ open: false, course: null })}
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                id="btn-submit-hide"
                onClick={handleHideCourse}
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] bg-danger-brick text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
              >
                Xác nhận ẩn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SHOW CONFIRMATION */}
      {showModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in">
          <div className="relative w-full max-w-[420px] bg-paper border border-hairline rounded-[6px] shadow-subtle p-5 mx-4 space-y-4">
            <h3 className="text-sm font-bold text-ink">Hiển thị lại khóa học?</h3>

            <div className="rounded-[6px] border border-hairline bg-surface-alt p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-mid-gray">Khóa học:</span>
                <span className="font-bold text-ink truncate max-w-[200px]" id="show-modal-title">{showModal.course?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mid-gray">Giảng viên:</span>
                <span className="font-semibold text-ink" id="show-modal-instructor">{showModal.course?.instructor?.full_name || '---'}</span>
              </div>
            </div>

            <p className="text-xs text-mid-gray leading-normal">
              Khóa học sẽ chuyển lại trạng thái hoạt động công khai trên hệ thống.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setShowModal({ open: false, course: null })}
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                id="btn-submit-show"
                onClick={handleShowCourse}
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
              >
                Xác nhận hiển thị
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
