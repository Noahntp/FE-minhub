import React from 'react';
import { Tag, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { CouponSummary } from '../types';

interface Props {
  stats: CouponSummary;
  isLoading?: boolean;
  activeFilterStatus: string;
  onFilter: (status: string) => void;
}

export const CouponOverview: React.FC<Props> = ({ stats, isLoading, activeFilterStatus, onFilter }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-left">
      {/* Card 1: Đang hoạt động */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onFilter('active');
        }}
        className={`bg-white p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-3xs flex flex-col justify-between h-32 hover:shadow-md hover:-translate-y-0.5 ${
          activeFilterStatus === 'active' ? 'border-brand-normal ring-1 ring-brand-normal' : 'border-slate-100'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đang hoạt động</p>
            <p className="text-3xl font-black text-slate-800 mt-2">
              {isLoading ? '...' : (stats.active_coupons || 0)}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Tag className="w-5 h-5" />
          </div>
        </div>
        <div className="text-[11px] font-bold text-brand-normal hover:text-brand-hover flex items-center gap-1 mt-2">
          Xem chi tiết →
        </div>
      </div>

      {/* Card 2: Đã hết hạn */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onFilter('expired');
        }}
        className={`bg-white p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-3xs flex flex-col justify-between h-32 hover:shadow-md hover:-translate-y-0.5 ${
          activeFilterStatus === 'expired' ? 'border-brand-normal ring-1 ring-brand-normal' : 'border-slate-100'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đã hết hạn</p>
            <p className="text-3xl font-black text-slate-800 mt-2">
              {isLoading ? '...' : (stats.expired_coupons || 0)}
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="text-[11px] font-bold text-brand-normal hover:text-brand-hover flex items-center gap-1 mt-2">
          Xem chi tiết →
        </div>
      </div>

      {/* Card 3: Đã dùng hết */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onFilter('used_up');
        }}
        className={`bg-white p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-3xs flex flex-col justify-between h-32 hover:shadow-md hover:-translate-y-0.5 ${
          activeFilterStatus === 'used_up' ? 'border-brand-normal ring-1 ring-brand-normal' : 'border-slate-100'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đã dùng hết</p>
            <p className="text-3xl font-black text-slate-800 mt-2">
              {isLoading ? '...' : (stats.used_up_coupons || 0)}
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="text-[11px] font-bold text-brand-normal hover:text-brand-hover flex items-center gap-1 mt-2">
          Xem chi tiết →
        </div>
      </div>

      {/* Card 4: Tổng lượt sử dụng */}
      <div
        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between h-32"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng lượt sử dụng</p>
            <p className="text-3xl font-black text-slate-800 mt-2">
              {isLoading ? '...' : (stats.total_usage_count || 0).toLocaleString('vi-VN')}
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
        <div className="text-[11.5px] font-bold text-slate-450 mt-2">
          Tất cả thời gian
        </div>
      </div>
    </div>
  );
};
