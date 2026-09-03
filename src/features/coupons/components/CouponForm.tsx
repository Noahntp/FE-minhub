import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronDown, Sparkles, Tag, Gift, Info } from 'lucide-react';
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
    campaign_type: 'discount',
    discount_type: 'percent',
    discount_value: 10,
    max_discount_amount: undefined,
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
      const discountValue = coupon.discount_value != null ? Number(coupon.discount_value) : 10;
      const campaignType = coupon.campaign_type || (coupon.discount_type ? 'discount' : 'discount');

      setFormData({
        id: coupon.id,
        code: coupon.code || '',
        name: coupon.name || '',
        course_id: courseId,
        campaign_type: campaignType,
        discount_type: discountType as any,
        discount_value: isNaN(discountValue) ? 0 : discountValue,
        max_discount_amount: coupon.max_discount_amount != null ? Number(coupon.max_discount_amount) : undefined,
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
        campaign_type: 'discount',
        discount_type: 'percent',
        discount_value: 10,
        max_discount_amount: undefined,
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
    } else if (name === 'discount_value' || name === 'usage_limit' || name === 'max_discount_amount') {
      const sanitized = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: sanitized !== '' ? Math.max(0, parseInt(sanitized, 10)) : undefined }));
    } else if (name === 'campaign_type') {
      const newType = value as 'discount' | 'trial';
      setFormData(prev => ({
        ...prev,
        campaign_type: newType,
        discount_type: newType === 'discount' ? (prev.discount_type || 'percent') : undefined,
        discount_value: newType === 'discount' ? (prev.discount_value || 10) : undefined,
        usage_limit: newType === 'trial' ? (prev.usage_limit && prev.usage_limit <= 15 ? prev.usage_limit : 5) : prev.usage_limit,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validate = (): boolean => {
    if (!formData.code && !coupon) {
      setValidationError('Mã chương trình không được để trống.');
      return false;
    }

    if (!formData.course_id) {
      setValidationError('Vui lòng chọn khóa học áp dụng.');
      return false;
    }

    if (formData.campaign_type === 'discount') {
      if (formData.discount_value === undefined || formData.discount_value <= 0) {
        setValidationError('Giá trị giảm giá phải lớn hơn 0.');
        return false;
      }
      if ((formData.discount_type === 'percent' || formData.discount_type === 'percentage') && formData.discount_value > 70) {
        setValidationError('Phần trăm giảm giá linh hoạt từ 1% đến tối đa 70% theo quy định sàn.');
        return false;
      }
    } else if (formData.campaign_type === 'trial') {
      if (!formData.usage_limit || formData.usage_limit < 1 || formData.usage_limit > 15) {
        setValidationError('Số suất học thử miễn phí cho phép tùy chọn từ 1 đến tối đa 15 suất.');
        return false;
      }
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

    if (formData.campaign_type === 'trial') {
      const diffHours = (end - start) / (1000 * 60 * 60);
      if (diffHours > 72.5) { // 3 days max
        setValidationError('Thời gian chạy chiến dịch học thử linh hoạt tối đa 3 ngày (72 giờ).');
        return false;
      }
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
      const isTrial = formData.campaign_type === 'trial';
      const payload: any = {
        name: formData.name || (isTrial ? `Học thử miễn phí ${formData.code}` : `Khuyến mãi ${formData.code}`),
        course_id: Number(formData.course_id),
        campaign_type: isTrial ? 'trial' : 'discount',
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        start_at: toApiDateTime(formData.start_at),
        end_at: toApiDateTime(formData.end_at),
        status: formData.status || 'active',
        description: formData.description || '',
      };

      if (!isTrial) {
        payload.discount_type = formData.discount_type === 'percentage' ? 'percent' : formData.discount_type;
        payload.discount_value = Number(formData.discount_value);
        if (formData.max_discount_amount) {
          payload.max_discount_amount = Number(formData.max_discount_amount);
        }
      }

      if (!isUsed && formData.code) {
        payload.code = formData.code.toUpperCase().trim();
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
      setValidationError(err.message || 'Lỗi lưu thông tin chương trình.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTrialCampaign = formData.campaign_type === 'trial';

  return (
    <div className="bg-white rounded-2xl shadow-3xs border border-slate-100 flex flex-col h-[750px] overflow-hidden text-left">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            {isTrialCampaign ? <Gift className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {coupon ? 'Chỉnh sửa chương trình' : 'Tạo chương trình ưu đãi'}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Tùy chọn linh hoạt trong hạn mức cho phép</p>
          </div>
        </div>
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
          
          {/* Loại hình chiến dịch */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hình thức ưu đãi *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleChange({ target: { name: 'campaign_type', value: 'discount' } } as any)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                  !isTrialCampaign 
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800 font-bold' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Tag className="w-4 h-4 shrink-0 text-emerald-600" />
                <div>
                  <div className="text-xs font-extrabold">Mã giảm giá</div>
                  <div className="text-[9px] text-slate-400 font-normal">Giảm % hoặc trừ tiền cố định</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleChange({ target: { name: 'campaign_type', value: 'trial' } } as any)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                  isTrialCampaign 
                    ? 'border-blue-500 bg-blue-50/60 text-blue-800 font-bold' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Gift className="w-4 h-4 shrink-0 text-blue-600" />
                <div>
                  <div className="text-xs font-extrabold">Suất học thử miễn phí</div>
                  <div className="text-[9px] text-slate-400 font-normal">Tặng lượt học có thời hạn</div>
                </div>
              </button>
            </div>
          </div>

          {/* Mã code */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mã chương trình *</label>
            <input 
              required 
              type="text" 
              name="code" 
              value={formData.code || ''} 
              onChange={handleChange} 
              disabled={isUsed}
              placeholder={isTrialCampaign ? "VD: TRIALFREE" : "VD: WELCOME20"} 
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

          {/* Tên chương trình */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tên chương trình *</label>
            <input 
              required 
              type="text" 
              name="name" 
              value={formData.name || ''} 
              onChange={handleChange} 
              placeholder={isTrialCampaign ? "Ví dụ: Học thử 3 ngày cho tân sinh viên" : "Ví dụ: Ưu đãi chào mừng thành viên mới"} 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-bold" 
            />
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
                <option value="">-- Chọn khóa học của bạn --</option>
                {courseOptions.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Cấu hình giảm giá (Chỉ hiển thị khi là Discount) */}
          {!isTrialCampaign && (
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Loại giảm giá */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Loại giảm giá *</label>
                  <div className="relative">
                    <select 
                      required 
                      name="discount_type" 
                      value={formData.discount_type || 'percent'} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-white font-semibold cursor-pointer appearance-none text-xs"
                    >
                      <option value="percent">Phần trăm (%)</option>
                      <option value="fixed">Số tiền cố định (đ)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Giá trị giảm */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mức giảm *</label>
                  <input 
                    required 
                    type="number"
                    min="1"
                    max={formData.discount_type === 'percent' ? 70 : undefined}
                    name="discount_value" 
                    value={formData.discount_value ?? ''} 
                    onChange={handleChange} 
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder={formData.discount_type === 'percent' ? "1 - 70%" : "Số tiền"} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-bold bg-white text-xs" 
                  />
                </div>
              </div>

              <div className="flex items-start gap-1.5 text-[10px] text-slate-500 font-medium">
                <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {formData.discount_type === 'percent' 
                    ? 'Bạn có thể tùy chọn mức giảm linh hoạt từ 1% đến tối đa 70% giá khóa học.' 
                    : 'Tùy chọn số tiền giảm cố định (sau giảm giá phải tối thiểu 10.000đ).'}
                </span>
              </div>
            </div>
          )}

          {/* Cấu hình Học thử (Chỉ hiển thị khi là Trial) */}
          {isTrialCampaign && (
            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                  Số suất học thử miễn phí * (Tùy chọn 1 - 15 suất)
                </label>
                <input 
                  required
                  type="number"
                  min="1"
                  max="15"
                  name="usage_limit" 
                  value={formData.usage_limit ?? ''} 
                  onChange={handleChange} 
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Nhập số suất (VD: 5, 10, 15)" 
                  className="w-full px-3 py-2 border border-blue-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold bg-white text-xs" 
                />
              </div>
              <div className="flex items-start gap-1.5 text-[10px] text-blue-700 font-medium">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-600" />
                <span>Giảng viên tùy ý chọn số suất học thử miễn phí từ 1 đến tối đa 15 học viên theo quy định sàn.</span>
              </div>
            </div>
          )}

          {/* Giới hạn sử dụng (Chỉ hiển thị khi là Discount) */}
          {!isTrialCampaign && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Giới hạn số lượt dùng (Tùy chọn)
              </label>
              <input 
                type="number"
                min="1"
                name="usage_limit" 
                value={formData.usage_limit ?? ''} 
                onChange={handleChange} 
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="Để trống nếu không giới hạn số lượt" 
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-semibold" 
              />
              <p className="text-[9px] text-slate-400 font-medium">Tùy chọn số lượng học viên tối đa được áp dụng mã.</p>
            </div>
          )}

          {/* Thời gian bắt đầu & kết thúc */}
          <div className="grid grid-cols-2 gap-3">
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
                  className="w-full pl-8 pr-2 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-semibold text-[11px]" 
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
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
                  className="w-full pl-8 pr-2 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal font-semibold text-[11px]" 
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          <p className="text-[9px] text-slate-400 font-medium">
            {isTrialCampaign 
              ? 'Tùy chọn thời gian chiến dịch học thử linh hoạt từ vài giờ đến tối đa 3 ngày (72 giờ).' 
              : 'Tùy chọn lịch bắt đầu và kết thúc chương trình giảm giá theo nhu cầu của bạn.'}
          </p>

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
              placeholder="Nhập ghi chú hoặc điều kiện của chương trình..." 
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
          {isSubmitting ? 'Đang lưu...' : (coupon ? 'Lưu thay đổi' : 'Tạo chương trình mới')}
        </button>
      </div>
    </div>
  );
};
