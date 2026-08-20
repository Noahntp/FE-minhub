import React, { useEffect, useState } from 'react';
import { Flame, Trophy, Calendar, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { ApiService } from '../../services/api';
import { apiFetch } from '@/shared/lib/api-client';

export interface WeekDayItem {
  day: string;
  date?: string;
  active: boolean;
  isToday?: boolean;
  is_today?: boolean;
}

interface StreakData {
  current_streak?: number;
  longest_streak?: number;
  total_active_days?: number;
  is_maintaining?: boolean;
  status_label?: string;
  completed_days_in_week?: number;
  total_days_in_week?: number;
  week_days?: WeekDayItem[];
  encouragement?: {
    days_needed?: number;
    next_milestone?: number;
    badge_name?: string;
    message?: string;
  };
}

interface StudentStreakCardProps {
  currentStreak?: number;
  longestStreak?: number;
  totalActiveDays?: number;
  streakData?: StreakData;
}

export const StudentStreakCard: React.FC<StudentStreakCardProps> = ({
  currentStreak: propCurrentStreak,
  longestStreak: propLongestStreak,
  totalActiveDays: propTotalActiveDays,
  streakData: propStreakData,
}) => {
  const [data, setData] = useState<StreakData | null>(propStreakData || null);
  const [loading, setLoading] = useState<boolean>(!propStreakData);

  useEffect(() => {
    let isMounted = true;
    const fetchStreak = async () => {
      try {
        const res = await apiFetch<any>('/me/streak');
        if (isMounted && res) {
          const payload = res.data || res;
          setData(payload);
        }
      } catch (err) {
        try {
          const fallbackRes = await ApiService.getLearningStreak();
          if (isMounted && fallbackRes) {
            const payload = fallbackRes.data || fallbackRes;
            setData(payload);
          }
        } catch (e) {
          console.warn('Failed to fetch streak metrics:', e);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStreak();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentStreak = data?.current_streak ?? (propCurrentStreak && propCurrentStreak > 0 ? propCurrentStreak : 1);
  const longestStreak = data?.longest_streak ?? (propLongestStreak && propLongestStreak > 0 ? propLongestStreak : currentStreak);
  const totalActiveDays = data?.total_active_days ?? (propTotalActiveDays && propTotalActiveDays > 0 ? propTotalActiveDays : currentStreak);
  const isMaintaining = data?.is_maintaining ?? true;
  const statusLabel = data?.status_label ?? (isMaintaining ? 'Đang duy trì' : 'Chưa bắt đầu');
  
  const completedDaysInWeek = data?.completed_days_in_week ?? Math.max(1, currentStreak);
  const totalDaysInWeek = data?.total_days_in_week ?? 7;

  const jsDay = new Date().getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const defaultWeekDays: WeekDayItem[] = dayLabels.map((day, idx) => ({
    day,
    active: idx === todayIdx,
    isToday: idx === todayIdx,
    is_today: idx === todayIdx,
  }));

  const weekDays = data?.week_days && data.week_days.length > 0 ? data.week_days : defaultWeekDays;

  const daysNeeded = data?.encouragement?.days_needed ?? Math.max(0, 7 - currentStreak);
  const nextMilestone = data?.encouragement?.next_milestone ?? 7;
  const badgeName = data?.encouragement?.badge_name ?? 'Chiến binh Chăm chỉ';

  const encouragementMessage = data?.encouragement?.message || (
    daysNeeded > 0
      ? `Học thêm ${daysNeeded} ngày nữa để đạt mốc ${nextMilestone} ngày liên tiếp và mở khóa huy hiệu ${badgeName}!`
      : `Chúc mừng bạn đã hoàn thành xuất sắc chuỗi ${nextMilestone} ngày học liên tiếp trong tuần!`
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all mb-6 relative">
      {loading && (
        <div className="absolute top-4 right-4 text-xs text-slate-400 animate-pulse font-medium">
          Đang đồng bộ...
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Flame className="w-4.5 h-4.5 text-amber-500 fill-amber-400 animate-pulse" />
          <span>Chuỗi học tập (Streak)</span>
        </h2>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold ${
          isMaintaining 
            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          <Zap className={`w-3.5 h-3.5 ${isMaintaining ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
          <span>{statusLabel}</span>
        </span>
      </div>

      {/* Main Streak Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        
        {/* Big Flame Streak Display (5 cols) */}
        <div className="sm:col-span-5 bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 rounded-2xl p-5 text-white flex items-center gap-4 shadow-lg shadow-amber-500/20 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/15 rounded-full blur-xl pointer-events-none" />
          
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
            <Flame className="w-9 h-9 text-yellow-100 fill-yellow-300 animate-bounce" />
          </div>

          <div>
            <div className="text-3xl font-black tracking-tight leading-none text-white">
              {currentStreak} <span className="text-lg font-extrabold">Ngày</span>
            </div>
            <p className="text-xs font-bold text-amber-100 mt-1">
              Chuỗi học liên tiếp ⚡
            </p>
          </div>
        </div>

        {/* 2 Sub Stats (7 cols) */}
        <div className="sm:col-span-7 grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Kỷ lục chuỗi</span>
              <span className="text-sm font-black text-slate-900">{longestStreak} ngày</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Tổng ngày học</span>
              <span className="text-sm font-black text-slate-900">{totalActiveDays} ngày</span>
            </div>
          </div>
        </div>

      </div>

      {/* Weekly Progress Tracker (7 Days) */}
      <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Tiến độ tuần này</span>
          <span className="text-amber-600 font-extrabold">{completedDaysInWeek} / {totalDaysInWeek} ngày đã hoàn thành</span>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {weekDays.map((item, idx) => {
            const isToday = item.isToday || item.is_today;
            return (
              <div
                key={idx}
                className={`p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border text-center flex flex-col items-center gap-0.5 sm:gap-1 transition-all ${
                  isToday
                    ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-md shadow-amber-400/30 scale-105 font-black'
                    : item.active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200/80'
                }`}
              >
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase">{item.day}</span>
                {isToday ? (
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-900 text-amber-900 animate-pulse" />
                ) : item.active ? (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                ) : (
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-slate-300" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational Encouragement Banner */}
      <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 flex items-center justify-between text-xs font-medium text-amber-900">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{encouragementMessage}</span>
        </div>
      </div>
    </div>
  );
};
