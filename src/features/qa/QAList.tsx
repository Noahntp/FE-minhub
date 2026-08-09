import React from 'react';
import { Question } from './types';
import { MessageSquare, MoreVertical, ChevronDown } from 'lucide-react';

interface QAListProps {
  questions: Question[];
  selectedQuestionId: string;
  onSelectQuestion: (id: string) => void;
  sort: 'newest' | 'oldest';
  onSortChange: (sort: 'newest' | 'oldest') => void;
  page?: number;
  lastPage?: number;
  onPageChange?: (page: number) => void;
}

export const QAList: React.FC<QAListProps> = ({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  sort,
  onSortChange,
  page = 1,
  lastPage = 1,
  onPageChange,
}) => {
  const getBadgeStyle = (status: Question['status']) => {
    switch (status) {
      case 'unanswered':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'answered':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      case 'hidden':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  const getBadgeLabel = (status: Question['status']) => {
    switch (status) {
      case 'unanswered':
        return 'Chưa trả lời';
      case 'answered':
        return 'Đã trả lời';
      case 'hidden':
        return 'Đã ẩn';
      default:
        return status;
    }
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins > 0 ? diffMins : 1} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-3xs border border-slate-200/80 overflow-hidden flex flex-col h-full">
      {/* List Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/60 shrink-0">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Danh sách câu hỏi</h4>
          <span className="px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-[10px] font-extrabold">
            {questions.length}
          </span>
        </div>
        
        <div className="relative flex items-center gap-1.5 text-xs text-slate-500 font-bold">
          <span>Sắp xếp:</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest')}
            className="appearance-none pr-5 py-1 font-bold text-slate-700 bg-transparent outline-none cursor-pointer hover:text-brand-normal"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 pointer-events-none" />
        </div>
      </div>

      {/* List Items */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 custom-scrollbar">
        {questions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="text-xs font-semibold">Không tìm thấy câu hỏi nào phù hợp.</p>
          </div>
        ) : (
          questions.map((question) => {
            const isSelected = question.id === selectedQuestionId;
            const replyCount = (question.replies && question.replies.length > 0)
              ? question.replies.length
              : (question.reply_count ?? (question as any).replies_count ?? (question as any).comments_count ?? 0);

            return (
              <div
                key={question.id}
                onClick={() => onSelectQuestion(question.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-50/50 border-emerald-500/80 border-l-4 border-l-emerald-600 shadow-sm ring-1 ring-emerald-500/20'
                    : 'bg-white border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/70 border-l-4 border-l-transparent'
                }`}
              >
                {/* Header Row: Student Info & Status */}
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img 
                      src={question.student_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'} 
                      alt={question.student_name}
                      className="w-6 h-6 rounded-full border border-slate-100 object-cover shrink-0"
                    />
                    <div className="min-w-0 truncate">
                      <span className="text-xs font-black text-slate-800 truncate block">{question.student_name}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${getBadgeStyle(question.status)}`}>
                    {getBadgeLabel(question.status)}
                  </span>
                </div>

                {/* Lesson Name */}
                <h5 className="text-xs font-extrabold text-brand-normal hover:underline leading-snug truncate">
                  {question.lesson_name}
                </h5>

                {/* Question Content Snippet */}
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 font-medium">
                  {question.content}
                </p>

                {/* Footer Row */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100/70 text-[10px] font-bold text-slate-400">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-slate-300" />
                    <span>{replyCount} câu trả lời</span>
                  </div>
                  <span>{formatTime(question.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {lastPage > 1 && onPageChange && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Trang trước
          </button>
          <span className="text-xs font-bold text-slate-600">
            Trang {page} / {lastPage}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= lastPage}
            className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};
