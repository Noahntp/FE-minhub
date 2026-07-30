import React, { useEffect, useState } from "react";
import { X, ShieldAlert, BookOpen, Layers, Calendar, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CategoriesService } from "../categories.service";
import { CategoryDetailResponse } from "../categories.types";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

interface CategoryDetailDrawerProps {
  isOpen: boolean;
  categoryId: number | null;
  onClose: () => void;
}

export default function CategoryDetailDrawer({ isOpen, categoryId, onClose }: CategoryDetailDrawerProps) {
  const [detailData, setDetailData] = useState<CategoryDetailResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (isOpen && categoryId !== null) {
      setIsLoading(true);
      CategoriesService.getCategory(categoryId)
        .then(res => {
          if (active) {
            if (res.success) {
              setDetailData(res.data);
            } else {
              toast.error(res.message || "Không thể lấy thông tin chi tiết.");
              onClose();
            }
            setIsLoading(false);
          }
        })
        .catch(err => {
          if (active) {
            console.error("Lỗi fetch chi tiết danh mục:", err);
            toast.error("Đã xảy ra lỗi kết nối dữ liệu.");
            onClose();
            setIsLoading(false);
          }
        });
    } else {
      setDetailData(null);
    }

    return () => {
      active = false;
    };
  }, [isOpen, categoryId]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 bg-paper border-l border-hairline w-full max-w-md shadow-2xl flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between px-5 border-b border-hairline bg-surface-alt/40">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-mid-gray font-mono bg-canvas px-2 py-0.5 rounded border border-hairline">
                  ID: {categoryId}
                </span>
                <h3 className="text-sm font-bold text-ink">Chi tiết danh mục</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-canvas rounded-full text-mid-gray hover:text-ink transition-colors cursor-pointer flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <div className="w-6 h-6 border-2 border-mid-gray/20 border-t-ink rounded-full animate-spin"></div>
                  <span className="text-xs text-mid-gray">Đang tải thông tin chi tiết...</span>
                </div>
              ) : detailData ? (
                <>
                  {/* General Info */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">
                        Tên danh mục
                      </span>
                      <p className="text-sm font-bold text-ink">{detailData.name}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">
                        Slug danh mục
                      </span>
                      <p className="text-xs font-mono text-ink bg-canvas px-2.5 py-1 rounded border border-hairline inline-block">
                        {detailData.slug}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">
                        Mô tả danh mục
                      </span>
                      <p className={cn(
                        "text-xs p-3 rounded-lg border border-hairline leading-relaxed",
                        detailData.description
                          ? "text-ink bg-surface-alt font-medium"
                          : "text-mid-gray bg-canvas italic"
                      )}>
                        {detailData.description || "Chưa có mô tả ngắn."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">
                          Danh mục cha
                        </span>
                        {detailData.parent ? (
                          <span className="text-xs font-semibold text-ink">
                            {detailData.parent.name}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-[6px] bg-canvas text-mid-gray border border-hairline text-[10px] font-sans font-bold">
                            Danh mục gốc
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">
                          Trạng thái hiển thị
                        </span>
                        {detailData.deleted_at ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-danger-brick bg-danger-brick/10 border border-danger-brick/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-danger-brick"></span>Đã xóa
                          </span>
                        ) : detailData.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-success bg-success-soft border border-success/15">
                            <span className="h-1.5 w-1.5 rounded-full bg-success"></span>Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-mid-gray bg-canvas border border-hairline">
                            <span className="h-1.5 w-1.5 rounded-full bg-mid-gray"></span>Ngừng hoạt động
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">
                          Thứ tự hiển thị
                        </span>
                        <p className="text-xs font-bold text-ink">
                          {detailData.sort_order === 0 ? "Chưa xếp ưu tiên" : detailData.sort_order}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block mb-1">
                          Số khóa học trực thuộc
                        </span>
                        {detailData.course_count && detailData.course_count > 0 ? (
                          <p className="text-xs font-bold text-success flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span className="underline select-all">{detailData.course_count} khóa học</span>
                          </p>
                        ) : (
                          <p className="text-xs text-mid-gray/80">Chưa có khóa học nào</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dates Info */}
                  <div className="pt-4 border-t border-hairline grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-mid-gray/70 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block">Ngày tạo</span>
                        <p className="text-[11px] text-mid-gray mt-0.5">{formatDateTime(detailData.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-mid-gray/70 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-bold text-mid-gray uppercase tracking-wider block">Cập nhật cuối</span>
                        <p className="text-[11px] text-mid-gray mt-0.5">{formatDateTime(detailData.updated_at || detailData.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Subcategories (Children Nodes) */}
                  <div className="pt-4 border-t border-hairline space-y-3">
                    <div className="flex items-center gap-1.5 text-ink">
                      <Layers className="w-4 h-4 text-mid-gray/80" />
                      <h4 className="text-xs font-bold">Danh mục con trực thuộc ({detailData.children?.length || 0})</h4>
                    </div>
                    <div className="space-y-1.5">
                      {detailData.children && detailData.children.length > 0 ? (
                        detailData.children.map(ch => (
                          <div
                            key={ch.id}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-canvas border border-hairline/60"
                          >
                            <div className="truncate mr-3">
                              <span className="font-bold text-xs text-ink">{ch.name}</span>
                              <p className="text-[9px] text-mid-gray font-mono">{ch.slug}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[9px] text-mid-gray font-semibold">Thứ tự: {ch.sort_order}</span>
                              {ch.status === "active" ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-success-soft text-success font-semibold border border-success/10">Active</span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-canvas text-mid-gray border border-hairline">Inactive</span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-mid-gray/80 italic pl-1">Không có danh mục con trực thuộc.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-20 text-center text-xs text-mid-gray italic">
                  Không tìm thấy thông tin danh mục.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-hairline bg-surface-alt/40 flex justify-end shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold rounded-full bg-canvas border border-hairline text-ink hover:bg-hairline transition-colors cursor-pointer"
              >
                Đóng chi tiết
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
