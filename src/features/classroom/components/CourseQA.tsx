import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { CourseQuestion, User as UserType } from '@/shared/types';

interface CourseQAProps {
  courseId: string;
  currentUser: UserType | null;
  isEnrolled: boolean;
  onLoginRequest?: () => void;
}

export default function CourseQA({ courseId, currentUser, isEnrolled, onLoginRequest }: CourseQAProps) {
  const [activeTab, setActiveTab] = useState<'public' | 'internal'>(isEnrolled ? 'internal' : 'public');
  const [questions, setQuestions] = useState<CourseQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newQuestion, setNewQuestion] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [expandedAnswers, setExpandedAnswers] = useState<{ [key: string]: boolean }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [courseId, activeTab]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
      setQuestions(data);
    } catch (error) {
      console.error('Failed to fetch questions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!currentUser) {
      if (onLoginRequest) onLoginRequest();
      return;
    }
    if (!newQuestion.trim()) return;

    setSubmitting(true);
    try {
      const q = (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
      setQuestions([q, ...questions]);
      setNewQuestion('');
    } catch (error) {
      console.error('Failed to post question', error);
      alert('Có lỗi xảy ra khi đăng câu hỏi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (questionId: string) => {
    if (!currentUser) {
      if (onLoginRequest) onLoginRequest();
      return;
    }
    const text = replyText[questionId];
    if (!text || !text.trim()) return;

    setSubmitting(true);
    try {
      const answer = (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
      
      setQuestions(questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            answers: [...(q.answers || []), answer]
          };
        }
        return q;
      }));
      setReplyText({ ...replyText, [questionId]: '' });
      setExpandedAnswers({ ...expandedAnswers, [questionId]: true });
    } catch (error) {
      console.error('Failed to post reply', error);
      alert('Có lỗi xảy ra khi đăng câu trả lời.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAnswers = (questionId: string) => {
    setExpandedAnswers({
      ...expandedAnswers,
      [questionId]: !expandedAnswers[questionId]
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sm:p-6 mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-stone-100 pb-4">
        <h3 className="text-lg sm:text-xl font-bold text-stone-800 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#8b5e3c]" />
          Hỏi Đáp & Thảo Luận
        </h3>
        
        <div className="flex bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'public' 
                ? 'bg-white text-[#8b5e3c] shadow-sm' 
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Hỏi đáp trước mua
          </button>
          <button
            onClick={() => {
              if (!isEnrolled && currentUser?.role !== 'instructor' && currentUser?.role !== 'admin') {
                alert('Chỉ học viên đã đăng ký khóa học này mới có thể truy cập khu vực thảo luận nội bộ.');
                return;
              }
              setActiveTab('internal');
            }}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'internal' 
                ? 'bg-[#8b5e3c] text-white shadow-sm' 
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {!isEnrolled && currentUser?.role !== 'instructor' && currentUser?.role !== 'admin' && (
              <Lock className="w-3.5 h-3.5" />
            )}
            Thảo luận học tập
          </button>
        </div>
      </div>

      {/* Input section */}
      <div className="flex gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-stone-200 shrink-0 overflow-hidden border border-stone-300">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 m-2 text-stone-400" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder={
              !currentUser 
                ? "Vui lòng đăng nhập để đặt câu hỏi..." 
                : activeTab === 'public' 
                  ? "Bạn có thắc mắc gì về khóa học này trước khi mua?" 
                  : "Bạn gặp khó khăn gì trong quá trình học thuật?"
            }
            disabled={!currentUser || submitting}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#8b5e3c] focus:bg-white transition-colors resize-none min-h-[80px]"
          />
          <div className="flex justify-end">
            <button
              onClick={handleAskQuestion}
              disabled={!currentUser || submitting || !newQuestion.trim()}
              className="bg-[#432c28] hover:bg-black text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Gửi câu hỏi
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8 text-stone-500 text-sm">Đang tải danh sách câu hỏi...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-stone-200">
            <MessageCircle className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-stone-500 text-sm font-medium">Chưa có câu hỏi nào trong mục này.</p>
            <p className="text-stone-400 text-xs mt-1">Hãy là người đầu tiên đặt câu hỏi!</p>
          </div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="border border-stone-100 rounded-xl p-4 sm:p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-200 shrink-0 overflow-hidden border border-stone-300">
                  {q.author?.avatar ? (
                    <img src={q.author.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 m-2 text-stone-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="font-bold text-stone-800 text-sm">{q.author?.name || 'Người dùng ẩn danh'}</span>
                      {q.author?.role === 'instructor' && (
                        <span className="ml-2 bg-[#8b5e3c]/10 text-[#8b5e3c] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Giảng viên</span>
                      )}
                    </div>
                    <span className="text-xs text-stone-400 whitespace-nowrap ml-2">{formatDate(q.createdAt)}</span>
                  </div>
                  <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{q.content}</p>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3">
                    <button 
                      onClick={() => toggleAnswers(q.id)}
                      className="text-xs font-semibold text-[#8b5e3c] hover:text-[#6a462b] flex items-center gap-1 transition-colors"
                    >
                      {expandedAnswers[q.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {q.answers && q.answers.length > 0 ? `${q.answers.length} Câu trả lời` : 'Trả lời'}
                    </button>
                  </div>
                  
                  {/* Answers Section */}
                  {expandedAnswers[q.id] && (
                    <div className="mt-4 pl-4 border-l-2 border-stone-100 space-y-4">
                      {q.answers && q.answers.map(ans => (
                        <div key={ans.id} className="flex gap-2 sm:gap-3 bg-stone-50/50 p-3 rounded-xl border border-stone-100">
                          <div className="w-8 h-8 rounded-full bg-stone-200 shrink-0 overflow-hidden border border-stone-300">
                            {ans.author?.avatar ? (
                              <img src={ans.author.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 m-1.5 text-stone-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-0.5">
                              <div>
                                <span className="font-bold text-stone-800 text-xs sm:text-sm">{ans.author?.name || 'Ẩn danh'}</span>
                                {ans.isInstructorAnswer && (
                                  <span className="ml-2 bg-[#8b5e3c] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shadow-sm">Giảng viên</span>
                                )}
                                {ans.isAdminAnswer && (
                                  <span className="ml-2 bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shadow-sm">Admin</span>
                                )}
                              </div>
                              <span className="text-[10px] sm:text-xs text-stone-400">{formatDate(ans.createdAt)}</span>
                            </div>
                            <p className="text-[13px] sm:text-sm text-stone-700 whitespace-pre-wrap">{ans.content}</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Reply Input */}
                      <div className="flex gap-2 sm:gap-3 mt-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-stone-200 shrink-0 overflow-hidden hidden sm:block">
                          {currentUser?.avatar ? (
                            <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 m-1.5 text-stone-400" />
                          )}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={replyText[q.id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [q.id]: e.target.value })}
                            placeholder={currentUser ? "Viết câu trả lời..." : "Đăng nhập để trả lời..."}
                            disabled={!currentUser || submitting}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleReply(q.id);
                            }}
                            className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#8b5e3c] focus:bg-white transition-colors"
                          />
                          <button
                            onClick={() => handleReply(q.id)}
                            disabled={!currentUser || submitting || !replyText[q.id]?.trim()}
                            className="bg-stone-200 hover:bg-[#8b5e3c] hover:text-white text-stone-600 px-3 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
