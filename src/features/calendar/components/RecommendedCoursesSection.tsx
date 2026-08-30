import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ApiService as api } from '@/services/api';
import { CourseCard } from '@/features/courses/components/CourseCard';
import { Course } from '@/shared/types';

export function RecommendedCoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchRecommendations = async () => {
      try {
        const res = await api.getRuleBasedRecommendations();
        if (mounted && Array.isArray(res)) {
          setCourses(res);
        }
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchRecommendations();
    return () => { mounted = false; };
  }, []);

  if (isLoading || courses.length === 0) return null;

  return (
    <div className="mt-10 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gợi ý dành riêng cho bạn</h2>
          <p className="text-sm text-slate-500">Các khóa học phù hợp với trình độ và lộ trình của bạn</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const mappedCourse = {
            id: String(course.id),
            title: course.title,
            instructor: (course as any).instructor?.name || 'MindHub',
            thumbnail: (course as any).thumbnail || '/placeholder-course.jpg',
            duration: (course as any).duration || '0 giờ',
            difficulty: (course as any).level || 'Beginner'
          };
          return <CourseCard key={course.id} course={mappedCourse as any} />
        })}
      </div>
    </div>
  );
}
