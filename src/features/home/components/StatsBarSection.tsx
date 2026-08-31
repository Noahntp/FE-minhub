import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Users, Star, LayoutGrid } from 'lucide-react';

interface StatsBarSectionProps {
  stats?: {
    total_courses?: number;
    total_students?: number;
    total_reviews?: number;
    total_instructors?: number;
  };
}

function CountUpNumber({ target, suffix = '', duration = 1600 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const startAnimation = () => {
      if (animatedRef.current || target <= 0) return;
      animatedRef.current = true;
      let startTimestamp: number | null = null;

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        // Smooth Ease-Out Cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * target);

        setCount(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setCount(target);
        }
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);

    // Fallback trigger if already in viewport on mount
    startAnimation();

    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={containerRef} className="tabular-nums">
      {(count || target).toLocaleString('vi-VN')}{suffix}
    </span>
  );
}

export function StatsBarSection({ stats: apiStats }: StatsBarSectionProps) {
  const coursesNum = Number(apiStats?.total_courses ?? 0);
  const studentsNum = Number(apiStats?.total_students ?? 0);
  const reviewsNum = Number(apiStats?.total_reviews ?? apiStats?.total_5_star_reviews ?? 0);
  const instructorsNum = Number(apiStats?.total_instructors ?? 0);

  const statsList = [
    {
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
      target: coursesNum,
      suffix: '+',
      label: 'khóa học',
      bgColor: 'bg-emerald-50/80 border-emerald-100',
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      target: studentsNum,
      suffix: '+',
      label: 'học viên',
      bgColor: 'bg-emerald-50/80 border-emerald-100',
    },
    {
      icon: <Star className="w-6 h-6 text-amber-500 fill-amber-500" />,
      target: reviewsNum,
      suffix: '+',
      label: 'đánh giá 5★',
      bgColor: 'bg-amber-50/80 border-amber-100',
    },
    {
      icon: <LayoutGrid className="w-6 h-6 text-emerald-600" />,
      target: instructorsNum,
      suffix: '',
      label: 'giảng viên chuyên gia',
      bgColor: 'bg-emerald-50/80 border-emerald-100',
    },
  ];

  return (
    <section className="py-6 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {statsList.map((stat, idx) => (
            <div
              key={idx}
              className={`p-3 sm:p-5 rounded-2xl border ${stat.bgColor} flex items-center justify-start sm:justify-center gap-2.5 sm:gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
            >
              <div className="p-2 sm:p-3 bg-white rounded-xl shadow-sm shrink-0">
                {stat.icon}
              </div>
              <div className="text-left min-w-0">
                <div className="text-lg sm:text-2xl font-black text-slate-900 leading-none truncate">
                  <CountUpNumber target={stat.target} suffix={stat.suffix} />
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-600 mt-1 truncate">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
