import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  courseFilter: string;
  setCourseFilter: (val: string) => void;
}

export const CouponFilter: React.FC<Props> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  courseFilter,
  setCourseFilter,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm kiếm theo mã hoặc tên..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>

      <div className="flex gap-4 w-full md:w-auto">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white w-full md:w-48 cursor-pointer"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã tắt</option>
          <option value="expired">Hết hạn</option>
          <option value="used_up">Hết lượt dùng</option>
        </select>

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white w-full md:w-48 cursor-pointer"
        >
          <option value="all">Tất cả khóa học</option>
          <option value="course_1">React Cơ Bản</option>
          <option value="course_2">NodeJS Nâng Cao</option>
        </select>
      </div>
    </div>
  );
};
