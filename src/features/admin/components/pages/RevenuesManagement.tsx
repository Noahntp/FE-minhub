import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Chart } from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  getRevenues,
  getRevenueReport,
  getRevenueById
} from '@/assets/js/api/revenues-api';
import AdminPagination from "../shared/AdminPagination";
import FilterSelect from "./FilterSelect";
import { Search, X } from "lucide-react";
import { resolveMediaUrl } from "@/shared/utils/format";

// Register zoom plugin
Chart.register(zoomPlugin);

// Helper function
function roundPercent(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export default function RevenuesManagement() {
  const navigate = useNavigate();
  // --- States ---
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    gross_amount: 0,
    instructor_amount: 0,
    platform_fee_amount: 0,
    available_amount: 0,
    paid_amount: 0,
    cancelled_amount: 0,
    inconsistent_count: 0
  });
  const [meta, setMeta] = useState<any>({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });

  // Table Filter States
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  // Temp Filters
  const [tempSearch, setTempSearch] = useState("");
  const [tempStatus, setTempStatus] = useState("all");
  const [tempSortBy, setTempSortBy] = useState("latest");

  // Chart Range Preset
  const [chartRangePreset, setChartRangePreset] = useState("6_months");
  const [chartDateFrom, setChartDateFrom] = useState("");
  const [chartDateTo, setChartDateTo] = useState("");
  const [tempChartDateFrom, setTempChartDateFrom] = useState("");
  const [tempChartDateTo, setTempChartDateTo] = useState("");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [chartEmpty, setChartEmpty] = useState(false);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState<any>(null);

  // Chart ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  // --- Fetch Data ---
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Resolve sorting parameters
      let sort_by = "earned_at";
      let sort_order = "desc";
      if (sortBy === "oldest") {
        sort_by = "earned_at";
        sort_order = "asc";
      } else if (sortBy === "gross_desc") {
        sort_by = "gross_amount";
        sort_order = "desc";
      } else if (sortBy === "gross_asc") {
        sort_by = "gross_amount";
        sort_order = "asc";
      } else if (sortBy === "instructor_desc") {
        sort_by = "instructor_amount";
        sort_order = "desc";
      } else if (sortBy === "platform_desc") {
        sort_by = "platform_fee_amount";
        sort_order = "desc";
      }

      // 2. Fetch list & summary
      const res: any = await getRevenues({
        page,
        per_page: perPage,
        search: search || undefined,
        status: status === "all" ? undefined : status,
        sort_by,
        sort_direction: sort_order,
        sort_order
      });

      if (res && res.success) {
        setItems(res.data.items || []);
        setSummary(res.data.summary || {});
        setMeta(res.meta || {});
      } else {
        toast.error("Không thể tải danh sách doanh thu.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi kết nối khi tải danh sách doanh thu.");
    } finally {
      setLoading(false);
    }
  };

  // Load chart data
  const loadChartData = async () => {
    try {
      let date_from = chartDateFrom;
      let date_to = chartDateTo;

      if (chartRangePreset !== "custom") {
        const now = new Date();
        const from = new Date();
        if (chartRangePreset === "1_day") {
          from.setHours(0, 0, 0, 0);
        } else if (chartRangePreset === "3_days") {
          from.setDate(now.getDate() - 2);
          from.setHours(0, 0, 0, 0);
        } else if (chartRangePreset === "7_days") {
          from.setDate(now.getDate() - 6);
          from.setHours(0, 0, 0, 0);
        } else if (chartRangePreset === "1_month") {
          from.setDate(now.getDate() - 29);
          from.setHours(0, 0, 0, 0);
        } else if (chartRangePreset === "3_months") {
          from.setDate(now.getDate() - 89);
          from.setHours(0, 0, 0, 0);
        } else if (chartRangePreset === "6_months") {
          from.setDate(now.getDate() - 179);
          from.setHours(0, 0, 0, 0);
        }
        date_from = from.toISOString().split("T")[0];
        date_to = now.toISOString().split("T")[0];
      }

      // Check if getRevenueReport is defined in admin reports or falls back to daily grouping
      const res: any = await getRevenueReport({
        date_from: date_from || undefined,
        date_to: date_to || undefined,
        group_by: chartRangePreset === "6_months" ? "month" : "day"
      });

      if (res && res.success && res.data && res.data.items) {
        renderChart(res.data.items);
        setChartEmpty(res.data.items.length === 0);
      } else {
        setChartEmpty(true);
      }
    } catch (err) {
      console.error("Lỗi tải biểu đồ:", err);
      setChartEmpty(true);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, perPage, search, status, sortBy]);

  useEffect(() => {
    loadChartData();
  }, [chartRangePreset, chartDateFrom, chartDateTo]);

  // Handle deep link revenue detail if open_revenue_id query param is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openRevId = params.get("open_revenue_id");
    if (openRevId) {
      handleOpenDrawer(Number(openRevId));
    }
  }, []);

  // --- Render Chart.js ---
  const renderChart = (chartItems: any[]) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = chartItems.map(item => item.period || (item.recorded_at ? item.recorded_at.split('T')[0] : '---'));
    const grossData = chartItems.map(item => Number(item.gross_amount) || 0);
    const instructorData = chartItems.map(item => Number(item.instructor_amount) || 0);
    const platformData = chartItems.map(item => Number(item.platform_fee_amount || item.platform_amount) || 0);

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Doanh thu gộp (Gross)',
            data: grossData,
            borderColor: '#10b981', // emerald-500
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 6,
            tension: 0.3,
            fill: true
          },
          {
            label: 'Thu nhập giảng viên',
            data: instructorData,
            borderColor: '#3b82f6', // blue-500
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.3
          },
          {
            label: 'Phí quản lý nền tảng',
            data: platformData,
            borderColor: '#f59e0b', // amber-500
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { size: 11, weight: 'normal' }
            }
          },
          zoom: {
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'x'
            },
            pan: {
              enabled: true,
              mode: 'x'
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 9 } }
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: {
              font: { size: 10 },
              callback: function(value) {
                return new Intl.NumberFormat('vi-VN').format(Number(value)) + 'đ';
              }
            }
          }
        }
      }
    });
  };

  const resetChartZoom = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.resetZoom();
      toast.info("Đã đặt lại mức thu phóng biểu đồ");
    }
  };

  // --- Actions ---
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(tempSearch);
    setStatus(tempStatus);
    setSortBy(tempSortBy);
    setPage(1);
    toast.success("Đã áp dụng bộ lọc");
  };

  const handleResetFilters = () => {
    setTempSearch("");
    setTempStatus("all");
    setTempSortBy("latest");

    setSearch("");
    setStatus("all");
    setSortBy("latest");
    setPage(1);
    toast.info("Đã đặt lại bộ lọc");
  };

  const handleApplyChartRange = () => {
    setChartDateFrom(tempChartDateFrom);
    setChartDateTo(tempChartDateTo);
    toast.success("Đã áp dụng khoảng thời gian biểu đồ");
  };

  // --- Helpers ---
  const formatVND = (value: any) => {
    const num = Number(value) || 0;
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

  const handleOpenDrawer = async (revId: number) => {
    setDetailLoading(true);
    setSelectedRevenue(null);
    setDrawerOpen(true);

    // Sync URL param
    const url = new URL(window.location.href);
    url.searchParams.set("open_revenue_id", String(revId));
    window.history.replaceState({}, "", url.toString());

    try {
      const res: any = await getRevenueById(revId);
      if (res && res.success) {
        setSelectedRevenue(res.data);
      } else {
        toast.error("Không thể lấy chi tiết doanh thu.");
        handleCloseDrawer();
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải chi tiết doanh thu.");
      handleCloseDrawer();
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedRevenue(null);

    // Remove URL param
    const url = new URL(window.location.href);
    url.searchParams.delete("open_revenue_id");
    window.history.replaceState({}, "", url.toString());
  };

  const handleCopyText = (e: React.MouseEvent, text: string, type: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${type}: ${text}`);
  };

  const getStatusBadge = (statusStr: string) => {
    if (statusStr === "available") {
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>Khả dụng
        </span>
      );
    }
    if (statusStr === "withdrawn") {
      return (
        <span className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>Đã rút
        </span>
      );
    }
    if (statusStr === "pending") {
      return (
        <span className="inline-flex items-center gap-1.5 text-amber-600 font-semibold text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>Đang chờ
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-rose-600 font-semibold text-[11px]">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>Đã hủy
      </span>
    );
  };

  return (
    <>
      {/* Page Title & Breadcrumb */}
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
            <span className="text-ink">Doanh thu và chia lợi nhuận</span>
          </nav>
          <h1 className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-tight">
            Doanh thu và chia lợi nhuận
          </h1>
          <p className="text-xs text-mid-gray mt-0.5">
            Theo dõi tổng doanh thu, phần thu nhập của giảng viên và phí quản lý nền tảng.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
        {/* Card 1: Tổng doanh thu */}
        <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Tổng doanh thu</span>
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-ink font-sans">{formatVND(summary.gross_amount)}</span>
            <p className="text-[11px] font-medium text-emerald-600 mt-1">100% tổng doanh thu trong kỳ</p>
          </div>
        </div>

        {/* Card 2: Thu nhập giảng viên */}
        <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Thu nhập giảng viên</span>
            <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-ink font-sans">{formatVND(summary.instructor_amount)}</span>
            <p className="text-[11px] font-medium text-blue-600 mt-1">
              {summary.gross_amount > 0 ? roundPercent(summary.instructor_amount, summary.gross_amount) : 0}% tổng doanh thu
            </p>
          </div>
        </div>

        {/* Card 3: Phí nền tảng */}
        <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Phí nền tảng</span>
            <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-ink font-sans">{formatVND(summary.platform_fee_amount)}</span>
            <p className="text-[11px] font-medium text-amber-600 mt-1">
              {summary.gross_amount > 0 ? roundPercent(summary.platform_fee_amount, summary.gross_amount) : 0}% tổng doanh thu
            </p>
          </div>
        </div>

        {/* Card 4: Số tiền khả dụng */}
        <div className="rounded-[6px] border border-hairline border-t-2 border-t-emerald-500 bg-paper p-4 shadow-subtle flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-mid-gray">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Số tiền khả dụng</span>
            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="mt-2">
            <span className="text-xl lg:text-2xl font-bold text-emerald-600 font-sans">{formatVND(summary.available_amount)}</span>
            <p className="text-[11px] font-medium text-emerald-600 mt-1">
              {summary.gross_amount > 0 ? roundPercent(summary.available_amount, summary.gross_amount) : 0}% tổng doanh thu
            </p>
          </div>
        </div>
      </div>

      {/* Secondary KPI Quick Bar */}
      <div className="rounded-[6px] border border-hairline bg-surface-alt p-3 flex flex-wrap items-center justify-between gap-3 text-xs mb-4">
        <div className="flex items-center gap-4">
          <div className="text-xs text-mid-gray">
            <span className="font-medium text-ink">Đã rút:</span>
            <span className="font-bold text-ink ml-1 font-sans">{formatVND(summary.paid_amount)}</span>
          </div>
          <div className="w-px h-3 bg-hairline"></div>
          <div className="text-xs text-mid-gray">
            <span className="font-medium text-ink">Đã hủy:</span>
            <span className="font-bold text-ink ml-1 font-sans">{formatVND(summary.cancelled_amount)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-mid-gray">
          <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Bản ghi sai lệch số tiền:</span>
          <span className={`font-bold ml-1 ${summary.inconsistent_count > 0 ? 'text-rose-600' : 'text-ink'}`}>{summary.inconsistent_count || 0}</span>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-hairline pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-mid-gray">Biểu đồ biến động doanh thu</h3>
              <button
                type="button"
                onClick={resetChartZoom}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded transition-all cursor-pointer whitespace-nowrap"
              >
                Đặt lại thu phóng
              </button>
            </div>
            <p className="text-[10px] text-mid-gray mt-0.5 font-medium">Lăn chuột để thu phóng • Giữ và kéo để di chuyển</p>
          </div>

          {/* Chart range controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:justify-end">
            <div className="w-[150px]">
              <FilterSelect
                id="chart-range"
                label="PHẠM VI XEM"
                value={chartRangePreset}
                onChange={(val) => setChartRangePreset(val)}
                placeholder="Chọn phạm vi"
                options={[
                  { value: "1_day", label: "1 ngày" },
                  { value: "3_days", label: "3 ngày" },
                  { value: "7_days", label: "7 ngày" },
                  { value: "1_month", label: "1 tháng" },
                  { value: "3_months", label: "3 tháng" },
                  { value: "6_months", label: "6 tháng" },
                  { value: "custom", label: "Tùy chọn" },
                ]}
              />
            </div>

            {chartRangePreset === "custom" && (
              <div className="flex flex-wrap items-end gap-2 whitespace-nowrap">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-mid-gray mb-1 font-semibold">Từ ngày</label>
                  <input
                    type="date"
                    value={tempChartDateFrom}
                    onChange={(e) => setTempChartDateFrom(e.target.value)}
                    className="h-8 px-2.5 text-xs bg-canvas border border-hairline rounded-[6px] focus:outline-none focus:border-ink text-ink font-mono"
                  />
                </div>
                <span className="text-mid-gray text-xs font-medium pb-2">-</span>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-mid-gray mb-1 font-semibold">Đến ngày</label>
                  <input
                    type="date"
                    value={tempChartDateTo}
                    onChange={(e) => setTempChartDateTo(e.target.value)}
                    className="h-8 px-2.5 text-xs bg-canvas border border-hairline rounded-[6px] focus:outline-none focus:border-ink text-ink font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyChartRange}
                  className="h-8 px-3.5 text-xs font-semibold bg-ink text-white rounded-[6px] hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                >
                  Áp dụng
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="w-full h-[290px] relative">
          <canvas ref={canvasRef} id="revenueChart"></canvas>
          {chartEmpty && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper/95 z-10">
              <svg className="w-10 h-10 text-mid-gray/40 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h16.5m-16.5 0L21 21M3.75 16.5h16.5" />
              </svg>
              <p className="text-xs font-semibold text-mid-gray">Không có dữ liệu doanh thu trong khoảng thời gian đã chọn.</p>
            </div>
          )}
        </div>
      </div>

      {/* FILTERS & LIST SECTION */}
      <section className="rounded-[6px] border border-hairline bg-paper shadow-subtle space-y-3 p-4 mb-4">
        <form onSubmit={handleApplyFilters}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Unified Search */}
            <div className="sm:col-span-2 lg:col-span-2">
              <label htmlFor="filter-search" className="block text-[10px] font-bold uppercase tracking-wider text-mid-gray mb-1.5 select-none">TÌM KIẾM</label>
              <div className="relative">
                <input
                  type="text"
                  id="filter-search"
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  placeholder="Nhập tên khóa học, giảng viên hoặc mã đơn..."
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

            {/* Trạng thái */}
            <div>
              <FilterSelect
                id="filter-status"
                label="TRẠNG THÁI"
                value={tempStatus}
                onChange={(val) => setTempStatus(val)}
                placeholder="Tất cả trạng thái"
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "available", label: "Khả dụng", colorClass: "text-emerald-600" },
                  { value: "withdrawn", label: "Đã rút", colorClass: "text-blue-600" },
                  { value: "pending", label: "Đang chờ", colorClass: "text-amber-600" },
                  { value: "cancelled", label: "Đã hủy", colorClass: "text-mid-gray" },
                ]}
              />
            </div>

            {/* Sắp xếp */}
            <div>
              <FilterSelect
                id="filter-sort"
                label="SẮP XẾP DOANH THU"
                value={tempSortBy}
                onChange={(val) => setTempSortBy(val)}
                placeholder="Mới ghi nhận"
                options={[
                  { value: "latest", label: "Mới ghi nhận" },
                  { value: "oldest", label: "Cũ nhất" },
                  { value: "gross_desc", label: "Doanh thu cao nhất" },
                  { value: "gross_asc", label: "Doanh thu thấp nhất" },
                  { value: "instructor_desc", label: "Phần GV cao nhất" },
                  { value: "platform_desc", label: "Phí nền tảng cao nhất" },
                ]}
              />
            </div>
          </div>

          {/* Action buttons */}
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

        {/* Table representation */}
        <div className="border border-hairline rounded-[6px] bg-paper overflow-hidden w-full flex flex-col">
          {loading ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent"></div>
                <p className="text-sm font-medium text-mid-gray">Đang tải danh sách doanh thu...</p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-mid-gray">Không tìm thấy dữ liệu doanh thu nào.</div>
          ) : (
            <div className="overflow-x-auto min-h-[320px] relative w-full">
              <table className="w-full text-left border-collapse min-w-[768px] table-fixed">
                <colgroup>
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "34%" }} />
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "6%" }} />
                </colgroup>
                <thead className="bg-surface-alt/70 sticky top-0 z-10 border-b border-hairline font-sans">
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">
                    <th className="py-2.5 px-3">REVENUE / ĐƠN HÀNG</th>
                    <th className="py-2.5 px-3">KHÓA HỌC</th>
                    <th className="py-2.5 px-3">PHÂN BỔ DOANH THU</th>
                    <th className="py-2.5 px-3 text-center">TỶ LỆ CHIA</th>
                    <th className="py-2.5 px-3">TRẠNG THÁI</th>
                    <th className="py-2.5 px-3">NGÀY GHI NHẬN</th>
                    <th className="py-2.5 px-3 text-center">ĐỐI SOÁT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDrawer(item.id)}
                      className={`transition-colors cursor-pointer hover:bg-canvas/50 ${
                        !item.amount_consistent ? 'bg-rose-50/60 hover:bg-rose-50' : ''
                      }`}
                    >
                      {/* Col 1: REVENUE / ĐƠN HÀNG */}
                      <td className="py-2.5 pl-3 pr-3">
                        <div className="flex flex-col gap-1.5 select-none min-w-0">
                          <div className="flex items-center gap-1.5 group/rev">
                            <span className="font-mono font-bold text-ink text-[11px] leading-none truncate">#REV-{item.id}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyText(e, `#REV-${item.id}`, "mã doanh thu")}
                              className="text-mid-gray hover:text-ink p-0.5 rounded cursor-pointer shrink-0"
                              title="Sao chép mã doanh thu"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                              </svg>
                            </button>
                          </div>
                          {item.order && (
                            <div className="flex items-center gap-1.5 group/ord">
                              <span className="text-[10px] font-semibold text-mid-gray uppercase tracking-wider shrink-0">Đơn:</span>
                              <span className="font-mono font-semibold text-blue-600 text-[10px] truncate hover:underline cursor-pointer" title={item.order.order_code}>{item.order.order_code}</span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyText(e, item.order.order_code, "mã đơn")}
                                className="text-mid-gray hover:text-ink p-0.5 rounded cursor-pointer shrink-0"
                                title="Sao chép mã đơn"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Col 2: KHÓA HỌC */}
                      <td className="py-2.5 px-3">
                        {item.course ? (
                          <div className="flex items-start gap-2.5 min-w-0">
                            <img
                              src={resolveMediaUrl(item.course.thumbnail_url)}
                              alt=""
                              className="w-14 h-9 rounded object-cover shrink-0 border border-hairline/60 bg-canvas"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=120&auto=format&fit=crop&q=60";
                              }}
                            />
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="inline-flex items-center text-[8px] font-semibold px-1 py-0.2 rounded bg-canvas text-mid-gray border border-hairline/60 whitespace-nowrap leading-none capitalize">
                                  {item.course.level || "Tất cả"}
                                </span>
                              </div>
                              <div className="font-semibold text-ink line-clamp-2 text-[11px] leading-tight" title={item.course.title}>
                                {item.course.title}
                              </div>
                              <div className="text-[10px] text-mid-gray truncate leading-none">
                                GV: <span className="text-blue-600 font-medium">{item.instructor?.full_name || "---"}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-mid-gray/60 font-medium">—</span>
                        )}
                      </td>

                      {/* Col 3: PHÂN BỔ DOANH THU */}
                      <td className="py-2.5 px-3">
                        <div className="grid grid-cols-[68px_1fr] gap-x-2 text-[10px] leading-normal font-sans">
                          <span className="text-mid-gray">Tổng:</span>
                          <strong className="font-bold text-ink">{formatVND(item.gross_amount)}</strong>
                          <span className="text-mid-gray">Giảng viên:</span>
                          <span className="font-medium text-emerald-600">{formatVND(item.instructor_amount)}</span>
                          <span className="text-mid-gray">Nền tảng:</span>
                          <span className="font-medium text-blue-600">{formatVND(item.platform_fee_amount)}</span>
                        </div>
                      </td>

                      {/* Col 4: TỶ LỆ CHIA */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="text-[10px] font-medium text-mid-gray leading-normal">
                          GV: <strong className="text-ink">{item.instructor_rate}%</strong>
                          <br />
                          NT: <strong className="text-ink">{item.platform_rate}%</strong>
                        </div>
                      </td>

                      {/* Col 5: TRẠNG THÁI */}
                      <td className="py-2.5 px-3">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Col 6: NGÀY GHI NHẬN */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5 select-none text-[11px] leading-tight font-sans text-mid-gray">
                          <span className="font-semibold text-ink">{formatDateTime(item.earned_at).split(' ')[0]}</span>
                          <span>{formatDateTime(item.earned_at).split(' ')[1]}</span>
                        </div>
                      </td>

                      {/* Col 7: ĐỐI SOÁT */}
                      <td className="py-2.5 px-3 text-center">
                        {item.amount_consistent ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs" title="Khớp hoàn toàn">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Khớp
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-xs animate-pulse" title="Sai lệch dữ liệu">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Lệch
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && meta && (
            <AdminPagination
              currentPage={page}
              perPage={perPage}
              total={meta.total ?? 0}
              onPageChange={(p) => setPage(p)}
              onPerPageChange={(pp) => {
                setPerPage(pp);
                setPage(1);
              }}
              itemLabel="doanh thu"
            />
          )}
        </div>
      </section>

      {/* Detail Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div onClick={handleCloseDrawer} className="absolute inset-0 bg-ink/40 backdrop-blur-xs transition-opacity duration-300 opacity-100 cursor-pointer" />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-[480px] bg-paper shadow-2xl flex flex-col h-full transform transition-transform duration-300 translate-x-0 border-l border-hairline">
              {/* Header */}
              <div className="px-5 py-4 border-b border-hairline flex items-center justify-between shrink-0 bg-paper">
                <div>
                  <h2 className="text-base font-bold text-ink">Chi tiết doanh thu</h2>
                  <p className="text-xs text-mid-gray font-mono mt-0.5">
                    {selectedRevenue ? `#REV-${selectedRevenue.id}` : "Đang tải..."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="rounded-full border border-hairline p-1.5 hover:bg-canvas transition-colors text-ink cursor-pointer flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex-grow overflow-y-auto p-5 space-y-5 custom-scrollbar">
                {detailLoading ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent mx-auto"></div>
                    <p className="text-xs text-mid-gray">Đang tải chi tiết...</p>
                  </div>
                ) : selectedRevenue ? (
                  <>
                    {/* Status & Date */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-hairline text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-mid-gray tracking-wider">Trạng thái</span>
                        <div>{getStatusBadge(selectedRevenue.status)}</div>
                      </div>
                      <div className="flex flex-col gap-1 text-right">
                        <span className="text-[10px] uppercase font-bold text-mid-gray tracking-wider">Ngày ghi nhận</span>
                        <div className="font-semibold text-ink">{formatDateTime(selectedRevenue.earned_at)}</div>
                      </div>
                    </div>

                    {/* Allocation Card */}
                    <div className="rounded-[6px] border border-hairline bg-surface-alt/60 p-4 space-y-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">Phân bổ doanh thu</h3>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-mid-gray">Tổng doanh thu (Gross):</span>
                        <span className="text-base font-bold text-ink font-sans">{formatVND(selectedRevenue.gross_amount)}</span>
                      </div>
                      <div className="h-px bg-hairline my-2"></div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-mid-gray">Thu nhập giảng viên ({selectedRevenue.instructor_rate}%):</span>
                          <span className="font-semibold text-emerald-600 font-sans">{formatVND(selectedRevenue.instructor_amount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-mid-gray">Phí nền tảng ({selectedRevenue.platform_rate}%):</span>
                          <span className="font-semibold text-blue-600 font-sans">{formatVND(selectedRevenue.platform_fee_amount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Course */}
                    {selectedRevenue.course && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">Khóa học</h3>
                          <button
                            onClick={() => navigate(`/admin/courses?open_course_id=${selectedRevenue.course.id}`)}
                            className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                        <div className="p-3.5 border border-hairline rounded-[6px] bg-paper flex items-center gap-3.5 text-xs">
                          <img
                            src={resolveMediaUrl(selectedRevenue.course.thumbnail_url)}
                            alt=""
                            className="w-14 h-9 rounded object-cover border border-hairline bg-canvas shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=120&auto=format&fit=crop&q=60";
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-ink truncate">{selectedRevenue.course.title}</div>
                            <div className="text-[10px] text-mid-gray mt-1 flex items-center gap-1.5">
                              <span>Cấp độ: <span className="capitalize">{selectedRevenue.course.level || "Tất cả"}</span></span>
                              <span className="text-hairline">•</span>
                              <span>ID: {selectedRevenue.course.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Instructor */}
                    {selectedRevenue.instructor && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">Giảng viên</h3>
                          <button
                            onClick={() => navigate(`/admin/users?open_user_id=${selectedRevenue.instructor.id}`)}
                            className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                        <div className="p-3.5 border border-hairline rounded-[6px] bg-paper text-xs space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                              {selectedRevenue.instructor.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-ink">{selectedRevenue.instructor.name}</div>
                              <div className="text-mid-gray font-mono text-[11px]">{selectedRevenue.instructor.email}</div>
                            </div>
                          </div>
                          {selectedRevenue.instructor.phone && (
                            <div className="flex items-center justify-between pt-2 border-t border-hairline">
                              <span className="text-mid-gray">Số điện thoại:</span>
                              <span className="font-mono text-ink">{selectedRevenue.instructor.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Original Order */}
                    {selectedRevenue.order && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">Đơn hàng gốc</h3>
                          <button
                            onClick={() => navigate(`/admin/orders?open_order_id=${selectedRevenue.order.id}`)}
                            className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                        <div className="p-3.5 border border-hairline rounded-[6px] bg-paper text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-mid-gray">Mã đơn hàng:</span>
                            <span className="font-mono font-bold text-ink">{selectedRevenue.order.order_code}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-mid-gray">Trị giá đơn:</span>
                            <span className="font-semibold text-ink font-sans">{formatVND(selectedRevenue.order.amount)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-mid-gray">Phương thức:</span>
                            <span className="font-medium text-ink capitalize">
                              {selectedRevenue.order.payment_method === "vnpay" ? "VNPay" : selectedRevenue.order.payment_method === "momo" ? "MoMo" : "Chuyển khoản"}
                            </span>
                          </div>
                          {selectedRevenue.order.created_at && (
                            <div className="flex items-center justify-between pt-1 border-t border-hairline/50">
                              <span className="text-mid-gray">Ngày tạo đơn:</span>
                              <span className="font-medium text-ink text-[11px]">{formatDateTime(selectedRevenue.order.created_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-xs text-mid-gray py-12">Không tìm thấy chi tiết doanh thu này.</p>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-hairline bg-surface-alt flex items-center justify-between shrink-0 text-[11px] text-mid-gray">
                <span>Quan sát đối soát</span>
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
