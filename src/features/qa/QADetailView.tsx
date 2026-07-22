import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, User, Loader2 } from 'lucide-react';
import { Question, Reply } from '@/features/qa/types';

interface QADetailViewProps {
  question: Question;
  onBack: () => void;
}

// Mock replies for demonstration
const mockReplies: Reply[] = [
  {
    id: '1',
    user_name: 'Giảng viên',
    role: 'instructor',
    content: 'Chào bạn, hook useState hoạt động bất đồng bộ nên bạn cần sử dụng callback trong setState để lấy giá trị mới nhất nhé.',
    created_at: '2026-07-08T10:05:00Z'
  }
];

export const QADetailView: React.FC<QADetailViewProps> = ({ question, onBack }) => {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);

  useEffect(() => {
    if (question.is_answered) {
      setReplies(mockReplies);
    } else {
      setReplies([]);
    }
  }, [question]);

  const handleSubmit = async () => {
    if (!replyText.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newReply: Reply = {
      id: Date.now().toString(),
      user_name: 'Giảng viên',
      role: 'instructor',
      content: replyText,
      created_at: new Date().toISOString()
    };
    
    setReplies([...replies, newReply]);
    setReplyText('');
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-slate-50 min-h-[calc(100vh-100px)] flex flex-col">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 bg-white text-slate-600 rounded-full hover:bg-slate-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-800">Chi tiết câu hỏi</h2>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Scrollable thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50">
          
          {/* Original Question */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative">
            <div className="absolute top-5 right-5">
              {question.is_answered ? (
                <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full border border-green-200">
                  Đã trả lời ({replies.length})
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full border border-orange-200">
                  Chưa trả lời
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{question.student_name}</h3>
                <p className="text-sm text-slate-500">
                  {new Date(question.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 mb-4 border border-slate-100 inline-block">
              <span className="font-semibold text-slate-700">Khóa học:</span> {question.course_name} <br/>
              <span className="font-semibold text-slate-700">Bài học:</span> {question.lesson_name}
            </div>
            <p className="text-slate-800 whitespace-pre-wrap text-base leading-relaxed">
              {question.content}
            </p>
          </div>

          {/* Replies Thread */}
          {replies.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2">
                Danh sách phản hồi ({replies.length})
              </h4>
              <div className="space-y-4">
                {replies.map(reply => (
                  <div 
                    key={reply.id} 
                    className={`p-5 rounded-xl shadow-sm border ${
                      reply.role === 'instructor' 
                        ? 'bg-blue-50 border-blue-200 ml-8 md:ml-12' 
                        : 'bg-white border-slate-200 mr-8 md:mr-12'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reply.role === 'instructor' ? 'bg-blue-200 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${reply.role === 'instructor' ? 'text-blue-800' : 'text-slate-800'}`}>
                            {reply.user_name}
                          </span>
                          {reply.role === 'instructor' && (
                            <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm">
                              GIẢNG VIÊN
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(reply.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reply Form Footer */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-3">
            <textarea
              className="w-full border border-slate-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm transition-shadow shadow-inner"
              rows={4}
              placeholder="Nhập câu trả lời của bạn ở đây..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Hỗ trợ Markdown cơ bản (sắp tới)</span>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !replyText.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Gửi phản hồi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
