import React, { useEffect, useState } from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { Calendar as CalendarIcon, Flame, Trophy, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { api } from '@/services/api';

// Mock heatmap data
const generateHeatmapData = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() - (29 - i));
    
    // Random activity level (0-4)
    const level = Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0;
    
    days.push({
      date,
      level,
      minutes: level * 30 + Math.floor(Math.random() * 30)
    });
  }
  return days;
};

const HEATMAP_COLORS = {
  0: 'bg-muted',
  1: 'bg-green-200 dark:bg-green-900/40',
  2: 'bg-green-400 dark:bg-green-700/60',
  3: 'bg-green-500 dark:bg-green-500/80',
  4: 'bg-green-600 dark:bg-green-400'
};

export default function LearningCalendarPage() {
  const [heatmapData, setHeatmapData] = useState<any[]>(generateHeatmapData());
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    let isMounted = true;
    api.getActivityCalendar()
      .then(res => {
        if (!isMounted) return;
        if (res && res.data) {
          const d = res.data;
          
          if (d.streak) {
             setCurrentStreak(d.streak.current_streak || 0);
             setLongestStreak(d.streak.longest_streak || 0);
          }
          
          if (Array.isArray(d.heatmap)) {
            // Map backend heatmap to frontend format
            let totalSeconds = 0;
            const mapped = d.heatmap.map((h: any) => {
              totalSeconds += (h.total_time_seconds || 0);
              return {
                date: new Date(h.date),
                level: h.intensity || 0,
                minutes: Math.floor((h.total_time_seconds || 0) / 60)
              };
            });
            setTotalHours(Math.floor(totalSeconds / 3600));

            // Merge with base days to ensure 30 days are visible if the backend returns fewer
            const days = [];
            const today = new Date();
            for (let i = 0; i < 30; i++) {
              const d = new Date();
              d.setDate(today.getDate() - (29 - i));
              const match = mapped.find((m: any) => m.date.toDateString() === d.toDateString());
              days.push(match || { date: d, level: 0, minutes: 0 });
            }
            setHeatmapData(days);
          }
        }
      })
      .catch(err => {
         console.error('Failed to load learning calendar', err);
      });
      
    return () => { isMounted = false; };
  }, []);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black font-suisseintl mb-2">Lịch học tập</h1>
            <p className="text-muted-foreground">Theo dõi thói quen học tập và duy trì streak của bạn</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <Flame className="w-7 h-7 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Streak hiện tại</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black">{currentStreak}</span>
                <span className="text-muted-foreground mb-1">ngày</span>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Trophy className="w-7 h-7 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Streak kỷ lục</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black">{longestStreak}</span>
                <span className="text-muted-foreground mb-1">ngày</span>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-3xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Tổng thời gian học (30 ngày)</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black">{totalHours}</span>
                <span className="text-muted-foreground mb-1">giờ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Section */}
        <div className="bg-card border rounded-3xl p-8 shadow-sm mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Biểu đồ hoạt động
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full w-8 h-8"><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="rounded-full w-8 h-8"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
          
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[600px]">
              <div className="flex gap-2 mb-2">
                {heatmapData.map((day, i) => (
                  <div 
                    key={i} 
                    className={`w-10 h-10 rounded-md ${HEATMAP_COLORS[day.level as keyof typeof HEATMAP_COLORS]} transition-colors`}
                    title={`${day.date.toLocaleDateString()}: ${day.level > 0 ? `${day.minutes} phút` : 'Chưa học'}`}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>{heatmapData[0].date.toLocaleDateString()}</span>
                <span>{heatmapData[heatmapData.length - 1].date.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground justify-end">
            <span>Ít hơn</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div key={level} className={`w-4 h-4 rounded-sm ${HEATMAP_COLORS[level as keyof typeof HEATMAP_COLORS]}`}></div>
              ))}
            </div>
            <span>Nhiều hơn</span>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div>
          <h2 className="text-xl font-bold mb-6">Lịch trình sắp tới</h2>
          <div className="bg-muted/50 border border-dashed rounded-3xl p-12 text-center">
            <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Chưa có lịch hẹn nào</h3>
            <p className="text-muted-foreground">Tính năng Lịch học trực tiếp với Giảng viên đang được phát triển.</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
