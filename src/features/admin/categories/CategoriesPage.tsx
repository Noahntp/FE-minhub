import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Plus,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Ghost,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

import {
  Category,
  CategorySummary,
  CategoryFilters,
  ViewMode,
} from "./categories.types";
import { CategoriesService } from "./categories.service";
import { processTreeViewData, paginateTreeView } from "./categories.utils";

import CategoryRow from "./components/CategoryRow";
import CategoryDetailDrawer from "./components/CategoryDetailDrawer";
import CategoryFormModal from "./components/CategoryFormModal";
import CategoryConfirmModal from "./components/CategoryConfirmModal";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Skeleton } from "@/shared/components/ui/skeleton";

const STORAGE_KEY = "mindhub_admin_categories_expanded";

export default function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // 1. Lấy bộ lọc từ URL
  const filters: CategoryFilters = useMemo(() => {
    return {
      search: searchParams.get("search") || "",
      status: (searchParams.get("status") as any) || "",
      type: (searchParams.get("type") as any) || "",
      parent_id: searchParams.get("parent_id") || "",
      sort_by: (searchParams.get("sort_by") as any) || "newest",
      page: parseInt(searchParams.get("page") || "1", 10),
      per_page: parseInt(searchParams.get("per_page") || "20", 10),
      empty: searchParams.get("empty") || "",
    };
  }, [searchParams]);

  // 2. Chế độ xem: Luôn cố định Tree View để giữ cấu trúc cha-con không bị xáo trộn
  const viewMode: ViewMode = "tree";

  // States
  const [summary, setSummary] = useState<CategorySummary>({
    total_categories: 0,
    active_categories: 0,
    inactive_categories: 0,
    root_categories: 0,
    empty_categories: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Expanded Category IDs (dùng cho Tree View)
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<number>>(
    new Set(),
  );

  // States kéo thả và lưu thứ tự
  const [isOrderChanged, setIsOrderChanged] = useState(false);
  const [originalCategoriesCache, setOriginalCategoriesCache] = useState<
    Category[] | null
  >(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // Modal / Drawer States
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState<"status" | "delete">(
    "delete",
  );
  const [selectedConfirmCategory, setSelectedConfirmCategory] =
    useState<Category | null>(null);
  const [targetStatus, setTargetStatus] = useState<"active" | "inactive">(
    "active",
  );

  // Khởi tạo danh sách category cho dropdown cha
  const [allCategoriesCache, setAllCategoriesCache] = useState<Category[]>([]);

  // 3. Hàm cập nhật URL Search Params
  const updateUrlParams = useCallback(
    (newFilters: Partial<CategoryFilters>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        // Merge new filters
        Object.entries(newFilters).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== "") {
            // Tránh ghi giá trị default rườm rà
            if (key === "page" && Number(val) === 1) {
              next.delete(key);
              return;
            }
            if (key === "per_page" && Number(val) === 20) {
              next.delete(key);
              return;
            }
            if (key === "sort_by" && val === "newest") {
              next.delete(key);
              return;
            }
            next.set(key, String(val));
          } else {
            next.delete(key);
          }
        });

        return next;
      });
    },
    [setSearchParams],
  );

  // 4. Đồng bộ deep link open_category từ URL
  useEffect(() => {
    const openId = searchParams.get("open_category");
    if (openId) {
      const parsed = parseInt(openId, 10);
      if (!isNaN(parsed)) {
        setSelectedDetailId(parsed);
        setDetailDrawerOpen(true);
      }
    }
  }, [searchParams]);

  // 5. Hàm tải dữ liệu chính
  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setIsLoading(true);
        setIsOrderChanged(false);
        setOriginalCategoriesCache(null);
      }
      setIsError(false);

      try {
        // Chỉ tải dữ liệu nguồn, filters.status là tham số duy nhất ảnh hưởng tới API tải về
        const res = await CategoriesService.getCategoriesAll(filters.status);
        if (res.success) {
          setAllCategoriesCache(res.data.items);
          setSummary(res.data.summary);

          // Thực hiện dọn dẹp sessionStorage expanded IDs
          cleanExpandedSessionStorage(res.data.items);
        } else {
          if (!isBackground) {
            setIsError(true);
            setErrorMessage(res.message || "Tải dữ liệu thất bại.");
          }
        }
      } catch (err: any) {
        console.error("Lỗi khi fetch categories page:", err);
        if (!isBackground) {
          setIsError(true);
          setErrorMessage("Không thể kết nối đến máy chủ dữ liệu.");
        }
      } finally {
        if (!isBackground) {
          setIsLoading(false);
        }
      }
    },
    [filters.status],
  );

  // Gọi fetch khi bộ lọc status thay đổi
  useEffect(() => {
    fetchData();
  }, [filters.status]);

  // 6. Xử lý sessionStorage cho expanded IDs
  useEffect(() => {
    if (viewMode === "tree") {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved === null) {
        // Chưa có key: mặc định mở rộng toàn bộ các danh mục gốc chưa bị xóa
        const roots = allCategoriesCache.filter(
          (c) => c.parent_id === null && c.deleted_at === null,
        );
        const rootIds = new Set(roots.map((r) => r.id));
        setExpandedCategoryIds(rootIds);
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(Array.from(rootIds)),
        );
      } else {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setExpandedCategoryIds(new Set(parsed.map(Number)));
          } else {
            throw new Error("Invalid structure");
          }
        } catch (e) {
          console.error("Lỗi parse sessionStorage expanded, reset cache:", e);
          sessionStorage.removeItem(STORAGE_KEY);
          // Quay về mặc định
          const roots = allCategoriesCache.filter(
            (c) => c.parent_id === null && c.deleted_at === null,
          );
          const rootIds = new Set(roots.map((r) => r.id));
          setExpandedCategoryIds(rootIds);
        }
      }
    }
  }, [viewMode, allCategoriesCache.length]);

  // Hàm dọn dẹp ID không tồn tại hoặc không còn con khỏi sessionStorage
  const cleanExpandedSessionStorage = (allCats: Category[]) => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const validIds = parsed.filter((id) => {
          const cat = allCats.find((c) => c.id === Number(id));
          if (!cat) return false;
          // Có con trực thuộc chưa bị xóa
          const hasChildren = allCats.some(
            (ch) => ch.parent_id === cat.id && ch.deleted_at === null,
          );
          return hasChildren;
        });
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(validIds));
      }
    } catch (e) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  // Toggle Mở rộng/Thu gọn
  const handleToggleExpand = (id: number) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      // Đồng bộ vào sessionStorage
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // 7. Xử lý Action Row
  const handleCopySlug = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(slug);
      toast.success(`Đã sao chép: ${slug}`);
    } catch (e) {
      toast.error("Trình duyệt không hỗ trợ sao chép nhanh.");
    }
  };

  const handleViewDetail = (id: number) => {
    setSelectedDetailId(id);
    setDetailDrawerOpen(true);
    // Đồng bộ drawer vào URL
    updateUrlParams({ open_category: id } as any);
  };

  const handleCloseDetail = () => {
    setDetailDrawerOpen(false);
    setSelectedDetailId(null);
    // Xóa parameter open_category trên URL, giữ nguyên các filter khác
    updateUrlParams({ open_category: "" } as any);
  };

  const handleEdit = (id: number) => {
    setSelectedFormId(id);
    setFormModalMode("edit");
    setFormModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedFormId(null);
    setFormModalMode("create");
    setFormModalOpen(true);
  };

  const handleChangeStatus = (id: number, status: "active" | "inactive") => {
    const cat = allCategoriesCache.find((c) => c.id === id);
    if (cat) {
      setSelectedConfirmCategory(cat);
      setTargetStatus(status);
      setConfirmModalType("status");
      setConfirmModalOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    const cat = allCategoriesCache.find((c) => c.id === id);
    if (cat) {
      setSelectedConfirmCategory(cat);
      setConfirmModalType("delete");
      setConfirmModalOpen(true);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const res = await CategoriesService.restoreCategory(id);
      if (res.success) {
        toast.success("Khôi phục danh mục thành công.");
        fetchData();
      } else {
        toast.error(res.message || "Khôi phục danh mục thất bại.");
      }
    } catch (e) {
      toast.error("Đã xảy ra sự cố kết nối khôi phục.");
    }
  };

  const handleMovePosition = (id: number, direction: "up" | "down") => {
    const item = allCategoriesCache.find((c) => c.id === id);
    if (!item) return;

    // backupCache
    if (!isOrderChanged) {
      setOriginalCategoriesCache(
        JSON.parse(JSON.stringify(allCategoriesCache)),
      );
      setIsOrderChanged(true);
    }

    const sameLevel = allCategoriesCache.filter(
      (c) => c.parent_id === item.parent_id,
    );
    sameLevel.sort((a, b) => {
      const sa = a.sort_order || 0;
      const sb = b.sort_order || 0;
      if (sa > 0 && sb > 0) {
        if (sa !== sb) return sa - sb;
        return (a.name || "").localeCompare(b.name || "", "vi");
      }
      if (sa > 0 && sb === 0) return -1;
      if (sa === 0 && sb > 0) return 1;
      return (a.name || "").localeCompare(b.name || "", "vi");
    });

    const index = sameLevel.findIndex((c) => c.id === id);
    if (index === -1) return;

    // Không mutate! Clone mảng sibling
    const sortedSiblings = [...sameLevel];
    if (direction === "up" && index > 0) {
      const temp = sortedSiblings[index];
      sortedSiblings[index] = sortedSiblings[index - 1];
      sortedSiblings[index - 1] = temp;
    } else if (direction === "down" && index < sortedSiblings.length - 1) {
      const temp = sortedSiblings[index];
      sortedSiblings[index] = sortedSiblings[index + 1];
      sortedSiblings[index + 1] = temp;
    } else {
      return;
    }

    // Map tạo các objects mới với sort_order mới
    const updatedSiblings = sortedSiblings.map((c, idx) => ({
      ...c,
      sort_order: idx + 1,
    }));

    // Cập nhật cache local bằng cách map tạo mảng mới, clone object
    const newCache = allCategoriesCache.map((c) => {
      const found = updatedSiblings.find((t) => t.id === c.id);
      if (found) {
        return found;
      }
      return c;
    });

    setAllCategoriesCache(newCache);
  };

  const handleDragDrop = (
    draggedCategoryId: number,
    targetCategoryId: number,
    dropPosition: "before" | "after",
  ) => {
    if (draggedCategoryId === targetCategoryId) return;

    const draggedItem = allCategoriesCache.find(
      (c) => c.id === draggedCategoryId,
    );
    const targetItem = allCategoriesCache.find(
      (c) => c.id === targetCategoryId,
    );
    if (
      !draggedItem ||
      !targetItem ||
      draggedItem.parent_id !== targetItem.parent_id ||
      draggedItem.parent_id === null
    )
      return;

    // backupCache
    if (!isOrderChanged) {
      setOriginalCategoriesCache(
        JSON.parse(JSON.stringify(allCategoriesCache)),
      );
      setIsOrderChanged(true);
    }

    const sameLevel = allCategoriesCache.filter(
      (c) => c.parent_id === draggedItem.parent_id,
    );
    sameLevel.sort((a, b) => {
      const sa = a.sort_order || 0;
      const sb = b.sort_order || 0;
      if (sa > 0 && sb > 0) {
        if (sa !== sb) return sa - sb;
        return (a.name || "").localeCompare(b.name || "", "vi");
      }
      if (sa > 0 && sb === 0) return -1;
      if (sa === 0 && sb > 0) return 1;
      return (a.name || "").localeCompare(b.name || "", "vi");
    });

    const draggedIndex = sameLevel.findIndex((c) => c.id === draggedCategoryId);
    if (draggedIndex === -1) return;

    // Clone mảng sibling
    const sortedSiblings = [...sameLevel];
    // Xóa item kéo
    const [removed] = sortedSiblings.splice(draggedIndex, 1);

    // Tìm index mới của target item sau khi đã remove dragged item
    const targetIndex = sortedSiblings.findIndex(
      (c) => c.id === targetCategoryId,
    );
    if (targetIndex === -1) return;

    // Xác định index chèn dựa trên dropPosition
    const insertIndex =
      dropPosition === "before" ? targetIndex : targetIndex + 1;
    sortedSiblings.splice(insertIndex, 0, removed);

    // Map tạo các objects mới với sort_order mới
    const updatedSiblings = sortedSiblings.map((c, idx) => ({
      ...c,
      sort_order: idx + 1,
    }));

    const newCache = allCategoriesCache.map((c) => {
      const found = updatedSiblings.find((t) => t.id === c.id);
      if (found) {
        return found;
      }
      return c;
    });

    setAllCategoriesCache(newCache);
  };

  const handleCancelReorder = () => {
    if (originalCategoriesCache) {
      setAllCategoriesCache(originalCategoriesCache);
      setIsOrderChanged(false);
      setOriginalCategoriesCache(null);
      toast.info("Đã hủy bỏ thay đổi thứ tự hiển thị.");
    }
  };

  const handleSaveReorder = async () => {
    if (!originalCategoriesCache) return;

    const changedItems: Array<{
      id: number;
      sort_order: number;
      parent_id: number | null;
    }> = [];
    allCategoriesCache.forEach((c) => {
      const orig = originalCategoriesCache.find((o) => o.id === c.id);
      if (
        orig &&
        (orig.sort_order !== c.sort_order || orig.parent_id !== c.parent_id)
      ) {
        changedItems.push({
          id: c.id,
          sort_order: c.sort_order,
          parent_id: c.parent_id,
        });
      }
    });

    if (changedItems.length === 0) {
      setIsOrderChanged(false);
      setOriginalCategoriesCache(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await CategoriesService.reorderCategories(changedItems);
      if (res.success) {
        toast.success(res.message);
        setIsOrderChanged(false);
        setOriginalCategoriesCache(null);
        await fetchData(true);
      } else {
        toast.error(res.message || "Lưu thứ tự thất bại.");
        setAllCategoriesCache(originalCategoriesCache);
        setIsOrderChanged(false);
        setOriginalCategoriesCache(null);
      }
    } catch (e: any) {
      toast.error("Đã xảy ra sự cố kết nối khi lưu thứ tự.");
      setAllCategoriesCache(originalCategoriesCache);
      setIsOrderChanged(false);
      setOriginalCategoriesCache(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSortOrder = async (
    id: number,
    value: number,
  ): Promise<boolean> => {
    try {
      const res = await CategoriesService.updateCategory(id, {
        sort_order: value,
      });
      if (res.success) {
        toast.success(`Đã đổi thứ tự hiển thị thành ${value}.`);
        await fetchData(true);
        return true;
      } else {
        toast.error(res.message || "Không thể cập nhật thứ tự.");
        return false;
      }
    } catch (e) {
      toast.error("Đã xảy ra sự cố kết nối máy chủ.");
      return false;
    }
  };

  // 8. Thuật toán lọc Tree View và Phân trang Client-side để tính toán chỉ số hiển thị
  const fStatus = filters.status;
  const fSearch = filters.search;
  const fType = filters.type;
  const fParentId = filters.parent_id;
  const fEmpty = filters.empty;
  const fSortBy = filters.sort_by;
  const fPage = filters.page;
  const fPerPage = filters.per_page;

  // 8. Thuật toán lọc Tree View và Phân trang Client-side để tính toán chỉ số hiển thị
  const treeMetrics = useMemo(() => {
    if (viewMode !== "tree") return null;
    const data = processTreeViewData(
      allCategoriesCache,
      filters,
      expandedCategoryIds,
    );
    return data;
  }, [
    viewMode,
    allCategoriesCache,
    fStatus,
    fSearch,
    fType,
    fParentId,
    fEmpty,
    fSortBy,
    expandedCategoryIds,
  ]);

  // Phân trang Metadata tính toán
  const paginationMeta = useMemo(() => {
    if (viewMode === "tree" && treeMetrics) {
      const total = treeMetrics.totalRootBranches;
      const lastPage = Math.max(1, Math.ceil(total / fPerPage));

      const from = total > 0 ? (fPage - 1) * fPerPage + 1 : 0;
      const to = Math.min(total, fPage * fPerPage);

      return { total, lastPage, from, to };
    } else {
      return {
        total: summary.total_categories,
        lastPage: Math.ceil(summary.total_categories / fPerPage),
        from: summary.total_categories > 0 ? (fPage - 1) * fPerPage + 1 : 0,
        to: Math.min(summary.total_categories, fPage * fPerPage),
      };
    }
  }, [viewMode, treeMetrics, fPage, fPerPage, summary]);

  // Danh sách hiển thị thực tế đã lọc và phân trang
  const categoriesList = useMemo(() => {
    if (!treeMetrics) return [];
    const paginatedTree = paginateTreeView(
      treeMetrics.processedList,
      treeMetrics.qualifyingRootIds,
      fPage,
      fPerPage,
    );
    return paginatedTree;
  }, [treeMetrics, fPage, fPerPage]);

  // Nút chuyển trang pagination
  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
  };

  // Thay đổi số dòng mỗi trang
  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    updateUrlParams({ per_page: val, page: 1 });
  };

  // Xóa từng chip bộ lọc
  const handleRemoveFilter = (key: keyof CategoryFilters) => {
    // Reset page về 1 khi đổi bộ lọc
    const updates: Partial<CategoryFilters> = { [key]: "", page: 1 };
    updateUrlParams(updates);
  };

  // Reset toàn bộ bộ lọc
  const handleResetAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleKpiClick = (newFilters: Partial<CategoryFilters>) => {
    const targetFilters: Record<string, string> = {
      search: "",
      status: "",
      type: "",
      parent_id: "",
      empty: "",
      page: "1",
    };

    Object.entries(newFilters).forEach(([key, val]) => {
      targetFilters[key] = String(val);
    });

    updateUrlParams(targetFilters as any);

    setTimeout(() => {
      if (resultsSectionRef.current) {
        resultsSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  // Phân trang numbers builder
  const renderPageNumbers = () => {
    const meta =
      viewMode === "tree" && treeMetrics
        ? { last_page: paginationMeta.lastPage }
        : { last_page: paginationMeta.lastPage }; // lấy từ API thực tế hoặc tính toán

    const lastPage = meta.last_page;
    const currentPage = filters.page;
    const pages = [];

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(lastPage, currentPage + 2);

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="h-8 w-8 text-xs font-semibold rounded-[6px] border border-hairline hover:bg-canvas transition-colors cursor-pointer"
        >
          1
        </button>,
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots-start" className="text-xs text-mid-gray px-1">
            ...
          </span>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === currentPage;
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={cn(
            "h-8 w-8 text-xs font-semibold rounded-[6px] border transition-colors cursor-pointer",
            isActive
              ? "bg-ink text-white font-bold border-ink"
              : "bg-paper text-ink hover:bg-canvas border-hairline",
          )}
        >
          {i}
        </button>,
      );
    }

    if (endPage < lastPage) {
      if (endPage < lastPage - 1) {
        pages.push(
          <span key="dots-end" className="text-xs text-mid-gray px-1">
            ...
          </span>,
        );
      }
      pages.push(
        <button
          key={lastPage}
          onClick={() => handlePageChange(lastPage)}
          className="h-8 w-8 text-xs font-semibold rounded-[6px] border border-hairline hover:bg-canvas transition-colors cursor-pointer"
        >
          {lastPage}
        </button>,
      );
    }

    return pages;
  };

  // Build active chips
  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.search) {
      chips.push({
        key: "search" as const,
        label: `Từ khóa: "${filters.search}"`,
      });
    }
    if (filters.status) {
      let label = "Ngừng hoạt động";
      if (filters.status === "active") label = "Đang hoạt động";
      else if (filters.status === "deleted") label = "Đã xóa";
      chips.push({ key: "status" as const, label: `Trạng thái: ${label}` });
    }
    if (filters.type) {
      const label = filters.type === "root" ? "Danh mục gốc" : "Danh mục con";
      chips.push({ key: "type" as const, label: `Loại: ${label}` });
    }
    if (filters.parent_id) {
      const parent = allCategoriesCache.find(
        (c) => c.id === Number(filters.parent_id),
      );
      chips.push({
        key: "parent_id" as const,
        label: `Cha: ${parent ? parent.name : filters.parent_id}`,
      });
    }
    if (filters.empty === "true") {
      chips.push({ key: "empty" as const, label: "Chưa có khóa học" });
    }
    return chips;
  }, [filters, allCategoriesCache]);

  return (
    <main className="p-5 md:p-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-mid-gray uppercase tracking-wider">
            Cấu hình hệ thống
          </p>
          <h1 className="mt-1 text-2xl lg:text-3xl font-bold tracking-tight text-ink">
            Quản lý danh mục (
            <span id="title-total-categories">{summary.total_categories}</span>)
          </h1>
          <p className="text-xs text-mid-gray mt-1">
            Quản lý danh mục cha, danh mục con và phân loại khóa học trên hệ
            thống.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Thêm danh mục
        </button>
      </div>

      {/* KPI Cards Area */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle space-y-3 min-h-[92px]"
            >
              <Skeleton className="h-3 w-16 bg-canvas rounded-full" />
              <Skeleton className="h-6 w-10 bg-canvas rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        (() => {
          const isTotalActive =
            !filters.status &&
            !filters.type &&
            filters.empty !== "true" &&
            !filters.search;
          const isActiveActive = filters.status === "active";
          const isInactiveActive = filters.status === "inactive";
          const isRootActive = filters.type === "root";
          const isEmptyActive = filters.empty === "true";

          return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Tổng danh mục */}
              <button
                type="button"
                onClick={() => handleKpiClick({})}
                className={cn(
                  "w-full text-left rounded-[6px] border border-hairline p-4 shadow-subtle flex flex-col justify-between min-h-[92px] transition-all hover:bg-canvas/50 cursor-pointer focus:outline-none",
                  isTotalActive
                    ? "ring-2 ring-ink/20 bg-canvas/35 border-ink/40"
                    : "bg-paper text-ink",
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-mid-gray">
                  Tổng danh mục
                </span>
                <div className="mt-2 w-full">
                  <span className="text-xl lg:text-2xl font-bold text-ink leading-none font-sans block">
                    {summary.total_categories}
                  </span>
                  <p className="text-[9px] text-mid-gray mt-1">
                    Danh mục trên hệ thống
                  </p>
                </div>
              </button>
              {/* Đang hoạt động */}
              <button
                type="button"
                onClick={() => handleKpiClick({ status: "active" })}
                className={cn(
                  "w-full text-left rounded-[6px] border border-hairline p-4 shadow-subtle flex flex-col justify-between min-h-[92px] transition-all hover:bg-canvas/50 cursor-pointer focus:outline-none",
                  isActiveActive
                    ? "ring-2 ring-success/20 bg-success/5 border-success/40"
                    : "bg-paper text-ink border-t-2 border-t-success",
                )}
              >
                <div className="flex items-center justify-between text-mid-gray w-full">
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    Đang hoạt động
                  </span>
                  <span className="flex h-1.5 w-1.5 rounded-full bg-success"></span>
                </div>
                <div className="mt-2 w-full">
                  <span className="text-xl lg:text-2xl font-bold text-success leading-none font-sans block">
                    {summary.active_categories}
                  </span>
                  <p className="text-[9px] text-mid-gray mt-1">
                    Khả dụng hiển thị
                  </p>
                </div>
              </button>
              {/* Ngừng hoạt động */}
              <button
                type="button"
                onClick={() => handleKpiClick({ status: "inactive" })}
                className={cn(
                  "w-full text-left rounded-[6px] border border-hairline p-4 shadow-subtle flex flex-col justify-between min-h-[92px] transition-all hover:bg-canvas/50 cursor-pointer focus:outline-none",
                  isInactiveActive
                    ? "ring-2 ring-danger-brick/20 bg-danger-brick/5 border-danger-brick/40"
                    : "bg-paper text-ink border-t-2 border-t-danger-brick",
                )}
              >
                <div className="flex items-center justify-between text-mid-gray w-full">
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    Ngừng hoạt động
                  </span>
                  <span className="flex h-1.5 w-1.5 rounded-full bg-danger-brick"></span>
                </div>
                <div className="mt-2 w-full">
                  <span className="text-xl lg:text-2xl font-bold text-danger-brick leading-none font-sans block">
                    {summary.inactive_categories}
                  </span>
                  <p className="text-[9px] text-mid-gray mt-1">Đang tạm ẩn</p>
                </div>
              </button>
              {/* Danh mục gốc */}
              <button
                type="button"
                onClick={() => handleKpiClick({ type: "root" })}
                className={cn(
                  "w-full text-left rounded-[6px] border border-hairline p-4 shadow-subtle flex flex-col justify-between min-h-[92px] transition-all hover:bg-canvas/50 cursor-pointer focus:outline-none",
                  isRootActive
                    ? "ring-2 ring-ink/20 bg-canvas/35 border-ink/40"
                    : "bg-paper text-ink",
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-mid-gray">
                  Danh mục gốc
                </span>
                <div className="mt-2 w-full">
                  <span className="text-xl lg:text-2xl font-bold text-ink leading-none font-sans block">
                    {summary.root_categories}
                  </span>
                  <p className="text-[9px] text-mid-gray mt-1">
                    Danh mục cấp cao nhất
                  </p>
                </div>
              </button>
              {/* Chưa có khóa học */}
              <button
                type="button"
                onClick={() => handleKpiClick({ empty: "true" })}
                className={cn(
                  "w-full text-left rounded-[6px] border border-hairline p-4 shadow-subtle flex flex-col justify-between min-h-[92px] transition-all hover:bg-canvas/50 cursor-pointer focus:outline-none",
                  isEmptyActive
                    ? "ring-2 ring-warning/20 bg-warning/5 border-warning/40"
                    : "bg-paper text-ink border-t-2 border-t-warning",
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-mid-gray">
                  Chưa có khóa học
                </span>
                <div className="mt-2 w-full">
                  <span className="text-xl lg:text-2xl font-bold text-warning leading-none font-sans block">
                    {summary.empty_categories}
                  </span>
                  <p className="text-[9px] text-mid-gray mt-1">
                    Chưa có nội dung
                  </p>
                </div>
              </button>
            </div>
          );
        })()
      )}

      {/* Search & Filter Bar */}
      <section
        ref={resultsSectionRef}
        className="scroll-mt-24 rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label
              htmlFor="filter-search"
              className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5"
            >
              Tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                id="filter-search"
                value={filters.search}
                onChange={(e) =>
                  updateUrlParams({ search: e.target.value, page: 1 })
                }
                placeholder="Tên hoặc slug danh mục..."
                disabled={isLoading}
                className="w-full h-10 pl-8 pr-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink placeholder-mid-gray/70 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-mid-gray/80 absolute left-3 top-3.5" />
            </div>
          </div>
          {/* Status */}
          <div>
            <label
              htmlFor="filter-status"
              className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5"
            >
              Trạng thái
            </label>
            <select
              id="filter-status"
              value={filters.status}
              onChange={(e) =>
                updateUrlParams({ status: e.target.value as any, page: 1 })
              }
              disabled={isLoading}
              className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
              <option value="deleted">Đã xóa (Thùng rác)</option>
            </select>
          </div>
          {/* Type */}
          <div>
            <label
              htmlFor="filter-type"
              className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5"
            >
              Loại danh mục
            </label>
            <select
              id="filter-type"
              value={filters.type}
              onChange={(e) =>
                updateUrlParams({ type: e.target.value as any, page: 1 })
              }
              disabled={isLoading}
              className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all"
            >
              <option value="">Tất cả loại</option>
              <option value="root">Danh mục gốc</option>
              <option value="child">Danh mục con</option>
            </select>
          </div>
          {/* Parent Category */}
          <div>
            <label
              htmlFor="filter-parent"
              className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5"
            >
              Danh mục cha
            </label>
            <select
              id="filter-parent"
              value={filters.parent_id}
              onChange={(e) =>
                updateUrlParams({ parent_id: e.target.value, page: 1 })
              }
              disabled={isLoading}
              className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all"
            >
              <option value="">Tất cả cha</option>
              {allCategoriesCache
                .filter((c) => c.parent_id === null && c.deleted_at === null)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          {/* Sort By */}
          <div>
            <label
              htmlFor="filter-sort"
              className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5"
            >
              Sắp xếp
            </label>
            <select
              id="filter-sort"
              value={filters.sort_by}
              onChange={(e) =>
                updateUrlParams({ sort_by: e.target.value as any })
              }
              disabled={isLoading}
              className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name_asc">Tên A-Z</option>
              <option value="name_desc">Tên Z-A</option>
              <option value="sort_order_asc">Thứ tự tăng dần</option>
              <option value="sort_order_desc">Thứ tự giảm dần</option>
              <option value="courses_desc">Nhiều khóa học nhất</option>
            </select>
          </div>
        </div>

        {/* Reset Filter Row */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-hairline/60 gap-3">
          <span className="text-[10px] text-mid-gray italic">
            * Giao diện tự động lọc dựa trên các tiêu chí bạn chọn.
          </span>
          <button
            type="button"
            onClick={handleResetAllFilters}
            className="px-4 py-2 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      </section>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-bold text-mid-gray uppercase tracking-wider mr-1">
            Đang lọc theo:
          </span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-canvas border border-hairline text-ink select-none"
            >
              {chip.label}
              <button
                type="button"
                onClick={() => handleRemoveFilter(chip.key)}
                className="hover:text-danger-brick cursor-pointer p-0.5 shrink-0"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Main Data Section */}
      <section className="rounded-[6px] border border-hairline bg-paper shadow-subtle overflow-hidden">
        {/* Banner Lưu thứ tự hiển thị (Batch Reorder Action Bar) */}
        {isOrderChanged && (
          <div className="flex h-12 items-center justify-between px-4 border-b border-warning/20 bg-warning-soft text-warning-brick text-xs font-semibold select-none animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-warning animate-pulse"></span>
              <span>Bạn có thay đổi chưa lưu về thứ tự hiển thị danh mục.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelReorder}
                className="px-3 py-1 rounded-[4px] border border-warning/30 hover:bg-warning-soft/80 text-warning-brick transition-colors cursor-pointer"
              >
                Hủy thay đổi
              </button>
              <button
                type="button"
                onClick={handleSaveReorder}
                className="px-3 py-1 rounded-[4px] bg-warning text-warning-brick hover:bg-warning/90 font-bold transition-all cursor-pointer shadow-sm"
              >
                Lưu thứ tự
              </button>
            </div>
          </div>
        )}

        {/* Table Toolbar */}
        <div className="flex h-12 items-center justify-between px-4 border-b border-hairline bg-surface-alt/40 text-xs text-mid-gray">
          <div>
            <span>
              Hiển thị kết quả thứ{" "}
              <span className="font-semibold text-ink">
                {paginationMeta.from}
              </span>{" "}
              đến{" "}
              <span className="font-semibold text-ink">
                {paginationMeta.to}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold text-ink">
                {paginationMeta.total}
              </span>{" "}
              nhánh danh mục gốc
            </span>
          </div>
          <button
            type="button"
            onClick={() => fetchData()}
            disabled={isLoading}
            className="p-1.5 hover:bg-canvas rounded-full text-mid-gray hover:text-ink transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>
        </div>

        {/* Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-alt border-b border-hairline text-[10px] font-bold text-mid-gray uppercase tracking-wider h-10 select-none">
                <th className="pl-4 py-2 w-1/3">Danh mục</th>
                <th className="px-3 py-2 w-[15%]">Danh mục cha</th>
                <th className="px-3 py-2 w-[15%]">Slug</th>
                <th className="px-3 py-2 w-[10%] text-center">Số khóa học</th>
                <th className="px-3 py-2 w-[10%] text-center">Thứ tự</th>
                <th className="px-3 py-2 w-[10%] text-center">Trạng thái</th>
                <th className="px-3 py-2 w-[12%]">Ngày cập nhật</th>
                <th className="pr-4 py-2 w-[8%] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {isLoading
                ? // Loading Skeleton Row Items
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="h-12 border-b border-hairline/60">
                      <td className="pl-4 py-2.5">
                        <Skeleton className="h-4 w-32 bg-canvas rounded" />
                      </td>
                      <td className="px-3 py-2.5">
                        <Skeleton className="h-4 w-20 bg-canvas rounded" />
                      </td>
                      <td className="px-3 py-2.5">
                        <Skeleton className="h-4 w-24 bg-canvas rounded" />
                      </td>
                      <td className="px-3 py-2.5">
                        <Skeleton className="h-4 w-8 mx-auto bg-canvas rounded" />
                      </td>
                      <td className="px-3 py-2.5">
                        <Skeleton className="h-6 w-20 mx-auto bg-canvas rounded" />
                      </td>
                      <td className="px-3 py-2.5">
                        <Skeleton className="h-4 w-20 mx-auto bg-canvas rounded-full" />
                      </td>
                      <td className="px-3 py-2.5">
                        <Skeleton className="h-4 w-16 bg-canvas rounded" />
                      </td>
                      <td className="pr-4 py-2.5">
                        <Skeleton className="h-6 w-6 ml-auto bg-canvas rounded-full" />
                      </td>
                    </tr>
                  ))
                : categoriesList.length === 0
                  ? // Empty states
                    null
                  : categoriesList
                      .filter((c) => c.visible)
                      .map((cat) => {
                        const sameLevel = allCategoriesCache.filter(
                          (c) => c.parent_id === cat.parent_id,
                        );
                        sameLevel.sort((a, b) => {
                          const sa = a.sort_order || 0;
                          const sb = b.sort_order || 0;
                          if (sa > 0 && sb > 0) {
                            if (sa !== sb) return sa - sb;
                            return (a.name || "").localeCompare(
                              b.name || "",
                              "vi",
                            );
                          }
                          if (sa > 0 && sb === 0) return -1;
                          if (sa === 0 && sb > 0) return 1;
                          return (a.name || "").localeCompare(
                            b.name || "",
                            "vi",
                          );
                        });
                        const idx = sameLevel.findIndex((c) => c.id === cat.id);
                        const isFirstChild = idx === 0;
                        const isLastChild = idx === sameLevel.length - 1;

                        return (
                          <CategoryRow
                            key={cat.id}
                            category={cat}
                            viewMode={viewMode}
                            onToggleExpand={handleToggleExpand}
                            onCopySlug={handleCopySlug}
                            onViewDetail={handleViewDetail}
                            onEdit={handleEdit}
                            onChangeStatus={handleChangeStatus}
                            onDelete={handleDelete}
                            onRestore={handleRestore}
                            onSaveSortOrder={handleSaveSortOrder}
                            onMovePosition={handleMovePosition}
                            onDragDrop={handleDragDrop}
                            draggedId={draggedId}
                            setDraggedId={setDraggedId}
                            dragOverId={dragOverId}
                            setDragOverId={setDragOverId}
                            isFirstChild={isFirstChild}
                            isLastChild={isLastChild}
                          />
                        );
                      })}
            </tbody>
          </table>
        </div>

        {/* States Wrapper */}
        {!isLoading && categoriesList.length === 0 && (
          <div className="py-12 border-t border-hairline">
            {isError ? (
              <div className="max-w-xs mx-auto text-center space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-brick-soft text-danger-brick mx-auto">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-danger-brick">
                  Lỗi tải dữ liệu
                </h3>
                <p className="text-xs text-mid-gray leading-normal">
                  {errorMessage}
                </p>
                <button
                  type="button"
                  onClick={() => fetchData()}
                  className="px-4 py-2 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Thử lại
                </button>
              </div>
            ) : activeChips.length > 0 ? (
              <EmptyState
                icon={Ghost}
                title="Không tìm thấy danh mục"
                description="Không có danh mục nào khớp với bộ lọc hiện tại của bạn."
                actionLabel="Đặt lại bộ lọc"
                onAction={handleResetAllFilters}
              />
            ) : (
              <EmptyState
                icon={Ghost}
                title="Chưa có danh mục nào"
                description="Hệ thống hiện tại chưa thiết lập danh mục khóa học nào."
                actionLabel="Tạo danh mục"
                onAction={handleCreate}
              />
            )}
          </div>
        )}
      </section>

      {/* Pagination Controls */}
      {!isError && (
        <div
          id="pagination-wrapper"
          className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2"
        >
          {/* Per Page Select */}
          <div className="flex items-center gap-2 text-xs text-mid-gray">
            <span>Hiển thị</span>
            <select
              value={filters.per_page}
              onChange={handlePerPageChange}
              disabled={isLoading}
              className="h-8 px-2 bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span>danh mục trên trang</span>
          </div>

          {/* Page numbers navigation */}
          {paginationMeta.lastPage > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1 || isLoading}
                className="h-8 w-8 rounded-[6px] border border-hairline bg-paper text-ink hover:bg-canvas disabled:opacity-40 disabled:hover:bg-paper transition-all flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {renderPageNumbers()}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === paginationMeta.lastPage || isLoading}
                className="h-8 w-8 rounded-[6px] border border-hairline bg-paper text-ink hover:bg-canvas disabled:opacity-40 disabled:hover:bg-paper transition-all flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Form Dialog Modal */}
      <CategoryFormModal
        isOpen={formModalOpen}
        mode={formModalMode}
        categoryId={selectedFormId}
        allCategories={allCategoriesCache}
        onClose={() => setFormModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* Confirm Dialog Modal */}
      <CategoryConfirmModal
        isOpen={confirmModalOpen}
        type={confirmModalType}
        category={selectedConfirmCategory}
        targetStatus={targetStatus}
        onClose={() => setConfirmModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* Detail Drawer */}
      <CategoryDetailDrawer
        isOpen={detailDrawerOpen}
        categoryId={selectedDetailId}
        onClose={handleCloseDetail}
      />
    </main>
  );
}
