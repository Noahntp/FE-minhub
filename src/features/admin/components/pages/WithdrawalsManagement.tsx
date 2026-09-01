import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  RotateCw,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import AdminPagination from "../shared/AdminPagination";
import FilterSelect from "./FilterSelect";
import {
  fetchWithdrawals,
  fetchWithdrawalById,
  approveWithdrawalApi,
  rejectWithdrawalApi,
  markPaidWithdrawalApi,
} from "@/assets/js/api/withdrawals-api";

interface SummaryKPIs {
  total_requests: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  paid_count: number;
  pending_amount: number;
  approved_amount: number;
  rejected_amount: number;
  paid_amount: number;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

function maskAccountNumber(accountNumber: string | undefined): string {
  if (!accountNumber) return "---";
  const str = String(accountNumber);
  if (str.length <= 4) return str;
  return "**** **** " + str.slice(-4);
}

const STATUS_MAP: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  pending: {
    label: "Chờ chi",
    color: "text-amber-700 bg-paper border-hairline",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Đang xử lý",
    color: "text-blue-700 bg-paper border-hairline",
    dot: "bg-blue-500",
  },
  rejected: {
    label: "Đã từ chối",
    color: "text-mid-gray bg-paper border-hairline",
    dot: "bg-mid-gray",
  },
  paid: {
    label: "Thành công",
    color: "text-emerald-700 bg-paper border-hairline",
    dot: "bg-emerald-500",
  },
  failed: {
    label: "Thất bại",
    color: "text-rose-700 bg-paper border-hairline",
    dot: "bg-rose-500",
  },
  cancelled: {
    label: "Đã hủy",
    color: "text-rose-700 bg-paper border-hairline",
    dot: "bg-rose-500",
  },
};

export default function WithdrawalsManagement() {
  const navigate = useNavigate();
  // --- States ---
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<SummaryKPIs>({
    total_requests: 0,
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
    paid_count: 0,
    pending_amount: 0,
    approved_amount: 0,
    rejected_amount: 0,
    paid_amount: 0,
  });
  const [meta, setMeta] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync filter state với URL query params
  const [searchParams, setSearchParams] = useSearchParams();

  // Table Filters state — khởi tạo từ URL nếu có
  const [page, setPageState] = useState(() => {
    const p = Number(searchParams.get("page"));
    return p > 0 ? p : 1;
  });
  const [perPage, setPerPage] = useState(20);
  const [status, setStatusState] = useState(() => {
    return searchParams.get("status") || "all";
  });
  const [timePreset, setTimePreset] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [sortBy, setSortBy] = useState("requested_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("desc");

  // Wrapper để sync status lên URL
  const setStatus = (newStatus: string) => {
    setStatusState(newStatus);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newStatus === "all") {
          next.delete("status");
        } else {
          next.set("status", newStatus);
        }
        next.delete("page"); // reset về trang 1
        return next;
      },
      { replace: true },
    );
  };

  const setPage = (newPage: number | ((prev: number) => number)) => {
    const resolved = typeof newPage === "function" ? newPage(page) : newPage;
    setPageState(resolved);
    setSearchParams(
      (sp) => {
        const next = new URLSearchParams(sp);
        if (resolved <= 1) {
          next.delete("page");
        } else {
          next.set("page", String(resolved));
        }
        return next;
      },
      { replace: true },
    );
  };

  // Search state with debouncing
  const [tempSearch, setTempSearch] = useState("");
  const [search, setSearch] = useState("");

  // Drawer state
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<
    number | null
  >(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modal States
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);

  // Modal Inputs
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [markPaidTxnId, setMarkPaidTxnId] = useState("");
  const [markPaidError, setMarkPaidError] = useState("");

  // Ref for table wrapper scroll behavior
  const tableSectionRef = useRef<HTMLDivElement>(null);

  // --- Debounce Search Input ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(tempSearch.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [tempSearch]);

  // --- Load Data ---
  const loadData = async (autoScroll = false) => {
    setLoading(true);
    try {
      const res = await fetchWithdrawals({
        page,
        per_page: perPage,
        search,
        status,
        time_preset: timePreset,
        date_from: dateFrom,
        date_to: dateTo,
        amount_min: amountMin,
        amount_max: amountMax,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (res.success) {
        setItems(res.data.items);
        setSummary(res.data.summary);
        setMeta(res.meta);
      } else {
        toast.error(res.message || "Không thể tải danh sách yêu cầu.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Lỗi kết nối dữ liệu.");
    } finally {
      setLoading(false);
      if (autoScroll && tableSectionRef.current) {
        tableSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  useEffect(() => {
    loadData(searchParams.has("status"));
  }, [
    page,
    perPage,
    search,
    status,
    timePreset,
    dateFrom,
    dateTo,
    amountMin,
    amountMax,
    sortBy,
    sortOrder,
  ]);

  // --- Detail Drawer Loading ---
  const loadDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await fetchWithdrawalById(id);
      if (res.success) {
        setDetail(res.data);
      } else {
        toast.error(res.message || "Không thể tải chi tiết yêu cầu.");
        closeDrawer();
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi kết nối chi tiết.");
      closeDrawer();
    } finally {
      setDetailLoading(false);
    }
  };

  // Sync open drawer on mount and on browser Back/Forward (searchParams change)
  useEffect(() => {
    const openId = searchParams.get('open_withdrawal_id');
    if (openId) {
      const wid = Number(openId);
      if (wid && selectedWithdrawalId !== wid) {
        setSelectedWithdrawalId(wid);
        loadDetail(wid);
      }
    } else {
      if (selectedWithdrawalId !== null) {
        setSelectedWithdrawalId(null);
        setDetail(null);
      }
    }
  }, [searchParams]);

  const openWithdrawalDrawer = (id: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('open_withdrawal_id', String(id));
    setSearchParams(nextParams);
    setSelectedWithdrawalId(id);
    loadDetail(id);
  };

  const closeDrawer = () => {
    setSelectedWithdrawalId(null);
    setDetail(null);
    if (searchParams.has('open_withdrawal_id')) {
      navigate(-1);
    }
  };

  // --- Actions handlers ---
  const handleApprove = async () => {
    if (!activeItem || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await approveWithdrawalApi(activeItem.id);
      if (res.success) {
        toast.success("Phê duyệt yêu cầu rút tiền thành công.");
        setApproveOpen(false);
        loadData();
        if (selectedWithdrawalId === activeItem.id) {
          loadDetail(activeItem.id);
        }
      } else {
        toast.error(res.message || "Duyệt thất bại.");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống khi duyệt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!activeItem || isSubmitting) return;
    if (!rejectReason.trim()) {
      setRejectError("Vui lòng nhập lý do từ chối.");
      return;
    }
    setRejectError("");
    setIsSubmitting(true);
    try {
      const res = await rejectWithdrawalApi(activeItem.id, rejectReason.trim());
      if (res.success) {
        toast.success("Từ chối yêu cầu rút tiền thành công.");
        setRejectOpen(false);
        loadData();
        if (selectedWithdrawalId === activeItem.id) {
          loadDetail(activeItem.id);
        }
      } else {
        toast.error(res.message || "Từ chối thất bại.");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống khi từ chối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!activeItem || isSubmitting) return;
    if (!markPaidTxnId.trim()) {
      setMarkPaidError("Vui lòng nhập mã giao dịch.");
      return;
    }
    setMarkPaidError("");
    setIsSubmitting(true);
    try {
      const res = await markPaidWithdrawalApi(
        activeItem.id,
        markPaidTxnId.trim(),
      );
      if (res.success) {
        toast.success("Hoàn tất thanh toán thành công.");
        setMarkPaidOpen(false);
        loadData();
        if (selectedWithdrawalId === activeItem.id) {
          loadDetail(activeItem.id);
        }
      } else {
        toast.error(res.message || "Hoàn tất thất bại.");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống khi hoàn tất.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Reset Filter logic ---
  const handleResetFilters = () => {
    setTempSearch("");
    setSearch("");
    setStatus("all");
    setTimePreset("all");
    setDateFrom("");
    setDateTo("");
    setAmountMin("");
    setAmountMax("");
    setPage(1);
    toast.info("Đã đặt lại toàn bộ bộ lọc.");
  };

  const isFilterActive =
    search !== "" ||
    status !== "all" ||
    timePreset !== "all" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    amountMin !== "" ||
    amountMax !== "";

  // --- Helpers ---
  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "---";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "---";
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getInitials = (name: string) => {
    if (!name) return "GV";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) =>
        prev === "desc" ? "asc" : prev === "asc" ? "none" : "desc",
      );
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field || sortOrder === "none")
      return (
        <ArrowUpDown className="w-3.5 h-3.5 ml-1 inline text-mid-gray/50" />
      );
    return sortOrder === "asc" ? (
      <ChevronDown className="w-3.5 h-3.5 ml-1 inline text-ink rotate-180 transition-transform" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 ml-1 inline text-ink transition-transform" />
    );
  };

  // Calculate totals
  const totalMoney =
    Number(summary.pending_amount) +
    Number(summary.approved_amount) +
    Number(summary.paid_amount) +
    Number(summary.rejected_amount);

  return (
    <div className="space-y-4 max-w-[1536px] w-full mx-auto pb-6 relative select-none">
      {/* Header and Refresh */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <nav className="flex items-center gap-1.5 text-[10px] text-mid-gray uppercase tracking-wider mb-1 font-semibold">
            <span>Dashboard</span>
            <ChevronRight className="w-2.5 h-2.5" />
            <span>Kinh doanh</span>
            <ChevronRight className="w-2.5 h-2.5" />
            <span className="text-ink">Yêu cầu rút tiền</span>
          </nav>
          <h1 className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-tight">
            Yêu cầu rút tiền
          </h1>
          <p className="text-xs text-mid-gray mt-0.5">
            Theo dõi, xét duyệt và hoàn tất các yêu cầu rút tiền của giảng viên.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => {
              loadData();
              toast.info("Đã cập nhật dữ liệu mới nhất.");
            }}
            className="h-9 w-9 flex items-center justify-center rounded-full border border-hairline hover:bg-canvas text-ink shrink-0 transition-colors shadow-sm cursor-pointer"
            aria-label="Làm mới dữ liệu"
          >
            <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Card 1: Tổng */}
        <div
          onClick={() => {
            setStatus("all");
            setPageState(1);
            setTimeout(
              () =>
                tableSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                }),
              50,
            );
          }}
          className={`rounded-[6px] border bg-paper p-4 shadow-subtle flex flex-col justify-between hover:border-mid-gray/60 hover:shadow-md transition-all cursor-pointer min-h-[115px] ${
            status === "all" ? "ring-2 ring-ink border-ink" : "border-hairline"
          }`}
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Tổng yêu cầu
            </span>
            <Wallet className="w-4 h-4 text-ink shrink-0" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl lg:text-2xl font-bold text-ink">
                {summary.total_requests}
              </span>
              <span className="text-xs text-mid-gray">yêu cầu</span>
            </div>
            <span className="text-xs font-bold text-ink block mt-0.5">
              {formatVND(totalMoney)} tổng giá trị
            </span>
            <p className="text-[11px] font-medium text-rose-600 mt-1">
              {summary.rejected_count} yêu cầu bị từ chối
            </p>
          </div>
        </div>

        {/* Card 2: Chờ chi */}
        <div
          onClick={() => {
            setStatus("pending");
            setPageState(1);
            setTimeout(
              () =>
                tableSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                }),
              50,
            );
          }}
          className={`rounded-[6px] border bg-paper p-4 shadow-subtle flex flex-col justify-between hover:border-mid-gray/60 hover:shadow-md transition-all cursor-pointer min-h-[115px] ${
            status === "pending"
              ? "ring-2 ring-amber-500 border-amber-500 bg-amber-50/10"
              : "border-hairline"
          }`}
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
              Chờ chi
            </span>
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl lg:text-2xl font-bold text-amber-600">
                {summary.pending_count}
              </span>
              <span className="text-xs text-mid-gray">yêu cầu</span>
            </div>
            <p className="text-[11px] font-bold text-ink mt-0.5">
              {formatVND(summary.pending_amount)}
            </p>
            <div className="w-full bg-canvas h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{
                  width: `${summary.total_requests > 0 ? (summary.pending_count / summary.total_requests) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-mid-gray mt-1 font-medium">
              {summary.total_requests > 0
                ? Math.round(
                    (summary.pending_count / summary.total_requests) * 100,
                  )
                : 0}
              % tổng yêu cầu
            </p>
          </div>
        </div>

        {/* Card 3: Đang xử lý */}
        <div
          onClick={() => {
            setStatus("approved");
            setPageState(1);
            setTimeout(
              () =>
                tableSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                }),
              50,
            );
          }}
          className={`rounded-[6px] border bg-paper p-4 shadow-subtle flex flex-col justify-between hover:border-mid-gray/60 hover:shadow-md transition-all cursor-pointer min-h-[115px] ${
            status === "approved"
              ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50/10"
              : "border-hairline"
          }`}
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
              Đang xử lý
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl lg:text-2xl font-bold text-blue-600">
                {summary.approved_count}
              </span>
              <span className="text-xs text-mid-gray">yêu cầu</span>
            </div>
            <p className="text-[11px] font-bold text-ink mt-0.5">
              {formatVND(summary.approved_amount)}
            </p>
            <div className="w-full bg-canvas h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{
                  width: `${summary.total_requests > 0 ? (summary.approved_count / summary.total_requests) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-mid-gray mt-1 font-medium">
              {summary.total_requests > 0
                ? Math.round(
                    (summary.approved_count / summary.total_requests) * 100,
                  )
                : 0}
              % tổng yêu cầu
            </p>
          </div>
        </div>

        {/* Card 4: Thành công */}
        <div
          onClick={() => {
            setStatus("paid");
            setPageState(1);
            setTimeout(
              () =>
                tableSectionRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                }),
              50,
            );
          }}
          className={`rounded-[6px] border bg-paper p-4 shadow-subtle flex flex-col justify-between hover:border-mid-gray/60 hover:shadow-md transition-all cursor-pointer min-h-[115px] ${
            status === "paid"
              ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/10"
              : "border-hairline"
          }`}
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              Thành công
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl lg:text-2xl font-bold text-emerald-600">
                {summary.paid_count}
              </span>
              <span className="text-xs text-mid-gray">yêu cầu</span>
            </div>
            <p className="text-[11px] font-bold text-emerald-600 mt-0.5">
              {formatVND(summary.paid_amount)}
            </p>
            <div className="w-full bg-canvas h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${summary.total_requests > 0 ? (summary.paid_count / summary.total_requests) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-mid-gray mt-1 font-medium">
              {summary.total_requests > 0
                ? Math.round(
                    (summary.paid_count / summary.total_requests) * 100,
                  )
                : 0}
              % tổng yêu cầu
            </p>
          </div>
        </div>
      </div>

      {/* KPI Details Bar */}
      <div className="rounded-[6px] border border-hairline bg-surface-alt p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="text-xs text-mid-gray">
            <span className="font-medium text-ink">Bị từ chối:</span>{" "}
            <span className="font-bold text-rose-600">
              {summary.rejected_count}
            </span>{" "}
            yêu cầu
          </div>
          <div className="w-px h-3 bg-hairline"></div>
          <div className="text-xs text-mid-gray">
            <span className="font-medium text-ink">Tổng tiền bị từ chối:</span>{" "}
            <span className="font-bold text-ink">
              {formatVND(summary.rejected_amount)}
            </span>
          </div>
        </div>
        <div className="text-[11px] text-mid-gray/80 italic">
          Thống kê dựa theo điều kiện thời gian và số tiền hiện tại.
        </div>
      </div>

      {/* Filters and Table Section */}
      <section
        ref={tableSectionRef}
        className="rounded-[6px] border border-hairline bg-paper shadow-subtle space-y-3 p-3.5 lg:p-4 scroll-mt-20"
      >
        {/* Filters Form */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(340px,460px)_minmax(160px,190px)_minmax(160px,190px)_minmax(250px,290px)_auto] gap-3 items-end">
            {/* Search input */}
            <div className="min-w-0">
              <label
                htmlFor="filter-search"
                className="block text-[10px] font-semibold uppercase tracking-wider text-mid-gray mb-1"
              >
                Tìm kiếm
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="filter-search"
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  placeholder="Mã WD, tên/email GV, số tài khoản..."
                  autoComplete="off"
                  className="w-full h-9 pl-8 pr-8 text-xs bg-canvas border border-hairline rounded-[6px] focus:outline-none focus:border-ink transition-colors placeholder:text-mid-gray/60"
                />
                <Search className="w-3.5 h-3.5 text-mid-gray/80 absolute left-2.5 top-1/2 -translate-y-1/2" />
                {tempSearch && (
                  <button
                    type="button"
                    onClick={() => setTempSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mid-gray hover:text-ink cursor-pointer p-0.5"
                    aria-label="Xóa từ khóa"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Select */}
            <div className="min-w-0">
              <FilterSelect
                id="filter-status"
                label="Trạng thái"
                value={status}
                onChange={(val) => {
                  setStatus(val);
                  setPage(1);
                }}
                placeholder="Tất cả trạng thái"
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "pending", label: "Chờ chi (Pending)" },
                  { value: "approved", label: "Đang xử lý (Approved)" },
                  { value: "rejected", label: "Đã từ chối (Rejected)" },
                  { value: "paid", label: "Thành công (Paid)" },
                  { value: "cancelled", label: "Đã hủy (Cancelled)" },
                  { value: "failed", label: "Thất bại (Failed)" },
                ]}
              />
            </div>

            {/* Time Preset */}
            <div className="min-w-0">
              <FilterSelect
                id="filter-time-preset"
                label="Thời gian"
                value={timePreset}
                onChange={(val) => {
                  setTimePreset(val);
                  if (val !== "custom") {
                    setDateFrom("");
                    setDateTo("");
                  }
                  setPage(1);
                }}
                placeholder="Tất cả thời gian"
                options={[
                  { value: "all", label: "Tất cả thời gian" },
                  { value: "today", label: "Hôm nay" },
                  { value: "last_7_days", label: "7 ngày gần nhất" },
                  { value: "last_30_days", label: "1 tháng gần nhất" },
                  { value: "last_3_months", label: "3 tháng gần nhất" },
                  { value: "custom", label: "Tùy chọn ngày" },
                ]}
              />
            </div>

            {/* Amount Range */}
            <div className="min-w-0">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-mid-gray mb-1">
                Khoảng tiền
              </label>
              <div className="flex items-center gap-1.5 h-9">
                <input
                  type="number"
                  min="0"
                  placeholder="Từ"
                  value={amountMin}
                  onChange={(e) => {
                    setAmountMin(e.target.value.replace(/\D/g, ''));
                    setPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full h-9 px-2.5 text-xs bg-canvas border border-hairline rounded-[6px] focus:outline-none focus:border-ink text-ink font-mono"
                />
                <span className="text-mid-gray text-xs font-medium">-</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Đến"
                  value={amountMax}
                  onChange={(e) => {
                    setAmountMax(e.target.value.replace(/\D/g, ''));
                    setPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full h-9 px-2.5 text-xs bg-canvas border border-hairline rounded-[6px] focus:outline-none focus:border-ink text-ink font-mono"
                />
              </div>
            </div>

            {/* Reset Filters button */}
            <div className="min-w-0 flex justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                disabled={!isFilterActive}
                title="Xóa bộ lọc"
                className={`h-9 w-9 rounded-[6px] border flex items-center justify-center shrink-0 transition-all ${
                  isFilterActive
                    ? "text-rose-600 hover:text-rose-700 bg-paper hover:bg-rose-50 border-rose-200 shadow-sm cursor-pointer"
                    : "opacity-40 text-mid-gray/40 pointer-events-none cursor-not-allowed bg-canvas border-hairline"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Custom Date Inputs */}
          {timePreset === "custom" && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-hairline/60">
              <div className="flex items-center gap-1.5 min-w-[130px]">
                <span className="text-[10px] font-semibold text-mid-gray">
                  Từ:
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-8 px-2 text-xs bg-canvas border border-hairline rounded-[6px] focus:outline-none focus:border-ink text-ink font-mono"
                />
              </div>
              <div className="flex items-center gap-1.5 min-w-[130px]">
                <span className="text-[10px] font-semibold text-mid-gray">
                  Đến:
                </span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-8 px-2 text-xs bg-canvas border border-hairline rounded-[6px] focus:outline-none focus:border-ink text-ink font-mono"
                />
              </div>
            </div>
          )}
        </form>

        {/* Active Filter Chips */}
        {isFilterActive && (
          <div className="py-1 flex flex-wrap gap-1.5 items-center text-xs">
            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-canvas border border-hairline text-ink font-medium">
                <span>Từ khóa: "{search}"</span>
                <button
                  type="button"
                  onClick={() => setTempSearch("")}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {status !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-canvas border border-hairline text-ink font-medium">
                <span>Trạng thái: {STATUS_MAP[status]?.label || status}</span>
                <button
                  type="button"
                  onClick={() => setStatus("all")}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {timePreset !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-canvas border border-hairline text-ink font-medium">
                <span>
                  Thời gian:{" "}
                  {timePreset === "custom"
                    ? `Từ ${dateFrom || "..."} đến ${dateTo || "..."}`
                    : timePreset === "today"
                      ? "Hôm nay"
                      : timePreset === "last_7_days"
                        ? "7 ngày gần nhất"
                        : timePreset === "last_30_days"
                          ? "1 tháng gần nhất"
                          : "3 tháng gần nhất"}
                </span>
                <button
                  type="button"
                  onClick={() => setTimePreset("all")}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(amountMin || amountMax) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-canvas border border-hairline text-ink font-medium">
                <span>
                  Số tiền: {amountMin ? formatVND(Number(amountMin)) : "0đ"} -{" "}
                  {amountMax ? formatVND(Number(amountMax)) : "Vô hạn"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAmountMin("");
                    setAmountMax("");
                  }}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[320px] relative border border-hairline rounded-[6px]">
          <table className="w-full text-left border-collapse min-w-[1000px] text-xs">
            <thead className="bg-surface-alt/70 sticky top-0 z-10 border-b border-hairline">
              <tr>
                <th
                  onClick={() => toggleSort("withdrawal_code")}
                  className="py-3 px-3 font-bold uppercase tracking-wider text-mid-gray cursor-pointer hover:bg-canvas/50"
                >
                  Mã yêu cầu {renderSortIcon("withdrawal_code")}
                </th>
                <th
                  onClick={() => toggleSort("user_name")}
                  className="py-3 px-3 font-bold uppercase tracking-wider text-mid-gray cursor-pointer hover:bg-canvas/50"
                >
                  Giảng viên {renderSortIcon("user_name")}
                </th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-mid-gray">
                  Tài khoản nhận tiền
                </th>
                <th
                  onClick={() => toggleSort("amount")}
                  className="py-3 px-3 font-bold uppercase tracking-wider text-mid-gray text-center cursor-pointer hover:bg-canvas/50"
                >
                  Số tiền {renderSortIcon("amount")}
                </th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-mid-gray">
                  Trạng thái
                </th>
                <th
                  onClick={() => toggleSort("requested_at")}
                  className="py-3 px-3 font-bold uppercase tracking-wider text-mid-gray cursor-pointer hover:bg-canvas/50"
                >
                  Ngày gửi {renderSortIcon("requested_at")}
                </th>
                <th
                  onClick={() => toggleSort("last_updated_at")}
                  className="py-3 px-3 font-bold uppercase tracking-wider text-mid-gray cursor-pointer hover:bg-canvas/50"
                >
                  Cập nhật gần nhất {renderSortIcon("last_updated_at")}
                </th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-mid-gray text-center w-[90px]">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-hairline bg-paper">
              {loading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-3">
                      <div className="h-4 bg-canvas rounded w-20"></div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-4 bg-canvas rounded w-36"></div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-4 bg-canvas rounded w-44"></div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-4 bg-canvas rounded w-24 mx-auto"></div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-4 bg-canvas rounded w-20"></div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-4 bg-canvas rounded w-28"></div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-4 bg-canvas rounded w-28"></div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="h-4 bg-canvas rounded w-12 mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : items.length > 0 ? (
                items.map((item) => {
                  const badge = STATUS_MAP[item.status] || {
                    label: item.status,
                    color: "text-mid-gray bg-canvas border-hairline",
                    dot: "bg-mid-gray",
                  };
                  const initials = getInitials(item.user?.full_name);
                  const lastUpdate =
                    item.paid_at ||
                    item.approved_at ||
                    item.rejected_at ||
                    item.requested_at;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => openWithdrawalDrawer(item.id)}
                      className="hover:bg-canvas/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-3 font-mono font-bold text-ink whitespace-nowrap">
                        {item.withdrawal_code}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-ink/10 text-ink font-semibold text-[10px] flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span
                              className="font-semibold text-ink truncate max-w-[150px]"
                              title={item.user?.full_name}
                            >
                              {item.user?.full_name}
                            </span>
                            <span
                              className="text-[10px] text-mid-gray truncate max-w-[170px]"
                              title={item.user?.email}
                            >
                              {item.user?.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-ink truncate max-w-[180px]">
                            {item.payout_snapshot?.provider || "---"}
                          </span>
                          <span className="font-mono text-xs text-ink truncate max-w-[180px]">
                            {maskAccountNumber(item.payout_snapshot?.account_number || item.payout_snapshot?.account_number_masked)}
                          </span>
                          <span className="text-[10px] uppercase font-medium text-mid-gray truncate max-w-[180px]">
                            {item.payout_snapshot?.account_name || "---"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-[6px] border border-hairline bg-paper text-[11px] font-bold text-ink tabular-nums">
                          {formatVND(item.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5 items-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${badge.color}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${badge.dot} shrink-0`}
                            />
                            <span>{badge.label}</span>
                          </span>
                          {item.payout_mode === 'auto' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-hairline bg-paper text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                              AUTO
                            </span>
                          )}
                          {item.payout_mode === 'manual' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-hairline bg-paper text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                              MANUAL
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-[6px] border border-hairline bg-paper text-[11px] font-medium text-mid-gray">
                          {formatDate(item.requested_at)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-[6px] border border-hairline bg-paper text-[11px] font-medium text-mid-gray">
                          {formatDate(lastUpdate)}
                        </span>
                      </td>
                      <td
                        className="py-3.5 px-3 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.status === "pending" ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveItem(item);
                                setApproveOpen(true);
                              }}
                              className="w-6 h-6 rounded flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer text-xs font-bold"
                              title="Đồng ý"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveItem(item);
                                setRejectReason("");
                                setRejectError("");
                                setRejectOpen(true);
                              }}
                              className="w-6 h-6 rounded flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer text-xs font-bold"
                              title="Từ chối"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <span className="text-mid-gray/40">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                // Empty State
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-[280px] mx-auto text-mid-gray">
                      <Wallet className="w-10 h-10 text-mid-gray/40 mb-2" />
                      <p className="font-semibold text-ink text-sm">
                        Không tìm thấy yêu cầu phù hợp
                      </p>
                      <p className="text-xs mt-1">
                        Hãy thử xóa bộ lọc hoặc tìm với từ khóa khác.
                      </p>
                      {isFilterActive && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-3 px-3 py-1.5 text-xs font-semibold text-ink bg-canvas border border-hairline rounded-[6px] hover:bg-paper transition-colors cursor-pointer"
                        >
                          Đặt lại bộ lọc
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Control */}
        {!loading && meta.total > 0 && (
          <AdminPagination
            currentPage={page}
            perPage={perPage}
            total={meta.total}
            onPageChange={(p) => setPage(p)}
            onPerPageChange={(pp) => {
              setPerPage(pp);
              setPage(1);
            }}
            itemLabel="yêu cầu"
          />
        )}
      </section>

      {/* --- Right slide-out Detail Drawer --- */}
      {selectedWithdrawalId !== null && (
        <div
          onClick={closeDrawer}
          className="fixed inset-0 bg-ink/40 z-[99] backdrop-blur-sm transition-opacity duration-300 opacity-100"
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-[100] w-full md:w-[480px] bg-paper shadow-2xl transition-transform duration-300 flex flex-col ${
          selectedWithdrawalId !== null ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="sticky top-0 bg-paper z-10 flex items-center justify-between px-5 py-4 border-b border-hairline shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-ink">
                Chi tiết yêu cầu rút tiền
              </h2>
              {detail && (
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_MAP[detail.status]?.color}`}
                  >
                    {STATUS_MAP[detail.status]?.label}
                  </span>
                  {detail.payout_mode === 'auto' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-hairline bg-paper text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      AUTO
                    </span>
                  )}
                  {detail.payout_mode === 'manual' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-hairline bg-paper text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      MANUAL
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-mid-gray font-mono mt-0.5">
              {detail ? detail.withdrawal_code : "WD-..."}
            </p>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-canvas text-mid-gray hover:text-ink transition-colors cursor-pointer outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
          {detailLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-mid-gray animate-spin" />
              <p className="text-xs text-mid-gray mt-3">Đang tải chi tiết...</p>
            </div>
          ) : detail ? (
            <>
              {/* Section 1: Instructor */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray mb-2">
                  Thông tin giảng viên
                </h3>
                <div className="p-3.5 border border-hairline rounded-[6px] bg-paper flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-ink/10 text-ink font-bold text-sm flex items-center justify-center shrink-0">
                      {getInitials(detail.user?.full_name)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-ink truncate">
                        {detail.user?.full_name}
                      </span>
                      <span className="text-[11px] text-mid-gray truncate">
                        {detail.user?.email}
                      </span>
                      <span className="text-[10px] text-mid-gray/80 font-mono mt-0.5">
                        ID GV: #{detail.user?.id}
                      </span>
                    </div>
                  </div>
                  {detail.user?.id && (
                    <button
                      onClick={() => navigate(`/admin/users?open_user_id=${detail.user.id}`)}
                      className="h-8 px-3 text-xs font-semibold text-blue-600 hover:text-blue-800 border border-hairline hover:bg-canvas rounded-[6px] transition-colors flex items-center justify-center shrink-0 whitespace-nowrap cursor-pointer"
                    >
                      Xem chi tiết &rarr;
                    </button>
                  )}
                </div>
              </div>

              {/* Section 2: Payout Amounts and Balances */}
              <div className="rounded-[6px] border border-hairline bg-paper p-3.5 space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">
                  Chi tiết số tiền rút
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-mid-gray">
                    Số tiền yêu cầu:
                  </span>
                  <span className="text-lg font-bold text-ink">
                    {formatVND(detail.amount)}
                  </span>
                </div>
                <div className="h-px bg-hairline my-2"></div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-mid-gray">
                      Số dư khả dụng trước rút:
                    </span>
                    <span className="font-semibold text-ink">
                      {detail.balance_snapshot?.available_balance_before != null 
                        ? formatVND(detail.balance_snapshot.available_balance_before) 
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-hairline/50">
                    <span className="text-mid-gray font-medium">
                      Số dư khả dụng sau khi giữ:
                    </span>
                    <span className="font-semibold text-emerald-600">
                      {detail.balance_snapshot?.available_balance_after != null 
                        ? formatVND(detail.balance_snapshot.available_balance_after) 
                        : "—"}
                    </span>
                  </div>
                </div>

                {["pending", "approved"].includes(detail.status) && 
                  detail.balance_snapshot?.available_balance_before != null &&
                  detail.balance_snapshot.available_balance_before < detail.amount && (
                  <div className="p-2.5 rounded-[6px] bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-snug">
                    ⚠️ Số dư khả dụng của tài khoản thấp hơn số tiền yêu cầu.
                    Cần kiểm tra đối soát trước khi duyệt.
                  </div>
                )}
              </div>

              {/* Section 3: Payout Account info */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">
                    Tài khoản nhận tiền (Lịch sử Snapshot)
                  </h3>
                  {detail.payout_snapshot?.payout_account_id && (
                    <button
                      onClick={() => navigate(`/admin/payout-accounts?open_payout_account_id=${detail.payout_snapshot.payout_account_id}`)}
                      className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      Xem chi tiết &rarr;
                    </button>
                  )}
                </div>
                <div className="p-3.5 border border-hairline rounded-[6px] bg-paper space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-hairline/60">
                    <span className="text-mid-gray">Ngân hàng / Cổng:</span>
                    <span className="font-bold text-ink">
                      {detail.payout_snapshot?.provider}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-mid-gray">Tên chủ tài khoản:</span>
                    <span className="font-semibold text-ink uppercase">
                      {detail.payout_snapshot?.account_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-mid-gray">Số tài khoản:</span>
                    <span className="font-mono font-bold text-ink tracking-wide">
                      {detail.payout_snapshot?.account_number}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-hairline/60 text-[11px]">
                    <span className="text-mid-gray">Trạng thái kết nối:</span>
                    <span className="text-emerald-600 font-semibold uppercase">
                      {detail.payout_snapshot?.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3.5: Transaction Details */}
              <div className="rounded-[6px] border border-hairline bg-paper p-3.5 space-y-2 text-xs">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray mb-1">
                  Phương thức chi trả &amp; Giao dịch
                </h3>
                <div className="flex justify-between items-center py-1 border-b border-hairline/60">
                  <span className="text-mid-gray">Phương thức:</span>
                  <span className="font-semibold text-ink">
                    {detail.payout_mode === 'auto' ? "Tự động" : (detail.payout_mode === 'manual' ? "Thủ công" : "Không xác định")}
                  </span>
                </div>
                {detail.payout_mode === 'auto' && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-mid-gray">Provider:</span>
                    <span className="font-semibold text-ink uppercase">
                      {detail.payout_provider === 'fake' ? "Fake Gateway" : detail.payout_provider}
                    </span>
                  </div>
                )}
                {detail.payout_mode === 'manual' && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-mid-gray">Xử lý bởi:</span>
                    <span className="font-semibold text-ink">Admin</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1">
                  <span className="text-mid-gray">Mã giao dịch:</span>
                  <span className="font-mono font-bold text-ink">
                    {detail.provider_payout_id || "---"}
                  </span>
                </div>
                {(detail.status === "failed" || detail.status === "rejected") &&
                  detail.rejected_reason && (
                    <div className="flex flex-col gap-1 pt-1.5 border-t border-hairline/60">
                      <span className="text-mid-gray font-medium">
                        Lý do lỗi / Từ chối:
                      </span>
                      <p className="text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-[6px] leading-relaxed mt-0.5">
                        {detail.rejected_reason}
                      </p>
                    </div>
                  )}
              </div>

              {/* Section 4: Revenue Allocations */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray mb-2">
                  Doanh thu phân bổ liên kết
                </h3>
                <div className="space-y-2">
                  {detail.allocations && detail.allocations.length > 0 ? (
                    detail.allocations.map((alloc: any) => (
                      <div
                        key={alloc.revenue_id}
                        className="p-2.5 bg-canvas/60 rounded-[6px] border border-hairline/80 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between font-medium">
                          <span
                            className="font-semibold text-ink truncate max-w-[240px]"
                            title={alloc.course_title}
                          >
                            {alloc.course_title}
                          </span>
                          <span className="font-bold text-ink whitespace-nowrap">
                            {formatVND(alloc.amount)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-mid-gray pt-1 border-t border-hairline/40">
                          {alloc.revenue_id && (
                            <a
                              href={`/admin/revenues?open_revenue_id=${alloc.revenue_id}`}
                              className="text-blue-600 hover:underline flex items-center gap-0.5"
                            >
                              Rev #{alloc.revenue_id}{" "}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          {alloc.order_id && (
                            <a
                              href={`/admin/orders?open_order_id=${alloc.order_id}`}
                              className="text-blue-600 hover:underline flex items-center gap-0.5"
                            >
                              Đơn #{alloc.order_id}{" "}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          <span className="ml-auto">
                            {formatDate(alloc.earned_at)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-mid-gray italic">
                      Chưa có phân bổ doanh thu nào được gắn với yêu cầu này.
                    </p>
                  )}
                </div>
              </div>

              {/* Section 5: Timeline */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray mb-2">
                  Nhật ký xử lý (Timeline)
                </h3>
                <div className="p-3.5 border border-hairline rounded-[6px] bg-paper space-y-3">
                  <div className="relative pl-4 space-y-4 border-l border-hairline">
                    {detail.timeline &&
                      detail.timeline.map((t: any, index: number) => {
                        let dotColor = "bg-blue-500";
                        if (t.status === "success") dotColor = "bg-emerald-500";
                        else if (t.status === "error") dotColor = "bg-rose-500";
                        else if (t.status === "warning")
                          dotColor = "bg-amber-500";

                        return (
                          <div key={index} className="relative">
                            <span
                              className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${dotColor} ring-4 ring-paper`}
                            />
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-xs font-bold text-ink">
                                {t.title}
                              </span>
                              <span className="text-[10px] text-mid-gray whitespace-nowrap font-mono">
                                {formatDate(t.timestamp)}
                              </span>
                            </div>
                            <p className="text-[11px] text-mid-gray mt-0.5 leading-snug">
                              {t.description}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center py-10 text-mid-gray text-xs">
              Lỗi hiển thị dữ liệu chi tiết.
            </p>
          )}
        </div>

        {/* Drawer Actions Footer */}
        {detail && (
          <div className="p-4 border-t border-hairline bg-paper flex items-center justify-end gap-2 shrink-0">
            {detail.status === "pending" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveItem(detail);
                    setRejectReason("");
                    setRejectError("");
                    setRejectOpen(true);
                  }}
                  className="h-9 px-4 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-[6px] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Từ chối
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveItem(detail);
                    setApproveOpen(true);
                  }}
                  className="h-9 px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-[6px] transition-colors cursor-pointer shadow-sm whitespace-nowrap"
                >
                  Phê duyệt
                </button>
              </>
            )}
            {detail.status === "approved" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveItem(detail);
                    setMarkPaidTxnId("");
                    setMarkPaidError("");
                    setMarkPaidOpen(true);
                  }}
                  className="h-9 px-4 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-[6px] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Xác nhận chuyển khoản (Thủ công)
                </button>
                <button
                  type="button"
                  disabled
                  className="h-9 px-5 text-xs font-semibold bg-canvas text-mid-gray/60 border border-hairline rounded-[6px] cursor-not-allowed whitespace-nowrap"
                >
                  Đang chờ cổng xử lý...
                </button>
              </>
            )}
            {detail.status === "failed" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveItem(detail);
                    setMarkPaidTxnId("");
                    setMarkPaidError("");
                    setMarkPaidOpen(true);
                  }}
                  className="h-9 px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-[6px] transition-colors cursor-pointer shadow-sm whitespace-nowrap"
                >
                  Xử lý thủ công
                </button>
              </>
            )}
            {["paid", "rejected", "cancelled"].includes(detail.status) && (
              <span className="text-xs text-mid-gray italic">
                Yêu cầu đã hoàn tất ({STATUS_MAP[detail.status]?.label}). Chỉ
                được phép xem.
              </span>
            )}
          </div>
        )}
      </div>

      {/* --- Modals Section --- */}

      {/* 1. Approve Modal */}
      {approveOpen && activeItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-paper border border-hairline rounded-[8px] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">
                  Xác nhận duyệt yêu cầu
                </h3>
                <p className="text-xs text-mid-gray font-mono">
                  {activeItem.withdrawal_code}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-surface-alt rounded-[6px] border border-hairline text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-mid-gray">Giảng viên:</span>
                <span className="font-semibold text-ink">
                  {activeItem.user?.full_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mid-gray">Số tiền duyệt:</span>
                <span className="font-bold text-emerald-600">
                  {formatVND(activeItem.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mid-gray">Tài khoản nhận:</span>
                <span className="font-medium text-ink">
                  {activeItem.payout_snapshot?.provider} -{" "}
                  {activeItem.payout_snapshot?.account_number_masked}
                </span>
              </div>
            </div>

            <p className="text-xs text-mid-gray leading-relaxed">
              Thao tác này sẽ phê duyệt yêu cầu và chuyển trạng thái sang{" "}
              <strong className="text-blue-600">Đang xử lý</strong> để chờ kế
              toán thực hiện lệnh chi trả.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setApproveOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-canvas hover:bg-paper border border-hairline rounded-[6px] text-ink transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleApprove}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-[6px] transition-colors cursor-pointer flex items-center gap-1"
              >
                {isSubmitting && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Xác nhận duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Reject Modal */}
      {rejectOpen && activeItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-paper border border-hairline rounded-[8px] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">
                  Từ chối yêu cầu rút tiền
                </h3>
                <p className="text-xs text-mid-gray font-mono">
                  {activeItem.withdrawal_code}
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="reject-reason-input"
                className="block text-xs font-semibold text-ink mb-1.5"
              >
                Lý do từ chối <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="reject-reason-input"
                rows={4}
                maxLength={1000}
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  setRejectError("");
                }}
                placeholder="Nhập lý do chi tiết từ chối yêu cầu (tối đa 1000 ký tự)..."
                className="w-full p-2.5 text-xs bg-canvas border border-hairline rounded-[6px] focus:outline-none focus:border-ink transition-colors text-ink placeholder:text-mid-gray/60"
              />
              <div className="flex items-center justify-between mt-1">
                {rejectError && (
                  <span className="text-[11px] text-rose-600 font-medium">
                    {rejectError}
                  </span>
                )}
                <span className="text-[10px] text-mid-gray ml-auto">
                  {rejectReason.length}/1000
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-canvas hover:bg-paper border border-hairline rounded-[6px] text-ink transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleReject}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-[6px] transition-colors cursor-pointer flex items-center gap-1"
              >
                {isSubmitting && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mark Paid Modal */}
      {markPaidOpen && activeItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-paper border border-hairline rounded-[8px] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">
                  Đánh dấu đã thanh toán
                </h3>
                <p className="text-xs text-mid-gray font-mono">
                  {activeItem.withdrawal_code}
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="provider-payout-id-input"
                className="block text-xs font-semibold text-ink mb-1.5"
              >
                Mã giao dịch từ ngân hàng / Cổng{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="provider-payout-id-input"
                maxLength={255}
                value={markPaidTxnId}
                onChange={(e) => {
                  setMarkPaidTxnId(e.target.value);
                  setMarkPaidError("");
                }}
                placeholder="Ví dụ: TXN-20260721-9981..."
                className="w-full h-9 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:outline-none focus:border-ink transition-colors text-ink font-mono placeholder:text-mid-gray/60"
              />
              {markPaidError && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {markPaidError}
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setMarkPaidOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-canvas hover:bg-paper border border-hairline rounded-[6px] text-ink transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleMarkPaid}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-[6px] transition-colors cursor-pointer flex items-center gap-1"
              >
                {isSubmitting && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Xác nhận hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
