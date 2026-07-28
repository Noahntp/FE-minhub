import React from 'react';
import { HelpCircle, CheckCircle, MessageSquare, Bookmark } from 'lucide-react';

interface QAOverviewProps {
  unansweredCount: number;
  answeredCount: number;
  todayCommentsCount: number;
  bookmarkedCount: number;
  activeFilterStatus: string;
  onFilterChange: (status: 'all' | 'unanswered' | 'answered' | 'hidden' | 'bookmarked') => void;
}

export const QAOverview: React.FC<QAOverviewProps> = ({
  unansweredCount,
  answeredCount,
  todayCommentsCount,
  bookmarkedCount,
  activeFilterStatus,
  onFilterChange,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Câu hỏi chưa trả lời */}
      <div 
        onClick={() => onFilterChange('unanswered')}
        className={`bg-white p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-3xs flex flex-col justify-between h-32 hover:shadow-md hover:-translate-y-0.5 ${
          activeFilterStatus === 'unanswered' ? 'border-brand-normal ring-1 ring-brand-normal' : 'border-slate-100'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Câu hỏi chưa trả lời</p>
            <p className="text-3xl font-black text-slate-800 mt-2">{unansweredCount}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="text-[11px] font-bold text-brand-normal hover:text-brand-hover flex items-center gap-1 mt-2">
          Xem chi tiết →
        </div>
      </div>

      {/* Card 2: Đã trả lời */}
      <div 
        onClick={() => onFilterChange('answered')}
        className={`bg-white p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-3xs flex flex-col justify-between h-32 hover:shadow-md hover:-translate-y-0.5 ${
          activeFilterStatus === 'answered' ? 'border-brand-normal ring-1 ring-brand-normal' : 'border-slate-100'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đã trả lời</p>
            <p className="text-3xl font-black text-slate-800 mt-2">{answeredCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="text-[11px] font-bold text-brand-normal hover:text-brand-hover flex items-center gap-1 mt-2">
          Xem chi tiết →
        </div>
      </div>

      {/* Card 3: Bình luận hôm nay */}
      <div 
        onClick={() => onFilterChange('all')}
        className={`bg-white p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-3xs flex flex-col justify-between h-32 hover:shadow-md hover:-translate-y-0.5 ${
          activeFilterStatus === 'all' ? 'border-brand-normal ring-1 ring-brand-normal' : 'border-slate-100'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bình luận hôm nay</p>
            <p className="text-3xl font-black text-slate-800 mt-2">{todayCommentsCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
        <div className="text-[11px] font-bold text-brand-normal hover:text-brand-hover flex items-center gap-1 mt-2">
          Xem chi tiết →
        </div>
      </div>

      {/* Card 4: Đã đánh dấu */}
      <div 
        onClick={() => onFilterChange('bookmarked')}
        className={`bg-white p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-3xs flex flex-col justify-between h-32 hover:shadow-md hover:-translate-y-0.5 ${
          activeFilterStatus === 'bookmarked' ? 'border-brand-normal ring-1 ring-brand-normal' : 'border-slate-100'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đã đánh dấu</p>
            <p className="text-3xl font-black text-slate-800 mt-2">{bookmarkedCount}</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Bookmark className="w-5 h-5" />
          </div>
        </div>
        <div className="text-[11px] font-bold text-brand-normal hover:text-brand-hover flex items-center gap-1 mt-2">
          Xem chi tiết →
        </div>
      </div>
    </div>
  );
};
