import React from "react";
import { CourseCard, CourseData } from "../../courses/components/CourseCard";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const RECOMMENDED_COURSES: CourseData[] = [
  {
    id: "3",
    title: "UI/UX Design cho Người mới bắt đầu",
    instructor: "Lê Văn C",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    duration: "8 giờ",
    difficulty: "Beginner",
    status: "not_enrolled"
  },
  {
    id: "4",
    title: "Next.js Fullstack Architecture",
    instructor: "Phạm D",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    duration: "20 giờ",
    difficulty: "Intermediate",
    status: "not_enrolled"
  },
  {
    id: "5",
    title: "Làm chủ Figma trong 7 ngày",
    instructor: "Lê Văn C",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    duration: "10 giờ",
    difficulty: "Beginner",
    status: "not_enrolled"
  },
  {
    id: "6",
    title: "MERN Stack - Xây dựng E-commerce",
    instructor: "Trần Thị B",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=800&q=80",
    duration: "25 giờ",
    difficulty: "Advanced",
    status: "not_enrolled"
  },
  {
    id: "6-1",
    title: "Zustand & Redux Toolkit Thực chiến",
    instructor: "Nguyễn Văn A",
    thumbnail: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&q=80",
    duration: "12 giờ",
    difficulty: "Intermediate",
    status: "not_enrolled"
  },
  {
    id: "6-2",
    title: "React Native: Viết App iOS & Android",
    instructor: "Phạm D",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
    duration: "40 giờ",
    difficulty: "Advanced",
    status: "not_enrolled"
  }
];

export function SmartDiscovery() {
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {RECOMMENDED_COURSES.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
