import React from "react";
import { CourseCard, CourseData } from "../../courses/components/CourseCard";
import { Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function NewCourses({ courses }: { courses: CourseData[] }) {
  if (!courses || courses.length === 0) return null;
  
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Rocket className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Vừa ra mắt</h2>
        </div>
        <Link to="/courses?sort=newest" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center group">
          Khám phá <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
