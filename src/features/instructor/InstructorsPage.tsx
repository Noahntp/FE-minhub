import React from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { Link } from 'react-router-dom';
import { Search, Star, Users } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';

const INSTRUCTORS = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    title: "Senior Backend Engineer @ TechCorp",
    avatar: "https://i.pravatar.cc/150?u=1",
    rating: 4.9,
    students: "12,300+",
    courses: 8,
    tags: ["Node.js", "System Design", "AWS"]
  },
  {
    id: "2",
    name: "Trần Thị B",
    title: "Lead UI/UX Designer",
    avatar: "https://i.pravatar.cc/150?u=2",
    rating: 4.8,
    students: "8,400+",
    courses: 5,
    tags: ["Figma", "UI/UX", "Design System"]
  },
  {
    id: "3",
    name: "Lê Hoàng C",
    title: "Google Developer Expert",
    avatar: "https://i.pravatar.cc/150?u=3",
    rating: 5.0,
    students: "15,200+",
    courses: 12,
    tags: ["React", "Angular", "Web Perf"]
  }
];

export default function InstructorsPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-black font-suisseintl tracking-tight mb-2">Đội ngũ Giảng viên</h1>
            <p className="text-muted-foreground text-lg">Học từ những chuyên gia hàng đầu trong ngành công nghiệp.</p>
          </div>
          
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm giảng viên..."
              className="w-full bg-card shadow-sm appearance-none pl-9 rounded-lg border-border"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INSTRUCTORS.map((instructor) => (
            <Link key={instructor.id} to={`/instructors/${instructor.id}`} className="bg-card rounded-2xl border border-border p-6 hover:shadow-md transition-shadow group flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <img src={instructor.avatar} alt={instructor.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{instructor.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{instructor.title}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm font-medium text-slate-600 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {instructor.rating}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {instructor.students} học viên
                </div>
                <div>
                  {instructor.courses} khóa học
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-auto">
                {instructor.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
