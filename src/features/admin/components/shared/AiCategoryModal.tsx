import React, { useState, useEffect } from 'react';
import { Sparkles, X, Check, Loader2, Bot, ArrowRight, PlusCircle, CheckCircle2, Tag } from 'lucide-react';
import { adminApi } from '@/features/admin/api';

interface AiCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  onCategoryAssigned: (newCategoryName: string, categoryId: number) => void;
}

export const AiCategoryModal: React.FC<AiCategoryModalProps> = ({
  isOpen,
  onClose,
  course,
  onCategoryAssigned,
}) => {
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<any | null>(null);

  // Editable fields for creating new category
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  useEffect(() => {
    if (!isOpen || !course) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setSuggestion(null);

    adminApi.aiSuggestCategory(course.id)
      .then((res: any) => {
        if (!isMounted) return;
        const data = res?.data || res;
        setSuggestion(data);
        if (data?.suggested_new_category) {
          setNewCatName(data.suggested_new_category.name || '');
          setNewCatSlug(data.suggested_new_category.slug || '');
          setNewCatDesc(data.suggested_new_category.description || '');
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setError(err?.message || 'Không thể kết nối đến hệ thống AI.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, course]);

  if (!isOpen || !course) return null;

  const handleApplyExisting = async () => {
    if (!suggestion?.matched_category_id) return;
    setApplying(true);
    try {
      const res = await adminApi.aiApplyCategory(course.id, {
        type: 'existing',
        category_id: suggestion.matched_category_id,
      });
      const data = res?.data || res;
      onCategoryAssigned(suggestion.matched_category_name || data.category_name, suggestion.matched_category_id);
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Có lỗi khi gán danh mục.');
    } finally {
      setApplying(false);
    }
  };

  const handleApplyCreateNew = async () => {
    if (!newCatName.trim()) {
      alert('Vui lòng nhập tên danh mục.');
      return;
    }
    setApplying(true);
    try {
      const res = await adminApi.aiApplyCategory(course.id, {
        type: 'create_new',
        name: newCatName.trim(),
        slug: newCatSlug.trim(),
        description: newCatDesc.trim(),
      });
      const data = res?.data || res;
      onCategoryAssigned(data.category_name || newCatName, data.category_id);
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Có lỗi khi tạo danh mục mới.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 text-left relative overflow-hidden">
        {/* Header decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-indigo-500/20 via-sky-400/20 to-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top bar */}
        <div className="flex items-start justify-between relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-stone-900">AI Gợi Ý & Phân Loại Danh Mục</h3>
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  DeepSeek AI
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">Tự động phân tích nội dung khóa học và gợi ý danh mục chuẩn xác</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Course Info Card */}
        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
          <span className="text-[9.5px] font-bold text-stone-400 uppercase tracking-wider">Khóa học đang kiểm duyệt</span>
          <p className="text-xs font-black text-stone-850 line-clamp-1">{course.title}</p>
          {course.short_description && (
            <p className="text-[10.5px] text-stone-500 line-clamp-2 leading-relaxed">{course.short_description}</p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-10 flex flex-col items-center justify-center gap-3 text-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" />
              <Bot className="w-5 h-5 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-xs font-bold text-stone-750">DeepSeek AI đang đọc dữ liệu & phân tích khóa học...</p>
            <p className="text-[10.5px] text-stone-400 max-w-sm">Quá trình so khớp danh mục và từ khóa ngữ nghĩa thường mất 1-2 giây.</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Suggestion Results */}
        {!loading && suggestion && (
          <div className="space-y-4">
            {/* Reason and confidence bar */}
            <div className="p-3.5 bg-gradient-to-r from-indigo-50/70 to-sky-50/70 rounded-2xl border border-indigo-100/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-indigo-900">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Đánh giá phân tích của AI
                </span>
                <span className="text-[10.5px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  Độ phù hợp: {suggestion.confidence_score || 95}%
                </span>
              </div>
              <p className="text-[11px] text-indigo-950/80 leading-relaxed font-medium">
                {suggestion.reason || 'Dựa trên cấu trúc bài giảng và từ khóa công nghệ trong tiêu đề khóa học.'}
              </p>
            </div>

            {/* Option 1: Map to Existing Category */}
            {suggestion.matched_category_id && (
              <div className="p-3.5 bg-white rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 transition-all space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wide">
                    Phương án 1: Khớp danh mục có sẵn
                  </span>
                  <span className="text-[10px] font-bold text-stone-400">ID #{suggestion.matched_category_id}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h4 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      {suggestion.matched_category_name}
                    </h4>
                    <p className="text-[10px] text-stone-400 font-medium mt-0.5">Khóa học sẽ được gán vào cây danh mục hiện có</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyExisting}
                    disabled={applying}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {applying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Gán danh mục này
                  </button>
                </div>
              </div>
            )}

            {/* Option 2: Create New Category */}
            {suggestion.suggested_new_category && (
              <div className="p-3.5 bg-white rounded-2xl border border-indigo-100 hover:border-indigo-300 transition-all space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wide">
                    Phương án 2: Tạo danh mục mới chuyên biệt
                  </span>
                  <span className="text-[10px] text-indigo-500 font-bold">AI đề xuất</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[9.5px] font-bold text-stone-500 mb-0.5">Tên danh mục mới</label>
                    <input 
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full text-xs font-semibold text-stone-800 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50/50 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] font-bold text-stone-500 mb-0.5">Slug (Đường dẫn)</label>
                    <input 
                      type="text"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      className="w-full text-xs font-mono text-stone-700 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50/50 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[9.5px] text-stone-400 font-medium">Tự động thêm vào danh mục hệ thống và gán cho khóa học</p>
                  <button
                    type="button"
                    onClick={handleApplyCreateNew}
                    disabled={applying || !newCatName.trim()}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {applying ? <Loader2 className="w-3 h-3 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                    Tạo mới & Gán
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-stone-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
export default AiCategoryModal;
