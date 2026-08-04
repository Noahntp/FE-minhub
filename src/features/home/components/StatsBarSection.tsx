import React from 'react';
import { BookOpen, Users, Star, LayoutGrid } from 'lucide-react';

export function StatsBarSection() {
  const stats = [
    {
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
      value: '9+',
      label: 'khóa học',
      bgColor: 'bg-emerald-50 border-emerald-100',
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      value: '70+',
      label: 'học viên',
      bgColor: 'bg-emerald-50 border-emerald-100',
    },
    {
      icon: <Star className="w-6 h-6 text-amber-500 fill-amber-500" />,
      value: '50+',
      label: 'đánh giá',
      bgColor: 'bg-amber-50 border-amber-100',
    },
    {
      icon: <LayoutGrid className="w-6 h-6 text-emerald-600" />,
      value: '6',
      label: 'danh mục nổi bật',
      bgColor: 'bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <section className="py-6 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`p-4 sm:p-5 rounded-2xl border ${stat.bgColor} flex items-center justify-center gap-4 transition-transform hover:-translate-y-0.5`}
            >
              <div className="p-3 bg-white rounded-xl shadow-sm shrink-0">
                {stat.icon}
              </div>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-slate-600 mt-1">
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
