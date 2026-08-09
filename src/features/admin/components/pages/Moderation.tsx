import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  getModerationItems,
  getModerationItemDetail,
  moderateItem,
} from "@/assets/js/api/moderation-api";
import { showToast } from "@/assets/js/toast";
import { Link, useSearchParams } from "react-router-dom";
import AdminPagination from "../shared/AdminPagination";
import FilterSelect from "./FilterSelect";
import { Filter, X } from "lucide-react";

interface UserInfo {
  id: number;
  full_name: string;
  email: string;
  avatar_url: string | null;
  status: string;
}

interface CourseInfo {
  id: number;
  title: string;
  slug: string;
}

interface LessonInfo {
  id: number;
  title: string;
}

interface OrderInfo {
  id: number;
  order_code: string;
  amount: string;
  status: string;
  payment_status: string;
  paid_at: string | null;
}

interface ReplyItem {
  id: number;
  content: string;
  user_id: number;
  created_at: string;
  user_name: string;
  user_email: string;
  user_role: string;
  user_avatar: string | null;
}

interface ModerationItem {
  id: number;
  target_type: "comment" | "review";
  status: "visible" | "hidden" | "deleted";
  content: string;
  rating: number | null;
  user_id: number;
  course_id: number | null;
  lesson_id: number | null;
  order_id: number | null;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: UserInfo | null;
  course: CourseInfo | null;
  lesson: LessonInfo | null;
  order: OrderInfo | null;
  parent: { id: number; content: string; user_id: number } | null;
  replies: ReplyItem[];
  reply_count: number;
  reply_authors_count: number;
  first_reply_at: string | null;
  latest_reply_at: string | null;
  latest_reply: ReplyItem | null;
  first_response_hours: number | null;
  first_response_minutes: number | null;
  is_response_overdue: boolean;
  overdue_hours: number;
  overdue_minutes: number;
  warning_type: "spam" | "offensive" | null;
  is_warning_unresolved: boolean;
  is_risky_content_visible: boolean;
  is_low_rating_unanswered: boolean;
  is_hidden_unresolved: boolean;
  is_needs_action: boolean;
  priority_level: "critical" | "high" | "medium" | "normal";
}

export default function Moderation() {
  const tableRef = useRef<HTMLElement>(null);

  const scrollToTable = (filterName: string) => {
    showToast(`Đã áp dụng bộ lọc: ${filterName}`, "success");
    setTimeout(() => {
      if (tableRef.current) {
        tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Filters state
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilter = (key: string, value: string | number | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === null || value === "all" || value === "") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }

      if (key !== "page" && key !== "sort_by" && key !== "sort_direction") {
        next.delete("page");
      }

      return next;
    });
  };

  const updateFilters = (updates: Record<string, string | number | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      let isFilterChange = false;
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "all" || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
        if (key !== "page" && key !== "sort_by" && key !== "sort_direction") {
          isFilterChange = true;
        }
      });
      if (isFilterChange) {
        next.delete("page");
      }
      return next;
    });
  };

  const search = searchParams.get("search") || "";
  const [tempSearch, setTempSearch] = useState(search);
  const setSearch = (val: string) => updateFilter("search", val);

  // Sync tempSearch when URL changes
  useEffect(() => {
    setTempSearch(search);
  }, [search]);
  const targetType = searchParams.get("target_type") || "all";
  const setTargetType = (val: string) => updateFilter("target_type", val);
  const status = searchParams.get("status") || "all";
  const setStatus = (val: string) => updateFilter("status", val);
  const replyStatus = searchParams.get("reply_status") || "all";
  const setReplyStatus = (val: string) => updateFilter("reply_status", val);
  const rating = searchParams.get("rating") || "all";
  const setRating = (val: string) => updateFilter("rating", val);
  const timePreset = searchParams.get("time_preset") || "all";
  const setTimePreset = (val: string) => updateFilter("time_preset", val);
  const dateFrom = searchParams.get("date_from") || "";
  const setDateFrom = (val: string) => updateFilter("date_from", val);
  const dateTo = searchParams.get("date_to") || "";
  const setDateTo = (val: string) => updateFilter("date_to", val);
  const page = Number(searchParams.get("page")) || 1;
  const setPage = (val: number) => updateFilter("page", val);
  const perPage = Number(searchParams.get("per_page")) || 20;
  const setPerPage = (val: number) => updateFilter("per_page", val);
  const sortBy = searchParams.get("sort_by") || "created_at";
  const setSortBy = (val: string) => updateFilter("sort_by", val);
  const sortDirection = searchParams.get("sort_direction") || "desc";
  const setSortDirection = (val: string) => updateFilter("sort_direction", val);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Filter Popover state
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const filterPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(event.target as Node)) {
        setFilterPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Course Filter Context (if active)
  const [courseFilter, setCourseFilter] = useState<{
    id: number;
    title: string;
  } | null>(null);

  // Summary counts
  const [summary, setSummary] = useState({
    total_items: 0,
    total_comments: 0,
    total_reviews: 0,
    need_action_count: 0,
    violation_count: 0,
    visible_comments: 0,
    hidden_comments: 0,
    deleted_comments: 0,
    visible_reviews: 0,
    deleted_reviews: 0,
    average_rating: 0.0,
  });

  // Table items & pagination metadata
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeColumnMenu, setActiveColumnMenu] = useState<string | null>(null);

  // Drawer detail state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<
    "comment" | "review" | null
  >(null);
  const [drawerItem, setDrawerItem] = useState<ModerationItem | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Confirm Actions Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalActionItem, setModalActionItem] = useState<ModerationItem | null>(
    null,
  );
  const [modalActionType, setModalActionType] = useState<
    "hide" | "delete" | "restore" | null
  >(null);

  // Dynamic filter chips logic
  const hasFilter = useMemo(() => {
    return (
      search !== "" ||
      targetType !== "all" ||
      status !== "all" ||
      replyStatus !== "all" ||
      rating !== "all" ||
      timePreset !== "all" ||
      dateFrom !== "" ||
      dateTo !== "" ||
      courseFilter !== null
    );
  }, [
    search,
    targetType,
    status,
    replyStatus,
    rating,
    timePreset,
    dateFrom,
    dateTo,
    courseFilter,
  ]);

  // Load list
  const loadData = async (isRef = false) => {
    try {
      if (isRef) setRefreshing(true);
      else setLoading(true);

      const params: any = {
        page,
        per_page: perPage,
        search,
        target_type: targetType,
        status,
        reply_status: replyStatus,
        rating,
        time_preset: timePreset,
        date_from: dateFrom,
        date_to: dateTo,
        sort_by: sortBy,
        sort_direction: sortDirection,
      };

      if (courseFilter) {
        params.course_id = courseFilter.id;
      }

      const res = await getModerationItems(params);
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setSummary(
          res.data.summary || {
            total_items: 0,
            total_comments: 0,
            total_reviews: 0,
            need_action_count: 0,
            violation_count: 0,
            visible_comments: 0,
            hidden_comments: 0,
            deleted_comments: 0,
            visible_reviews: 0,
            deleted_reviews: 0,
            average_rating: 0.0,
          },
        );
        setMeta(
          res.meta || {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 0,
          },
        );
      } else {
        showToast({
          type: "error",
          title: "Lỗi tải dữ liệu",
          message: res.message || "Không thể lấy dữ liệu.",
        });
      }
    } catch (err: any) {
      console.error(err);
      showToast({
        type: "error",
        title: "Lỗi hệ thống",
        message: err.message || "Lỗi không xác định.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sync data fetch on filters change
  useEffect(() => {
    loadData();
  }, [
    page,
    perPage,
    search,
    targetType,
    status,
    replyStatus,
    rating,
    timePreset,
    dateFrom,
    dateTo,
    sortBy,
    sortDirection,
    courseFilter,
  ]);

  // Handle Search Input Submission or trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempSearch !== search) {
      setSearch(tempSearch);
    }
  };

  const activeSecondaryFiltersCount = (replyStatus !== "all" ? 1 : 0) + (rating !== "all" ? 1 : 0);
  const hasSecondaryFilters = activeSecondaryFiltersCount > 0;

  // Handle Reset Filters
  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    setTempSearch("");
    setCourseFilter(null);
  };

  const handleResetSecondaryFilters = () => {
    setReplyStatus("all");
    setRating("all");
  };

  // Handle Detail Drawer Open
  const openDrawer = async (item: ModerationItem) => {
    setSelectedItemId(item.id);
    setSelectedItemType(item.target_type);
    setDrawerOpen(true);
    setDrawerLoading(true);

    try {
      const res = await getModerationItemDetail(item.target_type, item.id);
      if (res.success && res.data) {
        setDrawerItem(res.data);
      } else {
        showToast({
          type: "error",
          title: "Lỗi",
          message: res.message || "Không thể lấy thông tin chi tiết.",
        });
      }
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Lỗi hệ thống",
        message: err.message || "Lỗi tải chi tiết.",
      });
    } finally {
      setDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerItem(null);
    setSelectedItemId(null);
    setSelectedItemType(null);
  };

  // Handle moderate status action
  const triggerAction = (
    item: ModerationItem,
    type: "hide" | "delete" | "restore",
  ) => {
    setModalActionItem(item);
    setModalActionType(type);
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!modalActionItem || !modalActionType) return;

    let targetStatus: "visible" | "hidden" | "deleted" = "visible";
    if (modalActionType === "hide") targetStatus = "hidden";
    else if (modalActionType === "delete") targetStatus = "deleted";
    else if (modalActionType === "restore") targetStatus = "visible";

    try {
      const res = await moderateItem(modalActionItem.id, {
        target_type: modalActionItem.target_type,
        status: targetStatus,
      });

      if (res.success) {
        showToast({
          type: "success",
          title: "Thành công",
          message: "Trạng thái đã được cập nhật.",
        });
        setModalOpen(false);
        setModalActionItem(null);
        setModalActionType(null);

        // Reload data to reflect change
        loadData();

        // Also update open drawer data if matches
        if (
          drawerItem &&
          drawerItem.id === modalActionItem.id &&
          drawerItem.target_type === modalActionItem.target_type
        ) {
          openDrawer(modalActionItem);
        }
      } else {
        showToast({
          type: "error",
          title: "Lỗi cập nhật",
          message: res.message || "Không thể thực hiện yêu cầu.",
        });
      }
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Lỗi hệ thống",
        message: err.message || "Thao tác thất bại.",
      });
    }
  };

  // Helper star rating renderer
  const renderStars = (rating: number) => {
    const num = Math.min(5, Math.max(1, Math.round(rating)));
    return (
      <span className="inline-flex items-center gap-0.5" title={`${num}/5 sao`}>
        {Array.from({ length: 5 }).map((_, idx) => {
          const isFilled = idx < num;
          return (
            <svg
              key={idx}
              className={`w-3 h-3 ${isFilled ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-300"} inline shrink-0`}
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          );
        })}
      </span>
    );
  };

  // Format split date time
  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return { date: "---", time: "" };
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { date: "---", time: "" };

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`,
    };
  };

  const renderSortHeader = (
    field: string,
    label: string,
    ascLabel = "Từ A–Z",
    descLabel = "Từ Z–A",
  ) => {
    return (
      <th
        scope="col"
        className="p-3 relative whitespace-nowrap"
        data-column-menu
      >
        <button
          type="button"
          onClick={() =>
            setActiveColumnMenu(activeColumnMenu === field ? null : field)
          }
          className={`inline-flex items-center gap-1 hover:text-ink transition-colors cursor-pointer font-bold bg-transparent border-none ${
            sortBy === field ? "text-blue-600" : "text-mid-gray"
          }`}
        >
          {label}
          <svg
            className="w-3 h-3"
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
        {activeColumnMenu === field && (
          <div className="absolute left-3 top-9 z-30 w-40 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col text-left font-normal normal-case">
            <button
              type="button"
              onClick={() => {
                setSortBy(field);
                setSortDirection("asc");

                setActiveColumnMenu(null);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent ${
                sortBy === field && sortDirection === "asc"
                  ? "bg-neutral-50 font-bold text-blue-600"
                  : "text-ink"
              }`}
            >
              {ascLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                setSortBy(field);
                setSortDirection("desc");

                setActiveColumnMenu(null);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 rounded-[4px] transition-colors font-medium cursor-pointer border-none bg-transparent ${
                sortBy === field && sortDirection === "desc"
                  ? "bg-neutral-50 font-bold text-blue-600"
                  : "text-ink"
              }`}
            >
              {descLabel}
            </button>
            <div className="h-[1px] bg-hairline my-1 mx-1.5"></div>
            <button
              type="button"
              onClick={() => {
                if (sortBy === field) {
                  setSortBy("created_at");
                  setSortDirection("desc");
                }
                setActiveColumnMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600 rounded-[4px] transition-colors font-semibold cursor-pointer border-none bg-transparent"
            >
              Bỏ sắp xếp
            </button>
          </div>
        )}
      </th>
    );
  };

  return (
    <>
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-mid-gray">
            Quản lý nội dung
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-ink">
            Kiểm duyệt bình luận / đánh giá
          </h1>
          <p className="mt-1 text-xs md:text-sm text-mid-gray">
            Theo dõi và xử lý nội dung phản hồi của người học trên hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => loadData(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-paper text-ink hover:bg-canvas transition-colors shadow-xs"
            title="Làm mới dữ liệu"
          >
            <svg
              className={`w-4 h-4 text-mid-gray ${refreshing ? "animate-spin" : "transition-transform duration-300"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
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
      </header>

      {/* 4 Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <button
          type="button"
          onClick={() => {
            updateFilters({
              target_type: "all",
              status: "all",
              reply_status: "all",
            });

            scrollToTable("Tổng nội dung");
          }}
          className={`flex flex-col justify-between h-[122px] rounded-2xl border bg-paper p-4 text-left shadow-xs transition-all hover:shadow-subtle cursor-pointer group relative overflow-hidden ${targetType === "all" && status === "all" && replyStatus === "all" ? "border-ink shadow-sm" : "border-hairline"}`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-mid-gray">
              Tổng nội dung
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-canvas text-mid-gray group-hover:bg-ink group-hover:text-white transition-colors shrink-0">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
          <div className="my-auto">
            <div className="text-2xl font-bold tracking-tight text-ink leading-none">
              {summary.total_items}
            </div>
            <p className="mt-1 text-[11px] text-mid-gray truncate">
              {summary.total_comments} bình luận • {summary.total_reviews} đánh
              giá
            </p>
          </div>
          <div className="h-1 w-full rounded-full bg-hairline/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-ink transition-all duration-300"
              style={{ width: "100%" }}
            ></div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            updateFilters({
              target_type: "comment",
              status: "all",
              reply_status: "all",
            });

            scrollToTable("Bình luận");
          }}
          className={`flex flex-col justify-between h-[122px] rounded-2xl border bg-paper p-4 text-left shadow-xs transition-all hover:shadow-subtle cursor-pointer group relative overflow-hidden ${targetType === "comment" && replyStatus === "all" ? "border-blue-500 shadow-sm" : "border-hairline"}`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-mid-gray">
              Bình luận
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
              </svg>
            </div>
          </div>
          <div className="my-auto">
            <div className="text-2xl font-bold tracking-tight text-ink leading-none">
              {summary.total_comments}
            </div>
            <p className="mt-1 text-[11px] text-mid-gray truncate">
              {summary.visible_comments} hiển thị • {summary.hidden_comments} ẩn
              • {summary.deleted_comments} đã xóa
            </p>
          </div>
          <div className="h-1 w-full rounded-full bg-hairline/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{
                width: `${summary.total_items > 0 ? (summary.total_comments / summary.total_items) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            updateFilters({
              target_type: "review",
              status: "all",
              reply_status: "all",
            });

            scrollToTable("Đánh giá");
          }}
          className={`flex flex-col justify-between h-[122px] rounded-2xl border bg-paper p-4 text-left shadow-xs transition-all hover:shadow-subtle cursor-pointer group relative overflow-hidden ${targetType === "review" && replyStatus === "all" ? "border-amber-500 shadow-sm" : "border-hairline"}`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-mid-gray">
              Đánh giá
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors shrink-0">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
          <div className="my-auto">
            <div className="text-2xl font-bold tracking-tight text-ink leading-none">
              {summary.total_reviews}
            </div>
            <p className="mt-1 text-[11px] text-mid-gray truncate">
              Điểm trung bình {summary.average_rating}/5
            </p>
          </div>
          <div className="h-1 w-full rounded-full bg-hairline/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-300"
              style={{
                width: `${summary.total_items > 0 ? (summary.total_reviews / summary.total_items) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            updateFilters({
              target_type: "comment",
              status: "all",
              reply_status: "violation",
            });

            scrollToTable("Bình luận vi phạm");
          }}
          className={`flex flex-col justify-between h-[122px] rounded-2xl border bg-paper p-4 text-left shadow-xs transition-all hover:shadow-subtle cursor-pointer group relative overflow-hidden ${targetType === "comment" && replyStatus === "violation" ? "border-rose-500 shadow-sm" : "border-hairline"}`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-mid-gray">
              Bình luận vi phạm
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors shrink-0">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            </div>
          </div>
          <div className="my-auto">
            <div className="text-2xl font-bold tracking-tight text-ink leading-none">
              {summary.violation_count}
            </div>
            <p className="mt-1 text-[11px] text-mid-gray truncate">
              {summary.hidden_comments} bị ẩn •{" "}
              {summary.deleted_comments + summary.deleted_reviews} đã xóa
            </p>
          </div>
          <div className="h-1 w-full rounded-full bg-hairline/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-rose-500 transition-all duration-300"
              style={{
                width: `${summary.total_items > 0 ? (summary.violation_count / summary.total_items) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </button>
      </section>

      {/* Filter Bar */}
      <section className="rounded-2xl border border-hairline bg-paper p-3.5 sm:p-4 shadow-xs mb-6">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-3 w-full min-w-0"
        >
          {/* Main Bar */}
          <div className="flex flex-wrap items-center gap-2.5 w-full min-w-0">
            {/* 1. Search box */}
            <div className="relative flex-1 min-w-[200px] max-w-full xl:max-w-[340px] h-[44px] shrink-0">
              <svg
                className="w-4 h-4 text-mid-gray absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
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
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                placeholder="Nội dung, người dùng, khóa học..."
                className="w-full h-full pl-10 pr-3 text-xs md:text-sm bg-canvas border border-hairline rounded-lg focus:outline-none focus:border-ink transition-colors text-ink placeholder:text-mid-gray/70"
              />
            </div>

            {/* Target Type select */}
            <div className="min-w-[130px] shrink-0">
              <FilterSelect
                label=""
                placeholder="Tất cả nội dung"
                value={targetType}
                options={[
                  { value: "all", label: "Tất cả nội dung" },
                  {
                    value: "comment",
                    label: "● Bình luận",
                    colorClass: "text-blue-600",
                  },
                  {
                    value: "review",
                    label: "● Đánh giá",
                    colorClass: "text-amber-500",
                  },
                ]}
                onChange={(val) => {
                  setTargetType(val);
                  if (val !== "review") setRating("all");
                }}
                id="select-target-type"
                activeId={activeDropdownId}
                setActiveId={setActiveDropdownId}
                className="w-full h-[44px]"
              />
            </div>

            {/* Status select */}
            <div className="min-w-[140px] shrink-0">
              <FilterSelect
                label=""
                placeholder="Tất cả trạng thái"
                value={status}
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  {
                    value: "visible",
                    label: "● Đang hiển thị",
                    colorClass: "text-emerald-600",
                  },
                  ...(targetType !== "review"
                    ? [
                        {
                          value: "hidden",
                          label: "● Đã ẩn",
                          colorClass: "text-mid-gray",
                        },
                      ]
                    : []),
                  {
                    value: "deleted",
                    label: "● Đã xóa",
                    colorClass: "text-red-500",
                  },
                ]}
                onChange={(val) => setStatus(val)}
                id="select-status"
                activeId={activeDropdownId}
                setActiveId={setActiveDropdownId}
                className="w-full h-[44px]"
              />
            </div>

            {/* Time Preset select */}
            <div className="min-w-[140px] shrink-0">
              <FilterSelect
                label=""
                placeholder="Tất cả thời gian"
                value={timePreset}
                options={[
                  { value: "all", label: "Tất cả thời gian" },
                  { value: "today", label: "Hôm nay" },
                  { value: "7days", label: "7 ngày qua" },
                  { value: "1month", label: "1 tháng qua" },
                  { value: "3months", label: "3 tháng qua" },
                  { value: "custom", label: "Tùy chọn ngày" },
                ]}
                onChange={(val) => setTimePreset(val)}
                id="select-time-preset"
                activeId={activeDropdownId}
                setActiveId={setActiveDropdownId}
                className="w-full h-[44px]"
              />
            </div>

            {/* Filter Popover Button */}
            <div className="relative shrink-0 ml-auto xl:ml-0" ref={filterPopoverRef}>
              <button
                type="button"
                onClick={() => setFilterPopoverOpen(!filterPopoverOpen)}
                className={`h-[44px] px-3.5 flex items-center justify-center gap-2 rounded-lg border text-[13px] font-medium transition-all ${
                  filterPopoverOpen || hasSecondaryFilters
                    ? "bg-canvas border-ink text-ink shadow-sm"
                    : "bg-paper border-hairline text-mid-gray hover:bg-canvas hover:text-ink"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Bộ lọc</span>
                {activeSecondaryFiltersCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {activeSecondaryFiltersCount}
                  </span>
                )}
              </button>

              {/* Popover Content */}
              {filterPopoverOpen && (
                <div className="absolute right-0 top-full mt-2 w-[260px] z-50 bg-paper border border-hairline rounded-[12px] shadow-lg p-4 animate-in fade-in zoom-in-95 duration-100">
                  <div className="space-y-4">
                    {/* Reply Status */}
                    <div>
                      <label className="block text-[11px] font-bold text-mid-gray uppercase tracking-wider mb-2">
                        Phản hồi
                      </label>
                      <FilterSelect
                        label=""
                        placeholder="Tất cả phản hồi"
                        value={replyStatus}
                        options={[
                          { value: "all", label: "Tất cả phản hồi" },
                          {
                            value: "violation",
                            label: "● Phản hồi vi phạm",
                            colorClass: "text-rose-600 font-bold",
                          },
                          {
                            value: "unanswered",
                            label: "● Chưa phản hồi",
                            colorClass: "text-rose-500",
                          },
                          {
                            value: "answered",
                            label: "● Đã phản hồi",
                            colorClass: "text-emerald-600",
                          },
                          {
                            value: "multiple_replies",
                            label: "● Nhiều phản hồi",
                            colorClass: "text-blue-500",
                          },
                        ]}
                        onChange={(val) => setReplyStatus(val)}
                        id="select-reply-status"
                        activeId={activeDropdownId}
                        setActiveId={setActiveDropdownId}
                        className="w-full h-[40px]"
                      />
                    </div>

                    {/* Rating */}
                    {targetType === "review" && (
                      <div>
                        <label className="block text-[11px] font-bold text-mid-gray uppercase tracking-wider mb-2">
                          Số sao
                        </label>
                        <FilterSelect
                          label=""
                          placeholder="Tất cả số sao"
                          value={rating}
                          options={[
                            { value: "all", label: "Tất cả số sao" },
                            { value: "5", label: "⭐⭐⭐⭐⭐ (5 sao)" },
                            { value: "4", label: "⭐⭐⭐⭐ (4 sao)" },
                            { value: "3", label: "⭐⭐⭐ (3 sao)" },
                            { value: "2", label: "⭐⭐ (2 sao)" },
                            { value: "1", label: "⭐ (1 sao)" },
                          ]}
                          onChange={(val) => setRating(val)}
                          id="select-rating"
                          activeId={activeDropdownId}
                          setActiveId={setActiveDropdownId}
                          className="w-full h-[40px]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reset All Button */}
            {hasFilter && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-[44px] px-3 flex items-center justify-center text-[13px] font-medium text-rose-500 hover:text-rose-700 transition-colors shrink-0 xl:ml-auto"
                title="Đặt lại tất cả bộ lọc về mặc định"
              >
                Đặt lại tất cả
              </button>
            )}
          </div>

          {/* Chips Bar */}
          {hasSecondaryFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-3 mt-1 border-t border-hairline/50 animate-in fade-in duration-200">
              {/* Reply Status Chip */}
              {replyStatus !== "all" && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas rounded-full border border-hairline text-xs font-medium text-ink shadow-subtle">
                  <span className="text-mid-gray">Phản hồi:</span>
                  <span>
                    {{
                      violation: "Vi phạm",
                      unanswered: "Chưa phản hồi",
                      answered: "Đã phản hồi",
                      multiple_replies: "Nhiều phản hồi",
                    }[replyStatus] || replyStatus}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReplyStatus("all")}
                    className="text-mid-gray hover:text-rose-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Rating Chip */}
              {rating !== "all" && targetType === "review" && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-canvas rounded-full border border-hairline text-xs font-medium text-ink shadow-subtle">
                  <span className="text-mid-gray">Số sao:</span>
                  <span className="text-amber-500 tracking-wider">
                    {"⭐".repeat(Number(rating))}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRating("all")}
                    className="text-mid-gray hover:text-rose-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Clear Secondary Filters */}
              <button
                type="button"
                onClick={handleResetSecondaryFilters}
                className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline px-2 ml-1"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </form>

        {/* Custom date range inputs */}
        {timePreset === "custom" && (
          <div className="pt-3 mt-3 border-t border-hairline flex flex-wrap items-center gap-3 animate-fade-in">
            <div className="flex items-center gap-2 text-xs text-mid-gray">
              <span>Từ ngày:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                }}
                className="h-9 px-3 text-xs bg-canvas border border-hairline rounded-full focus:outline-none focus:border-ink text-ink"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-mid-gray">
              <span>Đến ngày:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                }}
                className="h-9 px-3 text-xs bg-canvas border border-hairline rounded-full focus:outline-none focus:border-ink text-ink"
              />
            </div>
          </div>
        )}
      </section>

      {/* Course filter banner if active */}
      {courseFilter && (
        <div className="flex items-center justify-between px-5 py-3 bg-blue-50/40 border-b border-hairline text-xs text-blue-800 rounded-xl mb-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-blue-600 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="font-medium">
              Đang xem bình luận của khóa học:{" "}
              <strong className="font-bold">{courseFilter.title}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCourseFilter(null)}
            className="p-1 rounded hover:bg-blue-100/60 text-blue-500 hover:text-blue-800 transition-colors cursor-pointer"
            title="Bỏ lọc khóa học"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Table section */}
      <section
        ref={tableRef}
        className="scroll-mt-20 min-h-[600px] flex flex-col rounded-2xl border border-hairline bg-paper shadow-xs overflow-hidden"
      >
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-hairline gap-3 bg-canvas/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink">
              Danh sách nội dung
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-paper border border-hairline text-mid-gray">
              {meta.total}
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-scroll overflow-x-auto custom-scrollbar flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-mid-gray">
              <div className="w-8 h-8 rounded-full border-2 border-hairline border-t-ink animate-spin mb-3"></div>
              <span className="text-xs">Đang tải dữ liệu...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-mid-gray">
              <svg
                className="w-10 h-10 stroke-1.5 opacity-50 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 111.083 1.042l-.041.02m0 0a1.5 1.5 0 10-2.122-2.122 1.5 1.5 0 002.122 2.122zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs">Không tìm thấy nội dung phù hợp</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs md:text-sm border-collapse table-fixed min-w-[1225px]">
              <colgroup>
                <col style={{ width: "220px" }} />
                <col style={{ width: "260px" }} />
                <col style={{ width: "380px" }} />
                <col style={{ width: "115px" }} />
                <col style={{ width: "135px" }} />
                <col style={{ width: "125px" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-hairline bg-canvas/80 text-[11px] font-semibold uppercase tracking-wider text-mid-gray">
                  {renderSortHeader("user_name", "Người gửi")}
                  {renderSortHeader("course_title", "Bài học / Khóa học")}
                  {renderSortHeader("content", "Nội dung")}
                  {renderSortHeader("target_type", "Phân loại")}
                  {renderSortHeader("status", "Trạng thái")}
                  {renderSortHeader(
                    "created_at",
                    "Thời gian",
                    "Cũ nhất",
                    "Mới nhất",
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-ink">
                {items.map((item) => {
                  const dt = formatDateTime(item.created_at);
                  const isComment = item.target_type === "comment";
                  const initialChar =
                    item.user && item.user.full_name
                      ? item.user.full_name.charAt(0).toUpperCase()
                      : "U";

                  return (
                    <tr
                      key={`${item.target_type}-${item.id}`}
                      onClick={() => openDrawer(item)}
                      className="hover:bg-canvas/50 transition-colors cursor-pointer group"
                    >
                      {/* Sender details */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          {item.user?.avatar_url ? (
                            <img
                              src={item.user.avatar_url}
                              alt={item.user.full_name}
                              className="h-9 w-9 rounded-full object-cover shrink-0 border border-hairline bg-canvas"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white font-semibold text-xs border border-hairline shadow-xs">
                              {initialChar}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-ink leading-tight group-hover:underline truncate">
                              {item.user?.full_name || "Chưa rõ"}
                            </span>
                            <span className="text-[10px] text-mid-gray truncate mt-0.5">
                              {item.user?.email || "learner@mindhub.test"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Course / Lesson links */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex flex-col min-w-0">
                          {isComment && item.lesson ? (
                            <>
                              <span className="font-semibold text-ink leading-tight truncate">
                                {item.lesson.title}
                              </span>
                              <span className="text-[10px] text-mid-gray truncate mt-0.5">
                                K/H: {item.course?.title || "Chưa rõ"}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-ink leading-tight truncate">
                              {item.course?.title || "Chưa rõ"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Content */}
                      <td className="py-4 px-3.5 align-top">
                        <div className="flex flex-col gap-1.5 max-w-full">
                          {!isComment && item.rating && (
                            <div className="mb-0.5">
                              {renderStars(item.rating)}
                            </div>
                          )}
                          {item.warning_type ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 text-[11px] font-semibold w-fit mt-1">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                              {isComment
                                ? "Bình luận vi phạm chính sách cộng đồng"
                                : "Đánh giá vi phạm chính sách cộng đồng"}
                            </div>
                          ) : (
                            <p className="text-xs sm:text-[13px] text-ink leading-relaxed font-medium line-clamp-3">
                              {item.content || (
                                <span className="text-mid-gray italic">
                                  Không có nội dung nhận xét
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Classification Badge */}
                      <td className="py-3.5 px-3.5">
                        {isComment ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full border border-blue-200 bg-blue-50/50 text-blue-700 whitespace-nowrap">
                            💬 Bình luận
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50/50 text-amber-700 whitespace-nowrap">
                            ⭐ Đánh giá
                          </span>
                        )}
                      </td>

                      {/* Status indicator */}
                      <td className="py-3.5 px-3.5">
                        {item.status === "visible" && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 whitespace-nowrap">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                            Đang hiển thị
                          </span>
                        )}
                        {item.status === "hidden" && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 whitespace-nowrap">
                            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0"></span>
                            Đã ẩn
                          </span>
                        )}
                        {item.status === "deleted" && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 whitespace-nowrap">
                            <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0"></span>
                            Đã xóa
                          </span>
                        )}
                      </td>

                      {/* Timestamps */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex flex-col text-right sm:text-left">
                          <span className="font-medium text-ink leading-tight">
                            {dt.date}
                          </span>
                          <span className="text-[10px] text-mid-gray mt-0.5">
                            {dt.time}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination bar */}
        {!loading && items.length > 0 && (
          <AdminPagination
            currentPage={page}
            perPage={perPage}
            total={meta.total}
            onPageChange={(p) => setPage(p)}
            onPerPageChange={(pp) => {
              setPerPage(pp);
            }}
            itemLabel="bản ghi"
          />
        )}
      </section>

      {/* Side drawer */}
      {drawerOpen && (
        <>
          <div
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
          ></div>
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-paper border-l border-hairline shadow-2xl transition-transform duration-300 ease-in-out flex flex-col h-full animate-slide-in-right">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-canvas/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-canvas border border-hairline text-ink">
                  {drawerItem?.target_type === "comment"
                    ? "💬 Bình luận"
                    : "⭐ Đánh giá"}
                </span>
                <span className="text-xs font-mono text-mid-gray">
                  ID: #{selectedItemId}
                </span>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-2 rounded-full hover:bg-canvas text-mid-gray hover:text-ink transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
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

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {drawerLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-mid-gray">
                  <div className="w-7 h-7 rounded-full border-2 border-hairline border-t-ink animate-spin mb-3"></div>
                  <span className="text-xs">Đang tải chi tiết...</span>
                </div>
              ) : drawerItem ? (
                <>
                  {/* Current Status */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-canvas border border-hairline">
                    <span className="text-xs text-mid-gray">
                      Trạng thái kiểm duyệt:
                    </span>
                    <span
                      className={`text-xs font-semibold flex items-center gap-1.5 ${drawerItem.status === "visible" ? "text-emerald-600" : drawerItem.status === "hidden" ? "text-amber-600" : "text-rose-600"}`}
                    >
                      ●{" "}
                      {drawerItem.status === "visible"
                        ? "Đang hiển thị"
                        : drawerItem.status === "hidden"
                          ? "Đã ẩn"
                          : "Đã xóa"}
                    </span>
                  </div>

                  {/* Warning notifications */}
                  {drawerItem.warning_type &&
                    drawerItem.status === "visible" && (
                      <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 flex gap-2.5 text-xs text-rose-800">
                        <svg
                          className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold">
                            Nội dung có dấu hiệu bất thường (
                            {drawerItem.warning_type})
                          </span>
                          <span className="opacity-90">
                            Có thể chứa từ khóa spam, quảng cáo, chửi tục hoặc
                            xúc phạm. Cần cân nhắc ẩn hoặc xóa vĩnh viễn.
                          </span>
                        </div>
                      </div>
                    )}

                  {/* Sender User profile */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-mid-gray">
                        Người thực hiện
                      </h3>
                      {drawerItem.user?.id && (
                        <Link
                          to={`/admin/users?open_user_id=${drawerItem.user.id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          Xem chi tiết người dùng
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-hairline bg-paper">
                      {drawerItem.user?.avatar_url ? (
                        <img
                          src={drawerItem.user.avatar_url}
                          alt={drawerItem.user.full_name}
                          className="h-10 w-10 rounded-full object-cover shrink-0 border border-hairline bg-canvas"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white font-semibold text-sm border border-hairline shadow-xs">
                          {drawerItem.user?.full_name
                            ? drawerItem.user.full_name.charAt(0).toUpperCase()
                            : "U"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs md:text-sm font-semibold text-ink truncate block">
                          {drawerItem.user?.full_name || "Chưa rõ"}
                        </span>
                        <span className="text-xs text-mid-gray truncate block mt-0.5">
                          {drawerItem.user?.email || "learner@mindhub.test"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Content text */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-mid-gray">
                      Nội dung chi tiết
                    </h3>
                    <div className="p-4 rounded-xl border border-hairline bg-canvas/50 text-xs md:text-sm leading-relaxed whitespace-pre-wrap text-ink font-normal">
                      {drawerItem.content || (
                        <span className="text-mid-gray italic">
                          Không có nội dung nhận xét
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reference Course details */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-mid-gray">
                      Thông tin liên quan
                    </h3>
                    <div className="rounded-xl border border-hairline bg-paper p-4 space-y-3 text-xs">
                      <div className="flex flex-col gap-1.5 pb-2.5 border-b border-hairline/60">
                        <div className="flex items-center justify-between">
                          <span className="text-mid-gray">Khóa học:</span>
                          {drawerItem.course?.id && (
                            <Link
                              to={`/admin/courses?open_course_id=${drawerItem.course.id}`}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            >
                              Xem chi tiết khóa học
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </Link>
                          )}
                        </div>
                        <span className="font-medium text-ink truncate">
                          {drawerItem.course?.title || "Chưa rõ"}
                        </span>
                      </div>
                      {drawerItem.lesson && (
                        <div className="flex items-center justify-between pb-2.5 border-b border-hairline/60">
                          <span className="text-mid-gray">Bài học:</span>
                          <span className="font-medium text-ink truncate max-w-[260px]">
                            {drawerItem.lesson.title}
                          </span>
                        </div>
                      )}
                      {drawerItem.parent && (
                        <div className="flex flex-col gap-1.5 pb-2.5 border-b border-hairline/60">
                          <span className="text-mid-gray">
                            Trả lời cho bình luận:
                          </span>
                          <div className="p-2.5 rounded-lg bg-canvas border border-hairline text-xs text-mid-gray italic">
                            "{drawerItem.parent.content}"
                          </div>
                        </div>
                      )}
                      {drawerItem.rating !== null && (
                        <div className="flex items-center justify-between pb-2.5 border-b border-hairline/60">
                          <span className="text-mid-gray">Điểm đánh giá:</span>
                          <span className="font-medium text-amber-600 flex items-center gap-1">
                            {renderStars(drawerItem.rating)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-mid-gray">
                          Thời gian khởi tạo:
                        </span>
                        <span className="font-medium text-ink">
                          {formatDateTime(drawerItem.created_at).date}{" "}
                          {formatDateTime(drawerItem.created_at).time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order proof for reviews */}
                  {drawerItem.target_type === "review" && drawerItem.order && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-mid-gray flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Bằng chứng mua hàng
                      </h3>
                      <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40 text-xs space-y-2">
                        <div className="flex flex-col gap-1.5 pb-2 border-b border-emerald-100/50">
                          <div className="flex items-center justify-between">
                            <span className="text-mid-gray">Mã đơn hàng:</span>
                            <Link
                              to={`/admin/orders?open_order_id=${drawerItem.order.id}`}
                              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                            >
                              Xem chi tiết đơn hàng
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </Link>
                          </div>
                          <span className="font-semibold text-ink">
                            {drawerItem.order.order_code}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-mid-gray">
                            Giá trị thanh toán:
                          </span>
                          <span className="font-semibold text-ink">
                            {new Intl.NumberFormat("vi-VN").format(
                              Number(drawerItem.order.amount),
                            )}
                            đ
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-mid-gray">
                            Trạng thái thanh toán:
                          </span>
                          <span className="font-semibold text-emerald-600">
                            ●{" "}
                            {drawerItem.order.status === "paid"
                              ? "Đã thanh toán"
                              : drawerItem.order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SLA & response warnings */}
                  {drawerItem.target_type === "comment" && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-mid-gray">
                        Trạng thái xử lý & SLA
                      </h3>
                      <div className="rounded-xl border border-hairline bg-paper p-4 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-mid-gray">
                            Thời hạn xử lý phản hồi (SLA):
                          </span>
                          <span className="font-semibold text-ink">24 giờ</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-mid-gray">
                            Thời gian phản hồi đầu tiên:
                          </span>
                          <span className="font-semibold text-ink">
                            {drawerItem.first_response_hours !== null
                              ? `${drawerItem.first_response_hours} giờ`
                              : "Chưa phản hồi"}
                          </span>
                        </div>
                        {drawerItem.is_response_overdue && (
                          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-1.5 mt-2">
                            ⚠️ Quá hạn phản hồi ({drawerItem.overdue_hours} giờ)
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Replies history list */}
                  {drawerItem.target_type === "comment" && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-mid-gray flex items-center justify-between">
                        <span>Lịch sử phản hồi</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {drawerItem.reply_count}
                        </span>
                      </h3>
                      <div className="space-y-2.5">
                        {drawerItem.replies.length === 0 ? (
                          <p className="text-xs text-mid-gray italic text-center py-2">
                            Chưa có lượt phản hồi nào.
                          </p>
                        ) : (
                          drawerItem.replies.map((reply) => {
                            const rDt = formatDateTime(reply.created_at);
                            return (
                              <div
                                key={reply.id}
                                className="p-3.5 rounded-xl border border-hairline bg-canvas/30 space-y-2"
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5 font-semibold text-ink">
                                    <span>{reply.user_name}</span>
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-paper border border-hairline text-mid-gray">
                                      {reply.user_role === "instructor"
                                        ? "Giảng viên"
                                        : reply.user_role === "admin"
                                          ? "Admin"
                                          : "Học viên"}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-mid-gray">
                                    {rDt.date} {rDt.time}
                                  </span>
                                </div>
                                <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap font-normal">
                                  {reply.content}
                                </p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-hairline bg-canvas/40 shrink-0 flex items-center justify-end gap-2.5">
              {drawerItem && (
                <>
                  {drawerItem.status === "visible" && (
                    <>
                      <button
                        type="button"
                        onClick={() => triggerAction(drawerItem, "hide")}
                        className="px-4 py-2 text-xs font-semibold rounded-full border border-hairline bg-paper text-ink hover:bg-canvas transition-colors cursor-pointer"
                      >
                        {drawerItem.target_type === "comment"
                          ? "Ẩn bình luận"
                          : "Ẩn đánh giá"}
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerAction(drawerItem, "delete")}
                        className="px-4 py-2 text-xs font-semibold rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                      >
                        {drawerItem.target_type === "comment"
                          ? "Xoá bình luận"
                          : "Xoá đánh giá"}
                      </button>
                    </>
                  )}
                  {drawerItem.status !== "visible" && (
                    <button
                      type="button"
                      onClick={() => triggerAction(drawerItem, "restore")}
                      className="px-4 py-2 text-xs font-semibold rounded-full bg-ink text-white hover:bg-ink/90 transition-colors shadow-xs cursor-pointer"
                    >
                      Phục hồi hiển thị
                    </button>
                  )}
                </>
              )}
            </div>
          </aside>
        </>
      )}

      {/* Confirmation Modal */}
      {modalOpen && modalActionItem && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-paper border border-hairline rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-hairline flex items-center justify-between bg-canvas/40">
              <h3 className="text-sm md:text-base font-semibold text-ink">
                Xác nhận thao tác
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-mid-gray hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
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
            {/* Modal Body */}
            <div className="p-6 space-y-3 text-xs md:text-sm text-ink leading-relaxed">
              <p>
                Bạn có chắc chắn muốn{" "}
                <strong className="font-bold">
                  {modalActionType === "hide"
                    ? "Ẩn"
                    : modalActionType === "delete"
                      ? "Xóa vĩnh viễn"
                      : "Phục hồi"}
                </strong>{" "}
                {modalActionItem.target_type === "comment"
                  ? "bình luận"
                  : "đánh giá"}{" "}
                của học viên{" "}
                <strong className="font-bold">
                  {modalActionItem.user?.full_name}
                </strong>
                ?
              </p>
              <div className="p-3 bg-canvas/50 border border-hairline rounded-xl italic text-mid-gray">
                "{modalActionItem.content}"
              </div>
            </div>
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-hairline bg-canvas/40 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-full border border-hairline text-ink hover:bg-canvas transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmAction}
                className="px-4 py-2 text-xs font-semibold rounded-full bg-ink text-white hover:bg-ink/90 transition-colors shadow-xs cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
