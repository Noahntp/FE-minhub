import React from 'react';
import { MessageCircleQuestion, CheckCircle, Clock } from 'lucide-react';

interface QAOverviewProps {
  totalCount: number;
  unansweredCount: number;
  answeredCount: number;
  onFilterChange: (status: 'all' | 'answered' | 'unanswered') => void;
}

export const QAOverview: React.FC<QAOverviewProps> = ({
  totalCount,
  unansweredCount,
  answeredCount,
  onFilterChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div 
        className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onFilterChange('all')}
      >
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <MessageCircleQuestion className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">Tất cả câu hỏi</p>
          <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
        </div>
      </div>

      <div 
        className="bg-orange-50 border border-orange-200 p-4 rounded-xl shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onFilterChange('unanswered')}
      >
        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-orange-600 font-medium">Chưa trả lời (Cần xử lý)</p>
          <p className="text-2xl font-bold text-orange-700">{unansweredCount}</p>
        </div>
      </div>

      <div 
        className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onFilterChange('answered')}
      >
        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">Đã trả lời</p>
          <p className="text-2xl font-bold text-slate-800">{answeredCount}</p>
        </div>
      </div>
    </div>
  );
};
