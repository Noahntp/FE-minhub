import React, { useState, useRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  MoreVertical,
  Edit2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Undo,
  Plus,
  Minus,
  X,
} from "lucide-react";
import { Category } from "../categories.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

interface CategoryRowProps {
  category: Category;
  viewMode: "tree" | "flat";
  onToggleExpand: (id: number) => void;
  onCopySlug: (slug: string) => void;
  onViewDetail: (id: number) => void;
  onEdit: (id: number) => void;
  onChangeStatus: (id: number, targetStatus: "active" | "inactive") => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;

  onMovePosition?: (id: number, direction: "up" | "down") => void;
  onDragDrop?: (
    draggedId: number,
    targetId: number,
    dropPosition: "before" | "after",
  ) => void;
  draggedId?: number | null;
  setDraggedId?: (id: number | null) => void;
  dragOverId?: number | null;
  setDragOverId?: (id: number | null) => void;
  draggedParentId?: number | null;
  isFirstChild?: boolean;
  isLastChild?: boolean;
  isReorderAllowed?: boolean;
}

export default function CategoryRow({
  category,
  viewMode,
  onToggleExpand,
  onCopySlug,
  onViewDetail,
  onEdit,
  onChangeStatus,
  onDelete,
  onRestore,
  onMovePosition,
  onDragDrop,
  draggedId,
  setDraggedId,
  dragOverId,
  setDragOverId,
  draggedParentId,
  isFirstChild = false,
  isLastChild = false,
  isReorderAllowed = false,
}: CategoryRowProps) {
  const {
    id,
    name,
    slug,
    status,
    deleted_at,
    depth = 0,
    hasChildren = false,
    isExpanded = false,
    course_count = 0,
    isContextual = false,
  } = category;

  // Drop position indicator state ('before' | 'after' | null)
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null,
  );
  // Ref to block detail click directly after drag finishes
  const isJustDragged = useRef(false);

  // Status Badges Render
  const isDeleted = deleted_at !== null;

  const renderStatus = () => {
    if (isDeleted) {
      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-danger-brick animate-pulse"></span>
          <span className="text-xs font-semibold text-danger-brick">
            Đã xóa
          </span>
        </span>
      );
    }
    if (status === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
          <span className="text-xs font-semibold text-success">
            Đang hoạt động
          </span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-mid-gray"></span>
        <span className="text-xs font-semibold text-mid-gray">
          Ngừng hoạt động
        </span>
      </span>
    );
  };

  // Check conditions for deleting category
  const hasCourses = course_count > 0;
  const canDelete =
    !isDeleted && status === "inactive" && !hasCourses && !hasChildren;

  // Build Delete Tooltip
  let deleteTooltip = "";
  if (!canDelete && !isDeleted) {
    if (status === "active") {
      deleteTooltip =
        "Cần chuyển trạng thái sang Ngừng hoạt động trước khi xóa.";
    } else if (hasCourses && hasChildren) {
      deleteTooltip =
        "Không thể xóa vì danh mục đang chứa khóa học và danh mục con.";
    } else if (hasCourses) {
      deleteTooltip = "Không thể xóa vì danh mục đang chứa khóa học liên kết.";
    } else if (hasChildren) {
      deleteTooltip = "Không thể xóa vì danh mục đang chứa danh mục con.";
    }
  }

  // Formatting Date
  const dateObj = new Date(category.updated_at || category.created_at);
  let dateStr = "---";
  if (!isNaN(dateObj.getTime())) {
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    dateStr = `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  // Click row triggers detail view unless drag just finished
  const handleRowClick = () => {
    if (isJustDragged.current) {
      isJustDragged.current = false;
      return;
    }
    onViewDetail(id);
  };

  // Click parent name / chevron expands/collapses children
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === "tree" && hasChildren) {
      onToggleExpand(id);
    }
  };

  // Drag Handlers (Both root and child categories can be dragged under isReorderAllowed)
  const isDragEnabled = isReorderAllowed && !isDeleted && !isContextual;
  const isDraggable = isDragEnabled;

  const handleDragStart = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("a") ||
      target.closest("[role='menu']")
    ) {
      e.preventDefault();
      return;
    }

    if (!isDragEnabled) {
      e.preventDefault();
      return;
    }

    isJustDragged.current = true;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(id));

    // Use name container as the drag image to avoid table row rendering bugs
    const tr = target.closest("tr");
    const nameDiv = tr?.querySelector(".category-name-container");
    if (nameDiv && e.dataTransfer.setDragImage) {
      e.dataTransfer.setDragImage(nameDiv, 20, 10);
    }

    // Delay setting the state so the browser captures the solid drag image first
    setTimeout(() => {
      setDraggedId?.(id);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isDragEnabled || draggedId === null || draggedId === id || draggedParentId !== category.parent_id) return;

    e.preventDefault();
    setDragOverId?.(id);

    const rect = e.currentTarget.getBoundingClientRect();
    const middle = rect.top + rect.height / 2;
    const position = e.clientY < middle ? "before" : "after";
    setDropPosition(position);
  };

  const handleDragLeave = () => {
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rawDraggedId =
      draggedId ?? Number(e.dataTransfer.getData("text/plain"));

    if (rawDraggedId && rawDraggedId !== id && dropPosition !== null && draggedParentId === category.parent_id) {
      onDragDrop?.(rawDraggedId, id, dropPosition);
    }

    setDropPosition(null);
    setDraggedId?.(null);
    setDragOverId?.(null);

    setTimeout(() => {
      isJustDragged.current = false;
    }, 100);
  };

  const handleDragEnd = () => {
    setDropPosition(null);
    setDraggedId?.(null);
    setDragOverId?.(null);

    setTimeout(() => {
      isJustDragged.current = false;
    }, 100);
  };

  const fontClass =
    viewMode === "tree" && depth === 0
      ? "font-bold text-[13px]"
      : "font-normal text-xs";

  return (
    <tr
      onClick={handleRowClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      className={cn(
        "hover:bg-canvas/50 transition-all border-b border-hairline/60 select-none",
        isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isDeleted && "opacity-75 bg-canvas/30",
        isContextual && "opacity-60 bg-surface-alt/20",
        draggedId === id && "opacity-20 bg-canvas/40 border-y-2 border-dashed border-mid-gray/40 pointer-events-none scale-[0.99] transition-all",
        dropPosition === "before" &&
          "border-t-2 border-ink bg-ink/5 scale-[0.99] transition-transform",
        dropPosition === "after" &&
          "border-b-2 border-ink bg-ink/5 scale-[0.99] transition-transform",
      )}
      style={{
        WebkitUserDrag: isDraggable ? "element" : undefined,
      } as any}
    >
      {/* Category Name Column */}
      <td
        className={cn("py-2.5 font-bold text-ink", isDraggable && "select-none")}
        style={{
          paddingLeft: viewMode === "tree" ? `${depth * 1.5 + 1}rem` : "1rem",
        }}
      >
        <div className="flex items-center gap-1.5">

          {viewMode === "tree" && hasChildren ? (
            <button
              onClick={handleToggleClick}
              className="p-1 hover:bg-canvas rounded cursor-pointer transition-colors text-mid-gray hover:text-ink flex items-center justify-center shrink-0"
              aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : viewMode === "tree" && depth > 0 ? (
            <span className="w-5 text-mid-gray/40 font-mono text-center select-none shrink-0">
              └──
            </span>
          ) : viewMode === "tree" ? (
            <span className="w-5 shrink-0" />
          ) : null}

          <div className="category-name-container flex flex-col truncate max-w-[260px]" title={name}>
            <span
              className={cn(
                "truncate",
                fontClass,
              )}
            >
              {name}
            </span>

          </div>
        </div>
      </td>

      {/* Parent Category Column */}
      <td
        className={cn(
          "px-3 py-2.5 whitespace-nowrap text-mid-gray",
          isDraggable ? "select-none" : "select-text"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {category.parent ? (
          <span className="font-medium text-ink">{category.parent.name}</span>
        ) : (
          <span className="px-2 py-0.5 rounded-[6px] bg-canvas text-mid-gray border border-hairline font-semibold text-[10px] font-sans">
            Danh mục gốc
          </span>
        )}
      </td>

      {/* Slug Column */}
      <td
        className={cn(
          "px-3 py-2.5 whitespace-nowrap font-mono text-[11px] text-ink",
          isDraggable ? "select-none" : "select-text"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="truncate max-w-[120px] bg-canvas/60 px-1.5 py-0.5 rounded border border-hairline"
            title={slug}
          >
            {slug}
          </span>
          <button
            type="button"
            onClick={() => onCopySlug(slug)}
            className="text-mid-gray hover:text-ink p-1 hover:bg-canvas rounded transition-colors cursor-pointer shrink-0"
            title="Sao chép slug"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </td>

      {/* Courses Count Column */}
      <td
        className={cn(
          "px-3 py-2.5 text-center",
          isDraggable ? "select-none" : "select-text"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {course_count > 0 ? (
          <span className="font-bold text-ink underline font-sans">
            {course_count}
          </span>
        ) : (
          <span className="text-mid-gray/60 font-sans">0</span>
        )}
      </td>

      {/* Sort Order Column */}
      <td
        className="px-3 py-2.5 text-center whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center gap-1.5">
          <div
            title="Thứ tự hiển thị của danh mục (thay đổi bằng kéo thả hoặc nút + / -)."
            className="flex items-center h-8 border border-hairline rounded-[6px] bg-canvas overflow-hidden w-28 focus-within:border-ink transition-colors"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMovePosition?.(id, "up");
              }}
              disabled={isDeleted || isFirstChild || !isReorderAllowed || isContextual}
              title={
                isDeleted
                  ? "Không thể sắp xếp danh mục đã xóa"
                  : !isReorderAllowed
                  ? "Đặt lại bộ lọc và chọn Thứ tự tăng dần để sắp xếp"
                  : isFirstChild
                  ? "Đã ở đầu nhóm sibling"
                  : "Di chuyển lên một vị trí"
              }
              className="flex items-center justify-center w-7 h-full hover:bg-hairline text-mid-gray hover:text-ink transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="text"
              value={category.displayOrder || String(category.sort_order || 1)}
              disabled
              className={cn(
                "w-14 h-full text-center bg-transparent border-0 outline-none text-xs font-semibold focus:ring-0 focus:outline-none disabled:opacity-50 select-all",
                category.parent_id !== null
                  ? "text-mid-gray font-medium"
                  : "text-ink font-bold",
              )}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMovePosition?.(id, "down");
              }}
              disabled={isDeleted || isLastChild || !isReorderAllowed || isContextual}
              title={
                isDeleted
                  ? "Không thể sắp xếp danh mục đã xóa"
                  : !isReorderAllowed
                  ? "Đặt lại bộ lọc và chọn Thứ tự tăng dần để sắp xếp"
                  : isLastChild
                  ? "Đã ở cuối nhóm sibling"
                  : "Di chuyển xuống một vị trí"
              }
              className="flex items-center justify-center w-7 h-full hover:bg-hairline text-mid-gray hover:text-ink transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </td>

      {/* Status Column */}
      <td
        className={cn("px-3 py-2.5 text-center", isDraggable && "select-none")}
        onClick={(e) => e.stopPropagation()}
      >
        {renderStatus()}
      </td>

      {/* Date Column */}
      <td
        className={cn(
          "px-3 py-2.5 whitespace-nowrap text-mid-gray text-xs",
          isDraggable && "select-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {dateStr}
      </td>

      {/* Action Menu (Radix DropdownMenu) */}
      <td
        className="pr-4 py-2.5 text-right relative"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="btn-action-menu p-1 hover:bg-canvas rounded-full text-mid-gray hover:text-ink transition-colors cursor-pointer inline-flex items-center justify-center"
              aria-label="Xem menu thao tác"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {isDeleted ? (
              <>
                <DropdownMenuItem onClick={() => onViewDetail(id)}>
                  <ShieldAlert className="w-4 h-4 text-mid-gray" />
                  <span>Xem chi tiết</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-success focus:text-success"
                  onClick={() => onRestore(id)}
                >
                  <Undo className="w-4 h-4 text-success" />
                  <span>Khôi phục</span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => onViewDetail(id)}>
                  <ShieldAlert className="w-4 h-4 text-mid-gray" />
                  <span>Xem chi tiết</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(id)}>
                  <Edit2 className="w-4 h-4 text-mid-gray" />
                  <span>Chỉnh sửa</span>
                </DropdownMenuItem>

                {status === "active" ? (
                  <DropdownMenuItem
                    className="text-mid-gray"
                    onClick={() => onChangeStatus(id, "inactive")}
                  >
                    <AlertTriangle className="w-4 h-4 text-mid-gray" />
                    <span>Ngừng hoạt động</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-success focus:text-success"
                    onClick={() => onChangeStatus(id, "active")}
                  >
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Kích hoạt lại</span>
                  </DropdownMenuItem>
                )}

                {status === "inactive" && (
                  <DropdownMenuItem
                    disabled={!canDelete}
                    className={cn(
                      "text-danger-brick focus:text-danger-brick font-semibold",
                      !canDelete && "opacity-40 cursor-not-allowed",
                    )}
                    onClick={() => canDelete && onDelete(id)}
                    title={deleteTooltip}
                  >
                    <X className="w-4 h-4 text-danger-brick" />
                    <span>Xóa danh mục</span>
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
