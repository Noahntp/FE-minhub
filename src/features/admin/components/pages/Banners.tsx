import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Search,
  RotateCw,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  Check,
  Image as ImageIcon,
  Link as LinkIcon,
  ChevronsUpDown,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Layout,
  Layers,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  fetchBanners,
  fetchBannerById,
  createBanner,
  updateBanner,
  deleteBanner
} from '@/assets/js/api/banners-api';

interface BannerItem {
  id: number;
  title: string;
  image_url: string;
  target_url: string | null;
  position: string;
  sort_order: number;
  start_at: string | null;
  end_at: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface SummaryStats {
  total_banners: number;
  active_count: number;
  scheduled_count: number;
  expired_count: number;
  inactive_count: number;
}

const positionMap: Record<string, string> = {
  home_top: "Đầu trang chủ",
  home_middle: "Giữa trang chủ",
  home_bottom: "Cuối trang chủ",
  sidebar: "Thanh bên",
  home: "Đầu trang chủ" // Fallback
};

const effectiveStatusMap: Record<string, { label: string; colorClass: string; dotClass: string }> = {
  active: {
    label: "Đang hiển thị",
    colorClass: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50",
    dotClass: "bg-emerald-500"
  },
  scheduled: {
    label: "Sắp hiển thị",
    colorClass: "text-blue-700 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50",
    dotClass: "bg-blue-500"
  },
  expired: {
    label: "Đã kết thúc",
    colorClass: "text-amber-700 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50",
    dotClass: "bg-amber-500"
  },
  inactive: {
    label: "Đã tắt",
    colorClass: "text-gray-500 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800",
    dotClass: "bg-gray-400"
  }
};

const statusMap: Record<string, { label: string; colorClass: string; dotClass: string }> = {
  active: { label: "Đang bật", colorClass: "text-emerald-600", dotClass: "bg-emerald-500" },
  inactive: { label: "Đã tắt", colorClass: "text-gray-400", dotClass: "bg-gray-400" }
};

const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%239ca3af'%3EẢnh không khả dụng%3C/text%3E%3C/svg%3E";

function getEffectiveStatus(item: any) {
  if (item.status === 'inactive') {
    return 'inactive';
  }
  const now = new Date();
  if (item.start_at && new Date(item.start_at) > now) {
    return 'scheduled';
  }
  if (item.end_at && new Date(item.end_at) < now) {
    return 'expired';
  }
  return 'active';
}

export default function Banners() {
  // Query parameters state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('all');
  const [status, setStatus] = useState('all');
  const [viewMode, setViewMode] = useState('all');

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 450);
    return () => clearTimeout(timer);
  }, [search]);

  // Data & loading state
  const [items, setItems] = useState<BannerItem[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    total_banners: 0,
    active_count: 0,
    scheduled_count: 0,
    expired_count: 0,
    inactive_count: 0
  });
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState('');

  // Accordion state (expanded position groups)
  const [expandedPositions, setExpandedPositions] = useState<Record<string, boolean>>({
    home_top: true,
    home_middle: true,
    home_bottom: true,
    sidebar: true,
    home: true
  });

  // Selected banner drawer state
  const [selectedBannerId, setSelectedBannerId] = useState<number | null>(null);
  const [detail, setDetail] = useState<BannerItem | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Modal forms state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    target_url: '',
    position: 'home_top',
    sort_order: 1,
    start_at: '',
    end_at: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline priority temporary edits state
  const [tempSortOrders, setTempSortOrders] = useState<Record<number, number>>({});
  const [sortLoading, setSortLoading] = useState<Record<number, boolean>>({});

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<BannerItem | null>(null);

  // Fetch index data
  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetchBanners({
        page,
        per_page: perPage,
        search: debouncedSearch,
        position,
        status,
        view_mode: viewMode
      });

      if (res.success) {
        setItems(res.data.items);
        setSummary(res.data.summary);
        setMeta(res.meta);
        setLastUpdateTime(
          new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        );
      } else {
        toast.error(res.message || 'Lỗi lấy danh sách banner.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối máy chủ.');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Trigger load on state change
  useEffect(() => {
    loadData();
  }, [page, perPage, debouncedSearch, position, status, viewMode]);

  // Load detail for drawer
  const loadDetail = async (id: number) => {
    setIsDetailLoading(true);
    try {
      const res = await fetchBannerById(id);
      if (res.success) {
        setDetail(res.data);
      } else {
        toast.error(res.message || 'Không thể lấy thông tin chi tiết banner.');
        setSelectedBannerId(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối khi lấy chi tiết.');
      setSelectedBannerId(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBannerId) {
      loadDetail(selectedBannerId);
    } else {
      setDetail(null);
    }
  }, [selectedBannerId]);

  // Handle accordion toggle
  const togglePositionGroup = (pos: string) => {
    setExpandedPositions(prev => ({ ...prev, [pos]: !prev[pos] }));
  };

  // Helper date parsing/formats
  const formatDateTime = (isoStr?: string | null) => {
    if (!isoStr) return "Không giới hạn";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "Không hợp lệ";
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }) + " " + d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const isoToDatetimeLocal = (isoStr?: string | null) => {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Handle filter resets
  const handleResetFilters = () => {
    setSearch('');
    setPosition('all');
    setStatus('all');
    setViewMode('all');
    setPage(1);
    toast.success('Đã xóa tất cả bộ lọc');
  };

  const handleCardClick = (mode: 'total' | 'active' | 'scheduled' | 'expired' | 'inactive') => {
    setPage(1);
    if (mode === 'total') {
      setStatus('all');
      setViewMode('all');
    } else if (mode === 'active') {
      setStatus('all');
      setViewMode('active');
    } else if (mode === 'scheduled') {
      setStatus('all');
      setViewMode('scheduled');
    } else if (mode === 'expired') {
      setStatus('all');
      setViewMode('expired');
    } else if (mode === 'inactive') {
      setStatus('inactive');
      setViewMode('all');
    }
    toast.success('Đã lọc danh sách nhanh');
  };

  // Inline sort order changes
  const handleTempSortChange = (id: number, currentVal: number, step: number) => {
    const newVal = Math.max(1, (tempSortOrders[id] !== undefined ? tempSortOrders[id] : currentVal) + step);
    setTempSortOrders(prev => ({ ...prev, [id]: newVal }));
  };

  const handleManualSortChange = (id: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    const num = Math.max(1, parseInt(clean) || 1);
    setTempSortOrders(prev => ({ ...prev, [id]: num }));
  };

  const handleSaveSort = async (id: number) => {
    const newSort = tempSortOrders[id];
    if (newSort === undefined) return;

    setSortLoading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await updateBanner(id, { sort_order: newSort });
      if (res.success) {
        toast.success(`Đã cập nhật thứ tự banner ID #${id} thành ${newSort}`);
        setTempSortOrders(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        loadData(true);
      } else {
        toast.error(res.message || 'Cập nhật thứ tự thất bại.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối máy chủ.');
    } finally {
      setSortLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleCancelSort = (id: number) => {
    setTempSortOrders(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Open Form Modal
  const openCreateModal = () => {
    setFormMode('create');
    setFormData({
      title: '',
      image_url: '',
      target_url: '',
      position: 'home_top',
      sort_order: 1,
      start_at: '',
      end_at: '',
      status: 'active'
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (item: BannerItem) => {
    setFormMode('edit');
    setFormData({
      title: item.title,
      image_url: item.image_url,
      target_url: item.target_url || '',
      position: item.position,
      sort_order: item.sort_order,
      start_at: isoToDatetimeLocal(item.start_at),
      end_at: isoToDatetimeLocal(item.end_at),
      status: item.status
    });
    setDetail(item);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Toggle quick status
  const handleToggleStatus = async (item: BannerItem) => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await updateBanner(item.id, { status: nextStatus });
      if (res.success) {
        toast.success(`Đã ${nextStatus === 'active' ? 'bật' : 'tắt'} banner ID #${item.id}`);
        loadData(true);
        if (selectedBannerId === item.id) {
          loadDetail(item.id);
        }
      } else {
        toast.error(res.message || 'Lỗi cập nhật trạng thái.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối máy chủ.');
    }
  };

  // Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validation
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Tiêu đề là bắt buộc.';
    if (!formData.image_url.trim()) errors.image_url = 'Đường dẫn ảnh là bắt buộc.';
    if (!formData.position) errors.position = 'Vị trí hiển thị là bắt buộc.';
    
    if (formData.start_at && formData.end_at) {
      if (new Date(formData.end_at) <= new Date(formData.start_at)) {
        errors.end_at = 'Thời gian kết thúc phải sau thời gian bắt đầu.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        image_url: formData.image_url.trim(),
        target_url: formData.target_url.trim() || null,
        position: formData.position,
        sort_order: Number(formData.sort_order),
        start_at: formData.start_at ? new Date(formData.start_at).toISOString() : null,
        end_at: formData.end_at ? new Date(formData.end_at).toISOString() : null,
        status: formData.status
      };

      let res;
      if (formMode === 'create') {
        res = await createBanner(payload);
      } else {
        res = await updateBanner(detail!.id, payload);
      }

      if (res.success) {
        toast.success(`${formMode === 'create' ? 'Tạo mới' : 'Cập nhật'} banner thành công.`);
        setIsFormOpen(false);
        loadData();
        if (selectedBannerId && formMode === 'edit') {
          loadDetail(selectedBannerId);
        }
      } else {
        toast.error(res.message || 'Đã xảy ra lỗi khi lưu.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Lỗi kết nối.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Banner action
  const confirmDelete = (item: BannerItem) => {
    setBannerToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!bannerToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await deleteBanner(bannerToDelete.id);
      if (res.success) {
        toast.success(`Đã xóa banner ID #${bannerToDelete.id} thành công.`);
        setIsDeleteOpen(false);
        setBannerToDelete(null);
        setSelectedBannerId(null);
        loadData();
      } else {
        toast.error(res.message || 'Xóa banner thất bại.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group items by position
  const positionsOrder = ["home_top", "home_middle", "sidebar", "home_bottom", "home"];
  const groupedItems: Record<string, BannerItem[]> = {
    home_top: [],
    home_middle: [],
    sidebar: [],
    home_bottom: [],
    home: []
  };

  items.forEach(item => {
    const pos = groupedItems[item.position] ? item.position : 'home';
    groupedItems[pos].push(item);
  });

  const getEffectiveLabelColor = (item: BannerItem) => {
    const eff = getEffectiveStatus(item);
    return effectiveStatusMap[eff] || effectiveStatusMap.inactive;
  };

  return (
    <>
      {/* HEADER */}
      <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-mid-gray">MindHub Admin • Quản lý nội dung</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Banner & Trang chủ</h1>
          <p className="mt-1 text-sm text-mid-gray">
            Quản lý banner, vị trí hiển thị, lịch chạy và thứ tự hiển thị trên trang chủ.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData()}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-hairline bg-paper px-4 text-sm font-medium hover:bg-canvas disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
            Làm mới
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-paper hover:bg-ink/90 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Tạo banner
          </button>
        </div>
      </header>

      {/* KPI SUMMARY */}
      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {/* COL 1: Tổng cộng */}
        <button
          onClick={() => handleCardClick('total')}
          className={`text-left rounded-2xl border bg-paper p-4 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.01] outline-none focus-visible:ring-2 focus-visible:ring-ink ${
            status === 'all' && viewMode === 'all'
              ? 'border-ink ring-1 ring-ink/20'
              : 'border-hairline'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-mid-gray">Tổng banner</p>
          <p className="mt-2 text-2xl font-bold text-ink">{summary.total_banners}</p>
          <p className="mt-1 text-[11px] text-mid-gray/70">Toàn hệ thống</p>
        </button>

        {/* COL 2: Đang hiển thị */}
        <button
          onClick={() => handleCardClick('active')}
          className={`text-left rounded-2xl border bg-paper p-4 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.01] outline-none focus-visible:ring-2 focus-visible:ring-ink ${
            status === 'all' && viewMode === 'active'
              ? 'border-emerald-500 ring-1 ring-emerald-500/20'
              : 'border-hairline'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Đang hiển thị</p>
          <p className="mt-2 text-2xl font-bold text-ink">{summary.active_count}</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-emerald-100 dark:bg-emerald-950/20 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${summary.total_banners > 0 ? (summary.active_count / summary.total_banners) * 100 : 0}%` }}
            />
          </div>
        </button>

        {/* COL 3: Sắp hiển thị */}
        <button
          onClick={() => handleCardClick('scheduled')}
          className={`text-left rounded-2xl border bg-paper p-4 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.01] outline-none focus-visible:ring-2 focus-visible:ring-ink ${
            status === 'all' && viewMode === 'scheduled'
              ? 'border-blue-500 ring-1 ring-blue-500/20'
              : 'border-hairline'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Sắp hiển thị</p>
          <p className="mt-2 text-2xl font-bold text-ink">{summary.scheduled_count}</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-blue-100 dark:bg-blue-950/20 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${summary.total_banners > 0 ? (summary.scheduled_count / summary.total_banners) * 100 : 0}%` }}
            />
          </div>
        </button>

        {/* COL 4: Đã kết thúc */}
        <button
          onClick={() => handleCardClick('expired')}
          className={`text-left rounded-2xl border bg-paper p-4 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.01] outline-none focus-visible:ring-2 focus-visible:ring-ink ${
            status === 'all' && viewMode === 'expired'
              ? 'border-amber-500 ring-1 ring-amber-500/20'
              : 'border-hairline'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Đã kết thúc</p>
          <p className="mt-2 text-2xl font-bold text-ink">{summary.expired_count}</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-amber-100 dark:bg-amber-950/20 overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${summary.total_banners > 0 ? (summary.expired_count / summary.total_banners) * 100 : 0}%` }}
            />
          </div>
        </button>

        {/* COL 5: Đã tắt */}
        <button
          onClick={() => handleCardClick('inactive')}
          className={`text-left rounded-2xl border bg-paper p-4 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.01] outline-none focus-visible:ring-2 focus-visible:ring-ink ${
            status === 'inactive' && viewMode === 'all'
              ? 'border-gray-500 ring-1 ring-gray-500/20'
              : 'border-hairline'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Đã tắt</p>
          <p className="mt-2 text-2xl font-bold text-ink">{summary.inactive_count}</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-gray-500 transition-all duration-500"
              style={{ width: `${summary.total_banners > 0 ? (summary.inactive_count / summary.total_banners) * 100 : 0}%` }}
            />
          </div>
        </button>
      </section>

      {/* FILTER BAR */}
      <section className="mb-6 rounded-2xl border border-hairline bg-paper p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-mid-gray/80" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề hoặc URL đích..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-hairline bg-transparent pl-10 pr-4 text-sm outline-none focus:border-ink transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:w-auto">
            {/* Vị trí */}
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="h-10 rounded-xl border border-hairline bg-paper px-3 text-xs outline-none focus:border-ink transition-colors cursor-pointer"
            >
              <option value="all">Tất cả vị trí</option>
              <option value="home_top">Đầu trang chủ</option>
              <option value="home_middle">Giữa trang chủ</option>
              <option value="home_bottom">Cuối trang chủ</option>
              <option value="sidebar">Thanh bên</option>
            </select>
            {/* Trạng thái DB */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 rounded-xl border border-hairline bg-paper px-3 text-xs outline-none focus:border-ink transition-colors cursor-pointer"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="active">Đang bật</option>
              <option value="inactive">Đã tắt</option>
            </select>
            {/* Hiệu lực */}
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="h-10 rounded-xl border border-hairline bg-paper px-3 text-xs outline-none focus:border-ink transition-colors cursor-pointer"
            >
              <option value="all">Mọi hiệu lực</option>
              <option value="active">Đang hiển thị</option>
              <option value="scheduled">Sắp hiển thị</option>
              <option value="expired">Đã kết thúc</option>
              <option value="inactive">Đã tắt</option>
            </select>

            <button
              onClick={handleResetFilters}
              disabled={search === '' && position === 'all' && status === 'all' && viewMode === 'all'}
              className="h-10 rounded-xl border border-hairline px-3 text-xs font-semibold hover:bg-canvas disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Xóa lọc
            </button>
          </div>
        </div>
      </section>

      {/* TABLE DATA */}
      <section className="relative rounded-2xl border border-hairline bg-paper shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-mid-gray" />
            <p className="text-sm text-mid-gray">Đang tải danh sách banner...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <ImageIcon className="h-12 w-12 text-mid-gray/40" />
            <h3 className="font-semibold text-ink">Không tìm thấy banner nào</h3>
            <p className="text-xs text-mid-gray/80 max-w-sm text-center">
              Thử điều chỉnh từ khóa tìm kiếm hoặc các tiêu chí bộ lọc.
            </p>
            {(search || position !== 'all' || status !== 'all' || viewMode !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="mt-1 inline-flex h-9 items-center justify-center rounded-xl bg-ink px-4 text-xs font-medium text-paper hover:bg-ink/90 transition-all cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-hairline bg-canvas/30 text-xs font-semibold text-mid-gray uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">ID</th>
                  <th className="py-3 px-4">Banner</th>
                  <th className="py-3 px-4 w-32">Vị trí</th>
                  <th className="py-3 px-4 w-36 text-center">Thứ tự</th>
                  <th className="py-3 px-4">Lịch hiển thị</th>
                  <th className="py-3 px-4 w-28">Hiệu lực</th>
                  <th className="py-3 px-4 w-28">Trạng thái</th>
                  <th className="py-3 px-4 w-20 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {positionsOrder.map(pos => {
                  const groupItems = groupedItems[pos] || [];
                  if (groupItems.length === 0 && position !== 'all' && position !== pos) return null;
                  if (groupItems.length === 0) return null;

                  const isExpanded = expandedPositions[pos] !== false;

                  return (
                    <React.Fragment key={pos}>
                      {/* Accordion Group Header */}
                      <tr
                        onClick={() => togglePositionGroup(pos)}
                        className="bg-canvas/40 hover:bg-canvas/60 border-b border-hairline/80 font-bold text-ink cursor-pointer select-none align-middle transition-colors"
                      >
                        <td colSpan={8} className="py-2.5 px-4">
                          <div className="flex items-center">
                            <span className="p-0.5 mr-2 text-mid-gray hover:text-ink rounded transition-all">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                            </span>
                            <span className="text-xs font-bold text-ink uppercase tracking-wide">
                              {positionMap[pos] || pos}
                            </span>
                            <span className="ml-2 text-xs font-normal text-mid-gray">
                              ({groupItems.length} banner)
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Group Item Rows */}
                      {isExpanded && groupItems.map(item => {
                        const tempSort = tempSortOrders[item.id];
                        const isSortChanged = tempSort !== undefined && tempSort !== item.sort_order;
                        const isThisSortLoading = sortLoading[item.id] || false;
                        const eff = getEffectiveLabelColor(item);

                        return (
                          <tr
                            key={item.id}
                            onClick={() => setSelectedBannerId(item.id)}
                            className="hover:bg-canvas/20 cursor-pointer transition-colors"
                          >
                            {/* ID */}
                            <td className="py-3.5 px-4 text-center text-xs font-semibold tabular-nums text-mid-gray/80">
                              #{item.id}
                            </td>
                            {/* Banner details */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-20 rounded-lg bg-canvas border border-hairline overflow-hidden shrink-0 relative group">
                                  <img
                                    src={item.image_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                    }}
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-ink truncate text-sm" title={item.title}>
                                    {item.title}
                                  </p>
                                  {item.target_url ? (
                                    <a
                                      href={item.target_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 text-[11px] text-mid-gray hover:text-ink hover:underline truncate max-w-xs mt-0.5"
                                      title={item.target_url}
                                    >
                                      <LinkIcon className="h-3 w-3 shrink-0" />
                                      {item.target_url}
                                      <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                    </a>
                                  ) : (
                                    <span className="text-[11px] text-mid-gray/50 italic block mt-0.5">
                                      Không có URL đích
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            {/* Position */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="text-xs font-medium text-ink">
                                {positionMap[item.position] || item.position}
                              </span>
                            </td>
                            {/* Priority editor */}
                            <td
                              className="py-3.5 px-4 text-center whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="inline-flex items-center justify-center gap-1.5 w-full">
                                <div className="inline-flex items-center justify-center gap-0.5 border border-hairline rounded-lg bg-canvas/30 p-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleTempSortChange(item.id, item.sort_order, -1)}
                                    className="h-5 w-5 rounded hover:bg-canvas flex items-center justify-center text-xs font-bold transition-colors cursor-pointer select-none"
                                  >
                                    −
                                  </button>
                                  <input
                                    type="text"
                                    value={tempSort !== undefined ? tempSort : item.sort_order}
                                    onChange={(e) => handleManualSortChange(item.id, e.target.value)}
                                    className="w-7 text-center bg-transparent border-none outline-none text-xs font-semibold text-ink p-0"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleTempSortChange(item.id, item.sort_order, 1)}
                                    className="h-5 w-5 rounded hover:bg-canvas flex items-center justify-center text-xs font-bold transition-colors cursor-pointer select-none"
                                  >
                                    +
                                  </button>
                                </div>

                                {isSortChanged && (
                                  <div className="flex items-center gap-1 shrink-0 animate-in fade-in zoom-in duration-150">
                                    <button
                                      type="button"
                                      disabled={isThisSortLoading}
                                      onClick={() => handleSaveSort(item.id)}
                                      className="h-5 w-5 rounded bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                                      title="Lưu"
                                    >
                                      {isThisSortLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : '✓'}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isThisSortLoading}
                                      onClick={() => handleCancelSort(item.id)}
                                      className="h-5 w-5 rounded border border-hairline bg-paper text-mid-gray hover:text-ink flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer"
                                      title="Hủy"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                            {/* Schedule */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="text-[11px] space-y-0.5 font-medium tabular-nums text-mid-gray">
                                <div>
                                  <span>Bắt đầu:</span>{' '}
                                  <span className="text-ink">{formatDateTime(item.start_at)}</span>
                                </div>
                                <div>
                                  <span>Kết thúc:</span>{' '}
                                  <span className="text-ink">{formatDateTime(item.end_at)}</span>
                                </div>
                              </div>
                            </td>
                            {/* Validity status badge */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${eff.colorClass}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${eff.dotClass}`} />
                                <span>{eff.label}</span>
                              </div>
                            </td>
                            {/* Active Status DB */}
                            <td
                              className="py-3.5 px-4 whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleToggleStatus(item)}
                                className={`inline-flex items-center gap-1.5 text-xs font-medium select-none cursor-pointer transition-all hover:opacity-85 ${
                                  item.status === 'active' ? 'text-emerald-600' : 'text-gray-400'
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  item.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                                }`} />
                                <span>{item.status === 'active' ? 'Đang bật' : 'Đã tắt'}</span>
                              </button>
                            </td>
                            {/* Actions quick */}
                            <td
                              className="py-3.5 px-4 text-right whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="h-8 w-8 rounded-lg hover:bg-canvas text-mid-gray hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
                                  title="Chỉnh sửa"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => confirmDelete(item)}
                                  className="h-8 w-8 rounded-lg hover:bg-red-50 text-mid-gray hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Xóa"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION PANEL */}
        {!isLoading && items.length > 0 && (
          <div className="flex flex-col justify-between gap-4 border-t border-hairline bg-canvas/10 px-6 py-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4 text-sm text-mid-gray">
              <span>
                Hiển thị <strong className="font-semibold text-ink">{(page - 1) * perPage + 1}</strong> -{' '}
                <strong className="font-semibold text-ink">
                  {Math.min(page * perPage, meta.total)}
                </strong>{' '}
                trong tổng số <strong className="font-semibold text-ink">{meta.total}</strong> bản ghi
              </span>
              <div className="flex items-center gap-2">
                <span>Mỗi trang:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-hairline bg-paper px-2 py-1 text-xs outline-none cursor-pointer focus:border-ink"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="h-9 w-9 rounded-xl border border-hairline bg-paper text-mid-gray hover:bg-canvas disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 text-xs font-semibold tabular-nums text-ink">
                Trang {page} / {meta.last_page || 1}
              </span>
              <button
                disabled={page >= meta.last_page}
                onClick={() => setPage(p => p + 1)}
                className="h-9 w-9 rounded-xl border border-hairline bg-paper text-mid-gray hover:bg-canvas disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* DETAIL DRAWER */}
      {selectedBannerId && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setSelectedBannerId(null)}
            className="absolute inset-0 bg-ink/30 dark:bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          />
          <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
            <div className="w-screen max-w-md bg-paper border-l border-hairline shadow-2xl flex flex-col animate-slide-in-right">
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-hairline flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink">Chi tiết Banner</h2>
                  <p className="text-xs text-mid-gray">Thông tin cấu hình chi tiết & lịch hoạt động</p>
                </div>
                <button
                  onClick={() => setSelectedBannerId(null)}
                  className="p-2 text-mid-gray hover:text-ink hover:bg-canvas rounded-xl transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              {isDetailLoading || !detail ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-mid-gray" />
                  <p className="text-sm text-mid-gray">Đang tải chi tiết...</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                  {/* Banner Large Image Preview */}
                  <div className="rounded-xl overflow-hidden bg-canvas border border-hairline aspect-video relative group shadow-inner">
                    <img
                      src={detail.image_url}
                      alt={detail.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                    />
                    <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <a
                        href={detail.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 px-3 rounded-lg bg-paper text-ink font-semibold text-xs hover:bg-paper/90 transition-all flex items-center gap-1.5"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Xem ảnh gốc
                      </a>
                      {detail.target_url && (
                        <a
                          href={detail.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 px-3 rounded-lg bg-paper text-ink font-semibold text-xs hover:bg-paper/90 transition-all flex items-center gap-1.5"
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                          Xem đích đến
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Header Title */}
                  <div>
                    <h3 className="text-base font-bold text-ink leading-snug">{detail.title}</h3>
                    {detail.target_url && (
                      <p className="mt-1 text-xs text-mid-gray/80 break-all font-medium">
                        URL đích: <span className="text-ink">{detail.target_url}</span>
                      </p>
                    )}
                  </div>

                  <hr className="border-hairline" />

                  {/* Basic Info list */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-mid-gray">Thông tin cấu hình</h4>
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs font-medium">
                      <div>
                        <span className="text-mid-gray block">Mã Banner</span>
                        <span className="text-ink text-sm font-semibold tabular-nums">#{detail.id}</span>
                      </div>
                      <div>
                        <span className="text-mid-gray block">Vị trí hiển thị</span>
                        <span className="text-ink">{positionMap[detail.position] || detail.position}</span>
                      </div>
                      <div>
                        <span className="text-mid-gray block">Thứ tự ưu tiên</span>
                        <span className="text-ink tabular-nums">{detail.sort_order}</span>
                      </div>
                      <div>
                        <span className="text-mid-gray block">Trạng thái (DB)</span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          detail.status === 'active' ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20' : 'text-gray-500 bg-gray-50 dark:bg-gray-800'
                        }`}>
                          {detail.status === 'active' ? 'Đang bật' : 'Đã tắt'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-mid-gray block mb-1">Hiệu lực hiện tại</span>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          getEffectiveLabelColor(detail).colorClass
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${getEffectiveLabelColor(detail).dotClass}`} />
                          <span>{getEffectiveLabelColor(detail).label}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-hairline" />

                  {/* Display schedule */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-mid-gray">Lịch trình hoạt động</h4>
                    <div className="space-y-3 text-xs font-medium tabular-nums">
                      <div className="flex items-center justify-between py-1 bg-canvas/30 px-3 rounded-lg border border-hairline/60">
                        <span className="text-mid-gray">Thời gian bắt đầu</span>
                        <span className="text-ink font-semibold">{formatDateTime(detail.start_at)}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 bg-canvas/30 px-3 rounded-lg border border-hairline/60">
                        <span className="text-mid-gray">Thời gian kết thúc</span>
                        <span className="text-ink font-semibold">{formatDateTime(detail.end_at)}</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-hairline" />

                  {/* System logs */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-mid-gray">Nhật ký chỉnh sửa</h4>
                    <div className="space-y-2 text-xs font-medium text-mid-gray tabular-nums">
                      <p>Ngày tạo: <span className="text-ink">{formatDateTime(detail.created_at)}</span></p>
                      <p>Cập nhật cuối: <span className="text-ink">{formatDateTime(detail.updated_at)}</span></p>
                    </div>
                  </div>
                </div>
              )}

              {/* Drawer Footer actions */}
              {detail && (
                <div className="px-6 py-4 border-t border-hairline bg-canvas/10 flex items-center justify-between gap-3 shrink-0">
                  <button
                    onClick={() => confirmDelete(detail)}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 px-4 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa banner
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(detail)}
                      className={`inline-flex h-10 items-center justify-center rounded-xl border border-hairline px-4 text-xs font-semibold transition-all cursor-pointer ${
                        detail.status === 'active'
                          ? 'text-gray-700 bg-paper hover:bg-canvas'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200'
                      }`}
                    >
                      {detail.status === 'active' ? 'Tắt banner' : 'Bật kích hoạt'}
                    </button>
                    <button
                      onClick={() => openEditModal(detail)}
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-ink text-paper hover:bg-ink/90 px-4 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE & EDIT FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => setIsFormOpen(false)}
            className="fixed inset-0 bg-ink/30 dark:bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          />
          <div className="relative w-full max-w-lg bg-paper border border-hairline rounded-3xl shadow-2xl overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-hairline flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">
                  {formMode === 'create' ? 'Tạo banner mới' : 'Chỉnh sửa banner'}
                </h3>
                <p className="text-xs text-mid-gray">Điền đầy đủ thông tin cấu hình bên dưới</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-mid-gray hover:text-ink hover:bg-canvas rounded-xl transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="flex flex-col">
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Tiêu đề */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                    Tiêu đề banner *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tiêu đề hoặc chiến dịch của banner..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`h-10 w-full rounded-xl border bg-transparent px-3.5 text-sm outline-none focus:border-ink transition-colors ${
                      formErrors.title ? 'border-red-400 focus:border-red-500' : 'border-hairline'
                    }`}
                  />
                  {formErrors.title && (
                    <p className="text-[11px] text-red-500 font-semibold">{formErrors.title}</p>
                  )}
                </div>

                {/* URL Ảnh */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                    URL Ảnh banner *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="https://example.com/images/banner.jpg"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className={`h-10 flex-1 rounded-xl border bg-transparent px-3.5 text-sm outline-none focus:border-ink transition-colors ${
                        formErrors.image_url ? 'border-red-400 focus:border-red-500' : 'border-hairline'
                      }`}
                    />
                  </div>
                  {formErrors.image_url && (
                    <p className="text-[11px] text-red-500 font-semibold">{formErrors.image_url}</p>
                  )}

                  {/* Image Preview Dynamic */}
                  {formData.image_url && (
                    <div className="mt-2.5 rounded-lg border border-hairline bg-canvas/30 overflow-hidden aspect-video relative shadow-inner">
                      <img
                        src={formData.image_url}
                        alt="Xem trước ảnh banner"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                      />
                      <span className="absolute bottom-2 right-2 bg-ink/65 backdrop-blur-xs text-[10px] text-paper font-semibold px-2 py-0.5 rounded-full select-none">
                        Hình ảnh xem trước
                      </span>
                    </div>
                  )}
                </div>

                {/* URL Đích */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                    URL Đích (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="/courses/laravel-rest-api-tu-co-ban-den-trien-khai hoặc đường dẫn ngoài..."
                    value={formData.target_url}
                    onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                    className="h-10 w-full rounded-xl border border-hairline bg-transparent px-3.5 text-sm outline-none focus:border-ink transition-colors"
                  />
                </div>

                {/* Grid Position & Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Vị trí hiển thị *
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="h-10 w-full rounded-xl border border-hairline bg-paper px-3 text-xs outline-none focus:border-ink cursor-pointer"
                    >
                      <option value="home_top">Đầu trang chủ</option>
                      <option value="home_middle">Giữa trang chủ</option>
                      <option value="home_bottom">Cuối trang chủ</option>
                      <option value="sidebar">Thanh bên</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Thứ tự hiển thị (sort_order)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                      className="h-10 w-full rounded-xl border border-hairline bg-transparent px-3.5 text-sm outline-none focus:border-ink transition-colors"
                    />
                  </div>
                </div>

                {/* Grid Start/End date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Lịch bắt đầu
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_at}
                      onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                      className="h-10 w-full rounded-xl border border-hairline bg-paper px-3 text-xs outline-none focus:border-ink transition-colors cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                      Lịch kết thúc
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_at}
                      onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                      className={`h-10 w-full rounded-xl border bg-paper px-3 text-xs outline-none focus:border-ink transition-colors cursor-pointer ${
                        formErrors.end_at ? 'border-red-400 focus:border-red-500' : 'border-hairline'
                      }`}
                    />
                    {formErrors.end_at && (
                      <p className="text-[10px] text-red-500 font-semibold">{formErrors.end_at}</p>
                    )}
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                    Trạng thái kích hoạt *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium">
                      <input
                        type="radio"
                        checked={formData.status === 'active'}
                        onChange={() => setFormData({ ...formData, status: 'active' })}
                        className="h-4 w-4 accent-ink"
                      />
                      Bật (Active)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium">
                      <input
                        type="radio"
                        checked={formData.status === 'inactive'}
                        onChange={() => setFormData({ ...formData, status: 'inactive' })}
                        className="h-4 w-4 accent-ink"
                      />
                      Tắt (Inactive)
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-hairline bg-canvas/10 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-hairline px-5 text-xs font-semibold hover:bg-canvas transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-ink text-paper hover:bg-ink/90 px-5 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsDeleteOpen(false)}
            className="fixed inset-0 bg-ink/30 dark:bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          />
          <div className="relative w-full max-w-md bg-paper border border-hairline rounded-3xl shadow-2xl p-6 overflow-hidden animate-zoom-in">
            <h3 className="text-lg font-bold text-ink">Xác nhận xóa banner?</h3>
            <p className="mt-2 text-xs text-mid-gray leading-relaxed">
              Thao tác này sẽ xóa mềm banner. Bản ghi vẫn sẽ được lưu vết nội bộ nhưng dừng hiển thị ngay lập tức trên toàn bộ các kênh nền tảng của hệ thống.
            </p>

            {bannerToDelete && (
              <div className="mt-4 flex items-center gap-3 p-3 bg-canvas/30 rounded-xl border border-hairline">
                <div className="h-9 w-16 rounded-md bg-canvas border border-hairline overflow-hidden shrink-0">
                  <img
                    src={bannerToDelete.image_url}
                    alt={bannerToDelete.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-ink truncate">{bannerToDelete.title}</p>
                  <p className="text-[10px] text-mid-gray/80 truncate">
                    Vị trí: {positionMap[bannerToDelete.position] || bannerToDelete.position}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-hairline px-4 text-xs font-semibold hover:bg-canvas transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteSubmit}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-red-600 text-white hover:bg-red-700 px-4 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
