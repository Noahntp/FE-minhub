import { useState, useEffect } from 'react';
import { homeApi } from '@/features/home/api';
import { HomeCourseItem } from '../components/HomeCourseCard';

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

  return {
    id: String(c.id || c.slug),
    realId: typeof c.id === 'number' ? c.id : (!isNaN(Number(c.id)) ? Number(c.id) : undefined),
    title: c.title || 'Khóa học chưa có tên',
    level: mapLevel(c.level),
    thumbnail: c.thumbnail_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    rating: Number(c.average_rating || 5.0),
    reviewCount: Number(c.reviews_count || 0),
    studentCount: formatStudentCount(Number(c.enrollments_count || 0)),
    instructorName: c.instructor?.full_name || 'Giảng viên MindHub',
    instructorAvatar: c.instructor?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
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
          // Sample mock course catalog matching the MindHub design screenshot (for fallback)
          const mockFeaturedCourses: HomeCourseItem[] = [
            {
              id: 'laravel-rest-api',
              title: 'Laravel REST API từ cơ bản đến triển khai',
              level: 'Cơ bản',
              thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
              rating: 4.8,
              reviewCount: 120,
              studentCount: '1.2K',
              instructorName: 'Nguyễn Văn A',
              instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
              price: 299000,
              originalPrice: 499000,
              discountBadge: '-40%',
            },
            {
              id: 'php-mysql-backend',
              title: 'PHP & MySQL nền tảng cho Backend',
              level: 'Cơ bản',
              thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
              rating: 4.6,
              reviewCount: 98,
              studentCount: '980',
              instructorName: 'Trần Minh Đức',
              instructorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
              price: 399000,
            },
            {
              id: 'react-frontend-elearning',
              title: 'React Frontend cho trang E-learning',
              level: 'Trung cấp',
              thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
              rating: 4.7,
              reviewCount: 85,
              studentCount: '860',
              instructorName: 'Lê Hoàng Nam',
              instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
              price: 449000,
            },
            {
              id: 'ai-learning-assistant',
              title: 'AI ứng dụng cho học tập cá nhân hóa',
              level: 'Mọi trình độ',
              thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80',
              rating: 4.9,
              reviewCount: 110,
              studentCount: '1.1K',
              instructorName: 'Phạm Quỳnh Anh',
              instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
              price: 499000,
            },
            {
              id: 'git-github-project',
              title: 'Git & GitHub cho sinh viên làm đồ án',
              level: 'Cơ bản',
              thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80',
              rating: 4.9,
              reviewCount: 160,
              studentCount: '2.3K',
              instructorName: 'Đỗ Thành Long',
              instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
              price: 0,
              isFree: true,
            },
          ];

          const mockNewCourses: HomeCourseItem[] = [
            {
              id: 'nextjs14-mastery',
              title: 'Next.js 14 Fullstack App Router & Server Actions',
              level: 'Trung cấp',
              thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
              rating: 5.0,
              reviewCount: 42,
              studentCount: '450',
              instructorName: 'Nguyễn Văn A',
              instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
              price: 499000,
              originalPrice: 699000,
              discountBadge: '-28%',
              isNew: true,
            },
            {
              id: 'docker-k8s-devops',
              title: 'Docker & Kubernetes Thực Chiến Cho Developer',
              level: 'Nâng cao',
              thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
              rating: 4.9,
              reviewCount: 35,
              studentCount: '320',
              instructorName: 'Đỗ Thành Long',
              instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
              price: 599000,
              originalPrice: 899000,
              discountBadge: '-33%',
              isNew: true,
            },
            {
              id: 'nestjs-microservices',
              title: 'Node.js & NestJS Xây Dựng Hệ Thống Microservices',
              level: 'Nâng cao',
              thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
              rating: 4.8,
              reviewCount: 29,
              studentCount: '290',
              instructorName: 'Trần Minh Đức',
              instructorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
              price: 549000,
              isNew: true,
            },
            {
              id: 'spring-boot-3',
              title: 'Spring Boot 3 & Spring Security 6 Cho Project Thực Tế',
              level: 'Trung cấp',
              thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
              rating: 4.9,
              reviewCount: 51,
              studentCount: '520',
              instructorName: 'Lê Hoàng Nam',
              instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
              price: 499000,
              isNew: true,
            },
            {
              id: 'python-data-science',
              title: 'Python Data Analysis & AI Visualizations',
              level: 'Cơ bản',
              thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
              rating: 4.7,
              reviewCount: 68,
              studentCount: '710',
              instructorName: 'Phạm Quỳnh Anh',
              instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
              price: 349000,
              isNew: true,
            },
          ];

          const mockDiscountedCourses: HomeCourseItem[] = [
            {
              id: 'fullstack-web-sale',
              title: 'Fullstack Web Development với Node.js & React',
              level: 'Mọi trình độ',
              thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
              rating: 4.9,
              reviewCount: 210,
              studentCount: '2.8K',
              instructorName: 'Lê Hoàng Nam',
              instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
              price: 399000,
              originalPrice: 799000,
              discountBadge: '-50%',
              isHot: true,
            },
            {
              id: 'react-native-mobile-sale',
              title: 'Lập trình ứng dụng di động React Native từ A-Z',
              level: 'Trung cấp',
              thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
              rating: 4.8,
              reviewCount: 145,
              studentCount: '1.5K',
              instructorName: 'Trần Minh Đức',
              instructorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
              price: 349000,
              originalPrice: 699000,
              discountBadge: '-50%',
              isHot: true,
            },
            {
              id: 'laravel-advanced-sale',
              title: 'Laravel REST API từ cơ bản đến triển khai',
              level: 'Cơ bản',
              thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
              rating: 4.8,
              reviewCount: 120,
              studentCount: '1.2K',
              instructorName: 'Nguyễn Văn A',
              instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
              price: 299000,
              originalPrice: 499000,
              discountBadge: '-40%',
              isHot: true,
            },
            {
              id: 'devops-ci-cd-sale',
              title: 'Tự động hóa CI/CD pipeline với GitHub Actions & Docker',
              level: 'Nâng cao',
              thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80',
              rating: 4.8,
              reviewCount: 95,
              studentCount: '890',
              instructorName: 'Đỗ Thành Long',
              instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
              price: 399000,
              originalPrice: 650000,
              discountBadge: '-38%',
              isHot: true,
            },
            {
              id: 'ui-ux-design-sale',
              title: 'Thiết kế giao diện UI/UX chuyên nghiệp với Figma',
              level: 'Cơ bản',
              thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&q=80',
              rating: 4.9,
              reviewCount: 180,
              studentCount: '1.9K',
              instructorName: 'Phạm Quỳnh Anh',
              instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
              price: 279000,
              originalPrice: 450000,
              discountBadge: '-38%',
              isHot: true,
            },
          ];

          const apiFeatured = Array.isArray(res?.featured_courses) && res.featured_courses.length > 0
            ? res.featured_courses.map(mapApiCourseToHomeCourseItem)
            : mockFeaturedCourses;

          const apiNew = Array.isArray(res?.latest_courses) && res.latest_courses.length > 0
            ? res.latest_courses.map((c: any) => ({ ...mapApiCourseToHomeCourseItem(c), isNew: true }))
            : mockNewCourses;

          const apiDiscounted = Array.isArray(res?.discounted_courses) && res.discounted_courses.length > 0
            ? res.discounted_courses.map((c: any) => ({ ...mapApiCourseToHomeCourseItem(c), isHot: true }))
            : mockDiscountedCourses;

          setData({
            featuredCategories: Array.isArray(res?.categories) ? res.categories : [],
            featuredCourses: apiFeatured,
            newCourses: apiNew,
            discountedCourses: apiDiscounted,
            topInstructors: Array.isArray(res?.featured_instructors) ? res.featured_instructors : [],
            faqs: Array.isArray(res?.faqs) ? res.faqs : [],
            testimonials: Array.isArray(res?.testimonials) ? res.testimonials : [],
            vouchers: Array.isArray(res?.vouchers) ? res.vouchers : [],
            stats: res?.stats || null,
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
