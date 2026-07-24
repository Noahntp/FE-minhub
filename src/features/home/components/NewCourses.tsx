import React from "react";
import { CourseCard, CourseData } from "../../courses/components/CourseCard";
import { Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const NEW_COURSES: CourseData[] = [
  {
    id: "11",
    title: "AI Prompt Engineering Masterclass",
    instructor: "Lê Văn C",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    duration: "5 giờ",
    difficulty: "Beginner",
    status: "not_enrolled"
  },
  {
    id: "12",
    title: "Rust for Web Developers",
    instructor: "Phạm D",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    duration: "15 giờ",
    difficulty: "Intermediate",
    status: "not_enrolled"
  },
  {
    id: "13",
    title: "Thiết kế System Architecture",
    instructor: "Nguyễn Văn A",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    duration: "30 giờ",
    difficulty: "Advanced",
    status: "not_enrolled"
  }
];

export function NewCourses() {
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {NEW_COURSES.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
