import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  getOrders,
  getOrder,
  getOrderStatusMeta,
  getPaymentStatusMeta,
  isValidOrderPaymentPair
} from '@/assets/js/api/orders-api';
import { ArrowUpDown, ExternalLink, ChevronDown, Search, X } from "lucide-react";
import AdminPagination from "../shared/AdminPagination";
import FilterSelect from "./FilterSelect";
import { resolveMediaUrl } from "@/shared/utils/format";

export default function OrdersManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // --- States ---
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    total_orders: 0,
    pending_orders: 0,
    paid_orders: 0,
    failed_orders: 0,
    cancelled_orders: 0,
    expired_orders: 0,
    total_paid_amount: 0,
    average_order_value: 0,
    payment_success_rate: 0,
    incomplete_orders: 0,
    anomaly_count: 0
  });
  const [meta, setMeta] = useState<any>({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });

  // Filter States
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [status, setStatus] = useState("all"); // status tab / dropdown
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Temp Filter States (for Apply/Reset buttons)
  const [tempSearch, setTempSearch] = useState("");
  const [tempStatus, setTempStatus] = useState("all");
  const [tempPaymentStatus, setTempPaymentStatus] = useState("all");
  const [tempDatePreset, setTempDatePreset] = useState("all");
  const [tempDateFrom, setTempDateFrom] = useState("");
  const [tempDateTo, setTempDateTo] = useState("");

  // UI Dropdown/Menus states
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // Drawer details
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'payment' | 'consistency' | 'timeline'>('overview');

  // Refs for closing menus on outside click

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      // Close active row menu
      if (activeMenuId !== null && !(event.target as Element).closest('[data-no-row-click]')) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [activeMenuId]);

  // --- Fetch Data ---
  const loadData = async () => {
    setLoading(true);
    try {
      // Calculate date filters based on preset
      let finalDateFrom = dateFrom;
      let finalDateTo = dateTo;

      if (datePreset === "last_7_days") {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        finalDateFrom = d.toISOString().split('T')[0];
        finalDateTo = new Date().toISOString().split('T')[0];
      } else if (datePreset === "last_30_days") {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        finalDateFrom = d.toISOString().split('T')[0];
        finalDateTo = new Date().toISOString().split('T')[0];
      } else if (datePreset === "last_1_year") {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        finalDateFrom = d.toISOString().split('T')[0];
        finalDateTo = new Date().toISOString().split('T')[0];
      }

      const res = await getOrders({
        page,
        per_page: perPage,
        status: status === "all" ? undefined : status,
        payment_status: paymentStatus === "all" ? undefined : paymentStatus,
        search: search || undefined,
        date_from: finalDateFrom || undefined,
        date_to: finalDateTo || undefined
      });

      if (res && res.success) {
        setItems(res.data.items || []);
        setSummary(res.data.summary || {});
        setMeta(res.meta || {});
      } else {
        toast.error("Không thể tải danh sách đơn hàng.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Lỗi kết nối khi tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, perPage, status, paymentStatus, search, datePreset, dateFrom, dateTo]);

  const loadOrderDetail = async (orderId: number) => {
    setDetailLoading(true);
    setSelectedOrder(null);
    setActiveTab('overview');
    setDrawerOpen(true);

    try {
      const res = await getOrder(orderId);
      if (res && res.success) {
        setSelectedOrder(res.data);
      } else {
        toast.error("Không thể lấy chi tiết đơn hàng.");
        handleCloseDrawer();
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải chi tiết đơn hàng.");
      handleCloseDrawer();
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle deep link order detail and sync on Browser Back/Forward
  useEffect(() => {
    const openOrderId = searchParams.get("open_order_id");
    if (openOrderId) {
      const oid = Number(openOrderId);
      if (oid && (!selectedOrder || selectedOrder.id !== oid)) {
        loadOrderDetail(oid);
      }
    } else {
      if (drawerOpen) {
        setDrawerOpen(false);
        setSelectedOrder(null);
      }
    }
  }, [searchParams]);

  // --- Actions ---
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(tempSearch);
    setStatus(tempStatus);
    setPaymentStatus(tempPaymentStatus);
    setDatePreset(tempDatePreset);
    setDateFrom(tempDateFrom);
    setDateTo(tempDateTo);
    setPage(1);
    toast.success("Đã áp dụng bộ lọc");
    setTimeout(() => {
      document.getElementById('orders-table-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleResetFilters = () => {
    setTempSearch("");
    setTempStatus("all");
    setTempPaymentStatus("all");
    setTempDatePreset("all");
    setTempDateFrom("");
    setTempDateTo("");

    setSearch("");
    setStatus("all");
    setPaymentStatus("all");
    setDatePreset("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
    toast.info("Đã đặt lại bộ lọc");
    setTimeout(() => {
      document.getElementById('orders-table-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleQuickStatusTab = (statusTab: string) => {
    setStatus(statusTab);
    setTempStatus(statusTab);
    setPage(1);
    toast.success(`Đã lọc đơn hàng theo: ${getOrderStatusMeta(statusTab).label || "Tất cả"}`);
    setTimeout(() => {
      document.getElementById('orders-table-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // --- Helpers ---
  const formatVND = (amountStr: any) => {
    const num = Number(amountStr) || 0;
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
      .format(num)
      .replace("₫", "đ");
  };

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

  const handleOpenDrawer = (orderId: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("open_order_id", String(orderId));
    setSearchParams(nextParams);
    loadOrderDetail(orderId);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedOrder(null);

    if (searchParams.has("open_order_id")) {
      navigate(-1);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã đơn hàng: ${code}`);
  };

  const getToneClasses = (tone: string) => {
    if (tone === "success") return { text: "text-emerald-600", bg: "bg-emerald-500" };
    if (tone === "warning") return { text: "text-amber-600", bg: "bg-amber-500" };
    if (tone === "danger") return { text: "text-rose-600", bg: "bg-rose-500" };
    if (tone === "neutral-dark") return { text: "text-ink/80 dark:text-ink-soft/80", bg: "bg-ink/60" };
    if (tone === "info") return { text: "text-sky-600", bg: "bg-sky-500" };
    return { text: "text-mid-gray", bg: "bg-mid-gray/40" };
  };

  return (
    <>
      {/* Page Title & Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0 mb-4">
        <div>
          <nav className="flex items-center gap-1.5 text-[10px] text-mid-gray uppercase tracking-wider mb-1 font-semibold">
            <span>Dashboard</span>
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <span>Tài chính</span>
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-ink">Đơn hàng và thanh toán</span>
          </nav>
          <h1 className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-tight">
            Đơn hàng / Thanh toán
          </h1>
          <p className="text-xs text-mid-gray mt-0.5">
            Theo dõi đơn hàng, kết quả thanh toán và tính nhất quán dữ liệu giao dịch. Đang quản lý{" "}
            <span className="font-bold text-ink">{(summary.total_orders || 0).toLocaleString("vi-VN")}</span> đơn hàng trong hệ thống.
          </p>
        </div>
      </div>

      {/* 1. SUMMARY CARDS (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {/* Card 1: Tổng đơn hàng */}
        <div
          onClick={() => handleQuickStatusTab("all")}
          className={`rounded-[6px] border bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/50 transition-all cursor-pointer group ${
            status === "all" ? "border-ink border-2" : "border-hairline"
          }`}
        >
          <div className="flex items-center justify-between text-mid-gray group-hover:text-ink">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Tổng đơn hàng</span>
            <svg className="w-4 h-4 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-ink font-sans">
              {(summary.total_orders || 0).toLocaleString("vi-VN")}
            </span>
            <p className="text-[9px] text-mid-gray mt-1">Bấm để xem tất cả</p>
          </div>
        </div>

        {/* Card 2: Đã thanh toán */}
        <div
          onClick={() => handleQuickStatusTab("paid")}
          className={`rounded-[6px] border border-t-2 border-t-emerald-500 bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/50 transition-all cursor-pointer group ${
            status === "paid" ? "border-emerald-500 border-2" : "border-hairline"
          }`}
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Đã thanh toán</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-emerald-600 font-sans">
              {(summary.paid_orders || 0).toLocaleString("vi-VN")}
            </span>
            <p className="text-[9px] text-mid-gray mt-1">
              Tỷ lệ <span className="font-semibold text-ink">{summary.payment_success_rate || 0}%</span> tổng đơn
            </p>
          </div>
        </div>

        {/* Card 3: Chờ thanh toán */}
        <div
          onClick={() => handleQuickStatusTab("pending")}
          className={`rounded-[6px] border border-t-2 border-t-amber-500 bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/50 transition-all cursor-pointer group ${
            status === "pending" ? "border-amber-500 border-2" : "border-hairline"
          }`}
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Chờ thanh toán</span>
            <svg className="w-4 h-4 text-amber-500/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-amber-600 font-sans">
              {(summary.pending_orders || 0).toLocaleString("vi-VN")}
            </span>
            <p className="text-[9px] text-mid-gray mt-1">Chưa hoàn tất thanh toán</p>
          </div>
        </div>

        {/* Card 4: Thất bại */}
        <div
          onClick={() => handleQuickStatusTab("failed")}
          className={`rounded-[6px] border border-t-2 border-t-rose-500 bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/50 transition-all cursor-pointer group ${
            status === "failed" ? "border-rose-500 border-2" : "border-hairline"
          }`}
        >
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">Thất bại</span>
            <svg className="w-4 h-4 text-rose-500/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-rose-600 font-sans">
              {(summary.failed_orders || 0).toLocaleString("vi-VN")}
            </span>
            <p className="text-[9px] text-mid-gray mt-1">Giao dịch không thành công</p>
          </div>
        </div>

        {/* Card 5: Đã hủy */}
        <div
          onClick={() => handleQuickStatusTab("cancelled")}
          className={`rounded-[6px] border bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/50 transition-all cursor-pointer group ${
            status === "cancelled" ? "border-ink border-2" : "border-hairline"
          }`}
        >
          <div className="flex items-center justify-between text-mid-gray group-hover:text-ink">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Đã hủy</span>
            <svg className="w-4 h-4 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-ink font-sans">
              {(summary.cancelled_orders || 0).toLocaleString("vi-VN")}
            </span>
            <p className="text-[9px] text-mid-gray mt-1">Học viên hoặc hệ thống hủy</p>
          </div>
        </div>

        {/* Card 6: Đã hết hạn */}
        <div
          onClick={() => handleQuickStatusTab("expired")}
          className={`rounded-[6px] border bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[96px] hover:border-mid-gray/50 transition-all cursor-pointer group ${
            status === "expired" ? "border-ink border-2" : "border-hairline"
          }`}
        >
          <div className="flex items-center justify-between text-mid-gray group-hover:text-ink">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Đã hết hạn</span>
            <svg className="w-4 h-4 text-mid-gray/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M10 2h4M12 14v-4M4 10a8 8 0 1 0 16 0 8 8 0 0 0-16 0z" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-ink font-sans">
              {(summary.expired_orders || 0).toLocaleString("vi-VN")}
            </span>
            <p className="text-[9px] text-mid-gray mt-1">Quá thời hạn thanh toán</p>
          </div>
        </div>
      </div>

      {/* 2. QUICK INSIGHT BAR (5 Metrics Row) */}
      <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-hairline">
          {/* Insight 1: Tổng tiền */}
          <div className="pt-2 sm:pt-0 sm:px-2 first:px-0 flex flex-col">
            <div className="flex items-center gap-1.5 text-mid-gray">
              <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">TỔNG TIỀN ĐÃ THANH TOÁN</span>
            </div>
            <div className="mt-1">
              <span className="text-base font-bold text-ink font-sans">{formatVND(summary.total_paid_amount)}</span>
              <p className="text-[10px] text-mid-gray mt-0.5">Từ các đơn status = paid</p>
            </div>
          </div>

          {/* Insight 2: Giá trị trung bình */}
          <div className="pt-2 sm:pt-0 sm:px-3 flex flex-col">
            <div className="flex items-center gap-1.5 text-mid-gray">
              <svg className="w-3.5 h-3.5 text-ink shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect width="8" height="4" x="8" y="2" rx="1" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">GIÁ TRỊ ĐƠN TRUNG BÌNH</span>
            </div>
            <div className="mt-1">
              <span className="text-base font-bold text-ink font-sans">{formatVND(summary.average_order_value)}</span>
              <p className="text-[10px] text-mid-gray mt-0.5">Tính trên đơn đã thanh toán</p>
            </div>
          </div>

          {/* Insight 3: Tỷ lệ thành công */}
          <div className="pt-2 sm:pt-0 sm:px-3 flex flex-col">
            <div className="flex items-center gap-1.5 text-mid-gray">
              <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">TỶ LỆ THÀNH CÔNG</span>
            </div>
            <div className="mt-1">
              <span className="text-base font-bold text-emerald-600 font-sans">{summary.payment_success_rate || 0}%</span>
              <p className="text-[10px] text-mid-gray mt-0.5">Paid trên tổng đơn phát sinh</p>
            </div>
          </div>

          {/* Insight 4: Đơn không hoàn tất */}
          <div className="pt-2 sm:pt-0 sm:px-3 flex flex-col">
            <div className="flex items-center gap-1.5 text-mid-gray">
              <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">ĐƠN KHÔNG HOÀN TẤT</span>
            </div>
            <div className="mt-1">
              <span className="text-base font-bold text-ink font-sans">{summary.incomplete_orders || 0} đơn</span>
              <p className="text-[10px] text-mid-gray mt-0.5">Thất bại, hủy hoặc hết hạn</p>
            </div>
          </div>

          {/* Insight 5: Bất thường */}
          <div className="pt-2 sm:pt-0 sm:px-3 flex flex-col">
            <div className="flex items-center gap-1.5 text-mid-gray">
              <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">BẤT THƯỜNG DỮ LIỆU</span>
            </div>
            <div className="mt-1">
              <span className="text-base font-bold text-ink font-sans">{summary.anomaly_count || 0} trường hợp</span>
              <p className="text-[10px] text-mid-gray mt-0.5">Ghi danh và đối soát tương ứng</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. QUICK STATUS TABS */}
      <div className="border-b border-hairline overflow-x-auto scrollbar-none mb-4">
        <nav className="flex gap-6 min-w-max text-xs font-medium text-mid-gray">
          <button
            type="button"
            onClick={() => handleQuickStatusTab("all")}
            className={`py-2.5 border-b-2 transition-all cursor-pointer bg-transparent border-none ${
              status === "all" ? "border-ink text-ink font-semibold" : "border-transparent text-mid-gray hover:text-ink"
            }`}
          >
            Tất cả (<span>{summary.total_orders || 0}</span>)
          </button>
          <button
            type="button"
            onClick={() => handleQuickStatusTab("paid")}
            className={`py-2.5 border-b-2 transition-all cursor-pointer bg-transparent border-none ${
              status === "paid" ? "border-ink text-ink font-semibold" : "border-transparent text-mid-gray hover:text-ink"
            }`}
          >
            Đã thanh toán (<span>{summary.paid_orders || 0}</span>)
          </button>
          <button
            type="button"
            onClick={() => handleQuickStatusTab("pending")}
            className={`py-2.5 border-b-2 transition-all cursor-pointer bg-transparent border-none ${
              status === "pending" ? "border-ink text-ink font-semibold" : "border-transparent text-mid-gray hover:text-ink"
            }`}
          >
            Chờ thanh toán (<span>{summary.pending_orders || 0}</span>)
          </button>
          <button
            type="button"
            onClick={() => handleQuickStatusTab("failed")}
            className={`py-2.5 border-b-2 transition-all cursor-pointer bg-transparent border-none ${
              status === "failed" ? "border-ink text-ink font-semibold" : "border-transparent text-mid-gray hover:text-ink"
            }`}
          >
            Thất bại (<span>{summary.failed_orders || 0}</span>)
          </button>
          <button
            type="button"
            onClick={() => handleQuickStatusTab("cancelled")}
            className={`py-2.5 border-b-2 transition-all cursor-pointer bg-transparent border-none ${
              status === "cancelled" ? "border-ink text-ink font-semibold" : "border-transparent text-mid-gray hover:text-ink"
            }`}
          >
            Đã hủy (<span>{summary.cancelled_orders || 0}</span>)
          </button>
          <button
            type="button"
            onClick={() => handleQuickStatusTab("expired")}
            className={`py-2.5 border-b-2 transition-all cursor-pointer bg-transparent border-none ${
              status === "expired" ? "border-ink text-ink font-semibold" : "border-transparent text-mid-gray hover:text-ink"
            }`}
          >
            Hết hạn (<span>{summary.expired_orders || 0}</span>)
          </button>
        </nav>
      </div>

      {/* 4. DETAIL FILTERS ROW */}
      <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 mb-4 w-full min-w-0">
        <form onSubmit={handleApplyFilters}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Unified Search */}
            <div className="sm:col-span-2 lg:col-span-2">
              <label htmlFor="filter-search" className="block text-[10px] font-bold uppercase tracking-wider text-mid-gray select-none mb-1.5">TÌM KIẾM</label>
              <div className="relative">
                <input
                  type="text"
                  id="filter-search"
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  placeholder="Tìm theo mã đơn, người mua, khóa học..."
                  className="w-full h-10 pl-8 pr-8 text-xs bg-paper border border-hairline rounded-lg hover:border-mid-gray/40 focus:ring-1 focus:ring-mid-gray/40 outline-none shadow-subtle font-medium text-ink transition-all placeholder:text-mid-gray/60 placeholder:font-normal"
                />
                <Search className="w-3.5 h-3.5 text-mid-gray/80 absolute left-3 top-3.5" aria-hidden="true" />
                {tempSearch && (
                  <button
                    type="button"
                    onClick={() => setTempSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mid-gray hover:text-ink cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Trạng thái đơn */}
            <div>
              <FilterSelect
                id="filter-status"
                label="TRẠNG THÁI ĐƠN"
                value={tempStatus}
                onChange={(val) => setTempStatus(val)}
                placeholder="Tất cả trạng thái"
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "pending", label: "Chờ thanh toán", colorClass: "text-amber-600" },
                  { value: "paid", label: "Đã thanh toán", colorClass: "text-emerald-600" },
                  { value: "failed", label: "Thất bại", colorClass: "text-rose-600" },
                  { value: "cancelled", label: "Đã hủy", colorClass: "text-ink/80" },
                  { value: "expired", label: "Đã hết hạn", colorClass: "text-mid-gray" },
                ]}
              />
            </div>

            {/* Thanh toán */}
            <div>
              <FilterSelect
                id="filter-payment"
                label="THANH TOÁN"
                value={tempPaymentStatus}
                onChange={(val) => setTempPaymentStatus(val)}
                placeholder="Tất cả trạng thái"
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "unpaid", label: "Chưa thanh toán", colorClass: "text-mid-gray" },
                  { value: "processing", label: "Đang xử lý", colorClass: "text-amber-600" },
                  { value: "paid", label: "Thành công", colorClass: "text-emerald-600" },
                  { value: "failed", label: "Thất bại", colorClass: "text-rose-600" },
                  { value: "refunded", label: "Hoàn tiền", colorClass: "text-sky-600" },
                ]}
              />
            </div>

            {/* Khoảng thời gian */}
            <div>
              <FilterSelect
                id="filter-time-preset"
                label="KHOẢNG THỜI GIAN"
                value={tempDatePreset}
                onChange={(val) => setTempDatePreset(val)}
                placeholder="Tất cả thời gian"
                options={[
                  { value: "all", label: "Tất cả thời gian" },
                  { value: "custom", label: "Tùy chọn thời gian" },
                  { value: "last_7_days", label: "7 ngày gần nhất" },
                  { value: "last_30_days", label: "30 ngày gần nhất" },
                  { value: "last_1_year", label: "1 năm gần nhất" },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-hairline/60 gap-3">
            <span className="text-[10px] text-mid-gray italic">* Bấm "Áp dụng" để tìm kiếm với bộ lọc.</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer"
              >
                Đặt lại
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-[6px] bg-ink text-white hover:bg-ink/90 transition-colors shadow-subtle cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </form>

        {/* Custom date range inputs */}
        {tempDatePreset === "custom" && (
          <div className="pt-2 border-t border-hairline flex flex-wrap items-end gap-3">
            <div className="w-36">
              <label htmlFor="filter-date-from" className="block text-[10px] font-medium text-mid-gray mb-1">Từ ngày</label>
              <input
                type="date"
                id="filter-date-from"
                value={tempDateFrom}
                onChange={(e) => setTempDateFrom(e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-paper border border-hairline rounded-[6px] focus:outline-none focus:border-ink"
              />
            </div>
            <div className="w-36">
              <label htmlFor="filter-date-to" className="block text-[10px] font-medium text-mid-gray mb-1">Đến ngày</label>
              <input
                type="date"
                id="filter-date-to"
                value={tempDateTo}
                onChange={(e) => setTempDateTo(e.target.value)}
                className="w-full h-8 px-2.5 text-xs bg-paper border border-hairline rounded-[6px] focus:outline-none focus:border-ink"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. TABLE CONTAINER */}
      <div id="orders-table-container" className="scroll-mt-20 min-h-[600px] flex flex-col rounded-[6px] border border-hairline bg-paper shadow-subtle overflow-hidden mb-4">
        {loading ? (
          <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent"></div>
              <p className="text-sm font-medium text-mid-gray">Đang tải danh sách đơn hàng...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-mid-gray">Không tìm thấy đơn hàng nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-[1090px] w-full text-left border-collapse text-xs table-fixed">
              <colgroup>
                <col style={{ width: "210px" }} />
                <col style={{ width: "320px" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "150px" }} />
                <col style={{ width: "140px" }} />
                <col style={{ width: "60px" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-hairline bg-surface-alt text-[10px] font-bold uppercase tracking-wider text-mid-gray font-sans">
                  <th className="py-3 px-3">Người mua</th>
                  <th className="py-3 px-3">Khóa học</th>
                  <th className="py-3 px-3">Giá thanh toán</th>
                  <th className="py-3 px-3">Phương thức</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3">Thời gian</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {items.map((order) => {
                  const statusMeta = getOrderStatusMeta(order.status);
                  const statusColor = getToneClasses(statusMeta.tone);

                  const paymentMeta = getPaymentStatusMeta(order.payment_status);
                  const paymentColor = getToneClasses(paymentMeta.tone);

                  // Payment method label
                  let methodText = "Miễn phí";
                  if (order.payment_method === "vnpay") methodText = "VNPay";
                  else if (order.payment_method === "momo") methodText = "MoMo";
                  else if (order.payment_method === "bank_transfer") methodText = "Chuyển khoản";
                  else if (order.payment_method === "cash") methodText = "Tiền mặt";

                  // Discount / price rendering
                  const hasDiscount = Number(order.discount_amount) > 0 && Number(order.price_snapshot) !== Number(order.amount);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleOpenDrawer(order.id)}
                      className="border-b border-hairline hover:bg-canvas/80 transition-colors cursor-pointer group"
                    >
                      {/* Column 1: Người mua */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-start gap-2">
                          {order.user?.avatar_url ? (
                            <img src={resolveMediaUrl(order.user.avatar_url)} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 bg-canvas border border-hairline" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-canvas border border-hairline flex items-center justify-center text-[10px] font-bold text-mid-gray shrink-0 uppercase">
                              {order.user?.full_name ? order.user.full_name.charAt(0) : "?"}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <div className="font-medium text-ink truncate" title={order.user?.full_name}>{order.user?.full_name || "---"}</div>
                              {order.user && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(`${order.user.full_name} - ${order.user.email}`);
                                    toast.success("Đã sao chép thông tin người mua");
                                  }}
                                  className="text-mid-gray hover:text-ink transition-colors p-0.5 rounded cursor-pointer shrink-0"
                                  title="Sao chép thông tin người mua"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            <div className="text-[10px] text-mid-gray truncate mt-0.5" title={order.user?.email}>{order.user?.email || "---"}</div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Khóa học */}
                      <td className="py-2.5 px-3">
                        {order.course ? (
                          <div className="flex items-start gap-2.5 min-w-0">
                            <img
                              src={resolveMediaUrl(order.course.thumbnail_url)}
                              alt=""
                              className="w-14 h-9 rounded object-cover shrink-0 border border-hairline/60 bg-canvas"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=120&auto=format&fit=crop&q=60";
                              }}
                            />
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-1">
                                {order.course.is_featured && (
                                  <span className="inline-flex items-center text-[8px] font-bold px-1 py-0.2 rounded bg-warning-soft/20 text-warning border border-warning/10 whitespace-nowrap leading-none">Nổi bật</span>
                                )}
                                <span className="inline-flex items-center text-[8px] font-semibold px-1 py-0.2 rounded bg-canvas text-mid-gray border border-hairline/60 whitespace-nowrap leading-none capitalize">
                                  {order.course.level || "Tất cả"}
                                </span>
                              </div>
                              <div className="font-semibold text-ink line-clamp-2 text-[11px] leading-tight" title={order.course.title}>
                                {order.course.title}
                              </div>
                              <div className="text-[10px] text-mid-gray truncate leading-none">GV: {order.course.instructor_name || order.course.instructor?.full_name || "Hệ thống"}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-mid-gray/60 font-medium">—</span>
                        )}
                      </td>

                      {/* Column 3: Giá thanh toán */}
                      <td className="py-2.5 px-3">
                        {hasDiscount ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-ink text-sm leading-tight font-sans">{formatVND(order.amount)}</div>
                            <div className="text-[10px] text-mid-gray/80 line-through leading-none font-sans">{formatVND(order.price_snapshot)}</div>
                            <div className="text-[9px] text-emerald-600 font-medium leading-none font-sans">Giảm {formatVND(order.discount_amount)}</div>
                          </div>
                        ) : (
                          <div className="font-bold text-ink text-sm leading-tight font-sans">{formatVND(order.amount)}</div>
                        )}
                      </td>

                      {/* Column 4: Phương thức */}
                      <td className="py-2.5 px-3 text-ink whitespace-nowrap font-medium text-[11px]">
                        {methodText}
                      </td>

                      {/* Column 5: Trạng thái */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col gap-2 select-none text-[10px] min-w-0">
                          <div className="flex flex-col gap-0.5">
                            <div className={`flex items-center gap-1.5 font-medium whitespace-nowrap ${statusColor.text}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusColor.bg} shrink-0`}></span>
                              Đơn: {statusMeta.label}
                            </div>
                            <div className="flex items-center gap-1 pl-3 group/order">
                              <span className="font-mono font-bold text-ink leading-tight truncate">#{order.order_code}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyCode(order.order_code);
                                }}
                                className="text-mid-gray hover:text-ink transition-colors p-0.5 rounded cursor-pointer shrink-0 opacity-0 lg:opacity-100 group-hover/order:opacity-100"
                                title="Sao chép mã đơn"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-0.5">
                            <div className={`flex items-center gap-1.5 font-medium whitespace-nowrap ${paymentColor.text}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${paymentColor.bg} shrink-0`}></span>
                              Thanh toán: {paymentMeta.label}
                            </div>
                            {order.provider_transaction_id && (
                              <div className="flex items-center gap-1 pl-3 group/txn">
                                <span className="font-mono font-semibold text-mid-gray truncate" title={`Mã GD: ${order.provider_transaction_id}`}>
                                  Mã GD: {order.provider_transaction_id}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(order.provider_transaction_id);
                                    toast.success("Đã sao chép mã giao dịch");
                                  }}
                                  className="text-mid-gray hover:text-ink transition-colors p-0.5 rounded cursor-pointer shrink-0 opacity-0 lg:opacity-100 group-hover/txn:opacity-100"
                                  title="Sao chép mã giao dịch"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 6: Thời gian */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1 select-none text-[10px] text-mid-gray whitespace-nowrap font-sans">
                          <div>Tạo: <span className="font-medium text-ink/90">{formatDateTime(order.created_at)}</span></div>
                          <div>Thanh toán: <span className={`font-medium ${order.paid_at ? "text-ink/90" : "text-mid-gray/70"}`}>
                            {order.paid_at ? formatDateTime(order.paid_at) : "Chưa thanh toán"}
                          </span></div>
                        </div>
                      </td>

                      {/* Column 7: Thao tác */}
                      <td className="py-2.5 px-3 text-center relative" data-no-row-click>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === order.id ? null : order.id);
                          }}
                          className="p-1 rounded-md hover:bg-canvas text-mid-gray hover:text-ink transition-colors cursor-pointer"
                          aria-label="Menu thao tác"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="6" r="1.5" />
                            <circle cx="12" cy="18" r="1.5" />
                          </svg>
                        </button>
                        {activeMenuId === order.id && (
                          <div className="absolute right-3 top-full mt-1 w-40 bg-paper border border-hairline rounded-[6px] shadow-lg z-50 py-1 text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDrawer(order.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-[11px] hover:bg-canvas flex items-center gap-2 text-ink transition-colors cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 text-mid-gray" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              <span>Xem chi tiết</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCode(order.order_code);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-1.5 text-[11px] hover:bg-canvas flex items-center gap-2 text-ink transition-colors cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 text-mid-gray" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                              </svg>
                              <span>Sao chép mã đơn</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {!loading && items.length > 0 && (
        <div className="mb-6">
          <AdminPagination
            currentPage={page}
            perPage={perPage}
            total={meta.total}
            onPageChange={(p) => setPage(p)}
            onPerPageChange={(pp) => {
              setPerPage(pp);
              setPage(1);
            }}
            itemLabel="đơn hàng"
          />
        </div>
      )}

      {/* Drawer Chi tiết đơn hàng */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div
            onClick={handleCloseDrawer}
            className="absolute inset-0 bg-ink/40 backdrop-blur-xs transition-opacity duration-300 opacity-100 cursor-pointer"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-[650px] md:w-[60vw] lg:w-[43vw] bg-paper shadow-2xl flex flex-col h-full transform transition-transform duration-300 translate-x-0 border-l border-hairline">

              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-hairline flex items-center justify-between shrink-0 bg-paper sticky top-0 z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-ink">
                      Chi tiết đơn hàng
                    </h2>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-canvas border border-hairline text-ink">
                      {selectedOrder ? `#${selectedOrder.order_code}` : "Đang tải..."}
                    </span>
                  </div>
                  <p className="text-[11px] text-mid-gray mt-0.5">
                    {selectedOrder ? `ID: ${selectedOrder.id} • Khởi tạo lúc ${formatDateTime(selectedOrder.created_at)}` : "Đang tải chi tiết..."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="rounded-full border border-hairline p-1.5 hover:bg-canvas transition-colors text-ink cursor-pointer flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Drawer Navigation Tabs */}
              <div className="border-b border-hairline bg-surface-alt px-5 shrink-0">
                <nav className="flex gap-6 text-xs font-medium text-mid-gray">
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className={`py-2.5 border-b-2 transition-all cursor-pointer bg-transparent border-none ${
                      activeTab === 'overview' ? "border-ink text-ink font-semibold" : "border-transparent text-mid-gray hover:text-ink"
                    }`}
                  >
                    1. Tổng quan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('payment')}
                    className={`py-2.5 border-b-2 transition-all cursor-pointer bg-transparent border-none ${
                      activeTab === 'payment' ? "border-ink text-ink font-semibold" : "border-transparent text-mid-gray hover:text-ink"
                    }`}
                  >
                    2. Thanh toán
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('consistency')}
                    className={`py-2.5 border-b-2 transition-all cursor-pointer bg-transparent border-none ${
                      activeTab === 'consistency' ? "border-ink text-ink font-semibold" : "border-transparent text-mid-gray hover:text-ink"
                    }`}
                  >
                    3. Đối chiếu dữ liệu
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('timeline')}
                    className={`py-2.5 border-b-2 transition-all cursor-pointer bg-transparent border-none ${
                      activeTab === 'timeline' ? "border-ink text-ink font-semibold" : "border-transparent text-mid-gray hover:text-ink"
                    }`}
                  >
                    4. Timeline
                  </button>
                </nav>
              </div>

              {/* Drawer Content Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                {detailLoading ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent mx-auto"></div>
                    <p className="text-sm font-medium text-mid-gray">Đang tải chi tiết đơn hàng...</p>
                  </div>
                ) : selectedOrder ? (
                  <>
                    {/* Tab 1: Tổng quan */}
                    {activeTab === 'overview' && (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-hairline bg-surface-alt p-4 grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-mid-gray block mb-1">Mã đơn hàng</span>
                            <span className="font-mono font-bold text-ink text-sm">#{selectedOrder.order_code}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-mid-gray block mb-1">Trạng thái đơn</span>
                            <span className="font-semibold text-ink">● {getOrderStatusMeta(selectedOrder.status).label}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-mid-gray block mb-1">Thanh toán</span>
                            <span className="font-semibold text-ink">● {getPaymentStatusMeta(selectedOrder.payment_status).label}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-mid-gray block mb-1">Ngày tạo</span>
                            <span className="text-ink">{formatDateTime(selectedOrder.created_at)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-mid-gray block mb-1">Thời gian thanh toán</span>
                            <span className="text-ink">{formatDateTime(selectedOrder.paid_at)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-mid-gray block mb-1">Cập nhật cuối</span>
                            <span className="text-ink">{formatDateTime(selectedOrder.updated_at)}</span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-hairline bg-paper p-4 space-y-2">
                          <div className="flex items-center justify-between border-b border-hairline pb-2 mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-mid-gray">
                              Thông tin người mua
                            </h3>
                            {selectedOrder.user && (
                              <button onClick={() => navigate(`/admin/users?open_user_id=${selectedOrder.user.id}`)} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                                Xem chi tiết &rarr;
                              </button>
                            )}
                          </div>
                          {selectedOrder.user ? (
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
                              <div><span className="text-mid-gray block mb-0.5">Họ và tên</span><span className="font-semibold text-ink text-xs">{selectedOrder.user.full_name}</span></div>
                              <div><span className="text-mid-gray block mb-0.5">Email</span><span className="font-mono text-ink text-xs">{selectedOrder.user.email}</span></div>
                              <div><span className="text-mid-gray block mb-0.5">Số điện thoại</span><span className="font-mono text-ink text-xs">{selectedOrder.user.phone || "---"}</span></div>
                              <div><span className="text-mid-gray block mb-0.5">ID User</span><span className="font-mono text-ink text-xs">#{selectedOrder.user.id}</span></div>
                              <div><span className="text-mid-gray block mb-0.5">Ngày tham gia</span><span className="text-ink text-xs">{formatDateTime(selectedOrder.user.created_at)}</span></div>
                              <div><span className="text-mid-gray block mb-0.5">Trạng thái</span><span className="capitalize font-semibold text-emerald-600 text-xs">● {selectedOrder.user.status}</span></div>
                            </div>
                          ) : (
                            <p className="text-xs text-mid-gray">Không có dữ liệu người mua</p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-hairline bg-paper p-4 space-y-2">
                          <div className="flex items-center justify-between border-b border-hairline pb-2 mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-mid-gray">
                              Khóa học mua
                            </h3>
                            {selectedOrder.course && (
                              <button onClick={() => navigate(`/admin/courses?open_course_id=${selectedOrder.course.id}`)} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                                Xem chi tiết &rarr;
                              </button>
                            )}
                          </div>
                          {selectedOrder.course ? (
                            <div className="flex items-start gap-3 text-xs">
                              <img
                                src={resolveMediaUrl(selectedOrder.course.thumbnail_url)}
                                alt="Course"
                                className="w-16 h-10 rounded object-cover border border-hairline bg-canvas shrink-0"
                              />
                              <div className="space-y-1 flex-1">
                                <div className="font-bold text-ink text-sm line-clamp-2">{selectedOrder.course.title}</div>
                                <div className="text-mid-gray text-[11px]">Giảng viên: <span className="font-semibold text-ink">{selectedOrder.course.instructor_name || selectedOrder.course.instructor?.full_name || "---"}</span></div>
                                <div className="flex items-center gap-4 text-[11px] pt-1">
                                  <span>Giá: <strong className="text-ink font-sans">{formatVND(selectedOrder.course.price)}</strong></span>
                                  <span>Trạng thái: <strong className="capitalize text-emerald-600">● {selectedOrder.course.status}</strong></span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-mid-gray">Không có dữ liệu khóa học</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Thanh toán */}
                    {activeTab === 'payment' && (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-hairline bg-paper p-4 space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-mid-gray border-b border-hairline pb-2 mb-2">Hóa đơn & Dòng tiền</h3>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between py-1 border-b border-hairline/60">
                              <span className="text-mid-gray">Giá snapshot khóa học:</span>
                              <span className="font-semibold text-ink font-sans">{formatVND(selectedOrder.price_snapshot)}</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-hairline/60">
                              <span className="text-mid-gray">Số tiền giảm giá:</span>
                              <span className="font-semibold text-rose-600 font-sans">-{formatVND(selectedOrder.discount_amount)}</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 text-sm">
                              <span className="font-bold text-ink">Thực trả (Amount):</span>
                              <span className="font-bold text-ink text-base font-sans">{formatVND(selectedOrder.amount)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-hairline bg-paper p-4 space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-mid-gray border-b border-hairline pb-2 mb-2">Thông tin cổng thanh toán</h3>
                          <div className="grid grid-cols-2 gap-3.5 text-xs">
                            <div>
                              <span className="text-mid-gray block mb-1">Phương thức thanh toán:</span>
                              <span className="font-semibold text-ink capitalize">
                                {selectedOrder.payment_method === "vnpay" ? "VNPay" : selectedOrder.payment_method === "momo" ? "MoMo" : selectedOrder.payment_method === "bank_transfer" ? "Chuyển khoản" : "Miễn phí"}
                              </span>
                            </div>
                            <div>
                              <span className="text-mid-gray block mb-1">Mã giao dịch Provider:</span>
                              <span className="font-mono font-semibold text-ink">{selectedOrder.provider_transaction_id || "Chưa phát sinh"}</span>
                            </div>
                            <div>
                              <span className="text-mid-gray block mb-1">Thời gian xác nhận:</span>
                              <span className="text-ink">{formatDateTime(selectedOrder.paid_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Đối chiếu dữ liệu */}
                    {activeTab === 'consistency' && (() => {
                      const isFullyPaid = selectedOrder.status === "paid" && selectedOrder.payment_status === "paid";
                      const hasEnrollment = !!selectedOrder.enrollment;
                      const hasRevenue = !!selectedOrder.revenue;

                      return (
                      <div className="space-y-4">
                        {!isFullyPaid && (
                          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs">
                            <strong className="block mb-1 font-bold">● Đơn chưa hoàn tất thanh toán</strong>
                            <p className="opacity-90 leading-relaxed">
                              (Trạng thái đơn: {getOrderStatusMeta(selectedOrder.status).label}, Thanh toán: {getPaymentStatusMeta(selectedOrder.payment_status).label})<br/>
                              Đơn chưa thanh toán nên hệ thống chưa tạo Ghi danh (Enrollment) và chưa phân bổ Doanh thu (Revenue).
                            </p>
                          </div>
                        )}

                        <div className="rounded-xl border border-hairline bg-paper p-4 text-xs">
                          <div className="flex items-center justify-between border-b border-hairline pb-2 mb-2">
                            <h4 className="font-bold text-ink uppercase tracking-wider text-[11px]">1. Ghi danh học tập (Enrollment)</h4>
                            <div className="flex items-center gap-3">
                              <span className={`font-semibold ${isFullyPaid ? (hasEnrollment ? "text-emerald-600" : "text-rose-600") : (hasEnrollment ? "text-emerald-600" : "text-amber-600")}`}>
                                ● {isFullyPaid ? (hasEnrollment ? "Khớp (Có dữ liệu)" : "Không khớp (Thiếu bất thường)") : (hasEnrollment ? "Đã phát sinh" : "Chưa phát sinh")}
                              </span>
                              {hasEnrollment && (
                                <button onClick={() => navigate(`/admin/enrollments?open_enrollment_id=${selectedOrder.enrollment.id}`)} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                                  Chi tiết &rarr;
                                </button>
                              )}
                            </div>
                          </div>
                          {hasEnrollment ? (
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-1 text-[11px]">
                              <div><span className="text-mid-gray block mb-0.5">Enrollment ID</span><span className="font-mono text-ink">#{selectedOrder.enrollment.id}</span></div>
                              <div><span className="text-mid-gray block mb-0.5">Tiến độ học tập</span><span className="font-bold text-ink">{selectedOrder.enrollment.progress_percent}%</span></div>
                            </div>
                          ) : (
                            <p className={`pt-1 text-[11px] ${isFullyPaid ? "text-rose-600 font-medium" : "text-mid-gray"}`}>
                              {isFullyPaid
                                ? "Cảnh báo: Đơn đã thanh toán nhưng chưa tìm thấy dữ liệu Enrollment trong hệ thống. Cần kiểm tra lại luồng đồng bộ."
                                : "Dữ liệu chưa phát sinh do đơn chưa hoàn tất."}
                            </p>
                          )}
                        </div>

                        <div className="rounded-xl border border-hairline bg-paper p-4 text-xs">
                          <div className="flex items-center justify-between border-b border-hairline pb-2 mb-2">
                            <h4 className="font-bold text-ink uppercase tracking-wider text-[11px]">2. Phân bổ doanh thu (Revenue Split)</h4>
                            <div className="flex items-center gap-3">
                              <span className={`font-semibold ${isFullyPaid ? (hasRevenue ? "text-emerald-600" : "text-rose-600") : (hasRevenue ? "text-emerald-600" : "text-amber-600")}`}>
                                ● {isFullyPaid ? (hasRevenue ? "Khớp (Có dữ liệu)" : "Không khớp (Thiếu bất thường)") : (hasRevenue ? "Đã phát sinh" : "Chưa phát sinh")}
                              </span>
                              {hasRevenue && (
                                <button onClick={() => navigate(`/admin/revenues?open_revenue_id=${selectedOrder.revenue.id}`)} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                                  Chi tiết &rarr;
                                </button>
                              )}
                            </div>
                          </div>
                          {hasRevenue ? (
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-1 text-[11px]">
                              <div><span className="text-mid-gray block mb-0.5">Revenue ID</span><span className="font-mono text-ink font-sans">#{selectedOrder.revenue.id}</span></div>
                              <div><span className="text-mid-gray block mb-0.5">Gross Amount</span><span className="font-bold text-ink font-sans">{formatVND(selectedOrder.revenue.gross_amount)}</span></div>
                              <div><span className="text-mid-gray block mb-0.5">Instructor Share</span><span className="font-medium text-ink font-sans">{formatVND(selectedOrder.revenue.instructor_amount)}</span></div>
                              <div><span className="text-mid-gray block mb-0.5">Platform Fee</span><span className="font-medium text-ink font-sans">{formatVND(selectedOrder.revenue.platform_amount)}</span></div>
                            </div>
                          ) : (
                            <p className={`pt-1 text-[11px] ${isFullyPaid ? "text-rose-600 font-medium" : "text-mid-gray"}`}>
                              {isFullyPaid
                                ? "Cảnh báo: Đơn đã thanh toán nhưng chưa phân bổ doanh thu. Cần kiểm tra lại luồng đối soát."
                                : "Dữ liệu chưa phát sinh do đơn chưa hoàn tất."}
                            </p>
                          )}
                        </div>
                      </div>
                      );
                    })()}

                    {/* Tab 4: Timeline */}
                    {activeTab === 'timeline' && (
                      <div className="space-y-4">
                        <div className="rounded-xl border border-hairline bg-paper p-4 text-xs">
                          <div className="relative pl-4 border-l border-hairline/60 ml-2 space-y-3">
                            <div className="relative">
                              <span className="absolute -left-[21px] top-0 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-paper"></span>
                              <div className="font-semibold text-ink leading-none">Khởi tạo đơn hàng</div>
                              <div className="text-[10px] text-mid-gray mt-1.5 leading-none">{formatDateTime(selectedOrder.created_at)}</div>
                            </div>
                            {selectedOrder.paid_at && (
                              <div className="relative">
                                <span className="absolute -left-[21px] top-0 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-paper"></span>
                                <div className="font-semibold text-ink leading-none">Xác nhận thanh toán</div>
                                <div className="text-[10px] text-mid-gray mt-1.5 leading-none">{formatDateTime(selectedOrder.paid_at)}</div>
                              </div>
                            )}
                            {selectedOrder.enrollment?.created_at && (
                              <div className="relative">
                                <span className="absolute -left-[21px] top-0 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-blue-500 ring-4 ring-paper"></span>
                                <div className="font-semibold text-ink leading-none">Ghi danh học tập</div>
                                <div className="text-[10px] text-mid-gray mt-1.5 leading-none">{formatDateTime(selectedOrder.enrollment.created_at)}</div>
                              </div>
                            )}
                            {selectedOrder.revenue?.created_at && (
                              <div className="relative">
                                <span className="absolute -left-[21px] top-0 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-purple-500 ring-4 ring-paper"></span>
                                <div className="font-semibold text-ink leading-none">Phân bổ doanh thu</div>
                                <div className="text-[10px] text-mid-gray mt-1.5 leading-none">{formatDateTime(selectedOrder.revenue.created_at)}</div>
                              </div>
                            )}
                            {selectedOrder.refunded_at && (
                              <div className="relative">
                                <span className="absolute -left-[21px] top-0 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-rose-500 ring-4 ring-paper"></span>
                                <div className="font-semibold text-ink leading-none">Hoàn tiền</div>
                                <div className="text-[10px] text-mid-gray mt-1.5 leading-none">{formatDateTime(selectedOrder.refunded_at)}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-sm text-mid-gray py-12">Không tìm thấy thông tin đơn hàng này.</p>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="px-5 py-3 border-t border-hairline bg-surface-alt flex items-center justify-between shrink-0 text-xs">
                <span className="text-[11px] text-mid-gray">Trạng thái quan sát - Không thực hiện sửa đổi dữ liệu.</span>
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="h-8 px-4 font-semibold rounded-[6px] border border-rose-500/20 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-500/30 transition-colors cursor-pointer text-xs"
                >
                  Đóng
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
