import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { 
  getFaqs, 
  getFaqDetail, 
  createFaq, 
  updateFaq, 
  deleteFaq, 
  syncFaqCourses 
} from '@/assets/js/api/faqs-api';
import { getCourses } from '@/assets/js/api/courses-api';

// Mapping Loại FAQ (raw value -> Tiếng Việt & CSS Class cho Chip)
const typeMap: Record<string, { label: string; class: string }> = {
  general: { label: "Chung", class: "bg-mid-gray/10 text-mid-gray border-mid-gray/20 font-semibold" },
  account: { label: "Tài khoản", class: "bg-blue-50 text-blue-700 border-blue-200/60 font-semibold" },
  course: { label: "Khóa học", class: "bg-indigo-50 text-indigo-700 border-indigo-200/60 font-semibold" },
  payment: { label: "Thanh toán", class: "bg-emerald-50 text-emerald-700 border-emerald-200/60 font-semibold" },
  refund: { label: "Hoàn tiền", class: "bg-amber-50 text-amber-700 border-amber-200/60 font-semibold" },
  certificate: { label: "Chứng chỉ", class: "bg-violet-50 text-violet-700 border-violet-200/60 font-semibold" },
  technical: { label: "Kỹ thuật", class: "bg-cyan-50 text-cyan-700 border-cyan-200/60 font-semibold" },
  policy: { label: "Chính sách", class: "bg-rose-50 text-rose-700 border-rose-200/60 font-semibold" }
};

// Mapping Trạng thái FAQ
const statusMap: Record<string, { label: string; dotClass: string; textClass: string }> = {
  active: { label: "Đang hiển thị", dotClass: "bg-emerald-500", textClass: "text-emerald-600" },
  inactive: { label: "Đang ẩn", dotClass: "bg-mid-gray", textClass: "text-mid-gray" }
};

export default function Faqs() {
  // --- States ---
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    total_faqs: 0,
    active_count: 0,
    inactive_count: 0,
    unlinked_count: 0,
    linked_course_count: 0
  });
  const [meta, setMeta] = useState<any>({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });

  // Filters State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [scope, setScope] = useState("all");
  const [sortBy, setSortBy] = useState("sort_order");
  const [sortDirection, setSortDirection] = useState("asc");

  // Loaders
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Drawer & Modals visibility
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<any>(null);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formFaq, setFormFaq] = useState({
    id: null as number | null,
    question: "",
    answer: "",
    type: "general",
    status: "active",
    sort_order: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [courseSearch, setCourseSearch] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<any>(null);

  // --- Debounced Search Timeout ---
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Fetch Data ---
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getFaqs({
        page,
        per_page: perPage,
        search,
        type,
        status,
        scope,
        sort_by: sortBy,
        sort_direction: sortDirection
      });

      if (res && res.success) {
        setItems(res.data.items || []);
        setSummary(res.data.summary || {});
        setMeta(res.meta || {});
      } else {
        toast.error("Không thể tải danh sách FAQ.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const loadAllCourses = async () => {
    setCoursesLoading(true);
    try {
      const res = await getCourses({ per_page: 9999 });
      if (res && res.success) {
        setAllCourses(res.data.items || []);
      }
    } catch (err) {
      console.error("Lỗi nạp danh sách khóa học:", err);
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, perPage, search, type, status, scope, sortBy, sortDirection]);

  useEffect(() => {
    loadAllCourses();
  }, []);

  // --- Form & Filter Handlers ---
  const handleResetFilters = () => {
    setSearch("");
    setType("all");
    setStatus("all");
    setScope("all");
    setSortBy("sort_order");
    setSortDirection("asc");
    setPage(1);
    toast.info("Đã đặt lại các bộ lọc.");
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
    setPage(1);
  };

  // Open Create/Edit modal
  const openFormModal = (faq: any = null) => {
    setErrors({});
    if (faq) {
      setModalMode('edit');
      setFormFaq({
        id: faq.id,
        question: faq.question || "",
        answer: faq.answer || "",
        type: faq.type || "general",
        status: faq.status || "active",
        sort_order: faq.sort_order || 0
      });
    } else {
      setModalMode('create');
      setFormFaq({
        id: null,
        question: "",
        answer: "",
        type: "general",
        status: "active",
        sort_order: 0
      });
    }
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formFaq.question.trim()) newErrors.question = "Câu hỏi không được để trống.";
    if (!formFaq.answer.trim()) newErrors.answer = "Câu trả lời không được để trống.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (modalMode === 'edit' && formFaq.id) {
        res = await updateFaq(formFaq.id, formFaq);
      } else {
        res = await createFaq(formFaq);
      }

      if (res && res.success) {
        toast.success(modalMode === 'edit' ? "Cập nhật FAQ thành công." : "Tạo FAQ mới thành công.");
        setFormModalOpen(false);
        loadData();
        // If drawer is currently open showing the edited FAQ, update it
        if (drawerOpen && selectedFaq && selectedFaq.id === formFaq.id) {
          setSelectedFaq(res.data);
        }
      } else {
        toast.error(res ? res.message : "Thao tác thất bại.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi khi lưu FAQ.");
    } finally {
      setSubmitting(false);
    }
  };

  // Sync courses modal
  const openSyncModal = (faq: any) => {
    setSelectedFaq(faq);
    setSelectedCourseIds(faq.linked_courses ? faq.linked_courses.map((c: any) => c.id) : []);
    setCourseSearch("");
    setSyncModalOpen(true);
  };

  const handleSaveCourseSync = async () => {
    if (!selectedFaq) return;
    setSubmitting(true);
    try {
      const res = await syncFaqCourses(selectedFaq.id, selectedCourseIds);
      if (res && res.success) {
        toast.success("Cập nhật liên kết khóa học thành công.");
        setSyncModalOpen(false);
        loadData();
        // If drawer is open, reload detail
        if (drawerOpen && selectedFaq.id) {
          const detailRes = await getFaqDetail(selectedFaq.id);
          if (detailRes && detailRes.success) {
            setSelectedFaq(detailRes.data);
          }
        }
      } else {
        toast.error(res ? res.message : "Thao tác thất bại.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi đồng bộ liên kết.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete modal
  const openDeleteModal = (faq: any) => {
    setFaqToDelete(faq);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!faqToDelete) return;
    setSubmitting(true);
    try {
      const res = await deleteFaq(faqToDelete.id);
      if (res && res.success) {
        toast.success("Xóa FAQ thành công.");
        setDeleteModalOpen(false);
        setDrawerOpen(false);
        loadData();
      } else {
        toast.error("Xóa FAQ thất bại.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Lỗi khi kết nối yêu cầu xóa.");
    } finally {
      setSubmitting(false);
    }
  };

  // Drawer detail loader
  const handleOpenDrawer = async (faqId: number) => {
    try {
      const res = await getFaqDetail(faqId);
      if (res && res.success) {
        setSelectedFaq(res.data);
        setDrawerOpen(true);
      } else {
        toast.error("Không thể tải thông tin chi tiết FAQ.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi kết nối máy chủ.");
    }
  };

  // Filter courses for checkboxes inside sync modal
  const filteredCourses = allCourses.filter(c => {
    const keyword = courseSearch.toLowerCase();
    return c.title?.toLowerCase().includes(keyword) || String(c.id).includes(keyword);
  });

  const isFiltered = search !== "" || type !== "all" || status !== "all" || scope !== "all" || sortBy !== "sort_order" || sortDirection !== "asc";

  // Calculations for summary card stats
  const activePct = summary.total_faqs > 0 ? Math.round((summary.active_count / summary.total_faqs) * 100) : 0;
  const inactivePct = summary.total_faqs > 0 ? Math.round((summary.inactive_count / summary.total_faqs) * 100) : 0;
  const unlinkedPct = summary.total_faqs > 0 ? Math.round((summary.unlinked_count / summary.total_faqs) * 100) : 0;

  return (
    <>
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-mid-gray uppercase tracking-wider mb-1">
            <span>MindHub Admin</span>
            <span>•</span>
            <span>Quản lý nội dung</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-ink">
            Quản lý FAQ
          </h1>
          <p className="mt-1 text-xs md:text-sm text-mid-gray">
            Quản lý câu hỏi thường gặp, thứ tự hiển thị và liên kết với khóa học.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              loadData();
              toast.info("Đã làm mới dữ liệu FAQ.");
            }}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-hairline bg-paper text-ink hover:bg-canvas shadow-subtle transition-all duration-200 cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <svg className="w-4 h-4 text-ink" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
            </svg>
          </button>

          <button
            type="button"
            onClick={() => openFormModal()}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-full bg-ink text-white font-medium text-xs md:text-sm shadow-subtle hover:bg-ink/90 transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            <span>Tạo FAQ</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
        {/* Card 1: Tổng FAQ */}
        <div
          onClick={handleResetFilters}
          className="group cursor-pointer rounded-2xl border border-hairline bg-paper p-4 shadow-subtle hover:border-ink/20 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-mid-gray">Tổng FAQ</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-canvas text-ink">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" x2="12.01" y1="17" y2="17"/>
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold tracking-tight text-ink">
              {summary.total_faqs.toLocaleString("vi-VN")}
            </span>
            <span className="text-[11px] text-mid-gray">Toàn hệ thống</span>
          </div>
        </div>

        {/* Card 2: Đang hiển thị */}
        <div
          onClick={() => {
            setStatus("active");
            setPage(1);
            toast.info("Đang lọc FAQ: Đang hiển thị.");
          }}
          className="group cursor-pointer rounded-2xl border border-hairline bg-paper p-4 shadow-subtle hover:border-emerald-500/30 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-mid-gray">Đang hiển thị</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold tracking-tight text-emerald-600">
              {summary.active_count.toLocaleString("vi-VN")}
            </span>
            <span className="text-[11px] font-medium text-emerald-600">{activePct}%</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-canvas">
            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${activePct}%` }}></div>
          </div>
        </div>

        {/* Card 3: Đang ẩn */}
        <div
          onClick={() => {
            setStatus("inactive");
            setPage(1);
            toast.info("Đang lọc FAQ: Đang ẩn.");
          }}
          className="group cursor-pointer rounded-2xl border border-hairline bg-paper p-4 shadow-subtle hover:border-zinc-400/40 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-mid-gray">Đang ẩn</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-canvas text-mid-gray">
              <span className="h-2 w-2 rounded-full bg-mid-gray"></span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold tracking-tight text-mid-gray">
              {summary.inactive_count.toLocaleString("vi-VN")}
            </span>
            <span className="text-[11px] font-medium text-mid-gray">{inactivePct}%</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-canvas">
            <div className="h-full bg-mid-gray transition-all duration-300" style={{ width: `${inactivePct}%` }}></div>
          </div>
        </div>

        {/* Card 4: Chưa liên kết */}
        <div
          onClick={() => {
            setScope("unlinked");
            setPage(1);
            toast.info("Đang lọc FAQ: Chưa liên kết khóa học.");
          }}
          className="group cursor-pointer rounded-2xl border border-hairline bg-paper p-4 shadow-subtle hover:border-amber-500/30 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-mid-gray">Chưa liên kết</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold tracking-tight text-amber-600">
              {summary.unlinked_count.toLocaleString("vi-VN")}
            </span>
            <span className="text-[11px] font-medium text-amber-600">{unlinkedPct}%</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-canvas">
            <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${unlinkedPct}%` }}></div>
          </div>
        </div>

        {/* Card 5: Khóa học có FAQ */}
        <div
          onClick={() => {
            setSortBy("course_count");
            setSortDirection("desc");
            setPage(1);
            toast.info("Đang sắp xếp: Nhiều khóa học liên kết nhất.");
          }}
          className="group cursor-pointer rounded-2xl border border-hairline bg-paper p-4 shadow-subtle hover:border-blue-500/30 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-mid-gray">Khóa học có FAQ</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-semibold tracking-tight text-blue-600">
              {summary.linked_course_count.toLocaleString("vi-VN")}
            </span>
            <span className="text-[11px] font-medium text-mid-gray">Khóa học</span>
          </div>
        </div>
      </div>

      {/* Filter Bar Section */}
      <div className="rounded-2xl border border-hairline bg-paper p-4 shadow-subtle mb-6">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 flex-wrap">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-4 h-4 text-mid-gray" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 rounded-full border border-hairline bg-canvas pl-9 pr-4 text-sm text-ink placeholder:text-mid-gray/60 focus:border-ink focus:outline-none transition-colors"
                placeholder="Tìm câu hỏi, câu trả lời hoặc khóa học"
              />
            </div>

            {/* Type Select */}
            <div className="min-w-[150px]">
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 rounded-full border border-hairline bg-canvas px-3 text-sm text-ink cursor-pointer outline-none"
              >
                <option value="all">Tất cả loại FAQ</option>
                <option value="general">Chung</option>
                <option value="account">Tài khoản</option>
                <option value="course">Khóa học</option>
                <option value="payment">Thanh toán</option>
                <option value="refund">Hoàn tiền</option>
                <option value="certificate">Chứng chỉ</option>
                <option value="technical">Kỹ thuật</option>
                <option value="policy">Chính sách</option>
              </select>
            </div>

            {/* Status Select */}
            <div className="min-w-[160px]">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 rounded-full border border-hairline bg-canvas px-3 text-sm text-ink cursor-pointer outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">● Đang hiển thị</option>
                <option value="inactive">● Đang ẩn</option>
              </select>
            </div>

            {/* Scope Select */}
            <div className="min-w-[180px]">
              <select
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 rounded-full border border-hairline bg-canvas px-3 text-sm text-ink cursor-pointer outline-none"
              >
                <option value="all">Tất cả phạm vi</option>
                <option value="general">FAQ dùng chung</option>
                <option value="linked">Đã liên kết khóa học</option>
                <option value="unlinked">Chưa liên kết khóa học</option>
              </select>
            </div>

            {/* Sort Select */}
            <div className="min-w-[160px]">
              <select
                value={`${sortBy}_${sortDirection}`}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith("sort_order")) {
                    setSortBy("sort_order");
                    setSortDirection(val.endsWith("desc") ? "desc" : "asc");
                  } else if (val.startsWith("updated_at")) {
                    setSortBy("updated_at");
                    setSortDirection(val.endsWith("desc") ? "desc" : "asc");
                  } else if (val.startsWith("question")) {
                    setSortBy("question");
                    setSortDirection(val.endsWith("desc") ? "desc" : "asc");
                  } else if (val.startsWith("course_count")) {
                    setSortBy("course_count");
                    setSortDirection(val.endsWith("desc") ? "desc" : "asc");
                  }
                  setPage(1);
                }}
                className="w-full h-10 rounded-full border border-hairline bg-canvas px-3 text-sm text-ink cursor-pointer outline-none"
              >
                <option value="sort_order_asc">Sắp xếp: Thứ tự tăng dần</option>
                <option value="sort_order_desc">Thứ tự giảm dần</option>
                <option value="updated_at_desc">Mới cập nhật trước</option>
                <option value="updated_at_asc">Cũ cập nhật trước</option>
                <option value="question_asc">Câu hỏi A–Z</option>
                <option value="question_desc">Câu hỏi Z–A</option>
                <option value="course_count_desc">Nhiều khóa học nhất</option>
                <option value="course_count_asc">Ít khóa học nhất</option>
              </select>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex items-center justify-end shrink-0">
            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!isFiltered}
              className="h-9 w-9 rounded-full border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
              title="Xóa bộ lọc"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-hairline bg-paper shadow-subtle overflow-hidden relative mb-6">
        {loading ? (
          <div className="p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent"></div>
              <p className="text-sm font-medium text-mid-gray">Đang tải dữ liệu FAQ...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-canvas text-mid-gray mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" x2="12.01" y1="17" y2="17"/>
              </svg>
            </div>
            {isFiltered ? (
              <>
                <h3 className="text-base font-semibold text-ink">Không tìm thấy FAQ phù hợp với bộ lọc.</h3>
                <p className="mt-1 text-sm text-mid-gray max-w-sm mx-auto">Hãy thử điều chỉnh hoặc xóa bớt tiêu chí tìm kiếm để hiển thị kết quả.</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-hairline bg-paper text-ink font-medium text-xs md:text-sm hover:bg-canvas transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  <span>Xóa bộ lọc</span>
                </button>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-ink">Chưa có FAQ nào.</h3>
                <p className="mt-1 text-sm text-mid-gray max-w-sm mx-auto">Hệ thống chưa ghi nhận câu hỏi thường gặp nào. Bạn có thể bắt đầu tạo câu hỏi mới ngay bây giờ.</p>
                <button
                  type="button"
                  onClick={() => openFormModal()}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-white font-medium text-xs md:text-sm hover:bg-ink/90 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                  </svg>
                  <span>Tạo FAQ đầu tiên</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-hairline bg-surface-alt/60 text-[11px] font-bold uppercase tracking-wider text-mid-gray">
                  <th scope="col" className="py-3.5 px-4 min-w-[280px]">
                    <button
                      type="button"
                      onClick={() => handleSort("question")}
                      className="flex items-center gap-1.5 hover:text-ink transition-colors font-bold uppercase tracking-wider text-[10px] text-mid-gray outline-none focus:ring-1 focus:ring-ink rounded-sm"
                    >
                      <span>Câu hỏi & Câu trả lời</span>
                      {sortBy === "question" && (
                        <span className="text-ink">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="py-3.5 px-4 min-w-[110px]">
                    <button
                      type="button"
                      onClick={() => handleSort("type")}
                      className="flex items-center gap-1.5 hover:text-ink transition-colors font-bold uppercase tracking-wider text-[10px] text-mid-gray outline-none"
                    >
                      <span>Loại</span>
                      {sortBy === "type" && (
                        <span className="text-ink">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="py-3.5 px-4 min-w-[220px]">
                    <span>Khóa học liên kết</span>
                  </th>
                  <th scope="col" className="py-3.5 px-4 text-center min-w-[90px]">
                    <button
                      type="button"
                      onClick={() => handleSort("sort_order")}
                      className="flex items-center justify-center gap-1.5 hover:text-ink transition-colors font-bold uppercase tracking-wider text-[10px] text-mid-gray mx-auto outline-none"
                    >
                      <span>Thứ tự</span>
                      {sortBy === "sort_order" && (
                        <span className="text-ink">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="py-3.5 px-4 min-w-[130px]">
                    <span>Trạng thái</span>
                  </th>
                  <th scope="col" className="py-3.5 px-4 min-w-[130px]">
                    <button
                      type="button"
                      onClick={() => handleSort("updated_at")}
                      className="flex items-center gap-1.5 hover:text-ink transition-colors font-bold uppercase tracking-wider text-[10px] text-mid-gray outline-none"
                    >
                      <span>Cập nhật</span>
                      {sortBy === "updated_at" && (
                        <span className="text-ink">
                          {sortDirection === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-sm text-ink">
                {items.map((item) => {
                  const typeConfig = typeMap[item.type] || { label: "Chung", class: "bg-mid-gray/10 text-mid-gray border-mid-gray/20 font-semibold" };
                  const statusConfig = statusMap[item.status] || statusMap.inactive;
                  
                  const dateObj = new Date(item.updated_at);
                  const dateFormatted = isNaN(dateObj.getTime()) ? "N/A" : dateObj.toLocaleDateString("vi-VN", {
                    day: "2-digit", month: "2-digit", year: "numeric"
                  }) + " " + dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDrawer(item.id)}
                      className="hover:bg-canvas/80 transition-colors cursor-pointer group"
                    >
                      {/* Question & Answer */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col space-y-1">
                          <span className="font-medium text-ink group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                            {item.question}
                          </span>
                          <span className="text-xs text-mid-gray line-clamp-2 leading-normal">
                            {item.answer}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-xs font-semibold border ${typeConfig.class} whitespace-nowrap`}>
                          {typeConfig.label}
                        </span>
                      </td>

                      {/* Linked Courses */}
                      <td className="py-3.5 px-4 align-top">
                        {item.course_count === 0 || !item.linked_courses || item.linked_courses.length === 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                            FAQ dùng chung
                          </span>
                        ) : (
                          <div className="flex flex-col space-y-0.5">
                            {item.linked_courses.slice(0, 2).map((c: any) => (
                              <a
                                key={c.id}
                                href={`/admin/courses?open_course_id=${c.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="text-xs font-medium text-ink hover:text-blue-600 truncate max-w-[180px] block transition-colors"
                                title={c.title}
                              >
                                • {c.title}
                              </a>
                            ))}
                            {item.course_count > 2 && (
                              <span className="text-[11px] font-semibold text-mid-gray block mt-0.5">
                                +{item.course_count - 2} khóa học khác
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Sort Order */}
                      <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                        <span className="text-xs font-semibold tabular-nums text-ink bg-canvas px-2.5 py-1 rounded-lg border border-hairline">
                          {item.sort_order ?? 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusConfig.textClass}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`}></span>
                          <span>{statusConfig.label}</span>
                        </div>
                      </td>

                      {/* Updated At */}
                      <td className="py-3.5 px-4 align-top text-mid-gray text-xs whitespace-nowrap">
                        {dateFormatted}
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
        <div className="p-3.5 bg-surface-alt border border-hairline border-t-0 rounded-b-2xl select-none mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-mid-gray flex items-center gap-4 flex-wrap">
              <div>
                Hiển thị
                <span className="font-semibold text-ink mx-1">
                  {((page - 1) * perPage + 1).toLocaleString("vi-VN")}
                </span>
                -
                <span className="font-semibold text-ink mx-1">
                  {Math.min(page * perPage, meta.total).toLocaleString("vi-VN")}
                </span>
                trong tổng số
                <span className="font-semibold text-ink mx-1">
                  {meta.total.toLocaleString("vi-VN")}
                </span>
                bản ghi
              </div>

              <div className="flex items-center gap-1.5">
                <span>Mỗi trang:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-paper border border-hairline rounded-[6px] px-2 py-0.5 text-xs text-ink outline-none cursor-pointer"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                className="inline-flex h-8 items-center gap-1 rounded-full border border-hairline bg-paper px-3 text-xs font-medium text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"></path>
                </svg>
                <span>Trước</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: meta.last_page || 1 }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                      page === p
                        ? "bg-ink text-white shadow-subtle"
                        : "border border-hairline bg-paper text-ink hover:bg-canvas"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={page >= meta.last_page}
                onClick={() => setPage(prev => Math.min(prev + 1, meta.last_page))}
                className="inline-flex h-8 items-center gap-1 rounded-full border border-hairline bg-paper px-3 text-xs font-medium text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
              >
                <span>Sau</span>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Chi tiết FAQ */}
      {drawerOpen && selectedFaq && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity duration-300 opacity-100 cursor-pointer"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-paper shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0 border-l border-hairline">
              {/* Drawer Header */}
              <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-hairline bg-surface-alt/50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-mid-gray">
                    FAQ #{selectedFaq.id}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeMap[selectedFaq.type]?.class || ''}`}>
                    {typeMap[selectedFaq.type]?.label || selectedFaq.type}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-full border border-hairline p-1.5 text-mid-gray hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Trạng thái hiển thị */}
                <div className="rounded-2xl bg-canvas p-4 border border-hairline flex items-center justify-between">
                  <div className="text-xs font-medium text-mid-gray">Trạng thái hiển thị:</div>
                  <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${statusMap[selectedFaq.status]?.textClass || ''}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusMap[selectedFaq.status]?.dotClass || ''}`}></span>
                    <span>{statusMap[selectedFaq.status]?.label || selectedFaq.status}</span>
                  </div>
                </div>

                {/* Thứ tự */}
                <div className="flex items-center justify-between text-sm px-1 border-b border-hairline pb-4">
                  <span className="font-semibold text-mid-gray">Thứ tự hiển thị:</span>
                  <span className="font-semibold text-ink">{selectedFaq.sort_order ?? 0}</span>
                </div>

                {/* Câu hỏi */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-mid-gray uppercase tracking-wider">Câu hỏi</h4>
                  <p className="text-base font-semibold text-ink leading-relaxed bg-canvas/30 p-4 rounded-2xl border border-hairline">
                    {selectedFaq.question}
                  </p>
                </div>

                {/* Câu trả lời */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-mid-gray uppercase tracking-wider">Câu trả lời</h4>
                  <div className="text-sm text-ink leading-relaxed bg-canvas/30 p-4 rounded-2xl border border-hairline whitespace-pre-wrap">
                    {selectedFaq.answer}
                  </div>
                </div>

                {/* Khóa học liên kết */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-mid-gray uppercase tracking-wider">Khóa học liên kết</h4>
                    <button
                      type="button"
                      onClick={() => openSyncModal(selectedFaq)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Quản lý liên kết
                    </button>
                  </div>
                  {selectedFaq.course_count === 0 || !selectedFaq.linked_courses || selectedFaq.linked_courses.length === 0 ? (
                    <div className="p-6 border border-dashed border-hairline rounded-2xl bg-canvas/20 text-center text-xs text-mid-gray">
                      Đây là FAQ chung toàn hệ thống, hiện chưa liên kết riêng với khóa học nào.
                    </div>
                  ) : (
                    <div className="border border-hairline rounded-2xl bg-canvas/20 overflow-hidden divide-y divide-hairline">
                      {selectedFaq.linked_courses.map((course: any) => (
                        <div key={course.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-canvas/50 transition-colors">
                          <span className="font-medium text-ink max-w-sm truncate">{course.title}</span>
                          <a
                            href={`/admin/courses?open_course_id=${course.id}`}
                            className="text-blue-600 hover:underline font-semibold shrink-0"
                          >
                            Chi tiết
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 px-6 border-t border-hairline bg-surface-alt/50 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => openDeleteModal(selectedFaq)}
                  className="px-4 py-2 border border-red-200 text-red-500 rounded-full text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Xóa FAQ
                </button>
                <button
                  type="button"
                  onClick={() => openFormModal(selectedFaq)}
                  className="px-6 py-2 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 shadow-subtle transition-all cursor-pointer"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo / Chỉnh sửa FAQ */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div
              onClick={() => setFormModalOpen(false)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity cursor-pointer"
            />

            <div className="relative transform overflow-hidden rounded-3xl border border-hairline bg-paper text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl z-10">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-hairline px-6 py-4 bg-surface-alt/50">
                <h3 className="text-lg font-semibold text-ink">
                  {modalMode === 'edit' ? "Chỉnh sửa FAQ" : "Tạo FAQ mới"}
                </h3>
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="rounded-full border border-hairline p-1.5 text-mid-gray hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                {/* Question */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mid-gray mb-1.5">
                    Câu hỏi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formFaq.question}
                    onChange={(e) => setFormFaq(prev => ({ ...prev, question: e.target.value }))}
                    className="w-full rounded-2xl border border-hairline bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-mid-gray/50 focus:border-ink focus:outline-none transition-colors"
                    placeholder="Nhập nội dung câu hỏi thường gặp..."
                  />
                  {errors.question && <p className="mt-1 text-xs text-red-500">{errors.question}</p>}
                </div>

                {/* Answer */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mid-gray mb-1.5">
                    Câu trả lời <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formFaq.answer}
                    onChange={(e) => setFormFaq(prev => ({ ...prev, answer: e.target.value }))}
                    className="w-full rounded-2xl border border-hairline bg-canvas p-4 text-sm text-ink placeholder:text-mid-gray/50 focus:border-ink focus:outline-none transition-colors custom-scrollbar"
                    placeholder="Nhập câu trả lời chi tiết..."
                  />
                  {errors.answer && <p className="mt-1 text-xs text-red-500">{errors.answer}</p>}
                </div>

                {/* Type & Sort Order Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Type */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-mid-gray mb-1.5">
                      Loại FAQ <span class="text-red-500">*</span>
                    </label>
                    <select
                      value={formFaq.type}
                      onChange={(e) => setFormFaq(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full h-10 rounded-full border border-hairline bg-canvas px-3 text-sm text-ink outline-none cursor-pointer"
                    >
                      <option value="general">Chung</option>
                      <option value="account">Tài khoản</option>
                      <option value="course">Khóa học</option>
                      <option value="payment">Thanh toán</option>
                      <option value="refund">Hoàn tiền</option>
                      <option value="certificate">Chứng chỉ</option>
                      <option value="technical">Kỹ thuật</option>
                      <option value="policy">Chính sách</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-mid-gray mb-1.5">
                      Thứ tự hiển thị
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formFaq.sort_order}
                      onChange={(e) => setFormFaq(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                      className="w-full h-10 rounded-full border border-hairline bg-canvas px-4 text-sm text-ink focus:border-ink focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mid-gray mb-1.5">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formFaq.status}
                    onChange={(e) => setFormFaq(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full h-10 rounded-full border border-hairline bg-canvas px-3 text-sm text-ink outline-none cursor-pointer"
                  >
                    <option value="active">● Đang hiển thị</option>
                    <option value="inactive">● Đang ẩn</option>
                  </select>
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline">
                  <button
                    type="button"
                    onClick={() => setFormModalOpen(false)}
                    className="px-5 h-10 rounded-full border border-hairline bg-paper text-ink font-medium text-xs md:text-sm hover:bg-canvas transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 h-10 rounded-full bg-ink text-white font-medium text-xs md:text-sm shadow-subtle hover:bg-ink/90 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <span>{submitting ? "Đang lưu..." : "Lưu FAQ"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quản lý liên kết khóa học */}
      {syncModalOpen && selectedFaq && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div
              onClick={() => setSyncModalOpen(false)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity cursor-pointer"
            />

            <div className="relative transform overflow-hidden rounded-3xl border border-hairline bg-paper text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl z-10">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-hairline px-6 py-4 bg-surface-alt/50">
                <div>
                  <h3 className="text-lg font-semibold text-ink">Quản lý liên kết khóa học</h3>
                  <p className="text-xs text-mid-gray truncate max-w-md mt-0.5">
                    Đang chọn cho FAQ: "{selectedFaq.question}"
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSyncModalOpen(false)}
                  className="rounded-full border border-hairline p-1.5 text-mid-gray hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Search Course Input */}
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="w-4 h-4 text-mid-gray" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="w-full h-10 rounded-full border border-hairline bg-canvas pl-9 pr-4 text-sm text-ink placeholder:text-mid-gray/60 focus:border-ink focus:outline-none transition-colors"
                    placeholder="Tìm theo tên khóa học, giảng viên, ID..."
                  />
                </div>

                {/* Selection Status Bar */}
                <div className="flex items-center justify-between px-1 text-xs">
                  <span className="font-medium text-ink">
                    Đã chọn {selectedCourseIds.length} khóa học
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCourseIds([])}
                    className="text-red-500 hover:text-red-600 font-medium hover:underline transition-colors cursor-pointer"
                  >
                    Xóa tất cả lựa chọn
                  </button>
                </div>

                {/* Course Checkbox List */}
                <div className="border border-hairline rounded-2xl bg-canvas/40 max-h-80 overflow-y-auto custom-scrollbar divide-y divide-hairline">
                  {coursesLoading ? (
                    <div className="p-6 text-center text-xs text-mid-gray">Đang tải danh sách khóa học...</div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="p-6 text-center text-xs text-mid-gray">Không tìm thấy khóa học nào phù hợp.</div>
                  ) : (
                    filteredCourses.map((c) => {
                      const isChecked = selectedCourseIds.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className="flex items-center gap-3 p-3.5 text-xs text-ink hover:bg-canvas/50 transition-colors cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedCourseIds(prev => prev.filter(id => id !== c.id));
                              } else {
                                setSelectedCourseIds(prev => [...prev, c.id]);
                              }
                            }}
                            className="h-4.5 w-4.5 rounded border-hairline text-ink focus:ring-ink"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-ink truncate max-w-lg">{c.title}</span>
                            <span className="text-[10px] text-mid-gray mt-0.5">
                              ID: #{c.id} • Giảng viên: {c.instructor?.full_name || "Chưa rõ"}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-hairline bg-surface-alt/50">
                <button
                  type="button"
                  onClick={() => setSyncModalOpen(false)}
                  className="px-5 h-10 rounded-full border border-hairline bg-paper text-ink font-medium text-xs md:text-sm hover:bg-canvas transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveCourseSync}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 h-10 rounded-full bg-ink text-white font-medium text-xs md:text-sm shadow-subtle hover:bg-ink/90 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <span>{submitting ? "Đang lưu..." : "Lưu liên kết"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa FAQ */}
      {deleteModalOpen && faqToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div
              onClick={() => setDeleteModalOpen(false)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity cursor-pointer"
            />

            <div className="relative transform overflow-hidden rounded-3xl border border-hairline bg-paper text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md z-10">
              {/* Modal Body */}
              <div className="p-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                  </svg>
                </div>

                <h3 className="text-center text-lg font-semibold text-ink">Xác nhận xóa FAQ</h3>
                <p className="mt-2 text-center text-sm text-mid-gray">
                  Bạn có chắc chắn muốn xóa FAQ này? Hành động này sẽ chuyển FAQ vào trạng thái đã xóa mềm.
                </p>

                {/* Target FAQ Info Box */}
                <div className="mt-4 rounded-2xl border border-hairline bg-canvas p-3.5 space-y-1.5 text-xs">
                  <div className="font-medium text-ink line-clamp-2">{faqToDelete.question}</div>
                  <div className="flex items-center justify-between text-mid-gray pt-1">
                    <span>Loại: {typeMap[faqToDelete.type]?.label || faqToDelete.type}</span>
                    <span>Đang liên kết: {faqToDelete.course_count ?? 0} khóa học</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-hairline bg-surface-alt/50">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-5 h-10 rounded-full border border-hairline bg-paper text-ink font-medium text-xs md:text-sm hover:bg-canvas transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 h-10 rounded-full bg-red-600 text-white font-medium text-xs md:text-sm shadow-subtle hover:bg-red-700 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <span>{submitting ? "Đang xóa..." : "Xóa FAQ"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
