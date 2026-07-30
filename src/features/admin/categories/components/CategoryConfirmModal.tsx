import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Category } from "../categories.types";
import { CategoriesService } from "../categories.service";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

interface CategoryConfirmModalProps {
  isOpen: boolean;
  type: 'status' | 'delete';
  category: Category | null;
  targetStatus?: 'active' | 'inactive';
  onClose: () => void;
  onSuccess: () => void;
}

export default function CategoryConfirmModal({
  isOpen,
  type,
  category,
  targetStatus,
  onClose,
  onSuccess,
}: CategoryConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!category) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      let res;
      if (type === "status" && targetStatus) {
        res = await CategoriesService.updateCategory(category.id, { status: targetStatus });
        if (res.success) {
          const statusLabel = targetStatus === "active" ? "kích hoạt lại" : "vô hiệu hóa";
          toast.success(`Đã ${statusLabel} danh mục "${category.name}" thành công.`);
          onSuccess();
          onClose();
        } else {
          toast.error(res.message || "Không thể đổi trạng thái danh mục.");
        }
      } else if (type === "delete") {
        res = await CategoriesService.deleteCategory(category.id);
        if (res.success) {
          toast.success(`Đã xóa danh mục "${category.name}" thành công.`, {
            duration: 8000,
            action: {
              label: "Khôi phục",
              onClick: async () => {
                try {
                  const restoreRes = await CategoriesService.restoreCategory(category.id);
                  if (restoreRes.success) {
                    toast.success(`Đã khôi phục danh mục "${category.name}".`);
                    onSuccess();
                  } else {
                    toast.error(restoreRes.message || "Không thể khôi phục danh mục.");
                  }
                } catch (err) {
                  console.error("Lỗi khi khôi phục từ toast:", err);
                  toast.error("Đã xảy ra sự cố kết nối khôi phục.");
                }
              }
            }
          });
          onSuccess();
          onClose();
        } else {
          toast.error(res.message || "Xóa danh mục thất bại.");
        }
      }
    } catch (err) {
      console.error("Lỗi xử lý xác nhận modal:", err);
      toast.error("Đã xảy ra sự cố kết nối máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-sm">
        {type === "status" ? (
          <div className="space-y-4 py-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-ink">
                <ShieldAlert className="w-5 h-5 text-mid-gray" />
                {targetStatus === "inactive" ? "Xác nhận ngừng hoạt động" : "Xác nhận kích hoạt lại"}
              </DialogTitle>
            </DialogHeader>

            <div className="text-xs text-mid-gray leading-normal">
              {targetStatus === "inactive" ? (
                <>
                  Bạn có chắc muốn <strong className="text-ink">ngừng hoạt động</strong> danh mục “<span className="font-semibold text-ink">{category.name}</span>” không?
                  <br />
                  <br />
                  <span className="text-[10px] text-mid-gray block leading-relaxed bg-surface-alt p-2.5 rounded-lg border border-hairline">
                    Các khóa học hiện có vẫn được giữ nguyên, nhưng danh mục sẽ không còn được hiển thị công khai trên trang chủ hoặc bộ lọc cho người dùng.
                  </span>
                </>
              ) : (
                <>
                  Bạn có chắc muốn <strong className="text-ink">kích hoạt lại</strong> danh mục “<span className="font-semibold text-ink">{category.name}</span>” không?
                  <br />
                  <br />
                  <span className="text-[10px] text-mid-gray block leading-relaxed bg-surface-alt p-2.5 rounded-lg border border-hairline">
                    Danh mục sẽ được hiển thị công khai trở lại trên trang chủ và bộ lọc của người dùng để phân loại khóa học.
                  </span>
                </>
              )}
            </div>

            <DialogFooter className="pt-2 border-t border-hairline/60 gap-2 sm:gap-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] bg-ink text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-danger-brick">
                <AlertTriangle className="w-5 h-5 text-danger-brick" />
                Xác nhận xóa danh mục
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <p className="text-xs text-mid-gray leading-normal">
                Bạn có chắc chắn muốn xóa danh mục “<span className="font-bold text-ink">{category.name}</span>”?
              </p>
              <p className="text-[10px] text-mid-gray leading-relaxed bg-surface-alt p-2.5 rounded-lg border border-hairline">
                Hành động này sẽ xóa mềm danh mục. Danh mục sẽ ẩn khỏi hệ thống và người dùng nhưng thông tin khóa học cũ vẫn được bảo toàn. Bạn có thể khôi phục lại danh mục này sau.
              </p>
            </div>

            <DialogFooter className="pt-2 border-t border-hairline/60 gap-2 sm:gap-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] border border-hairline bg-canvas text-ink hover:bg-hairline transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="px-4 py-1.5 h-9 text-xs font-semibold rounded-[6px] bg-danger-brick text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Đang xóa..." : "Xóa danh mục"}
              </button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
