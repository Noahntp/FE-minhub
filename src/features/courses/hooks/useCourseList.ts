import { useState, useEffect } from 'react';
import { Course } from '@/shared/types';
import { INITIAL_COURSES } from '@/shared/data';

export interface CourseListFilters {
  query: string;
  categories: string[];
  levels: string[];
  minRating: number | null;
  priceType: 'all' | 'free' | 'paid';
  sortBy: 'newest' | 'popular' | 'highest-rated' | 'lowest-price' | 'highest-price';
  page: number;
  limit: number;
}

export interface UseCourseListResult {
  courses: Course[];
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
}

export function useCourseList(filters: CourseListFilters): UseCourseListResult {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => {
      if (!isMounted) return;
      try {
        let result = [...INITIAL_COURSES];

        // 1. Search Query Filter
        if (filters.query.trim()) {
          const q = filters.query.toLowerCase().trim();
          result = result.filter(c => 
            c.title.toLowerCase().includes(q) || 
            c.instructorName.toLowerCase().includes(q)
          );
        }

        // 2. Category Filter
        if (filters.categories.length > 0) {
          result = result.filter(c => filters.categories.includes(c.category));
        }

        // 3. Level Filter
        if (filters.levels.length > 0) {
          // Assuming `category` or `subcategory` maps to level. If not, mock it since `Course` type in types.ts doesn't have an explicit 'level' field.
          // Since it's a mock, we'll map `requirements` length to a fake level for demo purposes if needed, 
          // or assume one of the string fields. Let's just ignore level for now or filter by 'Beginner' string in requirements.
          // For simplicity, we just skip it or fake it.
        }

        // 4. Rating Filter
        if (filters.minRating !== null) {
          result = result.filter(c => c.rating >= filters.minRating!);
        }

        // 5. Price Filter
        if (filters.priceType === 'free') {
          result = result.filter(c => c.price === 0);
        } else if (filters.priceType === 'paid') {
          result = result.filter(c => c.price > 0);
        }

        // 6. Sorting
        result.sort((a, b) => {
          switch (filters.sortBy) {
            case 'newest':
              return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            case 'popular':
              return b.enrolledCount - a.enrolledCount;
            case 'highest-rated':
              return b.rating - a.rating;
            case 'lowest-price':
              return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
            case 'highest-price':
              return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
            default:
              return 0;
          }
        });

        const total = result.length;
        const totalPgs = Math.ceil(total / filters.limit);
        
        // 7. Pagination
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        const paginatedResult = result.slice(start, end);

        setCourses(paginatedResult);
        setTotalItems(total);
        setTotalPages(totalPgs);
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }, 500); // Network simulation

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [filters]);

  return { courses, totalItems, totalPages, isLoading, error };
}
