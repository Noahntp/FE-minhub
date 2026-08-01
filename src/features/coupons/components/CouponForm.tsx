import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronDown } from 'lucide-react';
import { Coupon, CourseOption } from '../types';

interface Props {
  coupon?: Coupon | null;
  courseOptions: CourseOption[];
  onClose: () => void;
  onSubmit: (data: Partial<Coupon>) => Promise<void>;
}

const toDateTimeLocalValue = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const clean = dateStr.replace(' ', 'T').trim();
  if (clean.length >= 16) {
    return clean.substring(0, 16);
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toApiDateTime = (localStr?: string | null): string | null => {
  if (!localStr) return null;
  const clean = localStr.replace('T', ' ').trim();
  if (clean.length === 16) {
    return `${clean}:00`;
  }
  return clean;
};

export const CouponForm: React.FC<Props> = ({ coupon, courseOptions, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    name: '',
    course_id: '',
    discount_type: 'percent',
    discount_value: 0,
    usage_limit: undefined,
    start_at: '',
    end_at: '',
    status: 'active',
    description: '',
  });

  const [validationError, setValidationError] = useState<string>('');
  const isUsed = Boolean(coupon && coupon.used_count && coupon.used_count > 0);

  useEffect(() => {
    const defaultCourseId = courseOptions.length > 0 ? String(courseOptions[0].id) : '';
    if (coupon) {
      const courseId = coupon.course_id ? String(coupon.course_id) : (coupon.course?.id ? String(coupon.course.id) : defaultCourseId);
      const discountType = (coupon.discount_type === 'percentage' ? 'percent' : coupon.discount_type) || 'percent';
      const discountValue = Number(coupon.discount_value);

      setFormData({
        id: coupon.id,
        code: coupon.code || '',
        name: coupon.name || '',
        course_id: courseId,
        discount_type: discountType as any,
        discount_value: isNaN(discountValue) ? 0 : discountValue,
        usage_limit: coupon.usage_limit != null ? Number(coupon.usage_limit) : undefined,
        start_at: toDateTimeLocalValue(coupon.start_at),
        end_at: toDateTimeLocalValue(coupon.end_at),
        status: coupon.status || 'active',
        description: coupon.description || '',
      });
    } else {
      setFormData({
        code: '',
        name: '',
        course_id: defaultCourseId,
        discount_type: 'percent',
        discount_value: 0,
        usage_limit: undefined,
        start_at: '',
        end_at: '',
        status: 'active',
        description: '',
      });
    }
    setValidationError('');
  }, [coupon?.id, coupon, courseOptions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'code') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\s+/g, '').toUpperCase() }));
    } else if (name === 'discount_value' || name === 'usage_limit') {
      setFormData(prev => ({ ...prev, [name]: value !== '' ? Number(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validate = (): boolean => {
    if (!formData.code) {
      setValidationError('Mã giảm giá không được để trống.');
      return false;
    }
    if (formData.discount_value === undefined || formData.discount_value <= 0) {
      setValidationError('Giá trị giảm giá phải lớn hơn 0.');
      return false;
    }
    if ((formData.discount_type === 'percent' || formData.discount_type === 'percentage') && formData.discount_value > 100) {
      setValidationError('Phần trăm giảm giá không được vượt quá 100%.');
      return false;
    }
    if (!formData.start_at || !formData.end_at) {
      setValidationError('Vui lòng chọn ngày bắt đầu và kết thúc.');
      return false;
    }
    
    const start = new Date(formData.start_at).getTime();
    const end = new Date(formData.end_at).getTime();
    if (end <= start) {
      setValidationError('Ngày kết thúc phải sau ngày bắt đầu.');
      return false;
    }

    if (!formData.course_id) {
      setValidationError('Vui lòng chọn khóa học áp dụng.');
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formData.name || `Khuyến mãi ${formData.code}`,
        course_id: Number(formData.course_id),
        discount_type: formData.discount_type === 'percentage' ? 'percent' : formData.discount_type,
        discount_value: Number(formData.discount_value),
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        start_at: toApiDateTime(formData.start_at),
        end_at: toApiDateTime(formData.end_at),
        status: formData.status || 'active',
        description: formData.description || '',
      };

      if (!isUsed) {
        payload.code = formData.code?.toUpperCase().trim();
      }

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      const fieldErrors = err?.errors || err?.data?.errors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        const firstErr = Object.values(fieldErrors).flat()[0];
        if (firstErr) {
          setValidationError(String(firstErr));
          return;
        }
      }
      setValidationError(err.message || 'Lỗi lưu thông tin mã giảm giá.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-3xs border border-slate-100 flex flex-col h-[750px] overflow-hidden text-left">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/50">
        <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          {coupon ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá'}
        </h2>
        <button 
          type="button" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }} 
          className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-[11px] font-bold">
            {validationError}
          </div>
        )}

        <form id="coupon-drawer-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Mã giảm giá */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mã giảm giá *</label>
            <input 
              required 
              type="text" 
              name="code" 
              value={formData.code || ''} 
              onChange={handleChange} 
              disabled={isUsed}
              placeholder="Nhập mã (VD: WELCOME20)" 
              className={`w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal uppercase font-mono font-bold ${
                isUsed ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'bg-white'
              }`}
            />
            {isUsed ? (
              <p className="text-[9px] text-amber-600 font-semibold mt-1">
                Mã đã được sử dụng ({coupon.used_count} lượt), không thể thay đổi mã code.
              </p>
            ) : (
              <p className="text-[9px] text-slate-400 font-semibold mt-1">Mã sẽ được viết hoa tự động, không dấu cách.</p>
            )}
          </div>

          {/* Tên mã giảm giá */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tên chương trình *</label>
            <input 
              required 
              type="text" 
              name="name" 
              value={formData.name || ''} 
              onChange={handleChange} 
              placeholder="Nhập tên chương trình khuyến mãi" 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-bold" 
            />
          </div>

          {/* Loại giảm giá */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Loại giảm giá *</label>
            <div className="relative">
              <select 
                required 
                name="discount_type" 
                value={formData.discount_type || 'percent'} 
                onChange={handleChange} 
                className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-white font-semibold cursor-pointer appearance-none"
              >
                <option value="percent">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (đ)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Giá trị */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Giá trị *</label>
            <input 
              required 
              type="number" 
              name="discount_value" 
              value={formData.discount_value ?? ''} 
              onChange={handleChange} 
              placeholder="Nhập giá trị" 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-bold" 
            />
            <p className="text-[9px] text-slate-400 font-semibold">
              Ví dụ: {formData.discount_type === 'percent' || formData.discount_type === 'percentage' ? '20 cho 20%' : '100000 cho 100.000đ'}
            </p>
          </div>

          {/* Giới hạn sử dụng */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Giới hạn sử dụng</label>
            <input 
              type="number" 
              name="usage_limit" 
              value={formData.usage_limit ?? ''} 
              onChange={handleChange} 
              placeholder="Để trống nếu không giới hạn" 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-semibold" 
            />
          </div>

          {/* Ngày bắt đầu */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngày bắt đầu *</label>
            <div className="relative">
              <input 
                required 
                type="datetime-local" 
                name="start_at" 
                value={formData.start_at || ''} 
                onChange={handleChange} 
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-semibold" 
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Ngày kết thúc */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngày kết thúc *</label>
            <div className="relative">
              <input 
                required 
                type="datetime-local" 
                name="end_at" 
                value={formData.end_at || ''} 
                onChange={handleChange} 
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-semibold" 
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Khóa học áp dụng */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Khóa học áp dụng *</label>
            <div className="relative">
              <select 
                required 
                name="course_id" 
                value={formData.course_id || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-white font-semibold cursor-pointer appearance-none"
              >
                <option value="">Chọn khóa học</option>
                {courseOptions.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Trạng thái */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái *</label>
            <div className="relative">
              <select 
                required 
                name="status" 
                value={formData.status || 'active'} 
                onChange={handleChange} 
                className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-white font-semibold cursor-pointer appearance-none"
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm tắt</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Mô tả */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mô tả tùy chọn</label>
            <textarea 
              name="description" 
              value={formData.description || ''} 
              onChange={handleChange} 
              placeholder="Nhập mô tả cho mã giảm giá" 
              rows={2} 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-medium" 
            />
          </div>
        </form>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-4 border-t border-slate-50 flex justify-end gap-2 shrink-0 bg-slate-50/50">
        <button 
          type="button" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }} 
          className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all text-xs cursor-pointer"
        >
          Hủy
        </button>
        <button 
          type="submit" 
          form="coupon-drawer-form" 
          disabled={isSubmitting}
          className="px-4 py-2 bg-brand-normal hover:bg-brand-hover text-white rounded-xl font-bold transition-all text-xs shadow-sm cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? 'Đang lưu...' : (coupon ? 'Lưu thay đổi' : 'Tạo mã mới')}
        </button>
      </div>
    </div>
  );
};

