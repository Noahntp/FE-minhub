import { useState, useEffect } from 'react';
import { homeApi } from '@/features/home/api';
import { CourseData } from '@/features/courses/components/CourseCard';

export interface HomepageData {
  featuredCategories: any[];
  trendingCourses: CourseData[];
  newCourses: CourseData[];
  recommendedCourses: CourseData[];
  topInstructors: any[];
}

export function useHomepageData() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const res = await homeApi.getHomepageData();
        
        if (isMounted) {
          // Map backend course data to frontend CourseData UI format
          const mapCourse = (c: any): CourseData => ({
            id: String(c.id),
            title: c.title,
            instructor: c.instructor?.full_name || 'Giảng viên MindHub',
            thumbnail: c.thumbnail_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
            duration: c.total_duration_seconds ? `${Math.round(c.total_duration_seconds / 3600)} giờ` : '10 giờ',
            difficulty: c.level === 'advanced' ? 'Advanced' : c.level === 'intermediate' ? 'Intermediate' : 'Beginner',
            status: c.is_enrolled ? 'enrolled' : 'not_enrolled'
          });

          setData({
            featuredCategories: res.featured_categories || [],
            trendingCourses: (res.featured_courses || []).map(mapCourse),
            newCourses: (res.latest_courses || []).map(mapCourse),
            // For SmartDiscovery (recommended), just use a mix or featured
            recommendedCourses: (res.latest_courses || []).map(mapCourse).reverse(),
            topInstructors: res.featured_instructors || [],
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading, error };
}
