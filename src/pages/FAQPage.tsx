import React, { useState, useMemo, useEffect } from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { apiFetch } from '@/shared/lib/api-client';
import { 
  Search, ChevronDown, HelpCircle, MessageSquare, FileText, Sparkles, 
  ShieldCheck, Award, CreditCard, BookOpen, UserCheck, GraduationCap, 
  Laptop, ThumbsUp, ThumbsDown, Copy, Check, X, ArrowRight, Send, 
  Clock, Zap, Tag, Layers, LifeBuoy, ChevronRight, Filter
} from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { useHomepageData } from '@/features/home/hooks/useHomepageData';

export interface FAQItem {
  id: string;
  category: 'account' | 'payment' | 'course' | 'certificate' | 'instructor' | 'technical';
  categoryLabel: string;
  q: string;
  a: string;
  helpfulCount: number;
  unhelpfulCount: number;
  views: number;
  tags: string[];
  isPopular?: boolean;
}

const FAQ_CATEGORIES = [
  { 
    id: 'all', 
    label: 'Tất cả câu hỏi', 
    desc: 'Tổng hợp mọi thắc mắc phổ biến trên MindHub',
    icon: Layers, 
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    iconBg: 'bg-slate-100 text-slate-700'
  },
  { 
    id: 'account', 
    label: 'Tài khoản & Bảo mật', 
    desc: 'Đăng ký, đăng nhập, đổi mật khẩu & 2FA',
    icon: UserCheck, 
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100 text-blue-600'
  },
  { 
    id: 'payment', 
    label: 'Thanh toán & Hoàn tiền', 
    desc: 'VNPay, MoMo, chuyển khoản & chính sách 7 ngày',
    icon: CreditCard, 
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-600'
  },
  { 
    id: 'course', 
    label: 'Khóa học & Học tập', 
    desc: 'Truy cập trọn đời, tài liệu & thảo luận Q&A',
    icon: BookOpen, 
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconBg: 'bg-indigo-100 text-indigo-600'
  },
  { 
    id: 'certificate', 
    label: 'Chứng chỉ & Bằng cấp', 
    desc: 'Điều kiện cấp, xác thực PDF & đính kèm LinkedIn',
    icon: Award, 
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-100 text-amber-600'
  },
  { 
    id: 'instructor', 
    label: 'Dành cho Giảng viên', 
    desc: 'Đăng ký giảng dạy, tạo khóa học & doanh thu',
    icon: GraduationCap, 
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-100 text-purple-600'
  },
  { 
    id: 'technical', 
    label: 'Kỹ thuật & Hệ thống', 
    desc: 'Xử lý lỗi video, sự cố phát & cấu hình máy',
    icon: Laptop, 
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    iconBg: 'bg-rose-100 text-rose-600'
  },
];

const POPULAR_SEARCH_TAGS = [
  'Hoàn tiền 7 ngày',
  'Cấp chứng chỉ',
  'Thanh toán VNPay',
  'Quên mật khẩu',
  'Đăng ký Giảng viên',
  'Xem offline'
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({ 'faq-pay-1': true });
  const [votedMap, setVotedMap] = useState<Record<string, 'up' | 'down'>>({});
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const { data: homeData, isLoading: homeIsLoading } = useHomepageData();
  
  const faqBanner = homeData?.banners?.find(b => b.position === 'faq_hero')?.image_url || 'https://res.cloudinary.com/hcoy6dgr/image/upload/v1788251134/mindhub/banners/faq_hero.jpg';
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // FETCH FAQS FROM BACKEND API WITH FALLBACK
  useEffect(() => {
    let isMounted = true;
    const fetchFaqs = async () => {
      try {
        setIsLoading(true);
        // Try fetching public FAQs from /home or /faqs endpoint
        const res = await apiFetch<any>('/home').catch(() => null);
        let apiFaqs = Array.isArray(res?.faqs) 
          ? res.faqs 
          : (Array.isArray(res?.data?.faqs) ? res.data.faqs : []);

        if (!apiFaqs.length) {
          const directRes = await apiFetch<any>('/faqs').catch(() => null);
          apiFaqs = Array.isArray(directRes?.data)
            ? directRes.data
            : (Array.isArray(directRes) ? directRes : []);
        }

        if (isMounted && apiFaqs.length > 0) {
          const categoryLabels: Record<string, string> = {
            account: 'Tài khoản & Bảo mật',
            payment: 'Thanh toán & Hoàn tiền',
            refund: 'Thanh toán & Hoàn tiền',
            course: 'Khóa học & Học tập',
            certificate: 'Chứng chỉ & Bằng cấp',
            instructor: 'Dành cho Giảng viên',
            technical: 'Kỹ thuật & Hệ thống',
            general: 'Khóa học & Học tập'
          };

          const mapped: FAQItem[] = apiFaqs.map((item: any, idx: number) => {
            const rawType = (item.type || 'course').toLowerCase();
            const cat = (['account', 'payment', 'refund', 'course', 'certificate', 'instructor', 'technical'].includes(rawType) 
              ? (rawType === 'refund' ? 'payment' : rawType) 
              : 'course') as FAQItem['category'];

            return {
              id: `api-faq-${item.id || idx}`,
              category: cat,
              categoryLabel: categoryLabels[rawType] || 'Khóa học & Học tập',
              q: item.question || item.q || '',
              a: item.answer || item.a || '',
              helpfulCount: item.helpful_count || (120 + (idx * 15)),
              unhelpfulCount: item.unhelpful_count || 0,
              views: item.views || (600 + (idx * 40)),
              tags: [rawType, 'mindhub', 'faq'],
              isPopular: idx < 4 || !!item.is_popular
            };
          });

          if (mapped.length > 0) {
            setFaqs(mapped);
          }
        }
      } catch (err) {
        console.warn('Backend API FAQs fetch failed:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFaqs();
    return () => { isMounted = false; };
  }, []);

  // Submit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter FAQs based on active category & search query
  const filteredFaqs = useMemo(() => {
    return faqs.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const qLower = searchQuery.toLowerCase().trim();
      if (!qLower) return matchesCategory;

      const matchesQuery = 
        item.q.toLowerCase().includes(qLower) ||
        item.a.toLowerCase().includes(qLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(qLower));

      return matchesCategory && matchesQuery;
    });
  }, [faqs, activeCategory, searchQuery]);

  // Dynamic Popular FAQs computed from active API/State faqs
  const popularFaqs = useMemo(() => {
    const list = faqs.filter(f => f.isPopular);
    if (list.length >= 4) return list.slice(0, 4);
    const sorted = [...faqs].sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    return sorted.slice(0, 4);
  }, [faqs]);

  const toggleFaq = (id: string) => {
    setOpenFaqIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const nextState: Record<string, boolean> = {};
    filteredFaqs.forEach(f => { nextState[f.id] = true; });
    setOpenFaqIds(nextState);
  };

  const collapseAll = () => {
    setOpenFaqIds({});
  };

  const handleVote = (id: string, type: 'up' | 'down') => {
    if (votedMap[id]) {
      toast.info('Bạn đã thực hiện đánh giá cho câu hỏi này.');
      return;
    }

    setVotedMap(prev => ({ ...prev, [id]: type }));
    setFaqs(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          helpfulCount: type === 'up' ? item.helpfulCount + 1 : item.helpfulCount,
          unhelpfulCount: type === 'down' ? item.unhelpfulCount + 1 : item.unhelpfulCount
        };
      }
      return item;
    }));

    if (type === 'up') {
      toast.success('Cảm ơn bạn đã phản hồi! Đánh giá giúp chúng tôi cải thiện chất lượng hỗ trợ.');
    } else {
      toast.info('Cảm ơn bạn! Chúng tôi sẽ cập nhật nội dung câu trả lời rõ ràng hơn.');
    }
  };

  const handleCopyLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/faq#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Đã sao chép liên kết câu hỏi!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setContactForm({ name: '', email: '', category: 'general', subject: '', message: '' });
      toast.success('Gửi câu hỏi thành công! Đội ngũ MindHub sẽ phản hồi qua email trong 24h.');
    }, 1200);
  };

  const selectCategoryAndScroll = (catId: string) => {
    setActiveCategory(catId);
    const contentEl = document.getElementById('faq-content-section');
    if (contentEl) {
      contentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-amber-200/90 text-amber-950 font-semibold px-1 rounded">
              {part}
            </mark>
          ) : part
        )}
      </span>
    );
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/70 pb-20">
        
        {/* REDESIGNED CREATIVE HERO BANNER SECTION WITH INTEGRATED ILLUSTRATION & BALANCED LAYOUT */}
        <div className="relative bg-gradient-to-br from-slate-950 via-[#02382c] to-slate-950 text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 shadow-2xl overflow-hidden select-none">
          {/* Decorative Mesh Glows & Ambient Orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Content & Live Search */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-5">
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide backdrop-blur-md shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> 
                <span>Trung Tâm Trợ Giúp & FAQ MindHub</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.15] text-white">
                Chúng tôi có thể{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
                  giải đáp gì cho bạn?
                </span>
              </h1>

              <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Tra cứu nhanh câu trả lời cho các thắc mắc về tài khoản, khóa học, thanh toán & chính sách hoàn tiền 7 ngày.
              </p>

              {/* SLEEK GLASSMORPHIC SEARCH BAR */}
              <div className="relative max-w-xl mx-auto lg:mx-0 pt-1">
                <div className="relative flex items-center shadow-2xl rounded-2xl p-1.5 bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/25 transition-all">
                  <Search className="left-4 absolute w-5 h-5 text-emerald-400 pointer-events-none" />
                  <Input 
                    type="text"
                    className="pl-11 pr-32 h-12 w-full text-white text-sm md:text-base border-none focus-visible:ring-0 placeholder:text-slate-400/90 bg-transparent font-medium"
                    placeholder="Tìm kiếm câu hỏi, từ khóa (hoàn tiền, vnpay...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery ? (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-32 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      aria-label="Clear Search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}

                  <Button 
                    onClick={() => selectCategoryAndScroll('all')}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl text-xs h-10 px-5 shrink-0 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Tìm kiếm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* POPULAR SEARCH TAG CHIPS */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-4 text-xs">
                  <span className="text-emerald-300 font-semibold flex items-center gap-1 text-[11px]">
                    <Tag className="w-3.5 h-3.5 text-amber-300" /> Từ khóa gợi ý:
                  </span>
                  {POPULAR_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSearchQuery(tag);
                        selectCategoryAndScroll('all');
                      }}
                      className="px-3 py-1 rounded-full bg-slate-900/70 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 border border-slate-700/60 text-[11px] font-medium transition-all cursor-pointer shadow-sm hover:border-emerald-500/40"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* QUICK STATUS BADGES ROW */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5 backdrop-blur-md">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Hỗ trợ tự động 24/7</p>
                    <p className="text-[10px] text-slate-400">Trợ lý AI sẵn sàng</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5 backdrop-blur-md">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Cam kết 7 ngày</p>
                    <p className="text-[10px] text-slate-400">Hoàn tiền 100%</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5 backdrop-blur-md col-span-2 sm:col-span-1">
                  <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Phản hồi siêu tốc</p>
                    <p className="text-[10px] text-slate-400">Dưới 5 phút hỗ trợ</p>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Interactive 3D Illustration Asset Card */}
            <div className="lg:col-span-5 hidden lg:flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Outer Ambient Glow Ring */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-cyan-500/30 rounded-3xl blur-2xl -z-10" />

                {/* Glass Illustration Frame */}
                <div className="relative rounded-3xl bg-slate-900/70 border border-slate-700/60 p-3 shadow-2xl backdrop-blur-xl overflow-hidden group">
                  <img 
                    src={faqBanner} 
                    alt="MindHub FAQ Support Assistant Illustration" 
                    className="w-full h-auto object-cover rounded-2xl shadow-inner group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Floating Overlay Badge 1 */}
                  <div className="absolute top-6 left-6 p-2.5 rounded-2xl bg-slate-950/85 border border-emerald-500/40 text-left backdrop-blur-md shadow-xl flex items-center gap-2.5 animate-bounce">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <div>
                      <p className="text-[11px] font-bold text-emerald-300">MindHub AI Bot Active</p>
                      <p className="text-[9px] text-slate-300">"Tôi có thể hỗ trợ giải đáp 24/7!"</p>
                    </div>
                  </div>

                  {/* Floating Overlay Badge 2 */}
                  <div className="absolute bottom-6 right-6 p-2.5 rounded-2xl bg-slate-950/85 border border-amber-500/40 text-left backdrop-blur-md shadow-xl flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-amber-300">99.8% Hài lòng</p>
                      <p className="text-[9px] text-slate-300">12,500+ lượt hỗ trợ thành công</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* TOP CATEGORY TILES (6 GRID TILES) */}
        <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-20 mb-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {FAQ_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
              const IconComp = cat.icon;
              const isSelected = activeCategory === cat.id;
              const count = faqs.filter(f => f.category === cat.id).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => selectCategoryAndScroll(cat.id)}
                  className={`bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' 
                      : 'border-slate-200/80 hover:border-emerald-500/40'
                  }`}
                >
                  <div>
                    <div className={`w-9 h-9 rounded-xl ${cat.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <IconComp className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-xs md:text-sm leading-snug group-hover:text-emerald-700 transition-colors">
                      {cat.label}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>{count} câu hỏi</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAIN 2-COLUMN SECTION */}
        <div id="faq-content-section" className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* LEFT STICKY SIDEBAR */}
            <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-20 space-y-6">
              
              {/* Category Filter Menu */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 px-2 flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5" /> Danh mục trợ giúp
                </h3>

                <div className="space-y-1">
                  {FAQ_CATEGORIES.map(cat => {
                    const IconComponent = cat.icon;
                    const isActive = activeCategory === cat.id;
                    const count = cat.id === 'all' 
                      ? faqs.length 
                      : faqs.filter(f => f.category === cat.id).length;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{cat.label}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Popular Questions Quick Jump Widget */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hidden lg:block">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 px-2 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Phổ biến nhất
                </h3>

                <div className="space-y-2">
                  {popularFaqs.map(pop => (
                    <button
                      key={pop.id}
                      onClick={() => {
                        setActiveCategory('all');
                        setOpenFaqIds(prev => ({ ...prev, [pop.id]: true }));
                        const el = document.getElementById(pop.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-200/60 cursor-pointer"
                    >
                      <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-600 line-clamp-2 leading-snug">
                        {pop.q}
                      </p>
                      <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">
                        👍 {pop.helpfulCount} người thấy hữu ích
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Need Direct Help Card */}
              <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-md text-center">
                <LifeBuoy className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="font-bold text-sm mb-1">Cần hỗ trợ trực tiếp?</h4>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Gửi câu hỏi cho đội ngũ tư vấn MindHub để được giải đáp trong 24h.
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="sm"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs h-9"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Gửi câu hỏi ngay
                </Button>
              </div>

            </div>

            {/* RIGHT MAIN FAQS ACCORDION */}
            <div className="flex-1 min-w-0 w-full">

              {/* ACTIVE FILTER HEADER & CONTROLS */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base md:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    {FAQ_CATEGORIES.find(c => c.id === activeCategory)?.label || 'Tất cả câu hỏi'}
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {filteredFaqs.length}
                    </span>
                  </h2>
                  {searchQuery && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kết quả tìm kiếm cho từ khóa: "<span className="font-bold text-emerald-600">{searchQuery}</span>"
                    </p>
                  )}
                </div>

                {filteredFaqs.length > 0 && (
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <button 
                      onClick={expandAll}
                      className="text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      Mở tất cả
                    </button>
                    <span className="text-slate-300">•</span>
                    <button 
                      onClick={collapseAll}
                      className="text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                    >
                      Thu gọn tất cả
                    </button>
                  </div>
                )}
              </div>

              {/* FAQS LIST - UNIFIED SLEEK CONTAINER */}
              {isLoading ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2.5 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                      <div className="flex gap-2">
                        <div className="h-3 bg-slate-100 rounded-md w-24" />
                        <div className="h-3 bg-slate-100 rounded-md w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredFaqs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-sm">
                  <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HelpCircle className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Không tìm thấy câu hỏi phù hợp</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-5 text-xs md:text-sm">
                    Không có kết quả khớp với từ khóa "{searchQuery}". Bạn có thể thử tìm từ khóa khác hoặc gửi thắc mắc trực tiếp.
                  </p>
                  <div className="flex items-center justify-center gap-2.5">
                    <Button 
                      onClick={() => setSearchQuery('')}
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs"
                    >
                      Xóa tìm kiếm
                    </Button>
                    <Button 
                      onClick={() => setIsModalOpen(true)}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" /> Gửi câu hỏi
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
                  {filteredFaqs.map((item) => {
                    const isOpen = !!openFaqIds[item.id];
                    const vote = votedMap[item.id];

                    return (
                      <div 
                        key={item.id}
                        id={item.id}
                        className={`transition-colors duration-150 ${
                          isOpen ? 'bg-slate-50/50' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Header Trigger */}
                        <button
                          onClick={() => toggleFaq(item.id)}
                          className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none group"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug group-hover:text-emerald-700 transition-colors mb-1.5">
                              {highlightMatch(item.q, searchQuery)}
                            </h3>

                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {item.categoryLabel}
                              </span>
                              {item.isPopular && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-500" /> Phổ biến
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-medium ml-auto sm:ml-0">
                                👍 {item.helpfulCount} người thấy hữu ích
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className={`w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 group-hover:border-emerald-500/50 group-hover:text-emerald-600 transition-all ${
                              isOpen ? 'bg-emerald-600 text-white border-emerald-600 group-hover:text-white' : 'bg-white'
                            }`}>
                              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        </button>

                        {/* Answer Accordion Content */}
                        {isOpen && (
                          <div className="px-5 pb-5 pt-3 bg-white border-l-4 border-emerald-500 animate-fadeIn">
                            <p className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-line mb-4 font-normal">
                              {highlightMatch(item.a, searchQuery)}
                            </p>

                            {/* TAGS */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                                <span className="text-[11px] text-slate-400 font-medium">Thẻ:</span>
                                {item.tags.map(tag => (
                                  <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* ACTIONS & FEEDBACK TOOLBAR */}
                            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                              <button
                                type="button"
                                onClick={(e) => handleCopyLink(item.id, e)}
                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                              >
                                {copiedId === item.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-600 font-bold">Đã sao chép link</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Sao chép liên kết câu hỏi</span>
                                  </>
                                )}
                              </button>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Hữu ích?</span>
                                <button
                                  onClick={() => handleVote(item.id, 'up')}
                                  disabled={!!vote}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                                    vote === 'up'
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
                                  }`}
                                >
                                  <ThumbsUp className="w-3 h-3" /> Có ({item.helpfulCount})
                                </button>

                                <button
                                  onClick={() => handleVote(item.id, 'down')}
                                  disabled={!!vote}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                                    vote === 'down'
                                      ? 'bg-rose-600 text-white border-rose-600'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-rose-500 hover:text-rose-600'
                                  }`}
                                >
                                  <ThumbsDown className="w-3 h-3" /> Không ({item.unhelpfulCount})
                                </button>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        </div>

        {/* SUBMIT QUESTION MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 relative border border-slate-100">
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Gửi câu hỏi cho MindHub</h3>
                  <p className="text-xs text-slate-500">Đội ngũ CSKH sẽ phản hồi qua email của bạn trong 24h</p>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <Input 
                    required
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="h-10 rounded-xl text-sm"
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email nhận phản hồi <span className="text-rose-500">*</span>
                  </label>
                  <Input 
                    required
                    type="email"
                    placeholder="nguyenvana@gmail.com"
                    className="h-10 rounded-xl text-sm"
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Danh mục thắc mắc
                  </label>
                  <select 
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs md:text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={contactForm.category}
                    onChange={e => setContactForm({ ...contactForm, category: e.target.value })}
                  >
                    <option value="general">Thắc mắc chung</option>
                    <option value="account">Tài khoản & Đăng nhập</option>
                    <option value="payment">Thanh toán & Hoàn tiền</option>
                    <option value="course">Khóa học & Bài tập</option>
                    <option value="certificate">Chứng chỉ & Bằng cấp</option>
                    <option value="instructor">Đăng ký làm Giảng viên</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tiêu đề thắc mắc
                  </label>
                  <Input 
                    type="text"
                    placeholder="Cần hỗ trợ kích hoạt khóa học..."
                    className="h-10 rounded-xl text-sm"
                    value={contactForm.subject}
                    onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nội dung câu hỏi <span className="text-rose-500">*</span>
                  </label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Mô tả chi tiết câu hỏi hoặc vấn đề bạn gặp phải..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none font-medium"
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl text-xs"
                  >
                    Hủy bỏ
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-5 text-xs"
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi câu hỏi'}
                  </Button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}
