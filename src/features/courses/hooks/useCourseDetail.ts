import { useState, useEffect } from 'react';
import { Course } from '@/shared/types';
import { INITIAL_COURSES } from '@/shared/data';

interface UseCourseDetailResult {
  course: Course | null;
  isLoading: boolean;
  error: Error | null;
}

export function useCourseDetail(courseId: string | undefined): UseCourseDetailResult {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    if (!courseId) {
      setIsLoading(false);
      setError(new Error('Course ID is missing'));
      return;
    }

    // Simulate API delay
    const timeoutId = setTimeout(() => {
      if (!isMounted) return;

      const foundCourse = INITIAL_COURSES.find(c => c.id === courseId);
      
      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        setError(new Error('Course not found'));
      }
      
      setIsLoading(false);
    }, 600); // 600ms network latency simulation

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [courseId]);

  return { course, isLoading, error };
}
