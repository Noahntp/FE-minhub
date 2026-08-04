import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, PlayCircle, Clock, Infinity, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-12 bg-gradient-to-b from-emerald-50/40 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Cột trái: Thông điệp thương hiệu & Tìm kiếm */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.15] tracking-tight">
              Học thật – Làm được – <br />
              Phát triển sự nghiệp cùng{' '}
              <span className="text-emerald-600 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                MindHub
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Hệ sinh thái khóa học thực chiến về Web Development, Backend, Frontend, AI và DevOps.
              Học để hiểu – Ứng dụng ngay – Nâng tầm sự nghiệp.
            </p>

            {/* Khung tìm kiếm Hero */}
            <form onSubmit={handleSearch} className="relative flex items-center w-full max-w-lg">
              <input
                type="text"
                placeholder="Bạn muốn học gì hôm nay?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-14 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="absolute right-1.5 p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-md"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/courses"
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-95 transition-all"
              >
                Khám phá khóa học
              </Link>
              <Link
                to="/courses?free=true"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-600/30 font-bold text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all"
              >
                <PlayCircle className="w-4 h-4 text-emerald-600" />
                Học thử miễn phí
              </Link>
            </div>

            {/* Badges cam kết */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px] sm:text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Học mọi lúc, mọi nơi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Infinity className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Truy cập trọn đời</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hoàn tiền trong 7 ngày</span>
              </div>
            </div>
          </div>

          {/* Cột giữa: Banner minh họa nhân vật */}
          <div className="lg:col-span-4 flex justify-center relative">
            <div className="relative w-full max-w-sm lg:max-w-none">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200/50 via-teal-100/40 to-sky-100/30 rounded-3xl blur-2xl -z-10 transform scale-95" />
              
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"
                alt="Student Learning at MindHub"
                className="w-full h-auto max-h-[420px] object-cover rounded-3xl shadow-2xl border-4 border-white"
              />

              {/* Floating tech badges */}
              <div className="absolute top-6 right-4 bg-white/90 backdrop-blur-md border border-slate-100 p-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold text-slate-800 animate-bounce duration-1000">
                <span className="w-3 h-3 rounded-full bg-sky-400"></span>
                <span>React & Next.js</span>
              </div>
              <div className="absolute bottom-6 left-4 bg-white/90 backdrop-blur-md border border-slate-100 p-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Assistant</span>
              </div>
            </div>
          </div>

          {/* Cột phải: 2 Feature Cards Nổi Bật */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            
            {/* Card 1: Red Laravel Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-700 via-rose-800 to-red-900 text-white p-5 rounded-2xl shadow-xl group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none" />
              <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase bg-white/20 text-white px-2.5 py-1 rounded-md mb-2">
                KHÓA HỌC NỔI BẬT
              </span>
              <h3 className="text-base font-extrabold leading-snug mb-1">
                Học Laravel REST API cho đồ án tốt nghiệp
              </h3>
              <p className="text-xs text-rose-100/90 mb-4">
                Từ cơ bản đến triển khai thực tế
              </p>
              <Link
                to="/courses/laravel-rest-api"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-rose-900 px-3.5 py-2 rounded-lg shadow-md hover:bg-rose-50 transition-colors"
              >
                Xem ngay <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Blue AI Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-5 rounded-2xl shadow-xl group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/20 rounded-full blur-lg pointer-events-none" />
              <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase bg-blue-500/30 text-blue-200 px-2.5 py-1 rounded-md mb-2">
                CHO ĐỀ XUẤT
              </span>
              <h3 className="text-base font-extrabold leading-snug mb-1">
                AI hỗ trợ học tập cá nhân hóa
              </h3>
              <p className="text-xs text-blue-100/90 mb-4">
                Học thông minh hơn mỗi ngày
              </p>
              <Link
                to="/roadmaps"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-indigo-950 px-3.5 py-2 rounded-lg shadow-md hover:bg-blue-50 transition-colors"
              >
                Khám phá ngay <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
