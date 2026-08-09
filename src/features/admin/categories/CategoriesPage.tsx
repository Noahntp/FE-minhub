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
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

import {
  Category,
  CategorySummary,
  CategoryFilters,
  ViewMode,
} from "./categories.types";
import { CategoriesService } from "./categories.service";
import { processTreeViewData, paginateTreeView } from "./categories.utils";

import CategoryRow from "./components/CategoryRow";
import CategorySelect from "./components/CategorySelect";
import CategoryDetailDrawer from "./components/CategoryDetailDrawer";
import CategoryFormModal from "./components/CategoryFormModal";
import CategoryConfirmModal from "./components/CategoryConfirmModal";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Skeleton } from "@/shared/components/ui/skeleton";
import AdminPagination from "../components/shared/AdminPagination";

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
      sort_by: (searchParams.get("sort_by") as any) || "sort_order_asc",
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

  // Khởi tạo danh sách category cho dropdown cha và cây cơ bản
  const [allCategoriesCache, setAllCategoriesCache] = useState<Category[]>([]);
  const [allCategoriesBase, setAllCategoriesBase] = useState<Category[]>([]);

  const draggedParentId = useMemo(() => {
    if (draggedId === null) return undefined;
    const cat = allCategoriesBase.find((c) => c.id === draggedId);
    return cat ? cat.parent_id : undefined;
  }, [draggedId, allCategoriesBase]);

  // 3. Hàm cập nhật URL Search Params (Mỗi bộ lọc hoạt động độc lập, không tự sửa filter khác)
  const updateUrlParams = useCallback(
    (newFilters: Partial<CategoryFilters>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        // Merge new filters directly
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
            if (key === "sort_by" && val === "sort_order_asc") {
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

  // 3.1 Unsaved changes shield
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [pendingFilterAction, setPendingFilterAction] = useState<
    (() => void) | null
  >(null);

  const safeFilterAction = useCallback(
    (action: () => void) => {
      if (isOrderChanged) {
        setPendingFilterAction(() => action);
        setShowUnsavedPrompt(true);
      } else {
        action();
      }
    },
    [isOrderChanged],
  );

  const isReorderAllowed = useMemo(() => {
    return (
      !filters.search &&
      !filters.status &&
      !filters.type &&
      !filters.parent_id &&
      !filters.empty &&
      filters.sort_by === "sort_order_asc" &&
      !isLoading
    );
  }, [filters, isLoading]);

  // Keep isOrderChanged in a ref to avoid fetchData callback re-creation
  const isOrderChangedRef = useRef(isOrderChanged);
  useEffect(() => {
    isOrderChangedRef.current = isOrderChanged;
  }, [isOrderChanged]);

  // State searchTerm cục bộ và debouncer
  const [searchTerm, setSearchTerm] = useState(filters.search);

  // Đồng bộ search value khi URL params bị xóa hoặc thay đổi ngoài (ví dụ: Reset bộ lọc)
  useEffect(() => {
    setSearchTerm(filters.search);
  }, [filters.search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim() !== filters.search.trim()) {
        safeFilterAction(() => {
          updateUrlParams({ search: searchTerm.trim(), page: 1 });
        });
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm, filters.search, updateUrlParams, safeFilterAction]);

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
      }
      setIsError(false);

      try {
        // Tải dữ liệu lọc thực tế
        const resFiltered = await CategoriesService.getCategoriesAll({
          status: filters.status,
          search: filters.search,
          type: filters.type,
          parent_id: filters.parent_id,
          sort_by: filters.sort_by,
          empty: filters.empty,
        });

        // Tải dữ liệu danh mục gốc đầy đủ từ nguồn cây đầy đủ (status: all_with_deleted)
        const resBase = await CategoriesService.getCategoriesAll({
          status: "all_with_deleted",
        });

        if (resFiltered.success && resBase.success) {
          setAllCategoriesCache(resFiltered.data.items);
          setSummary(resBase.data.summary);

          // Snapshot rules:
          // - Fetch success and no draft: update original and draft.
          // - Fetch success but has draft: keep draft and original!
          if (!isOrderChangedRef.current) {
            setOriginalCategoriesCache(
              JSON.parse(JSON.stringify(resBase.data.items)),
            );
            setAllCategoriesBase(resBase.data.items);
            cleanExpandedSessionStorage(resBase.data.items);
          }
        } else {
          if (!isBackground) {
            setIsError(true);
            setErrorMessage(
              resFiltered.message || resBase.message || "Tải dữ liệu thất bại.",
            );
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
    [
      filters.status,
      filters.search,
      filters.type,
      filters.parent_id,
      filters.sort_by,
      filters.empty,
    ],
  );

  // Gọi fetch khi bất kỳ bộ lọc nào thay đổi
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 6. Xử lý sessionStorage cho expanded IDs
  useEffect(() => {
    if (viewMode === "tree") {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved === null) {
        // Chưa có key: mặc định mở rộng toàn bộ các danh mục gốc chưa bị xóa
        const roots = allCategoriesBase.filter(
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
          const roots = allCategoriesBase.filter(
            (c) => c.parent_id === null && c.deleted_at === null,
          );
          const rootIds = new Set(roots.map((r) => r.id));
          setExpandedCategoryIds(rootIds);
        }
      }
    }
  }, [viewMode, allCategoriesBase.length]);

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
    const cat = allCategoriesBase.find((c) => c.id === id);
    if (cat) {
      setSelectedConfirmCategory(cat);
      setTargetStatus(status);
      setConfirmModalType("status");
      setConfirmModalOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    const cat = allCategoriesBase.find((c) => c.id === id);
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

  const generateSortOrderBetween = (
    prev: string | null,
    next: string | null,
  ): string => {
    const CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";
    const p = prev || "";
    const n = next || "";

    if (p === "" && n === "") return "m";

    if (p === "") {
      const firstChar = n.charAt(0);
      if (firstChar === "0") {
        return "0" + generateSortOrderBetween("", n.slice(1));
      }
      const index = CHARS.indexOf(firstChar);
      if (index > 1) {
        const midIndex = Math.floor(index / 2);
        return CHARS.charAt(midIndex);
      }
      return "0m";
    }

    if (n === "") {
      const lastChar = p.charAt(p.length - 1);
      const index = CHARS.indexOf(lastChar);
      if (index < CHARS.length - 1) {
        const midIndex = Math.floor((index + CHARS.length) / 2);
        return p.slice(0, -1) + CHARS.charAt(midIndex);
      }
      return p + "m";
    }

    let i = 0;
    while (i < p.length && i < n.length && p.charAt(i) === n.charAt(i)) {
      i++;
    }

    const charP = i < p.length ? p.charAt(i) : "0";
    const charN = i < n.length ? n.charAt(i) : "z";

    const idxP = CHARS.indexOf(charP);
    const idxN = CHARS.indexOf(charN);

    if (idxN - idxP > 1) {
      const midIdx = Math.floor((idxP + idxN) / 2);
      return p.slice(0, i) + CHARS.charAt(midIdx);
    }

    if (i === p.length) {
      const nextCharN = n.charAt(i);
      const idxNextN = CHARS.indexOf(nextCharN);
      if (idxNextN > 0) {
        const midIdx = Math.floor(idxNextN / 2);
        return p + CHARS.charAt(midIdx);
      }
      return p + "0m";
    }

    if (i < p.length - 1) {
      const nextCharP = p.charAt(i + 1);
      const idxNextP = CHARS.indexOf(nextCharP);
      const midIdx = Math.floor((idxNextP + CHARS.length) / 2);
      return p.slice(0, i + 1) + CHARS.charAt(midIdx);
    }

    return p + "m";
  };

  const calculateNewOrder = (
    targetParentId: number | null,
    draggedCategoryId: number,
    targetCategoryId: number,
    action: "before" | "after" | "up" | "down",
  ) => {
    const sortFn = (a: Category, b: Category) => {
      const sa = a.sort_order !== undefined && a.sort_order !== null ? String(a.sort_order) : "";
      const sb = b.sort_order !== undefined && b.sort_order !== null ? String(b.sort_order) : "";
      if (sa && sb) {
        if (sa !== sb) return sa.localeCompare(sb, "en");
        return (a.name || "").localeCompare(b.name || "", "vi");
      }
      if (sa && !sb) return -1;
      if (!sa && sb) return 1;
      return (a.name || "").localeCompare(b.name || "", "vi");
    };

    const targetSiblings = allCategoriesBase.filter(
      (c) => c.parent_id === targetParentId && c.id !== draggedCategoryId
    );
    targetSiblings.sort(sortFn);

    const draggedItem = allCategoriesBase.find((c) => c.id === draggedCategoryId);
    if (!draggedItem) return null;

    let newIndex = 0;
    if (action === "up" || action === "down") {
      const originalSiblings = allCategoriesBase.filter((c) => c.parent_id === draggedItem.parent_id);
      originalSiblings.sort(sortFn);
      const oldIndex = originalSiblings.findIndex((c) => c.id === draggedCategoryId);
      if (oldIndex === -1) return null;
      newIndex = action === "up" ? Math.max(0, oldIndex - 1) : Math.min(originalSiblings.length - 1, oldIndex + 1);
    } else {
      const targetIndex = targetSiblings.findIndex((c) => c.id === targetCategoryId);
      if (targetIndex !== -1) {
        newIndex = action === "before" ? targetIndex : targetIndex + 1;
      } else {
        newIndex = targetSiblings.length;
      }
    }

    targetSiblings.splice(newIndex, 0, draggedItem);

    const prevItem = newIndex > 0 ? targetSiblings[newIndex - 1] : null;
    const nextItem = newIndex < targetSiblings.length - 1 ? targetSiblings[newIndex + 1] : null;

    const prevSort = prevItem ? String(prevItem.sort_order) : null;
    const nextSort = nextItem ? String(nextItem.sort_order) : null;

    const newSortOrder = generateSortOrderBetween(prevSort, nextSort);

    const nextBase = allCategoriesBase.map((c) => {
      if (c.id === draggedCategoryId) {
        return { ...c, sort_order: newSortOrder, parent_id: targetParentId };
      }
      return c;
    });

    return { nextBase, newSortOrder, newParentId: targetParentId };
  };

  const persistReorder = async (
    draggedCategoryId: number,
    newParentId: number | null,
    newSortOrder: string,
    nextBase: Category[]
  ) => {
    // Optimistic UI update
    setAllCategoriesBase(nextBase);

    try {
      const res = await CategoriesService.updateCategory(draggedCategoryId, {
        parent_id: newParentId,
        sort_order: newSortOrder,
      } as any);

      if (res.success) {
        toast.success("Thay đổi vị trí thành công.");
      } else {
        toast.error(res.message || "Không thể lưu vị trí.");
        // Revert on failure
        fetchData(true);
      }
    } catch (e) {
      toast.error("Đã xảy ra sự cố kết nối máy chủ.");
      fetchData(true);
    }
  };

  const handleMovePosition = useCallback(
    (id: number, direction: "up" | "down") => {
      const item = allCategoriesBase.find((c) => c.id === id);
      if (!item) return;
      const result = calculateNewOrder(item.parent_id, id, id, direction);
      if (result) {
        persistReorder(id, result.newParentId, result.newSortOrder, result.nextBase);
      }
    },
    [allCategoriesBase],
  );

  const handleDragDrop = useCallback(
    (
      draggedCategoryId: number,
      targetCategoryId: number,
      dropPosition: "before" | "after",
    ) => {
      if (draggedCategoryId === targetCategoryId) return;

      const targetItem = allCategoriesBase.find((c) => c.id === targetCategoryId);
      if (!targetItem) return;

      const result = calculateNewOrder(targetItem.parent_id, draggedCategoryId, targetCategoryId, dropPosition);
      if (result) {
        persistReorder(draggedCategoryId, result.newParentId, result.newSortOrder, result.nextBase);
      }
    },
    [allCategoriesBase],
  );

  const handleCancelReorder = () => {
    if (originalCategoriesCache) {
      setAllCategoriesBase(JSON.parse(JSON.stringify(originalCategoriesCache)));
      setIsOrderChanged(false);
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
    allCategoriesBase.forEach((c) => {
      const orig = originalCategoriesCache.find((o) => o.id === c.id);
      if (
        orig &&
        (orig.sort_order !== c.sort_order || orig.parent_id !== c.parent_id)
      ) {
        changedItems.push({
          id: c.id,
          sort_order: Number(c.sort_order) || 0,
          parent_id: c.parent_id,
        });
      }
    });

    if (changedItems.length === 0) {
      setIsOrderChanged(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await CategoriesService.reorderCategories(changedItems);
      if (res.success) {
        toast.success(res.message);
        setOriginalCategoriesCache(
          JSON.parse(JSON.stringify(allCategoriesBase)),
        );
        setIsOrderChanged(false);
        await fetchData(true);
      } else {
        toast.error(res.message || "Lưu thứ tự thất bại.");
      }
    } catch (e: any) {
      toast.error("Đã xảy ra sự cố kết nối khi lưu thứ tự.");
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
    const matchedIds = new Set(allCategoriesCache.map((c) => c.id));
    const backendSortedIds = isOrderChanged
      ? undefined
      : allCategoriesCache.map((c) => c.id);
    const data = processTreeViewData(
      allCategoriesBase,
      {
        ...filters,
        matchedIds,
        backendSortedIds,
      },
      expandedCategoryIds,
    );
    return data;
  }, [
    viewMode,
    allCategoriesCache,
    allCategoriesBase,
    filters,
    expandedCategoryIds,
    isOrderChanged,
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
    safeFilterAction(() => {
      updateUrlParams({ page: newPage });
    });
  };

  // Thay đổi số dòng mỗi trang
  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    safeFilterAction(() => {
      updateUrlParams({ per_page: val, page: 1 });
    });
  };

  // Xóa từng chip bộ lọc
  const handleRemoveFilter = (key: keyof CategoryFilters) => {
    safeFilterAction(() => {
      // Reset page về 1 khi đổi bộ lọc
      const updates: Partial<CategoryFilters> = { [key]: "", page: 1 };
      updateUrlParams(updates);
    });
  };

  // Reset toàn bộ bộ lọc
  const handleResetAllFilters = () => {
    safeFilterAction(() => {
      setSearchParams(new URLSearchParams());
    });
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

    safeFilterAction(() => {
      updateUrlParams(targetFilters as any);

      setTimeout(() => {
        if (resultsSectionRef.current) {
          resultsSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    });
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
      const parent = allCategoriesBase.find(
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
  }, [filters, allCategoriesBase]);

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tên hoặc slug danh mục..."
                disabled={isLoading}
                className="w-full h-10 pl-8 pr-3 text-xs bg-paper border border-hairline rounded-lg hover:border-mid-gray/40 focus:ring-1 focus:ring-mid-gray/40 outline-none shadow-subtle font-medium text-ink transition-all placeholder:text-mid-gray/60 placeholder:font-normal"
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
            <CategorySelect
              id="filter-status"
              value={filters.status}
              onChange={(val) =>
                safeFilterAction(() =>
                  updateUrlParams({ status: val as any, page: 1 }),
                )
              }
              disabled={isLoading}
              options={[
                { value: "", label: "Tất cả trạng thái" },
                { value: "active", label: "Đang hoạt động" },
                { value: "inactive", label: "Ngừng hoạt động" },
                { value: "deleted", label: "Đã xóa (Thùng rác)" },
              ]}
            />
          </div>
          {/* Type */}
          <div>
            <label
              htmlFor="filter-type"
              className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5"
            >
              Loại danh mục
            </label>
            <CategorySelect
              id="filter-type"
              value={filters.type}
              onChange={(val) =>
                safeFilterAction(() =>
                  updateUrlParams({ type: val as any, page: 1 }),
                )
              }
              disabled={isLoading}
              options={[
                { value: "", label: "Tất cả loại" },
                { value: "root", label: "Danh mục gốc" },
                { value: "child", label: "Danh mục con" },
              ]}
            />
          </div>
          {/* Parent Category */}
          <div>
            <label
              htmlFor="filter-parent"
              className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5"
            >
              Danh mục cha
            </label>
            <CategorySelect
              id="filter-parent"
              value={filters.parent_id}
              onChange={(val) =>
                safeFilterAction(() =>
                  updateUrlParams({ parent_id: val, page: 1 }),
                )
              }
              disabled={isLoading}
              options={[
                { value: "", label: "Tất cả cha" },
                ...allCategoriesBase
                  .filter((c) => c.parent_id === null && c.deleted_at === null)
                  .sort(
                    (a, b) =>
                      (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0),
                  )
                  .map((c) => {
                    const childCount = allCategoriesBase.filter(
                      (ch) => ch.parent_id === c.id && ch.deleted_at === null,
                    ).length;
                    return {
                      value: String(c.id),
                      label: `${c.name} (${childCount})`,
                    };
                  }),
              ]}
            />
          </div>
          {/* Sort By */}
          <div>
            <label
              htmlFor="filter-sort"
              className="block text-[10px] font-semibold text-mid-gray uppercase tracking-wider mb-1.5"
            >
              Sắp xếp
            </label>
            <CategorySelect
              id="filter-sort"
              value={filters.sort_by}
              onChange={(val) =>
                safeFilterAction(() => updateUrlParams({ sort_by: val as any }))
              }
              disabled={isLoading}
              options={[
                { value: "newest", label: "Mới nhất" },
                { value: "oldest", label: "Cũ nhất" },
                { value: "name_asc", label: "Tên A-Z" },
                { value: "name_desc", label: "Tên Z-A" },
                { value: "sort_order_asc", label: "Thứ tự tăng dần" },
                { value: "sort_order_desc", label: "Thứ tự giảm dần" },
                { value: "courses_desc", label: "Nhiều khóa học nhất" },
              ]}
            />
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
        {/* Banner Removed since we auto save */}

        {/* Table Toolbar */}
        <div className="flex h-12 items-center justify-between px-4 border-b border-hairline bg-surface-alt/40 text-xs text-mid-gray">
          <div className="flex items-center gap-2">
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
            {treeMetrics && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-canvas border border-hairline text-ink">
                {filters.status ||
                filters.search ||
                filters.type ||
                filters.parent_id ||
                filters.empty === "true"
                  ? `Khớp bộ lọc: ${treeMetrics.matchedCategoryCount} danh mục`
                  : `Tổng cộng: ${treeMetrics.matchedCategoryCount} danh mục`}
              </span>
            )}
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
                        const sameLevel = allCategoriesBase.filter(
                          (c) =>
                            c.parent_id === cat.parent_id &&
                            c.deleted_at === null,
                        );
                        sameLevel.sort((a, b) => {
                          const sa =
                            a.sort_order !== undefined && a.sort_order !== null
                              ? String(a.sort_order)
                              : "";
                          const sb =
                            b.sort_order !== undefined && b.sort_order !== null
                              ? String(b.sort_order)
                              : "";
                          if (sa && sb) {
                            if (sa !== sb) return sa.localeCompare(sb, "en");
                            return (a.name || "").localeCompare(
                              b.name || "",
                              "vi",
                            );
                          }
                          if (sa && !sb) return -1;
                          if (!sa && sb) return 1;
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
                            onMovePosition={handleMovePosition}
                            onDragDrop={handleDragDrop}
                            draggedId={draggedId}
                            setDraggedId={setDraggedId}
                            dragOverId={dragOverId}
                            setDragOverId={setDragOverId}
                            draggedParentId={draggedParentId}
                            isFirstChild={isFirstChild}
                            isLastChild={isLastChild}
                            isReorderAllowed={isReorderAllowed}
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
              (() => {
                // Special message when filtering by parent_id on a parent with no children
                const isParentIdOnly =
                  filters.parent_id &&
                  !filters.search &&
                  !filters.status &&
                  !filters.type &&
                  filters.empty !== "true";
                const selectedParent = isParentIdOnly
                  ? allCategoriesBase.find(
                      (c) => String(c.id) === filters.parent_id,
                    )
                  : null;
                const selectedParentChildCount = selectedParent
                  ? allCategoriesBase.filter(
                      (c) =>
                        c.parent_id === selectedParent.id &&
                        c.deleted_at === null,
                    ).length
                  : -1;
                if (selectedParent && selectedParentChildCount === 0) {
                  return (
                    <EmptyState
                      icon={Ghost}
                      title="Danh mục này chưa có danh mục con"
                      description={`"${selectedParent.name}" hiện chưa có danh mục con nào. Bạn có thể thêm danh mục con mới.`}
                      actionLabel="Thêm danh mục con"
                      onAction={() => {
                        handleResetAllFilters();
                        setTimeout(() => handleCreate(), 50);
                      }}
                    />
                  );
                }
                return (
                  <EmptyState
                    icon={Ghost}
                    title="Không tìm thấy danh mục"
                    description="Không có danh mục nào khớp với bộ lọc hiện tại của bạn."
                    actionLabel="Đặt lại bộ lọc"
                    onAction={handleResetAllFilters}
                  />
                );
              })()
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
        <AdminPagination
          currentPage={filters.page}
          perPage={filters.per_page}
          total={
            viewMode === "tree" && treeMetrics
              ? treeMetrics.totalRootBranches
              : summary.total_categories
          }
          onPageChange={handlePageChange}
          onPerPageChange={(pp) => {
            safeFilterAction(() => {
              updateUrlParams({ per_page: pp, page: 1 });
            });
          }}
          itemLabel="danh mục"
        />
      )}

      {/* Form Dialog Modal */}
      <CategoryFormModal
        isOpen={formModalOpen}
        mode={formModalMode}
        categoryId={selectedFormId}
        allCategories={allCategoriesBase}
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

      {/* Unsaved Changes Confirmation Modal */}
      <Dialog
        open={showUnsavedPrompt}
        onOpenChange={(open) => !open && setShowUnsavedPrompt(false)}
      >
        <DialogContent className="sm:max-w-sm">
          <div className="space-y-4 py-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-warning-brick text-sm font-bold">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Thay đổi chưa lưu
              </DialogTitle>
            </DialogHeader>
            <div className="text-xs text-mid-gray leading-normal">
              Bạn có thay đổi chưa lưu về thứ tự hiển thị danh mục. Nếu bạn
              chuyển trang hoặc thay đổi bộ lọc, các thay đổi chưa lưu này sẽ bị
              hủy bỏ.
              <br />
              <br />
              Bạn có chắc muốn tiếp tục không?
            </div>
            <DialogFooter className="pt-2 border-t border-hairline/60 gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setShowUnsavedPrompt(false)}
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedPrompt(false);
                  setIsOrderChanged(false);
                  if (pendingFilterAction) {
                    pendingFilterAction();
                    setPendingFilterAction(null);
                  }
                }}
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                Tiếp tục và Bỏ qua
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Drawer */}
      <CategoryDetailDrawer
        isOpen={detailDrawerOpen}
        categoryId={selectedDetailId}
        onClose={handleCloseDetail}
      />
    </main>
  );
}
