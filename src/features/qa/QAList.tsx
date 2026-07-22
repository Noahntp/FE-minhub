import React from 'react';
import { Question } from '@/features/qa/types';
import { MessageSquare, User, BookOpen } from 'lucide-react';

interface QAListProps {
  questions: Question[];
  onViewDetail: (question: Question) => void;
}

export const QAList: React.FC<QAListProps> = ({ questions, onViewDetail }) => {
  if (questions.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">Không tìm thấy câu hỏi nào phù hợp.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <div key={question.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:border-blue-300 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <User className="w-4 h-4" />
              <span className="font-medium text-slate-700">{question.student_name}</span>
              <span className="mx-1">•</span>
              <span>{new Date(question.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
            
            {question.is_answered ? (
              <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full border border-green-200">
                Đã trả lời ({question.reply_count})
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full border border-orange-200">
                Chưa trả lời
              </span>
            )}
          </div>
          
          <div className="mb-4">
            <p className="text-slate-800 line-clamp-2">{question.content}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{question.course_name}</span>
              <span className="mx-1">/</span>
              <span className="truncate max-w-[150px] sm:max-w-xs">{question.lesson_name}</span>
            </div>
            
            <button
              onClick={() => onViewDetail(question)}
              className="text-sm px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
            >
              Xem chi tiết / Trả lời
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
