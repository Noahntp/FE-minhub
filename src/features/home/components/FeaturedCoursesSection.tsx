import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { HomeCourseCard, HomeCourseItem } from './HomeCourseCard';

export function FeaturedCoursesSection({ courses }: { courses: HomeCourseItem[] }) {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Khóa học nổi bật
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Những khóa học được học viên lựa chọn và đánh giá cao nhất
              </p>
            </div>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors group"
          >
            Xem tất cả khóa học
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid 5 Course Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {courses.slice(0, 5).map((course) => (
            <HomeCourseCard key={course.id} course={course} tagVariant="hot" />
          ))}
        </div>

      </div>
    </section>
  );
}
