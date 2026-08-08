import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, ArrowRight, Percent } from 'lucide-react';
import { HomeCourseCard, HomeCourseItem } from './HomeCourseCard';

export function DiscountedCoursesSection({ courses }: { courses: HomeCourseItem[] }) {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Khóa học giảm giá
                </h2>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-wider animate-bounce">
                  SIÊU ƯU ĐÃI
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Cơ hội sở hữu các khóa học chất lượng cao với giá ưu đãi cực hấp dẫn
              </p>
            </div>
          </div>

          <Link
            to="/courses?discounted=true"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors group"
          >
            Xem tất cả ưu đãi
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Course Grid - Sorted by Discount % High to Low */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {[...courses]
            .sort((a, b) => {
              const getPercent = (c: HomeCourseItem) => {
                if (c.discountBadge) {
                  const num = parseInt(c.discountBadge.replace(/[^0-9]/g, ''), 10);
                  if (!isNaN(num)) return num;
                }
                if (c.originalPrice && c.price < c.originalPrice) {
                  return Math.round(((c.originalPrice - c.price) / c.originalPrice) * 100);
                }
                return 0;
              };
              return getPercent(b) - getPercent(a);
            })
            .slice(0, 5)
            .map((course) => (
              <HomeCourseCard key={course.id} course={course} tagVariant="discount" />
            ))}
        </div>

      </div>
    </section>
  );
}
