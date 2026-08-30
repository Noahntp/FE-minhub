import { useState, useEffect } from 'react';
import { homeApi } from '@/features/home/api';
import { HomeCourseItem } from '../components/HomeCourseCard';
import { resolveMediaUrl } from '@/shared/utils/format';

export interface HomepageData {
  featuredCategories: any[];
  featuredCourses: HomeCourseItem[];
  newCourses: HomeCourseItem[];
  discountedCourses: HomeCourseItem[];
  topInstructors: any[];
  faqs?: any[];
  testimonials?: any[];
  vouchers?: any[];
  stats?: any;
}

function formatStudentCount(count: number): string {
  if (!count) return '0';
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace('.0', '') + 'K';
  }
  return String(count);
}

function mapLevel(level?: string): 'Cơ bản' | 'Trung cấp' | 'Nâng cao' | 'Mọi trình độ' {
  if (!level) return 'Mọi trình độ';
  const l = level.toLowerCase();
  if (l.includes('begin') || l.includes('co_ban') || l.includes('cơ bản')) return 'Cơ bản';
  if (l.includes('interm') || l.includes('trung_cap') || l.includes('trung cấp')) return 'Trung cấp';
  if (l.includes('advance') || l.includes('nang_cao') || l.includes('nâng cao')) return 'Nâng cao';
  return 'Mọi trình độ';
}

function formatPublishedAt(dateStr?: string): string {
  if (!dateStr) return 'Vừa ra mắt';
  try {
    const pubDate = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - pubDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Vừa ra mắt';
    if (diffDays === 1) return 'Ra mắt 1 ngày';
    if (diffDays < 7) return `Ra mắt ${diffDays} ngày`;
    if (diffDays < 30) return `Ra mắt ${Math.floor(diffDays / 7)} tuần`;
    return `Ra mắt ${pubDate.toLocaleDateString('vi-VN')}`;
  } catch {
    return 'Vừa ra mắt';
  }
}

export function mapApiCourseToHomeCourseItem(c: any): HomeCourseItem {
  const price = c.sale_price !== null && c.sale_price !== undefined ? Number(c.sale_price) : Number(c.price || 0);
  const originalPrice = c.sale_price !== null && c.sale_price !== undefined && Number(c.sale_price) < Number(c.price) ? Number(c.price) : undefined;
  
  let discountBadge: string | undefined = undefined;
  if (originalPrice && originalPrice > price && price > 0) {
    const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
    if (pct > 0) {
      discountBadge = `-${pct}%`;
    }
  }

  const rawEnrollments = Number(c.enrollments_count || 0);
  const completedEnrollments = Number(c.completed_enrollments_count || 0);
  const avgProgress = Number(c.average_progress_percent || 0);

  let completionRate: number | undefined = undefined;
  if (c.completion_rate !== undefined && c.completion_rate !== null) {
    completionRate = Number(c.completion_rate);
  } else if (rawEnrollments > 0 && completedEnrollments > 0) {
    completionRate = Math.round((completedEnrollments / rawEnrollments) * 100);
  } else if (avgProgress > 0) {
    completionRate = Math.round(avgProgress);
  }

  return {
    id: String(c.id || c.slug),
    realId: typeof c.id === 'number' ? c.id : (!isNaN(Number(c.id)) ? Number(c.id) : undefined),
    title: c.title || 'Khóa học chưa có tên',
    level: mapLevel(c.level),
    thumbnail: resolveMediaUrl(c.thumbnail_url || c.thumbnail) || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    rating: Number(c.average_rating || 5.0),
    reviewCount: Number(c.reviews_count || 0),
    studentCount: formatStudentCount(rawEnrollments),
    rawStudentCount: rawEnrollments,
    completedStudentCount: completedEnrollments > 0 ? completedEnrollments : undefined,
    completionRate,
    averageProgress: avgProgress > 0 ? avgProgress : undefined,
    publishedAt: c.published_at ? formatPublishedAt(c.published_at) : undefined,
    versionTag: 'Giáo trình 2026',
    instructorName: c.instructor?.full_name || 'Giảng viên MindHub',
    instructorAvatar: resolveMediaUrl(c.instructor?.avatar_url || c.instructor?.avatar) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    price,
    originalPrice,
    discountBadge,
    isFree: price === 0,
    isHot: Boolean(c.is_featured),
  };
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
        let res: any = null;
        try {
          res = await homeApi.getHomepageData();
        } catch (e) {
          // Fallback if backend API is not responding
          res = null;
        }

        if (isMounted) {
          const apiFeatured = Array.isArray(res?.featured_courses)
            ? res.featured_courses.map(mapApiCourseToHomeCourseItem)
            : [];

          const apiNew = Array.isArray(res?.latest_courses)
            ? res.latest_courses.map((c: any) => ({ ...mapApiCourseToHomeCourseItem(c), isNew: true, hasCertificate: true }))
            : [];

          const apiDiscounted = Array.isArray(res?.discounted_courses)
            ? res.discounted_courses.map((c: any) => ({ ...mapApiCourseToHomeCourseItem(c), isHot: true }))
            : [];

          setData({
            featuredCategories: Array.isArray(res?.categories) ? res.categories : [],
            featuredCourses: apiFeatured,
            newCourses: apiNew,
            discountedCourses: apiDiscounted,
            topInstructors: Array.isArray(res?.featured_instructors) ? res.featured_instructors : [],
            faqs: Array.isArray(res?.faqs) ? res.faqs : [],
            testimonials: Array.isArray(res?.testimonials) ? res.testimonials : [],
            vouchers: Array.isArray(res?.vouchers) ? res.vouchers : [],
            stats: res?.stats || {
                total_courses: 0,
                total_students: 0,
                total_instructors: 0,
                total_reviews: 0,
            },
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
