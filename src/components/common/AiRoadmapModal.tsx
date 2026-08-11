import React, { useState, useRef, useEffect } from 'react';
import { X, Bot, Sparkles, Send, ArrowRight, Loader2, Code2, Compass, CheckCircle2, BookOpen, Zap, RefreshCw, ChevronRight } from 'lucide-react';
import { useApp } from '@/app/AppContext';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '@/shared/lib/api-client';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  recommendedIds?: string[];
}

const QUICK_PROMPTS = [
  'Tư vấn lộ trình học Fullstack Web Developer năm 2026',
  'Sửa giúp mình lỗi "useEffect missing dependency" trong React',
  'Lập trình viên Backend nên chọn Laravel hay Node.js?',
  'Khóa học Python AI & Machine Learning nào phù hợp cho newbie?'
];

const SAMPLE_ROADMAPS = [
  {
    id: 'frontend',
    title: 'Lộ trình Frontend Developer 2026',
    desc: 'HTML/CSS/JS -> React 18 -> Next.js 15 -> TailwindCSS -> Performance & SEO',
    duration: '4 - 6 tháng',
    level: 'Cơ bản -> Chuyên sâu',
    color: 'from-cyan-500 to-blue-600',
    tags: ['React 18', 'Next.js 15', 'TypeScript', 'Tailwind']
  },
  {
    id: 'backend',
    title: 'Lộ trình Backend Laravel Engineer',
    desc: 'PHP Core -> Laravel 11 -> RESTful API -> MySQL & Redis -> Docker & VPS',
    duration: '5 - 7 tháng',
    level: 'Cơ bản -> Chuyên sâu',
    color: 'from-emerald-500 to-teal-600',
    tags: ['PHP 8.3', 'Laravel 11', 'MySQL', 'Docker']
  },
  {
    id: 'ai-data',
    title: 'Lộ trình AI & Machine Learning',
    desc: 'Python -> Numpy & Pandas -> PyTorch -> LLM & RAG Prompt Engineering',
    duration: '6 - 8 tháng',
    level: 'Trung cấp -> Nâng cao',
    color: 'from-purple-500 to-indigo-600',
    tags: ['Python', 'PyTorch', 'Prompt AI', 'Deep Learning']
  }
];

export function AiRoadmapModal() {
  const { aiModalOpen, closeAiModal } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'chat' | 'roadmaps'>('chat');
  const [queryInput, setQueryInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Xin chào! Tôi là **MindHub AI Tutor 2.0**. Bạn muốn giải đáp thắc mắc về code, tìm câu trả lời sửa lỗi bug hay thiết kế lộ trình học tập riêng hôm nay?',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  if (!aiModalOpen) return null;

  const handleSendPrompt = async (promptText?: string) => {
    const textToSend = (promptText || queryInput).trim();
    if (!textToSend || isAiLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setQueryInput('');
    setIsAiLoading(true);

    try {
      const res = await apiFetch<any>('/courses/ai-search', {
        method: 'POST',
        body: JSON.stringify({ query: textToSend })
      });

      const aiText = res?.data?.text || res?.text || 'Rất tiếc, AI tạm thời chưa đưa ra được phản hồi. Hãy thử tìm kiếm trực tiếp trên thư viện khóa học.';
      const recIds = res?.data?.recommended_ids || res?.recommended_ids || [];

      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: aiText,
        recommendedIds: recIds,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const fallbackAiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: `Cảm ơn bạn đã hỏi về "${textToSend}". Để đạt hiệu quả học tập tốt nhất, bạn có thể tham khảo **Lộ trình Web Fullstack 2026** hoặc xem danh sách các khóa học hàng đầu trên MindHub.`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <Bot className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  MindHub AI 2.0 • Trợ lý AI & Lộ trình
                </h2>
                <span className="text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300" /> Online 24/7
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Tư vấn khóa học, thiết kế lộ trình sự nghiệp và giải đáp lỗi code tức thì.
              </p>
            </div>
          </div>

          <button
            onClick={closeAiModal}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tab Switcher */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950 border-b border-slate-800/80 text-xs font-bold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20 font-black'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Trợ lý AI Tutor Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmaps')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'roadmaps'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20 font-black'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Khám phá Lộ trình Học tập</span>
          </button>
        </div>

        {/* Tab 1: AI Chat Assistant */}
        {activeTab === 'chat' && (
          <div className="flex flex-col flex-1 overflow-hidden bg-slate-950">
            
            {/* Quick Prompts Bar */}
            <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Thử hỏi:
                </span>
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(prompt)}
                    className="px-3 py-1 rounded-full bg-slate-800/90 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700 text-slate-300 text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[400px] text-left">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0 shadow-md">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-2xl max-w-[85%] leading-relaxed space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-tr-none shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    <div className="text-[10px] opacity-60 text-right pt-1 border-t border-white/10">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex items-center gap-3 text-xs text-cyan-400 bg-cyan-950/40 p-3.5 rounded-2xl border border-cyan-500/20 w-fit">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>MindHub AI đang suy nghĩ và phân tích dữ liệu...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Prompt Input Form */}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt();
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  placeholder="Nhập câu hỏi, thắc mắc về code hoặc nhu cầu học tập của bạn..."
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  disabled={isAiLoading}
                  className="w-full pl-4 pr-24 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!queryInput.trim() || isAiLoading}
                  className="absolute right-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi AI</span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* Tab 2: Visual Career Roadmaps */}
        {activeTab === 'roadmaps' && (
          <div className="p-6 bg-slate-950 space-y-5 overflow-y-auto max-h-[480px] text-left">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-white text-base">Lộ Trình Học Thực Chiến 2026</h3>
                <p className="text-xs text-slate-400">Được thiết kế chuẩn khung năng lực tuyển dụng doanh nghiệp IT.</p>
              </div>
              <button
                onClick={() => { closeAiModal(); navigate('/roadmaps'); }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <span>Xem tất cả lộ trình</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SAMPLE_ROADMAPS.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 group transition-all"
                >
                  <div className="space-y-3">
                    <div className={`h-2.5 w-14 rounded-full bg-gradient-to-r ${item.color}`} />
                    <h4 className="font-extrabold text-white text-sm group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                      <span>Thời lượng: <strong className="text-white">{item.duration}</strong></span>
                      <span className="text-emerald-400 font-bold">{item.level}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-200 border border-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        closeAiModal();
                        navigate(`/roadmaps/${item.id}`);
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
                    >
                      <span>Khám phá chi tiết</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
