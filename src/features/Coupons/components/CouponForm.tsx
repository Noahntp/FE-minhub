import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Percent, Banknote } from 'lucide-react';
import { Coupon } from '../types';

interface Props {
  coupon?: Coupon | null;
  onClose: () => void;
  onSubmit: (data: Partial<Coupon>) => Promise<void>;
}

export const CouponForm: React.FC<Props> = ({ coupon, onClose, onSubmit }) => {
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
    max_order_amount: undefined,
  });

  useEffect(() => {
    if (coupon) {
      setFormData(coupon);
    } else {
      setFormData({
        code: '',
        name: '',
        course_id: '',
        discount_type: 'percent',
        discount_value: 0,
        usage_limit: undefined,
        start_at: '',
        end_at: '',
        max_order_amount: undefined,
      });
    }
  }, [coupon]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'code') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\s+/g, '').toUpperCase() }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden"
    >
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {coupon ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
          </h2>
        </div>
      </div>

      <div className="flex-1 p-6">
        <form id="coupon-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Khóa học & Mã */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Khóa học áp dụng *</label>
              <select required name="course_id" value={formData.course_id || ''} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer">
                <option value="">Chọn khóa học...</option>
                <option value="course_1">React Cơ Bản</option>
                <option value="course_2">NodeJS Nâng Cao</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Mã giảm giá *</label>
              <input required type="text" name="code" value={formData.code || ''} onChange={handleChange} placeholder="VD: SUMMER2024" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono placeholder:font-sans transition-all" />
            </div>

            {/* Tên */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Tên chương trình *</label>
              <input required type="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="VD: Khuyến mãi chào hè" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>

            {/* Loại giảm */}
            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Loại giảm giá</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.discount_type === 'percent' ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="discount_type" value="percent" checked={formData.discount_type === 'percent'} onChange={handleChange} className="hidden" />
                  <div className={`p-2 rounded-lg ${formData.discount_type === 'percent' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Percent className="w-5 h-5" />
                  </div>
                  <span className={`font-medium ${formData.discount_type === 'percent' ? 'text-blue-700' : 'text-gray-600'}`}>Phần trăm (%)</span>
                </label>
                <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.discount_type === 'fixed' ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="discount_type" value="fixed" checked={formData.discount_type === 'fixed'} onChange={handleChange} className="hidden" />
                  <div className={`p-2 rounded-lg ${formData.discount_type === 'fixed' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Banknote className="w-5 h-5" />
                  </div>
                  <span className={`font-medium ${formData.discount_type === 'fixed' ? 'text-blue-700' : 'text-gray-600'}`}>Số tiền cố định</span>
                </label>
              </div>
            </div>

            {/* Mức giảm */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Mức giảm * {formData.discount_type === 'percent' ? '(%)' : '(VND)'}
              </label>
              <div className="relative">
                <input required type="number" min="1" max={formData.discount_type === 'percent' ? 100 : undefined} name="discount_value" value={formData.discount_value || ''} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-10" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  {formData.discount_type === 'percent' ? '%' : '₫'}
                </span>
              </div>
            </div>

            {/* Giảm tối đa (chỉ cho phần trăm) */}
            {formData.discount_type === 'percent' ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Giảm tối đa (VND)</label>
                <input type="number" min="0" name="max_order_amount" value={formData.max_order_amount || ''} onChange={handleChange} placeholder="Không giới hạn" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </motion.div>
            ) : (
              <div className="hidden md:block"></div>
            )}

            {/* Lượt dùng */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Giới hạn lượt dùng</label>
              <input type="number" min="1" name="usage_limit" value={formData.usage_limit || ''} onChange={handleChange} placeholder="Không giới hạn" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Đã dùng</label>
              <input type="number" value={formData.used_count || 0} readOnly className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-medium cursor-not-allowed" />
            </div>

            {/* Thời gian */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Ngày bắt đầu *</label>
              <div className="relative">
                <input required type="date" name="start_at" value={formData.start_at ? formData.start_at.split('T')[0] : ''} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Ngày kết thúc *</label>
              <div className="relative">
                <input required type="date" name="end_at" value={formData.end_at ? formData.end_at.split('T')[0] : ''} onChange={handleChange} min={formData.start_at ? formData.start_at.split('T')[0] : undefined} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>
        </form>
      </div>

      <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors">
          Hủy
        </button>
        <button form="coupon-form" type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang lưu...
            </>
          ) : (
            'Lưu mã'
          )}
        </button>
      </div>
    </motion.div>
  );
};
