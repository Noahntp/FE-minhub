import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { RotateCcw, Filter, X, Gem, Award } from "lucide-react";
import * as upgradesApi from "@/assets/js/api/instructor-upgrades-api.js";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import FilterSelect, { SelectOption } from "./FilterSelect";
import AdminPagination from "../shared/AdminPagination";

// Helper: safe percentage calculation
const calculatePercentage = (value: number, total: number) => {
  if (!total || total <= 0) return 0;
  return Math.round((value / total) * 1000) / 10;
};

// User Status Dot Marker
function UpgradeStatusMarker({
  status,
  isResubmission,
}: {
  status: string;
  isResubmission?: boolean;
}) {
  if (status === "pending") {
    return (
      <div className="flex flex-col gap-1 items-start">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse shrink-0"></span>
          Chờ xử lý
        </span>
        {isResubmission && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 select-none shadow-2xs">
            Nộp lại
          </span>
        )}
      </div>
    );
  } else if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0"></span>
        Đã duyệt
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger-brick select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-danger-brick shrink-0"></span>
        Đã từ chối
      </span>
    );
  }
}

// User Payout Status Dot Marker
function PayoutStatusMarker({ status }: { status: string }) {
  if (status === "active" || status === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-success select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0"></span>
        Đã xác thực
      </span>
    );
  } else if (status === "pending_verification") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-warning select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse shrink-0"></span>
        Chờ xác minh
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-mid-gray select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-mid-gray shrink-0"></span>
        Vô hiệu hóa
      </span>
    );
  }
}

// User Avatar with fallback letter
function UserAvatar({
  fullName,
  avatarUrl,
  size = "md",
}: {
  fullName?: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const [hasError, setHasError] = useState(false);
  const firstLetter = fullName ? fullName.charAt(0).toUpperCase() : "U";

  const sizeClasses = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-12 w-12 text-base",
  }[size];

  if (avatarUrl && !hasError) {
    return (
      <img
        src={avatarUrl}
        alt={fullName || "User Avatar"}
        onError={() => setHasError(true)}
        className={cn(
          sizeClasses,
          "rounded-full object-cover shrink-0 border border-hairline/80 shadow-2xs select-none",
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClasses,
        "flex items-center justify-center rounded-full bg-canvas text-mid-gray font-bold select-none border border-hairline/60 shrink-0",
      )}
    >
      {firstLetter}
    </div>
  );
}

// Cấp hạng / Huy chương
function RankBadge({ rank }: { rank?: string }) {
  const r = (rank || "").toLowerCase().trim();
  if (r === "diamond" || r === "kim cương") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 select-none shadow-2xs">
        <Gem className="w-3 h-3 text-cyan-500 fill-cyan-400/30 shrink-0 animate-pulse" />
        Diamond
      </span>
    );
  }
  if (r === "gold" || r === "vàng") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 select-none shadow-2xs">
        <Award className="w-3 h-3 text-amber-500 fill-amber-400/40 shrink-0" />
        Gold
      </span>
    );
  }
  if (r === "silver" || r === "bạc") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 select-none shadow-2xs">
        <Award className="w-3 h-3 text-slate-400 fill-slate-300/40 shrink-0" />
        Silver
      </span>
    );
  }
  if (r === "bronze" || r === "đồng") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-amber-900 bg-orange-50 border border-orange-200 select-none shadow-2xs">
        <Award className="w-3 h-3 text-amber-700 fill-amber-600/40 shrink-0" />
        Bronze
      </span>
    );
  }
  return (
    <span className="text-[10px] text-mid-gray/80 font-medium">
      {rank || "Chưa phân cấp"}
    </span>
  );
}

// Ngân hàng nội bộ và Logo Badge
const getBankDetails = (providerName: string) => {
  const p = (providerName || "").trim();
  const lower = p.toLowerCase();

  if (lower.includes("vietcombank") || lower === "vcb") {
    return {
      shortName: "Vietcombank",
      badgeColor: "bg-emerald-700 text-white border-emerald-800",
      code: "VCB",
    };
  }
  if (lower.includes("techcombank") || lower === "tcb") {
    return {
      shortName: "Techcombank",
      badgeColor: "bg-red-600 text-white border-red-700",
      code: "TCB",
    };
  }
  if (lower.includes("mb") || lower.includes("quân đội")) {
    return {
      shortName: "MB Bank",
      badgeColor: "bg-blue-700 text-white border-blue-800",
      code: "MB",
    };
  }
  if (lower.includes("vpbank") || lower.includes("vp bank")) {
    return {
      shortName: "VPBank",
      badgeColor: "bg-emerald-600 text-white border-emerald-700",
      code: "VPB",
    };
  }
  if (lower.includes("acb") || lower.includes("á châu")) {
    return {
      shortName: "ACB",
      badgeColor: "bg-sky-600 text-white border-sky-700",
      code: "ACB",
    };
  }
  if (lower.includes("bidv")) {
    return {
      shortName: "BIDV",
      badgeColor: "bg-teal-700 text-white border-teal-800",
      code: "BIDV",
    };
  }
  if (lower.includes("agribank")) {
    return {
      shortName: "Agribank",
      badgeColor: "bg-amber-800 text-white border-amber-900",
      code: "VBA",
    };
  }
  if (lower.includes("tpbank") || lower.includes("tiên phong")) {
    return {
      shortName: "TPBank",
      badgeColor: "bg-purple-700 text-white border-purple-800",
      code: "TPB",
    };
  }
  if (lower.includes("momo")) {
    return {
      shortName: "MoMo",
      badgeColor: "bg-pink-600 text-white border-pink-700",
      code: "MoMo",
    };
  }
  if (lower.includes("zalopay")) {
    return {
      shortName: "ZaloPay",
      badgeColor: "bg-blue-500 text-white border-blue-600",
      code: "Zalo",
    };
  }
  return {
    shortName: p || "Ngân hàng",
    badgeColor: "bg-slate-700 text-white border-slate-800",
    code: p ? p.substring(0, 3).toUpperCase() : "NH",
  };
};

function BankBadge({ provider }: { provider?: string }) {
  const bank = getBankDetails(provider || "");
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center justify-center h-4 px-1 rounded text-[8px] font-black uppercase tracking-wider select-none shrink-0 shadow-2xs border",
          bank.badgeColor,
        )}
      >
        {bank.code}
      </span>
      <span className="font-semibold text-ink text-xs truncate">
        {bank.shortName}
      </span>
    </div>
  );
}

// Common experience colors helper mapping (7-8px dot)
const getExperienceColor = (years: number) => {
  if (years < 1) return { color: "text-neutral-500", bg: "bg-neutral-400" };
  if (years <= 2) return { color: "text-blue-600", bg: "bg-blue-600" };
  if (years <= 5) return { color: "text-amber-600", bg: "bg-amber-600" };
  return { color: "text-emerald-600", bg: "bg-emerald-600" };
};

const statusOptions: SelectOption[] = [
  {
    value: "",
    label: "Tất cả trạng thái",
    colorClass: "text-neutral-700",
    hoverBgClass: "hover:bg-neutral-50",
  },
  {
    value: "pending",
    label: "Chờ xử lý",
    colorClass: "text-warning",
    hoverBgClass: "hover:bg-warning/10",
  },
  {
    value: "approved",
    label: "Đã duyệt",
    colorClass: "text-success",
    hoverBgClass: "hover:bg-success/10",
  },
  {
    value: "rejected",
    label: "Đã từ chối",
    colorClass: "text-danger-brick",
    hoverBgClass: "hover:bg-danger-brick/10",
  },
];

const sortOptions: SelectOption[] = [
  {
    value: "newest",
    label: "Mới nhất",
    colorClass: "text-neutral-700",
    hoverBgClass: "hover:bg-neutral-50",
  },
  {
    value: "oldest",
    label: "Cũ nhất",
    colorClass: "text-neutral-500",
    hoverBgClass: "hover:bg-neutral-50",
  },
  {
    value: "name_asc",
    label: "Tên A–Z",
    colorClass: "text-purple-600",
    hoverBgClass: "hover:bg-purple-50",
  },
  {
    value: "name_desc",
    label: "Tên Z–A",
    colorClass: "text-purple-600",
    hoverBgClass: "hover:bg-purple-50",
  },
  {
    value: "specialty_asc",
    label: "Chuyên môn A–Z",
    colorClass: "text-teal-600",
    hoverBgClass: "hover:bg-teal-50",
  },
  {
    value: "specialty_desc",
    label: "Chuyên môn Z–A",
    colorClass: "text-teal-600",
    hoverBgClass: "hover:bg-teal-50",
  },
  {
    value: "experience_asc",
    label: "Kinh nghiệm tăng dần",
    colorClass: "text-blue-600",
    hoverBgClass: "hover:bg-blue-50",
  },
  {
    value: "experience_desc",
    label: "Kinh nghiệm giảm dần",
    colorClass: "text-blue-600",
    hoverBgClass: "hover:bg-blue-50",
  },
];

const timeOptions: SelectOption[] = [
  {
    value: "all",
    label: "Tất cả thời gian",
    colorClass: "text-neutral-700",
    hoverBgClass: "hover:bg-neutral-50",
  },
  {
    value: "today",
    label: "Hôm nay",
    colorClass: "text-emerald-600",
    hoverBgClass: "hover:bg-emerald-50",
  },
  {
    value: "7_days",
    label: "7 ngày qua",
    colorClass: "text-blue-600",
    hoverBgClass: "hover:bg-blue-50",
  },
  {
    value: "30_days",
    label: "30 ngày qua",
    colorClass: "text-purple-600",
    hoverBgClass: "hover:bg-purple-50",
  },
  {
    value: "custom",
    label: "Tùy chọn ngày",
    colorClass: "text-rose-700",
    hoverBgClass: "hover:bg-rose-50",
  },
];

export default function InstructorUpgrades() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search parameters sync
  const searchParam = searchParams.get("search") || "";
  const statusParam = searchParams.get("status") || "";
  const dateFromParam = searchParams.get("date_from") || "";
  const dateToParam = searchParams.get("date_to") || "";
  const sortByParam = searchParams.get("sort_by") || "newest";
  const pageParam = Number(searchParams.get("page")) || 1;
  const perPageParam = Number(searchParams.get("per_page")) || 20;

  // New Column-level filters parameters
  const experienceRangeParam = searchParams.get("experience_range") || "";
  const payoutFilterParam = searchParams.get("payout_filter") || "";
  const datePresetParam = searchParams.get("date_preset") || "";

  // Local Filter Form State (before Applying)
  const [formSearch, setFormSearch] = useState(searchParam);
  const [formStatus, setFormStatus] = useState(statusParam);
  const [formDatePreset, setFormDatePreset] = useState(datePresetParam);
  const [formDateFrom, setFormDateFrom] = useState(dateFromParam);
  const [formDateTo, setFormDateTo] = useState(dateToParam);
  const [formSortBy, setFormSortBy] = useState(sortByParam);
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<
    string | null
  >(null);
  
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const filterPopoverRef = useRef<HTMLDivElement>(null);

  // Sync Form States when query parameters change (e.g. Back/Forward button, Reset)
  useEffect(() => {
    setFormSearch(searchParam);
    setFormStatus(statusParam);
    setFormDatePreset(datePresetParam);
    setFormDateFrom(dateFromParam);
    setFormDateTo(dateToParam);
    setFormSortBy(sortByParam);
  }, [
    searchParam,
    statusParam,
    datePresetParam,
    dateFromParam,
    dateToParam,
    sortByParam,
  ]);

  // Data States
  const [paginatedItems, setPaginatedItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("---");

  // Attention KPI values
  const [attentionData, setAttentionData] = useState({
    pendingCount: 0,
    new7DaysCount: 0,
    oldestDays: 0,
    oldestDateText: "Chưa có hồ sơ tồn đọng",
    avgProcessDays: "---",
    missingPayoutCount: 0,
  });

  // UI Interactive States
  const [activeActionMenu, setActiveActionMenu] = useState<number | null>(null);
  const [activeColumnMenu, setActiveColumnMenu] = useState<string | null>(null);
  const [activeDetailUser, setActiveDetailUser] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPayoutVisible, setIsPayoutVisible] = useState(false);

  // Confirmation Modals State
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: "approve" | "reject" | "";
    user: any | null;
    error?: string;
    reason?: string;
  }>({
    open: false,
    type: "",
    user: null,
    error: "",
    reason: "",
  });

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-column-menu]")) {
        setActiveColumnMenu(null);
      }
      if (!target.closest("[data-action-td]")) {
        setActiveActionMenu(null);
      }
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(e.target as Node)) {
        setFilterPopoverOpen(false);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Keyboard events for Drawer & Modals & Esc to close column menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDetailDrawer();
        setConfirmModal({ open: false, type: "", user: null, error: "" });
        setActiveColumnMenu(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, searchParams]);

  // Auto smart scroll down to list section when status or open_upgrade_id is in URL
  useEffect(() => {
    if (statusParam || searchParams.has("status") || searchParams.has("open_upgrade_id")) {
      const timer = setTimeout(() => {
        const el = document.getElementById("upgrade-list-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [statusParam, searchParams]);

  // Update query parameters helper
  const updateFilters = (newFilters: Record<string, any>) => {
    const nextParams = new URLSearchParams(searchParams);

    let resetPage = true;
    if (newFilters.page !== undefined) {
      resetPage = false;
    }

    Object.keys(newFilters).forEach((key) => {
      const val = newFilters[key];
      if (val === undefined || val === null || val === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(val));
      }
    });

    if (resetPage) {
      nextParams.delete("page");
    }

    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setFormSearch("");
    setFormStatus("");
    setFormDatePreset("");
    setFormDateFrom("");
    setFormDateTo("");
    setFormSortBy("newest");
    setSearchParams(new URLSearchParams());
    setActiveActionMenu(null);
    setActiveColumnMenu(null);
    setActiveFilterDropdown(null);
  };

  // Form Submit handler
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    if (formDatePreset === "custom") {
      if (
        formDateFrom &&
        formDateTo &&
        new Date(formDateTo) < new Date(formDateFrom)
      ) {
        toast.error("Đến ngày gửi không được nhỏ hơn Từ ngày gửi.");
        return;
      }
    }
    updateFilters({
      search: formSearch.trim(),
      status: formStatus,
      date_from: formDateFrom,
      date_to: formDateTo,
      sort_by: formSortBy,
      date_preset: formDatePreset,
      page: 1,
    });
    toast.success("Áp dụng bộ lọc thành công");
  };

  // KPI Card clicks -> updates status param
  const handleTabChange = (tabValue: string) => {
    updateFilters({ status: tabValue, page: 1 });
    setTimeout(() => {
      const el = document.getElementById("upgrade-list-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  // Date/Time Format Helpers
  const formatDateTime = (isoString: string) => {
    if (!isoString) return "---";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "---";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatDateOnly = (isoString: string) => {
    if (!isoString) return "---";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "---";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper to map date preset to actual from/to values for form input display
  useEffect(() => {
    if (datePresetParam) {
      const now = new Date();
      const formatYMD = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const dateToText = formatYMD(now);
      let dateFromText = "";

      if (datePresetParam === "today") {
        dateFromText = dateToText;
      } else if (datePresetParam === "7_days") {
        const fromD = new Date();
        fromD.setDate(now.getDate() - 7);
        dateFromText = formatYMD(fromD);
      } else if (datePresetParam === "30_days") {
        const fromD = new Date();
        fromD.setDate(now.getDate() - 30);
        dateFromText = formatYMD(fromD);
      }

      setFormDateFrom(dateFromText);
      setFormDateTo(dateToText);
    }
  }, [datePresetParam]);

  // Fetch data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch paginated filtered list
      const queryParams: any = {
        search: searchParam,
        status: statusParam,
        date_from: dateFromParam,
        date_to: dateToParam,
        sort_by: sortByParam,
        page: pageParam,
        per_page: perPageParam,
        experience_range: experienceRangeParam,
        payout_filter: payoutFilterParam,
        date_preset: datePresetParam,
      };

      const tableRes = await upgradesApi.getUpgradeRequests(queryParams);

      // 2. Fetch all list to compute KPIs & Attention Card details
      const allRes = await upgradesApi.getUpgradeRequests({ per_page: 99999 });

      if (tableRes.success && allRes.success) {
        let fetchedItems = tableRes.data.items || [];

        // 1. Lọc bớt dữ liệu trùng lặp (Deduplicate) dựa vào user.id
        // (Do backend trả về trùng nhiều request của 1 user)
        const uniqueItemsMap = new Map();
        fetchedItems.forEach((item: any) => {
          if (item?.user?.id) {
            // Ưu tiên giữ lại item mới nhất hoặc item chưa duyệt
            if (!uniqueItemsMap.has(item.user.id)) {
              uniqueItemsMap.set(item.user.id, item);
            } else {
              const existing = uniqueItemsMap.get(item.user.id);
              if (existing.application_status !== "pending" && item.application_status === "pending") {
                uniqueItemsMap.set(item.user.id, item); // Ưu tiên pending
              }
            }
          }
        });
        let processedItems = Array.from(uniqueItemsMap.values());

        // 2. Lọc theo trạng thái (Frontend fallback)
        // (Trong trường hợp backend không nhận param status)
        if (statusParam) {
          processedItems = processedItems.filter(
            (item: any) => item.application_status === statusParam
          );
        }

        setPaginatedItems(processedItems);
        const resolvedMeta = tableRes.meta ?? tableRes.data?.meta ?? null;
        setMeta(resolvedMeta);
        setSummary(allRes.data.summary);

        const allItemsData = allRes.data.items;
        calculateAttentionKPIs(allItemsData);

        // Auto Page Adjustment
        if (resolvedMeta && pageParam > resolvedMeta.last_page) {
          updateFilters({ page: Math.max(1, resolvedMeta.last_page) });
        }
      } else {
        setError(tableRes.message || "Lỗi khi tải dữ liệu.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
      const now = new Date();
      setLastUpdated(
        `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`,
      );
    }
  };

  useEffect(() => {
    loadData();
  }, [
    searchParam,
    statusParam,
    dateFromParam,
    dateToParam,
    sortByParam,
    pageParam,
    perPageParam,
    experienceRangeParam,
    payoutFilterParam,
    datePresetParam,
  ]);

  // Compute stats helper
  const calculateAttentionKPIs = (items: any[]) => {
    const now = new Date();

    // 1. Pending requests count
    const pendingItems = items.filter(
      (r) => r.application_status === "pending",
    );
    const pendingCount = pendingItems.length;

    // 2. New 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const new7DaysCount = items.filter(
      (r) => new Date(r.submitted_at) >= sevenDaysAgo,
    ).length;

    // 3. Oldest waiting days
    let oldestDays = 0;
    let oldestDateText = "Chưa có hồ sơ tồn đọng";
    if (pendingCount > 0) {
      const sortedPending = [...pendingItems].sort(
        (a, b) =>
          new Date(a.submitted_at).getTime() -
          new Date(b.submitted_at).getTime(),
      );
      const oldest = sortedPending[0];
      const diffMs = Math.abs(
        now.getTime() - new Date(oldest.submitted_at).getTime(),
      );
      oldestDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      oldestDateText = `Gửi ngày ${formatDateOnly(oldest.submitted_at)}`;
    }

    // 4. Average Processing Days
    const processedItems = items.filter(
      (r) =>
        r.application_status !== "pending" && r.reviewed_at && r.submitted_at,
    );
    let avgProcessDays = "Chưa có dữ liệu";
    if (processedItems.length > 0) {
      const totalDuration = processedItems.reduce((sum, r) => {
        const diff =
          new Date(r.reviewed_at).getTime() -
          new Date(r.submitted_at).getTime();
        return sum + diff;
      }, 0);
      const avgMs = totalDuration / processedItems.length;
      const avgDays = Math.round((avgMs / (1000 * 60 * 60 * 24)) * 10) / 10;
      avgProcessDays = `${avgDays.toLocaleString("vi-VN")} ngày`;
    }

    // 5. Missing payout account details
    const missingPayoutCount = pendingItems.filter(
      (r) =>
        !r.payout_account ||
        (r.payout_account.status !== "active" && r.payout_account.status !== "verified") ||
        !r.payout_account.account_name ||
        !r.payout_account.account_number_masked,
    ).length;

    setAttentionData({
      pendingCount,
      new7DaysCount,
      oldestDays,
      oldestDateText,
      avgProcessDays,
      missingPayoutCount,
    });
  };

  // Sync open drawer on mount and on browser Back/Forward (searchParams change)
  useEffect(() => {
    const openId = searchParams.get("open_upgrade_id");
    if (openId) {
      const uid = Number(openId);
      if (uid && (!activeDetailUser || activeDetailUser.user?.id !== uid)) {
        loadDetailUser(uid);
      }
    } else {
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
        setActiveDetailUser(null);
      }
    }
  }, [searchParams]);

  const loadDetailUser = async (userId: number) => {
    try {
      const res = await upgradesApi.getUpgradeRequest(userId);
      if (res && res.success) {
        setActiveDetailUser(res.data);
        setIsPayoutVisible(false);
        setIsDrawerOpen(true);
      } else {
        toast.error(res ? res.message : "Không thể lấy chi tiết hồ sơ.");
        closeDetailDrawer();
      }
    } catch (e) {
      toast.error("Lỗi khi kết nối chi tiết hồ sơ.");
      closeDetailDrawer();
    }
  };

  // Open Drawer trigger
  const openDetailDrawer = (userId: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("open_upgrade_id", String(userId));
    setSearchParams(nextParams);
    loadDetailUser(userId);
  };

  const closeDetailDrawer = () => {
    setIsDrawerOpen(false);
    setActiveDetailUser(null);
    if (searchParams.has("open_upgrade_id")) {
      navigate(-1);
    }
  };

  // Action submit triggers
  const handleConfirmSubmit = async () => {
    const { type, user, reason } = confirmModal;
    if (!user) return;

    if (type === "reject" && (!reason || !reason.trim())) {
      setConfirmModal((prev) => ({
        ...prev,
        error: "Vui lòng nhập lý do từ chối để học viên nắm thông tin.",
      }));
      toast.error("Vui lòng nhập lý do từ chối hồ sơ.");
      return;
    }

    try {
      let res: any;
      if (type === "approve") {
        res = await upgradesApi.approveUpgradeRequest(user.user.id);
      } else if (type === "reject") {
        res = await upgradesApi.rejectUpgradeRequest(user.user.id, reason?.trim());
      }

      if (res && res.success) {
        toast.success(res.message || "Thực hiện thành công.");
        setConfirmModal({ open: false, type: "", user: null, error: "", reason: "" });
        setIsDrawerOpen(false);
        loadData();
        window.dispatchEvent(new CustomEvent("mindhub-admin-task-updated"));
      } else {
        toast.error(res ? res.message : "Thao tác thất bại.");
        setConfirmModal((prev) => ({
          ...prev,
          error: res ? res.message : "Lỗi hệ thống.",
        }));
      }
    } catch (e) {
      toast.error("Có lỗi xảy ra trong quá trình xử lý.");
    }
  };

  // Derived Summary calculations
  const pendingRate = calculatePercentage(summary.pending, summary.total);
  const approvedRate = calculatePercentage(summary.approved, summary.total);
  const rejectedRate = calculatePercentage(summary.rejected, summary.total);

  const processedTotal = summary.approved + summary.rejected;
  const processedApprovedRate =
    processedTotal > 0
      ? calculatePercentage(summary.approved, processedTotal)
      : 0;
  const processedRejectedRate =
    processedTotal > 0
      ? calculatePercentage(summary.rejected, processedTotal)
      : 0;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-tight flex items-center gap-2">
            Yêu cầu lên giảng viên
          </h1>
          <p className="text-xs text-mid-gray mt-0.5">
            Xem xét và xử lý hồ sơ đăng ký trở thành giảng viên trên hệ thống.
            Tổng số: <span className="font-bold text-ink">{summary.total}</span>{" "}
            yêu cầu.
          </p>
          <p className="text-[10px] text-mid-gray/80 mt-1">
            Cập nhật lần cuối:{" "}
            <span className="font-medium text-mid-gray">{lastUpdated}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="h-9 w-9 flex items-center justify-center rounded-full border border-hairline hover:bg-canvas text-ink shrink-0 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            aria-label="Làm mới dữ liệu"
          >
            <svg
              className={cn("w-4 h-4 text-ink", loading && "animate-spin")}
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

      {/* 1. KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI: Tổng yêu cầu */}
        <button
          type="button"
          onClick={() => handleTabChange("")}
          className="text-left w-full rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[110px] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none select-none group"
        >
          <div className="flex items-center justify-between text-mid-gray w-full">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Tổng yêu cầu
            </span>
            <svg
              className="w-4 h-4 text-mid-gray/80 group-hover:text-ink transition-colors"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
            </svg>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-ink leading-none font-sans">
              {summary.total}
            </span>
            <p className="text-[9px] text-mid-gray mt-0.5">
              Tất cả hồ sơ đã gửi
            </p>
          </div>
          <div className="mt-2 space-y-1.5 w-full">
            <div className="flex items-center justify-between text-[9px] text-mid-gray select-none">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-warning"></span>
                Chờ: <strong>{summary.pending}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                Duyệt: <strong>{summary.approved}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-danger-brick"></span>
                Từ chối: <strong>{summary.rejected}</strong>
              </span>
            </div>
            <div className="h-1 w-full bg-canvas rounded-full flex overflow-hidden">
              <div
                className="bg-warning transition-all duration-500"
                style={{ width: `${pendingRate}%` }}
              />
              <div
                className="bg-success transition-all duration-500"
                style={{ width: `${approvedRate}%` }}
              />
              <div
                className="bg-danger-brick transition-all duration-500"
                style={{ width: `${rejectedRate}%` }}
              />
            </div>
          </div>
        </button>

        {/* KPI: Chờ xử lý */}
        <button
          type="button"
          onClick={() => handleTabChange("pending")}
          className="text-left w-full rounded-[6px] border border-hairline border-t-2 border-t-warning bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[110px] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none select-none group"
        >
          <div className="flex items-center justify-between text-mid-gray w-full">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Chờ xử lý
            </span>
            <span className="text-[9px] font-bold text-warning underline select-none">
              Xem hồ sơ
            </span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-warning leading-none font-sans">
              {summary.pending}
            </span>
            <p className="text-[9px] text-mid-gray mt-0.5">
              Hồ sơ cần Admin xử lý
            </p>
          </div>
          <div className="mt-2 space-y-1 w-full">
            <div className="text-[9px] text-mid-gray flex justify-between select-none">
              <span>{pendingRate.toLocaleString("vi-VN")}% tổng hồ sơ</span>
            </div>
            <div className="h-1 w-full bg-warning-soft rounded-full overflow-hidden">
              <div
                className="h-full bg-warning transition-all duration-500"
                style={{ width: `${pendingRate}%` }}
              />
            </div>
          </div>
        </button>

        {/* KPI: Đã duyệt */}
        <button
          type="button"
          onClick={() => handleTabChange("approved")}
          className="text-left w-full rounded-[6px] border border-hairline border-t-2 border-t-success bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[110px] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none select-none group"
        >
          <div className="flex items-center justify-between text-mid-gray w-full">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Đã duyệt
            </span>
            <svg
              className="w-4 h-4 text-success/80"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 12 2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-success leading-none font-sans">
              {summary.approved}
            </span>
            <p className="text-[9px] text-mid-gray mt-0.5">
              Hồ sơ đã được phê duyệt
            </p>
          </div>
          <div className="mt-2 space-y-1 w-full">
            <div className="text-[9px] text-mid-gray flex justify-between select-none">
              <span>
                {processedTotal > 0
                  ? `Tỷ lệ duyệt: ${processedApprovedRate.toLocaleString("vi-VN")}%`
                  : "Chưa có hồ sơ đã xử lý"}
              </span>
            </div>
            <div className="h-1 w-full bg-success-soft rounded-full overflow-hidden">
              <div
                className="h-full bg-success transition-all duration-500"
                style={{
                  width: `${processedTotal > 0 ? processedApprovedRate : 0}%`,
                }}
              />
            </div>
          </div>
        </button>

        {/* KPI: Đã từ chối */}
        <button
          type="button"
          onClick={() => handleTabChange("rejected")}
          className="text-left w-full rounded-[6px] border border-hairline border-t-2 border-t-danger-brick bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[110px] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none select-none group"
        >
          <div className="flex items-center justify-between text-mid-gray w-full">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Đã từ chối
            </span>
            <svg
              className="w-4 h-4 text-danger-brick/80"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
              />
            </svg>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-danger-brick leading-none font-sans">
              {summary.rejected}
            </span>
            <p className="text-[9px] text-mid-gray mt-0.5">
              Hồ sơ không đạt yêu cầu
            </p>
          </div>
          <div className="mt-2 space-y-1 w-full">
            <div className="text-[9px] text-mid-gray flex justify-between select-none">
              <span>
                {processedTotal > 0
                  ? `Tỷ lệ từ chối: ${processedRejectedRate.toLocaleString("vi-VN")}%`
                  : "Chưa có hồ sơ đã xử lý"}
              </span>
            </div>
            <div className="h-1 w-full bg-danger-brick-soft rounded-full overflow-hidden">
              <div
                className="h-full bg-danger-brick transition-all duration-500"
                style={{
                  width: `${processedTotal > 0 ? processedRejectedRate : 0}%`,
                }}
              />
            </div>
          </div>
        </button>
      </div>

      {/* 2. Tình trạng xử lý hồ sơ (Quick Insight Bar) */}
      <div className="rounded-[6px] border border-hairline bg-surface-alt p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:h-[96px]">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-4 gap-x-5 lg:gap-x-8 flex-grow">
          {/* Item 1 */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-mid-gray">
              <svg
                className="w-4 h-4 text-warning shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-mid-gray select-none">
                Đang chờ xử lý
              </span>
            </div>
            <div className="text-lg font-bold text-ink mt-1 font-sans">
              {attentionData.pendingCount} hồ sơ
            </div>
            <div className="text-[11px] text-mid-gray mt-0.5 select-none leading-none">
              Cần Admin xem xét
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col border-l-0 sm:border-l border-hairline/40 pl-0 sm:pl-5 md:pl-8 lg:pl-6">
            <div className="flex items-center gap-1.5 text-mid-gray">
              <svg
                className="w-4 h-4 text-success shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008z"
                />
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-mid-gray select-none">
                Mới 7 ngày
              </span>
            </div>
            <div className="text-lg font-bold text-ink mt-1 font-sans">
              {attentionData.new7DaysCount} hồ sơ
            </div>
            <div className="text-[11px] text-mid-gray mt-0.5 select-none leading-none">
              Được gửi gần đây
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex flex-col border-l border-hairline/40 pl-5 md:pl-8 lg:pl-6">
            <div className="flex items-center gap-1.5 text-warning">
              <svg
                className="w-4 h-4 text-warning shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-wider select-none">
                Chờ lâu nhất
              </span>
            </div>
            <div className="text-lg font-bold text-ink mt-1 font-sans">
              {attentionData.pendingCount > 0
                ? `${attentionData.oldestDays} ngày`
                : "0 ngày"}
            </div>
            <div className="text-[11px] text-mid-gray mt-0.5 leading-none truncate font-medium">
              {attentionData.oldestDateText}
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex flex-col border-l-0 md:border-l border-hairline/40 pl-0 md:pl-8 lg:pl-6">
            <div className="flex items-center gap-1.5 text-mid-gray">
              <svg
                className="w-4 h-4 text-success shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-mid-gray select-none">
                Xử lý trung bình
              </span>
            </div>
            <div className="text-lg font-bold text-ink mt-1 font-sans">
              {attentionData.avgProcessDays}
            </div>
            <div className="text-[11px] text-mid-gray mt-0.5 select-none leading-none">
              Dựa trên hồ sơ đã xử lý
            </div>
          </div>

          {/* Item 5 */}
          <div className="flex flex-col border-l border-hairline/40 pl-5 md:pl-8 lg:pl-6">
            <div className="flex items-center gap-1.5 text-danger-brick">
              <svg
                className="w-4 h-4 text-danger-brick shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-wider select-none font-bold">
                Thiếu tài khoản
              </span>
            </div>
            <div className="text-lg font-bold text-danger-brick mt-1 font-sans">
              {attentionData.missingPayoutCount} hồ sơ
            </div>
            <div className="text-[11px] text-mid-gray mt-0.5 select-none leading-none">
              Cần bổ sung thông tin
            </div>
          </div>
        </div>

        {/* View Pending Button */}
        <button
          type="button"
          onClick={() => handleTabChange("pending")}
          className="h-9 px-4 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-1 shadow-sm shrink-0 cursor-pointer self-stretch lg:self-auto select-none border-none"
        >
          Xem hồ sơ chờ
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>

        {/* 3.2 Main Filter Form */}
        <section className="rounded-[6px] border border-hairline bg-paper p-3.5 sm:p-4 shadow-subtle mb-4 sm:mb-5">
          <form
            onSubmit={handleApplyFilters}
            id="filter-form"
            className="flex flex-col gap-3 w-full min-w-0"
          >
            <div className="flex flex-wrap items-center gap-[10px] w-full min-w-0">
              {/* TÌM KIẾM */}
              <div className="relative w-full sm:w-[360px] max-w-full h-[33px] shrink-0">
                <svg
                  className="w-3.5 h-3.5 text-mid-gray absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  id="filter-search"
                  value={formSearch}
                  onChange={(e) => setFormSearch(e.target.value)}
                  placeholder="Tên, email, số điện thoại..."
                  className="w-full h-full pl-9 pr-3 text-xs bg-canvas border border-hairline rounded-full focus:outline-none focus:border-ink transition-colors text-ink placeholder:text-mid-gray/70"
                />
              </div>

              {/* TRẠNG THÁI HỒ SƠ */}
              <div className="w-full sm:w-[170px] max-w-full shrink-0">
                <FilterSelect
                  label=""
                  value={formStatus}
                  options={statusOptions}
                  onChange={(val) => {
                    setFormStatus(val);
                    updateFilters({ status: val, page: 1 });
                  }}
                  placeholder="Tất cả trạng thái"
                  id="upgrade-status"
                  activeId={activeFilterDropdown}
                  setActiveId={setActiveFilterDropdown}
                  className="w-full h-[33px]"
                />
              </div>

              {/* Action Group */}
              <div className="flex items-center gap-2 xl:ml-auto w-full xl:w-auto justify-end shrink-0">
                {/* Reset Button */}
                {(searchParam || statusParam || datePresetParam || sortByParam !== "newest") && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="h-[33px] px-2.5 flex items-center justify-center gap-1.5 rounded-full text-[12px] font-medium text-danger-brick hover:text-red-700 hover:bg-red-50/50 transition-colors"
                    title="Đặt lại bộ lọc"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Đặt lại</span>
                  </button>
                )}

                {/* Filter Popover Button */}
                <div className="relative shrink-0" ref={filterPopoverRef}>
                  <button
                    type="button"
                    onClick={() => setFilterPopoverOpen(!filterPopoverOpen)}
                    aria-label="Bộ lọc"
                    className={`relative flex items-center justify-center w-[33px] h-[33px] rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-ink ${
                      filterPopoverOpen || (datePresetParam || sortByParam !== "newest")
                        ? "bg-canvas border-ink text-ink shadow-sm"
                        : "bg-paper border-hairline text-mid-gray hover:bg-canvas hover:text-ink"
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5 text-ink" />
                    {((datePresetParam ? 1 : 0) + (sortByParam !== "newest" ? 1 : 0)) > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                        {(datePresetParam ? 1 : 0) + (sortByParam !== "newest" ? 1 : 0)}
                      </span>
                    )}
                  </button>

                  {/* Popover Content */}
                  {filterPopoverOpen && (
                    <div className="absolute right-0 top-full mt-2 w-[260px] z-50 bg-paper border border-hairline rounded-[12px] shadow-lg p-4 animate-in fade-in zoom-in-95 duration-100 text-left">
                      <div className="space-y-4">
                        {/* THỜI GIAN */}
                        <div>
                          <label className="block text-[11px] font-bold text-mid-gray uppercase tracking-wider mb-2">
                            Thời gian
                          </label>
                          <FilterSelect
                            label=""
                            value={formDatePreset}
                            options={timeOptions}
                            onChange={(val) => {
                              setFormDatePreset(val);
                              if (val !== "custom") {
                                setFormDateFrom("");
                                setFormDateTo("");
                                updateFilters({ date_preset: val, date_from: "", date_to: "", page: 1 });
                              }
                            }}
                            placeholder="Tất cả thời gian"
                            id="upgrade-time"
                            activeId={activeFilterDropdown}
                            setActiveId={setActiveFilterDropdown}
                            className="w-full h-[33px]"
                          />
                        </div>

                        {/* SẮP XẾP THEO */}
                        <div>
                          <label className="block text-[11px] font-bold text-mid-gray uppercase tracking-wider mb-2">
                            Sắp xếp theo
                          </label>
                          <FilterSelect
                            label=""
                            value={formSortBy}
                            options={sortOptions}
                            onChange={(val) => {
                              setFormSortBy(val);
                              updateFilters({ sort_by: val, page: 1 });
                            }}
                            placeholder="Mới nhất"
                            id="upgrade-sort"
                            activeId={activeFilterDropdown}
                            setActiveId={setActiveFilterDropdown}
                            className="w-full h-[33px]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Date Picker Row (only when formDatePreset === 'custom') */}
            {formDatePreset === "custom" && (
              <div
                id="custom-date-group"
                className="flex flex-wrap items-center gap-3 pt-3 border-t border-hairline/60"
              >
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="filter-date-from"
                    className="text-xs text-mid-gray font-medium"
                  >
                    Từ ngày:
                  </label>
                  <input
                    type="date"
                    id="filter-date-from"
                    value={formDateFrom}
                    onChange={(e) => setFormDateFrom(e.target.value)}
                    className="h-[33px] px-3 text-xs bg-canvas border border-hairline rounded-[6px] outline-none text-ink font-semibold"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="filter-date-to"
                    className="text-xs text-mid-gray font-medium"
                  >
                    Đến ngày:
                  </label>
                  <input
                    type="date"
                    id="filter-date-to"
                    value={formDateTo}
                    onChange={(e) => setFormDateTo(e.target.value)}
                    className="h-[33px] px-3 text-xs bg-canvas border border-hairline rounded-[6px] outline-none text-ink font-semibold"
                  />
                </div>

              </div>
            )}
          </form>
        </section>

      {/* 3. Main Board Section */}
      <section
        id="upgrade-list-section"
        style={{ scrollMarginTop: "16px" }}
        className="rounded-[6px] border border-hairline bg-paper shadow-subtle flex flex-col"
      >
        {/* Quick Tabs */}
        <div
          className="border-b border-hairline bg-surface-alt/40 flex items-center overflow-x-auto scrollbar-none"
          id="quick-tabs-container"
        >
          <button
            type="button"
            onClick={() => handleTabChange("")}
            className={cn(
              "px-5 py-3 text-xs select-none whitespace-nowrap cursor-pointer transition-all border-none bg-transparent",
              !statusParam
                ? "font-semibold border-b-2 border-ink text-ink"
                : "font-medium text-mid-gray hover:text-ink",
            )}
          >
            Tất cả (<span className="tab-count">{summary.total}</span>)
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("pending")}
            className={cn(
              "px-5 py-3 text-xs select-none whitespace-nowrap cursor-pointer transition-all border-none bg-transparent",
              statusParam === "pending"
                ? "font-semibold border-b-2 border-ink text-ink"
                : "font-medium text-mid-gray hover:text-ink",
            )}
          >
            Chờ xử lý (<span className="tab-count">{summary.pending}</span>)
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("approved")}
            className={cn(
              "px-5 py-3 text-xs select-none whitespace-nowrap cursor-pointer transition-all border-none bg-transparent",
              statusParam === "approved"
                ? "font-semibold border-b-2 border-ink text-ink"
                : "font-medium text-mid-gray hover:text-ink",
            )}
          >
            Đã duyệt (<span className="tab-count">{summary.approved}</span>)
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("rejected")}
            className={cn(
              "px-5 py-3 text-xs select-none whitespace-nowrap cursor-pointer transition-all border-none bg-transparent",
              statusParam === "rejected"
                ? "font-semibold border-b-2 border-ink text-ink"
                : "font-medium text-mid-gray hover:text-ink",
            )}
          >
            Đã từ chối (<span className="tab-count">{summary.rejected}</span>)
          </button>
        </div>

        {/* 3.3 Active Filter Chips */}
        {(searchParam ||
          statusParam ||
          dateFromParam ||
          dateToParam ||
          experienceRangeParam ||
          payoutFilterParam ||
          datePresetParam) && (
          <div
            id="filter-chips-container"
            className="flex flex-wrap items-center gap-2 p-3 bg-canvas/35 border-b border-hairline text-xs select-none"
          >
            <span className="text-mid-gray text-[10px] font-bold uppercase tracking-wider mr-1">
              Bộ lọc đang dùng:
            </span>
            <div id="filter-chips-list" className="flex flex-wrap gap-1.5">
              {searchParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas border border-hairline text-ink">
                  Từ khóa: "{searchParam}"
                  <button
                    type="button"
                    onClick={() => updateFilters({ search: "" })}
                    className="text-mid-gray hover:text-ink ml-1 font-bold bg-transparent border-none cursor-pointer text-xs"
                  >
                    ×
                  </button>
                </span>
              )}
              {statusParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas border border-hairline text-ink">
                  Trạng thái:{" "}
                  {statusParam === "pending"
                    ? "Chờ xử lý"
                    : statusParam === "approved"
                      ? "Đã duyệt"
                      : "Đã từ chối"}
                  <button
                    type="button"
                    onClick={() => updateFilters({ status: "" })}
                    className="text-mid-gray hover:text-ink ml-1 font-bold bg-transparent border-none cursor-pointer text-xs"
                  >
                    ×
                  </button>
                </span>
              )}
              {datePresetParam ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas border border-hairline text-ink">
                  Ngày gửi:{" "}
                  {datePresetParam === "today"
                    ? "Hôm nay"
                    : datePresetParam === "7_days"
                      ? "7 ngày qua"
                      : datePresetParam === "30_days"
                        ? "30 ngày qua"
                        : "Tùy chọn"}
                  <button
                    type="button"
                    onClick={() =>
                      updateFilters({
                        date_preset: "",
                        date_from: "",
                        date_to: "",
                      })
                    }
                    className="text-mid-gray hover:text-ink ml-1 font-bold bg-transparent border-none cursor-pointer text-xs"
                  >
                    ×
                  </button>
                </span>
              ) : (
                <>
                  {dateFromParam && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas border border-hairline text-ink">
                      Từ ngày: {dateFromParam}
                      <button
                        type="button"
                        onClick={() => updateFilters({ date_from: "" })}
                        className="text-mid-gray hover:text-ink ml-1 font-bold bg-transparent border-none cursor-pointer text-xs"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {dateToParam && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas border border-hairline text-ink">
                      Đến ngày: {dateToParam}
                      <button
                        type="button"
                        onClick={() => updateFilters({ date_to: "" })}
                        className="text-mid-gray hover:text-ink ml-1 font-bold bg-transparent border-none cursor-pointer text-xs"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </>
              )}
              {experienceRangeParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas border border-hairline text-ink">
                  Kinh nghiệm:{" "}
                  {experienceRangeParam === "under_1"
                    ? "Dưới 1 năm"
                    : experienceRangeParam === "1_2"
                      ? "1–2 năm"
                      : experienceRangeParam === "3_5"
                        ? "3–5 năm"
                        : "Trên 5 năm"}
                  <button
                    type="button"
                    onClick={() => updateFilters({ experience_range: "" })}
                    className="text-mid-gray hover:text-ink ml-1 font-bold bg-transparent border-none cursor-pointer text-xs"
                  >
                    ×
                  </button>
                </span>
              )}
              {payoutFilterParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-canvas border border-hairline text-ink">
                  Tài khoản:{" "}
                  {payoutFilterParam === "linked"
                    ? "Đã liên kết"
                    : payoutFilterParam === "unlinked"
                      ? "Chưa liên kết"
                      : payoutFilterParam === "active"
                        ? "Đã kích hoạt"
                        : "Chờ xác minh"}
                  <button
                    type="button"
                    onClick={() => updateFilters({ payout_filter: "" })}
                    className="text-mid-gray hover:text-ink ml-1 font-bold bg-transparent border-none cursor-pointer text-xs"
                  >
                    ×
                  </button>
                </span>
              )}
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

        {/* 3.4 Data Table */}
        <div className="overflow-x-auto relative flex-1 custom-scrollbar min-h-[450px]">
          <table className="w-full text-left border-collapse text-xs table-auto min-w-[1210px]">
            <colgroup>
              <col className="w-[220px]" />
              <col className="w-[170px]" />
              <col className="w-[260px]" />
              <col className="w-[120px]" />
              <col className="w-[190px]" />
              <col className="w-[130px]" />
              <col className="w-[120px]" />
            </colgroup>
            <thead className="bg-surface-alt text-mid-gray border-b border-hairline uppercase tracking-wider font-semibold sticky top-0 z-10 text-[10px] select-none h-10">
              <tr>
                {/* Column header: Người đăng ký */}
                <th className="p-3.5 pl-5 relative" data-column-menu>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveColumnMenu(
                        activeColumnMenu === "user" ? null : "user",
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none text-[10px] uppercase",
                      ["name_asc", "name_desc", "newest", "oldest"].includes(
                        sortByParam,
                      )
                        ? "text-blue-600"
                        : "text-mid-gray",
                    )}
                  >
                    Người đăng ký
                    <svg
                      className="w-3 h-3 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {activeColumnMenu === "user" && (
                    <div className="absolute left-5 top-9 z-30 w-52 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left font-normal normal-case">
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "name_asc" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          sortByParam === "name_asc" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Từ A đến Z (↑)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "name_desc" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          sortByParam === "name_desc" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Từ Z đến A (↓)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "newest" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          sortByParam === "newest" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Mới đăng ký gần đây
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "oldest" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          sortByParam === "oldest" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Cũ nhất
                      </button>
                      <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "" });
                          setActiveColumnMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-danger-brick rounded-[4px] transition-colors font-semibold cursor-pointer border-none bg-transparent"
                      >
                        Bỏ sắp xếp
                      </button>
                    </div>
                  )}
                </th>

                {/* Column header: Thông tin liên hệ (No filter menu as requested) */}
                <th className="p-3.5 font-bold">Thông tin liên hệ</th>

                {/* Column header: Chuyên môn */}
                <th className="p-3.5 relative" data-column-menu>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveColumnMenu(
                        activeColumnMenu === "expertise" ? null : "expertise",
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none text-[10px] uppercase",
                      ["specialty_asc", "specialty_desc"].includes(sortByParam)
                        ? "text-blue-600"
                        : "text-mid-gray",
                    )}
                  >
                    Chuyên môn
                    <svg
                      className="w-3 h-3 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {activeColumnMenu === "expertise" && (
                    <div className="absolute left-3.5 top-9 z-30 w-48 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left font-normal normal-case">
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "specialty_asc" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          sortByParam === "specialty_asc" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Chuyên môn A–Z
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "specialty_desc" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          sortByParam === "specialty_desc" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Chuyên môn Z–A
                      </button>
                      <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "" });
                          setActiveColumnMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-danger-brick rounded-[4px] transition-colors font-semibold cursor-pointer border-none bg-transparent"
                      >
                        Bỏ sắp xếp
                      </button>
                    </div>
                  )}
                </th>

                {/* Column header: Kinh nghiệm */}
                <th className="p-3.5 relative" data-column-menu>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveColumnMenu(
                        activeColumnMenu === "experience" ? null : "experience",
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none text-[10px] uppercase",
                      experienceRangeParam ||
                        ["experience_asc", "experience_desc"].includes(
                          sortByParam,
                        )
                        ? "text-blue-600"
                        : "text-mid-gray",
                    )}
                  >
                    Kinh nghiệm
                    <svg
                      className="w-3 h-3 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {activeColumnMenu === "experience" && (
                    <div className="absolute left-3.5 top-9 z-30 w-56 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left font-normal normal-case">
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ experience_range: "" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700 flex items-center gap-2",
                          !experienceRangeParam &&
                            !["experience_asc", "experience_desc"].includes(
                              sortByParam,
                            ) &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        <span className="h-[7px] w-[7px] rounded-full bg-neutral-400"></span>
                        Tất cả kinh nghiệm
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ experience_range: "under_1" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700 flex items-center gap-2",
                          experienceRangeParam === "under_1" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        <span className="h-[7px] w-[7px] rounded-full bg-neutral-400"></span>
                        Dưới 1 năm
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ experience_range: "1_2" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent flex items-center gap-2",
                          experienceRangeParam === "1_2"
                            ? "bg-blue-50/40 text-blue-600 font-bold"
                            : "text-blue-600",
                        )}
                      >
                        <span className="h-[7px] w-[7px] rounded-full bg-blue-600"></span>
                        Từ 1–2 năm
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ experience_range: "3_5" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent flex items-center gap-2",
                          experienceRangeParam === "3_5"
                            ? "bg-blue-50/40 text-amber-600 font-bold"
                            : "text-amber-600",
                        )}
                      >
                        <span className="h-[7px] w-[7px] rounded-full bg-amber-600"></span>
                        Từ 3–5 năm
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ experience_range: "over_5" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent flex items-center gap-2",
                          experienceRangeParam === "over_5"
                            ? "bg-blue-50/40 text-emerald-600 font-bold"
                            : "text-emerald-600",
                        )}
                      >
                        <span className="h-[7px] w-[7px] rounded-full bg-emerald-600"></span>
                        Trên 5 năm
                      </button>
                      <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "experience_asc" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-purple-600",
                          sortByParam === "experience_asc" &&
                            "bg-blue-50/40 text-purple-600 font-bold",
                        )}
                      >
                        Kinh nghiệm tăng dần (↑)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "experience_desc" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-purple-600",
                          sortByParam === "experience_desc" &&
                            "bg-blue-50/40 text-purple-600 font-bold",
                        )}
                      >
                        Kinh nghiệm giảm dần (↓)
                      </button>
                      <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({
                            experience_range: "",
                            sort_by: sortByParam.includes("experience")
                              ? ""
                              : sortByParam,
                          });
                          setActiveColumnMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-danger-brick rounded-[4px] transition-colors font-semibold cursor-pointer border-none bg-transparent"
                      >
                        Bỏ lọc và sắp xếp
                      </button>
                    </div>
                  )}
                </th>

                {/* Column header: Tài khoản nhận tiền */}
                <th className="p-3.5 relative" data-column-menu>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveColumnMenu(
                        activeColumnMenu === "payout" ? null : "payout",
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none text-[10px] uppercase",
                      payoutFilterParam ? "text-blue-600" : "text-mid-gray",
                    )}
                  >
                    Tài khoản nhận tiền
                    <svg
                      className="w-3 h-3 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {activeColumnMenu === "payout" && (
                    <div className="absolute left-3.5 top-9 z-30 w-44 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left font-normal normal-case">
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ payout_filter: "" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          !payoutFilterParam &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Tất cả
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ payout_filter: "linked" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          payoutFilterParam === "linked" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Đã liên kết
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ payout_filter: "unlinked" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          payoutFilterParam === "unlinked" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Chưa liên kết
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ payout_filter: "active" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          payoutFilterParam === "active" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Đã kích hoạt
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({
                            payout_filter: "pending_verification",
                          });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          payoutFilterParam === "pending_verification" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Chờ xác minh
                      </button>
                      <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ payout_filter: "" });
                          setActiveColumnMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-danger-brick rounded-[4px] transition-colors font-semibold cursor-pointer border-none bg-transparent"
                      >
                        Bỏ lọc
                      </button>
                    </div>
                  )}
                </th>

                {/* Column header: Ngày gửi */}
                <th className="p-3.5 relative" data-column-menu>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveColumnMenu(
                        activeColumnMenu === "date" ? null : "date",
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none text-[10px] uppercase",
                      datePresetParam ||
                        ["newest", "oldest"].includes(sortByParam)
                        ? "text-blue-600"
                        : "text-mid-gray",
                    )}
                  >
                    Ngày gửi
                    <svg
                      className="w-3 h-3 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {activeColumnMenu === "date" && (
                    <div className="absolute left-3.5 top-9 z-30 w-48 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left font-normal normal-case">
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "newest", date_preset: "" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          sortByParam === "newest" &&
                            !datePresetParam &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Mới nhất
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ sort_by: "oldest", date_preset: "" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          sortByParam === "oldest" &&
                            !datePresetParam &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Cũ nhất
                      </button>
                      <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ date_preset: "today" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          datePresetParam === "today" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Hôm nay
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ date_preset: "7_days" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          datePresetParam === "7_days" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        7 ngày qua
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ date_preset: "30_days" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          datePresetParam === "30_days" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        30 ngày qua
                      </button>
                      <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveColumnMenu(null);
                          document.getElementById("filter-date-from")?.focus();
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700"
                      >
                        Tùy chọn khoảng ngày
                      </button>
                      <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({
                            date_preset: "",
                            date_from: "",
                            date_to: "",
                            sort_by: "",
                          });
                          setActiveColumnMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-danger-brick rounded-[4px] transition-colors font-semibold cursor-pointer border-none bg-transparent"
                      >
                        Bỏ lọc/sắp xếp
                      </button>
                    </div>
                  )}
                </th>

                {/* Column header: Trạng thái */}
                <th className="p-3.5 relative" data-column-menu>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveColumnMenu(
                        activeColumnMenu === "status" ? null : "status",
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none text-[10px] uppercase",
                      statusParam ? "text-blue-600" : "text-mid-gray",
                    )}
                  >
                    Trạng thái
                    <svg
                      className="w-3 h-3 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {activeColumnMenu === "status" && (
                    <div className="absolute right-5 top-9 z-30 w-40 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left font-normal normal-case">
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ status: "" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          !statusParam &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Tất cả
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ status: "pending" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          statusParam === "pending" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Chờ xử lý
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ status: "approved" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          statusParam === "approved" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Đã duyệt
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ status: "rejected" });
                          setActiveColumnMenu(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent text-neutral-700",
                          statusParam === "rejected" &&
                            "bg-blue-50/40 text-blue-600 font-bold",
                        )}
                      >
                        Đã từ chối
                      </button>
                      <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
                      <button
                        type="button"
                        onClick={() => {
                          updateFilters({ status: "" });
                          setActiveColumnMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-danger-brick rounded-[4px] transition-colors font-semibold cursor-pointer border-none bg-transparent"
                      >
                        Bỏ lọc
                      </button>
                    </div>
                  )}
                </th>

                </tr>
            </thead>
            <tbody
              id="upgrades-table-body"
              className="divide-y divide-hairline"
            >
              {loading ? (
                // Skeletons loading state
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse h-[72px]">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-canvas skeleton shrink-0"></div>
                        <div className="space-y-1.5 flex-grow">
                          <div className="h-3 w-24 bg-canvas rounded skeleton"></div>
                          <div className="h-2.5 w-32 bg-canvas rounded skeleton"></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="h-3.5 w-20 bg-canvas rounded skeleton"></div>
                    </td>
                    <td className="p-3.5">
                      <div className="h-3.5 w-28 bg-canvas rounded skeleton"></div>
                    </td>
                    <td className="p-3.5">
                      <div className="h-3.5 w-16 bg-canvas rounded skeleton"></div>
                    </td>
                    <td className="p-3.5">
                      <div className="h-3.5 w-24 bg-canvas rounded skeleton"></div>
                    </td>
                    <td className="p-3.5">
                      <div className="h-3.5 w-24 bg-canvas rounded skeleton"></div>
                    </td>
                    <td className="p-3.5">
                      <div className="h-3.5 w-16 bg-canvas rounded skeleton"></div>
                    </td>
                    <td className="p-3.5"></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <svg
                        className="w-10 h-10 text-danger-brick/80 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-sm font-bold text-danger-brick">
                          Không thể tải dữ liệu
                        </h4>
                        <p className="text-xs text-mid-gray mt-1">{error}</p>
                      </div>
                      <button
                        type="button"
                        onClick={loadData}
                        className="h-8 px-4 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
                      >
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                // Empty state or Filter empty state
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 select-none">
                      <svg
                        className="w-10 h-10 text-mid-gray/50 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-sm font-bold text-ink">
                          {searchParam ||
                          statusParam ||
                          dateFromParam ||
                          dateToParam ||
                          experienceRangeParam ||
                          payoutFilterParam ||
                          datePresetParam
                            ? "Không tìm thấy yêu cầu phù hợp"
                            : "Chưa có yêu cầu lên giảng viên"}
                        </h4>
                        <p className="text-xs text-mid-gray mt-1">
                          {searchParam ||
                          statusParam ||
                          dateFromParam ||
                          dateToParam ||
                          experienceRangeParam ||
                          payoutFilterParam ||
                          datePresetParam
                            ? "Không tìm thấy hồ sơ phù hợp với bộ lọc."
                            : "Các hồ sơ đăng ký mới sẽ xuất hiện tại đây."}
                        </p>
                      </div>
                      {(searchParam ||
                        statusParam ||
                        dateFromParam ||
                        dateToParam ||
                        experienceRangeParam ||
                        payoutFilterParam ||
                        datePresetParam) && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="h-8 px-4 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
                        >
                          Đặt lại bộ lọc
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item: any) => {
                  const firstLetter = item.user?.full_name
                    ? item.user.full_name.charAt(0).toUpperCase()
                    : "U";
                  const isPending = item.application_status === "pending";
                  const rawExpertise =
                    item.instructor_profile?.expertise || "Chưa cập nhật";

                  // Truncate specialty to 1-2 lines concisely
                  const displayExpertise =
                    rawExpertise.length > 40
                      ? `${rawExpertise.substring(0, 38)}...`
                      : rawExpertise;

                  // Map experience colors
                  const expColor = getExperienceColor(
                    item.instructor_profile?.experience_years || 0,
                  );

                  return (
                    <tr
                      key={item.user?.id}
                      onClick={() => openDetailDrawer(item.user?.id)}
                      className="hover:bg-canvas/50 transition-colors group cursor-pointer border-b border-hairline/60 h-[72px]"
                    >
                      {/* Subscriber Name Card */}
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            fullName={item.user?.full_name}
                            avatarUrl={item.user?.avatar_url}
                            size="md"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-ink text-sm sm:text-xs leading-tight flex items-center">
                              {item.user?.full_name}
                            </div>
                            <div className="text-[10px] text-mid-gray mt-0.5 truncate">
                              {item.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-3.5">
                        <div className="font-mono text-[11px] text-ink">
                          {item.user?.phone || "---"}
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {item.user?.email_verified_at ? (
                            <span className="text-success font-medium flex items-center gap-0.5">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m4.5 12.75 6 6 9-13.5"
                                />
                              </svg>
                              Đã xác minh
                            </span>
                          ) : (
                            <span className="text-mid-gray font-normal">
                              Chưa xác minh
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Expertise (Clean formatting, no badges, truncated) */}
                      <td className="p-3.5">
                        <div
                          className="font-medium text-ink max-w-[200px] truncate"
                          title={rawExpertise}
                        >
                          {displayExpertise}
                        </div>
                      </td>

                      {/* Experience & Rank (Medal + Years) */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 justify-center">
                          <div
                            className={cn(
                              "font-semibold flex items-center gap-1.5 text-xs select-none",
                              expColor.color,
                            )}
                          >
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full shrink-0",
                                expColor.bg,
                              )}
                            ></span>
                            {item.instructor_profile?.experience_years ?? 0} năm KN
                          </div>
                          <div>
                            <RankBadge rank={item.instructor_profile?.level || item.instructor_profile?.instructor_rank} />
                          </div>
                        </div>
                      </td>

                      {/* Payout Account */}
                      <td className="p-3.5">
                        {item.payout_account ? (
                          <div className="space-y-1">
                            <BankBadge provider={item.payout_account.provider} />
                            <div className="text-[10px] text-mid-gray truncate max-w-[150px]">
                              {item.payout_account.account_name}
                            </div>
                            <div className="text-[10px] font-mono text-mid-gray font-medium tracking-wide">
                              {item.payout_account.account_number_masked}
                            </div>
                            <div>
                              <PayoutStatusMarker
                                status={item.payout_account.status}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-mid-gray/50 italic select-none">
                            Chưa liên kết
                          </span>
                        )}
                      </td>

                      {/* Date Submitted */}
                      <td className="p-3.5 text-mid-gray text-[11px]">
                        {formatDateTime(item.submitted_at)}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <UpgradeStatusMarker
                          status={item.application_status}
                          isResubmission={item.is_resubmission}
                        />
                      </td>

                      {/* Actions */}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 3.5 Pagination Footer */}
        {!loading && meta && (
          <AdminPagination
            currentPage={pageParam}
            perPage={perPageParam}
            total={meta.total ?? 0}
            onPageChange={(p) => updateFilters({ page: p })}
            onPerPageChange={(pp) => updateFilters({ per_page: pp, page: 1 })}
            itemLabel="yêu cầu"
          />
        )}
      </section>

      {/* DRAWER: DETAILS INFO VIEW */}
      {isDrawerOpen && activeDetailUser && (
        <>
          <div
            onClick={closeDetailDrawer}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          />
          <div
            id="upgrade-detail-drawer"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-paper border-l border-hairline shadow-subtle flex flex-col h-full animate-in slide-in-from-right duration-300"
          >
            {/* Drawer Header */}
            <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-hairline">
              <h2 className="text-sm font-bold text-ink">
                Chi tiết hồ sơ đăng ký
              </h2>
              <button
                type="button"
                onClick={closeDetailDrawer}
                className="p-1.5 hover:bg-canvas rounded-full text-mid-gray hover:text-ink transition-colors cursor-pointer bg-transparent border-none"
              >
                <svg
                  className="w-4.5 h-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
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

            {/* Scrollable Content */}
            <div className="flex-grow overflow-y-auto p-5 space-y-6 custom-scrollbar text-xs">
              {/* Header profile card */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <UserAvatar
                    fullName={activeDetailUser.user?.full_name}
                    avatarUrl={activeDetailUser.user?.avatar_url}
                    size="lg"
                  />
                  <div className="space-y-0.5">
                    <h3 className="text-base font-semibold text-ink flex items-center">
                      {activeDetailUser.user?.full_name}
                    </h3>
                    <p className="text-xs text-mid-gray">
                      {activeDetailUser.user?.email}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {activeDetailUser.user?.role === "admin" ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-ink text-white rounded">
                          Quản trị viên
                        </span>
                      ) : activeDetailUser.user?.role === "instructor" ? (
                        <span className="px-2 py-0.5 text-[9px] font-medium text-success border border-success/20 bg-success-soft/20 rounded">
                          Giảng viên
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] font-medium text-mid-gray border border-hairline bg-canvas rounded">
                          Học viên
                        </span>
                      )}

                      {activeDetailUser.application_status === "pending" ? (
                        <span className="px-2 py-0.5 text-[9px] font-semibold text-warning border border-warning/20 bg-warning-soft/20 rounded">
                          Hồ sơ chờ xử lý
                        </span>
                      ) : activeDetailUser.application_status === "approved" ? (
                        <span className="px-2 py-0.5 text-[9px] font-semibold text-success border border-success/20 bg-success-soft/20 rounded">
                          Đã phê duyệt
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] font-semibold text-danger-brick border border-danger-brick/20 bg-danger-brick-soft/20 rounded">
                          Bị từ chối
                        </span>
                      )}

                      {activeDetailUser.is_resubmission && (
                        <span className="px-2 py-0.5 text-[9px] font-semibold text-sky-700 border border-sky-200 bg-sky-50 rounded">
                          Hồ sơ nộp lại
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/users?open_user_id=${activeDetailUser.user?.id}`)}
                  className="px-3 py-1 text-[11px] font-semibold rounded-[4px] border border-hairline bg-paper hover:bg-surface-alt text-ink transition-colors cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
                >
                  Xem chi tiết
                </button>
              </div>

              {/* SECTION 1: Người dùng */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">
                  Thông tin người dùng
                </h4>
                <div className="rounded-[6px] border border-hairline bg-surface-alt p-3.5 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Họ và tên:</span>
                    <span className="font-semibold text-ink">
                      {activeDetailUser.user?.full_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Email đăng ký:</span>
                    <span className="font-medium text-ink">
                      {activeDetailUser.user?.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Số điện thoại:</span>
                    <span className="font-medium text-ink">
                      {activeDetailUser.user?.phone || "---"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Xác minh email:</span>
                    <span className="font-medium text-ink">
                      {activeDetailUser.user?.email_verified_at
                        ? formatDateTime(
                            activeDetailUser.user.email_verified_at,
                          )
                        : "Chưa xác minh"}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Chuyên môn */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">
                  Hồ sơ chuyên môn
                </h4>
                <div className="rounded-[6px] border border-hairline bg-surface-alt p-3.5 space-y-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-mid-gray">Giới thiệu bản thân:</span>
                    <p className="font-medium text-ink leading-relaxed bg-paper p-2.5 rounded border border-hairline">
                      {activeDetailUser.instructor_profile?.bio ||
                        "Không có giới thiệu bản thân."}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Lĩnh vực chuyên sâu:</span>
                    <span
                      className="font-semibold text-ink text-right max-w-[240px] truncate"
                      title={activeDetailUser.instructor_profile?.expertise}
                    >
                      {activeDetailUser.instructor_profile?.expertise || "---"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-mid-gray">
                      Kinh nghiệm giảng dạy:
                    </span>
                    <span className="font-semibold text-ink">
                      {activeDetailUser.instructor_profile?.experience_years}{" "}
                      năm kinh nghiệm
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-mid-gray">Phân cấp chuyên môn:</span>
                    <div>
                      <RankBadge rank={activeDetailUser.instructor_profile?.level || activeDetailUser.instructor_profile?.instructor_rank} />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Tài khoản nhận tiền */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">
                    Tài khoản nhận tiền
                  </h4>
                  {activeDetailUser.payout_account && (
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/payout-accounts?open_payout_account_id=${activeDetailUser.payout_account.id}`)}
                      className="px-3 py-1 text-[11px] font-semibold rounded-[4px] border border-hairline bg-paper hover:bg-surface-alt text-ink transition-colors cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
                    >
                      Xem chi tiết
                    </button>
                  )}
                </div>
                {activeDetailUser.payout_account ? (
                  <div className="rounded-[6px] border border-hairline bg-surface-alt p-3.5 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-mid-gray">
                        Ngân hàng thụ hưởng:
                      </span>
                      <BankBadge provider={activeDetailUser.payout_account.provider} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mid-gray">Tên chủ tài khoản:</span>
                      <span className="font-semibold text-ink">
                        {activeDetailUser.payout_account.account_name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-mid-gray">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-ink tracking-wide font-semibold">
                          {isPayoutVisible
                            ? activeDetailUser.payout_account.account_number
                            : activeDetailUser.payout_account
                                .account_number_masked}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsPayoutVisible(!isPayoutVisible)}
                          className="text-mid-gray hover:text-ink transition-colors p-1 rounded-full cursor-pointer bg-transparent border-none"
                          aria-label={
                            isPayoutVisible
                              ? "Ẩn số tài khoản"
                              : "Hiện số tài khoản"
                          }
                        >
                          {isPayoutVisible ? (
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                              />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mid-gray">
                        Trạng thái liên kết:
                      </span>
                      <PayoutStatusMarker
                        status={activeDetailUser.payout_account.status}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mid-gray">Ngày kết nối:</span>
                      <span className="font-medium text-ink">
                        {formatDateTime(
                          activeDetailUser.payout_account.connected_at,
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[6px] border border-hairline bg-surface-alt p-4 text-center italic text-mid-gray/60">
                    Chưa bổ sung thông tin tài khoản nhận tiền.
                  </div>
                )}
              </div>

              {/* SECTION 4: Thông tin xử lý */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">
                  Trạng thái & Lịch sử xử lý
                </h4>
                <div className="rounded-[6px] border border-hairline bg-surface-alt p-3.5 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Trạng thái hồ sơ:</span>
                    <UpgradeStatusMarker
                      status={activeDetailUser.application_status}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid-gray">Ngày gửi hồ sơ:</span>
                    <span className="font-semibold text-ink">
                      {formatDateTime(activeDetailUser.submitted_at)}
                    </span>
                  </div>
                  {activeDetailUser.application_status !== "pending" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-mid-gray">Ngày xử lý duyệt:</span>
                        <span className="font-semibold text-ink">
                          {formatDateTime(activeDetailUser.reviewed_at)}
                        </span>
                      </div>
                      {activeDetailUser.review_note && (
                        <div className="flex flex-col gap-1.5 pt-1.5 border-t border-hairline/60">
                          <span className="text-mid-gray">
                            Ghi chú phê duyệt:
                          </span>
                          <p className="p-2.5 bg-paper rounded border border-hairline leading-relaxed font-medium">
                            {activeDetailUser.review_note}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer actions inside drawer */}
            <div className="p-4 border-t border-hairline bg-surface-alt flex flex-wrap gap-2 justify-end shrink-0">

              {activeDetailUser.application_status === "pending" ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmModal({
                        open: true,
                        type: "approve",
                        user: activeDetailUser,
                        error: "",
                      })
                    }
                    className="px-5 py-1.5 text-xs font-semibold rounded-[6px] bg-success text-white hover:opacity-90 transition-opacity cursor-pointer border-none shadow-sm"
                  >
                    Duyệt yêu cầu
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmModal({
                        open: true,
                        type: "reject",
                        user: activeDetailUser,
                        error: "",
                      })
                    }
                    className="px-5 py-1.5 text-xs font-semibold rounded-[6px] bg-danger-brick text-white hover:opacity-90 transition-opacity cursor-pointer border-none shadow-sm"
                  >
                    Từ chối yêu cầu
                  </button>
                </>
              ) : activeDetailUser.application_status === "approved" ? (
                <div className="px-4 py-1.5 text-xs font-semibold rounded-[6px] bg-success-soft text-success border border-success/20 select-none shadow-sm">
                  Yêu cầu đã được phê duyệt thành công
                </div>
              ) : (
                <div className="px-4 py-1.5 text-xs font-semibold rounded-[6px] bg-danger-brick-soft text-danger-brick border border-danger-brick/10 select-none shadow-sm">
                  Yêu cầu đã bị từ chối
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* CONFIRM ACTION MODAL: APPROVE REQUEST */}
      {confirmModal.open && confirmModal.type === "approve" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-paper border border-hairline rounded-[6px] w-full max-w-sm shadow-subtle p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-success">
                Phê duyệt yêu cầu lên Giảng viên
              </h3>
              <p className="text-xs text-mid-gray mt-1 leading-normal font-medium">
                Bạn chuẩn bị phê duyệt tài khoản{" "}
                <span className="font-semibold text-ink">
                  {confirmModal.user?.user?.full_name}
                </span>{" "}
                ({confirmModal.user?.user?.email}) làm giảng viên.
              </p>
            </div>
            <div className="rounded-[6px] border border-hairline bg-surface-alt p-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-mid-gray">Chuyên môn:</span>
                <span className="font-semibold text-ink">
                  {confirmModal.user?.instructor_profile?.expertise || "---"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mid-gray">Kinh nghiệm:</span>
                <span className="font-semibold text-ink">
                  {confirmModal.user?.instructor_profile?.experience_years} năm
                  (
                  {confirmModal.user?.instructor_profile?.level ||
                    "Chưa phân cấp"}
                  )
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mid-gray">Tài khoản nhận tiền:</span>
                <span
                  className={cn(
                    "font-semibold",
                    confirmModal.user?.payout_account?.status === "active" ||
                    confirmModal.user?.payout_account?.status === "verified" ||
                    confirmModal.user?.payout_account?.status === "pending_verification"
                      ? "text-success"
                      : "text-danger-brick",
                  )}
                >
                  {confirmModal.user?.payout_account
                    ? `Đã liên kết (${confirmModal.user.payout_account.provider})`
                    : "Chưa liên kết"}
                </span>
              </div>
              {confirmModal.error && (
                <p className="text-[10px] text-danger-brick mt-1">
                  {confirmModal.error}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({
                    open: false,
                    type: "",
                    user: null,
                    error: "",
                  })
                }
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] bg-success text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
              >
                Xác nhận duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM ACTION MODAL: REJECT REQUEST */}
      {confirmModal.open && confirmModal.type === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-paper border border-hairline rounded-[6px] w-full max-w-sm shadow-subtle p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-danger-brick">
                Từ chối yêu cầu lên Giảng viên
              </h3>
              <p className="text-xs text-mid-gray mt-1 leading-normal font-medium">
                Bạn chuẩn bị từ chối hồ sơ đăng ký của{" "}
                <span className="font-semibold text-ink">
                  {confirmModal.user?.user?.full_name}
                </span>{" "}
                ({confirmModal.user?.user?.email}).
              </p>
            </div>
            <div className="rounded-[6px] border border-hairline bg-surface-alt p-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-mid-gray">Chuyên môn đăng ký:</span>
                <span className="font-semibold text-ink">
                  {confirmModal.user?.instructor_profile?.expertise || "---"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mid-gray">Ngày gửi hồ sơ:</span>
                <span className="font-semibold text-ink">
                  {formatDateTime(confirmModal.user?.submitted_at)}
                </span>
              </div>
              {confirmModal.error && (
                <p className="text-[10px] text-danger-brick mt-1 font-medium">
                  {confirmModal.error}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="reject-upgrade-reason"
                className="block text-xs font-semibold text-ink mb-1"
              >
                Lý do từ chối <span className="text-danger-brick">*</span>
              </label>
              <textarea
                id="reject-upgrade-reason"
                rows={3}
                value={confirmModal.reason || ""}
                onChange={(e) =>
                  setConfirmModal((prev) => ({
                    ...prev,
                    reason: e.target.value,
                    error: "",
                  }))
                }
                placeholder="Nhập chi tiết lý do từ chối (bắt buộc: ví dụ thiếu chứng chỉ sư phạm, kinh nghiệm chưa phù hợp...)"
                className={cn(
                  "w-full p-2.5 text-xs bg-canvas border rounded-lg focus:ring-2 outline-none text-ink resize-none font-medium transition-all",
                  confirmModal.error
                    ? "border-danger-brick focus:ring-rose-200 focus:border-danger-brick"
                    : "border-hairline focus:ring-rose-100 focus:border-rose-400"
                )}
              />
              <p className="text-[10px] text-mid-gray mt-1">
                Lý do này sẽ được gửi tới học viên để hướng dẫn hoàn thiện lại hồ sơ.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({
                    open: false,
                    type: "",
                    user: null,
                    error: "",
                    reason: "",
                  })
                }
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={!confirmModal.reason?.trim()}
                className={cn(
                  "px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] transition-all border-none shadow-sm cursor-pointer",
                  confirmModal.reason?.trim()
                    ? "bg-danger-brick text-white hover:opacity-90"
                    : "bg-danger-brick/40 text-white/70 cursor-not-allowed"
                )}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
