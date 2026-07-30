import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Copy, MoreVertical, Edit2, ShieldAlert, CheckCircle2, AlertTriangle, Undo, Plus, Minus, Save, X } from "lucide-react";
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
  viewMode: 'tree' | 'flat';
  onToggleExpand: (id: number) => void;
  onCopySlug: (slug: string) => void;
  onViewDetail: (id: number) => void;
  onEdit: (id: number) => void;
  onChangeStatus: (id: number, targetStatus: 'active' | 'inactive') => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onSaveSortOrder: (id: number, value: number) => Promise<boolean>;
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
  onSaveSortOrder,
}: CategoryRowProps) {
  const { id, name, slug, status, deleted_at, depth = 0, hasChildren = false, isExpanded = false, course_count = 0, isContextual = false } = category;

  // Inline Sort Order State
  const initialValue = category.sort_order;
  const [inputValue, setInputValue] = useState<string | number>(initialValue === 0 ? "Chưa xếp" : initialValue);
  const [isChanged, setIsChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setInputValue(initialValue === 0 ? "Chưa xếp" : initialValue);
    setIsChanged(false);
  }, [initialValue]);

  const getNumericValue = (val: string | number): number => {
    if (val === "" || String(val).toLowerCase() === "chưa xếp") return 0;
    const parsed = parseInt(String(val), 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setInputValue(rawVal);
    const numVal = getNumericValue(rawVal);
    setIsChanged(numVal !== initialValue);
  };

  const handleInputBlur = () => {
    const numVal = getNumericValue(inputValue);
    if (numVal < 0) {
      setInputValue(initialValue === 0 ? "Chưa xếp" : initialValue);
      setIsChanged(false);
    } else {
      setInputValue(numVal === 0 ? "Chưa xếp" : numVal);
      setIsChanged(numVal !== initialValue);
    }
  };

  const handleIncrement = () => {
    const current = getNumericValue(inputValue);
    const next = current + 1;
    setInputValue(next);
    setIsChanged(next !== initialValue);
  };

  const handleDecrement = () => {
    const current = getNumericValue(inputValue);
    if (current <= 1) {
      setInputValue("Chưa xếp");
      setIsChanged(0 !== initialValue);
    } else {
      const next = current - 1;
      setInputValue(next);
      setIsChanged(next !== initialValue);
    }
  };

  const handleSave = async () => {
    const numVal = getNumericValue(inputValue);
    setIsSaving(true);
    const success = await onSaveSortOrder(id, numVal);
    setIsSaving(false);
    if (success) {
      setIsChanged(false);
    } else {
      // rollback
      setInputValue(initialValue === 0 ? "Chưa xếp" : initialValue);
      setIsChanged(false);
    }
  };

  const handleCancel = () => {
    setInputValue(initialValue === 0 ? "Chưa xếp" : initialValue);
    setIsChanged(false);
  };

  // Status Badges Render
  const isDeleted = deleted_at !== null;
  
  const renderStatus = () => {
    if (isDeleted) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium text-danger-brick bg-danger-brick/10 border border-danger-brick/20 select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-danger-brick animate-pulse"></span>Đã xóa
        </span>
      );
    }
    if (status === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium text-success bg-success-soft border border-success/15 select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-success"></span>Đang hoạt động
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium text-mid-gray bg-canvas border border-hairline select-none">
        <span className="h-1.5 w-1.5 rounded-full bg-mid-gray"></span>Ngừng hoạt động
      </span>
    );
  };

  // Check conditions for deleting category
  const hasCourses = course_count > 0;
  const canDelete = !isDeleted && status === "inactive" && !hasCourses && !hasChildren;

  // Build Delete Tooltip
  let deleteTooltip = "";
  if (!canDelete && !isDeleted) {
    if (status === "active") {
      deleteTooltip = "Cần chuyển trạng thái sang Ngừng hoạt động trước khi xóa.";
    } else if (hasCourses && hasChildren) {
      deleteTooltip = "Không thể xóa vì danh mục đang chứa khóa học và danh mục con.";
    } else if (hasCourses) {
      deleteTooltip = "Không thể xóa vì danh mục đang chứa khóa học liên kết.";
    } else if (hasChildren) {
      deleteTooltip = "Không thể xóa vì danh mục đang chứa danh mục con.";
    }
  }

  // Formatting Date
  const dateObj = new Date(category.updated_at || category.created_at);
  const dateStr = isNaN(dateObj.getTime())
    ? "---"
    : `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;

  return (
    <tr
      className={cn(
        "hover:bg-canvas/50 transition-colors border-b border-hairline/60",
        isDeleted && "opacity-75 bg-canvas/30",
        isContextual && "opacity-60 bg-surface-alt/20"
      )}
    >
      {/* Category Name Column */}
      <td
        className="py-2.5 font-bold text-ink select-text"
        style={{ paddingLeft: viewMode === 'tree' ? `${depth * 1.5 + 1}rem` : '1rem' }}
      >
        <div className="flex items-center gap-1.5">
          {viewMode === 'tree' && hasChildren ? (
            <button
              onClick={() => onToggleExpand(id)}
              className="p-1 hover:bg-canvas rounded cursor-pointer transition-colors text-mid-gray hover:text-ink flex items-center justify-center shrink-0"
              aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : viewMode === 'tree' && depth > 0 ? (
            <span className="w-5 text-mid-gray/40 font-mono text-center select-none shrink-0">└──</span>
          ) : viewMode === 'tree' ? (
            <span className="w-5 shrink-0" />
          ) : null}

          <div className="flex flex-col truncate max-w-[260px]">
            <span className="truncate">{name}</span>
            {isContextual && (
              <span className="text-[9px] text-warning font-semibold tracking-wide uppercase mt-0.5">
                * Dòng ngữ cảnh
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Parent Category Column */}
      <td className="px-3 py-2.5 whitespace-nowrap text-mid-gray select-text">
        {category.parent ? (
          <span className="font-medium text-ink">{category.parent.name}</span>
        ) : (
          <span className="px-2 py-0.5 rounded-[6px] bg-canvas text-mid-gray border border-hairline font-semibold text-[10px] font-sans">
            Danh mục gốc
          </span>
        )}
      </td>

      {/* Slug Column */}
      <td className="px-3 py-2.5 whitespace-nowrap font-mono text-[11px] text-ink select-text">
        <div className="flex items-center gap-1.5">
          <span className="truncate max-w-[120px] bg-canvas/60 px-1.5 py-0.5 rounded border border-hairline">
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
      <td className="px-3 py-2.5 text-center select-text">
        {course_count > 0 ? (
          <span className="font-bold text-ink underline font-sans">
            {course_count}
          </span>
        ) : (
          <span className="text-mid-gray/60 font-sans">0</span>
        )}
      </td>

      {/* Sort Order Column */}
      <td className="px-3 py-2.5 text-center whitespace-nowrap">
        <div className="flex items-center justify-center gap-1.5">
          <div
            title="Giá trị 0 nghĩa là chưa thiết lập ưu tiên và sẽ được xếp sau các danh mục đã có thứ tự."
            className="flex items-center h-8 border border-hairline rounded-[6px] bg-canvas overflow-hidden w-28 focus-within:border-ink transition-colors"
          >
            <button
              type="button"
              onClick={handleDecrement}
              disabled={isDeleted || isSaving}
              className="flex items-center justify-center w-7 h-full hover:bg-hairline text-mid-gray hover:text-ink transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              disabled={isDeleted || isSaving}
              className="w-14 h-full text-center bg-transparent border-0 outline-none text-ink text-xs font-semibold focus:ring-0 focus:outline-none disabled:opacity-50 select-all"
            />
            <button
              type="button"
              onClick={handleIncrement}
              disabled={isDeleted || isSaving}
              className="flex items-center justify-center w-7 h-full hover:bg-hairline text-mid-gray hover:text-ink transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          
          <div className={cn("flex items-center gap-1", !isChanged && "hidden")}>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn-sort-save p-1 rounded bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              title="Lưu thay đổi"
            >
              <Save className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="btn-sort-cancel p-1 rounded border border-hairline hover:bg-canvas text-mid-gray hover:text-ink transition-colors cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              title="Hủy bỏ"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </td>

      {/* Status Column */}
      <td className="px-3 py-2.5 text-center">
        {renderStatus()}
      </td>

      {/* Date Column */}
      <td className="px-3 py-2.5 whitespace-nowrap text-mid-gray text-xs">
        {dateStr}
      </td>

      {/* Action Menu (Radix DropdownMenu) */}
      <td className="pr-4 py-2.5 text-right relative">
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
                <DropdownMenuItem className="text-success focus:text-success" onClick={() => onRestore(id)}>
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
                      !canDelete && "opacity-40 cursor-not-allowed"
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
