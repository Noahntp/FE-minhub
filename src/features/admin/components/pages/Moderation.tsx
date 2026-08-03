import React, { useState, useEffect, useMemo } from "react";
import {
  getModerationItems,
  getModerationItemDetail,
  moderateItem,
} from "@/assets/js/api/moderation-api";
import { showToast } from "@/assets/js/toast";

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
  // Filters state
  const [search, setSearch] = useState("");
  const [targetType, setTargetType] = useState("all");
  const [status, setStatus] = useState("all");
  const [replyStatus, setReplyStatus] = useState("all");
  const [timePreset, setTimePreset] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

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
    targetType,
    status,
    replyStatus,
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
    setPage(1);
    loadData();
  };

  // Handle Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setTargetType("all");
    setStatus("all");
    setReplyStatus("all");
    setTimePreset("all");
    setDateFrom("");
    setDateTo("");
    setCourseFilter(null);
    setPage(1);
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
            setTargetType("all");
            setStatus("all");
            setReplyStatus("all");
            setPage(1);
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
            setTargetType("comment");
            setStatus("all");
            setReplyStatus("all");
            setPage(1);
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
            setTargetType("review");
            setStatus("all");
            setReplyStatus("all");
            setPage(1);
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
            setReplyStatus("needs_action");
            setPage(1);
          }}
          className={`flex flex-col justify-between h-[122px] rounded-2xl border bg-paper p-4 text-left shadow-xs transition-all hover:shadow-subtle cursor-pointer group relative overflow-hidden ${replyStatus === "needs_action" ? "border-rose-500 shadow-sm" : "border-hairline"}`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-mid-gray">
              Cần xử lý
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
              {summary.need_action_count}
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
                width: `${summary.total_items > 0 ? (summary.need_action_count / summary.total_items) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </button>
      </section>

      {/* Filter Bar */}
      <section className="rounded-2xl border border-hairline bg-paper p-3.5 sm:p-4 shadow-xs mb-6">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col xl:flex-row xl:items-center gap-2.5 w-full min-w-0"
        >
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nội dung, người dùng, khóa học..."
              className="w-full h-full pl-10 pr-3 text-xs md:text-sm bg-canvas border border-hairline rounded-xl focus:outline-none focus:border-ink transition-colors text-ink placeholder:text-mid-gray/70"
            />
          </div>

          {/* Controls Select grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:flex xl:items-center gap-2.5 flex-1 min-w-0">
            {/* Target Type select */}
            <select
              value={targetType}
              onChange={(e) => {
                setTargetType(e.target.value);
                setPage(1);
              }}
              className="h-[44px] px-3.5 text-xs md:text-sm bg-canvas border border-hairline rounded-xl focus:outline-none focus:border-ink text-ink font-medium shrink-0 min-w-[130px]"
            >
              <option value="all">Tất cả nội dung</option>
              <option value="comment">Bình luận</option>
              <option value="review">Đánh giá</option>
            </select>

            {/* Status select */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-[44px] px-3.5 text-xs md:text-sm bg-canvas border border-hairline rounded-xl focus:outline-none focus:border-ink text-ink font-medium shrink-0 min-w-[140px]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="visible">Đang hiển thị</option>
              {targetType !== "review" && <option value="hidden">Đã ẩn</option>}
              <option value="deleted">Đã xóa</option>
            </select>

            {/* Reply Status select */}
            <select
              value={replyStatus}
              onChange={(e) => {
                setReplyStatus(e.target.value);
                setPage(1);
              }}
              className="h-[44px] px-3.5 text-xs md:text-sm bg-canvas border border-hairline rounded-xl focus:outline-none focus:border-ink text-ink font-medium shrink-0 min-w-[145px]"
            >
              <option value="all">Tất cả phản hồi</option>
              <option value="unanswered">Chưa phản hồi</option>
              <option value="answered">Đã phản hồi</option>
              <option value="multiple_replies">Nhiều phản hồi</option>
              <option value="overdue">Quá hạn phản hồi</option>
              <option value="needs_action">Cần xử lý gấp</option>
            </select>

            {/* Time Preset select */}
            <select
              value={timePreset}
              onChange={(e) => {
                setTimePreset(e.target.value);
                setPage(1);
              }}
              className="h-[44px] px-3.5 text-xs md:text-sm bg-canvas border border-hairline rounded-xl focus:outline-none focus:border-ink text-ink font-medium shrink-0 min-w-[140px]"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày qua</option>
              <option value="1month">1 tháng qua</option>
              <option value="3months">3 tháng qua</option>
              <option value="custom">Tùy chọn ngày</option>
            </select>
          </div>

          {/* Reset button */}
          {hasFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-full text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all shrink-0 cursor-pointer"
              title="Xóa bộ lọc"
            >
              <svg
                className="w-4 h-4 stroke-[2.5]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
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
                  setPage(1);
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
                  setPage(1);
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
      <section className="rounded-2xl border border-hairline bg-paper shadow-xs overflow-hidden">
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
          <div className="flex items-center gap-2 text-xs text-mid-gray">
            <span>Hiển thị</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 px-2 text-xs bg-paper border border-hairline rounded-lg text-ink focus:outline-none"
            >
              <option value="10">10 dòng</option>
              <option value="20">20 dòng</option>
              <option value="50">50 dòng</option>
              <option value="100">100 dòng</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-scroll overflow-x-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-mid-gray">
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
                  <th scope="col" className="py-3 px-3.5">
                    Người gửi
                  </th>
                  <th scope="col" className="py-3 px-3.5">
                    Bài học / Khóa học
                  </th>
                  <th scope="col" className="py-3 px-3.5">
                    Nội dung
                  </th>
                  <th scope="col" className="py-3 px-3.5">
                    Phân loại
                  </th>
                  <th scope="col" className="py-3 px-3.5">
                    Trạng thái
                  </th>
                  <th scope="col" className="py-3 px-3.5">
                    Thời gian
                  </th>
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

                      {/* Snippet / stars content */}
                      <td className="py-3.5 px-3.5">
                        <div className="flex flex-col gap-1 pr-4">
                          {!isComment && item.rating !== null && (
                            <div className="mb-0.5">
                              {renderStars(item.rating)}
                            </div>
                          )}
                          <p className="text-xs text-ink line-clamp-2 leading-relaxed">
                            {item.content || (
                              <span className="text-mid-gray italic">
                                Không có nội dung nhận xét
                              </span>
                            )}
                          </p>
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
          <div className="p-3.5 bg-surface-alt border-t border-hairline select-none flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-mid-gray">
              Hiển thị{" "}
              <span className="font-semibold text-ink">
                {Math.min(meta.total, (page - 1) * perPage + 1)}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-ink">
                {Math.min(meta.total, page * perPage)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-ink">{meta.total}</span> bản
              ghi
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="inline-flex h-8 items-center gap-1 rounded-full border border-hairline bg-paper px-3 text-xs font-medium text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
                <span>Trước</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: meta.last_page }).map((_, idx) => {
                  const pNum = idx + 1;
                  // Render limited pages around current page if necessary
                  if (
                    meta.last_page > 6 &&
                    Math.abs(pNum - page) > 2 &&
                    pNum !== 1 &&
                    pNum !== meta.last_page
                  ) {
                    if (pNum === 2 || pNum === meta.last_page - 1) {
                      return (
                        <span key={pNum} className="text-xs text-mid-gray px-1">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setPage(pNum)}
                      className={`h-8 w-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${page === pNum ? "bg-ink text-white shadow-xs" : "border border-hairline bg-paper text-ink hover:bg-canvas"}`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() =>
                  setPage((prev) => Math.min(meta.last_page, prev + 1))
                }
                disabled={page === meta.last_page}
                className="inline-flex h-8 items-center gap-1 rounded-full border border-hairline bg-paper px-3 text-xs font-medium text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
              >
                <span>Sau</span>
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
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
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-mid-gray">
                      Người thực hiện
                    </h3>
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
                      <div className="flex items-center justify-between pb-2.5 border-b border-hairline/60">
                        <span className="text-mid-gray">Khóa học:</span>
                        <span className="font-medium text-ink truncate max-w-[260px]">
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
                        <div className="flex items-center justify-between">
                          <span className="text-mid-gray">Mã đơn hàng:</span>
                          <span className="font-semibold text-emerald-700">
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
                      {drawerItem.target_type === "comment" && (
                        <button
                          type="button"
                          onClick={() => triggerAction(drawerItem, "hide")}
                          className="px-4 py-2 text-xs font-semibold rounded-full border border-hairline bg-paper text-ink hover:bg-canvas transition-colors cursor-pointer"
                        >
                          Ẩn nội dung
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => triggerAction(drawerItem, "delete")}
                        className="px-4 py-2 text-xs font-semibold rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                      >
                        Xóa vĩnh viễn
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
