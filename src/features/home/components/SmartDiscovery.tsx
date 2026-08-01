import React from "react";
import { CourseCard, CourseData } from "../../courses/components/CourseCard";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function SmartDiscovery({ courses }: { courses: CourseData[] }) {
  if (!courses || courses.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6 mt-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-bold tracking-tight">Vì bạn đang học React...</h2>
        </div>
        <Link to="/courses?sort=recommended" className="text-sm font-bold text-primary hover:underline flex items-center">
          Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {courses.slice(0, 3).map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
