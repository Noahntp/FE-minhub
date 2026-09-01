import { useState, useEffect } from 'react';
import { Course } from '@/shared/types';
import { INITIAL_COURSES } from '@/shared/data';
import { apiFetch } from '@/shared/lib/api-client';

interface UseCourseDetailResult {
  course: Course | null;
  isLoading: boolean;
  error: Error | null;
}

// Fallback map for custom slug-based course IDs from Homepage & Catalog
export const FALLBACK_COURSES_MAP: Record<string, Partial<Course>> = {
  'laravel-rest-api-tu-co-ban-den-trien-khai': {
    id: 'laravel-rest-api-tu-co-ban-den-trien-khai',
    title: 'Laravel REST API từ cơ bản đến triển khai',
    subtitle: 'Khóa học dành cho người mới bắt đầu, giúp bạn nắm vững kiến thức nền tảng Laravel REST API từ cơ bản đến thực hành, dễ hiểu, dễ áp dụng.',
    description: '<p>Laravel là PHP Framework số 1 hiện nay với cú pháp thanh lịch và khả năng mở rộng mạnh mẽ. Khóa học này hướng dẫn bạn từng bước thiết kế RESTful API chuẩn quốc tế, tích hợp JWT Authentication, Eloquent ORM và triển khai lên Server thực tế.</p>',
    category: 'Development',
    subcategory: 'Backend',
    instructorId: 'inst-1',
    instructorName: 'Nguyễn Văn A',
    instructorTitle: 'Senior Backend Architect tại MindHub',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    instructorBio: 'Giảng viên với 10 năm kinh nghiệm phát triển phần mềm PHP/Laravel cho hàng chục tập đoàn công nghệ lớn.',
    price: 499000,
    salePrice: 299000,
    rating: 4.8,
    reviewCount: 1234,
    enrolledCount: 12400,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    willLearn: [
      'Hiểu và thiết kế kiến thức RESTful API chuẩn quốc tế',
      'Xử lý Authentication & Authorization bảo mật với JWT / Sanctum',
      'Làm việc với Eloquent ORM, Migration, Seeder và Relationships',
      'Xây dựng dự án Backend thực tế và tối ưu hiệu năng Query SQL',
      'Tự tin viết API tích hợp với các ứng dụng Frontend React/Vue/Mobile',
      'Triển khai ứng dụng Laravel REST API lên môi trường Production VPS/Docker'
    ],
    status: 'active',
  },
  'php-mysql-backend': {
    id: 'php-mysql-backend',
    title: 'PHP & MySQL nền tảng cho Backend',
    subtitle: 'Nắm vững tư duy lập trình web server với PHP thuần và cơ sở dữ liệu MySQL.',
    description: '<p>Trang bị nền tảng cực kỳ vững chắc về PHP 8 và MySQL cho bất kỳ lập trình viên Backend nào.</p>',
    category: 'Development',
    subcategory: 'Backend',
    instructorId: 'inst-2',
    instructorName: 'Trần Minh Đức',
    instructorTitle: 'Senior PHP Specialist',
    instructorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
    price: 399000,
    rating: 4.6,
    reviewCount: 980,
    enrolledCount: 8900,
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    status: 'active',
  },
  'react-frontend-elearning': {
    id: 'react-frontend-elearning',
    title: 'React Frontend cho trang E-learning',
    subtitle: 'Xây dựng giao diện ứng dụng E-learning hiện đại với React, TypeScript và Tailwind CSS.',
    description: '<p>Khóa học thực chiến giúp bạn làm chủ React 18, React Router v6, Redux Toolkit và Tailwind CSS.</p>',
    category: 'Development',
    subcategory: 'Frontend',
    instructorId: 'inst-3',
    instructorName: 'Lê Hoàng Nam',
    instructorTitle: 'Lead Frontend Engineer',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    price: 449000,
    rating: 4.7,
    reviewCount: 860,
    enrolledCount: 7600,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    status: 'active',
  },
};

// Map Backend API response to Course type
function mapApiDetailToCourse(res: any): Course {
  const rawPrice = Number(res.price || 0);
  const rawSalePrice = res.sale_price !== null && res.sale_price !== undefined ? Number(res.sale_price) : undefined;
  const finalPrice = rawSalePrice !== undefined && rawSalePrice < rawPrice ? rawSalePrice : rawPrice;
  const originalPrice = rawSalePrice !== undefined && rawSalePrice < rawPrice ? rawPrice : undefined;

  const mappedChapters = Array.isArray(res.sections)
    ? res.sections.map((sec: any, sIdx: number) => ({
        id: String(sec.id || `ch-${sIdx + 1}`),
        title: sec.title || `Chương ${sIdx + 1}`,
        lessons: Array.isArray(sec.lessons)
          ? sec.lessons.map((les: any, lIdx: number) => ({
              id: les.id && !isNaN(Number(les.id)) ? Number(les.id) : String(les.id || `l-${sIdx + 1}-${lIdx + 1}`),
              title: les.title || `Bài ${lIdx + 1}`,
              type: les.type || 'video',
              duration: les.duration ? `${Math.floor(les.duration / 60)}:${les.duration % 60}` : '10:00',
              isPreview: Boolean(les.is_free_preview || les.isPreview),
              videoUrl: les.stream_url || les.streamUrl || les.video_url || les.videoUrl || (import.meta.env.DEV ? 'https://www.w3schools.com/html/mov_bbb.mp4' : ''),
            }))
          : [],
      }))
    : [];

  return {
    id: String(res.id || res.slug),
    slug: res.slug || String(res.id),
    title: res.title || 'Khóa học chưa có tên',
    subtitle: res.short_description || 'Khóa học chất lượng cao từ giảng viên MindHub.',
    description: res.description || `<p>${res.short_description || 'Khóa học cung cấp đầy đủ kiến thức thực chiến.'}</p>`,
    category: res.category?.name || 'Development',
    subcategory: res.subcategory?.name || 'General',
    instructorId: String(res.instructor?.id || 'inst-1'),
    instructorName: res.instructor?.full_name || 'Giảng viên MindHub',
    instructorTitle: res.instructor?.expertise || 'Senior Instructor tại MindHub',
    instructorAvatar: res.instructor?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    instructorBio: res.instructor?.bio || 'Chuyên gia giảng dạy với nhiều năm kinh nghiệm thực chiến.',
    price: finalPrice,
    salePrice: originalPrice ? finalPrice : undefined,
    originalPrice: originalPrice,
    rating: Number(res.average_rating || 5.0),
    reviewCount: Number(res.reviews_count || 120),
    enrolledCount: Number(res.enrollments_count || 1250),
    completionRate: 90,
    isFeatured: Boolean(res.is_featured),
    isBestseller: true,
    isNew: Boolean(res.is_new),
    image: res.thumbnail_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    requirements: Array.isArray(res.requirements) ? res.requirements : ['Máy tính có kết nối Internet', 'Đam mê lập trình và học tập'],
    willLearn: Array.isArray(res.outcomes) ? res.outcomes : [
      'Nắm vững kiến thức nền tảng và tư duy công nghệ',
      'Thực hành làm dự án thực tế để tự tin xin việc',
      'Tự tin áp dụng kiến thức vào các sản phẩm thực tế'
    ],
    status: 'active',
    chapters: mappedChapters.length > 0 ? mappedChapters : [
      {
        id: 'ch1',
        title: 'Chương 1: Giới thiệu và thiết lập môi trường',
        lessons: [
          { id: '1', title: '1.1 Tổng quan về khóa học', type: 'video', duration: '08:30', isPreview: true },
          { id: '2', title: '1.2 Cài đặt phần mềm cần thiết', type: 'video', duration: '12:15', isPreview: true }
        ]
      },
      {
        id: 'ch2',
        title: 'Chương 2: Kiến thức cốt lõi & Thực hành',
        lessons: [
          { id: '3', title: '2.1 Các khái niệm quan trọng', type: 'video', duration: '15:45', isPreview: false },
          { id: '4', title: '2.2 Viết đoạn chương trình đầu tiên', type: 'video', duration: '20:10', isPreview: false }
        ]
      }
    ]
  };
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

    async function loadCourse() {
      try {
        // 1. Primary: Fetch from Backend API /api/courses/{slug_or_id}
        const apiRes = await apiFetch<any>(`/courses/${courseId}`);
        if (isMounted && apiRes && (apiRes.id || apiRes.title)) {
          setCourse(mapApiDetailToCourse(apiRes));
          setIsLoading(false);
          return;
        }
      } catch (apiErr) {
        console.warn(`API lookup failed for courseId=${courseId}, trying local fallback`, apiErr);
      }

      // 2. Local Fallback by ID match in INITIAL_COURSES
      let foundCourse = INITIAL_COURSES.find(c => c.id === courseId || c.slug === courseId);

      // 3. Fallback map check
      if (!foundCourse && FALLBACK_COURSES_MAP[courseId]) {
        const fallback = FALLBACK_COURSES_MAP[courseId];
        foundCourse = {
          id: courseId,
          slug: fallback.slug || courseId,
          title: fallback.title || 'Khóa học lập trình thực chiến',
          subtitle: fallback.subtitle || 'Khóa học giúp bạn làm chủ kiến thức từ cơ bản đến ứng dụng nâng cao.',
          description: fallback.description || '<p>Nội dung khóa học được biên soạn chi tiết bám sát nhu cầu thực tế của doanh nghiệp.</p>',
          category: fallback.category || 'Development',
          subcategory: fallback.subcategory || 'General',
          instructorId: fallback.instructorId || 'inst-1',
          instructorName: fallback.instructorName || 'Nguyễn Văn A',
          instructorTitle: fallback.instructorTitle || 'Giảng viên MindHub',
          instructorAvatar: fallback.instructorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
          instructorBio: fallback.instructorBio || 'Hơn 8 năm kinh nghiệm giảng dạy và phát triển ứng dụng.',
          price: fallback.price || 499000,
          salePrice: fallback.salePrice || 299000,
          rating: fallback.rating || 4.8,
          reviewCount: fallback.reviewCount || 1234,
          enrolledCount: fallback.enrolledCount || 12400,
          completionRate: 85,
          isFeatured: true,
          isBestseller: true,
          isNew: false,
          image: fallback.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
          requirements: ['Máy tính có kết nối Internet', 'Đam mê học tập và thực hành'],
          willLearn: fallback.willLearn || [
            'Nắm vững kiến thức nền tảng từ cơ bản đến nâng cao',
            'Thực hành làm dự án thực tế để ghi vào CV',
            'Tự tin ứng tuyển công việc lập trình viên'
          ],
          status: 'active',
          chapters: fallback.chapters && fallback.chapters.length > 0 ? fallback.chapters : [
            {
              id: 'ch1',
              title: 'Chương 1: Giới thiệu và thiết lập môi trường',
              lessons: [
                { id: '1', title: '1.1 Tổng quan về khóa học', type: 'video', duration: '08:30', isPreview: true },
                { id: '2', title: '1.2 Cài đặt phần mềm cần thiết', type: 'video', duration: '12:15', isPreview: true }
              ]
            }
          ]
        };
      }

      // 4. If not found, throw error instead of dynamic fallback
      if (!foundCourse) {
        if (isMounted) {
          setError(new Error('Course not found'));
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setCourse(foundCourse as Course);
        setIsLoading(false);
      }
    }

    loadCourse();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  return { course, isLoading, error };
}
