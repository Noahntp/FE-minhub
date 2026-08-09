import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Rocket } from 'lucide-react';
import { useApp } from '@/app/AppContext';

export function HomeCtaBannerSection() {
  const { openTrialModal } = useApp();

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          
          {/* Background pattern */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="space-y-2 max-w-xl relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Sẵn sàng bắt đầu hành trình học tập?
            </h2>
            <p className="text-sm text-emerald-100 font-medium">
              Tham gia MindHub ngay hôm nay và nhận ưu đãi dành riêng cho bạn!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
            <button
              type="button"
              onClick={() => openTrialModal()}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-sm flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 w-full sm:w-auto cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-emerald-300" />
              <span>Học thử miễn phí</span>
            </button>

            <Link
              to="/courses"
              className="px-6 py-3.5 rounded-xl bg-emerald-950 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all w-full sm:w-auto"
            >
              <Rocket className="w-4 h-4 text-emerald-400" />
              Khám phá khóa học
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
