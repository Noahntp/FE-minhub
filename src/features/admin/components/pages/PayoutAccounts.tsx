import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search,
  RotateCw,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  User,
  Shield,
  Building2,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import {
  fetchPayoutAccounts,
  fetchPayoutAccountById,
  approvePayoutAccountApi,
  rejectPayoutAccountApi,
  disablePayoutAccountApi
} from '@/assets/js/api/payout-accounts-api';
import AdminPagination from "../shared/AdminPagination";
import FilterSelect from "./FilterSelect";

interface PayoutAccountItem {
  id: number;
  user_id: number;
  provider: string;
  account_name: string;
  account_number_masked: string;
  connected_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  disabled_at: string | null;
  created_at: string;
  updated_at: string;
  status: 'pending_verification' | 'active' | 'rejected' | 'inactive';
  user?: {
    id: number;
    full_name: string;
    email: string;
    avatar?: string;
  };
}

interface SummaryStats {
  total_accounts: number;
  pending_verification_count: number;
  active_count: number;
  rejected_count: number;
  inactive_count: number;
}

export default function PayoutAccounts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // Query parameters state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState('all');
  const [status, setStatus] = useState('all');

  // Handle clicking on stat cards to filter and scroll
  const handleFilterClick = (newStatus: string, label: string) => {
    setStatus(newStatus);
    setPage(1);
    toast.success(`Đã tự động lọc: ${label}`);

    // Smooth scroll down to the list section
    setTimeout(() => {
      const section = document.getElementById('payout-accounts-list-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Data & loading state
  const [accounts, setAccounts] = useState<PayoutAccountItem[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    total_accounts: 0,
    pending_verification_count: 0,
    active_count: 0,
    rejected_count: 0,
    inactive_count: 0,
  });
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState('');

  // Selected account detail drawer state
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Modals state
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch index data
  const loadData = async (scrollToTable = false) => {
    setIsLoading(true);
    try {
      const res = await fetchPayoutAccounts({
        page,
        per_page: perPage,
        search: debouncedSearch,
        provider,
        status,
      });

      if (res.success) {
        setAccounts(res.data.items);
        setSummary(res.data.summary);
        setMeta(res.meta);
        setLastUpdateTime(
          new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );

        if (scrollToTable) {
          document.getElementById('payout-accounts-list-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        toast.error(res.message || 'Lỗi lấy danh sách tài khoản.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger load on state change
  useEffect(() => {
    loadData();
  }, [page, perPage, debouncedSearch, provider, status]);

  // Load detail for drawer
  const loadDetail = async (id: number) => {
    setIsDetailLoading(true);
    try {
      const res = await fetchPayoutAccountById(id);
      if (res.success) {
        setDetail(res.data);
      } else {
        toast.error(res.message || 'Lỗi tải chi tiết tài khoản.');
        closeDrawer();
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể kết nối để lấy thông tin chi tiết.');
      closeDrawer();
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Sync open drawer on mount and on browser Back/Forward (searchParams change)
  useEffect(() => {
    const openId = searchParams.get('open_payout_account_id');
    if (openId) {
      const pid = Number(openId);
      if (pid && selectedAccountId !== pid) {
        setSelectedAccountId(pid);
        loadDetail(pid);
      }
    } else {
      if (selectedAccountId !== null) {
        setSelectedAccountId(null);
        setDetail(null);
      }
    }
  }, [searchParams]);

  const openPayoutDrawer = (id: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('open_payout_account_id', String(id));
    setSearchParams(nextParams);
    setSelectedAccountId(id);
    loadDetail(id);
  };

  const closeDrawer = () => {
    setSelectedAccountId(null);
    setDetail(null);
    if (searchParams.has('open_payout_account_id')) {
      navigate(-1);
    }
  };

  // Handle Approve Account Action
  const handleApprove = async () => {
    if (!detail) return;
    try {
      const res = await approvePayoutAccountApi(detail.id);
      if (res.success) {
        toast.success('Duyệt tài khoản nhận tiền thành công.');
        setIsApproveOpen(false);
        loadData();
        loadDetail(detail.id);
        window.dispatchEvent(new CustomEvent('mindhub-admin-task-updated'));
      } else {
        toast.error(res.message || 'Duyệt tài khoản thất bại.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi gửi yêu cầu duyệt.');
    }
  };

  // Handle Reject Account Action
  const handleReject = async () => {
    if (!detail) return;
    try {
      const res = await rejectPayoutAccountApi(detail.id, rejectReason.trim() || null);
      if (res.success) {
        toast.success('Đã từ chối tài khoản nhận tiền.');
        setIsRejectOpen(false);
        setRejectReason('');
        loadData();
        loadDetail(detail.id);
        window.dispatchEvent(new CustomEvent('mindhub-admin-task-updated'));
      } else {
        toast.error(res.message || 'Từ chối tài khoản thất bại.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi gửi yêu cầu từ chối.');
    }
  };

  // Handle Disable Account Action
  const handleDisable = async () => {
    if (!detail) return;
    try {
      const res = await disablePayoutAccountApi(detail.id);
      if (res.success) {
        toast.success('Vô hiệu hóa tài khoản nhận tiền thành công.');
        setIsDisableOpen(false);
        loadData();
        loadDetail(detail.id);
      } else {
        toast.error(res.message || 'Vô hiệu hóa tài khoản thất bại.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi gửi yêu cầu vô hiệu hóa.');
    }
  };

  // Format Helpers
  const formatVND = (value: number | string) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '---';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'GV';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const statusConfig: any = {
    pending_verification: {
      label: 'Chờ xác minh',
      bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-500',
      textClass: 'text-amber-700',
    },
    active: {
      label: 'Đang hoạt động',
      bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500',
      textClass: 'text-emerald-700',
    },
    rejected: {
      label: 'Đã từ chối',
      bgClass: 'bg-rose-50 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-500',
      textClass: 'text-rose-700',
    },
    inactive: {
      label: 'Đã vô hiệu hóa',
      bgClass: 'bg-slate-50 text-slate-600 border-slate-200',
      dotClass: 'bg-slate-400',
      textClass: 'text-slate-600',
    },
  };

  // Helper calculating progress percentage
  const getPercentage = (count: number) => {
    const total = summary.total_accounts || 0;
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  // Reset Filters
  const hasFilters = search.trim() !== '' || provider !== 'all' || status !== 'all';
  const handleResetFilters = () => {
    setSearch('');
    setProvider('all');
    setStatus('all');
    setPage(1);
  };

  return (
    <div className="relative min-h-screen text-ink pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs text-mid-gray font-medium uppercase tracking-wider mb-1">
            <span>DASHBOARD</span>
            <span>&gt;</span>
            <span>KINH DOANH</span>
            <span>&gt;</span>
            <span className="text-ink">TÀI KHOẢN NHẬN TIỀN</span>
          </div>
          <h1 className="text-2xl font-bold text-ink">Tài khoản nhận tiền</h1>
          <p className="text-xs text-mid-gray mt-1">
            Theo dõi, xác minh và quản lý tài khoản nhận tiền của giảng viên.
          </p>
          {lastUpdateTime && (
            <p className="text-[10px] text-mid-gray italic mt-1">
              Cập nhật lần cuối: {lastUpdateTime}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => loadData(false)}
            className="h-9 w-9 flex items-center justify-center rounded-full border border-hairline hover:bg-canvas text-ink shrink-0 transition-colors shadow-sm cursor-pointer"
            aria-label="Làm mới dữ liệu"
          >
            <RotateCw className={`w-4 h-4 transition-transform duration-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mt-6">
        {/* Total Accounts */}
        <div
          onClick={() => handleFilterClick('all', 'Tất cả tài khoản')}
          tabIndex={0}
          role="button"
          aria-label="Tất cả tài khoản"
          className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between hover:border-mid-gray/60 hover:shadow-md transition-all cursor-pointer min-h-[115px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Tổng tài khoản</span>
            <svg className="w-4 h-4 text-ink shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M3 21h18" />
              <path d="M3 10h18" />
              <path d="M5 6h14" />
              <path d="M4 10v11" />
              <path d="M20 10v11" />
            </svg>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl lg:text-2xl font-bold text-ink">{summary.total_accounts}</span>
              <span className="text-xs text-mid-gray">tài khoản</span>
            </div>
            <p className="text-[11px] font-medium text-mid-gray mt-1">
              {summary.inactive_count} tài khoản đã vô hiệu hóa
            </p>
          </div>
        </div>

        {/* Pending Verification */}
        <div
          onClick={() => handleFilterClick('pending_verification', 'Chờ xác minh')}
          tabIndex={0}
          role="button"
          aria-label="Lọc tài khoản chờ xác minh"
          className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all cursor-pointer min-h-[115px] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Chờ xác minh</span>
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl lg:text-2xl font-bold text-amber-600">{summary.pending_verification_count}</span>
              <span className="text-xs font-semibold text-amber-600">{getPercentage(summary.pending_verification_count)}%</span>
            </div>
            <div className="w-full bg-canvas rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${getPercentage(summary.pending_verification_count)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Active Accounts */}
        <div
          onClick={() => handleFilterClick('active', 'Hoạt động')}
          tabIndex={0}
          role="button"
          aria-label="Lọc tài khoản đang hoạt động"
          className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer min-h-[115px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Đang hoạt động</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl lg:text-2xl font-bold text-emerald-600">{summary.active_count}</span>
              <span className="text-xs font-semibold text-emerald-600">{getPercentage(summary.active_count)}%</span>
            </div>
            <div className="w-full bg-canvas rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${getPercentage(summary.active_count)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Rejected Accounts */}
        <div
          onClick={() => handleFilterClick('rejected', 'Đã từ chối')}
          tabIndex={0}
          role="button"
          aria-label="Lọc tài khoản đã từ chối"
          className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between hover:border-rose-400 hover:shadow-md transition-all cursor-pointer min-h-[115px] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">Đã từ chối</span>
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl lg:text-2xl font-bold text-rose-600">{summary.rejected_count}</span>
              <span className="text-xs font-semibold text-rose-600">{getPercentage(summary.rejected_count)}%</span>
            </div>
            <div className="w-full bg-canvas rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${getPercentage(summary.rejected_count)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Inactive Accounts */}
        <div
          onClick={() => handleFilterClick('inactive', 'Vô hiệu hóa')}
          tabIndex={0}
          role="button"
          aria-label="Lọc tài khoản đã vô hiệu hóa"
          className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between hover:border-slate-400 hover:shadow-md transition-all cursor-pointer min-h-[115px] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Đã vô hiệu hóa</span>
            <span className="h-2 w-2 rounded-full bg-slate-400"></span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl lg:text-2xl font-bold text-slate-600">{summary.inactive_count}</span>
              <span className="text-xs font-semibold text-slate-600">{getPercentage(summary.inactive_count)}%</span>
            </div>
            <div className="w-full bg-canvas rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-slate-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${getPercentage(summary.inactive_count)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR SECTION */}
      <div className="rounded-[6px] border border-hairline bg-paper p-3.5 shadow-subtle mt-4">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
            {/* Ô Tìm kiếm */}
            <div className="relative flex-1 min-w-[260px] max-w-[460px]">
              <input
                type="text"
                placeholder="Tên/email GV, ngân hàng, chủ tài khoản, STK..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full h-10 rounded-full border border-hairline bg-canvas pl-9 pr-8 text-xs text-ink placeholder:text-mid-gray/70 focus:border-ink focus:outline-none transition-colors"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mid-gray" />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setPage(1); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mid-gray hover:text-ink p-0.5"
                  aria-label="Xóa từ khóa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Custom Select: Provider */}
            <div className="w-[180px] shrink-0">
              <FilterSelect
                id="select-provider"
                label=""
                value={provider}
                onChange={(val) => { setProvider(val); setPage(1); }}
                placeholder="Tất cả ngân hàng"
                options={[
                  { value: "all", label: "Tất cả ngân hàng" },
                  { value: "bank", label: "Ngân hàng (Bank)" },
                  { value: "momo", label: "Ví MoMo" },
                  { value: "paypal", label: "Cổng PayPal" },
                ]}
              />
            </div>

            {/* Custom Select: Status */}
            <div className="w-[185px] shrink-0">
              <FilterSelect
                id="select-status"
                label=""
                value={status}
                onChange={(val) => { setStatus(val); setPage(1); }}
                placeholder="Tất cả trạng thái"
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "pending_verification", label: "Chờ xác minh", colorClass: "text-amber-600" },
                  { value: "active", label: "Đang hoạt động", colorClass: "text-emerald-600" },
                  { value: "rejected", label: "Đã từ chối", colorClass: "text-rose-600" },
                  { value: "inactive", label: "Đã vô hiệu hóa", colorClass: "text-slate-600" },
                ]}
              />
            </div>

            {/* Nút Đặt lại Filter */}
            <button
              type="button"
              disabled={!hasFilters}
              onClick={handleResetFilters}
              className={`h-10 px-4 flex items-center justify-center rounded-[6px] border text-xs font-medium shrink-0 transition-all ml-auto ${
                hasFilters 
                  ? 'border-hairline bg-canvas text-rose-600 hover:bg-rose-50 hover:border-rose-200 cursor-pointer' 
                  : 'border-hairline bg-canvas text-mid-gray opacity-60 cursor-not-allowed'
              }`}
              title="Đặt lại bộ lọc"
            >
              Đặt lại
            </button>
          </div>
        </form>
      </div>

      {/* TABLE SECTION */}
      <section id="payout-accounts-list-section" className="space-y-3 mt-4">
        <div className="rounded-[6px] border border-hairline bg-paper shadow-subtle overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center min-h-[300px]">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-ink animate-spin" />
                <span className="text-xs font-medium text-mid-gray">Đang tải dữ liệu...</span>
              </div>
            </div>
          )}

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas text-mid-gray border-b border-hairline uppercase tracking-wider select-none">
                <th className="py-3.5 px-6 font-bold w-16">ID</th>
                <th className="py-3.5 px-4 font-bold min-w-[200px]">Giảng viên</th>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">Ngân hàng / Cổng</th>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">Chủ tài khoản</th>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">Số tài khoản</th>
                <th className="py-3.5 px-4 font-bold w-36">Trạng thái</th>
                <th className="py-3.5 px-4 font-bold whitespace-nowrap">Ngày kết nối</th>
                <th className="py-3.5 px-6 font-bold whitespace-nowrap text-right">Cập nhật</th>
              </tr>
            </thead>
            <tbody id="payout-accounts-table-body">
              {!isLoading && accounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-mid-gray font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-sm font-semibold">Không tìm thấy tài khoản nhận tiền phù hợp</p>
                      <p className="text-xs">Vui lòng thay đổi từ khóa hoặc bộ lọc tìm kiếm của bạn.</p>
                      {hasFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-4 px-4 py-2 text-xs font-semibold text-rose-600 border border-rose-300 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                accounts.map((item) => {
                  const conf = statusConfig[item.status] || {
                    label: item.status,
                    dotClass: 'bg-mid-gray',
                    textClass: 'text-mid-gray',
                  };
                  const initials = getInitials(item.user?.full_name);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => openPayoutDrawer(item.id)}
                      className={`border-b border-hairline/80 hover:bg-canvas-alt/30 transition-colors cursor-pointer group ${
                        selectedAccountId === item.id ? 'bg-canvas-alt/50' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="py-4 px-6 font-mono font-medium text-ink">
                        #{item.id}
                      </td>

                      {/* Instructor Profile */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white font-semibold text-xs shadow-sm">
                            {initials}
                          </div>
                          <div className="min-w-0 max-w-[200px]">
                            <span className="font-semibold text-ink group-hover:text-blue-600 truncate block transition-colors">
                              {item.user?.full_name || 'N/A'}
                            </span>
                            <span className="text-[10px] text-mid-gray truncate block">
                              {item.user?.email || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Provider */}
                      <td className="py-4 px-4 font-medium text-ink uppercase">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-ink/35"></span>
                          <span>{item.provider}</span>
                        </span>
                      </td>

                      {/* Account Name */}
                      <td className="py-4 px-4 font-semibold text-ink uppercase tracking-wide">
                        {item.account_name || '---'}
                      </td>

                      {/* Masked Account Number */}
                      <td className="py-4 px-4 font-mono font-bold text-ink tracking-wide">
                        {item.account_number_masked}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-2 text-[11px] font-bold ${conf.textClass}`}>
                          <span className={`h-2 w-2 rounded-full ${conf.dotClass}`}></span>
                          <span>{conf.label}</span>
                        </span>
                      </td>

                      {/* Connected Date */}
                      <td className="py-4 px-4 text-mid-gray">
                        {formatDate(item.connected_at || item.created_at)}
                      </td>

                      {/* Last Updated */}
                      <td className="py-4 px-6 text-mid-gray text-right whitespace-nowrap">
                        {formatDate(item.updated_at || item.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <AdminPagination
          currentPage={page}
          perPage={perPage}
          total={meta.total}
          onPageChange={setPage}
          onPerPageChange={(pp) => {
            setPerPage(pp);
            setPage(1);
          }}
          itemLabel="bản ghi"
        />
      </section>

      {/* RIGHT DETAIL DRAWER */}
      {selectedAccountId && (
        <div className="fixed inset-0 z-40 overflow-hidden" id="drawer-payout-account-detail">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300"
            onClick={closeDrawer}
          ></div>

          {/* Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-lg bg-paper shadow-2xl flex flex-col relative border-l border-hairline">

              {/* Drawer Header */}
              <div className="p-6 border-b border-hairline bg-paper flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-ink" id="drawer-title">
                    Tài khoản nhận tiền #{selectedAccountId}
                  </h2>
                  <div className="mt-1" id="drawer-status-badge">
                    {detail && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig[detail.status]?.bgClass} bg-canvas border border-hairline`}>
                        <span className={`h-2 w-2 rounded-full ${statusConfig[detail.status]?.dotClass}`}></span>
                        <span>{statusConfig[detail.status]?.label}</span>
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-1.5 rounded-lg text-mid-gray hover:text-ink hover:bg-canvas-alt transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isDetailLoading || !detail ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-ink" />
                    <span className="text-xs text-mid-gray">Đang tải chi tiết...</span>
                  </div>
                ) : (
                  <>
                    {/* Giảng viên liên kết */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-mid-gray tracking-wider uppercase">GIẢNG VIÊN LIÊN KẾT</h3>
                      <div className="flex items-center gap-4 p-4 rounded-2xl border border-hairline bg-canvas/30">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white font-bold text-sm">
                          {getInitials(detail.user?.full_name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-ink text-sm block" id="drawer-user-name">
                            {detail.user?.full_name}
                          </span>
                          <span className="text-xs text-mid-gray block mt-0.5" id="drawer-user-email">
                            {detail.user?.email}
                          </span>
                          <span className="text-[10px] text-mid-gray block mt-0.5">
                            ID GV: #{detail.user_id}
                          </span>
                        </div>
                        <a
                          id="drawer-link-user"
                          href={`/admin/users?open_user_id=${detail.user_id}`}
                          className="flex items-center gap-1 text-[11px] font-semibold text-ink bg-paper border border-hairline py-1.5 px-3 rounded-lg hover:bg-canvas-alt hover:text-blue-600 transition-colors"
                        >
                          Hồ sơ <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Chi tiết ngân hàng */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-mid-gray tracking-wider uppercase">THÔNG TIN NGÂN HÀNG / VÍ</h3>
                      <div className="p-5 rounded-2xl border border-hairline space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-mid-gray block mb-1">Ngân hàng / Cổng</span>
                            <span className="font-bold text-ink uppercase" id="drawer-provider">{detail.provider}</span>
                          </div>
                          <div>
                            <span className="text-mid-gray block mb-1">Chủ tài khoản</span>
                            <span className="font-bold text-ink uppercase" id="drawer-account-name">{detail.account_name}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-mid-gray block mb-1">Số tài khoản đầy đủ</span>
                            <span className="font-mono text-sm font-bold text-ink tracking-wider bg-canvas px-3 py-1.5 rounded-lg block border border-hairline" id="drawer-account-number">
                              {detail.account_number}
                            </span>
                          </div>
                          <div>
                            <span className="text-mid-gray block mb-1">Trạng thái</span>
                            <span className="font-semibold text-ink" id="drawer-status-text">
                              {statusConfig[detail.status]?.label}
                            </span>
                          </div>
                          <div>
                            <span className="text-mid-gray block mb-1">Ngày tạo</span>
                            <span className="font-medium text-ink" id="drawer-created-at">{formatDate(detail.created_at)}</span>
                          </div>
                          <div>
                            <span className="text-mid-gray block mb-1">Ngày kết nối</span>
                            <span className="font-medium text-ink" id="drawer-connected-at">{formatDate(detail.connected_at)}</span>
                          </div>
                          <div>
                            <span className="text-mid-gray block mb-1">Cập nhật gần nhất</span>
                            <span className="font-medium text-ink" id="drawer-updated-at">{formatDate(detail.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Thống kê giao dịch */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-mid-gray tracking-wider uppercase">THỐNG KÊ GIAO DỊCH</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-hairline bg-canvas/20">
                          <span className="text-[10px] text-mid-gray font-bold tracking-wider block">YÊU CẦU RÚT TIỀN</span>
                          <span className="text-2xl font-black mt-1.5 block" id="drawer-stat-withdrawal-count">
                            {detail.withdrawal_count}
                          </span>
                        </div>
                        <div className="p-4 rounded-xl border border-hairline bg-canvas/20">
                          <span className="text-[10px] text-mid-gray font-bold tracking-wider block">ĐÃ THANH TOÁN</span>
                          <span className="text-xl font-bold mt-2 block text-emerald-700" id="drawer-stat-total-paid">
                            {formatVND(detail.total_paid_amount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Yêu cầu rút tiền gần nhất */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-mid-gray tracking-wider uppercase">YÊU CẦU RÚT TIỀN GẦN ĐÂY</h3>
                      <div className="space-y-2.5" id="drawer-withdrawals-list">
                        {!detail.related_withdrawals || detail.related_withdrawals.length === 0 ? (
                          <p className="text-xs text-mid-gray italic py-2 text-center">
                            Chưa có yêu cầu rút tiền nào sử dụng tài khoản này.
                          </p>
                        ) : (
                          detail.related_withdrawals.map((w: any) => (
                            <div key={w.id} className="flex items-center justify-between p-3 rounded-xl border border-hairline bg-canvas/30 hover:bg-canvas/50 transition-colors text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-ink">
                                  {w.withdrawal_code}
                                </span>
                                <span className="text-[10px] text-mid-gray">{formatDate(w.requested_at)}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-ink">{formatVND(w.amount)}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  w.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {w.status}
                                </span>
                                <button
                                  onClick={() => navigate(`/admin/withdrawals?open_withdrawal_id=${w.id}`)}
                                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                >
                                  Xem chi tiết &rarr;
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Nhật ký trạng thái (Timeline) */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-mid-gray tracking-wider uppercase">NHẬT KÝ HOẠT ĐỘNG (TIMELINE)</h3>
                      <div className="relative border-l border-hairline/80 ml-2.5 pl-6 space-y-6 text-xs" id="drawer-timeline">
                        {!detail.timeline || detail.timeline.length === 0 ? (
                          <p className="text-xs text-mid-gray italic py-2">Chưa có nhật ký ghi nhận.</p>
                        ) : (
                          detail.timeline.map((t: any, idx: number) => (
                            <div key={idx} className="relative">
                              {/* Indicator dot */}
                              <span className={`absolute -left-[31px] top-0 h-3.5 w-3.5 rounded-full border-4 border-paper ${
                                t.status === 'success' ? 'bg-emerald-500' :
                                t.status === 'error' ? 'bg-rose-500' :
                                t.status === 'warning' ? 'bg-slate-400' : 'bg-blue-500'
                              } z-10`} />

                              <div>
                                <span className="text-[10px] text-mid-gray block font-semibold">{formatDate(t.timestamp)}</span>
                                <h4 className="font-bold text-ink mt-0.5">{t.title}</h4>
                                <p className="text-mid-gray mt-1 text-[11px] leading-relaxed">{t.description}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Drawer Footer Actions */}
              {detail && (detail.status === 'pending_verification' || detail.status === 'active') && (
                <div className="p-6 border-t border-hairline bg-paper flex items-center justify-end gap-3 z-10">
                  {detail.status === 'pending_verification' && (
                    <>
                      <button
                        onClick={() => setIsRejectOpen(true)}
                        className="px-5 py-2.5 text-xs font-bold rounded-xl border border-rose-300 text-rose-600 bg-rose-50/20 hover:bg-rose-50 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => setIsApproveOpen(true)}
                        className="px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-ink hover:bg-ink/90 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                      >
                        Phê duyệt
                      </button>
                    </>
                  )}
                  {detail.status === 'active' && (
                    <button
                      onClick={() => setIsDisableOpen(true)}
                      className="px-5 py-2.5 text-xs font-bold rounded-xl border-none text-white bg-danger-brick hover:bg-danger-brick/90 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Vô hiệu hóa tài khoản
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: APPROVE ACCOUNT CONFIRMATION */}
      {isApproveOpen && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]" onClick={() => setIsApproveOpen(false)}></div>
          <div className="bg-paper rounded-3xl border border-hairline shadow-2xl max-w-md w-full p-6 relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-lg font-bold text-ink">Xác nhận duyệt tài khoản</h3>
            </div>

            <p className="text-xs text-mid-gray">
              Kiểm chứng thông tin tài khoản nhận tiền sau đây:
            </p>

            <div className="bg-canvas p-4 rounded-2xl border border-hairline space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-mid-gray">Giảng viên:</span>
                <span className="font-semibold text-ink">{detail.user?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mid-gray">Ngân hàng/Ví:</span>
                <span className="font-bold text-ink uppercase">{detail.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mid-gray">Chủ tài khoản:</span>
                <span className="font-semibold text-ink uppercase">{detail.account_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mid-gray">Số tài khoản:</span>
                <span className="font-mono font-bold text-ink">{detail.account_number_masked}</span>
              </div>
            </div>

            <p className="text-xs text-mid-gray leading-relaxed">
              Sau khi duyệt, trạng thái tài khoản sẽ chuyển sang <strong className="text-emerald-700 font-semibold">Đang hoạt động</strong>. Giảng viên có thể chọn tài khoản này cho các yêu cầu rút tiền.
            </p>

            <div className="flex items-center justify-end gap-3.5 mt-2">
              <button
                onClick={() => setIsApproveOpen(false)}
                className="px-4.5 py-2 text-xs font-semibold rounded-lg border border-hairline hover:bg-canvas-alt active:scale-[0.98] transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleApprove}
                className="px-4.5 py-2 text-xs font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer"
              >
                Xác nhận duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REJECT ACCOUNT CONFIRMATION */}
      {isRejectOpen && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]" onClick={() => setIsRejectOpen(false)}></div>
          <div className="bg-paper rounded-3xl border border-hairline shadow-2xl max-w-md w-full p-6 relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-rose-700">
              <XCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-ink">Xác nhận từ chối tài khoản</h3>
            </div>

            <p className="text-xs text-mid-gray">
              Từ chối tài khoản chờ xác minh của giảng viên: <strong>{detail.user?.full_name}</strong>
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-mid-gray uppercase tracking-wider">
                Lý do từ chối <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                placeholder="Nhập lý do từ chối thông tin tài khoản (ví dụ: Tên chủ tài khoản không trùng khớp)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                maxLength={1000}
                rows={4}
                className="w-full p-3 text-xs rounded-xl border border-hairline bg-paper focus:outline-none focus:ring-1 focus:ring-ink"
              />
              <div className="text-[10px] text-mid-gray text-right">
                {rejectReason.length}/1000 ký tự
              </div>
            </div>

            <p className="text-xs text-mid-gray leading-relaxed">
              Sau khi từ chối, tài khoản sẽ chuyển sang trạng thái <strong className="text-rose-700 font-semibold">Đã từ giảng viên/từ chối</strong> và không thể dùng để nhận tiền.
            </p>

            <div className="flex items-center justify-end gap-3.5 mt-2">
              <button
                onClick={() => setIsRejectOpen(false)}
                className="px-4.5 py-2 text-xs font-semibold rounded-lg border border-hairline hover:bg-canvas-alt active:scale-[0.98] transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                disabled={!rejectReason.trim()}
                onClick={handleReject}
                className={`px-4.5 py-2 text-xs font-bold rounded-lg text-white transition-all active:scale-[0.98] ${
                  rejectReason.trim()
                    ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer'
                    : 'bg-rose-600/50 cursor-not-allowed'
                }`}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DISABLE ACCOUNT CONFIRMATION */}
      {isDisableOpen && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]" onClick={() => setIsDisableOpen(false)}></div>
          <div className="bg-paper rounded-3xl border border-hairline shadow-2xl max-w-md w-full p-6 relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-ink">Xác nhận vô hiệu hóa</h3>
            </div>

            <p className="text-xs text-mid-gray">
              Tạm ngưng tài khoản đang hoạt động của giảng viên: <strong>{detail.user?.full_name}</strong>
            </p>

            <div className="bg-canvas p-4 rounded-2xl border border-hairline space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-mid-gray">Tài khoản:</span>
                <span className="font-bold text-ink uppercase">
                  {detail.provider} - {detail.account_number_masked}
                </span>
              </div>
            </div>

            <p className="text-xs text-mid-gray leading-relaxed">
              Sau khi vô hiệu hóa, tài khoản chuyển sang trạng thái <strong className="text-slate-700 font-semibold">Đã vô hiệu hóa</strong>. Giảng viên sẽ không thể chọn tài khoản này cho các yêu cầu rút tiền mới. Lịch sử giao dịch cũ vẫn được giữ nguyên.
            </p>

            <div className="flex items-center justify-end gap-3.5 mt-2">
              <button
                onClick={() => setIsDisableOpen(false)}
                className="px-4.5 py-2 text-xs font-semibold rounded-lg border border-hairline hover:bg-canvas-alt active:scale-[0.98] transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleDisable}
                className="px-4.5 py-2 text-xs font-bold rounded-lg text-white bg-slate-700 hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
              >
                Xác nhận vô hiệu hóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
