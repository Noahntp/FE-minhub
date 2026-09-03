import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { generateSlug } from "@/shared/utils/format";
import { CategoriesService } from "../categories.service";
import { Category } from "../categories.types";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

interface CategoryFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  categoryId: number | null;
  allCategories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

// Kiểm tra đệ quy mối quan hệ cha con (con cháu trực thuộc)
function isDescendant(catId: number, targetParentId: number, allCats: Category[]): boolean {
  const children = allCats.filter(c => c.parent_id === catId && c.deleted_at === null);
  if (children.some(child => child.id === targetParentId)) {
    return true;
  }
  return children.some(child => isDescendant(child.id, targetParentId, allCats));
}

export default function CategoryFormModal({
  isOpen,
  mode,
  categoryId,
  allCategories,
  onClose,
  onSuccess,
}: CategoryFormModalProps) {
  // Controlled inputs state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<string | number>("");
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Nạp dữ liệu form khi mở modal
  useEffect(() => {
    let active = true;
    if (isOpen) {
      // Reset validation & form
      setValidationErrors({});
      setSlugManuallyEdited(false);
      setIsSubmitting(false);
      
      if (mode === "edit" && categoryId !== null) {
        setIsLoading(true);
        CategoriesService.getCategory(categoryId)
          .then(res => {
            if (active) {
              if (res.success) {
                const cat = res.data;
                setName(cat.name);
                setSlug(cat.slug);
                setParentId(cat.parent_id ? String(cat.parent_id) : "");
                setDescription(cat.description || "");
                setSortOrder(cat.sort_order !== undefined && cat.sort_order !== null ? String(cat.sort_order) : "");
                setStatus(cat.status || "active");
              } else {
                toast.error(res.message || "Không thể tải thông tin danh mục.");
                onClose();
              }
              setIsLoading(false);
            }
          })
          .catch(err => {
            if (active) {
              console.error("Lỗi lấy thông tin danh mục chỉnh sửa:", err);
              toast.error("Không thể kết nối đến máy chủ.");
              onClose();
              setIsLoading(false);
            }
          });
      } else {
        // Mode create: Reset về mặc định
        setName("");
        setSlug("");
        setParentId("");
        setDescription("");
        setSortOrder("");
        setStatus("active");
        setIsLoading(false);
      }
    }

    return () => {
      active = false;
    };
  }, [isOpen, mode, categoryId]);

  // Sinh slug tự động
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setSlug(e.target.value);
  };

  const handleGenerateSlugManual = () => {
    setSlug(generateSlug(name));
    setSlugManuallyEdited(false);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors({});

    const payload: any = {
      name: name.trim(),
      slug: slug.trim(),
      parent_id: parentId ? Number(parentId) : null,
      description: description.trim(),
      status: status
    };

    if (sortOrder !== "") {
      payload.sort_order = String(sortOrder);
    }

    try {
      let res;
      if (mode === "create") {
        res = await CategoriesService.createCategory(payload);
      } else {
        res = await CategoriesService.updateCategory(categoryId!, payload);
      }

      if (res.success) {
        toast.success(
          mode === "create"
            ? "Tạo danh mục mới thành công."
            : `Đã lưu thay đổi cho danh mục "${payload.name}".`
        );
        onSuccess();
        onClose();
      } else {
        if (res.error_code === 422 || res.error_code === 409) {
          setValidationErrors(res.errors || {});
          toast.error(res.message || "Vui lòng kiểm tra lại thông tin nhập.");
        } else {
          toast.error(res.message || "Lỗi lưu danh mục.");
        }
      }
    } catch (err) {
      console.error("Lỗi khi lưu danh mục:", err);
      toast.error("Đã xảy ra sự cố kết nối máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lọc dropdown danh mục cha (Chỉ lấy gốc, loại bỏ chính nó & con cháu trong mode sửa)
  const availableParents = allCategories.filter(c => {
    if (c.deleted_at !== null) return false; // Không lấy cha đã xóa
    if (c.parent_id !== null) return false; // Chỉ lấy danh mục gốc làm cha
    
    if (mode === "edit" && categoryId !== null) {
      if (c.id === categoryId) return false; // Loại bỏ chính nó
      if (isDescendant(categoryId, c.id, allCategories)) return false; // Loại bỏ con cháu của nó để tránh vòng lặp
    }
    
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm danh mục mới" : "Chỉnh sửa danh mục"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-5 h-5 border-2 border-mid-gray/20 border-t-ink rounded-full animate-spin"></div>
            <span className="text-xs text-mid-gray">Đang nạp thông tin danh mục...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Tên danh mục */}
            <div className="space-y-1.5">
              <label htmlFor="form-name" className="text-xs font-bold text-ink">
                Tên danh mục *
              </label>
              <input
                id="form-name"
                type="text"
                value={name}
                onChange={handleNameChange}
                disabled={isSubmitting}
                placeholder="Ví dụ: Lập trình di động"
                className={cn(
                  "w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-colors",
                  validationErrors.name && "border-danger-brick focus:ring-danger-brick/40"
                )}
              />
              {validationErrors.name && (
                <p className="text-[10px] text-danger-brick font-semibold">
                  {validationErrors.name[0]}
                </p>
              )}
            </div>

            {/* Slug danh mục */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="form-slug" className="text-xs font-bold text-ink">
                  Slug danh mục *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSlugManual}
                  disabled={isSubmitting}
                  className="text-[10px] text-mid-gray hover:text-ink underline font-semibold cursor-pointer"
                >
                  Tự động sinh slug
                </button>
              </div>
              <input
                id="form-slug"
                type="text"
                value={slug}
                onChange={handleSlugChange}
                disabled={isSubmitting}
                placeholder="Ví dụ: lap-trinh-di-dong"
                className={cn(
                  "w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink font-mono transition-colors",
                  validationErrors.slug && "border-danger-brick focus:ring-danger-brick/40"
                )}
              />
              {validationErrors.slug && (
                <p className="text-[10px] text-danger-brick font-semibold">
                  {validationErrors.slug[0]}
                </p>
              )}
            </div>

            {/* Danh mục cha */}
            <div className="space-y-1.5">
              <label htmlFor="form-parent" className="text-xs font-bold text-ink">
                Danh mục cha
              </label>
              <select
                id="form-parent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-10 px-3 text-xs bg-canvas border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-all"
              >
                <option value="">Không có - Danh mục gốc</option>
                {availableParents.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {validationErrors.parent_id && (
                <p className="text-[10px] text-danger-brick font-semibold">
                  {validationErrors.parent_id[0]}
                </p>
              )}
            </div>

            {/* Mô tả */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="form-description" className="text-xs font-bold text-ink">
                  Mô tả ngắn
                </label>
                <span className="text-[9px] text-mid-gray font-semibold">
                  {description.length}/200 ký tự
                </span>
              </div>
              <textarea
                id="form-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                maxLength={200}
                placeholder="Mô tả ngắn gọn về danh mục khóa học..."
                className="w-full h-20 p-2.5 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink resize-none leading-relaxed transition-colors"
              />
              {validationErrors.description && (
                <p className="text-[10px] text-danger-brick font-semibold">
                  {validationErrors.description[0]}
                </p>
              )}
            </div>

            {/* Thứ tự hiển thị */}
            <div className="space-y-1.5">
              <label htmlFor="form-sort-order" className="text-xs font-bold text-ink">
                Mã thứ tự sắp xếp (Chuỗi ký tự hoặc Số)
              </label>
              <input
                id="form-sort-order"
                type="text"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-10 px-3 text-xs bg-canvas focus:bg-paper border border-hairline rounded-[6px] focus:ring-1 focus:ring-mid-gray/40 outline-none text-ink transition-colors"
              />
              {validationErrors.sort_order && (
                <p className="text-[10px] text-danger-brick font-semibold">
                  {validationErrors.sort_order[0]}
                </p>
              )}
            </div>

            {/* Trạng thái */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink block">
                Trạng thái hoạt động
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer">
                  <input
                    type="radio"
                    name="form-status"
                    value="active"
                    checked={status === "active"}
                    onChange={() => setStatus("active")}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-ink border-hairline focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Đang hoạt động</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer">
                  <input
                    type="radio"
                    name="form-status"
                    value="inactive"
                    checked={status === "inactive"}
                    onChange={() => setStatus("inactive")}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-ink border-hairline focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Ngừng hoạt động</span>
                </label>
              </div>
              {validationErrors.status && (
                <p className="text-[10px] text-danger-brick font-semibold">
                  {validationErrors.status[0]}
                </p>
              )}
            </div>

            <DialogFooter className="pt-2 border-t border-hairline/60 gap-2 sm:gap-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold rounded-full bg-canvas border border-hairline text-ink hover:bg-hairline transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold rounded-full bg-ink text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Đang lưu..." : mode === "create" ? "Tạo danh mục" : "Lưu thay đổi"}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
