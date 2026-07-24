import React from "react";
import { CourseCard, CourseData } from "../../courses/components/CourseCard";
import { Flame, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const TRENDING_COURSES: CourseData[] = [
  {
    id: "7",
    title: "AWS Certified Solutions Architect",
    instructor: "Nguyễn Văn A",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    duration: "40 giờ",
    difficulty: "Intermediate",
    status: "not_enrolled"
  },
  {
    id: "8",
    title: "Mastering TypeScript 2024",
    instructor: "Trần Thị B",
    thumbnail: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&q=80",
    duration: "12 giờ",
    difficulty: "Advanced",
    status: "not_enrolled"
  },
  {
    id: "9",
    title: "Node.js Microservices",
    instructor: "Lê Văn C",
    thumbnail: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80",
    duration: "18 giờ",
    difficulty: "Intermediate",
    status: "not_enrolled"
  },
  {
    id: "10",
    title: "Docker & Kubernetes Thực chiến",
    instructor: "Phạm D",
    thumbnail: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80",
    duration: "25 giờ",
    difficulty: "Advanced",
    status: "not_enrolled"
  }
];

export function TrendingCourses() {
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
        {TRENDING_COURSES.map(course => (
          <div key={course.id} className="min-w-[280px] md:min-w-[320px] max-w-[350px] snap-start shrink-0">
            <CourseCard course={course} />
          </div>
        ))}
      </div>
    </div>
  );
}
