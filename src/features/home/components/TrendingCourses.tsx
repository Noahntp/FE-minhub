import React from "react";
import { CourseCard, CourseData } from "../../courses/components/CourseCard";
import { Flame, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function TrendingCourses({ courses }: { courses: CourseData[] }) {
  if (!courses || courses.length === 0) return null;
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-500/10 rounded-lg">
            <Flame className="w-5 h-5 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Khóa học Hot tuần này</h2>
        </div>
        <Link to="/courses?sort=trending" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center group">
          Xem tất cả <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
        {courses.map(course => (
          <div key={course.id} className="min-w-[280px] md:min-w-[320px] max-w-[350px] snap-start shrink-0">
            <CourseCard course={course} />
          </div>
        ))}
      </div>
    </div>
  );
}
