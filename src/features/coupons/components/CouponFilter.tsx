import React from 'react';
import { Search, RotateCcw, Plus } from 'lucide-react';
import { CourseOption } from '../types';

interface Props {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  courseFilter: string;
  setCourseFilter: (val: string) => void;
  discountTypeFilter: string;
  setDiscountTypeFilter: (val: string) => void;
  courseOptions: CourseOption[];
  onClearFilters: () => void;
  onCreateClick: () => void;
}

export const CouponFilter: React.FC<Props> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  courseFilter,
  setCourseFilter,
  discountTypeFilter,
  setDiscountTypeFilter,
  courseOptions,
  onClearFilters,
  onCreateClick,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-3xs border border-slate-100 mb-6 text-left">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          {/* Trạng thái */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-white cursor-pointer"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="expired">Đã hết hạn</option>
              <option value="used_up">Đã dùng hết</option>
              <option value="inactive">Tạm tắt</option>
            </select>
          </div>

          {/* Loại giảm giá */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loại giảm giá</label>
            <select
              value={discountTypeFilter}
              onChange={(e) => setDiscountTypeFilter(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-white cursor-pointer"
            >
              <option value="all">Tất cả</option>
              <option value="percent">Phần trăm</option>
              <option value="fixed">Số tiền</option>
            </select>
          </div>

          {/* Khóa học */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khóa học</label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-white cursor-pointer"
            >
              <option value="all">Tất cả khóa học</option>
              {courseOptions.map((course) => (
                <option key={course.id} value={String(course.id)}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Từ khóa */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Từ khóa</label>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm theo mã, mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal bg-white"
              />
              <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClearFilters();
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-650 hover:bg-slate-100 text-xs font-bold rounded-xl transition-all cursor-pointer h-10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Xóa bộ lọc
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCreateClick();
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#0B1536] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer h-10"
          >
            <Plus className="w-4 h-4" />
            Tạo mã giảm giá
          </button>
        </div>
      </div>
    </div>
  );
};
