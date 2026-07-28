import React from 'react';
import { X, ArrowRight, ShieldAlert } from 'lucide-react';

export interface SubmitErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  status?: number | null;
  errors?: Record<string, string[] | string> | null;
  missingItems?: string[];
  onNavigateToStep?: (step: number) => void;
}

export default function SubmitErrorModal({
  isOpen,
  onClose,
  title = 'Không thể gửi duyệt khóa học',
  message,
  status,
  errors,
  missingItems = [],
  onNavigateToStep,
}: SubmitErrorModalProps) {
  if (!isOpen) return null;

  // Determine step navigation from field error name or missing item name
  const getStepForField = (fieldOrItem: string): { step: number; label: string } => {
    const f = fieldOrItem.toLowerCase();
    if (
      f.includes('title') || 
      f.includes('slug') || 
      f.includes('category') || 
      f.includes('level') || 
      f.includes('language') || 
      f.includes('description') || 
      f.includes('tiêu đề') || 
      f.includes('mô tả') || 
      f.includes('danh mục') || 
      f.includes('cấp độ')
    ) {
      return { step: 1, label: 'Bước 1: Thông tin cơ bản' };
    }
    if (f.includes('price') || f.includes('giá')) {
      return { step: 2, label: 'Bước 2: Giá bán' };
    }
    if (
      f.includes('thumbnail') || 
      f.includes('image') || 
      f.includes('intro') || 
      f.includes('ảnh') || 
      f.includes('video giới thiệu')
    ) {
      return { step: 3, label: 'Bước 3: Hình ảnh & Video' };
    }
    return { step: 4, label: 'Bước 4: Nội dung bài học' };
  };

  // Extract individual error messages list
  const formattedErrors: { field: string; message: string; step: number; stepLabel: string }[] = [];

  if (errors && typeof errors === 'object') {
    Object.entries(errors).forEach(([field, val]) => {
      const msgList = Array.isArray(val) ? val : [String(val)];
      msgList.forEach((m) => {
        const { step, label } = getStepForField(field);
        formattedErrors.push({
          field,
          message: m,
          step,
          stepLabel: label,
        });
      });
    });
  }

  if (missingItems && missingItems.length > 0 && formattedErrors.length === 0) {
    missingItems.forEach((item) => {
      const { step, label } = getStepForField(item);
      formattedErrors.push({
        field: item,
        message: `Chưa hoàn thiện: ${item}`,
        step,
        stepLabel: label,
      });
    });
  }

  // Find primary target step to navigate to
  const primaryStep = formattedErrors.length > 0 ? formattedErrors[0].step : 1;
  const primaryStepLabel = formattedErrors.length > 0 ? formattedErrors[0].stepLabel : 'Chỉnh sửa thông tin';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 text-xs font-sans text-stone-800 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-rose-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900">{title}</h3>
              {status && (
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-rose-100 text-rose-700 font-extrabold text-[9px] rounded-md">
                  Lỗi HTTP {status}
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Error Message */}
        {message && (
          <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3.5 text-rose-800 text-[11px] font-semibold leading-relaxed">
            {message}
          </div>
        )}

        {/* Error Details List */}
        {formattedErrors.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10.5px] font-bold text-stone-700">Chi tiết thông tin cần sửa đổi:</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {formattedErrors.map((err, idx) => (
                <div 
                  key={idx}
                  className="flex items-start justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl hover:bg-slate-100/70 transition-all"
                >
                  <div className="flex items-start gap-2 flex-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <div>
                      <p className="text-[11px] font-bold text-stone-800">{err.message}</p>
                      <span className="text-[9.5px] font-semibold text-stone-500">{err.stepLabel}</span>
                    </div>
                  </div>
                  {onNavigateToStep && (
                    <button
                      onClick={() => {
                        onNavigateToStep(err.step);
                        onClose();
                      }}
                      className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[9.5px] font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all shadow-3xs"
                    >
                      Sửa ngay <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-3">
          {onNavigateToStep && formattedErrors.length > 0 ? (
            <button
              onClick={() => {
                onNavigateToStep(primaryStep);
                onClose();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              Chuyển đến {primaryStepLabel} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : <div />}
          
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 font-bold text-stone-600 rounded-xl text-[11px] cursor-pointer transition-all"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
