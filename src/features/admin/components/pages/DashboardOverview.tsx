import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDashboardMockData } from '@/data/dashboard';
import { adminApi } from '@/features/admin/api';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { Chart } from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';

// Đăng ký plugin zoom với Chart.js
Chart.register(zoomPlugin);

// Helper to group chart data by interval (translated from groupDashboardChartData in legacy js)
function groupDashboardChartData(reportData: any[], start: Date, end: Date, interval: string) {
  const startMs = start.getTime();
  const endMs = end.getTime();

  const buckets: any[] = [];
  let curr = new Date(startMs);

  let stepMs = 24 * 3600 * 1000;
  if (interval === "1_min") stepMs = 60 * 1000;
  else if (interval === "5_min") stepMs = 5 * 60 * 1000;
  else if (interval === "15_min") stepMs = 15 * 60 * 1000;
  else if (interval === "30_min") stepMs = 30 * 60 * 1000;
  else if (interval === "1_hour") stepMs = 3600 * 1000;
  else if (interval === "1_day") stepMs = 24 * 3600 * 1000;
  else if (interval === "7_days") stepMs = 7 * 24 * 3600 * 1000;

  if (interval === "1_month") {
    while (curr <= end) {
      const bStart = new Date(curr.getFullYear(), curr.getMonth(), 1);
      const bEnd = new Date(curr.getFullYear(), curr.getMonth() + 1, 1);
      bEnd.setMilliseconds(-1);

      buckets.push({
        x: bStart.getTime(),
        startMs: bStart.getTime(),
        endMs: bEnd.getTime(),
        period: `T${String(bStart.getMonth() + 1).padStart(2, '0')}/${bStart.getFullYear()}`,
        gross_amount: 0,
        instructor_amount: 0,
        platform_fee_amount: 0,
        order_count: 0,
        order_ids: new Set()
      });
      curr.setMonth(curr.getMonth() + 1);
    }
  } else {
    while (curr.getTime() <= endMs) {
      const bStart = curr.getTime();
      const bEnd = bStart + stepMs - 1;

      const d = new Date(bStart);
      let periodLabel = "";
      if (interval.includes("min")) {
        periodLabel = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      } else if (interval === "1_hour") {
        periodLabel = `${String(d.getHours()).padStart(2, '0')}:00`;
      } else {
        periodLabel = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      }

      buckets.push({
        x: bStart,
        startMs: bStart,
        endMs: bEnd,
        period: periodLabel,
        gross_amount: 0,
        instructor_amount: 0,
        platform_fee_amount: 0,
        order_count: 0,
        order_ids: new Set()
      });
      curr.setTime(curr.getTime() + stepMs);
    }
  }

  if (reportData && reportData.length > 0) {
    reportData.forEach(r => {
      const dateStr = r.recorded_at || r.date || r.period;
      if (!dateStr) return;
      const t = new Date(dateStr).getTime();
      if (isNaN(t)) return;

      const bucket = buckets.find(b => t >= b.startMs && t <= b.endMs);
      if (bucket) {
        bucket.gross_amount += Number(r.gross_amount || 0);
        bucket.instructor_amount += Number(r.instructor_amount || 0);
        bucket.platform_fee_amount += Number(r.platform_fee_amount || r.platform_amount || 0);
        if (r.order_id) {
          if (!bucket.order_ids.has(r.order_id)) {
            bucket.order_ids.add(r.order_id);
            bucket.order_count++;
          }
        } else {
          bucket.order_count++;
        }
      }
    });
  }

  return buckets;
}

export default function DashboardOverview() {
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('7days');
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const [uiState, setUiState] = useState<'loading' | 'loaded' | 'empty' | 'error' | 'forbidden'>('loading');
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  // Tab cho dữ liệu gần đây
  const [activeTab, setActiveTab] = useState<'orders' | 'courses'>('orders');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);
  const [isZoomedOrPanned, setIsZoomedOrPanned] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    if (isZoomedOrPanned) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetZoom = () => {
    const chart = chartInstanceRef.current;
    if (chart) {
      chart.resetZoom();
      setIsZoomedOrPanned(false);
      
      const initialInterval = chart.options.initialInterval;
      const initialGroupedData = chart.options.initialGroupedData;
      if (initialInterval && initialGroupedData) {
        chart.options.currentAutoInterval = initialInterval;
        chart.data.datasets[0].data = initialGroupedData.map((d: any) => ({ x: d.x, y: d.gross_amount }));
        chart.data.datasets[1].data = initialGroupedData.map((d: any) => ({ x: d.x, y: d.instructor_amount }));
        chart.data.datasets[2].data = initialGroupedData.map((d: any) => ({ x: d.x, y: d.platform_fee_amount }));
        chart.options.currentGroupedData = initialGroupedData;
        chart.update("none");
      }
    }
  };

  // Load data from Backend APIs
  const loadDashboardData = React.useCallback((filterType: string, from?: string, to?: string) => {
    setUiState('loading');

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const referenceDate = new Date('2026-06-30');
    let params: any = {};
    if (filterType === '7days') {
      const today = new Date(referenceDate);
      const past = new Date(referenceDate);
      past.setDate(today.getDate() - 7);
      params = { date_from: formatDate(past), date_to: formatDate(today) };
    } else if (filterType === '30days') {
      const today = new Date(referenceDate);
      const past = new Date(referenceDate);
      past.setDate(today.getDate() - 30);
      params = { date_from: formatDate(past), date_to: formatDate(today) };
    } else if (filterType === 'thisMonth') {
      params = { month: referenceDate.getMonth() + 1, year: referenceDate.getFullYear() };
    } else if (filterType === 'thisYear') {
      params = { year: referenceDate.getFullYear() };
    } else if (filterType === 'custom') {
      params = { date_from: from, date_to: to };
    }

    Promise.all([
      adminApi.getDashboardOverview(params),
      adminApi.getRevenueReport({ ...params, group_by: 'day' }),
      adminApi.getTopCoursesReport({ ...params, per_page: 5 }),
      adminApi.getTopInstructorsReport({ ...params, per_page: 5 })
    ])
      .then(([dashboardRes, revenueRes, topCoursesRes, topInstructorsRes]) => {
        if (!dashboardRes) {
          setUiState('empty');
          return;
        }

        const mergedData = {
          dashboard: { data: dashboardRes },
          revenue_report: { data: revenueRes || { summary: {}, items: [] } },
          top_courses: { data: topCoursesRes || { summary: {}, items: [] } },
          top_instructors: { data: topInstructorsRes || { items: [] } }
        };

        setDashboardData(mergedData);
        setUiState('loaded');
      })
      .catch((err) => {
        console.error("Lỗi lấy dữ liệu dashboard thực tế:", err);
        setUiState('error');
        toast.error("Không thể kết nối đến máy chủ Backend.");
      });
  }, []);

  useEffect(() => {
    if (activeFilter !== 'custom') {
      loadDashboardData(activeFilter);
    }
  }, [activeFilter, loadDashboardData]);

  // Khởi tạo Chart.js trên canvas
  useEffect(() => {
    if (uiState !== 'loaded' || !canvasRef.current || !dashboardData) return;

    setIsZoomedOrPanned(false);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const reportData = dashboardData.revenue_report?.data || {};
    const items = reportData.items || [];
    const emptyOverlay = document.getElementById("chart-empty-state");

    if (items.length === 0) {
      if (emptyOverlay) emptyOverlay.classList.remove("hidden");
      return;
    }
    if (emptyOverlay) emptyOverlay.classList.add("hidden");

    let start: Date;
    let end: Date;
    const referenceDate = new Date('2026-06-30');

    if (activeFilter === '7days') {
      const today = new Date(referenceDate);
      const past = new Date(referenceDate);
      past.setDate(today.getDate() - 7);
      start = past;
      start.setHours(0, 0, 0, 0);
      end = today;
      end.setHours(23, 59, 59, 999);
    } else if (activeFilter === '30days') {
      const today = new Date(referenceDate);
      const past = new Date(referenceDate);
      past.setDate(today.getDate() - 30);
      start = past;
      start.setHours(0, 0, 0, 0);
      end = today;
      end.setHours(23, 59, 59, 999);
    } else if (activeFilter === 'thisMonth') {
      start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1, 0, 0, 0);
      end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1, 0, 0, 0);
      end.setMilliseconds(-1);
    } else if (activeFilter === 'thisYear') {
      start = new Date(referenceDate.getFullYear(), 0, 1, 0, 0, 0);
      end = new Date(referenceDate.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else {
      start = customFrom ? new Date(customFrom) : new Date(referenceDate);
      start.setHours(0, 0, 0, 0);
      end = customTo ? new Date(customTo) : new Date(referenceDate);
      end.setHours(23, 59, 59, 999);
    }

    const startMs = start.getTime();
    const endMs = end.getTime();
    const rangeMs = endMs - startMs;

    let initialInterval = "1_day";
    const diffDays = rangeMs / (24 * 3600 * 1000);
    if (diffDays <= 1.1) initialInterval = "1_hour";
    else if (diffDays <= 93.1) initialInterval = "1_day";
    else initialInterval = "1_month";

    let minRange = 24 * 3600 * 1000;
    if (rangeMs <= 25 * 3600 * 1000) minRange = 15 * 60 * 1000;
    else if (rangeMs <= 4 * 24 * 3600 * 1000) minRange = 30 * 60 * 1000;
    else if (rangeMs <= 8 * 24 * 3600 * 1000) minRange = 2 * 3600 * 1000;
    else if (rangeMs <= 32 * 24 * 3600 * 1000) minRange = 12 * 3600 * 1000;

    const groupedData = groupDashboardChartData(items, start, end, initialInterval);

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Doanh thu gộp",
            data: groupedData.map(d => ({ x: d.x, y: d.gross_amount })),
            borderColor: "#15803d",
            backgroundColor: "transparent",
            borderWidth: 2.5,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#15803d",
            pointHoverRadius: 6,
            pointRadius: 4,
            tension: 0.15
          },
          {
            label: "Thu nhập giảng viên",
            data: groupedData.map(d => ({ x: d.x, y: d.instructor_amount })),
            borderColor: "#404040",
            backgroundColor: "transparent",
            borderWidth: 1.8,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#404040",
            pointHoverRadius: 5,
            pointRadius: 3,
            tension: 0.15
          },
          {
            label: "Phí nền tảng",
            data: groupedData.map(d => ({ x: d.x, y: d.platform_fee_amount })),
            borderColor: "#b7791f",
            backgroundColor: "transparent",
            borderWidth: 1.8,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#b7791f",
            pointHoverRadius: 5,
            pointRadius: 3,
            tension: 0.15
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        currentAutoInterval: initialInterval,
        currentGroupedData: groupedData,
        initialInterval: initialInterval,
        initialGroupedData: groupedData,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            align: "end",
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              usePointStyle: true,
              font: {
                family: "Geist, Inter, sans-serif",
                size: 11
              },
              color: "#0a0a0a"
            }
          },
          tooltip: {
            backgroundColor: "#1f2937",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            padding: 8,
            cornerRadius: 6,
            titleFont: {
              family: "Geist, Inter, sans-serif",
              size: 11,
              weight: 600
            },
            bodyFont: {
              family: "Geist, Inter, sans-serif",
              size: 11
            },
            callbacks: {
              title: function(context: any) {
                const chart = context[0].chart;
                const index = context[0].dataIndex;
                const gData = chart.options.currentGroupedData || [];
                const item = gData[index];
                if (!item) return "";

                const startD = new Date(item.startMs);
                const dateStr = startD.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' });
                const currentInterval = chart.options.currentAutoInterval || "1_day";

                if (currentInterval === "1_day" || currentInterval === "7_days") {
                  return `Thời gian: ${dateStr}`;
                } else if (currentInterval === "1_month") {
                  return `Thời gian: T${startD.getMonth() + 1}/${startD.getFullYear()}`;
                } else {
                  const startH = `${String(startD.getHours()).padStart(2, '0')}:${String(startD.getMinutes()).padStart(2, '0')}`;
                  return `Thời gian: ${startH} ${dateStr}`;
                }
              },
              label: function(context: any) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(context.parsed.y);
                }
                return label;
              },
              footer: function (context: any) {
                const chart = context[0].chart;
                const index = context[0].dataIndex;
                const gData = chart.options.currentGroupedData || [];
                const item = gData[index];
                if (item && item.order_count !== undefined && item.order_count !== null) {
                  return `Số đơn: ${item.order_count}`;
                }
                return null;
              }
            }
          },
          zoom: {
            limits: {
              x: { min: startMs, max: endMs, minRange: minRange }
            },
            zoom: {
              wheel: {
                enabled: true,
                speed: 0.08,
              },
              pinch: {
                enabled: true,
              },
              mode: "x",
              onZoom: function ({ chart }: any) {
                setIsZoomedOrPanned(true);
                const min = chart.scales.x.min;
                const max = chart.scales.x.max;
                const diffMs = max - min;
                const diffHours = diffMs / (3600 * 1000);

                let newInterval = "1_day";
                if (diffHours > 72) newInterval = "1_day";
                else if (diffHours > 12) newInterval = "1_hour";
                else if (diffHours > 3) newInterval = "30_min";
                else if (diffHours > 1) newInterval = "15_min";
                else if (diffHours > 0.25) newInterval = "5_min";
                else newInterval = "1_min";

                if (chart.options.currentAutoInterval !== newInterval) {
                  chart.options.currentAutoInterval = newInterval;
                  const newGrouped = groupDashboardChartData(items, start, end, newInterval);
                  
                  chart.data.datasets[0].data = newGrouped.map(d => ({ x: d.x, y: d.gross_amount }));
                  chart.data.datasets[1].data = newGrouped.map(d => ({ x: d.x, y: d.instructor_amount }));
                  chart.data.datasets[2].data = newGrouped.map(d => ({ x: d.x, y: d.platform_fee_amount }));
                  
                  chart.options.currentGroupedData = newGrouped;
                  chart.update("none");
                }
              }
            },
            pan: {
              enabled: true,
              mode: "x",
              threshold: 2,
              onPan: function () {
                setIsZoomedOrPanned(true);
              }
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            min: startMs,
            max: endMs,
            grid: {
              display: false,
            },
            ticks: {
              color: "#737373",
              font: {
                family: "Inter, sans-serif",
                size: 10,
              },
              callback: function (value: any) {
                const d = new Date(value);
                const scale = (this as any).chart.scales.x;
                const minVal = scale.min;
                const maxVal = scale.max;
                const diffMs = maxVal - minVal;
                const diffDays = diffMs / (24 * 3600 * 1000);

                if (diffDays > 30) {
                  return `T${d.getMonth() + 1}/${d.getFullYear()}`;
                } else if (diffDays > 1.5) {
                  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
                } else if (diffDays > 0.15) {
                  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                } else {
                  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
                }
              }
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "#f5f5f5"
            },
            border: { display: false },
            ticks: {
              color: "#737373",
              font: {
                family: "Inter, sans-serif",
                size: 10,
              },
              callback: function (value: any) {
                if (value >= 1000000) {
                  return value / 1000000 + "M đ";
                }
                if (value >= 1000) {
                  return value / 1000 + "k đ";
                }
                return value + " đ";
              }
            }
          }
        }
      } as any
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [uiState, dashboardData, activeFilter, customFrom, customTo]);

  // Bộ lọc tùy chỉnh ngày
  const handleApplyCustomDate = () => {
    if (!customFrom || !customTo) {
      toast.warning("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.");
      return;
    }
    if (new Date(customFrom) > new Date(customTo)) {
      toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }
    loadDashboardData('custom', customFrom, customTo);
  };

  const handleCloseCustomDate = () => {
    setIsCustomDateOpen(false);
    setActiveFilter('7days');
  };

  // Định dạng tiện tệ VND
  const formatVND = (value: any) => {
    if (value === undefined || value === null) return "0 đ";
    const num = parseFloat(String(value));
    return new Intl.NumberFormat("vi-VN").format(num) + " đ";
  };

  // Định dạng số
  const formatNumber = (value: any) => {
    if (value === undefined || value === null) return "0";
    return new Intl.NumberFormat("vi-VN").format(Number(value));
  };

  // Định dạng ngày giờ Việt Nam
  const formatDateTime = (isoString?: string) => {
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

  const getBtnClass = (filter: string) => 
    activeFilter === filter 
      ? "px-3.5 py-1.5 text-xs font-semibold rounded-full bg-ink text-white transition-colors shadow-sm cursor-pointer"
      : "px-3.5 py-1.5 text-xs font-semibold rounded-full text-mid-gray hover:text-ink transition-colors bg-transparent cursor-pointer";

  // Chuẩn bị các cấu trúc mảng cho Stacked Bars (course & user)
  const totalCourses = dashboardData?.dashboard?.data?.summary?.total_courses || 0;
  const courseStatuses = useMemo(() => {
    const status = dashboardData?.dashboard?.data?.course_status || {};
    return [
      {
        key: "published",
        label: "Đã xuất bản",
        code: "published",
        count: status.published || 0,
        colorClass: "bg-success",
        textClass: "text-success",
        bgSoftClass: "bg-success-soft/60",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        ),
        link: "courses.html?status=published"
      },
      {
        key: "pending_review",
        label: "Chờ duyệt",
        code: "pending_review",
        count: status.pending_review || 0,
        colorClass: "bg-warning",
        textClass: "text-warning",
        bgSoftClass: "bg-warning-soft/60",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        ),
        link: "courses.html?status=pending_review"
      },
      {
        key: "draft",
        label: "Bản nháp",
        code: "draft",
        count: status.draft || 0,
        colorClass: "bg-mid-gray",
        textClass: "text-mid-gray",
        bgSoftClass: "bg-canvas border-hairline/10",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>
          </svg>
        ),
        link: "courses.html?status=draft"
      },
      {
        key: "approved",
        label: "Đã duyệt",
        code: "approved",
        count: status.approved || 0,
        colorClass: "bg-blue-600",
        textClass: "text-blue-600",
        bgSoftClass: "bg-blue-50/60",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        ),
        link: "courses.html?status=approved"
      },
      {
        key: "rejected",
        label: "Từ chối",
        code: "rejected",
        count: status.rejected || 0,
        colorClass: "bg-danger-brick",
        textClass: "text-danger-brick",
        bgSoftClass: "bg-danger-brick-soft/40",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        link: "courses.html?status=rejected"
      },
      {
        key: "hidden",
        label: "Đang ẩn",
        code: "hidden",
        count: status.hidden || 0,
        colorClass: "bg-mid-gray",
        textClass: "text-ink-soft",
        bgSoftClass: "bg-canvas",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 01-1.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/>
          </svg>
        ),
        link: "courses.html?status=hidden"
      }
    ];
  }, [dashboardData]);

  const totalUsers = dashboardData?.dashboard?.data?.summary?.total_users || 0;
  const userStatuses = useMemo(() => {
    const status = dashboardData?.dashboard?.data?.user_status || {};
    return [
      {
        key: "active",
        label: "Đang hoạt động",
        code: "active",
        count: status.active || 0,
        colorClass: "bg-success",
        textClass: "text-success",
        bgSoftClass: "bg-success-soft/40",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        ),
        link: "users.html?status=active"
      },
      {
        key: "inactive",
        label: "Chưa kích hoạt",
        code: "inactive",
        count: status.inactive || 0,
        colorClass: "bg-mid-gray",
        textClass: "text-mid-gray",
        bgSoftClass: "bg-canvas",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        ),
        link: "users.html?status=inactive"
      },
      {
        key: "locked",
        label: "Đang bị khóa",
        code: "locked",
        count: status.locked || 0,
        colorClass: "bg-danger-brick",
        textClass: "text-danger-brick",
        bgSoftClass: "bg-danger-brick-soft/40",
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        ),
        link: "users.html?status=locked"
      }
    ];
  }, [dashboardData]);

  // Công việc cần xử lý
  const actionItemsList = useMemo(() => {
    const actions = dashboardData?.dashboard?.data?.action_required || {};
    
    return [
      {
        count: actions.pending_course_reviews || 0,
        title: "Khóa học chờ duyệt",
        desc: `${actions.pending_course_reviews || 0} khóa học mới cần kiểm duyệt`,
        btnText: "Duyệt ngay",
        link: `/admin/course-reviews`,
        borderClass: "border-l-3 border-warning",
        badgeClass: "bg-warning-soft text-warning border border-warning/10",
        btnClass: "bg-success text-white hover:opacity-90"
      },
      {
        count: actions.pending_instructor_upgrades || 0,
        title: "Yêu cầu nâng giảng viên",
        desc: `${actions.pending_instructor_upgrades || 0} hồ sơ đăng ký cần xác minh`,
        btnText: "Xử lý",
        link: `/admin/instructor-upgrades`,
        borderClass: "border-l-3 border-warning",
        badgeClass: "bg-warning-soft text-warning border border-warning/10",
        btnClass: "bg-warning text-white hover:opacity-90"
      },
      {
        count: actions.pending_withdrawals || 0,
        title: "Yêu cầu rút tiền",
        desc: `${actions.pending_withdrawals || 0} lệnh rút tiền đang chờ xử lý`,
        btnText: "Chi tiền",
        link: `/admin/withdrawals`,
        borderClass: "border-l-3 border-danger-brick",
        badgeClass: "bg-danger-brick-soft text-danger-brick border border-danger-brick/10",
        btnClass: "bg-danger-brick text-white hover:opacity-90"
      },
      {
        count: actions.pending_payout_accounts || 0,
        title: "Tài khoản nhận tiền",
        desc: `${actions.pending_payout_accounts || 0} tài khoản ngân hàng chờ xác minh`,
        btnText: "Xác minh",
        link: `/admin/payout-accounts`,
        borderClass: "border-l-3 border-success",
        badgeClass: "bg-success-soft text-success border border-success/10",
        btnClass: "bg-success text-white hover:opacity-90"
      }
    ].filter(item => item.count > 0);
  }, [dashboardData]);

  // Bộ lọc hiển thị nhãn của query
  const getFilterLabel = () => {
    if (activeFilter === '7days') return '7 ngày qua';
    if (activeFilter === '30days') return '30 ngày qua';
    if (activeFilter === 'thisMonth') return 'Tháng này';
    if (activeFilter === 'thisYear') return 'Năm nay';
    return 'Tùy chọn';
  };

  return (
    <div className="space-y-4 max-w-[1280px] w-full mx-auto animate-none">
      {/* Page Title & Filter Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between shrink-0">
        <div>
          <h1 className="text-[30px] lg:text-[32px] font-bold tracking-tight text-ink leading-tight">
            Dashboard Tổng quan
          </h1>
          <p className="text-xs text-mid-gray mt-0.5">
            Báo cáo hiệu suất hoạt động và kinh doanh hệ thống MindHub.
          </p>
        </div>
        
        {/* Time & Custom Date Filters */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {/* Presets */}
          <div className="flex items-center gap-0.5 p-1 bg-paper border border-hairline rounded-full shadow-sm select-none">
            <button
              type="button"
              onClick={() => { setActiveFilter('7days'); setIsCustomDateOpen(false); }}
              className={getBtnClass('7days')}
            >
              7 ngày qua
            </button>
            <button
              type="button"
              className={getBtnClass('30days')}
              onClick={() => { setActiveFilter('30days'); setIsCustomDateOpen(false); }}
            >
              30 ngày qua
            </button>
            <button
              type="button"
              className={getBtnClass('thisMonth')}
              onClick={() => { setActiveFilter('thisMonth'); setIsCustomDateOpen(false); }}
            >
              Tháng này
            </button>
            <button
              type="button"
              className={getBtnClass('thisYear')}
              onClick={() => { setActiveFilter('thisYear'); setIsCustomDateOpen(false); }}
            >
              Năm nay
            </button>
            <button
              type="button"
              className={getBtnClass('custom')}
              onClick={() => { setActiveFilter('custom'); setIsCustomDateOpen(true); }}
            >
              Tùy chọn
            </button>
          </div>

          {/* Custom date range */}
          {isCustomDateOpen && (
            <div className="flex items-center justify-center gap-6 p-1 px-4 bg-paper border border-hairline rounded-full shadow-sm text-xs text-mid-gray w-[430px] shrink-0">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="bg-transparent border-none text-ink focus:outline-none text-xs w-[100px] outline-none"
                aria-label="Từ ngày"
              />
              <span>đến</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="bg-transparent border-none text-ink focus:outline-none text-xs w-[100px] outline-none"
                aria-label="Đến ngày"
              />
              <button
                type="button"
                onClick={handleApplyCustomDate}
                className="px-3.5 py-1 bg-ink text-white rounded-full text-[10px] font-medium hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              >
                Lọc
              </button>
              <button
                type="button"
                onClick={handleCloseCustomDate}
                className="p-1 hover:bg-canvas rounded-full transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                aria-label="Đóng bộ lọc"
              >
                <svg className="w-3 h-3 text-mid-gray hover:text-ink" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {uiState === 'loading' ? (
        /* ==================== LOADING SKELETON ==================== */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[110px]">
                <div className="h-3.5 w-28 bg-canvas rounded-full skeleton" />
                <div className="h-8 w-20 bg-canvas rounded-full skeleton" />
                <div className="h-3 w-36 bg-canvas rounded-full skeleton" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-[6px] border border-hairline bg-paper p-3.5 shadow-subtle space-y-2 min-h-[96px]">
                <div className="h-2 w-16 bg-canvas rounded-full skeleton" />
                <div className="h-4 w-20 bg-canvas rounded-full skeleton" />
              </div>
            ))}
          </div>
        </div>
      ) : uiState === 'empty' ? (
        /* ==================== EMPTY STATE ==================== */
        <div className="rounded-[6px] border border-hairline bg-paper p-8 text-center shadow-subtle">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-mid-gray">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <h3 className="mt-3.5 text-sm font-semibold text-ink">Không có dữ liệu</h3>
          <p className="mt-1.5 text-xs text-mid-gray max-w-sm mx-auto">
            Không tìm thấy thông tin hoặc hoạt động nào trong khoảng thời gian này. Vui lòng chọn một khoảng thời gian khác hoặc kiểm tra lại sau.
          </p>
        </div>
      ) : uiState === 'error' ? (
        /* ==================== ERROR STATE ==================== */
        <div className="rounded-[6px] border border-ember/25 bg-red-50/50 p-6 text-center shadow-subtle border-dashed">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-ember">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-3.5 text-sm font-semibold text-ember">Lỗi kết nối dữ liệu</h3>
          <p className="mt-1.5 text-xs text-red-700 max-w-sm mx-auto">
            Đã xảy ra sự cố khi tải dữ liệu từ API giả lập. Vui lòng kiểm tra lại kết nối máy chủ.
          </p>
          <button
            type="button"
            onClick={() => loadDashboardData(activeFilter)}
            className="mt-3 inline-flex h-8 items-center rounded-full bg-ink px-4 text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : uiState === 'forbidden' ? (
        /* ==================== FORBIDDEN STATE ==================== */
        <div className="rounded-[6px] border border-ember/25 bg-red-50/50 p-6 text-center shadow-subtle border-dashed">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-ember">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="mt-3.5 text-sm font-semibold text-ember">Truy cập bị từ chối (403 Forbidden)</h3>
          <p className="mt-1.5 text-xs text-red-700 max-w-sm mx-auto">
            Tài khoản quản trị của bạn không có đủ quyền hạn để truy cập thông tin bảng điều khiển tổng quan này.
          </p>
          <a
            href="/"
            className="mt-3 inline-flex h-8 items-center rounded-full bg-ink px-4 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Quay về trang chủ
          </a>
        </div>
      ) : dashboardData ? (
        /* ==================== LOADED CONTENT ==================== */
        <div id="dashboard-content-wrapper" className="space-y-4 animate-none">
          
          {/* 1. KPI chính */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-none">
            
            {/* KPI: Tổng người dùng */}
            <button
              onClick={() => navigate(`/admin/users`)}
              className="text-left w-full block rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle hover:border-mid-gray/40 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Tổng người dùng</span>
                <div className="text-ink shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-none font-sans">
                  {formatNumber(dashboardData.dashboard.data.summary.total_users)}
                </span>
              </div>
              <div className="w-full bg-canvas h-1 rounded-full mt-2.5 overflow-hidden flex">
                <div 
                  className="bg-ink h-full rounded-l-full" 
                  style={{
                    width: `${
                      dashboardData.dashboard.data.summary.total_users > 0 
                        ? (dashboardData.dashboard.data.summary.total_learners / dashboardData.dashboard.data.summary.total_users) * 100 
                        : 0
                    }%`
                  }}
                />
                <div 
                  className="bg-mid-gray h-full rounded-r-full" 
                  style={{
                    width: `${
                      dashboardData.dashboard.data.summary.total_users > 0 
                        ? (dashboardData.dashboard.data.summary.total_instructors / dashboardData.dashboard.data.summary.total_users) * 100 
                        : 0
                    }%`
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-mid-gray">
                {formatNumber(dashboardData.dashboard.data.summary.total_learners)} học viên • {formatNumber(dashboardData.dashboard.data.summary.total_instructors)} giảng viên
              </p>
            </button>
 
            {/* KPI: Tổng khóa học */}
            <button
              onClick={() => navigate(`/admin/courses`)}
              className="text-left w-full block rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle hover:border-mid-gray/40 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Tổng khóa học</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-warning-soft text-warning border border-warning/10">
                    {dashboardData.dashboard.data.course_status.pending_review} chờ duyệt
                  </span>
                  <div className="text-ink">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-none font-sans">
                  {formatNumber(dashboardData.dashboard.data.summary.total_courses)}
                </span>
              </div>
              <div className="w-full bg-canvas h-1 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="bg-success h-full rounded-full" 
                  style={{
                    width: `${
                      dashboardData.dashboard.data.summary.total_courses > 0 
                        ? (dashboardData.dashboard.data.summary.total_published_courses / dashboardData.dashboard.data.summary.total_courses) * 100 
                        : 0
                    }%`
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-mid-gray">
                {formatNumber(dashboardData.dashboard.data.summary.total_published_courses)} đã xuất bản
              </p>
            </button>
 
            {/* KPI: Tổng lượt ghi danh */}
            <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Tổng lượt ghi danh</span>
                <div className="text-ink shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-none font-sans">
                  {formatNumber(dashboardData.dashboard.data.summary.total_enrollments)}
                </span>
              </div>
              <div className="w-full bg-canvas h-1 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="bg-success h-full rounded-full" 
                  style={{ width: `${dashboardData.dashboard.data.summary.completion_rate}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-mid-gray">
                {formatNumber(dashboardData.dashboard.data.summary.completed_enrollments)} hoàn thành • Tỉ lệ {dashboardData.dashboard.data.summary.completion_rate}%
              </p>
            </div>
 
            {/* KPI: Tổng đơn hàng */}
            <button
              onClick={() => navigate(`/admin/orders`)}
              className="text-left w-full block rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle hover:border-mid-gray/40 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Tổng đơn hàng</span>
                <div className="text-ink shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink leading-none font-sans">
                  {formatNumber(dashboardData.dashboard.data.summary.total_orders)}
                </span>
              </div>
              <div className="w-full bg-canvas h-1 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="bg-success h-full rounded-full" 
                  style={{
                    width: `${
                      dashboardData.dashboard.data.summary.total_orders > 0 
                        ? (dashboardData.dashboard.data.summary.paid_orders / dashboardData.dashboard.data.summary.total_orders) * 100 
                        : 0
                    }%`
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-mid-gray">
                {formatNumber(dashboardData.dashboard.data.summary.paid_orders)} đã thanh toán
              </p>
            </button>

          </div>

          {/* 2. KPI tài chính phụ */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            
            {/* Doanh thu gộp */}
            <div className="rounded-[6px] border border-hairline bg-paper p-3.5 shadow-subtle flex flex-col justify-between min-h-[96px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">Doanh thu gộp</span>
                <div className="text-success shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306 8.9-8.91M22.5 9.75V2.25h-7.5" />
                  </svg>
                </div>
              </div>
              <p className="text-base md:text-[17px] font-bold text-ink mt-2.5 font-sans leading-tight">
                {formatVND(dashboardData.dashboard.data.revenue.gross_amount)}
              </p>
            </div>

            {/* Thu nhập giảng viên */}
            <div className="rounded-[6px] border border-hairline bg-paper p-3.5 shadow-subtle flex flex-col justify-between min-h-[96px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">Thu nhập giảng viên</span>
                <div className="text-mid-gray shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
              </div>
              <p className="text-base md:text-[17px] font-bold text-ink mt-2.5 font-sans leading-tight">
                {formatVND(dashboardData.dashboard.data.revenue.instructor_amount)}
              </p>
            </div>

            {/* Phí nền tảng */}
            <div className="rounded-[6px] border border-hairline bg-paper p-3.5 shadow-subtle flex flex-col justify-between min-h-[96px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">Phí nền tảng</span>
                <div className="text-mid-gray shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3 3m12 12V19.5M15 15h4.5m-4.5 0 6 6" />
                  </svg>
                </div>
              </div>
              <p className="text-base md:text-[17px] font-bold text-ink mt-2.5 font-sans leading-tight">
                {formatVND(dashboardData.dashboard.data.revenue.platform_fee_amount)}
              </p>
            </div>

            {/* Rút tiền chờ duyệt */}
            <button
              onClick={() => navigate(`/admin/withdrawals?status=pending`)}
              className="text-left w-full block rounded-[6px] border border-hairline bg-paper p-3.5 shadow-subtle hover:border-mid-gray/40 transition-all group flex flex-col justify-between min-h-[96px] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">
                  Chờ duyệt rút
                  <span className="text-warning font-bold font-sans ml-0.5">
                    ({dashboardData.dashboard.data.withdrawal_summary.pending_count})
                  </span>
                </h3>
                <div className="text-warning shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2.5">
                <p className="text-base md:text-[17px] font-bold text-ink font-sans leading-tight">
                  {formatVND(dashboardData.dashboard.data.withdrawal_summary.pending_amount)}
                </p>
                <span className="text-[9px] text-warning mt-1 leading-tight font-medium block">
                  {dashboardData.dashboard.data.withdrawal_summary.pending_count} yêu cầu đang chờ duyệt
                </span>
              </div>
            </button>
 
            {/* Đã duyệt chờ chi */}
            <button
              onClick={() => navigate(`/admin/withdrawals?status=approved`)}
              className="text-left w-full block rounded-[6px] border border-hairline bg-paper p-3.5 shadow-subtle hover:border-mid-gray/40 transition-all group flex flex-col justify-between min-h-[96px] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">
                  Chờ thanh toán
                  <span className="text-danger-brick font-bold font-sans ml-0.5">
                    ({dashboardData.dashboard.data.withdrawal_summary.approved_count})
                  </span>
                </h3>
                <div className="text-danger-brick shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2.5">
                <p className="text-base md:text-[17px] font-bold text-ink font-sans leading-tight">
                  {formatVND(dashboardData.dashboard.data.withdrawal_summary.approved_amount)}
                </p>
                <span className="text-[9px] text-danger-brick mt-1 leading-tight font-medium block">
                  {dashboardData.dashboard.data.withdrawal_summary.approved_count} yêu cầu đã duyệt, chờ chi
                </span>
              </div>
            </button>
 
            {/* Đã thanh toán cho GV */}
            <button
              onClick={() => navigate(`/admin/withdrawals?status=paid`)}
              className="text-left w-full block rounded-[6px] border border-hairline bg-paper p-3.5 shadow-subtle hover:border-mid-gray/40 transition-all group flex flex-col justify-between min-h-[96px] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-mid-gray uppercase tracking-wider">Đã chi trả giảng viên</span>
                <div className="text-success shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
              </div>
              <p className="text-base md:text-[17px] font-bold text-ink mt-2.5 font-sans leading-tight">
                {formatVND(dashboardData.dashboard.data.withdrawal_summary.paid_amount)}
              </p>
            </button>

          </div>

          {/* 3. Panel Trạng thái khóa học & Trạng thái người dùng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Phân bổ trạng thái khóa học */}
            <div id="course-status-panel" className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col gap-3 min-h-[340px]">
              <div className="shrink-0">
                <h3 className="text-xs font-bold text-mid-gray uppercase tracking-wider">Phân bổ trạng thái khóa học</h3>
                <p className="text-[11px] text-mid-gray mt-0.5">
                  <span className="font-bold text-ink font-sans">{formatNumber(totalCourses)}</span> khóa học · {getFilterLabel()}
                </p>
              </div>

              {/* Stacked Distribution Bar */}
              <div className="flex h-2 w-full bg-canvas rounded-full overflow-hidden shrink-0 mt-0.5 shadow-inner">
                {courseStatuses.map(status => {
                  const percent = totalCourses > 0 ? (status.count / totalCourses) * 100 : 0;
                  if (percent === 0) return null;
                  return (
                    <div 
                      key={status.key} 
                      className={cn(status.colorClass, "h-full")} 
                      style={{ width: `${percent}%` }} 
                      title={`${status.label}: ${formatNumber(status.count)} (${percent.toFixed(0)}%)`}
                    />
                  );
                })}
                {totalCourses === 0 && <div className="bg-hairline w-full h-full" />}
              </div>

              {/* Grid 2 cột danh sách chi tiết */}
              <div className="grid grid-cols-2 gap-2 flex-grow overflow-y-auto pr-0.5 mt-1.5 custom-scrollbar">
                {courseStatuses.map(status => {
                  const percent = totalCourses > 0 ? (status.count / totalCourses) * 100 : 0;
                  return (
                    <button 
                      key={status.key} 
                      onClick={() => navigate(`/admin/courses?status=${status.code}`)}
                      className="text-left w-full flex flex-col justify-between p-2.5 bg-paper hover:bg-canvas/30 border border-hairline rounded-[6px] transition-all hover:border-mid-gray/30 group cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-1 w-full">
                        <div className="flex items-start gap-1.5 min-w-0">
                          <div className={cn("flex h-5 w-5 items-center justify-center rounded-full shrink-0 border border-current/10", status.textClass, status.bgSoftClass)}>
                            {status.icon}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-ink block leading-tight truncate group-hover:underline">{status.label}</span>
                            <span className="text-[9px] text-mid-gray font-mono block leading-none mt-0.5 truncate">{status.code}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-ink font-sans block leading-tight">{formatNumber(status.count)}</span>
                          <span className="text-[9px] text-mid-gray block leading-none mt-0.5">{percent.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-canvas h-1 rounded-full mt-2 overflow-hidden shrink-0">
                        <div className={cn(status.colorClass, "h-full rounded-full")} style={{ width: `${percent}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trạng thái người dùng */}
            <div id="user-status-panel" className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex flex-col gap-3 min-h-[340px]">
              <div className="shrink-0">
                <h3 className="text-xs font-bold text-mid-gray uppercase tracking-wider">Trạng thái tài khoản người dùng</h3>
                <p className="text-[11px] text-mid-gray mt-0.5">
                  <span className="font-bold text-ink font-sans">{formatNumber(totalUsers)}</span> người dùng · {getFilterLabel()}
                </p>
              </div>

              {/* Stacked Distribution Bar */}
              <div className="flex h-2 w-full bg-canvas rounded-full overflow-hidden shrink-0 mt-0.5 shadow-inner">
                {userStatuses.map(status => {
                  const percent = totalUsers > 0 ? (status.count / totalUsers) * 100 : 0;
                  if (percent === 0) return null;
                  return (
                    <div 
                      key={status.key} 
                      className={cn(status.colorClass, "h-full")} 
                      style={{ width: `${percent}%` }} 
                      title={`${status.label}: ${formatNumber(status.count)} (${percent.toFixed(0)}%)`}
                    />
                  );
                })}
                {totalUsers === 0 && <div className="bg-hairline w-full h-full" />}
              </div>

              {/* Flex Column danh sách chi tiết */}
              <div className="flex flex-col gap-2 flex-grow justify-center mt-1.5">
                {userStatuses.map(status => {
                  const percent = totalUsers > 0 ? (status.count / totalUsers) * 100 : 0;
                  return (
                    <button 
                      key={status.key} 
                      onClick={() => navigate(`/admin/users?status=${status.code}`)}
                      className="text-left w-full flex flex-col justify-between p-2.5 bg-paper hover:bg-canvas/30 border border-hairline rounded-[6px] transition-all hover:border-mid-gray/30 group cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={cn("flex h-6 w-6 items-center justify-center rounded-full shrink-0 border border-current/10", status.textClass, status.bgSoftClass)}>
                            {status.icon}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-ink block leading-tight group-hover:underline truncate">{status.label}</span>
                            <span className="text-[10px] text-mid-gray font-mono block leading-none mt-0.5 truncate">{status.code}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-ink font-sans block leading-tight">{formatNumber(status.count)}</span>
                          <span className="text-[10px] text-mid-gray block leading-none mt-0.5">{percent.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-canvas h-1.5 rounded-full mt-2 overflow-hidden shrink-0">
                        <div className={cn(status.colorClass, "h-full rounded-full")} style={{ width: `${percent}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Khu vực biểu đồ & Công việc */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Khung biểu đồ doanh thu */}
            <div className="rounded-[6px] border border-border-strong bg-paper p-4 shadow-sm lg:col-span-2 flex flex-col justify-between relative min-w-0">
              <div className="flex items-start justify-between mb-2.5">
                <div className="border-l-3 border-success pl-2.5">
                  <h2 className="text-sm font-semibold text-ink leading-snug">
                    Biểu đồ Doanh thu & Phí nền tảng
                  </h2>
                  <p className="text-[11px] text-mid-gray mt-0.5 leading-normal">
                    Xu hướng biến động tài chính theo bộ lọc thời gian (Kéo để Pan, Cuộn để Zoom)
                  </p>
                </div>
                {isZoomedOrPanned && (
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="px-2.5 py-1 text-[10px] font-semibold bg-canvas hover:bg-hairline text-ink border border-hairline rounded-full shadow-sm transition-colors cursor-pointer shrink-0"
                  >
                    Đặt lại biểu đồ
                  </button>
                )}
              </div>

              {/* Vùng vẽ biểu đồ */}
              <div className="mt-3.5 h-60 w-full relative">
                <canvas 
                  ref={canvasRef} 
                  id="revenue-chart-canvas"
                  className="w-full h-full"
                  style={{ cursor: isDragging ? 'grabbing' : (isZoomedOrPanned ? 'grab' : 'default') }}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                ></canvas>
                {/* Chart empty state overlay */}
                <div id="chart-empty-state" className="hidden absolute inset-0 bg-paper/90 flex flex-col items-center justify-center text-center z-10">
                  <p className="text-xs font-semibold text-mid-gray">Không có dữ liệu biểu đồ</p>
                </div>
              </div>
            </div>

            {/* Khung công việc cần xử lý */}
            <div className="rounded-[6px] border border-border-strong bg-paper p-4 shadow-sm flex flex-col">
              <div className="border-l-3 border-warning pl-2.5 mb-2.5">
                <h2 className="text-sm font-semibold text-ink leading-snug">Công việc cần xử lý</h2>
                <p className="text-[11px] text-mid-gray mt-0.5 leading-normal">
                  Các nhiệm vụ đang chờ quản trị viên phản hồi
                </p>
              </div>

              {/* Actions container */}
              <div id="actions-container" className="mt-3.5 space-y-2 flex-1 overflow-y-auto max-h-60 custom-scrollbar pr-1 animate-none">
                {actionItemsList.length > 0 ? (
                  actionItemsList.map((item, idx) => (
                    <div key={idx} className={cn("flex items-center justify-between p-3 rounded-[6px] bg-canvas border border-hairline/40 hover:bg-hairline/30 transition-colors", item.borderClass)}>
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-ink">{item.title}</span>
                          <span className={cn(item.badgeClass, "text-[9.5px] font-bold px-1.5 py-0.5 rounded-full")}>
                            {item.count}
                          </span>
                        </div>
                        <p className="text-[10px] text-mid-gray mt-1 leading-normal">{item.desc}</p>
                      </div>
                      <button onClick={() => navigate(item.link)} className={cn("inline-flex h-7 items-center rounded-full px-3 text-[10px] font-semibold shrink-0 transition-opacity cursor-pointer border-none", item.btnClass)}>
                        {item.btnText}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="h-28 flex flex-col items-center justify-center text-center">
                    <svg className="w-6 h-6 text-mid-gray/40 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m4.5 12.75 6 6 9-13.5"/>
                    </svg>
                    <p className="text-[11px] text-mid-gray">Đã hoàn thành mọi công việc cần xử lý!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 5. Rankings & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* Cột 1: Xếp hạng khóa học */}
            <div className="rounded-[6px] border border-border-strong bg-paper p-4 shadow-sm flex flex-col">
              <div className="border-l-3 border-success pl-2.5 mb-2.5">
                <h2 className="text-sm font-semibold text-ink leading-snug">Top khóa học tiêu biểu</h2>
                <p className="text-[11px] text-mid-gray mt-0.5 leading-normal">
                  Xếp hạng theo tổng doanh thu bán khóa học
                </p>
              </div>
              <div className="mt-2.5 overflow-x-auto flex-1 max-h-80 custom-scrollbar pr-1">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-hairline text-mid-gray font-medium">
                      <th className="pb-1.5 w-6">#</th>
                      <th className="pb-1.5">Khóa học</th>
                      <th className="pb-1.5 text-right">Lượt bán</th>
                      <th className="pb-1.5 text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody id="top-selling-courses-container" className="divide-y divide-hairline">
                    {(dashboardData?.top_courses?.data?.items || []).length > 0 ? (
                      (dashboardData?.top_courses?.data?.items || []).map((course: any, idx: number) => (
                        <tr 
                          key={idx} 
                          onClick={() => navigate(`/admin/courses?open_course_id=${course.course_id}`)}
                          className={cn("hover:bg-canvas/50 transition-colors cursor-pointer", idx === 0 ? "bg-success-soft/30 border-l-2 border-success" : "")}
                        >
                          <td className="py-2.5 pl-2 font-semibold text-mid-gray">#{idx + 1}</td>
                          <td className="py-2.5 font-medium text-ink">
                            <span className="block truncate max-w-[130px] font-semibold hover:underline" title={course.title}>
                              {course.title}
                            </span>
                            <span className="block text-[9px] text-mid-gray font-normal truncate">
                              Giảng viên: {course.instructor_name}
                            </span>
                          </td>
                          <td className="py-2.5 text-right text-mid-gray font-sans">
                            {formatNumber(course.sales_count)}
                          </td>
                          <td className="py-2.5 text-right font-semibold text-success font-sans">
                            {formatVND(course.gross_revenue)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-mid-gray">Không có khóa học nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cột 2: Giảng viên doanh thu cao */}
            <div className="rounded-[6px] border border-border-strong bg-paper p-4 shadow-sm flex flex-col">
              <div className="border-l-3 border-ink pl-2.5 mb-2.5">
                <h2 className="text-sm font-semibold text-ink leading-snug">Giảng viên nổi bật</h2>
                <p className="text-[11px] text-mid-gray mt-0.5 leading-normal">
                  Xếp hạng theo doanh thu gộp nhận được
                </p>
              </div>
              <div className="mt-2.5 overflow-x-auto flex-1 max-h-80 custom-scrollbar pr-1">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-hairline text-mid-gray font-medium">
                      <th className="pb-1.5">Giảng viên</th>
                      <th className="pb-1.5 text-right">Khóa học</th>
                      <th className="pb-1.5 text-right">Thu nhập giảng viên</th>
                    </tr>
                  </thead>
                  <tbody id="top-instructors-container" className="divide-y divide-hairline">
                    {(dashboardData?.top_instructors?.data?.items || []).length > 0 ? (
                      (dashboardData?.top_instructors?.data?.items || []).map((inst: any, idx: number) => {
                        const initials = inst.full_name.split(" ").pop()?.substring(0, 2).toUpperCase() || "GV";
                        return (
                          <tr 
                            key={idx} 
                            onClick={() => navigate(`/admin/users?role=instructor&open_user_id=${inst.instructor_id}`)}
                            className={cn("hover:bg-canvas/50 transition-colors cursor-pointer", idx === 0 ? "bg-canvas/30 border-l-2 border-ink" : "")}
                          >
                            <td className="py-2.5 font-medium text-ink flex items-center gap-2 pl-2">
                              <span className="h-6.5 w-6.5 rounded-full bg-ink text-white font-semibold flex items-center justify-center text-[9px] shrink-0 select-none">
                                {initials}
                              </span>
                              <div className="truncate max-w-[90px]">
                                <span className="font-semibold text-ink block truncate hover:underline">{inst.full_name}</span>
                                <span className="text-[9px] text-mid-gray block truncate" title={inst.email}>{inst.email || ""}</span>
                              </div>
                            </td>
                            <td className="py-2.5 text-right font-sans">
                              <span className="text-ink font-medium block">{formatNumber(inst.total_courses || 0)} khóa</span>
                              <span className="text-[9px] text-success block mt-0.5">{formatNumber(inst.published_courses || 0)} công khai</span>
                            </td>
                            <td className="py-2.5 text-right font-semibold text-success font-sans">
                              {formatVND(inst.instructor_amount)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-mid-gray">Không có giảng viên nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cột 3: Hoạt động gần đây */}
            <div className="rounded-[6px] border border-border-strong bg-paper p-4 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-hairline pb-2 mb-3">
                <div className="border-l-3 border-mid-gray pl-2.5">
                  <h2 className="text-sm font-semibold text-ink leading-snug">Dữ liệu gần đây</h2>
                  <p className="text-[10px] text-mid-gray mt-0.5 leading-tight">Đơn hàng và khóa học mới</p>
                </div>
                <div className="flex gap-1 p-0.5 bg-canvas rounded-full text-[10px] font-semibold border border-hairline select-none">
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className={cn(
                      "px-2.5 py-1 rounded-full transition-all cursor-pointer",
                      activeTab === 'orders' ? "bg-paper text-ink shadow-sm font-semibold" : "text-mid-gray hover:text-ink bg-transparent"
                    )}
                  >
                    Đơn hàng
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('courses')}
                    className={cn(
                      "px-2.5 py-1 rounded-full transition-all cursor-pointer",
                      activeTab === 'courses' ? "bg-paper text-ink shadow-sm font-semibold" : "text-mid-gray hover:text-ink bg-transparent"
                    )}
                  >
                    Khóa học
                  </button>
                </div>
              </div>

              {/* Timeline Đơn hàng gần đây */}
              {activeTab === 'orders' && (
                <div id="recent-orders-container" className="space-y-3 flex-1 overflow-y-auto max-h-64 custom-scrollbar pr-1">
                  {(dashboardData?.dashboard?.data?.recent?.latest_orders || []).length > 0 ? (
                    (dashboardData?.dashboard?.data?.recent?.latest_orders || []).map((order: any, idx: number) => {
                      const amountFormatted = formatVND(order.amount);
                      const courseTitle = order.course ? order.course.title : "Không rõ khóa học";
                      const learnerName = order.user ? order.user.full_name : (order.learner_name || "Học viên");
                      const paidDateFormatted = formatDateTime(order.paid_at);

                      const status = order.status || "paid";
                      let statusLabel = "Đã thanh toán";
                      let statusClass = "bg-success-soft text-success border border-success/15";
                      let borderClass = "border-l-3 border-success";
                      let amountColor = "text-success";

                      if (status === "pending") {
                        statusLabel = "Chờ xử lý";
                        statusClass = "bg-warning-soft text-warning border border-warning/15";
                        borderClass = "border-l-3 border-warning";
                        amountColor = "text-ink";
                      } else if (status === "failed") {
                        statusLabel = "Thất bại";
                        statusClass = "bg-danger-brick-soft text-danger-brick border border-danger-brick/15";
                        borderClass = "border-l-3 border-danger-brick";
                        amountColor = "text-ink";
                      } else if (status === "cancelled") {
                        statusLabel = "Đã hủy";
                        statusClass = "bg-canvas text-mid-gray border border-hairline";
                        borderClass = "border-l-3 border-mid-gray";
                        amountColor = "text-mid-gray";
                      }

                      return (
                        <div 
                          key={idx} 
                          onClick={() => navigate(`/admin/orders?open_order_id=${order.id}`)}
                          className={cn("relative pl-3.5 pr-2 py-2 border border-hairline/40 rounded-[6px] hover:bg-canvas/40 transition-colors cursor-pointer", borderClass)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xs">
                              <span className="font-bold text-ink hover:underline">Đơn hàng #{order.id}</span>
                              <span className="text-mid-gray font-sans mx-1">·</span>
                              <span className={cn("font-bold font-sans", amountColor)}>{amountFormatted}</span>
                            </div>
                            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", statusClass)}>{statusLabel}</span>
                          </div>
                          <div className="mt-1.5 text-[11px] text-ink leading-snug">
                            Khóa học: <span className="font-semibold text-ink inline-block truncate max-w-[170px]" title={courseTitle}>{courseTitle}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-mid-gray">
                            <span>Học viên: {learnerName}</span>
                            <span className="font-sans text-[9px]">{paidDateFormatted}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[11px] text-mid-gray text-center py-6">Chưa có đơn hàng nào.</p>
                  )}
                </div>
              )}

              {/* Timeline Khóa học gần đây */}
              {activeTab === 'courses' && (
                <div id="recent-courses-container" className="space-y-3 flex-1 overflow-y-auto max-h-64 custom-scrollbar pr-1">
                  {(dashboardData?.dashboard?.data?.recent?.latest_courses || []).length > 0 ? (
                    (dashboardData?.dashboard?.data?.recent?.latest_courses || []).map((course: any, idx: number) => {
                      let statusLabel = "Nháp";
                      let statusClass = "bg-canvas text-mid-gray border border-hairline";
                      let borderClass = "border-l-3 border-mid-gray";

                      if (course.status === "published") {
                        statusLabel = "Đã xuất bản";
                        statusClass = "bg-success-soft text-success border border-success/15";
                        borderClass = "border-l-3 border-success";
                      } else if (course.status === "pending_review") {
                        statusLabel = "Chờ duyệt";
                        statusClass = "bg-warning-soft text-warning border border-warning/15";
                        borderClass = "border-l-3 border-warning";
                      } else if (course.status === "approved") {
                        statusLabel = "Đã duyệt";
                        statusClass = "bg-blue-50 text-blue-700 border border-blue-200";
                        borderClass = "border-l-3 border-blue-600";
                      } else if (course.status === "rejected") {
                        statusLabel = "Từ chối";
                        statusClass = "bg-danger-brick-soft text-danger-brick border border-danger-brick/15";
                        borderClass = "border-l-3 border-danger-brick";
                      }

                      const dateToShow = course.published_at || course.approved_at || course.created_at;
                      const dateFormatted = formatDateTime(dateToShow);

                      return (
                        <div 
                          key={idx} 
                          onClick={() => navigate(`/admin/courses?open_course_id=${course.id}`)}
                          className={cn("relative pl-3.5 pr-2 py-2 border border-hairline/40 rounded-[6px] hover:bg-canvas/40 transition-colors cursor-pointer", borderClass)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-ink text-xs hover:underline truncate max-w-[170px]" title={course.title}>{course.title}</span>
                            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", statusClass)}>{statusLabel}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2 text-[10px] text-mid-gray">
                            <span>Giảng viên: {course.instructor_name}</span>
                            <span className="font-sans text-[9px]">{dateFormatted}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[11px] text-mid-gray text-center py-6">Chưa có khóa học nào.</p>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}
