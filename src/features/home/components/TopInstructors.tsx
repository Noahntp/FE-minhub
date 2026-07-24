import React from "react";
import { Users, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const INSTRUCTORS = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    title: "Senior Backend Engineer @ TechCorp",
    avatar: "https://i.pravatar.cc/150?u=a",
    students: "12,300+",
    courses: 5,
    rating: 4.9
  },
  {
    id: "2",
    name: "Trần Thị B",
    title: "UX Researcher & Designer",
    avatar: "https://i.pravatar.cc/150?u=b",
    students: "8,400+",
    courses: 3,
    rating: 4.8
  },
  {
    id: "3",
    name: "Lê Văn C",
    title: "Fullstack Developer",
    avatar: "https://i.pravatar.cc/150?u=c",
    students: "15,200+",
    courses: 8,
    rating: 5.0
  },
  {
    id: "4",
    name: "Phạm D",
    title: "Cloud Architect",
    avatar: "https://i.pravatar.cc/150?u=d",
    students: "5,100+",
    courses: 2,
    rating: 4.7
  }
];

export function TopInstructors() {
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Giảng viên tiêu biểu</h2>
        </div>
        <Link to="/instructors" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center group">
          Tất cả <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {INSTRUCTORS.map(instructor => (
          <Link 
            key={instructor.id} 
            to={`/instructors/${instructor.id}`}
            className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-border/50 hover:shadow-md transition-all group"
          >
            <img 
              src={instructor.avatar} 
              alt={instructor.name}
              className="w-20 h-20 rounded-full object-cover mb-4 ring-4 ring-muted group-hover:ring-primary/20 transition-all"
            />
            <h3 className="font-bold text-base group-hover:text-primary transition-colors">{instructor.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-3 line-clamp-1">{instructor.title}</p>
            
            <div className="flex items-center gap-4 text-xs font-medium text-stone-600">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {instructor.students}
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                {instructor.rating}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
