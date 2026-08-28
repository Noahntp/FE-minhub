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
          // Sample mock course catalog matching the MindHub design screenshot (for fallback)
          const mockFeaturedCourses: HomeCourseItem[] = [
            {
              id: 'laravel-rest-api-tu-co-ban-den-trien-khai',
              title: 'Laravel REST API từ cơ bản đến triển khai',
              level: 'Cơ bản',
              thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
              rating: 4.8,
              reviewCount: 120,
              studentCount: '1.2K',
              rawStudentCount: 1200,
              completedStudentCount: 1020,
              completionRate: 85,
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
              rawStudentCount: 980,
              completedStudentCount: 764,
              completionRate: 78,
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
              rawStudentCount: 860,
              completedStudentCount: 791,
              completionRate: 92,
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
              rawStudentCount: 1100,
              completedStudentCount: 968,
              completionRate: 88,
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
              rawStudentCount: 2300,
              completedStudentCount: 2185,
              completionRate: 95,
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
              publishedAt: 'Ra mắt 2 ngày',
              versionTag: 'Next.js 15 & React 19',
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
              publishedAt: 'Ra mắt 5 ngày',
              versionTag: 'Docker 2026 Edition',
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
              publishedAt: 'Ra mắt 1 tuần',
              versionTag: 'NestJS 10 Enterprise',
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
              publishedAt: 'Ra mắt 1 tuần',
              versionTag: 'Spring Boot 3.3',
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
              publishedAt: 'Ra mắt 3 ngày',
              versionTag: 'Python 3.12 AI Stack',
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

          const mockFeaturedCategories = [
            { id: 1, name: 'Lập trình Backend', slug: 'backend-development', icon: 'Server', courses_count: 24, description: 'Laravel, Node.js, Go, Microservices' },
            { id: 2, name: 'Lập trình Frontend', slug: 'frontend-development', icon: 'Layout', courses_count: 32, description: 'React 19, Next.js 15, TypeScript' },
            { id: 3, name: 'Trí tuệ nhân tạo & AI', slug: 'ai-data-science', icon: 'Bot', courses_count: 18, description: 'LLMs, AI Assistant, Python ML' },
            { id: 4, name: 'DevOps & Cloud', slug: 'devops-cloud', icon: 'Cloud', courses_count: 15, description: 'Docker, Kubernetes, CI/CD, AWS' },
            { id: 5, name: 'Thiết kế UI/UX', slug: 'ui-ux-design', icon: 'Figma', courses_count: 20, description: 'Figma, Design System, UX Research' },
            { id: 6, name: 'Lập trình Di động', slug: 'mobile-development', icon: 'Smartphone', courses_count: 16, description: 'Flutter, React Native, iOS, Android' },
          ];

          const mockTopInstructors = [
            {
              id: 1,
              full_name: 'TS. Lê Quốc Khánh',
              name: 'TS. Lê Quốc Khánh',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
              avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
              expertise: 'React 19, Next.js 15, Cloud Architecture',
              bio: 'Tiến sĩ Khoa học Máy tính, cựu Tech Lead tại các tập đoàn công nghệ lớn. Hơn 10 năm kinh nghiệm kiến trúc hệ thống.',
              total_students: 18500,
              courses_count: 8,
              average_rating: 4.9,
            },
            {
              id: 2,
              full_name: 'Trần Minh Anh',
              name: 'Trần Minh Anh',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
              avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
              expertise: 'Frontend Mastery, UI/UX, TypeScript, Performance',
              bio: 'Principal Frontend Engineer & UI Specialist với nhiều năm kinh nghiệm tối ưu trải nghiệm người dùng.',
              total_students: 12800,
              courses_count: 6,
              average_rating: 4.8,
            },
            {
              id: 3,
              full_name: 'Đỗ Thành Long',
              name: 'Đỗ Thành Long',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
              avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80',
              expertise: 'DevOps, Docker, Kubernetes, CI/CD, AWS Cloud',
              bio: 'Cloud Architect với các chứng chỉ quốc tế AWS Solutions Architect Pro & CKA Kubernetes Administrator.',
              total_students: 15200,
              courses_count: 7,
              average_rating: 4.9,
            },
            {
              id: 4,
              full_name: 'Phạm Quỳnh Anh',
              name: 'Phạm Quỳnh Anh',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
              avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
              expertise: 'AI Assistant, LangChain, LLMs, Python Data Science',
              bio: 'AI Researcher & Data Scientist chuyên sâu về ứng dụng mô hình ngôn ngữ lớn vào sản phẩm thực tế.',
              total_students: 14100,
              courses_count: 5,
              average_rating: 4.9,
            },
          ];

          const mockTestimonials = [
            {
              id: 1,
              rating: 5,
              comment: 'Khóa học React 19 và Next.js 15 của thầy Khánh thực sự làm thay đổi tư duy lập trình của mình. Mình đã tự tin ứng tuyển vị trí Frontend Developer và nhận offer ngay sau khi kết thúc khóa!',
              user_name: 'Nguyễn Tuấn Anh',
              user_role: 'Frontend Developer @ VNG',
              user_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
            },
            {
              id: 2,
              rating: 5,
              comment: 'Nội dung khóa Laravel REST API rất thực chiến và chuẩn enterprise. Giảng viên hỗ trợ nhiệt tình, code mẫu sạch đẹp và có sẵn template triển khai Docker thực tế.',
              user_name: 'Trần Thu Hà',
              user_role: 'Backend Engineer @ Shopee',
              user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
            },
            {
              id: 3,
              rating: 5,
              comment: 'Khóa học AI và LLMs rất cuốn hút! Từ một người chưa biết gì về Vector Database hay RAG, giờ mình đã có thể tự xây dựng AI Chatbot phục vụ cho dự án của công ty.',
              user_name: 'Lê Minh Quang',
              user_role: 'AI Engineer Fresher',
              user_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
            },
          ];

          const mockVouchers = [
            {
              id: 1,
              code: 'MINDHUB50',
              name: 'Siêu Ưu Đãi Khai Xuân 50%',
              description: 'Giảm trực tiếp 50% cho tất cả khóa học công nghệ mới.',
              discount_type: 'percentage',
              discount_value: 50,
            },
            {
              id: 2,
              code: 'DEVPRO30',
              name: 'Ưu Đãi Lập Trình Viên Pro 30%',
              description: 'Giảm 30% khi đăng ký các khóa học nâng cao.',
              discount_type: 'percentage',
              discount_value: 30,
            },
            {
              id: 3,
              code: 'CHUYENGIA',
              name: 'Voucher Chuyên Gia 20%',
              description: 'Giảm 20% cho các khóa học cùng Giảng viên tiêu biểu.',
              discount_type: 'percentage',
              discount_value: 20,
            },
            {
              id: 4,
              code: 'NEWSTUDENT',
              name: 'Chào Đón Tân Học Viên 100K',
              description: 'Giảm ngay 100.000đ cho đơn hàng đầu tiên.',
              discount_type: 'fixed',
              discount_value: 100000,
            },
          ];

          const mockStats = {
            total_courses: 48,
            total_students: 18500,
            total_instructors: 35,
            total_reviews: 4200,
          };

          const apiFeatured = Array.isArray(res?.featured_courses) && res.featured_courses.length > 0
            ? res.featured_courses.map(mapApiCourseToHomeCourseItem)
            : mockFeaturedCourses;

          const apiNew = Array.isArray(res?.latest_courses) && res.latest_courses.length > 0
            ? res.latest_courses.map((c: any) => ({ ...mapApiCourseToHomeCourseItem(c), isNew: true, hasCertificate: true }))
            : mockNewCourses;

          const apiDiscounted = Array.isArray(res?.discounted_courses) && res.discounted_courses.length > 0
            ? res.discounted_courses.map((c: any) => ({ ...mapApiCourseToHomeCourseItem(c), isHot: true }))
            : mockDiscountedCourses;

          setData({
            featuredCategories: Array.isArray(res?.categories) && res.categories.length > 0 ? res.categories : mockFeaturedCategories,
            featuredCourses: apiFeatured,
            newCourses: apiNew,
            discountedCourses: apiDiscounted,
            topInstructors: Array.isArray(res?.featured_instructors) && res.featured_instructors.length > 0 ? res.featured_instructors : mockTopInstructors,
            faqs: Array.isArray(res?.faqs) && res.faqs.length > 0 ? res.faqs : [],
            testimonials: Array.isArray(res?.testimonials) && res.testimonials.length > 0 ? res.testimonials : mockTestimonials,
            vouchers: Array.isArray(res?.vouchers) && res.vouchers.length > 0 ? res.vouchers : mockVouchers,
            stats: res?.stats || mockStats,
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
