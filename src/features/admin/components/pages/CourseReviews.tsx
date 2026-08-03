import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  getCourseReviews,
  getCourseReview,
  approveCourse,
  rejectCourse,
} from '@/assets/js/api/course-reviews-api';
import { getCategories } from '@/assets/js/api/categories-api';
import { showToast } from '@/assets/js/toast';
import { cn } from '@/shared/lib/utils';
import FilterSelect, { SelectOption } from './FilterSelect';
import AdminPagination from "../shared/AdminPagination";

interface Instructor {
  id: number;
  full_name: string;
  email: string;
  avatar_url: string;
  title?: string;
}

interface ChecklistItem {
  passed: boolean;
  summary: string;
  missing_items: string[];
  warnings: string[];
  checks: Array<{
    name: string;
    message: string;
    passed: boolean;
  }>;
}

interface CourseReviewItem {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description?: string;
  thumbnail_url: string;
  level: string;
  language: string;
  price: number;
  sale_price: number | null;
  total_duration_seconds: number;
  created_at: string;
  updated_at: string;
  status: string;
  instructor?: Instructor;
  checklist?: ChecklistItem;
}

type CourseReviewSortKey = 'title' | 'category' | 'price' | 'submitted_at' | 'status';
type SortDirection = 'asc' | 'desc';

// Direction icon indicator for sorting headers
function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  return (
    <span className={cn("inline-flex flex-col ml-1 text-[8px] leading-none shrink-0 select-none", active ? "text-ink" : "text-mid-gray/40")}>
      <span className={cn(active && direction === 'asc' ? "text-ink" : "opacity-40")}>▲</span>
      <span className={cn(active && direction === 'desc' ? "text-ink" : "opacity-40")}>▼</span>
    </span>
  );
}

// Dynamic review status marker
function ReviewStatusMarker({ status }: { status: string }) {
  let dotClass = 'bg-warning';
  let textClass = 'text-warning';
  let text = 'Chờ duyệt';
  
  if (status === 'published' || status === 'approved') {
    dotClass = 'bg-success';
    textClass = 'text-success';
    text = 'Đã duyệt';
  } else if (status === 'rejected') {
    dotClass = 'bg-danger-brick';
    textClass = 'text-danger-brick';
    text = 'Bị từ chối';
  } else if (status === 'hidden') {
    dotClass = 'bg-mid-gray';
    textClass = 'text-mid-gray';
    text = 'Đã ẩn';
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap font-semibold", textClass)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotClass)}></span>
      <span>{text}</span>
    </span>
  );
}

export default function CourseReviews() {
  // Ref to results section for auto-scrolling
  const resultsSectionRef = useRef<HTMLDivElement | null>(null);

  // Filters form states
  const [formSearch, setFormSearch] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formDatePreset, setFormDatePreset] = useState('all');
  const [formSort, setFormSort] = useState('submitted_desc');
  const [formDateFrom, setFormDateFrom] = useState('');
  const [formDateTo, setFormDateTo] = useState('');

  // Active Dropdown state
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Card click active filter state (default to pending review)
  const [statusFilter, setStatusFilter] = useState('pending');
  const [reviewedDateFilter, setReviewedDateFilter] = useState('');

  // Applied filter states
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    category_id: '',
    date_preset: 'all',
    sort: 'submitted_desc',
    date_from: '',
    date_to: '',
  });

  // Sorting header states
  const [sortBy, setSortBy] = useState<CourseReviewSortKey>('submitted_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination states
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Database changes dependency version
  const [dbVersion, setDbVersion] = useState(0);

  // Real items states
  const [items, setItems] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);

  // Data & loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    pending_count: 0,
    approved_today: 0,
    rejected_today: 0,
  });
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState('---');

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerData, setDrawerData] = useState<any>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'content' | 'checklist'>('overview');
  const [expandedSectionIds, setExpandedSectionIds] = useState<Set<number>>(new Set());

  // Modal Action states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionCourseId, setActionCourseId] = useState<number | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Form Select Options mapping
  const timeOptions: SelectOption[] = [
    { value: 'all', label: 'Tất cả thời gian', colorClass: 'text-neutral-700', hoverBgClass: 'hover:bg-neutral-50' },
    { value: '1_day', label: '1 ngày qua', colorClass: 'text-emerald-600', hoverBgClass: 'hover:bg-emerald-50' },
    { value: '3_days', label: '3 ngày qua', colorClass: 'text-blue-600', hoverBgClass: 'hover:bg-blue-50' },
    { value: '7_days', label: '7 ngày qua', colorClass: 'text-purple-600', hoverBgClass: 'hover:bg-purple-50' },
    { value: 'custom', label: 'Tùy chọn ngày', colorClass: 'text-rose-700', hoverBgClass: 'hover:bg-rose-50' }
  ];

  const sortOptions: SelectOption[] = [
    { value: 'submitted_desc', label: 'Gửi gần nhất', colorClass: 'text-neutral-700', hoverBgClass: 'hover:bg-neutral-50' },
    { value: 'submitted_asc', label: 'Chờ lâu nhất', colorClass: 'text-amber-600', hoverBgClass: 'hover:bg-amber-50' },
    { value: 'title_asc', label: 'Tên A–Z', colorClass: 'text-blue-600', hoverBgClass: 'hover:bg-blue-50' },
    { value: 'title_desc', label: 'Tên Z–A', colorClass: 'text-blue-600', hoverBgClass: 'hover:bg-blue-50' },
    { value: 'price_desc', label: 'Giá cao nhất', colorClass: 'text-emerald-600', hoverBgClass: 'hover:bg-emerald-50' },
    { value: 'price_asc', label: 'Giá thấp nhất', colorClass: 'text-emerald-600', hoverBgClass: 'hover:bg-emerald-50' },
    { value: 'duration_desc', label: 'Thời lượng dài nhất', colorClass: 'text-teal-600', hoverBgClass: 'hover:bg-teal-50' }
  ];

  const categoryOptions: SelectOption[] = useMemo(() => {
    return [
      { value: '', label: 'Tất cả danh mục', colorClass: 'text-neutral-700', hoverBgClass: 'hover:bg-neutral-50' },
      ...categories.map(c => ({
        value: String(c.id),
        label: c.name,
        colorClass: 'text-neutral-700',
        hoverBgClass: 'hover:bg-neutral-50'
      }))
    ];
  }, [categories]);

  // Helper date parser
  const getCourseReviewSubmittedDate = (item: any) => {
    if (!item) return null;
    const value = item.submitted_at ?? item.created_at ?? item.updated_at ?? null;
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    const strVal = String(value).trim().replace(" ", "T");
    const date = new Date(strVal);
    return isNaN(date.getTime()) ? null : date;
  };

  // Quick Insight Bar Memo
  const insights = useMemo(() => {
    try {
      const pendingCourses = allItems.filter((c: any) => c.status === 'pending_review');

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const newIn7Days = pendingCourses.filter((i: any) => {
        const d = getCourseReviewSubmittedDate(i);
        return d && d >= sevenDaysAgo;
      }).length;

      let maxWaitingDays = 0;
      pendingCourses.forEach((i: any) => {
        const createdDate = getCourseReviewSubmittedDate(i);
        if (createdDate) {
          const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > maxWaitingDays) maxWaitingDays = diffDays;
        }
      });

      const validPrices = pendingCourses.map((i: any) =>
        i.sale_price !== null && i.sale_price !== undefined ? i.sale_price : i.price
      );
      const totalPrice = validPrices.reduce((sum: number, p: number) => sum + (p || 0), 0);
      const avgPrice = pendingCourses.length > 0 ? Math.round(totalPrice / pendingCourses.length) : 0;

      const totalDurationSeconds = pendingCourses.reduce(
        (sum: number, i: any) => sum + (i.total_duration_seconds || 0),
        0
      );
      const totalDurationHours = Math.round(totalDurationSeconds / 3600);

      const instructorIds = new Set(
        pendingCourses.map((i: any) => i.instructor?.id).filter(Boolean)
      );

      return {
        newIn7Days,
        maxWaitingDays,
        avgPrice,
        totalDurationHours,
        instructorCount: instructorIds.size,
      };
    } catch (e) {
      console.error('Error calculating insights:', e);
      return {
        newIn7Days: 0,
        maxWaitingDays: 0,
        avgPrice: 0,
        totalDurationHours: 0,
        instructorCount: 0,
      };
    }
  }, [allItems]);

  // Read URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSearch = params.get("search") || "";
    const urlSortBy = params.get("sort_by") || "submitted_at";
    const urlSortOrder = params.get("sort_order") || "desc";
    const urlPage = parseInt(params.get("page") || "1") || 1;
    const urlPerPage = parseInt(params.get("per_page") || "20") || 20;
    const urlPreset = params.get("time_preset") || "all";
    const urlFrom = params.get("date_from") || "";
    const urlTo = params.get("date_to") || "";
    const urlCategoryId = params.get("category") || "";

    // Card filters
    const urlStatus = params.get("status") || "pending";
    const urlReviewedDate = params.get("reviewed_date") || "";
    setStatusFilter(urlStatus);
    setReviewedDateFilter(urlReviewedDate);

    setFormSearch(urlSearch);
    setFormDatePreset(urlPreset);
    setFormDateFrom(urlFrom);
    setFormDateTo(urlTo);
    setFormCategoryId(urlCategoryId);

    // Set compatibility sort string for formSort select
    let compatibilitySort = 'submitted_desc';
    if (urlSortBy === 'title') compatibilitySort = urlSortOrder === 'asc' ? 'title_asc' : 'title_desc';
    else if (urlSortBy === 'price') compatibilitySort = urlSortOrder === 'asc' ? 'price_asc' : 'price_desc';
    else if (urlSortBy === 'submitted_at') compatibilitySort = urlSortOrder === 'asc' ? 'submitted_asc' : 'submitted_desc';
    setFormSort(compatibilitySort);

    setAppliedFilters({
      search: urlSearch,
      category_id: urlCategoryId,
      date_preset: urlPreset,
      sort: compatibilitySort,
      date_from: urlFrom,
      date_to: urlTo,
    });
    setSortBy(urlSortBy as any);
    setSortDirection(urlSortOrder as any);
    setPage(urlPage);
    setPerPage(urlPerPage);

    try {
      getCategories().then(res => {
        if (res && res.success) {
          setCategories(res.data.items || res.data || []);
        }
      });
    } catch (err) {
      console.error("Error loading categories:", err);
    }

    const openCourseId = parseInt(params.get("open_course_id") || "0");
    if (openCourseId > 0) {
      handleOpenDrawer(openCourseId);
    }
  }, []);

  // Main data loading function from Backend API
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Map sort and filters
      const apiParams: any = {
        page,
        per_page: perPage,
        search: appliedFilters.search,
        category_id: appliedFilters.category_id,
        sort: appliedFilters.sort,
      };

      // Mapped date filters
      if (appliedFilters.date_preset && appliedFilters.date_preset !== 'all') {
        if (appliedFilters.date_preset === 'custom') {
          apiParams.date_from = appliedFilters.date_from;
          apiParams.date_to = appliedFilters.date_to;
        } else {
          const now = new Date();
          let anchorDate = now;
          if (now.getFullYear() < 2026) {
            anchorDate = new Date(2026, 6, 14);
          }
          let daysToSubtract = 0;
          if (appliedFilters.date_preset === '1_day') daysToSubtract = 0;
          else if (appliedFilters.date_preset === '3_days') daysToSubtract = 2;
          else if (appliedFilters.date_preset === '7_days') daysToSubtract = 6;

          const fromDate = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate() - daysToSubtract);
          const yyyy = fromDate.getFullYear();
          const mm = String(fromDate.getMonth() + 1).padStart(2, '0');
          const dd = String(fromDate.getDate()).padStart(2, '0');
          
          apiParams.date_from = `${yyyy}-${mm}-${dd}`;
          
          const yyyyTo = anchorDate.getFullYear();
          const mmTo = String(anchorDate.getMonth() + 1).padStart(2, '0');
          const ddTo = String(anchorDate.getDate()).padStart(2, '0');
          apiParams.date_to = `${yyyyTo}-${mmTo}-${ddTo}`;
        }
      }

      const res = await getCourseReviews(apiParams);
      const allRes = await getCourseReviews({ per_page: 9999 });

      if (res && res.success && res.data && allRes && allRes.success) {
        setItems(res.data.items || []);
        setSummary(res.data.summary || { pending_count: 0, approved_today: 0, rejected_today: 0 });
        setMeta(res.meta || { current_page: page, last_page: 1, per_page: perPage, total: 0 });
        setAllItems(allRes.data.items || []);
        
        const now = new Date();
        const formatted = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        setLastUpdated(formatted);
      } else {
        throw new Error("Dữ liệu trả về không đúng contract.");
      }
    } catch (err: any) {
      console.error("Error loading course reviews:", err);
      setError(err?.data?.message || err?.message || "Không thể nạp dữ liệu kiểm duyệt.");
    } finally {
      setLoading(false);
    }
  };

  // Sync state changes with URL query parameters and trigger reload data
  useEffect(() => {
    loadData();

    const url = new URL(window.location.href);

    if (appliedFilters.search) url.searchParams.set("search", appliedFilters.search);
    else url.searchParams.delete("search");

    if (appliedFilters.category_id) url.searchParams.set("category", appliedFilters.category_id);
    else url.searchParams.delete("category");

    if (sortBy && sortBy !== "submitted_at") url.searchParams.set("sort_by", sortBy);
    else url.searchParams.delete("sort_by");

    if (sortDirection && sortDirection !== "desc") url.searchParams.set("sort_order", sortDirection);
    else url.searchParams.delete("sort_order");

    if (page && page !== 1) url.searchParams.set("page", String(page));
    else url.searchParams.delete("page");

    if (perPage && perPage !== 20) url.searchParams.set("per_page", String(perPage));
    else url.searchParams.delete("per_page");

    if (statusFilter) url.searchParams.set("status", statusFilter);
    else url.searchParams.delete("status");

    if (reviewedDateFilter) url.searchParams.set("reviewed_date", reviewedDateFilter);
    else url.searchParams.delete("reviewed_date");

    if (appliedFilters.date_preset && appliedFilters.date_preset !== "all") {
      url.searchParams.set("time_preset", appliedFilters.date_preset);
    } else {
      url.searchParams.delete("time_preset");
    }

    if (appliedFilters.date_preset === "custom") {
      if (appliedFilters.date_from) url.searchParams.set("date_from", appliedFilters.date_from);
      else url.searchParams.delete("date_from");
      if (appliedFilters.date_to) url.searchParams.set("date_to", appliedFilters.date_to);
      else url.searchParams.delete("date_to");
    } else {
      url.searchParams.delete("date_from");
      url.searchParams.delete("date_to");
    }

    window.history.replaceState({}, "", url.toString());
  }, [page, perPage, appliedFilters, sortBy, sortDirection, statusFilter, reviewedDateFilter, dbVersion]);

  // KPI card interaction click handler
  const handleCardClick = (cardType: 'all' | 'pending' | 'approved_today' | 'rejected_today') => {
    setPage(1);
    if (cardType === 'all') {
      setStatusFilter('');
      setReviewedDateFilter('');
    } else if (cardType === 'pending') {
      setStatusFilter('pending');
      setReviewedDateFilter('');
    } else if (cardType === 'approved_today') {
      setStatusFilter('approved');
      setReviewedDateFilter('today');
    } else if (cardType === 'rejected_today') {
      setStatusFilter('rejected');
      setReviewedDateFilter('today');
    }

    // Smooth scroll down to target section
    resultsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Comparison helpers for sorting
  const compareString = (a: string, b: string, direction: 'asc' | 'desc') => {
    return direction === 'asc'
      ? a.localeCompare(b, 'vi', { sensitivity: 'accent' })
      : b.localeCompare(a, 'vi', { sensitivity: 'accent' });
  };

  const compareNumber = (a: number, b: number, direction: 'asc' | 'desc') => {
    return direction === 'asc' ? a - b : b - a;
  };

  const compareStatus = (a: string, b: string, direction: 'asc' | 'desc') => {
    const statusOrder: Record<string, number> = {
      pending_review: 1,
      draft: 2,
      approved: 3,
      published: 4,
      rejected: 5,
      hidden: 6
    };
    const orderA = statusOrder[a] || 99;
    const orderB = statusOrder[b] || 99;
    return direction === 'asc' ? orderA - orderB : orderB - orderA;
  };

  const paginatedReviews = items;
  const totalCount = meta.total;

  // Form submission handler
  const handleSubmitFilters = (e: React.FormEvent) => {
    e.preventDefault();

    if (formDatePreset === 'custom') {
      if (!formDateFrom || !formDateTo) {
        showToast({
          type: 'warning',
          title: 'Vui lòng chọn ngày',
          message: 'Bạn cần chọn đầy đủ ngày bắt đầu và ngày kết thúc.',
        });
        return;
      }
      if (formDateFrom > formDateTo) {
        showToast({
          type: 'warning',
          title: 'Khoảng ngày không hợp lệ',
          message: 'Ngày bắt đầu không được lớn hơn ngày kết thúc.',
        });
        return;
      }
    }

    setPage(1);
    setAppliedFilters({
      search: formSearch.trim(),
      category_id: formCategoryId,
      date_preset: formDatePreset,
      sort: formSort,
      date_from: formDateFrom,
      date_to: formDateTo,
    });
  };

  // Reset filter form action
  const handleResetFilters = () => {
    setFormSearch('');
    setFormCategoryId('');
    setFormDatePreset('all');
    setFormSort('submitted_desc');
    setFormDateFrom('');
    setFormDateTo('');

    setSortBy('submitted_at');
    setSortDirection('desc');
    setPage(1);
    setAppliedFilters({
      search: '',
      category_id: '',
      date_preset: 'all',
      sort: 'submitted_desc',
      date_from: '',
      date_to: '',
    });
  };

  // Auto trigger preset filter if not "custom"
  const handleDatePresetChange = (preset: string) => {
    setFormDatePreset(preset);
    if (preset !== 'custom') {
      setFormDateFrom('');
      setFormDateTo('');
      setPage(1);
      setAppliedFilters((prev) => ({
        ...prev,
        date_preset: preset,
        date_from: '',
        date_to: '',
      }));
    }
  };

  // Synchronize form values with custom select values
  const handleCustomSelectChange = (field: string, val: string) => {
    if (field === 'category_id') {
      setFormCategoryId(val);
      setPage(1);
      setAppliedFilters((prev) => ({ ...prev, category_id: val }));
    } else if (field === 'time_preset') {
      handleDatePresetChange(val);
    } else if (field === 'sort') {
      setFormSort(val);
      setPage(1);
      setAppliedFilters((prev) => ({ ...prev, sort: val }));
      
      // Update table sorting headers state accordingly
      if (val === 'submitted_asc') {
        setSortBy('submitted_at');
        setSortDirection('asc');
      } else if (val === 'submitted_desc') {
        setSortBy('submitted_at');
        setSortDirection('desc');
      } else if (val === 'title_asc') {
        setSortBy('title');
        setSortDirection('asc');
      } else if (val === 'title_desc') {
        setSortBy('title');
        setSortDirection('desc');
      } else if (val === 'price_asc') {
        setSortBy('price');
        setSortDirection('asc');
      } else if (val === 'price_desc') {
        setSortBy('price');
        setSortDirection('desc');
      }
    }
  };

  // Active filter chips calculation
  const activeChips = useMemo(() => {
    const list = [];
    if (appliedFilters.search) {
      list.push({ key: 'search', label: `Tìm kiếm: "${appliedFilters.search}"` });
    }
    if (appliedFilters.category_id) {
      const found = categories.find(c => String(c.id) === appliedFilters.category_id);
      list.push({ key: 'category_id', label: `Danh mục: ${found ? found.name : appliedFilters.category_id}` });
    }
    if (appliedFilters.date_preset && appliedFilters.date_preset !== 'all') {
      const labels: Record<string, string> = {
        '1_day': '1 ngày qua',
        '3_days': '3 ngày qua',
        '7_days': '7 ngày qua',
        'custom': 'Tùy chọn ngày'
      };
      if (appliedFilters.date_preset === 'custom' && (appliedFilters.date_from || appliedFilters.date_to)) {
        list.push({ key: 'date_range', label: `Thời gian: ${appliedFilters.date_from || '...'} → ${appliedFilters.date_to || '...'}` });
      } else {
        list.push({ key: 'date_range', label: `Thời gian: ${labels[appliedFilters.date_preset] || appliedFilters.date_preset}` });
      }
    }
    return list;
  }, [appliedFilters, categories]);

  const removeSingleChip = (key: string) => {
    setPage(1);
    if (key === 'search') {
      setFormSearch('');
      setAppliedFilters(prev => ({ ...prev, search: '' }));
    } else if (key === 'category_id') {
      setFormCategoryId('');
      setAppliedFilters(prev => ({ ...prev, category_id: '' }));
    } else if (key === 'date_range') {
      setFormDatePreset('all');
      setFormDateFrom('');
      setFormDateTo('');
      setAppliedFilters(prev => ({ ...prev, date_preset: 'all', date_from: '', date_to: '' }));
    }
  };

  // Header column sorting click handler
  const handleSortHeader = (key: CourseReviewSortKey) => {
    let nextDirection: SortDirection = 'asc';
    if (sortBy === key) {
      if (sortDirection === 'asc') {
        nextDirection = 'desc';
      } else {
        // Lần click thứ 3: quay lại mặc định
        setSortBy('submitted_at');
        setSortDirection('desc');
        setFormSort('submitted_desc');
        setAppliedFilters(prev => ({ ...prev, sort: 'submitted_desc' }));
        setPage(1);
        return;
      }
    }
    setSortBy(key);
    setSortDirection(nextDirection);
    setPage(1);

    // Sync formSort dropdown select
    let compatibilitySort = 'submitted_desc';
    if (key === 'title') compatibilitySort = nextDirection === 'asc' ? 'title_asc' : 'title_desc';
    else if (key === 'price') compatibilitySort = nextDirection === 'asc' ? 'price_asc' : 'price_desc';
    else if (key === 'submitted_at') compatibilitySort = nextDirection === 'asc' ? 'submitted_asc' : 'submitted_desc';
    setFormSort(compatibilitySort);
    setAppliedFilters(prev => ({ ...prev, sort: compatibilitySort }));
  };

  // Drawer handlers
  const handleOpenDrawer = async (courseId: number) => {
    if (drawerLoading && activeCourseId === courseId) return;

    setIsDrawerOpen(true);
    setDrawerTab('overview');
    setDrawerLoading(true);
    setActiveCourseId(courseId);
    setDrawerData(null);

    const url = new URL(window.location.href);
    url.searchParams.set("open_course_id", String(courseId));
    window.history.replaceState({}, "", url.toString());

    try {
      const res = await getCourseReview(courseId);
      if (res && res.success && res.data) {
        setDrawerData(res.data);
      } else {
        showToast({
          type: "error",
          title: "Không tìm thấy khóa học",
          message: "Khóa học kiểm duyệt không tồn tại hoặc đã bị xóa.",
        });
        handleCloseDrawer();
      }
    } catch (err) {
      console.error("Lỗi nạp chi tiết khóa học:", err);
      showToast({
        type: "error",
        title: "Không tìm thấy khóa học",
        message: "Khóa học kiểm duyệt không tồn tại hoặc đã bị xóa.",
      });
      handleCloseDrawer();
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setActiveCourseId(null);
    setDrawerData(null);

    const url = new URL(window.location.href);
    if (url.searchParams.has("open_course_id")) {
      url.searchParams.delete("open_course_id");
      window.history.replaceState({}, "", url.toString());
    }
  };

  useEffect(() => {
    if (drawerData && drawerData.sections && drawerData.sections.length > 0) {
      setExpandedSectionIds(new Set([drawerData.sections[0].id]));
    }
  }, [drawerData]);

  const toggleSection = (id: number) => {
    setExpandedSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Modals Actions Confirms
  const triggerApprove = (e: React.MouseEvent, courseId: number) => {
    e.stopPropagation();
    setActionCourseId(courseId);
    setIsApproveModalOpen(true);
  };

  const triggerReject = (e: React.MouseEvent, courseId: number) => {
    e.stopPropagation();
    setActionCourseId(courseId);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!actionCourseId || submittingAction) return;
    setSubmittingAction(true);

    try {
      const res = await approveCourse(actionCourseId);
      setIsApproveModalOpen(false);
      handleCloseDrawer();
      showToast({
        type: "success",
        title: "Đã duyệt khóa học",
        message: res.message || "Khóa học đã được duyệt thành công.",
      });
      setDbVersion((v) => v + 1);
    } catch (err: any) {
      console.error("Lỗi duyệt khóa học:", err);
      const status = err.status || err?.data?.status;
      const msg = err?.data?.message || "Đã xảy ra lỗi khi duyệt khóa học.";

      if (status === 409) {
        showToast({
          type: "warning",
          title: "Khóa học đã được xử lý",
          message: "Khóa học này đã được một quản trị viên khác xử lý trước đó.",
        });
        setIsApproveModalOpen(false);
        handleCloseDrawer();
        setDbVersion((v) => v + 1);
      } else {
        showToast({
          type: "error",
          title: "Không thể xử lý khóa học",
          message: msg,
        });
      }
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!actionCourseId || submittingAction) return;
    const reason = rejectReason.trim();

    if (!reason) {
      showToast({
        type: "warning",
        title: "Lý do trống",
        message: "Vui lòng nhập lý do từ chối.",
      });
      return;
    }

    if (reason.length > 1000) {
      showToast({
        type: "warning",
        title: "Lý do quá dài",
        message: "Lý do từ chối không được vượt quá 1000 ký tự.",
      });
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await rejectCourse(actionCourseId, {
        admin_reject_reason: reason,
      });
      setIsRejectModalOpen(false);
      handleCloseDrawer();
      showToast({
        type: "success",
        title: "Đã từ chối khóa học",
        message: res.message || "Khóa học đã được gửi lại để giảng viên chỉnh sửa.",
      });
      setDbVersion((v) => v + 1);
    } catch (err: any) {
      console.error("Lỗi từ chối khóa học:", err);
      const status = err.status || err?.data?.status;
      const msg = err?.data?.message || "Đã xảy ra lỗi khi từ chối khóa học.";

      if (status === 409) {
        showToast({
          type: "warning",
          title: "Khóa học đã được xử lý",
          message: "Khóa học này đã được một quản trị viên khác xử lý trước đó.",
        });
        setIsRejectModalOpen(false);
        handleCloseDrawer();
        setDbVersion((v) => v + 1);
      } else {
        showToast({
          type: "error",
          title: "Không thể xử lý khóa học",
          message: msg,
        });
      }
    } finally {
      setSubmittingAction(false);
    }
  };

  // Khóa cuộn body khi drawer hoặc modal mở rộng
  useEffect(() => {
    const isAnyModalOpen = isDrawerOpen || isApproveModalOpen || isRejectModalOpen;
    if (!isAnyModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerOpen, isApproveModalOpen, isRejectModalOpen]);

  // Helper Formatters
  const formatMoney = (amount: any) => {
    if (amount === 0 || amount === "0") return "Miễn phí";
    if (!amount && amount !== 0) return "---";
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  const formatDuration = (totalSeconds: any) => {
    if (!totalSeconds || totalSeconds <= 0) return "Chưa có thời lượng";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0 && minutes > 0) {
      return `${hours} giờ ${minutes} phút`;
    } else if (hours > 0) {
      return `${hours} giờ`;
    } else {
      return `${minutes} phút`;
    }
  };

  const formatDateTime = (dateTimeStr: any) => {
    if (!dateTimeStr) return "---";
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return dateTimeStr;

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatLevel = (level: any) => {
    const levels: any = {
      beginner: "Cơ bản",
      intermediate: "Trung cấp",
      advanced: "Nâng cao",
      all_levels: "Mọi trình độ",
    };
    return levels[level] || level || "Chưa rõ";
  };

  const getLessonTypeIcon = (type: string) => {
    if (type === "video") {
      return (
        <svg className="w-3.5 h-3.5 text-mid-gray shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      );
    } else if (type === "quiz") {
      return (
        <svg className="w-3.5 h-3.5 text-mid-gray shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    } else {
      return (
        <svg className="w-3.5 h-3.5 text-mid-gray shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    }
  };

  const selectedApproveCourse = currentItemsDataFind(actionCourseId);

  function currentItemsDataFind(id: number | null) {
    if (!id) return null;
    return allItems.find((r) => r.id === id) || items.find((r) => r.id === id) || null;
  }

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* PHẦN TIÊU ĐỀ TRANG */}
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
            <span className="text-ink">Kiểm duyệt khóa học</span>
          </div>
          <h1 className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-tight">
            Kiểm duyệt khóa học
          </h1>
          <p className="text-xs text-mid-gray mt-0.5" id="page-description">
            Xem xét nội dung và xử lý các khóa học đang chờ phê duyệt. Có{' '}
            <span className="font-bold text-ink">{summary.pending_count}</span>{' '}
            khóa học đang chờ Admin kiểm duyệt.
          </p>
          <p className="text-[10px] text-mid-gray/80 mt-1">
            Cập nhật lần cuối: <span className="font-medium text-mid-gray">{lastUpdated}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* Nút làm mới dữ liệu */}
          <button
            type="button"
            onClick={() => setDbVersion(v => v + 1)}
            disabled={loading}
            className="h-9 w-9 flex items-center justify-center rounded-full border border-hairline hover:bg-canvas text-ink shrink-0 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            aria-label="Làm mới dữ liệu"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
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

      {/* 1. Summary Cards (Đúng 4 card dạng Button có thể click, hover nhẹ, không giật phóng to) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none">
        {/* Card 0 – Tổng hồ sơ kiểm duyệt */}
        <button
          type="button"
          onClick={() => handleCardClick('all')}
          aria-pressed={statusFilter === ''}
          aria-label="Lọc tất cả hồ sơ kiểm duyệt"
          className={cn(
            "text-left w-full rounded-[6px] border p-4 shadow-subtle flex flex-col justify-between min-h-[104px] transition-all cursor-pointer border-t-2 border-t-indigo-500",
            statusFilter === '' 
              ? "border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500/30" 
              : "border-hairline bg-paper hover:border-mid-gray/40"
          )}
        >
          <div className="flex items-center justify-between text-mid-gray w-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              Tổng hồ sơ kiểm duyệt
            </span>
            <svg className="w-4.5 h-4.5 text-indigo-500/90" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21V9m0 0a3 3 0 1 0-3-3m3 3a3 3 0 1 1 3-3" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-2xl lg:text-3xl font-bold text-indigo-600 leading-none">
              {summary.pending_count + summary.approved_today + summary.rejected_today}
            </span>
            <p className="text-[10px] text-mid-gray mt-1">Tổng cộng các trạng thái</p>
          </div>
        </button>

        {/* Card 1 – Đang chờ duyệt */}
        <button
          type="button"
          onClick={() => handleCardClick('pending')}
          aria-pressed={statusFilter === 'pending'}
          aria-label="Lọc hồ sơ chờ duyệt"
          className={cn(
            "text-left w-full rounded-[6px] border p-4 shadow-subtle flex flex-col justify-between min-h-[104px] transition-all cursor-pointer border-t-2 border-t-warning",
            statusFilter === 'pending' 
              ? "border-warning bg-warning-soft/10 ring-1 ring-warning/30" 
              : "border-hairline bg-paper hover:border-mid-gray/40"
          )}
        >
          <div className="flex items-center justify-between text-mid-gray w-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-warning">
              Đang chờ duyệt
            </span>
            <svg className="w-4.5 h-4.5 text-warning/90" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="mt-2 flex items-baseline justify-between w-full">
            <div>
              <span className="text-2xl lg:text-3xl font-bold text-warning leading-none">
                {summary.pending_count}
              </span>
              <p className="text-[10px] text-mid-gray mt-1">Khóa học cần Admin kiểm tra</p>
            </div>
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick('pending');
              }}
              className="text-[11px] font-semibold text-ink hover:underline cursor-pointer flex items-center gap-0.5"
            >
              Xem danh sách
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          </div>
        </button>

        {/* Card 2 – Đã duyệt hôm nay */}
        <button
          type="button"
          onClick={() => handleCardClick('approved_today')}
          aria-pressed={statusFilter === 'approved' && reviewedDateFilter === 'today'}
          aria-label="Lọc hồ sơ đã duyệt hôm nay"
          className={cn(
            "text-left w-full rounded-[6px] border p-4 shadow-subtle flex flex-col justify-between min-h-[104px] transition-all cursor-pointer border-t-2 border-t-success",
            (statusFilter === 'approved' && reviewedDateFilter === 'today')
              ? "border-success bg-success-soft/10 ring-1 ring-success/30" 
              : "border-hairline bg-paper hover:border-mid-gray/40"
          )}
        >
          <div className="flex items-center justify-between text-mid-gray w-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-success">
              Đã duyệt hôm nay
            </span>
            <svg className="w-4.5 h-4.5 text-success/90" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-2xl lg:text-3xl font-bold text-success leading-none">
              {summary.approved_today}
            </span>
            <p className="text-[10px] text-mid-gray mt-1">Khóa học được chấp thuận hôm nay</p>
          </div>
        </button>

        {/* Card 3 – Đã từ chối hôm nay */}
        <button
          type="button"
          onClick={() => handleCardClick('rejected_today')}
          aria-pressed={statusFilter === 'rejected' && reviewedDateFilter === 'today'}
          aria-label="Lọc hồ sơ bị từ chối hôm nay"
          className={cn(
            "text-left w-full rounded-[6px] border p-4 shadow-subtle flex flex-col justify-between min-h-[104px] transition-all cursor-pointer border-t-2 border-t-danger-brick",
            (statusFilter === 'rejected' && reviewedDateFilter === 'today')
              ? "border-danger-brick bg-danger-brick-soft/10 ring-1 ring-danger-brick/30" 
              : "border-hairline bg-paper hover:border-mid-gray/40"
          )}
        >
          <div className="flex items-center justify-between text-mid-gray w-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-danger-brick">
              Đã từ chối hôm nay
            </span>
            <svg className="w-4.5 h-4.5 text-danger-brick/90" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-2xl lg:text-3xl font-bold text-danger-brick leading-none">
              {summary.rejected_today}
            </span>
            <p className="text-[10px] text-mid-gray mt-1">Khóa học cần giảng viên chỉnh sửa</p>
          </div>
        </button>
      </div>

      {/* 2. Thanh thông tin nhanh (Quick Insight Bar - 5 thông số) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 rounded-[6px] border border-hairline bg-surface-alt p-3.5">
        <div className="flex flex-col gap-0.5 border-b sm:border-b-0 sm:border-r border-hairline/60 pb-2 sm:pb-0 pr-3">
          <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider flex items-center gap-1">
            <svg className="w-3 h-3 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 6v6l4 2" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            Khóa mới (7 ngày)
          </span>
          <span className="text-base font-bold text-ink leading-tight font-sans">
            {insights.newIn7Days} khóa
          </span>
        </div>
        <div className="flex flex-col gap-0.5 border-b sm:border-b-0 sm:border-r border-hairline/60 pb-2 sm:pb-0 pr-3">
          <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider flex items-center gap-1">
            <svg className="w-3 h-3 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 8v4l3 3" />
              <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
            </svg>
            Khóa chờ lâu nhất
          </span>
          <span className="text-base font-bold text-warning leading-tight font-sans">
            {insights.maxWaitingDays} ngày
          </span>
        </div>
        <div className="flex flex-col gap-0.5 border-b md:border-b-0 md:border-r border-hairline/60 pb-2 md:pb-0 pr-3">
          <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider flex items-center gap-1">
            <svg className="w-3 h-3 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Giá bán trung bình
          </span>
          <span className="text-base font-bold text-ink leading-tight font-sans">
            {formatMoney(insights.avgPrice)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 border-b sm:border-b-0 sm:border-r border-hairline/60 pb-2 sm:pb-0 pr-3">
          <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider flex items-center gap-1">
            <svg className="w-3 h-3 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            </svg>
            Tổng thời lượng chờ
          </span>
          <span className="text-base font-bold text-ink leading-tight font-sans">
            {insights.totalDurationHours} giờ
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider flex items-center gap-1">
            <svg className="w-3 h-3 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Giảng viên chờ duyệt
          </span>
          <span className="text-base font-bold text-ink leading-tight font-sans">
            {insights.instructorCount} giảng viên
          </span>
        </div>
      </div>

      {/* 3. Bộ lọc */}
      <section className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
        <form onSubmit={handleSubmitFilters} className="space-y-3 p-0">
          {/* Grid Layout matching exact courses styling */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_240px_200px_200px_200px] xl:items-end w-full">
            {/* Tìm kiếm */}
            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor="filter-search" className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">
                Tìm kiếm
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="filter-search"
                  value={formSearch}
                  onChange={(e) => setFormSearch(e.target.value)}
                  placeholder="Tìm theo tên khóa học, slug hoặc giảng viên..."
                  className="w-full h-10 pl-8 pr-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink placeholder-mid-gray/70 font-semibold"
                />
                <svg className="w-3.5 h-3.5 text-mid-gray/80 absolute left-3 top-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
            </div>

            {/* Danh mục */}
            <div className="flex min-w-0 flex-col gap-1.5">
              <FilterSelect
                label="Danh mục"
                placeholder="Tất cả danh mục"
                value={formCategoryId}
                options={categoryOptions}
                onChange={(val) => handleCustomSelectChange('category_id', val)}
                id="select-category"
                activeId={activeDropdownId}
                setActiveId={setActiveDropdownId}
              />
            </div>

            {/* Thời gian */}
            <div className="flex min-w-0 flex-col gap-1.5">
              <FilterSelect
                label="Thời gian"
                placeholder="Tất cả thời gian"
                value={formDatePreset}
                options={timeOptions}
                onChange={(val) => handleCustomSelectChange('time_preset', val)}
                id="select-time"
                activeId={activeDropdownId}
                setActiveId={setActiveDropdownId}
              />
            </div>

            {/* Sắp xếp */}
            <div className="flex min-w-0 flex-col gap-1.5">
              <FilterSelect
                label="Sắp xếp"
                placeholder="Gửi gần nhất"
                value={formSort}
                options={sortOptions}
                onChange={(val) => handleCustomSelectChange('sort', val)}
                id="select-sort"
                activeId={activeDropdownId}
                setActiveId={setActiveDropdownId}
              />
            </div>

            {/* Nút Thao tác */}
            <div className="flex min-w-0 items-end gap-2 justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-2 h-10 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer shrink-0"
              >
                Đặt lại
              </button>
              <button
                type="submit"
                className="px-4 py-2 h-10 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              >
                Áp dụng
              </button>
            </div>
          </div>

          {/* Hàng bổ sung cho Tùy chọn khoảng thời gian */}
          {formDatePreset === 'custom' && (
            <div id="custom-date-container" className="flex flex-wrap items-center gap-3 pt-3 border-t border-hairline/60 w-full">
              <div className="flex items-center gap-2">
                <label htmlFor="filter-date-from" className="text-xs text-mid-gray font-medium">
                  Từ ngày:
                </label>
                <input
                  type="date"
                  id="filter-date-from"
                  value={formDateFrom}
                  onChange={(e) => setFormDateFrom(e.target.value)}
                  className="h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] outline-none text-ink font-semibold"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="filter-date-to" className="text-xs text-mid-gray font-medium">
                  Đến ngày:
                </label>
                <input
                  type="date"
                  id="filter-date-to"
                  value={formDateTo}
                  onChange={(e) => setFormDateTo(e.target.value)}
                  className="h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] outline-none text-ink font-semibold"
                />
              </div>
            </div>
          )}
        </form>
      </section>

      {/* III. BỘ LỌC ĐANG DÙNG CHIPS ROW */}
      {activeChips.length > 0 && (
        <div id="filter-chips-container" className="flex flex-wrap items-center gap-2 p-3 bg-canvas/35 border border-hairline rounded-[6px] text-xs select-none">
          <span className="text-mid-gray text-[10px] font-bold uppercase tracking-wider mr-1">
            Bộ lọc đang dùng:
          </span>
          <div id="filter-chips-list" className="flex flex-wrap gap-1.5">
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas border border-hairline text-ink"
              >
                {chip.label}
                <button
                  type="button"
                  onClick={() => removeSingleChip(chip.key)}
                  className="text-mid-gray hover:text-ink ml-1 font-bold bg-transparent border-none cursor-pointer text-xs"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            id="btn-clear-all-chips"
            className="text-[10px] font-semibold ml-2 transition-all cursor-pointer bg-transparent border-none text-danger-brick hover:text-danger-brick/80 font-sans"
          >
            Xóa tất cả
          </button>
        </div>
      )}

      {/* 4. Target auto-scroll & Bảng dữ liệu */}
      <section 
        ref={resultsSectionRef}
        id="course-reviews-results-section" 
        className="rounded-[6px] border border-hairline bg-paper shadow-subtle overflow-hidden flex flex-col min-h-[400px] scroll-mt-24"
      >
        {/* Table Scroll Container */}
        <div className="flex-grow overflow-y-auto overflow-x-auto custom-scrollbar relative max-h-[600px] table-scroll w-full min-w-0">
          {!loading && error && (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 my-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-brick-soft text-danger-brick">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">Không thể tải danh sách kiểm duyệt</h3>
                <p className="text-xs text-mid-gray mt-1">{error}</p>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="px-4 py-2 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          )}

          {loading && (
            <div className="divide-y divide-hairline min-w-[1090px]">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center p-3 w-full">
                  <div className="flex items-center gap-3 w-[340px] shrink-0 pr-4">
                    <div className="h-8 w-12 bg-canvas rounded skeleton shrink-0"></div>
                    <div className="space-y-1.5 flex-grow min-w-0">
                      <div className="h-3.5 w-3/4 bg-canvas rounded skeleton"></div>
                      <div className="h-2.5 w-1/2 bg-canvas rounded skeleton"></div>
                    </div>
                  </div>
                  <div className="w-[140px] shrink-0 pr-4">
                    <div className="h-3.5 w-20 bg-canvas rounded skeleton"></div>
                  </div>
                  <div className="w-[200px] shrink-0 pr-4 space-y-1">
                    <div className="h-3 w-full bg-canvas rounded skeleton"></div>
                    <div className="h-3 w-4/5 bg-canvas rounded skeleton"></div>
                  </div>
                  <div className="w-[110px] shrink-0 pr-4">
                    <div className="h-3.5 w-16 bg-canvas rounded skeleton"></div>
                  </div>
                  <div className="w-[130px] shrink-0 pr-4">
                    <div className="h-3.5 w-24 bg-canvas rounded skeleton"></div>
                  </div>
                  <div className="w-[170px] shrink-0">
                    <div className="h-3.5 w-20 bg-canvas rounded skeleton"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && paginatedReviews.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 my-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-mid-gray">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  {appliedFilters.search || appliedFilters.category_id || (appliedFilters.date_preset && appliedFilters.date_preset !== 'all')
                    ? 'Không tìm thấy khóa học phù hợp'
                    : 'Không có khóa học ở trạng thái này'}
                </h3>
                <p className="text-xs text-mid-gray mt-1">
                  {appliedFilters.search || appliedFilters.category_id || (appliedFilters.date_preset && appliedFilters.date_preset !== 'all')
                    ? 'Vui lòng thay đổi từ khóa hoặc bộ lọc khoảng thời gian.'
                    : 'Không tìm thấy kết quả hồ sơ kiểm duyệt nào.'}
                </p>
              </div>
              {(appliedFilters.search || appliedFilters.category_id || (appliedFilters.date_preset && appliedFilters.date_preset !== 'all')) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Đặt lại tìm kiếm
                </button>
              )}
            </div>
          )}

          {!loading && !error && paginatedReviews.length > 0 && (
            <table className="w-full text-left border-collapse table-fixed min-w-[1090px]">
              <thead className="sticky top-0 bg-surface-alt border-b border-hairline z-10 select-none">
                <tr className="text-[10px] font-bold text-mid-gray uppercase tracking-wider h-10">
                  {/* Column headers sortables */}
                  <th className="p-3 pl-4 w-[340px] font-sans">
                    <button
                      type="button"
                      onClick={() => handleSortHeader('title')}
                      aria-sort={sortBy === 'title' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      aria-label="Sắp xếp theo tên khóa học"
                      title="Sắp xếp theo tên khóa học"
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none outline-none focus-visible:ring-1 focus-visible:ring-mid-gray/40 rounded px-1 -mx-1",
                        sortBy === 'title' ? 'text-ink font-extrabold' : 'text-mid-gray'
                      )}
                    >
                      <span>Khóa học</span>
                      <SortIcon active={sortBy === 'title'} direction={sortDirection} />
                    </button>
                  </th>

                  <th className="p-3 w-[140px] font-sans">
                    <button
                      type="button"
                      onClick={() => handleSortHeader('category')}
                      aria-sort={sortBy === 'category' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      aria-label="Sắp xếp theo tên danh mục"
                      title="Sắp xếp theo tên danh mục"
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none outline-none focus-visible:ring-1 focus-visible:ring-mid-gray/40 rounded px-1 -mx-1",
                        sortBy === 'category' ? 'text-ink font-extrabold' : 'text-mid-gray'
                      )}
                    >
                      <span>Danh mục</span>
                      <SortIcon active={sortBy === 'category'} direction={sortDirection} />
                    </button>
                  </th>

                  <th className="p-3 w-[200px]">Mô tả ngắn</th>

                  <th className="p-3 w-[110px] font-sans">
                    <button
                      type="button"
                      onClick={() => handleSortHeader('price')}
                      aria-sort={sortBy === 'price' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      aria-label="Sắp xếp theo giá bán"
                      title="Sắp xếp theo giá bán"
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none outline-none focus-visible:ring-1 focus-visible:ring-mid-gray/40 rounded px-1 -mx-1",
                        sortBy === 'price' ? 'text-ink font-extrabold' : 'text-mid-gray'
                      )}
                    >
                      <span>Giá bán</span>
                      <SortIcon active={sortBy === 'price'} direction={sortDirection} />
                    </button>
                  </th>

                  <th className="p-3 w-[130px] font-sans">
                    <button
                      type="button"
                      onClick={() => handleSortHeader('submitted_at')}
                      aria-sort={sortBy === 'submitted_at' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      aria-label="Sắp xếp theo ngày gửi"
                      title="Sắp xếp theo ngày gửi"
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none outline-none focus-visible:ring-1 focus-visible:ring-mid-gray/40 rounded px-1 -mx-1",
                        sortBy === 'submitted_at' ? 'text-ink font-extrabold' : 'text-mid-gray'
                      )}
                    >
                      <span>Ngày gửi</span>
                      <SortIcon active={sortBy === 'submitted_at'} direction={sortDirection} />
                    </button>
                  </th>

                  <th className="p-3 w-[170px] font-sans">
                    <button
                      type="button"
                      onClick={() => handleSortHeader('status')}
                      aria-sort={sortBy === 'status' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                      aria-label="Sắp xếp theo trạng thái"
                      title="Sắp xếp theo trạng thái"
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none outline-none focus-visible:ring-1 focus-visible:ring-mid-gray/40 rounded px-1 -mx-1",
                        sortBy === 'status' ? 'text-ink font-extrabold' : 'text-mid-gray'
                      )}
                    >
                      <span>Trạng thái</span>
                      <SortIcon active={sortBy === 'status'} direction={sortDirection} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-xs">
                {paginatedReviews.map((item) => {
                  const instructor = item.instructor || ({} as any);
                  const isSale = item.sale_price !== null && item.sale_price !== undefined;
                  const displayPrice = isSale ? item.sale_price : item.price;
                  const isSelected = activeCourseId === item.id;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDrawer(item.id)}
                      className={`hover:bg-surface-alt/60 transition-colors cursor-pointer ${isSelected ? 'bg-surface-alt' : ''}`}
                    >
                      {/* 1. Khóa học (Gom Giảng viên, Trình độ, Thời lượng) */}
                      <td className="p-3 pl-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={item.thumbnail_url || ''}
                            alt="Thumbnail"
                            className="w-12 h-8 rounded-[4px] object-cover border border-hairline shrink-0 mt-0.5"
                            onError={(e: any) => {
                              e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <h4
                              className="font-bold text-ink hover:text-mid-gray transition-colors text-xs truncate max-w-[250px]"
                              title={item.title}
                            >
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-mid-gray mt-0.5 font-medium">
                              Giảng viên: <span className="font-semibold text-ink">{instructor.full_name || 'N/A'}</span>
                            </p>
                            <p className="text-[9px] text-mid-gray/80 mt-0.5 font-medium flex flex-wrap items-center gap-1.5">
                              <span>Trình độ: {formatLevel(item.level)}</span>
                              <span>•</span>
                              <span>Thời lượng: {formatDuration(item.total_duration_seconds)}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Danh mục */}
                      <td className="p-3 text-mid-gray font-medium">
                        {(item as any).category_name || (item as any).category?.name || 'N/A'}
                      </td>

                      {/* 3. Mô tả ngắn */}
                      <td className="p-3">
                        <p className="text-mid-gray text-xs line-clamp-2 leading-relaxed max-w-[190px]" title={item.short_description}>
                          {item.short_description || 'Chưa có mô tả ngắn'}
                        </p>
                      </td>

                      {/* 4. Giá bán */}
                      <td className="p-3">
                        <div className="font-bold text-ink text-xs">{formatMoney(displayPrice)}</div>
                        {isSale && (
                          <div className="text-[10px] text-mid-gray line-through mt-0.5">{formatMoney(item.price)}</div>
                        )}
                      </td>

                      {/* 5. Ngày gửi */}
                      <td className="p-3 whitespace-nowrap text-mid-gray font-medium">
                        {formatDateTime(item.created_at || item.updated_at)}
                      </td>

                      {/* 6. Trạng thái & Thao tác */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center justify-between gap-2">
                          <ReviewStatusMarker status={item.status} />
                          <div className="flex items-center gap-1 shrink-0">
                            {item.status === 'pending_review' && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => triggerApprove(e, item.id)}
                                  className="p-1.5 rounded-[4px] hover:bg-canvas text-success transition-colors cursor-pointer"
                                  title="Duyệt khóa học"
                                  aria-label="Duyệt khóa học"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => triggerReject(e, item.id)}
                                  className="p-1.5 rounded-[4px] hover:bg-canvas text-danger-brick transition-colors cursor-pointer"
                                  title="Từ chối khóa học"
                                  aria-label="Từ chối khóa học"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer: Pagination */}
        {!loading && !error && paginatedReviews.length > 0 && (
          <div className="mb-6">
            <AdminPagination
              currentPage={page}
              perPage={perPage}
              total={meta.total}
              onPageChange={setPage}
              onPerPageChange={(pp) => {
                setPerPage(pp);
                setPage(1);
              }}
              itemLabel="khóa học"
            />
          </div>
        )}
      </section>

      {/* DRAWER CHI TIẾT KIỂM DUYỆT KHÓA HỌC */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            onClick={handleCloseDrawer}
            className="absolute inset-0 bg-black/40 pointer-events-auto"
          ></div>

          <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <div
              className="w-screen max-w-3xl bg-paper border-l border-hairline flex flex-col h-full shadow-2xl transition-transform duration-300 transform translate-x-0"
            >
              {/* Drawer Header (Sticky) */}
              <div className="px-5 py-4 border-b border-hairline flex items-center justify-between shrink-0 bg-paper sticky top-0 z-20">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-ink font-sans">Chi tiết kiểm duyệt khóa học</h2>
                    {drawerData?.checklist && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] border ${
                          drawerData.checklist.passed
                            ? 'bg-success-soft text-success border-success/20'
                            : 'bg-danger-brick-soft text-danger-brick border-danger-brick/20'
                        }`}
                      >
                        ● {drawerData.checklist.passed ? 'Đạt checklist' : 'Chưa đạt checklist'}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-mid-gray mt-0.5">
                    ID Khóa học: <span className="font-mono font-medium">{activeCourseId || '---'}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="rounded-[6px] border border-hairline p-1.5 hover:bg-canvas text-ink transition-colors cursor-pointer"
                  aria-label="Đóng Drawer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs Header */}
              <div className="flex border-b border-hairline bg-surface-alt bg-paper px-5 shrink-0 overflow-x-auto scrollbar-none font-sans">
                <button
                  type="button"
                  onClick={() => setDrawerTab('overview')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all ${
                    drawerTab === 'overview'
                      ? 'border-ink text-ink font-bold'
                      : 'border-transparent text-mid-gray hover:text-ink font-medium'
                  }`}
                >
                  1. Tổng quan
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab('content')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all ${
                    drawerTab === 'content'
                      ? 'border-ink text-ink font-bold'
                      : 'border-transparent text-mid-gray hover:text-ink font-medium'
                  }`}
                >
                  2. Nội dung khóa học ({drawerData?.lessons?.length || 0} bài)
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerTab('checklist')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all ${
                    drawerTab === 'checklist'
                      ? 'border-ink text-ink font-bold'
                      : 'border-transparent text-mid-gray hover:text-ink font-medium'
                  }`}
                >
                  3. Checklist kiểm duyệt
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className="flex-grow overflow-y-auto p-5 space-y-6 custom-scrollbar">
                {drawerLoading && (
                  <div className="space-y-4">
                    <div className="aspect-video w-full bg-canvas rounded-[6px] skeleton"></div>
                    <div className="h-5 w-3/4 bg-canvas rounded-full skeleton"></div>
                    <div className="h-3 w-1/2 bg-canvas rounded-full skeleton"></div>
                  </div>
                )}

                {!drawerLoading && drawerData && (
                  <>
                    {/* TAB 1: TỔNG QUAN */}
                    {drawerTab === 'overview' && (
                      <div className="space-y-5">
                        <div className="relative aspect-video w-full rounded-[6px] overflow-hidden border border-hairline">
                          <img
                            src={drawerData.course?.thumbnail_url || ''}
                            alt="Course Thumbnail"
                            className="w-full h-full object-cover"
                            onError={(e: any) => {
                              e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-black/60 text-white backdrop-blur-[2px]">
                              {formatLevel(drawerData.course?.level)}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-black/60 text-white backdrop-blur-[2px]">
                              {drawerData.course?.language === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-ink leading-tight font-sans">
                            {drawerData.course?.title}
                          </h3>
                          <p className="text-[11px] text-mid-gray font-mono">
                            Slug: {drawerData.course?.slug}
                          </p>
                          <div className="flex items-center gap-4 pt-1">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs text-mid-gray">Giá bán:</span>
                              <span className="text-base font-bold text-ink">
                                {formatMoney(drawerData.course?.sale_price ?? drawerData.course?.price)}
                              </span>
                              {drawerData.course?.sale_price !== null && drawerData.course?.sale_price !== undefined && (
                                <span className="text-xs text-mid-gray line-through ml-1">
                                  {formatMoney(drawerData.course?.price)}
                                </span>
                              )}
                            </div>
                            <div className="h-3 w-px bg-hairline"></div>
                            <span className="text-xs text-mid-gray">
                              Thời lượng: {formatDuration(drawerData.course?.total_duration_seconds)}
                            </span>
                          </div>
                        </div>

                        {/* Instructor Profile */}
                        <div className="p-4 rounded-[6px] border border-hairline bg-surface-alt flex items-start gap-4">
                          <img
                            src={drawerData.course?.instructor?.avatar_url || ''}
                            alt="Instructor avatar"
                            className="w-12 h-12 rounded-full object-cover border border-hairline shrink-0"
                            onError={(e: any) => {
                              e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-xs font-bold text-ink">
                              Giảng viên: {drawerData.course?.instructor?.full_name}
                            </h4>
                            <p className="text-[11px] text-mid-gray font-medium font-sans">
                              {drawerData.course?.instructor?.email}
                            </p>
                            <p className="text-[10px] text-mid-gray italic">
                              {drawerData.course?.instructor?.title || 'Giảng viên tại MindHub'}
                            </p>
                          </div>
                        </div>

                        {/* Descriptions */}
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <h4 className="text-[11px] font-bold text-mid-gray uppercase tracking-wider">
                              MÔ TẢ NGẮN
                            </h4>
                            <p className="text-xs text-ink leading-relaxed">
                              {drawerData.course?.short_description || 'Không có mô tả ngắn.'}
                            </p>
                          </div>
                          <div className="h-px bg-hairline"></div>
                          <div className="space-y-2">
                            <h4 className="text-[11px] font-bold text-mid-gray uppercase tracking-wider">
                              CHI TIẾT KHÓA HỌC
                            </h4>
                            <div
                              className="text-xs text-ink space-y-2 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: drawerData.course?.description || 'Không có mô tả chi tiết.' }}
                            ></div>
                          </div>
                        </div>

                        <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-mid-gray border-t border-hairline">
                          <span>Ngày tạo: {formatDateTime(drawerData.course?.created_at)}</span>
                          <span>Cập nhật cuối: {formatDateTime(drawerData.course?.updated_at)}</span>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: NỘI DUNG KHÓA HỌC */}
                    {drawerTab === 'content' && (
                      <div className="space-y-4 font-sans">
                        <div className="flex items-center justify-between text-xs text-mid-gray">
                          <span>Tổng số: {drawerData.sections?.length || 0} chương</span>
                          <span>{drawerData.lessons?.length || 0} bài học</span>
                        </div>

                        <div className="space-y-2.5">
                          {(!drawerData.sections || drawerData.sections.length === 0) ? (
                            <div className="p-4 text-center text-xs text-mid-gray italic bg-canvas border border-hairline rounded-[6px]">
                              Khóa học này chưa được khởi tạo Chương/Bài học nào.
                            </div>
                          ) : (
                            drawerData.sections.map((sec: any) => {
                              const isExpanded = expandedSectionIds.has(sec.id);
                              const secLessons = drawerData.lessons?.filter((l: any) => String(l.section_id) === String(sec.id)) || [];

                              return (
                                <div key={sec.id} className="border border-hairline rounded-[6px] overflow-hidden bg-canvas">
                                  <button
                                    type="button"
                                    onClick={() => toggleSection(sec.id)}
                                    className="w-full p-3 flex items-center justify-between bg-surface-alt hover:bg-hairline/60 transition-colors text-left cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <svg
                                        className={`w-4 h-4 text-mid-gray transition-transform duration-200 ${
                                          isExpanded ? 'rotate-180' : ''
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                      </svg>
                                      <span className="font-bold text-xs text-ink">
                                        {sec.title || `Chương ${sec.order}`}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-mid-gray font-medium shrink-0 ml-2">
                                      {secLessons.length} bài ({formatDuration(sec.total_duration_seconds)})
                                    </div>
                                  </button>
                                  {isExpanded && (
                                    <div className="divide-y divide-hairline bg-paper">
                                      {secLessons.map((les: any) => (
                                        <div key={les.id} className="p-2.5 pl-8 flex items-center justify-between text-xs hover:bg-canvas/50 transition-colors font-medium">
                                          <div className="flex items-center gap-2 min-w-0 pr-2">
                                            {getLessonTypeIcon(les.type)}
                                            <span className="text-ink font-medium truncate">{les.title}</span>
                                            {les.is_preview && (
                                              <span className="text-[9px] font-bold text-success bg-success-soft px-1.5 py-0.5 rounded">
                                                Học thử
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[10px] text-mid-gray shrink-0 font-mono">
                                            {formatDuration(les.duration_seconds)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB 3: CHECKLIST KIỂM DUYỆT */}
                    {drawerTab === 'checklist' && drawerData.checklist && (
                      <div className="space-y-6">
                        {/* Overall Card */}
                        <div
                          className={`rounded-[6px] p-4 flex items-start justify-between gap-3 border ${
                            drawerData.checklist.passed
                              ? 'border-success/30 bg-success-soft/20 text-success'
                              : 'border-danger-brick/30 bg-danger-brick-soft/20 text-danger-brick'
                          }`}
                        >
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  drawerData.checklist.passed ? 'bg-success' : 'bg-danger-brick'
                                }`}
                              ></span>
                              {drawerData.checklist.passed ? 'Đạt checklist kiểm duyệt' : 'Chưa đạt checklist kiểm duyệt'}
                            </h4>
                            <p className="text-xs opacity-90 leading-relaxed font-medium">
                              {drawerData.checklist.summary}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-mono px-2.5 py-1 rounded font-bold uppercase tracking-wider text-white shrink-0 ${
                              drawerData.checklist.passed ? 'bg-success' : 'bg-danger-brick'
                            }`}
                          >
                            {drawerData.checklist.passed ? 'Đạt tiêu chuẩn' : `Thiếu ${drawerData.checklist.missing_items?.length || 0} mục`}
                          </span>
                        </div>

                        {/* Missing items list */}
                        {drawerData.checklist.missing_items && drawerData.checklist.missing_items.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[11px] font-bold text-mid-gray uppercase tracking-wider">
                              CÁC MỤC CÒN THIẾU / LỖI NỘI DUNG:
                            </h4>
                            <ul className="space-y-1.5">
                              {drawerData.checklist.missing_items.map((item: string, idx: number) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-xs text-danger-brick font-medium leading-relaxed bg-danger-brick-soft/10 p-2 rounded-[4px] border border-danger-brick/10"
                                >
                                  <svg className="w-3.5 h-3.5 text-danger-brick shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Warnings */}
                        {drawerData.checklist.warnings && drawerData.checklist.warnings.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[11px] font-bold text-mid-gray uppercase tracking-wider">
                              CẢNH BÁO / LƯU Ý HỆ THỐNG:
                            </h4>
                            <ul className="space-y-1.5">
                              {drawerData.checklist.warnings.map((warn: string, idx: number) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-xs text-ink font-medium leading-relaxed bg-warning-soft/20 p-2 rounded-[4px] border border-warning/20"
                                >
                                  <svg className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                  </svg>
                                  <span>{warn}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Checks List */}
                        <div className="space-y-2 font-sans">
                          <h4 className="text-[11px] font-bold text-mid-gray uppercase tracking-wider">
                            DANH SÁCH KIỂM TRA CHI TIẾT
                          </h4>
                          <div className="border border-hairline rounded-[6px] divide-y divide-hairline overflow-hidden">
                            {(!drawerData.checklist.checks || drawerData.checklist.checks.length === 0) ? (
                              <div className="p-3 text-center text-xs text-mid-gray italic">
                                Chưa có danh sách kiểm tra chi tiết.
                              </div>
                            ) : (
                              drawerData.checklist.checks.map((c: any, idx: number) => (
                                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-canvas/30">
                                  <div className="space-y-0.5 pr-2 font-medium">
                                    <div className="font-bold text-ink">{c.name}</div>
                                    <div className="text-[11px] text-mid-gray leading-normal">{c.message}</div>
                                  </div>
                                  <span
                                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded ${
                                      c.passed ? 'bg-success-soft text-success' : 'bg-danger-brick-soft text-danger-brick'
                                    }`}
                                  >
                                    {c.passed ? '● Đạt' : '● Chưa đạt'}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Drawer Footer Actions (Sticky) */}
              <div className="px-5 py-4 border-t border-hairline bg-surface-alt flex items-center justify-between shrink-0 select-none">
                <div>
                  <p id="drawer-footer-reason-hint" className="text-[10px] text-mid-gray font-semibold italic">
                    {drawerData?.course?.status === 'pending_review'
                      ? 'Đang ở chế độ xem xét kiểm duyệt'
                      : `Khóa học ${
                          drawerData?.course?.status === 'published'
                            ? 'đã được duyệt'
                            : drawerData?.course?.status === 'rejected'
                            ? 'đã bị từ chối'
                            : 'không ở trạng thái chờ duyệt'
                        } (Chế độ xem chi tiết)`}
                  </p>
                </div>
                {drawerData?.course?.status === 'pending_review' && (
                  <div className="flex items-center gap-2 font-sans">
                    <button
                      type="button"
                      onClick={(e) => triggerReject(e, drawerData.course.id)}
                      className="px-3.5 py-2 text-xs font-semibold rounded-[6px] border border-hairline bg-paper text-danger-brick hover:bg-danger-brick-soft/10 transition-colors cursor-pointer"
                    >
                      Từ chối
                    </button>
                    <button
                      type="button"
                      onClick={(e) => triggerApprove(e, drawerData.course.id)}
                      className="px-4 py-2 text-xs font-semibold rounded-[6px] bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Duyệt khóa học
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM APPROVE MODAL */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4">
          <div onClick={() => setIsApproveModalOpen(false)} className="absolute inset-0 bg-black/40"></div>
          <div className="relative bg-paper rounded-[6px] border border-hairline shadow-2xl w-full max-w-md p-5 z-10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success-soft text-success shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <div className="min-w-0 space-y-1">
                <h3 className="text-sm font-bold text-ink">Xác nhận duyệt khóa học?</h3>
                <p className="text-xs text-mid-gray leading-normal">
                  Bạn có chắc chắn muốn xuất bản khóa học này lên hệ thống? Học viên sẽ lập tức có thể đăng ký học.
                </p>
              </div>
            </div>

            {selectedApproveCourse && (
              <div className="p-3 bg-surface-alt rounded-[6px] border border-hairline text-xs space-y-1.5">
                <div className="font-bold text-ink leading-snug">{selectedApproveCourse.title}</div>
                <div className="text-[11px] text-mid-gray font-medium">
                  Giảng viên: <span className="font-medium text-ink">{selectedApproveCourse.instructor?.full_name}</span>
                </div>
                <div className="text-[11px] text-mid-gray font-medium">
                  Giá: <span className="font-semibold text-ink">{formatMoney(selectedApproveCourse.sale_price ?? selectedApproveCourse.price)}</span>
                </div>
                <div className="text-[11px] flex items-center gap-1 font-medium">
                  <span className="text-mid-gray font-medium">Checklist:</span>
                  <span
                    className={`font-bold ${
                      selectedApproveCourse.checklist?.passed ?? true ? 'text-success' : 'text-warning'
                    }`}
                  >
                    {selectedApproveCourse.checklist?.passed ?? true ? '● Đạt' : '● Chưa đạt'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1.5 font-sans">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-[6px] border border-hairline bg-paper text-ink hover:bg-canvas transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={submittingAction}
                onClick={handleConfirmApprove}
                className="px-4 py-2 text-xs font-semibold rounded-[6px] bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {submittingAction ? 'Đang xử lý...' : 'Xác nhận duyệt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM REJECT MODAL */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 font-sans">
          <div onClick={() => setIsRejectModalOpen(false)} className="absolute inset-0 bg-black/40"></div>
          <div className="relative bg-paper rounded-[6px] border border-hairline shadow-2xl w-full max-w-md p-5 z-10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-danger-brick-soft text-danger-brick shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="min-w-0 space-y-1">
                <h3 className="text-sm font-bold text-ink">Từ chối phê duyệt khóa học?</h3>
                <p className="text-xs text-mid-gray leading-normal">
                  Khóa học sẽ bị chuyển về trạng thái cần sửa đổi. Hãy cung cấp lý do chi tiết để giảng viên sửa nội dung.
                </p>
              </div>
            </div>

            {selectedApproveCourse && (
              <div className="p-3 bg-surface-alt rounded-[6px] border border-hairline text-xs space-y-1.5">
                <div className="font-bold text-ink leading-snug">{selectedApproveCourse.title}</div>
                <div className="text-[11px] text-mid-gray">
                  Giảng viên: <span className="font-medium text-ink">{selectedApproveCourse.instructor?.full_name}</span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="reject-reason-input" className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">
                LÝ DO TỪ CHỐI (BẮT BUỘC)
              </label>
              <textarea
                id="reject-reason-input"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Thiếu tài liệu bài tập chương 3, chất lượng âm thanh video bài 5 bị rè..."
                rows={4}
                maxLength={1000}
                className="w-full p-2.5 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink placeholder-mid-gray/60 leading-relaxed font-semibold font-sans"
              ></textarea>
              <div className="flex items-center justify-between text-[9px] text-mid-gray mt-1">
                <span>Vui lòng viết tối đa 1000 ký tự</span>
                <span>{rejectReason.length}/1000</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-[6px] border border-hairline bg-paper text-ink hover:bg-canvas transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={submittingAction}
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-semibold rounded-[6px] bg-danger-brick text-white hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {submittingAction ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
