import React from 'react';
import { Search } from 'lucide-react';
import { QAFilterState } from './types';

interface QAFilterProps {
  filter: QAFilterState;
  setFilter: React.Dispatch<React.SetStateAction<QAFilterState>>;
}

export const QAFilter: React.FC<QAFilterProps> = ({ filter, setFilter }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm kiếm nội dung, tên học viên..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filter.keyword}
          onChange={(e) => setFilter(prev => ({ ...prev, keyword: e.target.value }))}
        />
      </div>

      <div className="flex flex-wrap gap-3 w-full md:w-auto">
        <select
          className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={filter.status}
          onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as QAFilterState['status'] }))}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="unanswered">Chưa trả lời</option>
          <option value="answered">Đã trả lời</option>
        </select>

        <select
          className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={filter.course}
          onChange={(e) => setFilter(prev => ({ ...prev, course: e.target.value }))}
        >
          <option value="all">Tất cả khóa học</option>
          <option value="course1">React.js Cơ bản</option>
          <option value="course2">Next.js Thực chiến</option>
        </select>
        
        <select
          className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={filter.lesson}
          onChange={(e) => setFilter(prev => ({ ...prev, lesson: e.target.value }))}
        >
          <option value="all">Tất cả bài học</option>
          <option value="lesson1">Bài 1: Giới thiệu</option>
          <option value="lesson2">Bài 2: Hooks</option>
        </select>

        <select
          className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={filter.sort}
          onChange={(e) => setFilter(prev => ({ ...prev, sort: e.target.value as QAFilterState['sort'] }))}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>
    </div>
  );
};
