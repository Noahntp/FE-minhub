import React from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { Trophy, Medal, Star, Flame, Target, Zap } from 'lucide-react';

export default function AchievementsPage() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-suisseintl tracking-tight">Thành tựu & Huy hiệu</h1>
            <p className="text-muted-foreground">Theo dõi tiến độ học tập và các danh hiệu bạn đã đạt được.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold mb-2 flex items-center gap-2"><Star className="w-5 h-5" /> Tổng XP</h3>
            <p className="text-4xl font-black font-suisseintl">12,450</p>
            <p className="text-white/80 text-sm mt-2">Hạng 4 trên Bảng xếp hạng</p>
          </div>
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold mb-2 flex items-center gap-2"><Flame className="w-5 h-5" /> Chuỗi ngày học</h3>
            <p className="text-4xl font-black font-suisseintl">7 <span className="text-xl">ngày</span></p>
            <p className="text-white/80 text-sm mt-2">Giữ vững phong độ nhé!</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold mb-2 flex items-center gap-2"><Target className="w-5 h-5" /> Khóa học hoàn thành</h3>
            <p className="text-4xl font-black font-suisseintl">3</p>
            <p className="text-white/80 text-sm mt-2">Bạn đang làm rất tốt.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Bộ sưu tập Huy hiệu</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          <div className="bg-card rounded-2xl border border-border p-6 text-center flex flex-col items-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Zap className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="font-bold text-sm">Fast Learner</h3>
            <p className="text-xs text-muted-foreground mt-1">Hoàn thành khóa học đầu tiên</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 text-center flex flex-col items-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mb-4">
              <Flame className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="font-bold text-sm">7 Day Streak</h3>
            <p className="text-xs text-muted-foreground mt-1">Học liên tục 7 ngày</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 text-center flex flex-col items-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Medal className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="font-bold text-sm">Top 10%</h3>
            <p className="text-xs text-muted-foreground mt-1">Lọt top 10% tuần này</p>
          </div>
          
          {/* Locked Badge */}
          <div className="bg-muted/50 rounded-2xl border border-border border-dashed p-6 text-center flex flex-col items-center opacity-70 grayscale">
            <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center mb-4">
              <Star className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="font-bold text-sm">Master</h3>
            <p className="text-xs text-muted-foreground mt-1">Đạt 50,000 XP</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
