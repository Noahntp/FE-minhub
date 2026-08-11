import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  PlayCircle,
  Clock,
  Infinity,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Code2,
  Bot,
  Zap,
  CheckCircle2,
  BookOpen,
  Users,
  Star,
  Flame,
  GraduationCap,
  Compass,
  Gift,
  Tag,
  Layers,
  Copy,
  Check
} from 'lucide-react';

import { useApp } from '@/app/AppContext';

export function HeroSection() {
  const navigate = useNavigate();
  const { openTrialModal, openAiModal } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedVoucher, setCopiedVoucher] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slidesCount = 5;
  const slideIntervalMs = 4500; // 4.5s per slide

  // Auto slide interval
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesCount);
    }, slideIntervalMs);
    return () => clearInterval(timer);
  }, [isPaused, slidesCount, slideIntervalMs]);

  const handleCopyVoucher = () => {
    try {
      navigator.clipboard.writeText('MINDSTART50');
    } catch (e) {}
    setCopiedVoucher(true);
    toast.success('Đã sao chép mã ưu đãi MINDSTART50! Dùng khi thanh toán để được giảm 50% học phí.');
    setTimeout(() => setCopiedVoucher(false), 3000);
  };

  const handleApplyVoucher = () => {
    try {
      navigator.clipboard.writeText('MINDSTART50');
      sessionStorage.setItem('mindhub_applied_coupon', 'MINDSTART50');
    } catch (e) {}
    toast.success('Đã lưu mã MINDSTART50! Đang chuyển tới danh sách khóa học...');
    navigate('/courses?coupon=MINDSTART50');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  };


  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slidesCount);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slidesCount) % slidesCount);

  // Swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (diffX > 50) nextSlide();
    else if (diffX < -50) prevSlide();
    touchStartX.current = null;
  };

  return (
    <section className="relative overflow-hidden pt-4 pb-8 bg-slate-950 text-white select-none">
      {/* Keyframe Style for Auto Progress Line */}
      <style>{`
        @keyframes carouselProgressAnimation {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Carousel Wrapper */}
        <div 
          className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Progress Line for Auto-Play Timer */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800/80 z-30 overflow-hidden">
            <div
              key={`${currentSlide}-${isPaused}`}
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400"
              style={{
                animation: isPaused ? 'none' : `carouselProgressAnimation ${slideIntervalMs}ms linear forwards`,
                width: isPaused ? '100%' : '0%'
              }}
            />
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-950/70 text-slate-300 hover:text-white hover:bg-emerald-600 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-950/70 text-slate-300 hover:text-white hover:bg-emerald-600 transition-all shadow-lg border border-slate-700/50 backdrop-blur-md group"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Horizontal Slide Track Container */}
          <div className="relative min-h-[460px] lg:min-h-[440px] overflow-hidden">
            <div 
              className="flex w-full h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >

              {/* SLIDE 1: Tong quan MindHub & Tim kiem */}
              <div className="w-full shrink-0 min-w-full p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column */}
                <div className="lg:col-span-7 space-y-5 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Nền tảng Học Lập trình Thực chiến & AI 2026</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                    Học thật – Làm được <br />
                    Phát triển sự nghiệp cùng{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                      MindHub
                    </span>
                  </h1>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                    Hệ sinh thái khóa học thực chiến về Web Development, Backend, Frontend, AI và DevOps.
                    Học từ dự án doanh nghiệp thực tế, hỗ trợ sửa bug 24/7.
                  </p>

                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="relative flex items-center w-full max-w-xl">
                    <input
                      type="text"
                      placeholder="Bạn muốn học gì hôm nay? (React, Laravel, Python, DevOps...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-28 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold hover:from-emerald-400 hover:to-teal-500 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
                    >
                      <Search className="w-4 h-4" />
                      <span>Tìm kiếm</span>
                    </button>
                  </form>

                  {/* Hot Tag Shortcuts */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
                    <span className="font-semibold text-slate-300">Hot tags:</span>
                    {['React & Next.js', 'Laravel API', 'Python AI', 'DevOps', 'TailwindCSS'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 border border-slate-700/60 transition-colors text-[11px]"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      to="/courses"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2"
                    >
                      Khám phá khóa học <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => openTrialModal()}
                      className="px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-bold text-sm flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
                    >
                      <PlayCircle className="w-4 h-4 text-emerald-400" />
                      <span>Học thử miễn phí</span>
                    </button>
                  </div>
                </div>

                {/* Right Visual Card - Interactive Dashboard Mockup */}
                <div className="lg:col-span-5 hidden lg:flex justify-center">
                  <div className="relative w-full max-w-md bg-gradient-to-b from-slate-800/90 to-slate-900/90 rounded-2xl p-5 border border-slate-700/70 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-xs font-mono text-slate-400 ml-2">mindhub-dashboard.ts</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">LIVE</span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-200">Học viên tích cực</p>
                            <p className="text-sm font-bold text-emerald-400">12,450+ thành viên</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">+128 tuần này</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-200">Kho khóa học chuẩn</p>
                            <p className="text-sm font-bold text-cyan-400">85+ bài giảng thực chiến</p>
                          </div>
                        </div>
                        <div className="flex items-center text-amber-400 text-xs font-bold gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9/5
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex items-center gap-3">
                        <Bot className="w-6 h-6 text-emerald-400 shrink-0 animate-bounce" />
                        <div>
                          <p className="text-xs font-bold text-emerald-300">MindHub AI Assistant Active</p>
                          <p className="text-[11px] text-slate-400">"Tôi có thể hỗ trợ review code & giải đáp bài tập!"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE 2: Khoa hoc Laravel REST API Hot */}
              <div className="w-full shrink-0 min-w-full p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold">
                    <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>KHÓA HỌC BÁN CHẠY NHẤT • BACKEND MASTER</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                    Làm chủ <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-300 to-amber-300">Laravel REST API</span> <br />
                    từ Zero đến Production
                  </h2>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                    Xây dựng hệ thống Backend chuẩn doanh nghiệp cho đồ án tốt nghiệp & dự án thực tế.
                    Tích hợp Sanctum Auth, Payment Gateway, Queue & Docker.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>45+ Bài học video HD chất lượng cao</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Code mẫu chuẩn Clean Architecture</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Thực hành kết nối Frontend React/Vue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Hỗ trợ 1-1 qua Discord & Forum</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    <Link
                      to="/courses/laravel-rest-api"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-2"
                    >
                      Xem chi tiết khóa học <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/courses/laravel-rest-api"
                      className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 font-bold text-sm flex items-center gap-2 active:scale-95 transition-all"
                    >
                      <PlayCircle className="w-4 h-4 text-rose-400" />
                      Học thử bài 1
                    </Link>
                  </div>
                </div>

                {/* Right Visual Code Card */}
                <div className="lg:col-span-5 hidden lg:flex justify-center">
                  <div className="relative w-full max-w-md bg-slate-900 rounded-2xl p-5 border border-rose-500/30 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-mono text-slate-300">CourseController.php</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">Laravel 11</span>
                    </div>

                    <pre className="text-[11px] font-mono leading-relaxed text-slate-300 overflow-x-auto p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <code>
                        <span className="text-purple-400">public function</span> <span className="text-blue-300">index</span>() &#123;<br />
                        &nbsp;&nbsp;<span className="text-slate-400">// Paginate with API Resource</span><br />
                        &nbsp;&nbsp;<span className="text-amber-300">$courses</span> = Course::<span className="text-emerald-400">with</span>([<span className="text-emerald-300">'category'</span>])<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;-&gt;<span className="text-emerald-400">published</span>()<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;-&gt;<span className="text-emerald-400">latest</span>()<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;-&gt;<span className="text-emerald-400">paginate</span>(12);<br /><br />
                        &nbsp;&nbsp;<span className="text-purple-400">return</span> CourseResource::<span className="text-emerald-400">collection</span>(<span className="text-amber-300">$courses</span>);<br />
                        &#125;
                      </code>
                    </pre>

                    <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/20 flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Khóa học đánh giá tốt nhất</span>
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-rose-400" /> 4.95 (340+ review)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE 3: AI Assistant Showcase */}
              <div className="w-full shrink-0 min-w-full p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    <span>TÍNH NĂNG ĐỘC QUYỀN • MINDHUB AI 2.0</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                    Học thông minh hơn với <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                      Trợ lý AI Học tập Cá nhân hóa
                    </span>
                  </h2>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                    Không còn lo ngại việc bị kẹt bug khi tự học. MindHub AI giải thích khái niệm phức tạp,
                    sửa lỗi code realtime và thiết kế lộ trình học riêng theo trình độ của bạn.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-200">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Giải đáp thắc mắc code trong 3 giây</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Review & Tối ưu hóa code tự động</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Gợi ý bài tập theo điểm yếu cá nhân</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Hoàn toàn miễn phí cho học viên</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => openAiModal()}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Trải nghiệm AI & Lộ trình</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Visual Chat Preview */}
                <div className="lg:col-span-5 hidden lg:flex justify-center">
                  <div
                    onClick={() => openAiModal()}
                    className="relative w-full max-w-md bg-slate-900 hover:bg-slate-900/90 rounded-2xl p-5 border border-cyan-500/40 hover:border-cyan-400 shadow-2xl space-y-3 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-bold text-cyan-300">MindHub AI Tutor</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Trực tuyến 24/7</span>
                    </div>

                    <div className="flex justify-end">
                      <div className="bg-emerald-600/30 border border-emerald-500/40 text-emerald-100 text-xs p-3 rounded-2xl rounded-tr-none max-w-[85%]">
                        Sửa giúp mình lỗi "React Hook useEffect has a missing dependency" với?
                      </div>
                    </div>

                    <div className="flex justify-start items-start gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-slate-950 border border-slate-800 text-slate-200 text-xs p-3 rounded-2xl rounded-tl-none space-y-2 max-w-[85%]">
                        <p>Bạn chỉ cần bọc hàm callback trong <code className="text-cyan-300">useCallback</code> hoặc thêm biến phụ thuộc vào mảng dependency!</p>
                        <div className="p-2 rounded bg-slate-900 text-[10px] font-mono text-emerald-400 border border-slate-800">
                          useEffect(() =&gt; &#123; fetchData(); &#125;, [fetchData]);
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE 4: Fullstack Web Developer Roadmap */}
              <div className="w-full shrink-0 min-w-full p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>LỘ TRÌNH CHUẨN 2026 • FROM ZERO TO FULLSTACK</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                    Lộ trình <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400">Fullstack Web Developer</span> <br />
                    tự tin đi làm sau 6 tháng
                  </h2>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                    Từng bước làm chủ Frontend (React/Next.js), Backend (Node.js/Laravel), Cơ sở dữ liệu & Deploy hệ thống. Có mentor đồng hành sửa từng dòng code.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Lộ trình tinh gọn chuẩn doanh nghiệp</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>4 Dự án Capstone thực tế ghi CV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Hệ thống chấm bài tự động & Quản lý tiến độ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Hỗ trợ kết nối phỏng vấn thử việc</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    <Link
                      to="/roadmaps"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2"
                    >
                      Khám phá Lộ Trình <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/courses"
                      className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-sm flex items-center gap-2 active:scale-95 transition-all"
                    >
                      <Layers className="w-4 h-4 text-amber-400" />
                      Xem các môn học
                    </Link>
                  </div>
                </div>

                {/* Right Visual Roadmap Card */}
                <div className="lg:col-span-5 hidden lg:flex justify-center">
                  <div
                    onClick={() => navigate('/roadmaps/frontend')}
                    className="relative w-full max-w-md bg-slate-900 hover:bg-slate-900/90 rounded-2xl p-5 border border-amber-500/30 hover:border-amber-400 shadow-2xl space-y-3 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                        <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200">Fullstack Web Roadmap</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono group-hover:bg-amber-500/30">4 MILESTONES</span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/40">1</span>
                          <div className="text-left">
                            <p className="text-xs font-bold text-white">Nền tảng Web & JS ES6+</p>
                            <p className="text-[11px] text-slate-400">HTML5, CSS3, TailwindCSS, JS DOM</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center border border-cyan-500/40">2</span>
                          <div className="text-left">
                            <p className="text-xs font-bold text-white">Frontend Framework</p>
                            <p className="text-[11px] text-slate-400">React.js, Next.js, Redux Toolkit, React Query</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center border border-rose-500/40">3</span>
                          <div className="text-left">
                            <p className="text-xs font-bold text-white">Backend & Database</p>
                            <p className="text-[11px] text-slate-400">Laravel / Node.js, REST API, MySQL, Redis</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                      </div>

                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-950 border border-amber-500/30 flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center border border-amber-500/40">4</span>
                          <div className="text-left">
                            <p className="text-xs font-bold text-amber-300">DevOps & Capstone</p>
                            <p className="text-[11px] text-slate-400">Docker, CI/CD, Deploy AWS/Vercel & Sẵn sàng đi làm</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE 5: Promotion Voucher Offer */}
              <div className="w-full shrink-0 min-w-full p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
                    <Gift className="w-4 h-4 text-purple-400 animate-bounce" />
                    <span>ƯU ĐÃI THÁNG NÀY • HỌC VIÊN MỚI</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                    Nhận Voucher <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-rose-400">Ưu Đãi 50%</span> <br />
                    cho toàn bộ khóa học thực chiến
                  </h2>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                    Nhập mã ưu đãi đặc biệt để mở khóa toàn bộ tài nguyên học lập trình chuyên nghiệp.
                    Số lượng quà tặng có hạn cho 100 học viên đăng ký sớm nhất!
                  </p>

                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/40 flex items-center justify-between max-w-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Mã giảm giá độc quyền</p>
                        <p className="text-base font-extrabold font-mono text-purple-300">MINDSTART50</p>
                      </div>
                    </div>

                    <button
                      onClick={handleCopyVoucher}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
                    >
                      {copiedVoucher ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Đã chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Sao chép mã</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Áp dụng ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 hidden lg:flex justify-center">
                  <div
                    onClick={handleApplyVoucher}
                    className="relative w-full max-w-md bg-gradient-to-br from-purple-900/80 via-slate-900 to-slate-950 hover:from-purple-900 hover:via-slate-900 hover:to-slate-900 rounded-2xl p-6 border border-purple-500/40 hover:border-purple-400 shadow-2xl text-center space-y-4 cursor-pointer group transition-all"
                  >
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                      <Gift className="w-7 h-7" />
                    </div>

                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-purple-300 font-extrabold bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                        GIẢM 50% HỌC PHÍ
                      </span>
                      <h3 className="text-xl font-black text-white mt-2">MindHub Pass 2026</h3>
                      <p className="text-xs text-slate-300 mt-1">Truy cập không giới hạn bài giảng & Trợ lý AI</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-dashed border-purple-500/50 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Thời gian áp dụng:</span>
                      <span className="text-purple-300 font-mono font-bold">Còn 3 ngày duy nhất</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Carousel Indicators / Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {[0, 1, 2, 3, 4].map((idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-8 bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

        {/* Integrated Trust Badges Underneath Banner */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md flex items-center justify-center gap-2.5 text-xs text-slate-300 font-medium">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Học mọi lúc, mọi nơi</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md flex items-center justify-center gap-2.5 text-xs text-slate-300 font-medium">
            <Infinity className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Truy cập trọn đời</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md flex items-center justify-center gap-2.5 text-xs text-slate-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Hoàn tiền trong 7 ngày</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md flex items-center justify-center gap-2.5 text-xs text-slate-300 font-medium">
            <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cấp chứng chỉ hoàn thành</span>
          </div>
        </div>

      </div>
    </section>
  );
}



