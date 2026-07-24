import React from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { CourseCard } from '@/features/courses/components/CourseCard';
import { Heart, Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { EmptyState } from '@/shared/components/ui/EmptyState';

const FAVORITE_COURSES = [
  {
    id: "1",
    title: "System Design for Beginners",
    instructor: "Nguyễn Văn A",
    price: 0,
    originalPrice: 499000,
    rating: 4.8,
    reviews: 1200,
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80",
    tags: ["Backend", "Architecture"],
    level: "Beginner"
  },
  {
    id: "2",
    title: "Advanced React Patterns",
    instructor: "Trần Thị B",
    price: 299000,
    originalPrice: 599000,
    rating: 4.9,
    reviews: 850,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80",
    tags: ["Frontend", "React"],
    level: "Advanced"
  }
];

export default function FavoritesPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <h1 className="text-3xl font-black font-suisseintl tracking-tight">Khóa học yêu thích</h1>
            </div>
            <p className="text-muted-foreground">Bạn đã lưu {FAVORITE_COURSES.length} khóa học vào danh sách mong muốn.</p>
          </div>
          
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm trong danh sách..."
              className="w-full bg-card shadow-sm appearance-none pl-9 rounded-lg border-border"
            />
          </div>
        </div>

        {FAVORITE_COURSES.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {FAVORITE_COURSES.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="Danh sách trống"
            description="Bạn chưa lưu khóa học nào. Hãy khám phá và lưu lại những khóa học bạn quan tâm nhé."
            actionLabel="Khám phá khóa học"
            actionHref="/courses"
          />
        )}
      </div>
    </PageTransition>
  );
}
