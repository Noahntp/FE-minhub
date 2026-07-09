import React, { useState, useEffect, useRef } from 'react';
import { ApiService } from '../services/api';
import { 
  MessageCircle, Search, Filter, Calendar, Clock, 
  Send, User as UserIcon, BookOpen, ChevronLeft, ChevronRight, CheckCircle 
} from 'lucide-react';

interface InstructorQAProps {
  instructorId: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export const InstructorQA: React.FC<InstructorQAProps> = ({ instructorId }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('unanswered');
  const [timeRange, setTimeRange] = useState('all');
  const [search, setSearch] = useState('');
  const searchTimeoutRef = useRef<any>(null);

  // Reply State
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getInstructorQuestions(instructorId, {
        page: meta.page,
        limit: meta.limit,
        filter: filterStatus,
        timeRange,
        search
      });
      setQuestions(res.data || []);
      setMeta(res.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line
  }, [instructorId, filterStatus, timeRange, meta.page, meta.limit]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      // Reset page to 1 on new search
      if (meta.page !== 1) {
        setMeta(prev => ({ ...prev, page: 1 }));
      } else {
        fetchQuestions();
      }
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
    // eslint-disable-next-line
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setMeta({ ...meta, page: newPage });
    }
  };

  const handleReply = async (questionId: string) => {
    if (!replyContent.trim()) return;
    
    setIsReplying(true);
    try {
      const res = await ApiService.replyToQuestion(instructorId, questionId, { content: replyContent });
      if (res.success) {
        // Update local state to reflect the new answer
        setQuestions(prev => prev.map(q => {
          if (q.id === questionId) {
            return {
              ...q,
              status: 'answered',
              answers: [...(q.answers || []), res.data]
            };
          }
          return q;
        }));
        
        setActiveReplyId(null);
        setReplyContent('');
        
        // If we are viewing only unanswered, remove it from the list after a short delay
        if (filterStatus === 'unanswered') {
          setTimeout(() => {
            fetchQuestions(); // Refresh list to get accurate pagination
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error replying:', error);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs text-left">
      <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-indigo-600" /> Quản Lý Q&A (Hỏi Đáp)
      </h3>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 justify-between items-center z-20 relative">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex bg-stone-100 rounded-lg p-1">
            <button 
              onClick={() => { setFilterStatus('all'); setMeta(prev => ({ ...prev, page: 1 })); }}
              className={`px-3 py-1.5 rounded-md font-bold text-[11px] uppercase transition-all ${filterStatus === 'all' ? 'bg-white shadow-sm text-indigo-700' : 'text-stone-500 hover:text-stone-800'}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => { setFilterStatus('unanswered'); setMeta(prev => ({ ...prev, page: 1 })); }}
              className={`px-3 py-1.5 rounded-md font-bold text-[11px] uppercase transition-all ${filterStatus === 'unanswered' ? 'bg-white shadow-sm text-indigo-700' : 'text-stone-500 hover:text-stone-800'}`}
            >
              Chưa trả lời
            </button>
            <button 
              onClick={() => { setFilterStatus('answered'); setMeta(prev => ({ ...prev, page: 1 })); }}
              className={`px-3 py-1.5 rounded-md font-bold text-[11px] uppercase transition-all ${filterStatus === 'answered' ? 'bg-white shadow-sm text-indigo-700' : 'text-stone-500 hover:text-stone-800'}`}
            >
              Đã trả lời
            </button>
          </div>

          {/* Time Filter */}
          <select 
            value={timeRange} 
            onChange={(e) => { setTimeRange(e.target.value); setMeta(prev => ({ ...prev, page: 1 })); }}
            className="border rounded-lg px-3 py-2 text-[11px] font-bold text-stone-700 outline-none focus:ring-2 focus:ring-indigo-500 bg-stone-50 cursor-pointer"
          >
            <option value="all">Mọi thời điểm</option>
            <option value="today">Hôm nay</option>
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Tìm theo nội dung, tên..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* QUESTION LIST */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading && questions.length === 0 ? (
          <div className="p-10 text-center text-stone-500">Đang tải câu hỏi...</div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-stone-300" />
            </div>
            <h4 className="font-bold text-stone-800 text-sm mb-1">Không có câu hỏi nào</h4>
            <p className="text-stone-500">Bạn đã trả lời hết câu hỏi hoặc không tìm thấy kết quả phù hợp.</p>
          </div>
        ) : (
          <div className="divide-y">
            {questions.map((q) => (
              <div key={q.id} className="p-5 hover:bg-stone-50/50 transition-colors">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="shrink-0">
                    {q.author?.avatar ? (
                      <img src={q.author.avatar} alt={q.author.name} className="w-10 h-10 rounded-full object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500">
                        <UserIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-stone-800 text-sm">{q.author?.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-500 font-medium">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(q.createdAt)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 max-w-[200px] truncate" title={q.course?.title}>
                            <BookOpen className="w-3 h-3 text-indigo-500" /> {q.course?.title}
                          </span>
                        </div>
                      </div>
                      
                      {/* Status badge */}
                      {q.status === 'open' ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase whitespace-nowrap">Chưa trả lời</span>
                      ) : (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase whitespace-nowrap flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Đã trả lời</span>
                      )}
                    </div>
                    
                    <p className="mt-3 text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">{q.content}</p>
                    
                    {/* Replies */}
                    {q.answers && q.answers.length > 0 && (
                      <div className="mt-4 space-y-3 bg-stone-50 border p-4 rounded-lg">
                        {q.answers.map((ans: any) => (
                          <div key={ans.id} className="flex gap-3">
                            <div className="shrink-0 mt-0.5">
                              {ans.author?.avatar ? (
                                <img src={ans.author.avatar} alt={ans.author.name} className="w-6 h-6 rounded-full object-cover border" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                  <UserIcon className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className={`font-bold text-[11px] ${ans.isInstructorAnswer || ans.authorId === instructorId ? 'text-indigo-700' : 'text-stone-700'}`}>
                                  {ans.isInstructorAnswer || ans.authorId === instructorId ? 'Bạn (Giảng viên)' : ans.author?.name}
                                </span>
                                <span className="text-[9px] text-stone-400 font-medium">{formatDate(ans.createdAt)}</span>
                              </div>
                              <p className="text-stone-600 mt-1 whitespace-pre-wrap leading-relaxed text-[11px]">{ans.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Reply Action / Editor */}
                    <div className="mt-4 flex justify-end">
                      {activeReplyId === q.id ? (
                        <div className="w-full bg-white border border-indigo-200 rounded-lg shadow-inner overflow-hidden animate-fade-in relative z-10">
                          <textarea 
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Nhập câu trả lời của bạn..."
                            className="w-full p-3 min-h-[100px] outline-none text-sm resize-y text-stone-700"
                            autoFocus
                          />
                          <div className="bg-stone-50 px-3 py-2 border-t flex justify-end gap-2">
                            <button 
                              onClick={() => { setActiveReplyId(null); setReplyContent(''); }}
                              className="px-4 py-1.5 rounded-md font-bold text-stone-500 hover:bg-stone-200 transition-colors"
                            >
                              Hủy
                            </button>
                            <button 
                              onClick={() => handleReply(q.id)}
                              disabled={!replyContent.trim() || isReplying}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              {isReplying ? 'Đang gửi...' : <><Send className="w-3.5 h-3.5" /> Gửi trả lời</>}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setActiveReplyId(q.id);
                            setReplyContent('');
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 transition-colors text-[11px] uppercase bg-indigo-50 px-3 py-1.5 rounded-md"
                        >
                          <Send className="w-3.5 h-3.5" /> Thêm câu trả lời
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {meta.totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center bg-stone-50">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Tổng cộng {meta.total} câu hỏi (Trang {meta.page}/{meta.totalPages})
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page <= 1}
                className="p-1.5 border rounded bg-white text-stone-600 disabled:opacity-50 hover:bg-stone-100 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="p-1.5 border rounded bg-white text-stone-600 disabled:opacity-50 hover:bg-stone-100 transition-colors shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
