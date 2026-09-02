import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { HomeCourseCard, HomeCourseItem } from './HomeCourseCard';

export function NewCoursesSection({ courses }: { courses: HomeCourseItem[] }) {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="py-12 bg-slate-50/70 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 border border-sky-100 rounded-xl text-sky-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Khóa học mới nhất
                </h2>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500 text-white uppercase tracking-wider">
                  MỚI
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Cập nhật nhanh nhất các kiến thức công nghệ mới và hot vừa ra mắt
              </p>
            </div>
          </div>

          <Link
            to="/courses?sort=newest"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors group"
          >
            Khám phá khóa học mới
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {courses.slice(0, 5).map((course) => (
            <HomeCourseCard
              key={course.id}
              course={course}
              tagVariant="none"
              hideThumbnailTag={true}
              showProofBadge={true}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
